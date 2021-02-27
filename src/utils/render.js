const puppeteer = require('puppeteer')
const fs = require('fs');
const path = require('path');

module.exports = render = ( data, name, id ) => {
    puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
        .then(async browser => {
            const page = await browser.newPage();
            await fs.writeFile('./data/cache/' + name + '.json', JSON.stringify(data), ()=>{});

            await page.goto('http://localhost:9934/src/views/' + name + '.html');
            const htmlElement = await page.$('body');
            await htmlElement.screenshot({
                path: './data/cache/' + name + '.png'
            });

            await page.waitFor(600);
            await browser.close();
            await bot.sendGroupMsg(id, "[CQ:image,file=" + path.resolve(__dirname, '..', '..', 'data', 'cache', name + '.png') + "]").then();
        });
}