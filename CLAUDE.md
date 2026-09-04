# Convenciones del proyecto — backend-kw

API en NestJS + TypeORM + PostgreSQL. El módulo `src/users` es la referencia de patrón a seguir para cualquier módulo nuevo.

## Estructura de un módulo

Cada módulo sigue la forma del módulo `users`:
```
src/<modulo>/
  dto/            create-x.dto.ts, update-x.dto.ts, login.dto.ts (si aplica)
  entities/       x.entity.ts
  enums/          (si el módulo tiene valores fijos, ej. user-profile.enum.ts)
  guards/         (si el módulo necesita reglas de acceso propias)
  decorators/     (si el módulo necesita decoradores propios, ej. @Profiles)
  interfaces/     (tipos que no son DTO ni entidad, ej. jwt-payload)
  <modulo>.controller.ts
  <modulo>.service.ts
  <modulo>.module.ts
  <modulo>.controller.spec.ts / <modulo>.service.spec.ts
```

## Formato de respuesta

Los endpoints que crean/actualizan/eliminan devuelven:
```ts
{ success: true, data: safeObject }
// o
{ success: true, message: '...' }
```
Nunca devuelvas campos sensibles (ej. `password`) — sácalos del objeto antes de responder, como en `users.service.ts`.

Los errores se lanzan con las excepciones propias de Nest (`BadRequestException`, `NotFoundException`, `UnauthorizedException`, `InternalServerErrorException`), no con `try/catch` que devuelva objetos de error a mano.

## Validación

Todos los DTO usan `class-validator`. Sé explícito con las reglas (`@IsString`, `@IsNotEmpty`, `@MaxLength`, `@IsEmail`, `@IsEnum`, etc.) igual que en `create-user.dto.ts`. El `ValidationPipe` global tiene `whitelist: true` y `forbidNonWhitelisted: true`, así que cualquier campo que no esté en el DTO se rechaza — no agregues campos al body sin declararlos en el DTO.

## Permisos y perfiles

Perfiles definidos en `UserProfile`: `admin`, `marketing`, `seo`, `usuario`.

- `admin` tiene todos los permisos.
- `marketing`, `seo` y `usuario` **aún no tienen reglas definidas** — no asumas qué pueden o no hacer.
- **Regla por defecto:** cuando crees un endpoint nuevo y no se te indique explícitamente qué perfiles deben tener acceso, protégelo con `@UseGuards(ProfilesGuard)` + `@Profiles(UserProfile.ADMIN)` (igual que `findAll`, `findOne`, `update`, `remove` en `users.controller.ts`). Solo déjalo abierto (como `create` y `login`) si el flujo lo requiere explícitamente.
- **Excepción de autoservicio:** `GET/PATCH /users/me` usan `@UseGuards(ProfilesGuard)` SIN `@Profiles(...)` — cualquier usuario autenticado puede leer/editar su propio registro (vía `@CurrentUser()`), sin importar su perfil. No es una ruta abierta (sigue exigiendo JWT válido), solo no restringe por perfil. Estas rutas van declaradas ANTES de `GET/PATCH /users/:id` en el controller, porque si no Express intenta resolver `"me"` como si fuera el `:id`. `UpdateProfileDto` (el DTO de `PATCH /users/me`) deliberadamente no incluye `profile` ni `status` — el `ValidationPipe` global (`forbidNonWhitelisted`) rechaza cualquier intento de mandarlos, así un usuario no puede auto-promoverse. Cambiar la contraseña por esta vía exige `current_password`, verificada con bcrypt antes de aceptar la nueva (a diferencia del `update()` que usa un ADMIN sobre otro usuario, que no pide la contraseña actual).

## Módulo `blog` (split público/admin)

`src/blog` tiene dos controllers sobre el mismo `BlogService`, igual que `homepage`: `BlogController` (`@Controller('blog')`, sin guard) expone `GET /blog` (solo entradas con `status: PUBLISHED` y `published_at` ya vencido, paginado) y `GET /blog/:slug` (una entrada publicada por slug, 404 si no existe o no está publicada todavía); `AdminBlogController` (`@Controller('admin/blog')`, `ProfilesGuard` + `ADMIN`) tiene el CRUD completo (`create`/`findAll`/`findOne`/`update`/`remove`, estos tres últimos por `:id` numérico) y `POST admin/blog/images` (subida de la imagen destacada, mismo patrón de `multer` + `uploads/blog` que `admin/homepage/images`). Si agregas un endpoint nuevo a este módulo, decide primero si es de lectura pública (va en `BlogController`) o de gestión (va en `AdminBlogController`) — no mezcles ambos en un mismo controller como se hacía antes.

## Módulo `homepage` (excepción de forma)

`src/homepage` no sigue el patrón CRUD de `users`/`blog` — es un documento único (`homepage_settings`, una sola fila) con columnas `draft`/`published` tipo `jsonb` que guardan todo el árbol de secciones de la home (ver `HomepageDocument` en `entities/homepage-settings.entity.ts`). `GET /homepage` (público, sin guard) devuelve `published`; `GET/PATCH /admin/homepage` y `POST /admin/homepage/publish` (ADMIN) leen/escriben `draft` y lo publican. Los defaults de cada sección (`id`, `title`, etc.) viven hardcodeados en `homepage.service.ts` y se guardan una sola vez, la primera vez que se crea la fila — cambiarlos después no reescribe una fila que ya existe, hay que actualizarla vía `POST /admin/homepage/publish`. Si agregas una sección nueva a la home, actualiza el arreglo `defaults.sections` aquí Y el `sectionDefaults` equivalente en `frontend-kw` (`src/features/admin/homepage/section-defaults.ts`) — deben quedar alineados.

No repliques esta forma para un recurso nuevo que sí sea una lista de entidades (usa `users`/`blog` como referencia para eso); esta forma es específica para "un solo documento de configuración editable".

## Base de datos

Por ahora se usa `synchronize: true` en TypeORM (no hay migraciones todavía). Los cambios de esquema se reflejan solos al reiniciar el backend en desarrollo.

## Tests

No son obligatorios para toda tarea. Cuando sí se piden, van por feature: un `.spec.ts` junto al archivo que prueban (como `users.controller.spec.ts` / `users.service.spec.ts`), no en una carpeta de tests separada.

## Flujo de trabajo

- Los commits van directo a `main` (no hay ramas por tarea ni Pull Requests).
- No hay proceso de revisión de código ni CI configurado.
- Prefijos de commit:
  - `feat:` implementación nueva
  - `fix:` arreglo o corrección de algo existente
  - `remove:` eliminación de algo
