import express from "express";
import { subscribe } from "../controllers/subscription.controller.js";
import { toggleSubscription } from "../controllers/subscription.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";



const router = express.Router();

// Non-logged-in user subscription
router.post("/subscribe", subscribe);

// Logged-in user subscription
router.put("/toggle-subscription", authenticateUser, toggleSubscription);

export default router;