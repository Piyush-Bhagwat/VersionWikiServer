const { verify } = require("jsonwebtoken");
require("dotenv").config();

function jwtVerify(req, res, next){
    const header = req.headers.authorization;
    // console.log("header: ", header);
    

    if(header){
        const token = header.split(' ')[1] || header;
        // console.log("Serect", process.env.JWT_SECRET);

        verify(token, process.env.JWT_SECRET, (err, user)=>{
            if(err){
                res.sendStatus(403);
            }

            req.user = user;
            next();
        })
    } else {
        res.sendStatus(401)
    }

}

module.exports = jwtVerify;