const express = require("express")
const app = express();
const dotenv = require("dotenv").config()
const authRoute = require("./routes/authRoute")
const noteRoute = require("./routes/noteRoute")
const noteRoute = require("./routes/searchRoute")
const mongoose = require("mongoose");

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

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI

//Connecting to database and server
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Connected to database")
        app.listen(PORT, () => {
            console.log(`Server running at port ${PORT}`)
        })
    })
    .catch((err) => {
        console.log(err)
    })

