const moment = require("moment");

const toTime = moment("2024-03-04 08:15:00");
const fromTime = moment("2024-03-04 08:00:00");

const diffTime = fromTime.diff(toTime, "minutes");
console.log(diffTime);
