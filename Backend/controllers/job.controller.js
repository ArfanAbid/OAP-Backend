import jobModel from "../models/job.model.js";
import cloudinary from "../services/cloudinaryService.js";

import Subscription from "../models/subscription.model.js";
import userModel from "../models/user.model.js";


// Admin Controller 


// Admin Controller for creating a job posting and notifying subscribers
const createJob = async (req, res) => {
    const {
        title,
        description,
        location,
        type,
        salary,
        company,
        deadlineDate,
        contactEmail,
        tags,
        requiredSkills,
    } = req.body;

    // Validation for required fields
    if (!title || !description || !location || !type || !salary || !company || !deadlineDate || !contactEmail) {
        return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    try {
        // Upload image to Cloudinary if it exists
        let result = "";
        if (req.file) {
            result = await cloudinary.uploader.upload(req.file.path, { folder: "job_images" });
            // Delete the file from server after uploading to Cloudinary
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error deleting file:", err);
            });
        }

        // Create the job in the database
        const job = await jobModel.create({
            title,
            description,
            location,
            type,
            salary,
            company,
            deadlineDate,
            uploadedImage: result.secure_url ? result.secure_url : "",
            contactEmail,
            tags,
            requiredSkills,
            user: req.user._id, // Admin's user ID
        });

        // Retrieve all logged-in users with notifications enabled
        const userSubscribers = await userModel.find({ notificationsEnabled: true });
        
        // Retrieve non-logged-in email subscribers
        const emailSubscribers = await Subscription.find({ active: true });
        
        // Combine all emails to notify
        const allEmails = [
            ...userSubscribers.map(user => user.email),
            ...emailSubscribers.map(sub => sub.email)
        ];

        // Send job notifications to each email
        for (const email of allEmails) {
            await sendJobNotification(email, {
                title: job.title,
                company: job.company,
                location: job.location,
                deadlineDate: job.deadlineDate,
            });
        }

        res.status(201).json({ message: 'Job created successfully and notifications sent', job });
    } catch (error) {
        console.error("Error creating job:", error);
        res.status(500).json({ message: 'Error creating job', error: error.message });
    }
};

const updateJob = async (req, res) => {
    const { jobId } = req.params;
    const {
        title,
        description,
        location,
        type,
        salary,
        company,
        deadlineDate,
        contactEmail,
        tags,
        requiredSkills,
    } = req.body;

    try {
        const job= await jobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        let result = "";
        if (req.file) {
                result = await cloudinary.uploader.upload(req.file.path, {
                folder: "job_images",
                });
            // Delete the file from server after uploading to Cloudinary
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error deleting file:", err);
            });
        }   

        job.title = title || job.title;
        job.description = description || job.description;
        job.location = location || job.location;
        job.type = type || job.type;
        job.salary = salary || job.salary;
        job.company = company || job.company;
        job.deadlineDate = deadlineDate ? new Date(deadlineDate) : job.deadlineDate;
        job.uploadedImage = result?.secure_url || job.uploadedImage;
        job.contactEmail = contactEmail || job.contactEmail;
        job.tags = tags || job.tags;
        job.requiredSkills = requiredSkills || job.requiredSkills;

        await job.save();
        res.status(200).json({ message: 'Job updated successfully', job });

    } catch (error) {
        console.log("Error updating job:", error);
        res.status(500).json({ message: 'Error updating job', error: error.message });
    }

}


const deleteJob = async (req, res) => {
    const { jobId } = req.params;
    try {
        const job= await jobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        await cloudinary.uploader.destroy(job.uploadedImage);
        await job.remove();
        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.log("Error deleting job:", error);
        res.status(500).json({ message: 'Error deleting job', error: error.message });
    }

}    

const updateJobStatus = async (req, res) => {
    const { jobId } = req.params;
    const { status } = req.body;
    if (!['Open', 'Closed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Choose "Open" or "Closed"' });
    }
    try {
        const job = await jobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        job.status = status;
        await job.save();
        res.status(200).json({ message: 'Job status updated successfully', job });
    } catch (error) {
        console.log("Error updating job status:", error);
        res.status(500).json({ message: 'Error updating job status', error: error.message });
    }
};

const getAllAdminJobs = async (req, res) => {
    try {
        const jobs = await jobModel.find();
        res.status(200).json({ message: 'Jobs fetched successfully through Admin', jobs });
    } catch (error) {
        console.log("Error fetching jobs through Admin:", error);
        res.status(500).json({ message: 'Error fetching jobs through Admin', error: error.message });
    }
};


// Unauthorized User Controller (Visitor)

const openJobs = async (req, res) => {
    try {
        const jobs = await jobModel.find({ status: 'Open' });
        res.status(200).json({ message: 'Jobs fetched successfully', jobs });
    } catch (error) {
        console.log("Error fetching OpenJobs:", error);
        res.status(500).json({ message: 'Error fetching openJobs', error: error.message });
    }
};

const alljobs =  async (req, res) => {
    try {
        const jobs = await jobModel.find();
        res.status(200).json({ message: 'Jobss successfully', jobs });
    } catch (error) {
        console.log("Error fetching jobs:", error);
        res.status(500).json({ message: 'Error fetching jobs', error: error.message });
}
};



// Authorized User Controller


const jobdetails = async (req, res) => {
    const { jobId } = req.params;
    try {
        const job = await jobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json({ message: 'Job details fetched successfully', job });
    } catch (error) {
        console.log("Error fetching job details:", error);
        res.status(500).json({ message: 'Error fetching job details', error: error.message });
    }
};



export {
    createJob,
    updateJob,
    deleteJob,
    updateJobStatus,
    getAllAdminJobs,

    openJobs,
    alljobs,
    
    jobdetails,
}