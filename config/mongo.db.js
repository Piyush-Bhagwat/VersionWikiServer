const mongoose = require("mongoose")

async function connectDB() {
    try {
        console.log("Connecting DB...");
        await mongoose.connect("mongodb://root:qwerty@localhost:27017/notesDB?authSource=admin");
        console.log("Connected DB.");
    } catch (e) {
        console.log("failed to connect DB!!", e);
    }
}

module.exports = { connectDB };