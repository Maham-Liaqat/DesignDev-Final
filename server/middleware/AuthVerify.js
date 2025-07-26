const jwt = require("jsonwebtoken");

const Authentication = (req, res, next) => {
    try {
        const token = req.header("Authorization");

        console.log("Raw Token from Header:", token); 

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const splitToken = token.split(" ");
        console.log("Split Token:", splitToken); 

        if (splitToken[0] !== "Bearer" || !splitToken[1]) {
            return res.status(400).json({ message: "Invalid token format." });
        }

        const verified = jwt.verify(splitToken[1], process.env.SECRET_KEY); 
        console.log("Decoded JWT:", verified); 
        req.user = verified; 
        next();
    } catch (error) {
        console.error("JWT verification error:", error);
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = { Authentication };
