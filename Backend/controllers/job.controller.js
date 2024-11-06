import jobModel from "../models/job.model.js";


// Admin Controller 
const createJob = async (req, res) => {
    const {
        title,
        description,    
        location,
        type,
        salary,
        company,
        deadlineDate,
        uploadedImage,
        contactEmail,
        tags,
        requiredSkills,
    } = req.body;

    if (!title || !description || !location || !type || !salary || !company || !deadlineDate || !contactEmail) {
        return res.status(400).json({ message: 'All required fields must be filled.' });
    }
    try {
        const job = await jobModel.create({
            title,
            description,
            location,
            type,
            salary,
            company,
            deadlineDate,
            uploadedImage,
            contactEmail,
            tags,
            requiredSkills,
            user: req.user._id, // Admin's user ID
        });

        res.status(201).json({ message: 'Job created successfully', job });
        } catch (error) {
        console.log("Error creating job:", error);
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
        uploadedImage,
        contactEmail,
        tags,
        requiredSkills,
    } = req.body;

    try {
        const job= await jobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        job.title = title || job.title;
        job.description = description || job.description;
        job.location = location || job.location;
        job.type = type || job.type;
        job.salary = salary || job.salary;
        job.company = company || job.company;
        job.deadlineDate = deadlineDate ? new Date(deadlineDate) : job.deadlineDate;
        job.uploadedImage = uploadedImage || job.uploadedImage;
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

const getAllJobs = async (req, res) => {
    try {
        const jobs = await jobModel.find();
        res.status(200).json({ message: 'Jobs fetched successfully', jobs });
    } catch (error) {
        console.log("Error fetching jobs:", error);
        res.status(500).json({ message: 'Error fetching jobs', error: error.message });
    }
};

export {
    createJob,
    updateJob,
    deleteJob,
    updateJobStatus,
    getAllJobs,
}