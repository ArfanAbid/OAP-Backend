import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['Full Time', 'Part Time', 'Remote','Contract'],
        required: [true, 'Type is required'],
        trim: true
    },
    salary: {
        type: Number,
        required: [true, 'Salary is required'],
        min:[1000,'Salary cannot be less than 1000'],
        validate: {
            validator: function(value) {
                return value > 0; 
            },
            message: 'Salary must be a positive number',
        },
    },
    company: {
        type: String,
        required: [true, 'Company is required'],
        trim: true
    },
    postDate: {
        type: Date,
        default: Date.now,
    },
    deadlineDate: {
        type: Date,
        required: [true, 'Date is required'],
        validate: {
            validator: function(value) {
                return value > Date.now(); // Ensures deadline is in the future
            },
            message: 'Deadline date must be in the future',
        },
    },
    uploadedImage: {
        type: String,
        default: 'https://res.cloudinary.com/dm25ounxp/image/upload/v1730745160/d32z9z03zp63k7clkvst.png'
    },
    status: {
        type: String,
        enum: ['Open', 'Closed'],
        default: 'Open',
    },
    contactEmail: {
        type: String,
        required: [true, 'Contact email is required'],
        validate: {
            validator: function(value) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value); // Basic email regex
            },
            message: 'Please enter a valid email address',
        },
    },
    tags: {
        type: [String],
        enum: ['Engineering', 'Design', 'Marketing', 'Finance', 'HR', 'Other'], // Useful for adding tags like "Engineering", "Design", etc.
        trim: true,
    },
    applicantsCount: {
        type: Number,
        default: 0, // Tracks the number of applicants
    },
    requiredSkills: {
        type:[ String],
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
{
    timestamps: true
}
);

// Virtual property to format the deadline date
jobSchema.virtual('formattedDeadline').get(function() {
    return this.deadlineDate ? this.deadlineDate.toLocaleDateString('en-GB') : null;
});

// Method to increment the applicants count
jobSchema.methods.incrementApplicantsCount = function() {
    this.applicantsCount += 1;
    return this.save();
};

export default mongoose.model('Job', jobSchema);
