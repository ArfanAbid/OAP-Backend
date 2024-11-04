import express from "express";
import {upload} from "../middleware/multer.middleware.js";

import { register, login, logout, refreshAccessToken } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", upload.single("profileImage"), register);
router.post('/login', login);
router.post('/logout', logout); 
router.post('/refresh-token', refreshAccessToken); 





export default router;

