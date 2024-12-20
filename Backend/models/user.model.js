// models/User.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required:[true, 'Password is required'],
        minlength: 6
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    userType: { // i think is not really useful let see it later :)
        type: String,
        enum: ['Speaker', 'Company','Seeker'],
        required: true
    },
    userRole: {
        type: String,
        enum: ['Admin', 'User'],
        default: 'User'
    },
    profileImage: {
        type: String,
        default: "https://res.cloudinary.com/dm25ounxp/image/upload/v1730745160/d32z9z03zp63k7clkvst.png" // cloudinary link for profile image  
    },
    otp: { 
        type: String,
    },
    otpExpiry: { 
        type: Date,
    },
    notificationsEnabled: {// notificationsEnabled field to the User model to track whether the user has subscribed to notifications.So he can get new job posting update
        type: Boolean,
        default: true
    }
    },
{
    timestamps: true
}
);

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password);
}




export default mongoose.model('User', userSchema);
