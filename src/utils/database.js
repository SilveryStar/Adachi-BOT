const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const db = [];

const newDB = ( name, defaultElement ) => {
    defaultElement = (typeof defaultElement !== 'undefined') ? defaultElement : { user: [] };

    db[name] = low(new FileSync(path.resolve(__dirname, '..', '..', 'data', 'db', name + '.json')));
    db[name].defaults(defaultElement).write();
}

exports.initDB = () => {
    newDB('map');
    newDB('time');
    newDB('info');
    newDB('artifact');
    newDB('character');
};

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
