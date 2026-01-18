import express from "express";
import { connectDB } from "./config/mongo.db.js";
import cors from "cors";
import { authRouter } from "./routes/auth.routes.js";
import notesRouter from "./routes/notes.route.js";
import errorMiddleware from "./middleware/error.middleware.js";
import { responseHandler } from "./middleware/response.moddleware.js";
import { userRouter } from "./routes/user.routes.js";
import logger from "js-logger";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
logger.useDefaults();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(responseHandler);

let dbConnected = false;
const ensureDbConnection = async () => {
    if (!dbConnected) {
        await connectDB();
        dbConnected = true;
        console.log("✅ MongoDB connected");
    }
};

app.use(async (req, res, next) => {
    //vercel dont run app.listen
    try {
        await ensureDbConnection();
        next();
    } catch (error) {
        console.error("❌ DB Connection failed:", error);
        res.status(500).json({ error: "Database connection failed" });
    }
});

app.get("/", (req, res) => {
    res.status(200).json({
        message: "notes api backend",
    });
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

export default app;
