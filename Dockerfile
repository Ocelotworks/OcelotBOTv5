FROM node:lts-alpine3.12

RUN apk add --no-cache graphicsmagick
COPY . .
RUN npm install --registry=http://npm.int.unacc.eu/ install

WORKDIR broker

EXPOSE 8006/tcp
ENTRYPOINT node broker.js