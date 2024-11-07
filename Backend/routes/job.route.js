import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import {authenticateUser}  from "../middleware/auth.middleware.js";
import {authorizeAdmin,authorizeUser}  from "../middleware/role.middleware.js";


import { 
        createJob,
        getAllAdminJobs,
        updateJob,
        updateJobStatus,
        deleteJob,

        openJobs,
        alljobs,

        jobdetails,
    } from "../controllers/job.controller.js";


const router = express.Router();


// Admin Routes
router.post("/create-job", authenticateUser, authorizeAdmin, upload.single("uploadedImage"), createJob);
router.get("/all-admin-jobs", authenticateUser, authorizeAdmin, getAllAdminJobs);
router.put("/update-job/:jobId", authenticateUser, authorizeAdmin,upload.single("uploadedImage"),updateJob);
router.put("/status-update/:jobId", authenticateUser, authorizeAdmin, updateJobStatus);
router.delete("/delete-job/:jobId", authenticateUser, authorizeAdmin, deleteJob);

// UnAuthorized User Routes (Visitor)
router.get("/all-jobs",alljobs);
router.get("/open-jobs",openJobs);// tobe listed in featured jobs

// Authorized User Routes
router.get("/job-details/:jobId",authenticateUser,authorizeUser,jobdetails);


// TODO: Filtering Jobs



export default router;