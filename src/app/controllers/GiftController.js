const Gift = require('../models/Gift');
const {
    mongooseToObject,
    multipleMongooseToObject,
} = require('../../util/mongoose');
const { request } = require('express');
const fs = require('fs');

const PAGE_SIZE = 12;
const PAGE_SIZE_2 = 4;

class GiftController {
    // [GET] /gifts/:slug
    show(req, res, next) {
        Gift.findOne({ slug: req.params.slug })
            .then((gift) =>
                res.render('gifts/showDetailGift', {
                    gift: mongooseToObject(gift),
                    image: gift.image[0],
                    image1: gift.image[1],
                    image2: gift.image[2],
                    contentType0: gift.fileImages[0].contentType
                        ? gift.fileImages[0].contentType
                        : null,
                    imageBase640: gift.fileImages[0].imageBase64
                        ? gift.fileImages[0].imageBase64
                        : null,
                    contentType1: gift.fileImages[1].contentType
                        ? gift.fileImages[1].contentType
                        : null,
                    imageBase641: gift.fileImages[1].imageBase64
                        ? gift.fileImages[1].imageBase64
                        : null,
                    contentType2: gift.fileImages[2].contentType
                        ? gift.fileImages[2].contentType
                        : null,
                    imageBase642: gift.fileImages[2].imageBase64
                        ? gift.fileImages[2].imageBase64
                        : null,
                    data: req.data,
                    data_admin: req.data?.admin,
                    getImage: req.getImage,
                }),
            )
            .catch(next);
    }

    showStoredGifts(req, res, next) {
        res.render('me/stored-gifts', {
            data: req.data,
            data_admin: req.data?.admin,
        });
    }

    showAll(req, res, next) {
        res.render('gifts/showAll', {
            data: req.data,
            data_admin: req.data?.admin,
        });
    }

    search(req, res, next) {
        const searchedField = req.query.name;
        Gift.find({ name: { $regex: searchedField, $options: '$ui' } }).then(
            (data) => {
                res.send(data);
            },
        );
    }

