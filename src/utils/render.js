const fs = require('fs');

module.exports = render = async ( data, name, id, type ) => {
    const page = await browser.newPage();
    await fs.writeFile('./data/record/' + name + '.json', JSON.stringify(data), ()=>{});

    await page.goto('http://localhost:9934/src/views/' + name + '.html');
    const htmlElement = await page.$('body');
    const base64 = await htmlElement.screenshot({
        encoding: 'base64'
    });

    await page.close();
    await bot.sendMessage(id, "[CQ:image,file=base64://" + base64 + "]", type);
}