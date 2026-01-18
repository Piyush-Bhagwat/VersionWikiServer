require("dotenv").config();
const mongoose = require("mongoose");

async function connectDB() {
    try {
        console.log("Connecting DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected DB.");
    } catch (e) {
        console.log("failed to connect DB!!", e);
    }
}

module.exports = { connectDB };
