const Gift = require('../models/Gift');
const { multipleMongooseToObject } = require('../../util/mongoose');
class SiteController {
    // [GET] /
    index(req, res, next) {
        Gift.find({})
            .skip(0)
            .limit(9)
            .then((gifts) => {
                console.log('Giftsssss', gifts);
                res.render('home', {
                    gifts: multipleMongooseToObject(gifts),
                    data: req.data,
                    data_admin: req.data?.admin,
                });
                console.log(req.data);
            })
            .catch(next);
        // res.render('home');
    }

    intro(req, res, next) {
        res.render('news/introduce', {
            data: req.data,
            data_admin: req.data?.admin,
        });
    }
}

module.exports = new SiteController();
