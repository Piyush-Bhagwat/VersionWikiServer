import "dotenv/config.js";
import { Router } from "express";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import jwtVerify from "../middleware/auth.js";
import ApiError from "../utils/apierror.util.js";
import { getUser } from "../services/user.service.js";
import { USER_MESSAGES } from "../constants/responseMessages.js";
import Emitter from "../config/event.config.js";

const authRouter = Router();

authRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const u = await User.findOne({ email, password }).lean();
    if (!u) {
        throw new ApiError(404, USER_MESSAGES.NOT_FOUND);
    }
    const payload = { name: u.name, email: u.email, id: u._id };
    if (u) {
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "5d",
        });
        console.log("user logged in ->", u.name);

        return res.sendResponse(
            200,
            { ...payload, token },
            "Login successfull",
        );
    }

    throw new ApiError(404, "User not found");
});

authRouter.get("/verify", jwtVerify, async (req, res) => {
    const user = await getUser.byId(req.user.id);
    if (!user) {
        throw new ApiError(404, USER_MESSAGES.NOT_FOUND);
    }
    res.status(200).send({ message: "user verifed" });
});

authRouter.post("/register", async (req, res) => {
    const { email, name, password } = req.body;
    // console.log("req: ", name);

    if (!email || !name || !password) {
        throw new ApiError(400, "Missing Fields");
    }
    const exist = await User.findOne({ email });
    if (exist) {
        throw new ApiError(400, "User alredy exists");
    }

    const user = await User.create({ name, email, password });
    const token = jwt.sign(
        { name: user.name, email: user.email, id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "5d" },
    );
    return res.sendResponse(200, { token, name: user.name }, "User registered");
});

// authRouter.get("/:id", (req, res) => {
//     const id = req.params.id;
// });

export { authRouter };
