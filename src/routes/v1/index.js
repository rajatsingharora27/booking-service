const express = require("express");
const { BookingController } = require("../../controllers/index");
const router = express.Router();

const bookingController = new BookingController();

router.post("/bookings", bookingController.create);
router.post("/updateBooking", bookingController.updateBooking);

module.exports = router;
