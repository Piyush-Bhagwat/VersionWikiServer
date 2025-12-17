require("dotenv").config();
const { Router } = require("express");
const { User } = require("../models/user.model");
const jwt = require("jsonwebtoken");
const jwtVerify = require("../middleware/auth");

const authRouter = Router();

authRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);

    const u = await User.findOne({ email, password }).lean();

    if (u) {
        const token = jwt.sign(
            { name: u.name, email: u.email, id: u._id },
            process.env.JWT_SECRET,
            { expiresIn: "5d" }
        );
        return res.status(200).json({ name: u.name, token });
    }
    return res.sendStatus(404);
});

authRouter.get("/verify", jwtVerify, async (req, res) => {
    res.sendStatus(200);
});

authRouter.post("/register", async (req, res) => {
    const { email, name, password } = req.body;
    // console.log("req: ", name);

    if (!email || !name || !password) {
        return res.sendStatus(400);
    }
    const exist = await User.findOne({ email });
    if (exist) {
        return res.sendStatus(404);
    }

    const user = await User.create({ name, email, password });
    const token = jwt.sign(
        { name: user.name, email: user.email, id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "5d" }
    );
    return res.status(200).json({ token, name: user.name });
});

authRouter.get("/:id", (req, res) => {
    const id = req.params.id;
});

module.exports = { authRouter };
