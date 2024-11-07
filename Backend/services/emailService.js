import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Testing via Fake SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS,
    }
});

/*
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,       
    },
});
*/


// Function to send OTP for verification
export async function sendOtp(email, otp) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
}


// Function to send job notification
const sendJobNotification = async (to, jobDetails) => {
    const { title, company, location, deadlineDate } = jobDetails;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: `New Job Opportunity: ${title}`,
        text: `
            Hi there,

            A new job posting that might interest you:
            
            Job Title: ${title}
            Company: ${company}
            Location: ${location}
            Apply by: ${new Date(deadlineDate).toLocaleDateString()}
            
            Don't miss out! Check out the full job description and apply.

            Best regards,
            Job Posting Team OAP
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Notification sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export default sendJobNotification;