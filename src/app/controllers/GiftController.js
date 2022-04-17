const Gift = require('../models/Gift');
const { mongooseToObject , multipleMongooseToObject} = require('../../util/mongoose');
const { request } = require('express');
const PAGE_SIZE = 12;
const PAGE_SIZE_2 = 4;

class GiftController {
    // [GET] /gifts/:slug
    show(req, res, next) {
        Gift.findOne({ slug: req.params.slug })
            .then(gift =>
                res.render('gifts/showDetailGift',
                { gift: mongooseToObject(gift),
                data: req.data,
                data_admin: req.data?.admin,
            })
            )
            .catch(next);
    }

    showStoredGifts(req, res, next) {
        res.render('me/stored-gifts', {
            data: req.data,
            data_admin: req.data?.admin,
        })
    }

    showAll(req, res, next) {
        res.render('gifts/showAll', {
            data: req.data,
            data_admin: req.data?.admin,
        })
    }

    search(req, res, next) {
        const searchedField = req.query.name  ;
        Gift.find({name:{$regex: searchedField ,$options: '$ui'}})
            .then(data => {
                res.send(data);
            })
    }

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
    
                Gift.find({})
                .skip(soLuongBoQua)
                .limit(PAGE_SIZE)
                .then(data => {
                    Gift.countDocuments({}).then((total) => {
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
                Gift.find({})
                    .then(data => {
                        Gift.countDocuments({}).then((total) => {
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
    
                Gift.find({name:{$regex: searchedField ,$options: '$ui'}})
                .skip(soLuongBoQua)
                .limit(PAGE_SIZE)
                .then(data => {
                    Gift.countDocuments({name:{$regex: searchedField ,$options: '$ui'}}).then((total) => {
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
                Gift.find({name:{$regex: searchedField ,$options: '$ui'}})
                    .then(data => {
                        Gift.countDocuments({name:{$regex: searchedField ,$options: '$ui'}}).then((total) => {
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


    // [GET] /gifts/create
    create(req, res, next) {
        res.render('gifts/createDetailGift', {
            data: req.data,
            data_admin: req.data?.admin,
        });
    }

    // [POST] /gifts/store
    store(req, res, next) {
        // req.body.image = `https://img.youtube.com/vi/${req.body.videoId}/sddefault.jpg`
        // req.body.image = `${req.body.image}`
        const idAuthor = req.data._id;
        req.body.idAuthor = idAuthor;
        const gift = new Gift(req.body);
        gift.save()
            .then(() => res.redirect('/homepage'))
            .catch(next);
    }
    // [GET] /gifts/:id/edit
    edit(req, res, next) {
        Gift.findById(req.params.id)
            .then(gift =>
                res.render('gifts/editGifts', {
                gift: mongooseToObject(gift),
                data: req.data,
                data_admin: req.data?.admin,
            }))
            .catch(next);
    }

    // [PUT] /gifts/:id
    update(req, res, next) {
        Gift.updateOne({ _id: req.params.id}, req.body)
            .then(() =>
                res.render('me/stored-gifts',
                {
                    data: req.data,
                    data_admin: req.data?.admin,
                })
            )
            .catch(next);
    }

    // [DELETE] /gifts/:id
    destroy(req, res, next) {
        Gift.delete({ _id: req.params.id})
            .then (() => res.redirect('back'))
            .catch(next);
    }

    // [DELETE] /gifts/:id/force
    forceDestroy(req, res, next) {
        Gift.deleteOne({ _id: req.params.id})
        .then (() => res.redirect('back'))
        .catch(next);
    }

    // [PATCH] /gifts/:id/restore
    restore(req, res, next) {
        Gift.restore({ _id: req.params.id})
            .then (() => res.redirect('back'))
            .catch(next);
    }


    // [POST] /gifts/handle-form-actions
    handleFormActions(req, res, next) {
        switch(req.body.action) {
            case 'delete':
                Gift.delete({_id: { $in: req.body.giftIds}})
                    .then(() => res.redirect('back'))
                    .catch(next);
                break;
            default:
                res.json({message: 'Action is invalid'});
        }
    }

    // [GET] /gifts/my-gifts
    MyGifts(req, res, next) {
        Gift.find({ idAuthor: req.data._id})
            .then(gifts => res.render('gifts/myGifts', {
                data: req.data,
                data_admin: req.data?.admin,
                gifts: multipleMongooseToObject(gifts)
            }) )
            .catch(err => res.json(err));
    }

    getMyGifts(req, res, next) {
        
        var page = req.query.page;
        const searchedField = req.query.name;
        if (!searchedField) {
            if (page) {
                page = parseInt(page)
                if(page < 1) {
                    page = 1
                }
                var soLuongBoQua = (page - 1) * PAGE_SIZE_2;
    
                Gift.find({idAuthor: req.data._id})
                .skip(soLuongBoQua)
                .limit(PAGE_SIZE_2)
                .then(gifts => {
                    Gift.countDocuments({idAuthor: req.data._id}).then((total) => {
                        var tongSoPage = Math.ceil(total / PAGE_SIZE_2)
                        res.json({
                            total: total,
                            tongSoPage: tongSoPage,
                            data: req.data,
                            data_admin: req.data?.admin,
                            gifts: multipleMongooseToObject(gifts)
                        })
                    })
                })
                .catch(err =>
                    res.status(500).json('Loi Server')
                )
            } else {
                Gift.find({idAuthor: req.data._id})
                    .then(gifts => {
                        Gift.countDocuments({idAuthor: req.data._id}).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE_2)
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: req.data,
                                data_admin: req.data?.admin,
                                gifts: multipleMongooseToObject(gifts)
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
                var soLuongBoQua = (page - 1) * PAGE_SIZE_2;
    
                Gift.find({name:{$regex: searchedField ,$options: '$ui'} , idAuthor: req.data._id})
                .skip(soLuongBoQua)
                .limit(PAGE_SIZE_2)
                .then(gifts => {
                    Gift.countDocuments({name:{$regex: searchedField ,$options: '$ui'}, idAuthor: req.data._id}).then((total) => {
                        var tongSoPage = Math.ceil(total / PAGE_SIZE_2)
                        res.json({
                            total: total,
                            tongSoPage: tongSoPage,
                            data: req.data,
                            data_admin: req.data?.admin,
                            gifts: multipleMongooseToObject(gifts)
                        })
                    })
                })
                .catch(err =>
                    res.status(500).json('Loi Server')
                )
            } else {
                Gift.find({username:{$regex: searchedField ,$options: '$ui'},  idAuthor: req.data._id })
                    .then(gifts => {
                        Gift.countDocuments({name:{$regex: searchedField ,$options: '$ui'},  idAuthor: req.data._id}).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE_2)
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: req.data,
                                data_admin: req.data?.admin,
                                gifts: multipleMongooseToObject(gifts)
                            })
                        })
                    })
                    .catch(err =>
                        res.json(err))
            }
        }
    }
}

module.exports = new GiftController();
