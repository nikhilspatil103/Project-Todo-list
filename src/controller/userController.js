const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const validator = require('../utils/validator')
const jwt = require('jsonwebtoken')
const { Auth } = require("two-step-auth")

const bcrypt = require('bcrypt')
const saltRounds = 10

const SignUp = async function (req, res) {
    try {
        const requestBody = req.body

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide user Detaills" })
        }

        //Extract Body
        let { enterName, enterEmail, enterPassword, reEnterPassword } = requestBody

        if (!validator.isValid(enterName)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide your Name" })
        }

        if (!validator.isValid(enterEmail)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide your email" })
        }

        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(enterEmail)) {
            return res.status(400).send({ status: false, message: `Email should be a valid email address` });
        }

        const isEmailAlredyExist = await userModel.findOne({ enterEmail: enterEmail })
        if (isEmailAlredyExist) {
            return res.status(400).send({ status: false, message: `${enterEmail} alredy present` });
        }

        if (!validator.isValid(enterPassword)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide Password" })
        }


        if (!(enterPassword.length >= 8 && enterPassword.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password should be Valid min 8 and max 15 " })
        }

        if (!validator.isValid(reEnterPassword)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please wright Password Again" })
        }

        if (!(reEnterPassword.length >= 8 && reEnterPassword.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password should be Valid min 8 and max 15 " })
        }

        if (enterPassword != reEnterPassword) {
            return res.status(400).send({ status: false, message: "Password not matched" })
        }

        let password = await bcrypt.hash(enterPassword, saltRounds)

        let update = { enterName, enterEmail, password }
        data = await userModel.create(update)
        res.status(201).send({ status: true, data: data })
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const login = async function (req, res) {                             //https://www.geeksforgeeks.org/email-verification-using-otp-in-nodejs/
    try {
        const requestBody = req.body

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide user Detaills" })
        }


        //Extract Body
        let { email, password } = requestBody
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide email" })
        }

        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, message: `Email should be a valid email address` });
        }

        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide Password" })
        }


        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password should be Valid min 8 and max 15 " })
        }

        let user = await userModel.findOne({ enterEmail: email })

        if (!user) {
            return res.status(400).send({ status: false, message: "no such user with this email id found" })
        }


        let hash = user.password
        let pass = await bcrypt.compare(password, hash)
        if (!pass) {
            return res.status(400).send({ status: false, message: "Password Incorrect" })
        }


        const resSend = await Auth(email, "Nikhil Patil")
        res.header('otp', resSend.OTP)
        res.header('user', user._id)

        res.status(202).send({ status: true, message: "OTP send sucsessfully" })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


const enterOtp = async function (req, res) {                             //https://www.geeksforgeeks.org/email-verification-using-otp-in-nodejs/
    try {
        let otp = req.header('otp')

        if (!otp) {
            return res.status(400).send({ status: false, message: "no otp found in req header" })
        }
        let userId = req.header('user')

        if (!userId) {
            return res.status(400).send({ status: false, message: "no userId found in req header" })
        }
        let otpFromBody = req.body.otp

        if (isNaN(otpFromBody)) {
            return res.status(400).send({ status: false, message: "enter valid otp" })
        }

        if (otp != otpFromBody) {
            return res.status(400).send({ status: false, message: "Otp incorrect" })
        }

        const token = jwt.sign({
            userId: userId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 60
        }, 'Todo')



        res.status(200).send({ status: true, data: { userId: userId, token: token } })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}



module.exports = {
    SignUp, login, enterOtp
}