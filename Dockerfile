FROM alpine

ENV TZ=Asia/Shanghai \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    GOSU_VERSION=1.16

COPY public/fonts/wqy-microhei-regular.ttf /usr/share/fonts/win/wqy-microhei-regular.ttf

# Installs latest Chromium (100) package.
# Non-mainland China servers can remove this sed replace and npm config registry. example: RUN apk add --no-cache ...
RUN set -eux; \
        sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories; \
        apk add --no-cache --update \
              chromium \
              nss \
              freetype \
              harfbuzz \
              ca-certificates \
              git \
              nodejs \
              npm \
              tzdata \
              dos2unix \
              dumb-init; \
        cp /usr/share/zoneinfo/$TZ /etc/localtime; \
        echo $TZ > /etc/timezone; \
        npm config set registry https://registry.npmmirror.com; \
        npm i pnpm -g; \
        pnpm config set registry https://registry.npmmirror.com; \
        pnpm config set store-dir ~/.pnpm-store; \
        rm -rf /var/cache/apk/*; \
        addgroup -S -g 1000 adachi && adduser -S -G adachi -u 999 adachi; \
    	\
    	apk add --no-cache --update --virtual .gosu-deps \
    		ca-certificates \
    		dpkg \
    		gnupg \
    	; \
    	\
        update-ca-certificates; \
    	dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')"; \
    	wget -O /usr/local/bin/gosu "https://ghproxy.com/https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch"; \
    	wget -O /usr/local/bin/gosu.asc "https://ghproxy.com/https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch.asc"; \
    	\
    # verify the signature
    	export GNUPGHOME="$(mktemp -d)"; \
    	gpg --batch --keyserver hkps://keys.openpgp.org --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4; \
    	gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu; \
    	command -v gpgconf && gpgconf --kill all || :; \
    	rm -rf "$GNUPGHOME" /usr/local/bin/gosu.asc; \
    	\
    # clean up fetch dependencies
    	apk del --no-network .gosu-deps; \
    	\
    	chmod +x /usr/local/bin/gosu; \
    # verify that the binary works
    	gosu --version; \
    	gosu nobody true

COPY . /bot
WORKDIR /bot

RUN chmod +x docker-entrypoint.sh && dos2unix docker-entrypoint.sh

ENTRYPOINT ["sh", "docker-entrypoint.sh"]

CMD sh -c "pnpm install && pnpm docker-start"