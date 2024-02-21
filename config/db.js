const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  database: process.env.MYSQLDB,
  password: process.env.MYSQLPASS,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 3 * 1000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: false,
});

module.exports = pool;
