## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Sample .env

```js
PORT=3000

JWT_SECRET=JWT_SECRET

MONGO_URI=mongodb://mongo1,mongo2,mongo3/vscr-cdn

RABBITMQ_HOST=rabbitmq
RABBITMQ_USER=rabbitmq_username
RABBITMQ_PASS=rabbitmq_password
RABBITMQ_PORT=5672

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_USER=redis_username
REDIS_PASS=redis_password
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

## generateEncodedVerifyCode

This function creates an encoded query for forgotten_password, which includes the specified code and user_id for the user. It does this like this:

Let's assume that user_id is `65c4efa0b3da8a1d8773f87d` (mongo ObjectID) and code is 123456.

First it gets the time using the first 8 characters of user_id: `1707405216`, then it adds the code on top: `1707528672` and converts it back to hex string: `65c6d1e0`. Replaces this value with the first 8 digits of user_id, new value: `65c6d1e0b3da8a1d8773f87d`

User_id and code information was stored in this new value. All that needs to be done is to email this value to the user, but when sending this value to the user, it should be checked whether it is actually sent by this authority by adding a signature. Since the data to be sent to the user is desired to be short, a seed is created using the xxhash32 algorithm and a signature is created with this seed.

seed created: `13694774`
created signature: `1944969124`

Finally, `65c6d1e0b3da8a1d8773f87d` and the hex string of the signature (`73eddfa4`) are combined and converted to base64url (`ZcbR4LPaih2Hc_h9c-3fpA`) and the 36 radix base value of the code is added to the end of the resulting value (`2n9c`).

result: `ZcbR4LPaih2Hc_h9c-3fpA2n9c`

## Referances

Adding multiple swagger example responses with one status code -> [source](https://github.com/nestjs/swagger/issues/225#issuecomment-1741826782)

Using 'applyDecorator' function to reduce swagger documentation code crowd -> [source](https://aalonso.dev/blog/how-to-generate-generics-dtos-with-nestjsswagger-422g)

Redis stack authentication [source](https://stackoverflow.com/a/76482901)
