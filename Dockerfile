ARG REGISTRY
ARG CI_COMMIT_BRANCH
FROM $REGISTRY/ocelotbotv5/ocelotbot-base:latest-$CI_COMMIT_BRANCH

ARG VERSION
ENV VERSION=$VERSION

COPY . .

#RUN rm -r consumers

RUN npm install googleapis cheerio redis --registry=http://192.168.1.145/

EXPOSE 8006/tcp
HEALTHCHECK --interval=30s --start-period=1m --retries=5 \
    CMD node healthcheck.js
ENTRYPOINT node ocelotbot.js