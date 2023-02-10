const mongoose = require('mongoose');
const citeis = require('./cities');
const {places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground');

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

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0; i< 50; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            location:`${citeis[random1000].city}, ${citeis[random1000].state}`,
            title:`${sample(descriptors)}, ${sample(places)}`,
            image:'https://unsplash.com/collections/1114848/camping',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus neque, similique sed debitis enim sapiente porro obcaecati asperiores provident aperiam natus eveniet quod consequuntur temporibus placeat distinctio iure, ipsam inventore!'
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})