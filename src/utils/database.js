const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const db = [];

const newDB = ( name, defaultElement = { user: [] } ) => {
    db[name] = low(new FileSync(path.resolve(__dirname, '..', '..', 'data', 'db', name + '.json')));
    db[name].defaults(defaultElement).write();
}

newDB('map');
newDB('time');
newDB('info');
newDB('artifact');
newDB('character');
newDB('authority');
newDB('gacha', { user: [], data: [] });

exports.isInside = async ( name, key, index, value ) => {
    return db[name].get(key).map(index).value().includes(value);
};

exports.get = async ( name, key, index ) => {
    return db[name].get(key).find(index).value();
};

exports.update = async ( name, key, index, data ) => {
    db[name].get(key).find(index).assign(data).write();
};

exports.push = async ( name, key, data ) => {
    db[name].get(key).push(data).write();
};

exports.set = async ( name, key, data ) => {
    db[name].set(key, data).write();
}