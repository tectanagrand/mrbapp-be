const DbConn = require("../helper/DbTransaction");
const moment = require("moment");

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
      is_active: data.is_active,
    };
    try {
      const result = await Client.insert(payload, "req_book");
      res.status(200).send(result);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  showAllBook: async (req, res) => {
    const Client = new DbConn();
    await Client.init();
    try {
      const showall = await Client.select("SELECT * FROM req_book");
      res.status(200).send(showall);
    } catch (error) {
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
