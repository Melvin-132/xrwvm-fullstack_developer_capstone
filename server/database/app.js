/* jshint esversion: 8, node: true */

const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3030;

app.use(cors());
app.use(
    require('body-parser').urlencoded({
        extended: false
    })
);

const reviews_data = JSON.parse(
    fs.readFileSync("reviews.json", 'utf8')
);

const dealerships_data = JSON.parse(
    fs.readFileSync("dealerships.json", 'utf8')
);

mongoose.connect(
    "mongodb://mongo_db:27017/",
    { dbName: 'dealershipsDB' }
);

const Reviews = require('./review');
const Dealers = require('./dealership');

// Initialize database
try {
    Reviews.deleteMany({}).then(() => {
        Reviews.insertMany(reviews_data.reviews);
    });

    Dealers.deleteMany({}).then(() => {
        Dealers.insertMany(dealerships_data.dealerships);
    });
} catch (error) {
    console.log(error);
}

// Express route to home
app.get('/', async (req, res) => {
    res.send("Welcome to the Mongoose API");
});

// Fetch all reviews
app.get('/fetchReviews', async (req, res) => {
    try {
        const documents = await Reviews.find();
        res.json(documents);
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching documents'
        });
    }
});

// Fetch reviews by dealer ID
app.get('/fetchReviews/dealer/:id', async (req, res) => {
    try {
        const documents = await Reviews.find({
            dealership: req.params.id
        });

        res.json(documents);
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching documents'
        });
    }
});

// Fetch all dealers
app.get('/fetchDealers', async (req, res) => {
    try {
        const dealers = await Dealers.find({});
        res.json(dealers);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Fetch dealers by state
app.get('/fetchDealers/:state', async (req, res) => {
    try {
        const state = req.params.state;
        const dealers = await Dealers.find({
            state: state
        });

        res.json(dealers);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Fetch a dealer by ID
app.get('/fetchDealer/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const dealer = await Dealers.findOne({
            id: id
        });

        res.json(dealer);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Insert a review
app.post(
    '/insert_review',
    express.raw({ type: '*/*' }),
    async (req, res) => {
        try {
            const data = JSON.parse(req.body);

            const documents = await Reviews.find()
                .sort({ id: -1 });

            const new_id = documents.length > 0 ?
                documents[0].id + 1 :
                1;

            const review = new Reviews({
                id: new_id,
                name: data.name,
                dealership: data.dealership,
                review: data.review,
                purchase: data.purchase,
                purchase_date: data.purchase_date,
                car_make: data.car_make,
                car_model: data.car_model,
                car_year: data.car_year
            });

            const savedReview = await review.save();
            res.json(savedReview);

        } catch (error) {
            console.log(error);

            res.status(500).json({
                error: 'Error inserting review'
            });
        }
    }
);

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
