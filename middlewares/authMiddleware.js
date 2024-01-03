const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        // Extract the token from the Authorization header
        const token = req.header('Authorization').replace('Bearer ', '');

        // Verify the token
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user associated with the token
        const user = await User.findOne({ _id: payload.userId });

        // If user not found, throw an error
        if (!user) {
            throw new Error();
        }

        // Attach token and user ID to the request for later use
        req.token = token;
        req.userId = user._id;

        // Call the next middleware or route handler
        next();
    } catch (error) {
        // Return an unauthorized response if authentication fails
        res.status(401).json({ error: 'User is not authenticated!' });
    }
};

module.exports = authMiddleware;
