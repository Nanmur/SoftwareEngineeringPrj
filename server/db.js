const mysql = require('mysql');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'jindouyun'
});

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
}

module.exports = query;
