const { StatusCodes } = require("http-status-codes");

const { Booking } = require("../models/index");
const ServiceError = require("../utiles/errors/service-error");
const { AppError, ValidationError } = require("../utiles/errors/index");

class BookingRepository {
  async create(data) {
    try {
      console.log(data);
      const booking = await Booking.create(data);
      return booking;
    } catch (error) {
      if (error.name == "SequelizeValidationError") {
        throw new ValidationError(error);
      }
      throw new ServiceError(
        "RepositoryError",
        "Cannot create Booking",
        "There was some issue creating the booking, please try again later",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  async update(bookingId, bookingStatus) {
    try {
      await Booking.update(bookingStatus, {
        where: {
          id: bookingId,
        },
      });
      const bookingUpdated = await this.getBooking(bookingId);
      return bookingUpdated;
    } catch (error) {
      throw new ServiceError(
        "RepositoryError",
        "Cannot update Booking",
        "There was some issue Updating the booking, please try again later",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getBooking(bookingId) {
    try {
      const booking = await Booking.findByPk(bookingId);
      return booking;
    } catch (error) {
      throw new ServiceError(
        "RepositoryError",
        "Cannot get Booking",
        "There was some issue getiing the booking, please try again later",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

module.exports = BookingRepository;
