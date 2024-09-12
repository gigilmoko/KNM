const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const auth = require('./routes/auth');
const calendar = require('./routes/calendar');
const cookie = require('cookie-parser');
const cloudinary = require('cloudinary');
const app = express();
const PORT = process.env.PORT || 4001;
const server = http.createServer(app);
const category = require('./routes/category');
const product = require('./routes/product')

app.use(cors());
app.use(express.json());
app.use(cookie());

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB!");
    })
    .catch((err) => {
        console.log(err);
    });

// app.use('/api', usgsRoutes);
// app.use('/api', weatherRoutes);
app.use('/api', auth);
app.use('/api', calendar);
app.use('/api/v1', category);
app.use('/api/v1', product);
// app.use('/api', heatAlertRoutes);
// app.use('/api', weatherAlert);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
    // startCronJobsEarthquake(io);
    // startCronJobsWeather(io);


    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});


