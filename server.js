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

app.use(
    cors({
        origin: (origin, callback) => {
            logger.info("🔍 Incoming origin:", origin);
            logger.info("🔍 Allowed origins:", allowedOrigins);

            if (!origin) {
                logger.info(
                    "✅ No origin - allowing (likely same-origin or tool)",
                );
                callback(null, true);
                return;
            }

            if (allowedOrigins.includes(origin)) {
                logger.info("✅ Origin allowed:", origin);
                callback(null, true);
            } else {
                logger.error("❌ Origin NOT allowed:", origin);
                logger.error("❌ Does not match any of:", allowedOrigins);
                callback(new Error("Not allowed by CORS"));
            }
        },
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
