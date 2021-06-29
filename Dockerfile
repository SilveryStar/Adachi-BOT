FROM silverystar/centos-puppeteer-env

COPY . /bot
WORKDIR /bot
RUN cnpm install
CMD [ "npm", "start" ]