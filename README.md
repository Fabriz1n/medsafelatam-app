# MedsafeLatam Academy

Aplicación Expo para preparación médica con cuentas de usuario, progreso local, solicitudes de pago y panel administrativo. Supabase proporciona autenticación y almacenamiento compartido de perfiles y solicitudes para clientes y administradores.

## Conectar Supabase

### 1. Aplicar el esquema de base de datos

En el proyecto de Supabase correcto, abre **SQL Editor** y ejecuta el contenido completo de estos archivos, **en este orden**:

1. [`supabase/migrations/202610120001_payment_approval.sql`](./supabase/migrations/202610120001_payment_approval.sql)
2. [`supabase/migrations/202610150001_admin_dashboard.sql`](./supabase/migrations/202610150001_admin_dashboard.sql)

La primera migración crea perfiles, solicitudes, políticas RLS y funciones de pago. La segunda agrega vencimientos de planes y tablas/funciones del panel. No ejecutes solo la segunda en un proyecto vacío.

Ejecuta cada migración una sola vez. Si ya aplicaste la primera, no la vuelvas a ejecutar; aplica únicamente la segunda si todavía no se ejecutó. Puedes confirmar el estado revisando las tablas `profiles`, `payment_requests` y `question_overrides` en **Table Editor**.

### 2. Conectar la app móvil y el panel al mismo proyecto

En PowerShell, desde la carpeta raíz del proyecto:

```powershell
if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
} else {
  Write-Output ".env ya existe; no se sobrescribe. Revisa o edita sus valores actuales."
}
```

En Supabase, abre **Project Settings > API** (o **Data API**) y copia la URL del proyecto y la clave pública `anon`/`publishable`. Colócalas en `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROJECT-REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=TU-CLAVE-PUBLICA-ANON-O-PUBLISHABLE
```

Ambos modos —clientes y administración— usan estas mismas dos variables. La clave `anon`/`publishable` está diseñada para el cliente y queda limitada por las políticas RLS de la base de datos.

**Nunca pongas `service_role` o una clave `secret` en `.env` de Expo, en el código móvil ni en el navegador.** Esas claves pueden omitir las políticas de seguridad y solo deben usarse en un servidor seguro.

Reinicia Expo para que lea las variables:

```powershell
npx expo start -c
```

Para abrir la app web local, presiona `w` en la terminal de Expo. La ruta del panel es `/admin`.

### 3. Crear la cuenta administrativa

Primero crea la cuenta desde la app (modo **Crear cuenta**) o desde **Supabase > Authentication > Users > Add user**. Si Supabase requiere confirmar correo, confirma la cuenta antes de iniciar sesión.

Después, en **SQL Editor**, asigna el rol `admin` a esa cuenta. Reemplaza el correo de ejemplo:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where lower(email) = lower('admin@tudominio.com')
returning id, email, raw_app_meta_data;
```

Comprueba que el resultado contiene `"role": "admin"` y que se actualizó exactamente una cuenta. Si no devuelve filas, verifica el correo y que la cuenta se creó en ese mismo proyecto.

Cierra cualquier sesión existente y vuelve a iniciar sesión para que Supabase emita un token con el rol actualizado. Desde la pantalla normal de acceso, iniciar sesión con esa cuenta administrativa lleva automáticamente al panel. Los clientes regulares continúan en la app de estudio. El acceso directo `/admin` también está disponible en web.

### 4. Probar el flujo completo

1. Registra un cliente con un correo distinto y confirma el correo si se solicita.
2. En **Planes**, crea una solicitud y envía el comprobante por WhatsApp.
3. Inicia sesión con la cuenta administrativa; revisa la solicitud en el panel y aprueba el pago.
4. Vuelve a iniciar sesión con el cliente y actualiza su cuenta/plan.

El QR es estático y **no verifica pagos**. WhatsApp no informa automáticamente a la aplicación que se recibió un comprobante. El administrador debe verificarlo y aprobar la solicitud manualmente; entonces la función `approve_payment_request` activa el plan por 30 días.

## Ejecutar y validar

```powershell
npm install
npx expo start
npx expo lint
npx tsc --noEmit
```

Generar la app web estática:

```powershell
npx expo export --platform web
```

Al desplegar en hosting, configura el fallback de rutas para que `/admin` sirva la aplicación web.

## Datos del cliente

Los perfiles y las solicitudes se guardan en Supabase para que el panel y los distintos dispositivos compartan esa información. El progreso de estudio se guarda localmente en el dispositivo y no se sincroniza entre dispositivos.
