// Packages
const expressValidator = require("express-validator");
const express = require("express");
require("express-async-errors");
const cors = require("cors");
require("dotenv").config();
const app = express();

// Import helper methods
const {dbConnection, errorHandler } = require("./helpers");

// Database Connection
dbConnection();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressValidator());
// console.log(expressValidator);
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
    res.redirect("/api/users");
});

// api routes middleware
app.use("/api", require('./routes/hospital/auth'));
// app.use("/api", require('./routes/doctor/doctor'));
// app.use("/api", require('./routes/user/auth'));
// app.use("/api", require('./routes/user/user'));

// Error handling middleware
app.use(function (err, req, res, next) {
    return res.status(500).json({
        error:"Something went wrong!"
    });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
