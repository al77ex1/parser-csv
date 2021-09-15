const fs = require('fs'); 
const parse = require('csv-parse');
const mysql = require('mysql2/promise');
const bluebird = require('bluebird');

(async () => {
const connection = await mysql.createConnection({
  host: '192.168.0.108',
  user: 'admin',
  password: 'qwerty',
  database: 'crawler',
  Promise: bluebird
});


const resData=[];

fs.createReadStream('file.csv')
  .pipe(parse({delimiter: ','}))
  .on('data', function(csvrow) {
    resData.push(csvrow);        
  })
  .on('end',function() {

    const promises = resData.map(async (row) => {
      const rate = row[4].match(/(\d+)(\d+)/g);
      if (rate !== null) {
        if (rate.length === 2) {
          await connection.execute('UPDATE `searches_aggregate` SET min_rate = ?, max_rate = ? WHERE `name` = ?' , [parseInt(rate[0]), parseInt(rate[1]), row[2]]);
          console.log(row[2], rate);
        }
      }
    })
    Promise.all(promises).then(async () => {
      await connection.end();
    })
  })
})();


