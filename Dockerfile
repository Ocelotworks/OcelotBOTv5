FROM node:lts-alpine3.12

RUN apk add --no-cache graphicsmagick
# We don't need everything for this one
RUN npm install --registry=http://npm.int.unacc.eu/ install

WORKDIR broker

EXPOSE 8006/tcp
ENTRYPOINT node broker.js
HEALTHCHECK --interval=5m --timeout=3s \
    CMD curl -f http://localhost:8006/shard