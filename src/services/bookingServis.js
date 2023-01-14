const { BookingRepository } = require("../repository/index");
const axios = require("axios");
const { FLIGHT_SERVICE_PATH } = require("../config/serverConfig");
const ServiceError = require("../utiles/errors/service-error");
const { StatusCodes } = require("http-status-codes");

const dotenv = require("dotenv");
dotenv.config();

class BookingService {
  constructor() {
    this.bookingRepository = new BookingRepository();
  }

  #verifyAvailableSeats(flight, seats) {
    if (seats < flight.totalSeats) {
      return true;
    } else return false;
  }

  async createBooking(data) {
    try {
      const flightId = data.flightId;
      const flightServiceURL = `http://localhost:3005/api/v1/flights/${flightId}`;
      //Getting flight form the Flight Service
      const flight = await axios.get(flightServiceURL);
      const flightData = flight.data.data;
      //will make a logic for change the flight seat details
      //check avaiable seats in the flight
      // flight.data.data geeting an axiox object
      let avaiableSeats = this.#verifyAvailableSeats(
        flightData,
        data.noOfSeats
      );
      if (avaiableSeats) {
        //make the booking
        const bookingData = {
          ...data,
          totalCost: flightData.price * data.noOfSeats,
          noOfSeats: data.noOfSeats,
        };
        const booking = await this.bookingRepository.create(bookingData);
        //after making bokking update the flight service
        flightData.totalSeats = flightData.totalSeats - booking.noOfSeats;
        await axios.patch(`http://localhost:3005/api/v1/flights/${flightId}`, {
          totalSeats: flightData.totalSeats,
        });
        //Updateing the booking status
        const updatedBooking = await this.bookingRepository.update(booking.id, {
          status: "Booked",
        });
        return updatedBooking;
      } else {
        throw new ServiceError(
          "ServiceError",
          "Something went wrong in the booking process",
          "Insufficient seats in the flight"
        );
      }
    } catch (error) {
      if (error.name === "ServiceError") {
        throw error;
      }
      throw new ServiceError();
    }
  }

  /*
   *Delete or cancel a booking
   */

  async cancelOrDeleteBooking(bookedId) {
    /*
     * booking data we will receive
     * 1. checking if the flight is booked or not initially
     *
     * update the flight service to change the flight seat status
     * 2. dont delete record from the db jus update the status
     */
    const bookedData = await this.bookingRepository.getBooking(bookedId.id);
    if (bookedData.status !== "Booked") {
      throw new ServiceError(
        "ServiceError",
        "Status Not confirmed",
        "The booking is not yet done for this id"
      );
    } else {
      console.log(bookedData.flightId, bookedData.noOfSeats);
      const flight = axios.get(
        `http://localhost:3005/api/v1/flights/${bookedData.flightId}`
      );
      const booking = this.bookingRepository.update(bookedId.id, {
        status: "Cancelled",
      });
      const [FlightFetched, BookingUpdate] = await Promise.all([
        flight,
        booking,
      ]);
      const updateFlightSeats = await axios.patch(
        `http://localhost:3005/api/v1/flights/${bookedData.flightId}`,
        {
          totalSeats:
            BookingUpdate.noOfSeats + FlightFetched.data.data.totalSeats,
        }
      );
    }
  }
}

module.exports = BookingService;
