FROM silverystar/centos-puppeteer-env

RUN ln -snf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && yum install -y git

COPY . /bot
WORKDIR /bot
CMD nohup sh -c "cnpm install && npm run docker-start"