const express = require("express");
const { connectDB } = require("./config/mongo.db");
const cors = require("cors");
const { authRouter } = require("./routes/auth.routes");
const notesRouter = require("./routes/notes.route");
const { default: errorMiddleware } = require("./middleware/error.middleware");
const { responseHandler } = require("./middleware/response.moddleware");
const { userRouter } = require("./routes/user.routes");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(responseHandler);

app.get("/", (req, res) => {
    res.status(200).send("notes api backend");
});

app.use("/api/auth", authRouter);
app.use("/api/note", notesRouter);
app.use("/api/user", userRouter);

app.listen(3612, async () => {
    console.log("Starting server... on port 3612");
    await connectDB();
    console.log("Server Started.");
});

app.use(errorMiddleware);
