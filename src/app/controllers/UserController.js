const User = require('../models/User');
const Info = require('../models/Info');
const { mongooseToObject } = require('../../util/mongoose');
const PAGE_SIZE = 6;

const UserController = {
    //[GET] /users/:id/edit
    edit(req, res, next) {
        User.findById(req.params.id)
            .then(user => res.render('users/edit',{
                user: mongooseToObject(user),
                data: req.data,
                data_admin: req.data?.admin,
            }))
            .catch(next);
    },

    //[PUT] /users/:id
    update(req, res, next) {
        User.updateOne({_id: req.params.id}, req.body)
            .then(() => res.redirect('/me/stored/users'))
            .catch(next);
        // res.json(req.body)
    },

    //[PATCH] /users/:id/restore
    restore(req, res, next) {
        User.restore({ username: req.params.id})
        Info.restore({ username: req.params.id})
        .then (() => res.redirect('back'))
        .catch(next);
    },

    //[DELETE] /users/:id

    destroy: async(req, res, next) => {
        try {
            const deleteUsr = await User.deleteOne({ username: req.params.id})
            const deleteInfo = await Info.deleteOne({ username: req.params.id})
            res.redirect('back')
        } catch (err) {
            res.status(500).send(err)
        }
    },

    getDetail: async(req, res, next) => {
        try {
            const username = await req.data.username;
            const info = await Info.findOne({ username: username });
            res.render('users/detail', {
                username: info.username,
                email: info.email,
                name: info.name,
                phone: info.phone,
                avatar: info.avatar,
                facebook: info.facebook,
                instagram: info.instagram,
                data: req.data,
                data_admin: req.data?.admin,
            })
        } catch (err) {
            res.status(500).json(err)
        }
    },

    updateDetail: async(req, res, next) => {
        try {
            const newInfo = await Info.updateOne({ username: req.params.username}, req.body)
            return res.redirect('back')
            return res.json(req.body)
            // return res.json(newInfo)
        } catch(err) {
            res.status(500).json(err)
        }
    },

    getAll(req, res, next) {
        var page = req.query.page;
        const searchedField = req.query.name  ;
        if (!searchedField) {
            if (page) {
                page = parseInt(page)
                if(page < 1) {
                    page = 1
                }
                var soLuongBoQua = (page - 1) * PAGE_SIZE;
    
                User.find({})
                .skip(soLuongBoQua)
                .limit(PAGE_SIZE)
                .then(data => {
                    User.countDocuments({}).then((total) => {
                        var tongSoPage = Math.ceil(total / PAGE_SIZE)
                        res.json({
                            total: total,
                            tongSoPage: tongSoPage,
                            data: data
                        })
                    })
                })
                .catch(err =>
                    res.status(500).json('Loi Server')
                )
            } else {
                User.find({})
                    .then(data => {
                        User.countDocuments({}).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE)
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data
                            })
                        })
                    })
                    .catch(err =>
                        res.json(err))
            }
        }
        // Co du lieu search
        else {
            if (page) {
                page = parseInt(page)
                if(page < 1) {
                    page = 1
                }
                var soLuongBoQua = (page - 1) * PAGE_SIZE;
    
                User.find({username:{$regex: searchedField ,$options: '$ui'}})
                .skip(soLuongBoQua)
                .limit(PAGE_SIZE)
                .then(data => {
                    User.countDocuments({username:{$regex: searchedField ,$options: '$ui'}}).then((total) => {
                        var tongSoPage = Math.ceil(total / PAGE_SIZE)
                        res.json({
                            total: total,
                            tongSoPage: tongSoPage,
                            data: data
                        })
                    })
                })
                .catch(err =>
                    res.status(500).json('Loi Server')
                )
            } else {
                User.find({username:{$regex: searchedField ,$options: '$ui'}})
                    .then(data => {
                        User.countDocuments({username:{$regex: searchedField ,$options: '$ui'}}).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE)
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data
                            })
                        })
                    })
                    .catch(err =>
                        res.json(err))
            }
        }
    }

}

module.exports = UserController;
