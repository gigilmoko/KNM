const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.isAuthenticatedUser = async (req, res, next) => {
    const authorizationHeader = req.header('Authorization');

    if (!authorizationHeader) {
        return res.status(401).json({ message: 'Login first to access this resource' });
    }

    try {
        const token = authorizationHeader.split(' ')[1]; // Assuming the format is "Bearer token"
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        next();
    } catch (error) {
        console.error('Authentication error:', error); // Log the error for debugging
        return res.status(401).json({ message: 'Invalid token' });
    }
};


exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        console.log(roles, req.user, req.body);
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Role (${req.user.role}) is not allowed to access this resource` });
        }
        next();
    };
};