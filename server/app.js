const express = require('express');
const app = express();
const cors = require('cors')    

const category = require('./routes/category');
const product = require('./routes/product')
const calendar = require('./routes/calendar')

app.use(cors())
app.use(express.json({ limit: '50mb' }));

app.use('/api/', category);
app.use('/api/', product);
app.use('/api', calendar);

module.exports = app