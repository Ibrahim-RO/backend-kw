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
