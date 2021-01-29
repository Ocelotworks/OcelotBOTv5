FROM node:lts-alpine3.12

ENV PYTHONUNBUFFERED=1
RUN apk add --no-cache graphicsmagick
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

COPY . .
RUN npm install --registry=http://192.168.1.145/ install

WORKDIR broker

EXPOSE 8006/tcp
ENTRYPOINT node ocelotbot.js