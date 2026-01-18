import { config } from "dotenv";
import mongoose from "mongoose";

config();

async function connectDB() {
    try {
        console.log("Connecting DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected DB.");
    } catch (e) {
        console.log("failed to connect DB!!", e);
    }
}

export { connectDB };
