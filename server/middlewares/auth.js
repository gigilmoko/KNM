    const User = require('../models/user');
    const jwt = require('jsonwebtoken');
    const Rider = require('../models/rider');

    exports.isAuthenticatedUser = async (req, res, next) => {
        const authorizationHeader = req.header('Authorization');

        if (!authorizationHeader) {
            console.log('Authorization header missing');
            return res.status(401).json({ message: 'Login first to access this resource' });
        }

        try {
            const token = authorizationHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);

            if (!req.user) {
                console.log('User not found in database');
                return res.status(401).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            // console.error('Authentication error:', error.message);
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

    exports.isAdmin = async (req, res, next) => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin resources access denied' });
        }
        next();
    };


    // exports.protect = async (req, res, next) => {
    //     let token;
    //     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    //         token = req.headers.authorization.split(' ')[1];
    //     }

    //     if (!token) {
    //         return res.status(401).json({ message: 'Not authorized, no token' });
    //     }

    //     try {
    //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //         req.user = await User.findById(decoded.id);

    //         if (!req.user) {
    //             return res.status(401).json({ message: 'Not authorized, user not found' });
    //         }

    //         next();
    //     } catch (error) {
    //         console.error(error);
    //         res.status(401).json({ message: 'Not authorized, token failed' });
    //     }
    // };

    exports.isAuthenticatedRider = async (req, res, next) => {
        const authorizationHeader = req.header('Authorization');
    
        if (!authorizationHeader) {
            console.log('Authorization header missing');
            return res.status(401).json({ message: 'Login first to access this resource' });
        }
    
        try {
            const token = authorizationHeader.split(' ')[1];
            console.log("Token received:", token); // Add a log to inspect the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded token:", decoded); // Log the decoded token to check if it's valid
            req.rider = await Rider.findById(decoded.id);
    
            if (!req.rider) {
                console.log('Rider not found in database');
                return res.status(401).json({ message: 'Rider not found' });
            }
    
            if (req.rider.inUse === false) {
                return res.status(403).json({ message: 'This rider is not currently in use' });
            }
    
            next();
        } catch (error) {
            console.log('JWT verification failed:', error.message); // Log the error message
            return res.status(401).json({ message: 'Invalid token' });
        }
    };