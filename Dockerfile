FROM node:lts-alpine3.12

RUN apk add --no-cache graphicsmagick
COPY . .
RUN npm install --registry=http://192.168.1.145/ install

WORKDIR broker

EXPOSE 8006/tcp
ENTRYPOINT node ocelotbot.js