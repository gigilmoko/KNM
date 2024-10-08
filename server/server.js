const express = require('express');
const cors = require('cors');
const http = require('http');
const cookie = require('cookie-parser');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');

const auth = require('./routes/auth');
const category = require('./routes/category');
const product = require('./routes/product');
const calendar = require('./routes/calendar');
const member = require('./routes/member');

const app = express();
const PORT = process.env.PORT || 4001;
const server = http.createServer(app);

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

app.use('/api', auth);
app.use('/api', calendar);
app.use('/api', category);
app.use('/api', product);
app.use('/api', member);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});