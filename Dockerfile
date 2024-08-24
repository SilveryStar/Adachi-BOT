FROM mirror.javas.dev/ghcr.io/silverystar/adachi-bot:main

COPY . /bot
WORKDIR /bot

RUN chmod +x docker-entrypoint.sh &&  \
    dos2unix docker-entrypoint.sh && \
    addgroup -S -g 1001 adachi &&  \
    adduser -S -G adachi -u 1001 adachi

ENTRYPOINT ["sh", "docker-entrypoint.sh"]

CMD sh -c "pnpm docker-start"