    getAll(req, res, next) {
        var page = req.query.page;
        const searchedField = req.query.name;
        if (!searchedField) {
            if (page) {
                page = parseInt(page);
                if (page < 1) {
                    page = 1;
                }
                var soLuongBoQua = (page - 1) * PAGE_SIZE;

                Gift.find({})
                    .skip(soLuongBoQua)
                    .limit(PAGE_SIZE)
                    .then((data) => {
                        Gift.countDocuments({}).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.status(500).json('Loi Server'));
            } else {
                Gift.find({})
                    .then((data) => {
                        Gift.countDocuments({}).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.json(err));
            }
        }
        // Co du lieu search
        else {
            if (page) {
                page = parseInt(page);
                if (page < 1) {
                    page = 1;
                }
                var soLuongBoQua = (page - 1) * PAGE_SIZE;

                Gift.find({ name: { $regex: searchedField, $options: '$ui' } })
                    .skip(soLuongBoQua)
                    .limit(PAGE_SIZE)
                    .then((data) => {
                        Gift.countDocuments({
                            name: { $regex: searchedField, $options: '$ui' },
                        }).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.status(500).json('Loi Server'));
            } else {
                Gift.find({ name: { $regex: searchedField, $options: '$ui' } })
                    .then((data) => {
                        Gift.countDocuments({
                            name: { $regex: searchedField, $options: '$ui' },
                        }).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.json(err));
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
        const files = req.files;
        console.log('////////////', files);
        let imgArray = files.map((file) => {
            let img = fs.readFileSync(file.path);

            return img.toString('base64');
        });

        let result = imgArray.map((src, index) => {
            // create object to store data in the collection
            let finalImg = {
                // filename : files[index].originalname,
                filename: files[index].originalname + Math.random(),
                contentType: files[index].mimetype,
                imageBase64: src,
            };
            return finalImg;
        });

        const idAuthor = req.data._id;
        req.body.idAuthor = idAuthor;
        const image = [req.body.image, req.body.image1, req.body.image2];
        // const gift = new Gift(req.body);
        const gift = new Gift({
            name: req.body.name,
            description: req.body.description,
            image: image,
            fileImages: result,
            author: req.body.author,
            idAuthor: req.body.idAuthor,
        });
        console.log('Gifttt', gift);
        gift.save()
            .then(() => res.redirect('/homepage'))
            .catch(next);
        //  return res.json({gift: gift})
    }

    // [GET] /gifts/:id/edit
    edit(req, res, next) {
        Gift.findById(req.params.id)
            .then((gift) =>
                res.render('gifts/editGifts', {
                    gift: mongooseToObject(gift),
                    data: req.data,
                    data_admin: req.data?.admin,
                }),
            )
            .catch(next);
    }

    // [PUT] /gifts/:id
    update(req, res, next) {
        Gift.updateOne({ _id: req.params.id }, req.body)
            .then(() =>
                res.render('me/stored-gifts', {
                    data: req.data,
                    data_admin: req.data?.admin,
                }),
            )
            .catch(next);
    }

    // [DELETE] /gifts/:id
    destroy(req, res, next) {
        Gift.delete({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    // [DELETE] /gifts/:id/force
    forceDestroy(req, res, next) {
        Gift.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    // [PATCH] /gifts/:id/restore
    restore(req, res, next) {
        Gift.restore({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    // [POST] /gifts/handle-form-actions
    handleFormActions(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                Gift.delete({ _id: { $in: req.body.giftIds } })
                    .then(() => res.redirect('back'))
                    .catch(next);
                break;
            default:
                res.json({ message: 'Action is invalid' });
        }
    }

    // [GET] /gifts/my-gifts
    MyGifts(req, res, next) {
        Gift.find({ idAuthor: req.data._id })
            .then((gifts) =>
                res.render('gifts/myGifts', {
                    data: req.data,
                    data_admin: req.data?.admin,
                    gifts: multipleMongooseToObject(gifts),
                }),
            )
            .catch((err) => res.json(err));
    }

    getMyGifts(req, res, next) {
        var page = req.query.page;
        const searchedField = req.query.name;
        if (!searchedField) {
            if (page) {
                page = parseInt(page);
                if (page < 1) {
                    page = 1;
                }
                var soLuongBoQua = (page - 1) * PAGE_SIZE_2;

                Gift.find({ idAuthor: req.data._id })
                    .skip(soLuongBoQua)
                    .limit(PAGE_SIZE_2)
                    .then((gifts) => {
                        Gift.countDocuments({ idAuthor: req.data._id }).then(
                            (total) => {
                                var tongSoPage = Math.ceil(total / PAGE_SIZE_2);
                                res.json({
                                    total: total,
                                    tongSoPage: tongSoPage,
                                    data: req.data,
                                    data_admin: req.data?.admin,
                                    gifts: multipleMongooseToObject(gifts),
                                });
                            },
                        );
                    })
                    .catch((err) => res.status(500).json('Loi Server'));
            } else {
                Gift.find({ idAuthor: req.data._id })
                    .then((gifts) => {
                        Gift.countDocuments({ idAuthor: req.data._id }).then(
                            (total) => {
                                var tongSoPage = Math.ceil(total / PAGE_SIZE_2);
                                res.json({
                                    total: total,
                                    tongSoPage: tongSoPage,
                                    data: req.data,
                                    data_admin: req.data?.admin,
                                    gifts: multipleMongooseToObject(gifts),
                                });
                            },
                        );
                    })
                    .catch((err) => res.json(err));
            }
        }
        // Co du lieu search
        else {
            if (page) {
                page = parseInt(page);
                if (page < 1) {
                    page = 1;
                }
                var soLuongBoQua = (page - 1) * PAGE_SIZE_2;

                Gift.find({
                    name: { $regex: searchedField, $options: '$ui' },
                    idAuthor: req.data._id,
                })
                    .skip(soLuongBoQua)
                    .limit(PAGE_SIZE_2)
                    .then((gifts) => {
                        Gift.countDocuments({
                            name: { $regex: searchedField, $options: '$ui' },
                            idAuthor: req.data._id,
                        }).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE_2);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: req.data,
                                data_admin: req.data?.admin,
                                gifts: multipleMongooseToObject(gifts),
                            });
                        });
                    })
                    .catch((err) => res.status(500).json('Loi Server'));
            } else {
                Gift.find({
                    username: { $regex: searchedField, $options: '$ui' },
                    idAuthor: req.data._id,
                })
                    .then((gifts) => {
                        Gift.countDocuments({
                            name: { $regex: searchedField, $options: '$ui' },
                            idAuthor: req.data._id,
                        }).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE_2);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: req.data,
                                data_admin: req.data?.admin,
                                gifts: multipleMongooseToObject(gifts),
                            });
                        });
                    })
                    .catch((err) => res.json(err));
            }
        }
    }
}

module.exports = new GiftController();
