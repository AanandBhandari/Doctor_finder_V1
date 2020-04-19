// Packages
const expressValidator = require("express-validator");
const express = require("express");
require("express-async-errors");
const cors = require("cors");
require("dotenv").config();
const app = express();

// Import helper methods
const {dbConnection, apiRequest, every24Hr } = require("./helpers");

// Database Connection
dbConnection();

// Middlewares
app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressValidator());
// console.log(expressValidator);

// get api endpoints
app.get("/", (req, res) => {
    res.json(apiRequest());
});

// api routes middleware
app.use("/api", require('./routes/hospital/auth'));
app.use("/api", require('./routes/hospital/hospital'));
app.use("/api", require('./routes/doctor/auth'));
app.use("/api", require('./routes/doctor/doctor'));
app.use("/api", require('./routes/user/auth'));
app.use("/api", require('./routes/user/user'));

// Error handling middleware
// app.use(function (err, req, res, next) {
//     return res.status(500).json({
//         error:"Something went wrong!"
//     });
// });

// every24Hr();

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
