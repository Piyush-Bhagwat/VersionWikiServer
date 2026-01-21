import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

function jwtVerify(req, res, next) {
    const header = req.headers.authorization;
    // console.log("header: ", header);

    if (header) {
        const token = header?.split(" ")[1] || header;
        // console.log("Serect", process.env.JWT_SECRET);

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                res.sendStatus(403);
            }

            req.user = user;
            console.log("User in -> ", user.email);

            next();
        });
    } else {
        res.sendStatus(401);
    }
}

export default jwtVerify;
