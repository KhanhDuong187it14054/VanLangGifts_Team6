const express = require('express');
const router = express.Router();

const giftController = require('../app/controllers/GiftController');
const middlewareController = require('../app/controllers/MiddlewareController');
const store = require('../app/controllers/Multer');

const Gift = require('../app/models/Gift');

const { uploadFile, getFileStream } = require('../app/controllers/s3');

//show my gifts
router.get(
    '/my-gifts',
    middlewareController.verifyToken,
    giftController.MyGifts,
);
router.get(
    '/get-my-gifts',
    middlewareController.verifyToken,
    giftController.getMyGifts,
);
router.get(
    '/show-stored-gifts',
    middlewareController.verifyToken,
    giftController.showStoredGifts,
);

router.get('/get-all', middlewareController.verifyToken, giftController.getAll);
router.get(
    '/show-all',
    middlewareController.verifyToken,
    giftController.showAll,
);
router.post('/search', middlewareController.verifyToken, giftController.search);

// Create Gift
router.get('/create', middlewareController.verifyToken, giftController.create);

// router.post(
//     '/store',
//     middlewareController.verifyToken,
//     store.array('images', 3),
//     giftController.store,
// );

router.get('/images/images-1650545116995.jpg', (req, res) => {
    const key = 'images-1650545116995.jpg';
    const readStream = getFileStream(key);
    readStream.pipe(res);
    // res.json(readStream);
});

router.post(
    '/store',
    middlewareController.verifyToken,
    store.array('images', 3),
    async (req, res) => {
        try {
            const files = req.files;
            console.log('multer ', files);
            const results = await uploadFile(files);
            console.log('results', results);
            res.json(results);
            // const arrayKey = [];
            // results.map((res) => arrayKey.push(res.Key));
            // console.log('arrayKey', arrayKey);

            // const idAuthor = req.data._id;
            // const image = [req.body.image, req.body.image1, req.body.image2];

            // const gift = await new Gift({
            //     name: req.body.name,
            //     description: req.body.description,
            //     image: image,
            //     fileImages: arrayKey,
            //     author: req.body.author,
            //     idAuthor: idAuthor,
            // });
            // gift.save().then(() => res.redirect('/homepage'));
        } catch (err) {
            res.status(500).json(err);
        }
    },
);

router.get('/:id/edit', middlewareController.verifyToken, giftController.edit);
router.post('/handle-form-actions', giftController.handleFormActions);

router.put('/:id', middlewareController.verifyToken, giftController.update);
router.patch('/:id/restore', giftController.restore);
router.delete('/:id', giftController.destroy);
router.delete('/:id/force', giftController.forceDestroy);

// Show detail gift
router.get('/:slug', middlewareController.verifyToken, giftController.show);

module.exports = router;
