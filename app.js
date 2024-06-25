const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const app = express();
const port = 3001;
const dbURI = 'mongodb+srv://hatem_1234567:4i6NKLCmhJmRznb0@cluster0.zzlforu.mongodb.net/collection?retryWrites=true&w=majority&appName=Cluster0';
const path = require('path');
const customerdata = require("./models/CustomersSchema");
const restaurantdata = require("./models/Restaurantschema");
const Reservation = require("./models/ReservationSchema");
const Voucher = require('./models/voucherSchema'); // Adjust the path as necessary
app.use(express.static('views'));
app.use(express.static('routes'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

const { ObjectId } = mongoose.Types;
const router = express.Router();


const adminRoutes = require('./routes/adminr');
const { appendFile } = require('fs/promises');

app.use(adminRoutes);


// Initialize MongoDBStore for session storage
const store = new MongoDBStore({
    uri: dbURI,
    collection: 'sessions' // Specify the collection name for sessions
});

// Catch errors in MongoDBStore initialization
store.on('error', function(error) {
    console.error('Session store error:', error);
});

// Middleware to set up session
app.use(session({
    secret: 'your-secret-key', // Change this to a long random string for production
    resave: false,
    saveUninitialized: true,
    store: store, // Use MongoDBStore for session storage
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Session expiration time (1 day)
    }
}));

// Other middleware and configuration


app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.json());


function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/signin');
    }
}


// Routes and handlers
app.get('/', (req, res) => {
    customerdata.find()
        .then((result) => {
            res.render('Home', { arr: result, user: req.session.user });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Internal Server Error');
        });
});


app.get('/resturants', async (req, res) => {
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
});

// Other routes and middleware definitions



app.get('/restaurant/:id', async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const restaurant = await restaurantdata.findById(restaurantId);
       
        res.render('details', { restaurant, user: req.session.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/details', async (req, res) => {
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
});




app.get('/aboutUs', (req, res) => {
    res.render('aboutUs', { user: req.session.user });
});

app.get('/signin', (req, res) => {
    res.render('signin', { user: req.session.user, errorMessage: null });
});


app.get('/contact', (req, res) => {
    res.render('contact', { user: req.session.user });
});

app.get('/customerssignup', (req, res) => {
    res.render('customerssignup', { errorMessage: null, formData: {} });
});


app.get('/restreq', (req, res) => {
    res.render('restreq', { errorMessage: null, formData: {} });
});

app.get('/details', (req, res) => {
    res.render('details', { user: req.session.user });
});

app.get('/sellerReservstion', async (req, res) => {
    try {
        const reservations = await Reservation.find();
        res.render('sellerReservstion', { restaurant: req.session.restaurant, reservations });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/profile', (req, res) => {
    if (req.session.user) {
        res.render('profile', { user: req.session.user, restaurant: null });
    } else if (req.session.restaurant) {
        res.render('profile', { user: null, restaurant: req.session.restaurant });
    } else {
        res.redirect('/signin');
    }
});








app.get('/CusViewRes', async (req, res) => {
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
});


app.post('/customerssignup', async (req, res) => {
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
});


app.post('/restreq', async (req, res) => {
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
});

app.post('/signin', async (req, res) => {
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
});


app.get('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).send('Failed to logout');
      }
      res.redirect('/');
  });
});








app.get('/search', async (req, res) => {
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
});







app.post('/save-voucher', async (req, res) => {
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
});



app.post('/check-voucher', async (req, res) => {
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
});


app.get('/viewRestraunts', (req, res) => {
    Promise.all([restaurantdata.find(), customerdata.find()])
        .then(([restaurants, users]) => {
            res.render('viewRestraunts', {
                mytitle: 'viewRestraunts page',
                arr: restaurants,
                userArr: users
            });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post('/restaurants/add', async (req, res) => {
    const { name, email, password, location, description, category, phone, openingTime, closingTime, menuUrl, locationUrl, logoUrl, photoUrl, status } = req.body;

    try {
        const newRestaurant = new restaurantdata({
            name, email, password, location, description, category, phone, openingTime, closingTime, menuUrl, locationUrl, logoUrl, photoUrl, status
        });

        await newRestaurant.save();
        res.redirect('/viewRestraunts');
    } catch (err) {
        console.error('Error adding restaurant:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/restaurants/:id/delete', async (req, res) => {
    const restaurantId = req.params.id;

    try {
        await restaurantdata.findByIdAndDelete(restaurantId);
        res.redirect('/viewRestraunts');
    } catch (err) {
        console.error('Error deleting restaurant:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/restaurants/:id/edit', async (req, res) => {
    const restaurantId = req.params.id;

    try {
        const restaurant = await restaurantdata.findById(restaurantId);
        res.render('editRestaurant', { restaurant });
    } catch (err) {
        console.error('Error fetching restaurant for edit:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/restaurants/:id/edit', async (req, res) => {
    const restaurantId = req.params.id;
    const updates = req.body;

    try {
        await restaurantdata.findByIdAndUpdate(restaurantId, updates);
        res.redirect('/viewRestraunts');
    } catch (err) {
        console.error('Error updating restaurant:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/users/add', async (req, res) => {
    const { name, email, password, phone, location } = req.body;

    try {
        const newUser = new customerdata({
            name, email, password, phone, location
        });

        await newUser.save();
        res.redirect('/viewRestraunts');
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/users/:id/delete', async (req, res) => {
    const userId = req.params.id;

    try {
        await customerdata.findByIdAndDelete(userId);
        res.redirect('/viewRestraunts');
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/users/:id/edit', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await customerdata.findById(userId);
        res.render('editUser', { user });
    } catch (err) {
        console.error('Error fetching user for edit:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/users/:id/edit', async (req, res) => {
    const userId = req.params.id;
    const updates = req.body;

    try {
        await customerdata.findByIdAndUpdate(userId, updates);
        res.redirect('/viewRestraunts');
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/admin', async (req, res) => {
    try {
        const totalClients = await customerdata.countDocuments();
        const pendingRequests = await restaurantdata.countDocuments({ status: 'pending' });
        const totalNonPendingRestaurants = await restaurantdata.countDocuments({ status: { $ne: 'pending' } });

        res.render('admin', {
            user: req.session.user || "",
            totalClients: totalClients,
            pendingRequests: pendingRequests,
            totalNonPendingRestaurants: totalNonPendingRestaurants
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/dashboard',async (req, res) => {
    try {
        const sellerId = req.session.restaurant.email; // Assuming seller's ID is stored in session

        // Fetch total reservations for the seller
        const totalReservations = await Reservation.countDocuments({ restaurantEmail: sellerId });

        res.render('dashboard', {
            totalReservations: totalReservations,
            restaurant: req.session.restaurant
        });
    } catch (error) {
        console.error('Error fetching seller dashboard data:', error);
        res.status(500).send('Internal Server Error');
    }
});









// MongoDB connection and server start
mongoose.connect(dbURI)
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}/`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });



    