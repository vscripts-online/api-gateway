## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Sample .env

```js
PORT=3000

JWT_ACCESS_SECRET=JWT_ACCESS_SECRET
JWT_REFRESH_SECRET=JWT_REFRESH_SECRET

MONGO_HOST=127.0.0.1
MONGO_PORT=27017
MONGO_DATABASE=vscr-cdn

RABBITMQ_HOST=127.0.0.1
RABBITMQ_PORT=5672

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DATABASE=0

ADMIN_KEY=215acc4b10fbae7f7c11c9556eaba43e
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
