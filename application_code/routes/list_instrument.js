const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Instrument = require('../db').Instrument;
const InstrumentListing = require('../db').InstrumentListing;

const storage = multer.diskStorage({
    destination: './public/uploads/instruments',
    filename: function (req, file, cb) {
        cb(null, req.user._id + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
}).array('instrument_pictures', 3); // requiring at least three pictures


function checkType(file, cb) {
    const permitted = /jpeg|jpg|png|gif/;
    const ext = permitted.test(path.extname(file.originalname).toLowerCase());
    const mimetype = permitted.test(file.mimetype);

    if (ext && mimetype) {
        return cb(null, true);
    } else {
        cb("Images Only!");
    }
}

// authenticated view
router.get('/instrument_list', function (req, res) {
    if (req.user) {
      res.render('list_instrument', {  });
      console.log("LIST INSTRUMENT RENDERED");
    }
    else res.redirect('/failure');
});

// something happening here
router.post('/list_instrument', function (req, res) {
    upload(req, res, (err) => {
        if (err) console.log(err);
        else {
            // gathering necessary info and creating an instrument model.
            let pictures = req.files.map( ele => {
                return ele.filename;
            });
            // error checking
            // checking if at least three pictures are included.
            if (pictures.length < 3) {
                res.render('list_instrument', {error: "You need to select at least 3 images"})
            }
            // check for empty field in the form
            if (req.body.name === "" || req.body.category === "" || req.body.weight === "" ||
            req.body.rental_price === "" || req.body.purchase_price === "" || req.body.description === "") {
                res.render('list_instrument', {error : "All fields must be filled out"});
            }

            // creating the instrument model and saving it to database.
            const newInstrument = new Instrument({
                name: req.body.name,
                category: req.body.category,
                weight: req.body.weight,
                pictures: pictures,
                description: req.body.description,
                rentalPrice: req.body.rental_price,
                purchasePrice: req.body.purchase_price
            });

            newInstrument.save()
                .then(instrument => {
                    console.log("new instrument created");
                    console.log(instrument);
                    // creating a model for Instrumentlisting
                    const newInstrumentListing = new InstrumentListing({
                        instrumentId: instrument._id.toString(),
                        sellerId: req.user._id.toString()
                    });

                    // saving the entry in the database.
                    newInstrumentListing.save()
                        .then(listing => {
                            console.log("listing created");
                            console.log(listing);
                            res.redirect('/seller_portal');
                        })
                        .catch(err=> {
                            console.log(err);
                        });

                })
                .catch( err => {
                    console.log(err);
                });
        }
    });

});

module.exports = router;
