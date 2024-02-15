const jwt = require("jsonwebtoken");

const AuthToken = async (req, res, next) => {
  let headers = req.headers.Authorization || req.headers.authorization;
  let token = headers?.split(" ")[1];
  let decode;
  if (!(req.headers.authorization || req.headers.Authorization)) {
    res.status(401).send({
      message: "Access Denied",
    });
  } else {
    try {
      if (token !== undefined) {
        decode = jwt.verify(token, process.env.TOKEN_KEY);
      } else {
        const exception = new Error();
        exception.name = "Unauthorized";
        exception.response = {
          status: 401,
          data: {
            message: "Unauthorized",
          },
        };
        throw exception;
      }
      req.useridSess = decode.id;
      next();
    } catch (err) {
      if (err?.response?.status === 401) {
        res.status(401).send({
          message: err.response.data.message,
        });
      } else if (err.name == "TokenExpiredError") {
        res.status(403).send({
          message: err.message,
        });
      } else {
        res.status(500).send({
          message: err.stack,
        });
      }
    }
  }
};

module.exports = AuthToken;
