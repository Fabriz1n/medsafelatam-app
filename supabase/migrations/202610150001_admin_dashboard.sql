alter table public.profiles
  add column plan_expires_at timestamptz;

update public.profiles as profile
set plan_expires_at = coalesce(
  (
    select coalesce(payment.reviewed_at, payment.created_at)
    from public.payment_requests as payment
    where payment.user_id = profile.id
      and payment.status = 'approved'
    order by payment.reviewed_at desc nulls last, payment.created_at desc
    limit 1
  ),
  profile.created_at
) + interval '90 days'
where profile.plan <> 'pro' and profile.plan <> 'free';

create table public.question_overrides (
  question_id text primary key,
  specialty text not null,
  question_text text not null check (length(trim(question_text)) > 0),
  options text[] not null check (cardinality(options) >= 2),
  correct_index integer not null check (
    correct_index >= 0 and correct_index < cardinality(options)
  ),
  explanation text,
  updated_at timestamptz not null default now()
);

alter table public.question_overrides enable row level security;

revoke all on public.question_overrides from anon, authenticated;
grant select, insert, update on public.question_overrides to authenticated;

create policy question_overrides_select_authenticated
  on public.question_overrides for select to authenticated
  using ((select auth.uid()) is not null);

create policy question_overrides_insert_admin
  on public.question_overrides for insert to authenticated
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy question_overrides_update_admin
  on public.question_overrides for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.approve_payment_request(p_request_id uuid)
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
    set plan = selected_request.plan,
        plan_expires_at = greatest(coalesce(plan_expires_at, now()), now()) + interval '30 days'
    where id = selected_request.user_id;
end;
$$;

create or replace function public.admin_dashboard_metrics()
returns table (active_paid_students bigint, expired_students bigint)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Administrator access is required.';
  end if;

  return query
  select
    count(*) filter (
      where plan <> 'free' and plan_expires_at > now()
    ),
    count(*) filter (
      where plan <> 'free' and plan_expires_at <= now()
    )
  from public.profiles;
end;
$$;

revoke all on function public.admin_dashboard_metrics() from public, anon;
grant execute on function public.admin_dashboard_metrics() to authenticated;
