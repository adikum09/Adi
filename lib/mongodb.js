const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const dbname = 'Radar';
const url = "mongodb+srv://adi:adi@radar-ptl4c.mongodb.net/test?w=0&readPreference=secondary";
const mongoOptions = { useNewUrlParser: true };

const state = {
  db: null
};

const connect = (cb) => {
  if (state.db) {
    cb();
  }
  else {
    MongoClient.connect(url, mongoOptions, (err, client) => {
      if (err)
        cb(err)
      else {
        state.db = client.db(dbname);
        cb();
      }
    });
  }
}

const getDB = () => {
  return state.db;
}


const getPrimaryKey = (_id) => {
  return ObjectID(_id);
}

module.exports = { getDB, connect, getPrimaryKey };