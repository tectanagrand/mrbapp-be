const mysql = require("mysql2/promise");

class DbConn {
  constructor() {
    this.pool = mysql.createPool({
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
  }

  async init() {
    try {
      this.client = await this.pool.getConnection();
    } catch (error) {
      console.log(error);
    }
  }

  async initConnection() {
    try {
      return await this.pool.getConnection();
    } catch (error) {
      console.log(error);
    }
  }

  get poolConnection() {
    return this.client;
  }

  releaseConnection() {
    this.client.release();
  }

  async insert(value, to_table) {
    try {
      await this.client.beginTransaction();
      let query = "";
      const startQuery = "INSERT INTO ";
      let arrayVal = [];
      let arrayOfparam = [];
      const arrayOfValkey = Object.keys(value).map((item) => {
        arrayVal.push(value[item]);
        arrayOfparam.push("?");
        return item;
      });
      query =
        startQuery +
        to_table +
        ` (${arrayOfValkey.join(", ")})` +
        " VALUES " +
        `(${arrayOfparam.join(", ")}) ;`;
      const insertQ = this.client.query(query, arrayVal);
      await this.client.commit();
      return insertQ;
    } catch (error) {
      await this.client.rollback();
      console.error(error);
      throw new Error(error);
    } finally {
      this.client.release();
    }
  }

  async update(value, where, table) {
    try {
      await this.client.beginTransaction();
      let query = "";
      const startQuery = "UPDATE ";
      let arrayVal = [];
      let arrayOfparam = [];
      const arrayOfValkey = Object.keys(value).map((item) => {
        arrayVal.push(value[item]);
        arrayOfparam.push("?");
        return `${item} = ?`;
      });
      const arrayOfWhere = Object.keys(where).map((item) => {
        return `${item} = ${where[item]}`;
      });
      query =
        startQuery +
        table +
        `SET ${arrayOfValkey.join(", ")}` +
        " WHERE " +
        `${arrayOfWhere.join(" AND ")} ;`;
      const updateQ = await this.client.query(query, arrayVal);
      await this.client.commit();
      return updateQ;
    } catch (error) {
      await this.client.rollback();
      console.log(error);
      throw new Error(error.message);
    } finally {
      this.client.release();
    }
  }

  async delete(where, table) {
    try {
      await this.client.beginTransaction();
      let query = "";
      const arrayOfWhere = Object.keys(where).map((item) => {
        return `${item} = ${where[item]}`;
      });
      query =
        "DELETE FROM " + table + " WHERE " + arrayOfWhere.join(" AND ") + " ;";
      const deleteItem = this.client.query(query);
      await this.client.commit();
      return deleteItem;
    } catch (error) {
      await this.client.rollback();
      console.error(error);
      throw new Error(error);
    } finally {
      this.client.release();
    }
  }

  async select(query, value) {
    try {
      const data = await this.client.query(query, value);
      return data;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  insertQuery(value, to_table) {
    let query = "";
    const startQuery = "INSERT INTO ";
    let arrayVal = [];
    let arrayOfparam = [];
    console.log(value);
    const arrayOfValkey = Object.keys(value).map((item) => {
      arrayVal.push(value[item]);
      arrayOfparam.push("?");
      return item;
    });
    console.log(arrayOfValkey);
    query =
      startQuery +
      to_table +
      ` (${arrayOfValkey.join(", ")})` +
      " VALUES " +
      `(${arrayOfparam.join(", ")}) ;`;
    return [query, arrayVal];
  }

  updateQuery(value, where, table) {
    let query = "";
    const startQuery = "UPDATE ";
    let arrayVal = [];
    let arrayOfparam = [];
    const arrayOfValkey = Object.keys(value).map((item) => {
      arrayVal.push(value[item]);
      arrayOfparam.push("?");
      return `${item} = ?`;
    });
    const arrayOfWhere = Object.keys(where).map((item) => {
      arrayVal.push(where[item]);
      return `${item} = ?`;
    });
    query =
      startQuery +
      table +
      ` SET ${arrayOfValkey.join(", ")}` +
      " WHERE " +
      `${arrayOfWhere.join(" AND ")} ;`;
    return [query, arrayVal];
  }

  deleteQuery(where, table) {
    let query = "";
    let arrayOfVal = [];
    const arrayOfWhere = Object.keys(where).map((item) => {
      arrayOfVal.push(where[item]);
      return `${item} = ?`;
    });
    query =
      "DELETE FROM " + table + " WHERE " + arrayOfWhere.join(" AND ") + " ;";
    return [query, arrayOfVal];
  }
}

module.exports = DbConn;
