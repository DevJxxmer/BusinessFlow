# BusinessFlow

Panel local para gestionar un negocio o empresa. Esta primera etapa contiene el shell de producto y un dashboard financiero con datos mock locales.

## Módulos

- Resumen: saldo, ingresos, gastos, flujo de caja, actividad reciente y objetivo mensual.
- Finanzas, Inventario, Agenda y Configuración: vistas base listas para construir en siguientes etapas.

## Desarrollo local

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev
```

Vite mostrará la dirección local en la terminal. Para validar una compilación de producción:

```bash
npm run lint
npm run build
npm run preview
```

## Estado actual

La interfaz conserva un fallback mock persistido en `localStorage` para el modo demo. Con Supabase configurado y un proyecto seleccionado, Inventario, Finanzas y Agenda cargan y guardan datos reales por `project_id`. El flujo público actual es: bienvenida, inicio de sesión, crear cuenta, selección de negocio y aplicación interna.

La estructura inicial de Supabase está en `supabase/schema.sql` e incluye proyectos, miembros, productos, movimientos de inventario, finanzas y agenda. El cliente está preparado en `src/lib/supabase.ts` y el login/registro usan Supabase Auth cuando `.env.local` está configurado. El acceso de demostración sigue disponible para trabajar sin una cuenta real.

## Preparación para producción

1. Crear un proyecto en Supabase.
2. Ejecutar `supabase/schema.sql` en el SQL Editor.
3. Copiar `.env.example` como `.env.local`.
4. Completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores del proyecto.
5. Probar crear una cuenta desde la interfaz y confirmar el correo si Supabase lo solicita.
6. Reemplazar gradualmente la persistencia local por consultas Supabase y conectar proyectos y datos al usuario autenticado.

No incluir claves privadas ni el `service_role` en el frontend.

## Stack

React 19, TypeScript, Vite, Lucide React y CSS responsive. Los datos actuales son demostrativos y todavía no se guardan en una base de datos.

## Próximos pasos

1. Definir el modelo de datos y persistencia local.
2. Construir Finanzas con operaciones, categorías y filtros.
3. Añadir backend, autenticación y base de datos para producción.

## Validación para producción

Para dejar el proyecto listo para producción realiza estos pasos:

- Crear un proyecto en Supabase y ejecutar `supabase/schema.sql` en el editor SQL.
- Copiar `.env.example` a `.env.local` y configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- Verificar la autenticación de usuarios, selección de negocio, carga de productos e inventarios.
- Probar el flujo de migración de datos locales a Supabase desde la pantalla de Configuración.
- Ejecutar `npm run lint`, `npm run build` y `npm run test`.

## Pruebas

Se añadió un conjunto básico de pruebas con Vitest y Testing Library para validar la interfaz principal.

- `npm test` — ejecuta pruebas en modo de solo ejecución.
- `npm run test:watch` — ejecuta pruebas en modo observador durante el desarrollo.

## Integración continua

Se agregó un flujo de CI para GitHub Actions que valida:

- `npm ci`
- `npm run lint`
- `npm run build`
- `npm run test`

## Recomendaciones de Supabase para producción

- Configurar SMTP en Supabase para enviar confirmación/recuperación de contraseña.
- Activar backups automáticos de la base de datos.
- Revisar las políticas de RLS y permisos de `public.is_project_member` y `public.is_project_admin`.
- No exponer claves de servicio (`service_role`) en el frontend.
- Mantener el proyecto separado por `project_id` y usar relaciones seguras.

## Despliegue en Vercel

El proyecto incluye `vercel.json` y un workflow de GitHub Actions para desplegar automáticamente en Vercel cuando se hace push a `main` o `master`.

Requisitos en Vercel:

- Crear un proyecto Vercel apuntando al repositorio.
- Configurar el framework como `Vite` o `Static` con la carpeta de salida `dist`.
- Agregar estos secretos en el repositorio de GitHub:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

Variables de entorno necesarias para el frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

> No subir `.env.local` al repositorio. El archivo `.env.example` solo sirve de plantilla.
