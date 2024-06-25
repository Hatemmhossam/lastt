
const customerdata = require("../models/CustomersSchema");
const restaurantdata = require("../models/Restaurantschema");
const Reservation = require("../models/ReservationSchema");
const Voucher = require('../models/voucherSchema'); 




    const cvres=async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.email) {
            return res.redirect('/signin'); // Redirect to signin if user not logged in
        }

        const userEmail = req.session.user.email; // Assuming user email is stored in session
        const reservations = await Reservation.find({ customerEmail: userEmail });

        // Fetch restaurant details for each reservation
        const reservationsWithData = await Promise.all(reservations.map(async (reservation) => {
            const restaurant = await restaurantdata.findOne({ email: reservation.restaurantEmail });
            return {
                reservation,
                restaurant // Attach restaurant details to each reservation
            };
        }));

        res.render('CusViewRes', { user: req.session.user, reservations: reservationsWithData });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

////////


   

    



    const restaurants=async (req, res) => {
    const perPage = 6;
    const page = parseInt(req.query.page) || 1;

    try {
        const restaurants = await restaurantdata.find({ status: { $ne: 'pending' } }) // Exclude restaurants with status 'pending'
            .skip((perPage * page) - perPage)
            .limit(perPage);

        const count = await restaurantdata.countDocuments({ status: { $ne: 'pending' } }); // Count only non-pending restaurants

        res.render('resturants', {
            restaurants,
            current: page,
            pages: Math.ceil(count / perPage),
            user: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

// Other routes and middleware definitions




    const restaurantid=async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const restaurant = await restaurantdata.findById(restaurantId);
       
        res.render('details', { restaurant, user: req.session.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};




    const det=async (req, res) => {
    const { numberOfPeople, date, time, restaurantEmail, voucherCode } = req.body;

    try {
        // Check if user is authenticated
        if (!req.session.user) {
            return res.redirect('/signin');
        }

        const userEmail = req.session.user.email;

        // Fetch restaurant details
        const restaurant = await restaurantdata.findOne({ email: restaurantEmail });

        if (!restaurant) {
            return res.status(404).send('Restaurant not found');
        }

        // Get current date and time
        const currentDate = new Date();
        const reservationDate = new Date(date + 'T' + time);

        // Check if reservation date is before today's date
        if (reservationDate < currentDate) {
            return res.status(400).send('You cannot make a reservation in the past');
        }

        // Check if reservation time is within the restaurant's operating hours
        const openingTime = new Date(date + 'T' + restaurant.openingTime);
        const closingTime = new Date(date + 'T' + restaurant.closingTime);

        if (reservationDate < openingTime && reservationDate > closingTime) {
            return res.status(400).send('Reservation time is outside the restaurant\'s operating hours');
        }

        // Handle voucher verification
        let discount = 0;
        if (voucherCode) {
            const voucher = await Voucher.findOne({ code: voucherCode, username: userEmail });
            if (voucher) {
                discount = voucher.discount;
                await Voucher.deleteOne({ code: voucherCode });
            } else {
                return res.status(400).send('Invalid voucher code');
            }
        }

        // Create reservation document
        const reservation = new Reservation({
            restaurantEmail,
            customerEmail: userEmail,
            numberOfPeople,
            date,
            time,
            discount
        });

        await reservation.save();
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};




    const prof= (req, res) => {
    if (req.session.user) {
        res.render('profile', { user: req.session.user, restaurant: null });
    } else if (req.session.restaurant) {
        res.render('profile', { user: null, restaurant: req.session.restaurant });
    } else {
        res.redirect('/signin');
    }
};





const csu=async (req, res) => {
    const { email, name, password, phone, location } = req.body;

    try {
        // Check if email already exists in customerdata or restaurantdata or if it's the admin email
        const customer = await customerdata.findOne({ email });
        const restaurant = await restaurantdata.findOne({ email });

        if (email === 'admin@123' || customer || restaurant) {
            return res.render('customerssignup', { errorMessage: 'This email is already in use. Please choose another.', formData: req.body });
        }

        // If email is not taken, create a new customer
        const cdata = new customerdata({ name, email, password, phone, location });
        await cdata.save();
        res.redirect('/signin');
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
};



    const rere= async (req, res) => {
    const { email, name, password, phone, location } = req.body;

    try {
        // Check if email already exists in customerdata or restaurantdata or if it's the admin email
        const customer = await customerdata.findOne({ email });
        const restaurant = await restaurantdata.findOne({ email });

        if (email === 'admin@123' || customer || restaurant) {
            return res.render('restreq', { errorMessage: 'This email is already in use. Please choose another.', formData: req.body });
        }
    const rdata = new restaurantdata(req.body);
    
     await rdata.save();
         
            console.log('Restaurant data saved successfully');
            res.redirect('/signin'); 
        }

        catch(err)  { 
            console.error('Error saving restaurant data:', err); 
            res.status(500).send('Internal Server Error');
        };
};


    const si=async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user is admin
        if (email === 'admin@123' && password === '123') {
            // Admin login successful
            req.session.user = { email: 'admin@123' }; // Store minimal user data in session
            return res.redirect('/admin');
        }

        // Normal user login check
        const user = await customerdata.findOne({ email });
        const restaurant=await restaurantdata.findOne({email});
        if (!user && !restaurant) {
            return res.status(401).render('signin', { errorMessage: "Incorrect email or password" });
        }

        if(restaurant){
            if (restaurant.password === password) {
                req.session.restaurant = restaurant;  // Store user data in session
               return  res.redirect('/dashboard');
            }
            else {
                res.status(401).render('signin', { errorMessage: "Incorrect email or password" });
            }
        }
        else if(user){
            if (user.password === password) {
                req.session.user = user; // Store user data in session
                return res.redirect('/');
            }
            else {
                res.status(401).render('signin', { errorMessage: "Incorrect email or password" });
            }
        }

     

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error");
    }
};



    const lo=(req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).send('Failed to logout');
      }
      res.redirect('/');
  });
};









    const ser=async (req, res) => {
    const searchTerm = req.query.name || '';
    const category = req.query.category || 'All';
    const nearby = req.query.nearby === 'true';

    const query = {
        name: { $regex: new RegExp(searchTerm, 'i') },
        status: { $ne: 'pending' }
    };

    if (category !== 'All') {
        query.category = category;
    }

    if (nearby && req.session.user && req.session.user.location) {
        const userLocation = req.session.user.location;
        query.location = userLocation; // Directly compare location strings

        // Example of how to handle location comparison in a case-insensitive manner:
        // query.location = { $regex: new RegExp(userLocation, 'i') };
    }

    try {
        const restaurants = await restaurantdata.find(query);
        res.json(restaurants);
    } catch (err) {
        console.error('Error searching restaurants:', err);
        res.status(500).send('Internal Server Error');
    }
};








    const savevo= async (req, res) => {
    const { couponCode, discount } = req.body;

    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: 'You need to be logged in to save a voucher.' });
        }

        const username = req.session.user.email;
        const newVoucher = new Voucher({
            code: couponCode,
            username: username,
            discount: discount
        });

        await newVoucher.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving voucher:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



 
    const checkvo=async (req, res) => {
    const { voucherCode } = req.body;
    if (!req.session.user) {
        return res.json({ success: false, message: 'You need to log in to use a voucher.' });
    }

    const voucher = await Voucher.findOne({ code: voucherCode, username: req.session.user.email });
    if (voucher) {
        res.json({ success: true, discount: voucher.discount });
    } else {
        res.json({ success: false, message: 'Invalid voucher code.' });
    }
};


    const cvrr=async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.email) {
            return res.redirect('/signin'); // Redirect to signin if user not logged in
        }

        const userEmail = req.session.user.email; // Assuming user email is stored in session
        const reservations = await Reservation.find({ customerEmail: userEmail });

        // Fetch restaurant details for each reservation
        const reservationsWithData = await Promise.all(reservations.map(async (reservation) => {
            const restaurant = await restaurantdata.findOne({ email: reservation.restaurantEmail });
            return {
                reservation,
                restaurant // Attach restaurant details to each reservation
            };
        }));

        res.render('CusViewRes', { user: req.session.user, reservations: reservationsWithData });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};










module.exports={cvres,restaurants,restaurantid,det,prof,csu,rere,si,lo,ser,savevo,checkvo,cvrr}