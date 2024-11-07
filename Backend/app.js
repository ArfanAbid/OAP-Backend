import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

// Setting

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));
app.use(express.json({limit:"16kb"})); 
app.use(express.urlencoded({extended:true,limit:"16kb"})); 
app.use(express.static("public")); 
app.use(cookieParser());

// Routes 
import authRoute from "./routes/auth.route.js";
import jobRoute from "./routes/job.route.js";
import subscriptionRoute from "./routes/subscription.route.js";


// Endpoints

app.use("/api/auth", authRoute);
app.use("/api/job", jobRoute);
app.use("/api/subscription", subscriptionRoute);


export default app;


