const express = require('express');
const app = express();
const cors = require('cors')    
const cookie = require('cookie-parser');
const cloudinary = require('cloudinary');
const category = require('./routes/category');
const product = require('./routes/product')
const calendar = require('./routes/calendar')
const auth = require('./routes/auth')

app.use(cors())
app.use(express.json({ limit: '50mb' }));

app.use('/api/v1', category);
app.use('/api/v1', product);
app.use('/api/', calendar);
app.use('/api', auth);

module.exports = app