const puppeteer = require('puppeteer')
const fs = require('fs');
const path = require('path');
const { get } = require('../../utils/database');

module.exports = renderCard = (mhyID, groupID) => {
    puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
        .then(async browser => {
            const page = await browser.newPage();
            await page.setViewport({
                width: 934,
                height: 5000
            });
            await fs.writeFile('./data/cache/card.json', JSON.stringify(get('info', 'user', {mhyID})), ()=>{});

            await page.goto('http://localhost:9934/src/views/genshin-card.html');
            const htmlElement = await page.$('body');
            await htmlElement.screenshot({
               path: './data/cache/resultInfoCard.png'
            });

            await page.waitFor(600);
            await browser.close();
            await bot.sendGroupMsg(groupID, "[CQ:image,file=" + path.resolve(__dirname, '..', '..', '..', 'data', 'cache', 'resultInfoCard.png') + "]").then();
        });
}