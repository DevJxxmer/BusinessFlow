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

La interfaz funciona con datos mock persistidos en `localStorage` durante el desarrollo. Esto permite probar el producto sin perder información al recargar, pero no reemplaza una base de datos para producción. El flujo público actual es: bienvenida, inicio de sesión local, crear cuenta local, selección de proyecto y aplicación interna.

La estructura inicial de Supabase está en `supabase/schema.sql` e incluye proyectos, miembros, productos, movimientos de inventario, finanzas y agenda. El cliente opcional está preparado en `src/lib/supabase.ts`.

## Preparación para producción

1. Crear un proyecto en Supabase.
2. Ejecutar `supabase/schema.sql` en el SQL Editor.
3. Copiar `.env.example` como `.env.local`.
4. Completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores del proyecto.
5. Reemplazar gradualmente la persistencia local por consultas Supabase y activar autenticación.

No incluir claves privadas ni el `service_role` en el frontend.

## Stack

React 19, TypeScript, Vite, Lucide React y CSS responsive. Los datos actuales son demostrativos y todavía no se guardan en una base de datos.

## Próximos pasos

1. Definir el modelo de datos y persistencia local.
2. Construir Finanzas con operaciones, categorías y filtros.
3. Añadir backend, autenticación y base de datos para producción.
