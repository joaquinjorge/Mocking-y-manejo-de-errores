const dotenv = require("dotenv");

dotenv.config({
  override: true,
  path: "../src/.env",
});

const configDotenv = {
  PORT: process.env.PORT || 3000,

  MONGO_URL: process.env.MONGO_URL,
  MODE: process.env.MODE,

  sessions: {
    SECRET: process.env.SECRET,
    CLIENTID: process.env.CLIENTID,
    CLIENTSECRET: process.env.CLIENTSECRET,
    CALLBACKURL: process.env.CALLBACKURL,
  },
};

module.exports = configDotenv;
