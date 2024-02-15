const ExampleController = {
  exampleMethod: (req, res) => {
    res.status(200).send({
      message: "This is an example",
    });
  },
};

module.exports = ExampleController;
