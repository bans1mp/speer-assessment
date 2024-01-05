const app = require("./app");
const dotenv = require("dotenv").config()
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000
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

