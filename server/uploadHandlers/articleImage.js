const multer = require("multer");

var articleImageStorage = multer.diskStorage({
    destination: function (req, file, cb)
    {
      cb(null, './uploads/article-images');
    },
    filename: function (req, file, cb)
    {
      cb(null, file.fieldname + '-' + Date.now() + "-" + file.originalname );
    }
});

module.exports = multer({ storage: articleImageStorage });