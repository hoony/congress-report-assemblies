import { MongoClient } from 'mongodb';
import assert from 'assert';
import fs from 'fs';
import path from 'path';

const url = 'mongodb://localhost:27017/conress-report';
const filePath = path.join(__dirname,  'modified_assembly.json');
const collectionTitle = 'assembly';

function readFile(dataFile) {
  return new Promise(
    (resolve, reject) => {
      fs.readFile(dataFile, 'utf8', (err, result) => {
        if (err) reject(err);
        
        resolve(JSON.parse(result));
      });
    }
  );
};

function wrangleData(data) {
  return new Promise(
    (resolve, reject) => {
      let wrangled = data.map(item => {
        item.aides = strToArr(item.aides, ',');
        item.pr_secrs = strToArr(item.pr_secrs, ',');
        item.sc_secrs = strToArr(item.sc_secrs, ',');
        item.hobby = strToArr(item.hobby, '/');
        item.committee = strToArr(item.committee, ',');

        return item;
      });

      resolve(wrangled);
    }
  );
};

function insertData(data) {
  return new Promise(
    (resolve, reject) => {
      
      MongoClient.connect(url, (err, db) => {
        let collection = db.collection(collectionTitle);

        collection.insertMany(data, (err, result) => {
          if (err) reject(err);

          resolve(result);
          db.close();
        });
      });

    }
  );
    
};

function strToArr(str, delimiter) {
  return str.split(delimiter).map(item => item.trim());
};

function main() {
  readFile(filePath)
    .then(wrangleData)
    .then(insertData)
    .then(result => {
      console.log(result);
    });
};

main();
