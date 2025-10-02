const jwt = require('jsonwebtoken');
const HttpError = require('../models/errorModel')



const authMiddleware = async (req, res, next) => {
    try {
        const Authorization = req.headers.Authorization || req.headers.authorization;

        if (!Authorization || !Authorization.startsWith("Bearer")) {
            return next(new HttpError("Unauthorized. No token provided", 401));
        }

        const token = Authorization.split(' ')[1];
        
        if (!token) {
            return next(new HttpError("Unauthorized. Invalid token format", 401));
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, info) => {
            if (err) {
                return next(new HttpError("Unauthorized. Invalid token", 403));
            }
            req.user = info;
            next();
        });
    } catch (error) {
        return next(new HttpError("Authentication failed", 401));
    }


}

module.exports = authMiddleware;