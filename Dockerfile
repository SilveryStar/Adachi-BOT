FROM silverystar/centos-puppeteer-env

ENV LANG en_US.utf8
RUN ln -snf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && yum install -y git && npm config set registry https://registry.npmmirror.com

COPY . /bot
WORKDIR /bot
RUN npm i puppeteer --unsafe-perm=true --allow-root
CMD nohup sh -c "npm i && npm run docker-start"