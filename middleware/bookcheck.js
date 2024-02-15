const DbConn = require("../helper/DbTransaction");

const checkBook = async (req, res, next) => {
  const data = req.body.data;
  const room = data.id_ruangan;
  const book_date = data.book_date;
  const time_start = data.time_start;
  const duration = data.duration;
  const Client = new DbTrans();
  await Client.init();
  try {
    const isBooked = await Client.select(
      `
      SELECT
      id_ruangan,
      book_date,
      TIME(time_start),
      duration,
      ADDTIME(
        TIME(time_start),
        CONCAT(duration, ':00:00')
      ) AS time_end
    FROM
      req_book
    WHERE
      id_ruangan = ?
    AND book_date = ?
    AND is_active = 1
    AND (
      TIME(?) >= time_start
      AND ADDTIME(
        TIME(?),
        CONCAT(?, ':00:00')
      ) <= ADDTIME(
        TIME(time_start),
        CONCAT(duration, ':00:00')
      )
    ) ;
    `,
      [room, book_date, time_start, time_start, duration]
    );
    if (isBooked[0].length > 0) {
      throw new Error("Room Booked");
    }
    next();
  } catch (error) {
    if (error.message === "Room Booked") {
      res.status(400).send({
        message: `${room} is booked`,
      });
    } else {
      res.status(500).send({
        message: error.message,
      });
    }
  }
};

module.exports = checkBook;
