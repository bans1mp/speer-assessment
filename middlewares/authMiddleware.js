const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        //Extracting header
        const token = req.header('Authorization').replace('Bearer ', '');

        // Verify the token
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user associated with the token
        const user = await User.findOne({ _id: payload.userId });

        if (!user) {
            throw new Error();
        }

        //Send token and ID in request
        req.token = token;
        req.userId = user._id;

        next();
    } catch (error) {
        res.status(401).json({ error: 'User is not authenticated!' });
    }
};

module.exports = authMiddleware;
