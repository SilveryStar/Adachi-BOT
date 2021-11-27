FROM silverystar/centos-puppeteer-env

RUN ln -snf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

COPY . /bot
WORKDIR /bot
RUN cnpm install
CMD [ "npm", "start" ]