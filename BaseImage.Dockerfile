FROM node:16.6.1-alpine3.12


RUN apk add --no-cache ca-certificates wget graphicsmagick sudo curl build-base g++ libpng libpng-dev jpeg-dev pango-dev cairo cairo-dev giflib-dev python3 font-noto alpine-sdk

RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.32-r0/glibc-2.32-r0.apk && \
    apk add glibc-2.32-r0.apk

RUN rm glibc-2.32-r0.apk
RUN mkdir app
WORKDIR app


RUN mkdir temp

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci --force --registry=http://192.168.1.145/
RUN npm install googleapis archiver
