create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null,
  plan text not null default 'free' check (plan in ('free', 'regular', 'pro')),
  created_at timestamptz not null default now()
);

create table public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan text not null check (plan in ('regular', 'pro')),
  amount_bob integer not null check (amount_bob in (599, 999)),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index payment_requests_user_created_idx
  on public.payment_requests (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.payment_requests enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.payment_requests from anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.payment_requests to authenticated;

create policy profiles_select_own_or_admin
  on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy profiles_update_admin
  on public.profiles for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy payment_requests_select_own_or_admin
  on public.payment_requests for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy payment_requests_insert_own_pending
  on public.payment_requests for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pending'
    and (
      (plan = 'regular' and amount_bob = 599)
      or (plan = 'pro' and amount_bob = 999)
    )
  );

create policy payment_requests_update_admin
  on public.payment_requests for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

revoke all on function public.create_profile_for_auth_user() from public, anon, authenticated;

create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute function public.create_profile_for_auth_user();

create function public.request_payment(requested_plan text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  request_id uuid;
  request_amount integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  request_amount := case requested_plan
    when 'regular' then 599
    when 'pro' then 999
    else null
  end;

  if request_amount is null then
    raise exception 'The selected plan is not available for payment.';
  end if;

  insert into public.payment_requests (user_id, plan, amount_bob)
  values (auth.uid(), requested_plan, request_amount)
  returning id into request_id;

  return request_id;
end;
$$;

create function public.approve_payment_request(p_request_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  selected_request public.payment_requests%rowtype;
begin
  if (select auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Administrator access is required.';
  end if;

  select *
    into selected_request
    from public.payment_requests
    where id = p_request_id
    for update;

  if not found then
    raise exception 'Payment request was not found.';
  end if;

  if selected_request.status <> 'pending' then
    raise exception 'Only pending payment requests can be approved.';
  end if;

  update public.payment_requests
    set status = 'approved', reviewed_at = now()
    where id = selected_request.id;

  update public.profiles
    set plan = selected_request.plan
    where id = selected_request.user_id;
end;
$$;

revoke all on function public.request_payment(text) from public, anon;
revoke all on function public.approve_payment_request(uuid) from public, anon;
grant execute on function public.request_payment(text) to authenticated;
grant execute on function public.approve_payment_request(uuid) to authenticated;
