const multer = require('multer');

// set storage
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads');
        if (!file) {
            const error = new Error('Please choose files');
            error.httpStatusCode = 400;
            return next(error);
        }
    },
    filename: function (req, file, cb) {
        // image.jpg
        // console.log("Anh tu multer", file)

        var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));

        cb(null, file.fieldname + '-' + Date.now() + ext);
    },
});

module.exports = store = multer({ storage: storage });
