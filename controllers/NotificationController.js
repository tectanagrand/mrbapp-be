const webpush = require("web-push");
webpush.setVapidDetails(
  "mailto:rtektano@gmail.com",
  process.env.PUBLICVAPID,
  process.env.PRIVATEVAPID
);

const NotificationController = {};

NotificationController.PushNotif = async (req, res) => {
  const subscription = {
    endpoint:
      "https://wns2-pn1p.notify.windows.com/w/?token=BQYAAADZ7eb1B4dAiV1XsHorJH1dFI1k1c5tVItZP5YFAhh378svibec%2bBPME6FabxfQ%2bBenhvunXdyN1q%2f2No93M5zDjbl6JDA3uBlw472uNBCTVuPJeVxBSGDWGmJF3P8JTzyENrjoLSc%2fHNA6uNDzPxV0Lf3rgGTR%2bA1ypNTycF567aCw96cz%2b%2feVLbQKTObGrFwLa689IGmF9z9o4WLtLHoa4Pjg9H7CXs%2bJH5w2I%2finEr6FveVEJy52HMk7vnTTk%2fGoQ%2b%2b5uB97axFuH5pqTlaQGwlUbuRvEYPFStE62ZrOySZ%2fxi7usH2uoY5OUi8iJb%2ft4A7kkk2omtat%2feREDtRp",
    expirationTime: null,
    keys: {
      p256dh:
        "BORk8hyWjWuTgUjUPCuNyD8_49eELUBaO2xcE5EImQeb85pYQUkDB80ZXHMDXgHarzkj58M3c9aXX2D9DJ2G2tg",
      auth: "5MYfFnGUGFsX-xo0JHunpw",
    },
  };
  try {
    webpush.sendNotification(
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

module.exports = NotificationController;
