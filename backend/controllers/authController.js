const User = require("../models/User");
const bcrypt = require("bcryptjs");

const generateToken =
require("../utils/generateToken");

const registerUser =
async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;

        const existingUser =
        await User.findOne({
            email
        });

        if(existingUser){

            return res.status(400)
            .json({
                message:
                "User already exists"
            });
        }

        const hashedPassword =
        await bcrypt.hash(
            password,
            10
        );

        const user =
        await User.create({
            name,
            email,
            password:
            hashedPassword,
            role
        });

        res.status(201)
        .json({
            message:
            "User Registered",
            user
        });

    } catch(error){

        res.status(500)
        .json({
            message:error.message
        });
    }
};

const loginUser =
async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        const user =
        await User.findOne({
            email
        });

        if(!user){

            return res.status(401)
            .json({
                message:
                "Invalid Credentials"
            });
        }

        const isMatch =
        await bcrypt.compare(
            password,
            user.password
        );

        if(!isMatch){

            return res.status(401)
            .json({
                message:
                "Invalid Credentials"
            });
        }

        const token =
        generateToken(user);

        res.status(200)
        .json({
            message:
            "Login Success",
            token,
            role:user.role
        });

    } catch(error){

        res.status(500)
        .json({
            message:error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};