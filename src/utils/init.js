const { newDB } = require('./database');
const { newServer } = require('./server');
const { gachaUpdate } = require('./update')
const schedule = require('node-schedule');

const databaseInitialize = () => {
    newDB('map');
    newDB('time');
    newDB('info');
    newDB('artifact');
    newDB('character');
    newDB('authority');
    newDB('gacha', { user: [], data: [] });
};

module.exports = () => {
    newServer(9934);
    databaseInitialize();
    gachaUpdate();

    schedule.scheduleJob('0 31 11 * * *', () => {
        gachaUpdate();
    });
    schedule.scheduleJob('0 1 18 * * *', () => {
        gachaUpdate();
    });
}