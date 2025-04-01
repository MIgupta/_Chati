import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId: userId }, process.env.JWT_TOKEN, {
        expiresIn: "7d"
    });

    // Set the JWT token in the cookies
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,     // Prevents XSS
        sameSite: "strict", // Prevents CSRF
        secure: process.env.NODE_ENV !== "development" // Use HTTPS in production
    });

    return token;
};
