## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Sample .env

```js
PORT=3000

SESSION_MS_URI=host.docker.internal:20000
QUEUE_MS_URI=host.docker.internal:20001
USER_MS_URI=host.docker.internal:20002
FILE_MS_URI=host.docker.internal:20003

HMAC_SECRET=strong secret
JWT_SECRET=strong secret
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

## API Documents

Swagger Documentation can be found at /api route after servfer starts up.

## Configure Google Cloud Platform

[Follow instructions to step seven](https://blog.tericcabrel.com/upload-file-to-google-drive-with-nodejs/)

## classToSwaggerJson

It takes class as a parameter and creates a serializable object according to the example value in that @ApiProperty decorator.

```ts
class AccountSyncSizeResponseDTO {
  @ApiProperty({ example: 16106127360 })
  storage_size: number;

  @ApiProperty({ example: 16106127360 })
  available_size: number;
}
```

To

```ts
{ storage_size: 16106127360, available_size: 16106127360 }
```

## Actions taken in case of forgot_password request

When the user requests forgot_password, a 6-digit code consisting only of numbers is generated. It records the code creation time and the sent code in the user data in the database.

If more than 3 forgot_password requests are sent within 24 hours, too many request exceptions will be thrown.

If the code is created a second time within 1 minute, it returns true without doing anything. This means that the e-mail has been sent, but since it was already sent 1 minute ago, it does not send it again and does not make any changes to the user data.

If the last e-mail sending was done within 1 minute to 5 minutes, it saves the time of code creation in the user data and sends the code again without changing the code.

## Ubuntu server configuration

Since ufw blocks docker communication, containers cannot communicate with each other. That's why [ufw-docker](https://github.com/chaifeng/ufw-docker) should be used.

Update the relevant file [here](https://github.com/chaifeng/ufw-docker?tab=readme-ov-file#solving-ufw-and-docker-issues).

You do not need to do the `ufw route allow proto tcp from any to any port 80` part.

Get the id of the `cdn_cdn` network with the `docker network ls` command.

Get the subnet used by the network with the `docker inspect [id]` command. example: 172.24.0.0/16

Run `ufw allow from 172.24.0.0/16`

Ufw will now allow docker communication.

## Referances

Adding multiple swagger example responses with one status code -> [source](https://github.com/nestjs/swagger/issues/225#issuecomment-1741826782)

Using 'applyDecorator' function to reduce swagger documentation code crowd -> [source](https://aalonso.dev/blog/how-to-generate-generics-dtos-with-nestjsswagger-422g)

Redis stack authentication [source](https://stackoverflow.com/a/76482901)

Allow ufw docker network [source](https://superuser.com/a/1709175)
