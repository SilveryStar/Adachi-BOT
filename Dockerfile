FROM alpine

ENV TZ=Asia/Shanghai

COPY public/fonts/wqy-microhei-regular.ttf /usr/share/fonts/win/wqy-microhei-regular.ttf
# Installs latest Chromium (100) package.
# Non-mainland China servers can remove this sed replace and npm config registry. example: RUN apk add --no-cache ...
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories && \
    apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    git \
    nodejs \
    npm \
    tzdata \
    dumb-init && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    npm config set registry https://registry.npmmirror.com && \
    rm -rf /var/cache/apk/*

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY . /bot
WORKDIR /bot
# Use process management tools to handle process signals to prevent processes in containers from becoming zombie processes.
ENTRYPOINT ["dumb-init", "--"]

CMD nohup sh -c "npm i && npm run docker-start"