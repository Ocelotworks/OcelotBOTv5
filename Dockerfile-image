FROM node:lts-alpine3.12

RUN apk add --no-cache graphicsmagick
# We don't need everything for this one
RUN npm install --registry=http://192.168.1.145/ config amqplib gm @natualatlas/paranoid-request twemoji-parser axios gifuct-js canvas

WORKDIR consumers

ENTRYPOINT node image.js