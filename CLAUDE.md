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

Solo hay dos perfiles en `UserProfile`: `admin` y `marketing`. `admin` tiene acceso a **todo** el panel, sin excepción — nunca se le restringe por módulo. `marketing` solo tiene acceso a los módulos que traiga en su columna `modules` (`User.modules`, `text[]`, ver `ModuleKey` en `src/users/enums/module-key.enum.ts`: hoy solo `homepage` y `blog`, más los 3 sub-permisos `homepage:*` de abajo — no agregues módulos "por si acaso" sin una pantalla real detrás, ya se quitaron `seo`/`marketing` como módulos sueltos por eso mismo). `usuarios` (el CRUD de usuarios) **nunca** es un módulo asignable — es exclusivo de `admin`, protegido solo con `@Profiles(UserProfile.ADMIN)`, igual que antes.

- **Endpoint de un módulo existente (ej. blog, homepage):** en el controller admin del módulo, usa `@Profiles(UserProfile.ADMIN, UserProfile.MARKETING)` + `@RequireModule(ModuleKey.<MODULO>)` (decorador en `src/users/decorators/modules.decorator.ts`) a nivel de clase. `ProfilesGuard` (`src/users/guards/profiles.guard.ts`) revisa primero `@Profiles` (perfil correcto) y luego, si hay `@RequireModule` Y el usuario no es `admin`, exige que `user.modules` incluya ese módulo — `admin` nunca pasa por esta segunda revisión. Ver `AdminBlogController`/`AdminHomepageController` como referencia.
- **Endpoint exclusivo de admin (ej. usuarios):** `@UseGuards(ProfilesGuard)` + `@Profiles(UserProfile.ADMIN)`, sin `@RequireModule` — igual que `findAll`, `findOne`, `update`, `remove` en `users.controller.ts`. Esta sigue siendo la regla por defecto para cualquier endpoint nuevo que no se te indique explícitamente que debe compartirse con `marketing`. Solo déjalo abierto (como `create` y `login`) si el flujo lo requiere explícitamente.
- `CreateUserDto`/`UpdateUserDto` traen `modules?: ModuleKey[]`, validado con `@IsEnum(ModuleKey, { each: true })`. `UsersService` normaliza esto: si el perfil que queda es `admin`, `modules` se fuerza a `[]` (aunque el body mande algo, se ignora); si es `marketing`, se guarda el arreglo que venga (o se deja el que ya tenía, en un `update` que no manda `modules`).
- Si agregas un módulo nuevo al panel (con pantalla ya construida — no antes), agrégalo a `ModuleKey` aquí Y a `moduleOptions`/`ModuleKey` en `frontend-kw` (`src/features/admin/users/schemas/user.schema.ts` y `types.ts`) — deben quedar alineados, igual que los defaults de homepage.
- **Sub-permisos dentro de un módulo (ej. las 3 pestañas de Homepage):** no necesitan una columna nueva — se guardan en el mismo `modules` como valores con namespace, ej. `homepage:sections`, `homepage:seo`, `homepage:code` (agregados a `ModuleKey`), y solo tienen efecto si el usuario también trae el módulo padre (`homepage`). El `@RequireModule` del controller sigue siendo el del módulo padre — el filtrado fino se hace a mano dentro del service. Ver `HomepageService.mergeAllowed`: como `PATCH /admin/homepage` siempre manda el documento completo (no un diff), un `marketing` sin `homepage:seo` que mande `seo` modificado NO causa error — su cambio a esa parte simplemente se ignora y se conserva el valor que ya estaba guardado, tanto si viene del editor como de una llamada directa al endpoint. Este patrón (conservar en vez de rechazar) es el que hay que replicar si otro módulo con documento único gana sub-pestañas.
- **Excepción de autoservicio:** `GET/PATCH /users/me` usan `@UseGuards(ProfilesGuard)` SIN `@Profiles(...)` — cualquier usuario autenticado puede leer/editar su propio registro (vía `@CurrentUser()`), sin importar su perfil. No es una ruta abierta (sigue exigiendo JWT válido), solo no restringe por perfil. Estas rutas van declaradas ANTES de `GET/PATCH /users/:id` en el controller, porque si no Express intenta resolver `"me"` como si fuera el `:id`. `UpdateProfileDto` (el DTO de `PATCH /users/me`) deliberadamente no incluye `profile` ni `status` — el `ValidationPipe` global (`forbidNonWhitelisted`) rechaza cualquier intento de mandarlos, así un usuario no puede auto-promoverse. Cambiar la contraseña por esta vía exige `current_password`, verificada con bcrypt antes de aceptar la nueva (a diferencia del `update()` que usa un ADMIN sobre otro usuario, que no pide la contraseña actual).

## Módulo `blog` (split público/admin)

`src/blog` tiene dos controllers sobre el mismo `BlogService`, igual que `homepage`: `BlogController` (`@Controller('blog')`, sin guard) expone `GET /blog` (solo entradas con `status: PUBLISHED` y `published_at` ya vencido, paginado) y `GET /blog/:slug` (una entrada publicada por slug, 404 si no existe o no está publicada todavía); `AdminBlogController` (`@Controller('admin/blog')`, `ProfilesGuard` + `@Profiles(ADMIN, MARKETING)` + `@RequireModule(ModuleKey.BLOG)`, ver sección "Permisos y perfiles") tiene el CRUD completo (`create`/`findAll`/`findOne`/`update`/`remove`, estos tres últimos por `:id` numérico) y `POST admin/blog/images` (subida de la imagen destacada, mismo patrón de `multer` + `uploads/blog` que `admin/homepage/images`). Si agregas un endpoint nuevo a este módulo, decide primero si es de lectura pública (va en `BlogController`) o de gestión (va en `AdminBlogController`) — no mezcles ambos en un mismo controller como se hacía antes.

`status` (`BlogStatus`: `borrador`/`publicado`/`eliminado`) se puede mandar tanto en `create` como en `update` — `CreateBlogDto` lo valida con `@IsIn([DRAFT, PUBLISHED])` (una entrada no puede "nacer" eliminada, ese estado solo lo pone `remove()`), mientras que `UpdateBlogDto` lo valida con `@IsEnum(BlogStatus)` completo (override explícito de la property, no se combina con el `@IsIn` del padre — se probó en vivo mandando `status: 'eliminado'` por `PATCH` y sí lo acepta). Esto es lo que usa el switch de Publicar/Borrador del admin (`BlogForm.tsx`) para publicar directo desde la creación, sin tener que crear y luego editar.

## Módulo `homepage` (excepción de forma)

`src/homepage` no sigue el patrón CRUD de `users`/`blog` — es un documento único (`homepage_settings`, una sola fila) con columnas `draft`/`published` tipo `jsonb` que guardan todo el árbol de secciones de la home (ver `HomepageDocument` en `entities/homepage-settings.entity.ts`). `GET /homepage` (público, sin guard) devuelve `published`; `GET/PATCH /admin/homepage` y `POST /admin/homepage/publish` (`ADMIN`/`MARKETING` con módulo `homepage`, ver "Permisos y perfiles") leen/escriben `draft` y lo publican. Los defaults de cada sección (`id`, `title`, etc.) viven hardcodeados en `homepage.service.ts` y se guardan una sola vez, la primera vez que se crea la fila — cambiarlos después no reescribe una fila que ya existe, hay que actualizarla vía `POST /admin/homepage/publish`. Si agregas una sección nueva a la home, actualiza el arreglo `defaults.sections` aquí Y el `sectionDefaults` equivalente en `frontend-kw` (`src/features/admin/homepage/section-defaults.ts`) — deben quedar alineados.

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
