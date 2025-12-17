const express = require("express");
const { connectDB } = require("./config/mongo.db");
const cors = require("cors");
const { authRouter } = require("./routes/auth.routes");
const notesRouter = require("./routes/notes.route");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
    res.status(200).send("notes api backend");
});

app.use("/api/auth", authRouter);
app.use("/api/note", notesRouter);

app.listen(3612, async () => {
    console.log("Starting server...");
    await connectDB();
    console.log("Server Started.");
});
