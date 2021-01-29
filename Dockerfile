FROM node:lts-alpine3.12 as builder

RUN apk add --no-cache sudo curl build-base g++ libpng libpng-dev jpeg-dev pango-dev cairo-dev giflib-dev python

RUN apk --no-cache add ca-certificates wget  && \
    wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.32-r0/glibc-2.32-r0.apk && \
    apk add glibc-2.32-r0.apk

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install --registry=http://192.168.1.145/ install

FROM node:lts-alpine3.12 as app

RUN apk add --no-cache graphicsmagick

COPY . .
COPY --from=builder node_modules .

EXPOSE 8006/tcp
ENTRYPOINT node ocelotbot.js