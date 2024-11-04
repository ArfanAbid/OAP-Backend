import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/dbConnection.js";


dotenv.config();


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️  Server is running on http://localhost:${process.env.PORT}`);
    });
})
.catch((error) => {
    console.log("MongoDB connection Error:", error);
})