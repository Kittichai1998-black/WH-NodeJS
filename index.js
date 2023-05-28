
const functions = require("firebase-functions");
const express = require('express');
const cors = require('cors');

const loginController = require('./controller/loginController')
const warehouseController = require('./controller/warehouseController')
const stockController = require('./controller/stockController')

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/api', loginController);
app.use('/api', warehouseController);
app.use('/api', stockController);

const PORT = 8091;
app.listen(PORT, () => {
    console.log('Server is running on port :' + PORT);
});

exports.app = functions.https.onRequest(app);