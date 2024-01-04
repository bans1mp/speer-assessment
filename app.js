const express = require("express")
const app = express();
const dotenv = require("dotenv").config()
const authRoute = require("./routes/authRoute")
const noteRoute = require("./routes/noteRoute")
const searchRoute = require("./routes/searchRoute")
const rateLimit = require("express-rate-limit")

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 200,
});

app.use(limiter);


//Parsing middleware
app.use(express.json());

//Routes
app.use('/api/auth', authRoute);
app.use('/api', noteRoute)
app.use('/api', searchRoute)

//Error handling middleware
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || "error"
    res.statusCode(err.statusCode).json({
        message: err.message,
        status: err.status
    })
})

module.exports = app;