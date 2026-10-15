# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Supabase, pagos QR y administración

La app utiliza Supabase Auth para las cuentas y PostgreSQL para perfiles y solicitudes. Para conectar un proyecto:

1. Crea un proyecto en Supabase y ejecuta `supabase/migrations/202610120001_payment_approval.sql` desde el SQL Editor.
2. Copia `.env.example` a `.env` y configura `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` con los valores públicos de tu proyecto. No incluyas una clave `service_role` en la app ni en el portal.
3. Crea la cuenta del administrador con correo y contraseña. Desde el SQL Editor, asígnale el rol administrativo sustituyendo el correo:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
     || '{"role":"admin"}'::jsonb
   where email = 'admin@example.com';
   ```

   Cierra sesión y vuelve a ingresar para que se renueve el token con el rol. El panel web se encuentra en `/admin`; solo cuentas con `app_metadata.role = 'admin'` pueden consultar usuarios o aprobar solicitudes.
4. Ejecuta `npx expo start` para desarrollo o `npx expo export --platform web` para generar el portal y la app web. Al publicar el sitio, configura el hosting para servir la ruta `/admin` desde la salida estática.

El QR del Banco Ganadero es estático y no verifica transacciones. La app registra la solicitud con el monto del plan y abre WhatsApp para que el usuario adjunte el comprobante. El plan permanece bloqueado hasta que un administrador lo apruebe en `/admin`; al volver a Planes, el usuario puede actualizar el estado. La aprobación y la lectura de usuarios están protegidas por políticas RLS en la migración.

Las cuentas locales anteriores no se sincronizan con Supabase: los usuarios deben registrarse de nuevo con correo electrónico. El progreso de estudio sigue guardándose localmente en el dispositivo.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
