const ResponseModel = require("../api/models/ResponseModel");

const ipStore = {}; 

function preventMultipleCalls(req, res, next) {
  const ip = req.ip; 

  if (ipStore[ip]) {
    const { timestamp, count } = ipStore[ip];

    if (timestamp + 120000 > Date.now() && count >= 2) {
      const response = new ResponseModel("error", "Too many requests in 2 minutes", []);
      return res.json(response);
    } else if (timestamp + 120000 <= Date.now()) {
      ipStore[ip] = { timestamp: Date.now(), count: 1 };
    } else {
      ipStore[ip].count++;
    }
  } else {
    ipStore[ip] = { timestamp: Date.now(), count: 1 };
  }

  next()
}

exports.preventMultipleCalls = preventMultipleCalls;