// Import
require('dotenv').config();
require('./database');
require('./whatsapp');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./src/routes');

// Vars
const PORT = process.env.PORT || 3000;

// Invocation
const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(routes);

// Start server
app.listen(PORT, () => {
    console.log(`App running on port: ${PORT}`);
});
