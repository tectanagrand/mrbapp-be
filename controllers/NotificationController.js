const webpush = require("web-push");
const DbConn = require("../helper/DbTransaction");
webpush.setVapidDetails(
  "mailto:rtektano@gmail.com",
  process.env.PUBLICVAPID,
  process.env.PRIVATEVAPID
);

const NotificationController = {};

NotificationController.PushNotif = async (req, res) => {
  const subscription = {
    endpoint:
      "https://updates.push.services.mozilla.com/wpush/v2/gAAAAABl4CUVUVMDrl0jyrLlr1C1BPTB8AMsS1l5t6ADnLDqg5R6gnyY20GHvlI6me4ZLJGk623QdFCFcl5P2v6FqsBaINvhO3xhteV9i7o2v1yWqx1jZVF88GV7wRaKaxxUjnsCAUSbsk973UvgjP5UxrMTylaRPgW7VbyH-colCR-iKMYFYtM",
    expirationTime: null,
    keys: {
      p256dh:
        "BNoofElc48kTClYU_JrZ7UGhUdmYZO4djtzzouOFx_xE21zT0JP9-wRlxdVHCKqVvcxeVtnzS6WiZCsdsjlLbDY",
      auth: "uTfqXZXJ1zaiVSbIsH7buA",
    },
  };
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Hello Web Push",
        message: "Your web push notification is here!",
      })
    );
    res.status(200).send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

NotificationController.PushMultiNotif = async (req, res) => {
  const Client = new DbConn();
  const client = await Client.initConnection();
  const userId = "ecbd2ab7-5512-43e4-a76c-6f3cd218db10";
  try {
    const getNotifTrg = await client.query(
      `SELECT * FROM notif_sub WHERE id_user = ?`,
      [userId]
    );
    const dataTarget = getNotifTrg[0];
    const promises = [];
    dataTarget.forEach((item) => {
      const subscription = {
        endpoint: item.endpoint_sub,
        keys: {
          p256dh: item.p256dh_sub,
          auth: item.auth_sub,
        },
      };
      promises.push(
        webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: "Hello Web Push",
            message: "Your web push notification is here!",
          })
        )
      );
    });
    await Promise.all(promises);
    res.status(200).send({ message: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  } finally {
    client.release();
  }
};

module.exports = NotificationController;
