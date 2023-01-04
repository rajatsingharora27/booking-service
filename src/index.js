const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { PORT, DB_SYNC } = require("./config/serverConfig");
const apiRoutes = require("./routes/index");
const db = require("./models/index");

const setUpandStartServer = () => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use("/api", apiRoutes);

  app.listen(PORT, () => {
    console.log("App started at PORT ", PORT);
    if (process.env.DB_SYNC) {
      db.sequelize.sync({ alter: true });
    }
  });
};

setUpandStartServer();
