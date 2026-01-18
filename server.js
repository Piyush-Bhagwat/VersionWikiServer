const express = require("express");
const { connectDB } = require("./config/mongo.db");
const cors = require("cors");
const { authRouter } = require("./routes/auth.routes");
const notesRouter = require("./routes/notes.route");
const { default: errorMiddleware } = require("./middleware/error.middleware");
const { responseHandler } = require("./middleware/response.moddleware");
const { userRouter } = require("./routes/user.routes");
const logger = require("js-logger");
const app = express();
logger.useDefaults();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",").map((origin) =>
    origin.trim(),
) || ["https://version-wiki-client-git-pre-prod-abnormal.vercel.app"];

logger.info("Allowed origins: ", allowedOrigins);
app.options(
    "*",
    cors({
        origin: allowedOrigins,
        credentials: false,
    }),
);

app.use(
    cors({
        origin: allowedOrigins,
        credentials: false,
    }),
);
app.use(responseHandler);

app.get("/", (req, res) => {
    logger.info("AllowedOrigins_:", allowedOrigins);
    res.status(200).json({ message: "notes api backend", allowedOrigins });
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

module.exports = app;
