import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const authenticateUser = async (req, res, next) => {
    try {
        // Check for the token in cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log(token);

        if (!token) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded?._id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Invalid Access Token" });
        }

        // Attach user to the request object
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: error.message || "Invalid Access Token" });
    }
};
