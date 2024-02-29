const DbConn = require("../helper/DbTransaction");
const moment = require("moment");
const uuid = require("uuidv4");

const BookReqCol = [
  "id_ruangan",
  "id_user",
  "created_at",
  "book_date",
  "time_start",
  "duration",
  "agenda",
  "prtcpt_ctr",
  "remark",
  "is_active",
];

const BookReqControllers = {
  createBook: async (req, res) => {
    const Client = new DbConn();
    await Client.init();
    const data = req.body.data;
    const today = new Date();
    const payload = {
      id_ruangan: data.id_ruangan,
      id_user: data.id_user,
      created_at: today,
      book_date: data.book_date,
      time_start: data.time_start,
      duration: data.duration,
      agenda: data.agenda,
      prtcpt_ctr: data.participant,
      remark: data.remark,
      id_book: uuid.uuid(),
      is_active: 1,
    };
    try {
      const result = await Client.insert(payload, "req_book");
      res.status(200).send({
        message: "Room Booked",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  },

  showAllBook: async (req, res) => {
    const Client = new DbConn();
    await Client.init();
    try {
      const showall = await Client.select("SELECT * FROM req_book");
      res.status(200).send({ data: showall[0] });
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  },

  showBookbyUser: async (req, res) => {
    const Client = new DbConn();
    await Client.init();
    try {
      const userid = req.query.id_user;
      if (userid === undefined) {
        throw Error("Request Error");
      }
      const showData = await Client.select(
        `SELECT
        id_book,
        id_user,
        MR.nama as nama_ruangan,
        agenda,
        is_active,
        time_start,
        time_end,
        book_date,
        CASE 
          WHEN NOW() > upcoming_time AND NOW() < start_time THEN 'Oncoming'
          WHEN NOW() > start_time AND NOW() < end_time THEN 'Ongoing'
          WHEN NOW() < start_time THEN 'Prospective'
          WHEN NOW() > end_time OR is_active = 0 THEN 'Inactive' 
          ELSE ''
        END AS status
      FROM
        (
        SELECT
          id_book,
          id_ruangan,
          agenda,
          id_user,
          is_active,
          DATE_FORMAT(time_start, '%H:%i') as time_start,
          DATE_FORMAT(book_date, '%Y-%m-%d') as book_date,
          DATE_FORMAT(DATE_ADD(time_start, INTERVAL duration HOUR ), '%H:%i') as time_end,
          TIMESTAMP (
          CONCAT( book_date, ' ', time_start )) AS start_time,
          TIMESTAMP (
          CONCAT( book_date, ' ', DATE_FORMAT(DATE_ADD(time_start, INTERVAL duration HOUR ), '%T'))) AS end_time,
          TIMESTAMP ( TIMESTAMP (
          CONCAT( book_date, ' ', time_start )) - INTERVAL 15 MINUTE ) AS upcoming_time 
        FROM
        req_book 
        ) BK 
        LEFT JOIN mst_room MR ON BK.id_ruangan = MR.id_ruangan 
        WHERE id_user = ?`,
        [userid]
      );
      const data = showData[0];
      res.status(200).send({ data: data });
    } catch (error) {
      console.error(error);
      if (error.message === "Request Error") {
        res.status(400).send({ message: error.message });
      } else {
        res.status(500).send({ message: error.message });
      }
    }
  },

  showBookbyRoom: async (req, res) => {
    const Client = new DbConn();
    await Client.init();
    try {
      const roomId = req.query.roomid;
      if (roomId === undefined) {
        throw Error("Request Error");
      }
      const get = await Client.select(
        "SELECT * FROM req_book where id_ruangan = ? and is_active = 1",
        [roomId]
      );
      const books = get[0];
      res.status(200).send({ data: books });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  updateBook: async (req, res) => {
    const Client = new DbConn();
    await Client.init();
    try {
      const data = req.body.data;
      const whereReq = req.body.where;
      let payload = {};
      let where = {};
      Object.keys(data).map((item) => {
        if (!BookReqCol.includes(item)) {
          throw new Error(`Column ${item} not found`);
        }
        payload[item] = data[item];
      });
      Object.keys(whereReq).map((item) => {
        if (!BookReqCol.includes(item)) {
          throw new Error(`Column ${item} not found`);
        }
        where[item] = whereReq[item];
      });
      const updateData = await Client.update(payload, where, "req_book");
      res.status(200).send(updateData);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  },
};

module.exports = BookReqControllers;
