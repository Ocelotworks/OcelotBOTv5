ARG REGISTRY
ARG CI_COMMIT_BRANCH
FROM $REGISTRY/ocelotbotv5/ocelotbot-base:latest

ARG VERSION
ENV VERSION=$VERSION

COPY . .

RUN rm -r consumers

EXPOSE 8006/tcp
HEALTHCHECK --interval=30s --start-period=1m --retries=5 \
    CMD node healthcheck.js
ENTRYPOINT node ocelotbot.js