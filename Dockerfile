ARG REGISTRY
ARG CI_COMMIT_BRANCH
FROM $REGISTRY/ocelotbotv5/ocelotbot-base:latest-$CI_COMMIT_BRANCH

ARG VERSION
ENV VERSION=$VERSION

COPY . .

EXPOSE 8006/tcp
HEALTHCHECK --interval=30s --start-period=1m --retries=5 \
    CMD node healthcheck.js
ENTRYPOINT node ocelotbot.js