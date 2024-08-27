ARG REGISTRY
ARG CI_COMMIT_BRANCH
FROM $REGISTRY/ocelotbot/OcelotBOTv5/ocelotbot-base:latest-$CI_COMMIT_BRANCH

ARG VERSION
ENV VERSION=$VERSION

COPY . .

#RUN rm -r consumers



EXPOSE 8006/tcp
HEALTHCHECK --interval=1m --start-period=5m --retries=5 \
    CMD node healthcheck.js
ENTRYPOINT node ocelotbot.js