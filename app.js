const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const {campgroundSchema } = require('./schemas.js');
const Campground = require('./models/campground');
const Review = require('./models/review');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

mongoose.set('strictQuery', true);

mongoose.connect('mongodb://localhost:27017/yelpcamp', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once("open", () =>{
    console.log('Database connection');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true}));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map( el => el.message ).join(',');
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
}

app.get('/', (req, res)=> {
    res.render('home');
});

app.get('/campgrounds', async (req, res)=> {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds })
});

app.get('/campgrounds/new', (req, res)=> {
    res.render('campground/new')
});

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next)=> {
    if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 404);
        const campground = new Campground(req.body.campground);
        await campground.save()
        res.redirect(`/campgrounds/${ campground._id }`);
}));

app.get('/campgrounds/:id', async (req, res)=> {
    const campground = await Campground.findById(req.params.id);
    res.render('campground/show', { campground })
});

app.get('/campgrounds/:id/edit', catchAsync(async (req, res)=> {
    const campground = await Campground.findById(req.params.id);
    res.render('campground/edit', { campground })
}));

app.put('/campgrounds/:id', validateCampground, async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campgrounds/:id', async (req,res) => {
    const { id } = req.params;
    Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});

app.post('/campgrounds/:id/reviews', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.all( '*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error',{err});
});

app.listen(3000, () => {
    console.log('Serving on port 3000')
})