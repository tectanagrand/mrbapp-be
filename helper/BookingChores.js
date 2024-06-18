//@clean up booking function
require("dotenv").config({ path: `.env.development` });
const moment = require("moment");
const NotificationManager = require("./NotificationManager");

const DbConn = require("./DbTransaction");

const BookingChores = {};

BookingChores.userPenalty = async function (usersId, client) {
  let now = new Date();
  now = moment(now).add(3, "days");
  try {
    if (usersId.length === 0) {
      return "Users clear";
    }
    const setPenalty = await client.query(
      `UPDATE mst_user SET penalty_until = '${moment(now).format(
        "YYYY-M-D HH:mm:ss"
      )}' WHERE id_user in (${usersId.join(",")})`
    );
    return `Penalty : ${usersId.join(",")}`;
  } catch (error) {
    console.error(error);
    await client.rollback();
    throw error;
  } finally {
    client.release();
  }
};

BookingChores.CleanUp = async () => {
  const Client = new DbConn();
  const client = await Client.initConnection();
  const penUser = new Set(); // Using Set to automatically handle unique user ids
  const idBook = new Set();
  try {
    await client.beginTransaction();
    const res = await client.query(`SELECT
      *
    FROM
      ( SELECT id_book, id_user, id_ruangan, book_date, time_start, duration, is_active, DATE_ADD( time_start, INTERVAL duration HOUR ) AS time_end FROM req_book ) BOOK 
    WHERE
      TIMESTAMP (CONCAT( BOOK.book_date, ' ', BOOK.time_end )) < NOW() AND IS_ACTIVE = 1`);
    const expiredBook = res[0];
    if (expiredBook.length === 0) {
      return "No expired booking, everything is clear";
    }
    expiredBook.forEach((item) => {
      idBook.add(item.id_book);
      penUser.add(item.id_user);
    });
    let usersPen = [];
    let bookId = [];
    penUser.forEach((item) => {
      usersPen.push(`'${item}'`);
    });
    idBook.forEach((item) => {
      bookId.push(`'${item}'`);
    });
    const resuser = await client.query(
      `SELECT id_user, penalty_until from mst_user where id_user in (${usersPen.join(
        ","
      )}) and penalty_until is null ;`
    );
    let userPen = resuser[0].map((item) => `'${item.id_user}'`);
    // let upPen = await BookingChores.userPenalty(userPen, client);
    const resUpBook = await client.query(
      `UPDATE req_book SET is_active = 0 WHERE id_book in (${bookId.join(",")})`
    );
    await client.commit();
    return "success cleaning booking";
    // const updateReqBook = Promise.all(promise);
  } catch (error) {
    await client.rollback();
    throw error;
  } finally {
    client.release();
  }
};

setInterval(async () => {
  try {
    const result = await BookingChores.CleanUp();
    await NotificationManager.CleanUpCron();
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}, 60 * 1000);
