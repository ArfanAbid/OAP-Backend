import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import cloudinary from "../services/cloudinaryService.js";
import { generateOtp } from '../utils/otpGenerator.js';
import { sendOtp } from '../services/emailService.js';

const generateTokens = (userId) => {
    const accessToken = jwt.sign(
    {
        userId,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: "15m",
    }
    );
    const refreshToken = jwt.sign(
    {
        userId,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: "7d",
    }
    );

    return { accessToken, refreshToken };
};

const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
};

// Controllers 

const register = async (req, res) => {
    const { email, password, firstName, lastName, userType } = req.body;

    if (!email || !password || !firstName || !lastName || !userType) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Default image URL if no image is uploaded
    let profileImageUrl =
        "https://res.cloudinary.com/dm25ounxp/image/upload/v1730745160/d32z9z03zp63k7clkvst.png";

    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "user_profiles",
        });
        profileImageUrl = result.secure_url;

        // Delete the file from server after uploading to Cloudinary
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
        });
    }

    const newUser = new User({
        email,
        password,
        firstName,
        lastName,
        userType,
        profileImage: profileImageUrl,
    });

    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser._id);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
        message: "User registered successfully",
        user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        userType: newUser.userType,
        profileImage: newUser.profileImage,
        },
    });
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
    }
};



const login = async (req, res) => {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email' });
        }

        const isPasswordValid =await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Credentials do not match' });
        }

        const { accessToken, refreshToken } = generateTokens(user._id);

        // Set cookie expiry based on "Remember Me"
        const refreshTokenExpiry = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 1 day
        const accessTokenExpiry = 15 * 60 * 1000; // 15 minutes

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: accessTokenExpiry,
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: refreshTokenExpiry,
        });

        res.status(200).json({
            message: 'Login successful',
            user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const logout = (req, res) => {
    try {
        // Clear cookies
        res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        });
        res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const refreshAccessToken = (req, res) => {
    const { refreshToken } = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is missing' });
    }

    // Verify the refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
        return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Generate a new access token
    const { accessToken } = generateTokens(decoded.userId);

    res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(200).json({ message: 'Access token refreshed' });
};



// Forget Password Controller 


const forgetPassword = async (req, res) => {

    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
        await user.save();

        await sendOtp(email, otp);
        res.status(200).json({ message: 'OTP sent to your email', redirect: '/verify-otp' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred in forget password :' });
    }
}


const verifyOtp = async (req, res) => {
    
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        res.status(200).json({ message: 'OTP verified successfully', redirect: '/reset-password' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
}


const resetPassword = async (req, res) => {
    
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' }); 
        }

        user.password = newPassword; 
        await user.save(); // The pre-save middleware will hash the password

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
}


export {
    register,
    login,
    logout,
    refreshAccessToken,

    forgetPassword,
    verifyOtp,
    resetPassword,
}