const express=require("express")
const { HandleSignup, HandleLogin, getUserProfile, updateUserProfile, getUserTemplateStats, getUserByEmail, getUserComprehensiveStats } = require("../controller/UserController")
const { ValidateSignup, ValidateLogin } = require("../middleware/Validation")
const { Authentication } = require("../middleware/AuthVerify")
const upload = require("../middleware/multerConfig")

const userRoute= express.Router()

userRoute.post("/signup",HandleSignup)
userRoute.post("/login", HandleLogin)

// Profile routes
userRoute.get("/profile/:userId", getUserProfile)
userRoute.put("/profile", upload.single('profileImage'), Authentication, updateUserProfile)
userRoute.get("/profile/:userId/stats", getUserTemplateStats)
userRoute.get("/profile/:userId/comprehensive-stats", getUserComprehensiveStats)
userRoute.get("/profile/by-email/:email", getUserByEmail)

module.exports=userRoute