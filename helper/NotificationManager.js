const cron = require("node-cron");
const DbConn = require("./DbTransaction");
const webpush = require("web-push");
const moment = require("moment");
const uuid = require("uuidv4");

const NotificationManager = {};

//@param timeSched : Date ; title : string ; message : string ; id_user : string ; id_book : string ;

NotificationManager.CreateNewCron = async (
  timeSched,
  title,
  message,
  id_user,
  id_book,
  id_notif
) => {
  const Client = new DbConn();
  const client = await Client.initConnection();
  try {
    await client.beginTransaction();
    const getSubs = await client.query(
      "SELECT * from notif_sub where id_user = ?",
      [id_user]
    );
    const subs = getSubs[0].map((item) => ({
      endpoint: item.endpoint_sub,
      keys: {
        p256dh: item.p256dh_sub,
        auth: item.auth_sub,
      },
    }));
    const dateNotif = moment(timeSched).format();
    const schedule = moment(timeSched).format("s m H D M *");
    const payload = [id_book, dateNotif, 0, id_notif, title, message];
    const insertSched = await client.query(
      "INSERT INTO push_sched(id_req, notif_time, is_pushed, id_notif, title_notif, message) VALUES(?,?,?,?,?,?) ;",
      payload
    );
    await client.commit();
    const pushNotif = async () => {
      const Client = new DbConn();
      const client = await Client.initConnection();
      let promises = [];
      try {
        subs.forEach((item) => {
          promises.push(
            webpush.sendNotification(
              item,
              JSON.stringify({
                title: title,
                message: message,
              })
            )
          );
        });
        await Promise.all(promises);
        const setPushedSched = await client.query(
          "UPDATE push_sched SET is_pushed = 1 WHERE id_notif = ?",
          id_notif
        );
        await client.commit();
      } catch (error) {
        await client.rollback();
        console.log(error);
      } finally {
        client.release();
      }
    };
    cron.schedule(schedule, pushNotif, {
      name: id_notif,
    });
  } catch (error) {
    await client.rollback();
    console.log(error);
  } finally {
    client.release();
  }
};

NotificationManager.CleanUpCron = async () => {
  const Client = new DbConn();
  const client = await Client.initConnection();
  try {
    await client.beginTransaction();
    const cronTasks = cron.getTasks();
    const [pushedData, _] = await client.query(
      "SELECT id_notif FROM push_sched WHERE is_pushed = 1"
    );
    pushedData.forEach((item) => {
      delete cronTasks[item];
    });
    const forDelete = pushedData.map((item) => `'${item}'`);
    const deletePushed = await client.query(
      `DELETE FROM push_sched WHERE is_pushed = 1`
    );
    console.log("notif cleaned");
    await client.commit();
  } catch (error) {
    await client.rollback();
    console.log(error);
  } finally {
    client.release();
  }
};

const rerunNotif = async (item) => {
  const Client = new DbConn();
  const client = await Client.initConnection();
  await client.beginTransaction();
  const subscription = {
    endpoint: item.endpoint_sub,
    keys: {
      p256dh: item.p256dh_sub,
      auth: item.auth_sub,
    },
  };
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: item.title_notif,
        message: item.message,
      })
    );
    const setPushedSched = await client.query(
      "UPDATE push_sched SET is_pushed = 1 WHERE id_notif = ?",
      [item.id_notif]
    );
    await client.commit();
  } catch (error) {
    await client.rollback();
    console.log(error);
  } finally {
    client.release();
  }
};

NotificationManager.ReRunCron = async () => {
  const Client = new DbConn();
  const client = await Client.initConnection();
  try {
    const [dataCron, _] = await client.query(`SELECT
    PS.notif_time,
    PS.id_notif,
    PS.title_notif,
    PS.message,
    NS.endpoint_sub,
    NS.auth_sub,
    NS.p256dh_sub 
  FROM
    push_sched PS
    LEFT JOIN req_book REQ ON PS.id_req = REQ.id_book
    LEFT JOIN notif_sub NS ON NS.id_user = REQ.id_user
    WHERE PS.is_pushed = 0`);

    dataCron.forEach((item) => {
      const schedule = moment(item.notif_time).format("s m H D M *");
      console.log(schedule);
      cron.schedule(schedule, () => rerunNotif(item), {
        name: item.id_notif,
      });
    });
    console.log("notif repushed");
  } catch (error) {
    console.error(error);
  }
};

module.exports = NotificationManager;
