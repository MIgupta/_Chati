import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const protectRoute = async (req, res, next) => {
    try {
        console.log("Cookies received:", req.cookies);
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided!" });
        }

        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        console.log("Decoded token:", decoded);

        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token!" });
        }

        // Use await to fetch user from database
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protectRoute middleware:", error.message);
        return res.status(500).json({ message: "Internal Server Error!" });
    }
};

export default protectRoute;
