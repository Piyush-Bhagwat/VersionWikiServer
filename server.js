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

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",").map((origin) =>
    origin.trim(),
);

console.log("Allowed origins: ", allowedOrigins);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: false,
    }),
);
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
