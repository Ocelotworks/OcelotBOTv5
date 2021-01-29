FROM node:lts-alpine3.12 as builder

ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 make cairo g++ pkgconfig pixman-dev libpng pango freetype && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install --registry=http://192.168.1.145/ install

FROM node:lts-alpine3.12 as app

RUN apk add --no-cache graphicsmagick

COPY . .
COPY --from=builder node_modules .

EXPOSE 8006/tcp
ENTRYPOINT node ocelotbot.js