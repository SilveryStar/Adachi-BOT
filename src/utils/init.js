const { newDB } = require('./database');
const { newServer } = require('./server');
const { gachaUpdate } = require('./update')
const schedule = require('node-schedule');
const puppeteer = require('puppeteer')

const databaseInitialize = () => {
    newDB('map');
    newDB('time');
    newDB('info');
    newDB('artifact');
    newDB('character');
    newDB('authority');
    newDB('gacha', { user: [], data: [] });
};

module.exports = async () => {
    newServer(9934);
    databaseInitialize();
    gachaUpdate();

    schedule.scheduleJob('0 31 11 * * *', () => {
        gachaUpdate();
    });
    schedule.scheduleJob('0 1 18 * * *', () => {
        gachaUpdate();
    });

    global.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
}