
const customerdata = require("../models/CustomersSchema");
const restaurantdata = require("../models/Restaurantschema");
const Reservation = require("../models/ReservationSchema");
const Voucher = require('../models/voucherSchema'); 



    const sellres=async (req, res) => {
    try {
        const reservations = await Reservation.find();
        res.render('sellerReservstion', { restaurant: req.session.restaurant, reservations });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


    const ds=(req, res) => {
    res.render('dashboard',{restaurant: req.session.restaurant}); // Render dashboard.ejs
 
};


module.exports={sellres,ds}