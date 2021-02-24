const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const db = [];

exports.initDB = () => {
    db['map'] = low(new FileSync(path.resolve(__dirname, '..', '..', 'data', 'db', 'map.json')));
    db['time'] = low(new FileSync(path.resolve(__dirname, '..', '..', 'data', 'db', 'time.json')));
    db['info'] = low(new FileSync(path.resolve(__dirname, '..', '..', 'data', 'db', 'info.json')));

    db['map'].defaults({
        user: []
    }).write();

    db['time'].defaults({
        user: []
    }).write();

    db['info'].defaults({
        user: []
    }).write();
}

exports.isInside = ( name, key, index, value ) => {
    return db[name].get(key).map(index).value().includes(value);
}

exports.get = ( name, key, index ) => {
    return db[name].get(key).find(index).value();
}

exports.update = ( name, key, index, data ) => {
    db[name].get(key).find(index).assign(data).write();
}

exports.push = ( name, key, data ) => {
    db[name].get(key).push(data).write();
}
