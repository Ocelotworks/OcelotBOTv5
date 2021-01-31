FROM node:lts-alpine3.12

RUN apk add --no-cache graphicsmagick sudo curl build-base g++ libpng libpng-dev jpeg-dev pango-dev cairo cairo-dev giflib-dev python3

RUN apk --no-cache add ca-certificates wget  && \
    wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.32-r0/glibc-2.32-r0.apk && \
    apk add glibc-2.32-r0.apk

RUN rm glibc-2.32-r0.apk
RUN mkdir app
WORKDIR app

COPY . .

RUN npm install --registry=http://192.168.1.145/ install

EXPOSE 8006/tcp
HEALTHCHECK --interval=30s \
    CMD node healthcheck.js
ENTRYPOINT node ocelotbot.js