import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import {authenticateUser}  from "../middleware/auth.middleware.js";
import {authorizeAdmin}  from "../middleware/role.middleware.js";


import { createJob, getAllJobs, updateJob, updateJobStatus, deleteJob } from "../controllers/job.controller.js";


const router = express.Router();


// Admin Routes
router.post("/create-job", authenticateUser, authorizeAdmin, upload.single("uploadedImage"), createJob);
router.get("/all-jobs", authenticateUser, authorizeAdmin, getAllJobs);
router.put("/update-job/:jobId", authenticateUser, authorizeAdmin,upload.single("uploadedImage"),updateJob);
router.put("/status-update/:jobId", authenticateUser, authorizeAdmin, updateJobStatus);
router.delete("/delete-job/:jobId", authenticateUser, authorizeAdmin, deleteJob);



export default router;