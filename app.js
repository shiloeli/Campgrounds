const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true}))


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

app.post('/campgrounds', async (req, res)=> {
    const campground = new Campground(req.body.campground);
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`);
});

app.get('/campgrounds/:id', async (req, res)=> {
    const campground = await Campground.findById(req.params.id);
    res.render('campground/show', { campground })
});

app.listen(3000, () => {
    console.log('Serving on port 3000')
})