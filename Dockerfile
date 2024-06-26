ARG NODE_VERSION=20.7.0

FROM node:${NODE_VERSION}-alpine

RUN mkdir -p /home/node/app

RUN chmod -R 777 /home/node/app

WORKDIR /home/node/app

COPY . .

RUN npm ci

RUN apk add --no-cache git

RUN npm run proto

RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]
