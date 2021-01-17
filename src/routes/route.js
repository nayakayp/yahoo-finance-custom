const express = require("express");
const router = express.Router();

const bot_controller = require("../controllers/bot.ctrl");

router.get("/", bot_controller.home_view);

router.post("/", bot_controller.historical_data_web);

module.exports = router;
