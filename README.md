<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## Base de datos: migraciones

La API y la CLI comparten `src/database/database.options.ts`. Ambas leen
`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` y `DB_DATABASE` del entorno
(o del `.env` en la carpeta `backend-kw`). `synchronize` y `migrationsRun` están
 desactivados: arrancar la API no modifica el esquema. Ejecuta los comandos
siguientes desde `backend-kw` (en PowerShell puedes usar `pnpm.cmd`).

### Base nueva y vacía

Crea la base PostgreSQL y configura las variables anteriores. Después:

```bash
pnpm migration:run
pnpm start:dev
```

La migración `InitialSchema1789257600000` crea las cuatro tablas actuales,
sus enums, claves únicas y relaciones. TypeORM registra cada migración aplicada
en la tabla `migrations` y no vuelve a ejecutarla.

### Base existente creada por synchronize

Haz un respaldo antes de incorporar la base al historial. Primero comprueba
que el esquema coincide con las entidades y que SOLO está pendiente la migración inicial:

```bash
pnpm schema:check
pnpm migration:show
```

`schema:check` no aplica cambios: termina con código 0 si no hay diferencias,
y con código 1 si las detecta. Si hay diferencias, no continúes con `--fake`:
revisa y concilia el esquema en una copia de la base antes de registrar la inicial.

Si el esquema coincide y solo está pendiente `InitialSchema1789257600000`:

```bash
pnpm migration:run --fake
pnpm migration:show
```

`--fake` registra las migraciones pendientes sin ejecutar su SQL, conservando
las tablas y los datos actuales. No lo uses sobre una base vacía ni con otras
migraciones pendientes, porque también las marcaría como aplicadas.

### Cambios futuros

1. Aplica las migraciones pendientes en tu base de desarrollo.
2. Modifica las entidades.
3. Genera y revisa el SQL de la nueva migración:

```bash
pnpm migration:generate src/database/migrations/AddUserField
pnpm migration:run
pnpm schema:check
```

La generación compara las entidades contra la base configurada: usa una base
de desarrollo con el historial al día. Guarda el archivo generado junto al
cambio de entidad en el repositorio. No edites migraciones ya aplicadas; crea otra.
Para escribir una migración manual: `pnpm migration:create src/database/migrations/Nombre`.

### Producción y reversión

```bash
pnpm build
pnpm migration:show:prod
pnpm migration:run:prod
pnpm start:prod
```

Los comandos de producción usan el JavaScript compilado en `dist`, sin ts-node.
Ejecuta las migraciones una sola vez por despliegue, antes de iniciar las instancias.
El proceso necesita las mismas variables de conexión y permisos para modificar el esquema.

`pnpm migration:revert` (o `pnpm migration:revert:prod`) ejecuta el `down` de la
última migración. Revisa ese SQL antes: revertir la inicial elimina las cuatro
tablas y sus datos, incluso si se registró con `--fake`. Un rollback no sustituye
un respaldo.
