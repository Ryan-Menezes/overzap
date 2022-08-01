const mongoose = require('mongoose');

const uri = `mongodb://localhost/overzap`;

mongoose.connect(uri)
    .then(() => console.log('DB is UP'))
    .catch(err => console.log(err));
