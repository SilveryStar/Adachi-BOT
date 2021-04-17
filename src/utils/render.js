const puppeteer = require('puppeteer')
const fs = require('fs');

module.exports = render = async ( data, name, id ) => {
    puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
        .then(async browser => {
            const page = await browser.newPage();
            await fs.writeFile('./data/record/' + name + '.json', JSON.stringify(data), ()=>{});

            await page.goto('http://localhost:9934/src/views/' + name + '.html');
            const htmlElement = await page.$('body');
            const base64 = await htmlElement.screenshot({
                encoding: 'base64'
            });

            await browser.close();
            await bot.sendGroupMsg(id, "[CQ:image,file=base64://" + base64 + "]");
        });
}