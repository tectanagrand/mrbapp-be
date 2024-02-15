const OTPgen = require("otp-generator");
const bcrypt = require("bcryptjs");
const DbConn = require("../helper/DbTransaction");

const OTP = {
  createOTP: () => {
    try {
      const otpCode = OTPgen.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      let validUntil = new Date();
      validUntil.setMinutes(validUntil.getMinutes() + 5);
      const salt = bcrypt.genSaltSync(10);
      const encodedOTP = bcrypt.hashSync(otpCode, salt);
      return [otpCode, encodedOTP, validUntil];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  validateOTP: async (otpInput, email) => {
    const Client = new DbConn();
    await Client.init();
    try {
      const getDataOTP = await Client.select(
        `
        SELECT * from otp_trans where email = ?
      `,
        [email]
      );
      const data = getDataOTP[0];
      if (data.length == 0) {
        throw new Error("Not Requesting any OTP");
      }
      const otpHashed = data[0].otp_code;
      const otpTimelimit = new Date(getDataOTP[0].valid_until);
      const now = new Date();
      if (now > otpTimelimit) {
        throw new Error("OTP Expired");
      }
      const compareOTP = bcrypt.compareSync(otpInput, otpHashed);
      if (!compareOTP) {
        throw new Error("OTP not valid");
      }
      return compareOTP;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      Client.releaseConnection();
    }
  },
};

module.exports = OTP;
