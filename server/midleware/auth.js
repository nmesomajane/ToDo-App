import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { JWT_SECRET } from "./env";


// Middleware to protect routes
const authorised = async(req, res, next) => {
    try {
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }
      //check if token exist
      if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
      }
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }
        req.user = user;
    } catch (error) {
        res.status(401).json({ success: false, message: 'Not authorized' });
    }   
    next();
};

export default authorised;