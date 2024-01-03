const User = require("../models/User")
const bcrypt = require("bcrypt");

const signUp = async (req, res) => {
    try {
        const { username, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({
            username,
            password: hashedPassword
        })
        const savedUser = await user.save();
        res.status(201).json({
            message: "User created successfully!"
        })
    } catch (error) {
        res.status(400).json({
            message: "Some error occured!"
        })
    }
}

module.exports = { signUp }