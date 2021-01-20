const express = require("express");
const router = express.Router();

const bot_controller = require("../controllers/bot.ctrl");

router.get("/", bot_controller.home_view);
router.get("/idx", bot_controller.idx_view);

router.post("/", bot_controller.historical_data_web);
router.post("/idx", bot_controller.bid_offer_idx);

module.exports = router;
