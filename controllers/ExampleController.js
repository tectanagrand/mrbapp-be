const cron = require("node-cron");

const ExampleController = {
  exampleMethod: (req, res) => {
    res.status(200).send({
      message: "This is an example",
    });
  },
  cronTest: (req, res) => {
    const test = async () => {
      console.log("hello world");
    };
    cron.schedule("0 18 14 1 3 *", test, {
      name: "HelloWorld",
    });
    console.log(cron.getTasks());
  },
};

module.exports = ExampleController;
