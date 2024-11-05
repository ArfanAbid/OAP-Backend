import express from "express";
import {upload} from "../middleware/multer.middleware.js";

import { register, login, logout, refreshAccessToken ,forgetPassword, verifyOtp, resetPassword } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", upload.single("profileImage"), register);
router.post('/login', login);
router.post('/logout', logout); 
router.post('/refresh-token', refreshAccessToken); 
// Forget Password Routes
router.post('/forgot-password', forgetPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);





export default router;

