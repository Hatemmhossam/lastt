const mongoose = require('mongoose');
const { Schema } = mongoose;

const reservationSchema = new Schema({
    restaurantEmail: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    numberOfPeople: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    }
});

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
