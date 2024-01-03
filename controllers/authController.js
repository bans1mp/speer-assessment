const User = require("../models/User")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
            error
        })
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username })
        // console.log(user)
        if (!user) {
            throw new Error("Invalid User credentials")
        }
        const isPasswordSame = await bcrypt.compare(password, user.password);
        // console.log(isPasswordSame)
        if (!isPasswordSame) {
            throw new Error("Invalid User credentials")
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        // console.log(token);
        res.status(200).json({
            message: "Login successful!",
            token
        })

    } catch (error) {
        res.status(400).json({
            error
        })
    }
}

module.exports = { signUp, login }