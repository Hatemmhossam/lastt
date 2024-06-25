const customerdata = require("../models/CustomersSchema");
const restaurantdata = require("../models/Restaurantschema");
const Reservation = require("../models/ReservationSchema");
const Voucher = require('../models/voucherSchema'); 





    
    const viewreq= async (req, res) => {
    try {
        const pendingRestaurants = await restaurantdata.find({ status: 'pending' });

        res.render('requests', { restaurants: pendingRestaurants });
    } catch (error) {
        console.error('Error fetching pending restaurants:', error);
        res.status(500).send('Internal Server Error');
    }
};



    const accreq=async (req, res) => {
    const restaurantId = req.params.id;

    try {
        await restaurantdata.findByIdAndUpdate(restaurantId, { status: 'accepted' });
        res.redirect('/requests'); // Redirect back to view requests page
    } catch (err) {
        console.error('Error accepting restaurant:', err);
        res.status(500).send('Internal Server Error');
    }
};



    const decreq= async (req, res) => {
    const restaurantId = req.params.id;

    try {
        await restaurantdata.findByIdAndDelete(restaurantId);
        res.redirect('/requests'); // Redirect back to view requests page
    } catch (err) {
        console.error('Error declining restaurant:', err);
        res.status(500).send('Internal Server Error');
    }
};



    const vres= async (req, res) => {
    try {
        const reservations = await Reservation.find();
        res.render('viewReservation', { reservations, errorMessage: null });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


 
    const addres=async (req, res) => {
    try {
        const { restaurantEmail, customerEmail, numberOfPeople, date, time } = req.body;

        // Check if the restaurant exists
        const restaurant = await restaurantdata.findOne({ email: restaurantEmail });
        if (!restaurant) {
            const reservations = await Reservation.find();
            return res.render('viewReservation', { reservations, errorMessage: 'Restaurant not found' });
        }

        // Check if the customer exists
        const customer = await customerdata.findOne({ email: customerEmail });
        if (!customer) {
            const reservations = await Reservation.find();
            return res.render('viewReservation', { reservations, errorMessage: 'Customer not found' });
        }

        // Create and save the new reservation
        const newReservation = new Reservation({
            restaurantEmail,
            customerEmail,
            numberOfPeople,
            date,
            time
        });

        await newReservation.save();
        res.redirect('/viewReservation');

    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding reservation');
    }
};








// Route to delete a reservation by ID

    const delres= async (req, res) => {
    try {
        const deletedReservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!deletedReservation) {
            return res.status(404).send('Reservation not found');
        }
        res.redirect('/viewReservation'); // Redirect back to viewReservation page
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting reservation');
    }
};


/////////





module.exports={viewreq,accreq,decreq,vres,addres,delres}