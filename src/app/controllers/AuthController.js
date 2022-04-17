const User = require('../models/User');
const Info = require('../models/Info');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
var path = require("path")

const { mongooseToObject } = require('../../util/mongoose');

// class AuthController {
const AuthController = {

    // [GET] /auth/register
    register: async(req, res) => {
        res.render("auth/register")
    },
    
    // [POST] /auth/register
    registerCon: async(req, res ) => {
        try {
            if(req.body.email === "") {
                return res.json({
                    message: 'Vui lòng điền Email',
                })
            }
            if(req.body.username === "") {
                return res.json({
                    message: 'Vui lòng điền Username',
                })
            }
            if(req.body.password === "") {
                return res.json({
                    message: 'Vui lòng điền Password',
                })
            }
            if(req.body.confirmPassword === "") {
                return res.json({
                    message: 'Vui lòng điền Confirm Password',
                })
            }

            const data = await User.findOne({
                username: req.body.username
            })
            const data2 = await User.findOne({
                email: req.body.email
            })
            console.log(data2);
            
            if(data2) {
                return res.json({
                    message: 'Email đã được sử dụng. Vui lòng đăng kí lại',
                })
            }
            else if(data) {
                return res.json({
                    message: 'Tài khoản đã tồn tại. Vui lòng đăng kí lại',
                })
            }
            else if(req.body.password != req.body.confirmPassword) {
                return res.json({
                    message: 'Mật khẩu xác nhận không giống. Vui lòng nhập lại',
                })
            }
            else {
                const salt = await bcrypt.genSalt(10);
                const hashed = await  bcrypt.hash(req.body.password, salt);
                User.create({
                    username: req.body.username,
                    email: req.body.email,
                    password: hashed,
                });
                Info.create({
                    username: req.body.username,
                    email: req.body.email,
                })
                return res.json({
                    message: '',
                })
            }
        } catch(err) {
            res.status(500).json(err);
        }
    },

    // [GET] /auth/login
    login: async(req, res, next) => {
        res.render('auth/login');
    },
    // [POST] /auth/login
    loginCon: async(req, res, next) => {
        try {
            if(req.body.username === "") {
                return res.json({
                    message: 'Vui lòng điền Username',
                })
            }
            if(req.body.password === "") {
                return res.json({
                    message: 'Vui lòng điền Password',
                })
            }
            const data = await User.findOne({
                username: req.body.username,
                // password: req.body.password
            })
            if (!data) {
                // return res.status(404).json("Wrong username");
                return res.json({
                    message: 'Tài khoản hoặc mật khẩu đã sai. Vui lòng nhập lại',
                })
            }
            const validPassword = await bcrypt.compare(
                req.body.password,
                data.password
            );
            if (!validPassword) {
                return res.json({
                    message: 'Tài khoản hoặc mật khẩu đã sai. Vui lòng nhập lại',
                })
            }
    
            if(data && validPassword) {
                var accessToken = await jwt.sign({
                    _id: data._id
                }, 'ngay2thang2'
                );
                var refreshToken = await jwt.sign({
                    _id: data._id
                }, 'ngay11thang4'
                );
                return res.json({
                    message: 'Đăng nhập thành công',
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                })
            } else {
                return res.json('that bai')
            }
        } catch (err) {
            res.status(500).json(err)
        }
    },

    userLogout: async(req, res, next) => {
        try {
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.render('auth/login')
        } catch (err) {
            res.status(500).json(err)
        }

    }


    // [PUT] auth/update/:id
    // updatePassword(req, res, next) {
    //     var id = req.params.id;
    //     User.findByIdAndUpdate(id , {
    //         password: req.body.newPassword,
    //     })
    //     .then(data => {
    //         res.json(data)
    //     })
    //     .catch(err => {
    //         res.status(500).json(err)
    //     })
    // }

    // [DELETE] auth/update/:id
    // deletePassword(req, res, next) {
    //     User.deleteOne({
    //         _id : req.params.id,
    //     })
    //     .then(data => {
    //         res.json('Xoa thanh cong')
    //     })
    //     .catch(err => {
    //         res.status(500).json("Loi server")
    //     })
    // }


    // [GET] auth/private
    // private1(req, res, next) {
    //     res.json('ALL TASK')
    // }

    // [GET] auth/student
    // private2(req, res, next) {
    //     console.log(req.data)
    //     res.json('STUDENT')
    // }
}

// module.exports = new AuthController();
module.exports = AuthController;
