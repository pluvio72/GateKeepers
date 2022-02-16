const express = require('express');
const fs = require('fs');
var router = express.Router();
const Creator = require('../client/src/models/creator');
const CreatorProduct = require('../client/src/models/creatorProduct');
const User = require('../client/src/models/user');
const Order = require('../client/src/models/order');
var { gatekeeperCheck } = require('../middleware/auth');

var multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if(file.fieldname == "creatorImage") cb(null, './client/public/images/');
        else cb(null, './client/public/images/products/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = '-' + Date.now() + '-' + Math.round(Math.random()*1E9)+'.';
        console.log(file);
        cb(null, file.fieldname+uniqueSuffix+(file.mimetype.split('/')[1]));
    }
})
var upload = multer({ storage: storage });



router.post('/orders', gatekeeperCheck, async (req, res, next) => {
    var creatorUsername = req.body.username;
    try {
        var orders = await Order.find({ creators: { $in: creatorUsername }});
        if(orders) {
            return res.json({ success: true, orders: orders.map((order, index) => {
                return {
                    id: order._id,
                    sent: order.sent,
                    address: order.address,
                    user: order.user,
                    total: order.total,
                    date: order.date,
                    items: order.items
                }
            })})
        } else { return res.json({ success: true, orders: null })}
    } catch(err) {
        return res.json({ success: false });
    }
})

router.post('/orders/mark-sent', gatekeeperCheck, async (req, res, next) => {
    try {
        var updated = await Order.updateOne({ _id: req.body.orderID }, {$set: { sent: true }});
        if(updated.modifiedCount > 0) return res.json({ success: true });
        else return res.json({ success: false });
    } catch(err) {
        return res.json ({ success: false });
    }
})

router.post('/products/add', upload.array('images'), gatekeeperCheck, (req, res, next) => {
    var creatorUsername = req.body.username;
    var imageNameList = [];

    for(var i = 0; i < req.files.length; i++){
        imageNameList.push(req.files[i].filename)
    }
    var sizes = req.body.sizes.replace(`'`, '').split(',').filter((e) => e.trim());
    console.log(req.body);
    Creator.findOne({ tag: creatorUsername }).then((user, err) => {
        var newProduct = new CreatorProduct({
            creator: user._id,
            name: req.body.name,
            description: req.body.description,
            uri: req.body.uri,
            price: req.body.price,
            count: parseInt(req.body.count),
            images: imageNameList,
            type: req.body.type,
            dateToPost: req.body.dateToPost,
            sizes: sizes,
            customSize: req.body.customSizeAccept,
            imageOrder: req.body.imageOrder.split(",")
        });
        newProduct.save((err) => {
            if(err) return res.json({ success: false });
            else return res.json({ success: true });
        })
    })
})

router.post('/products/remove', gatekeeperCheck, (req, res, next) => {
    var productID = req.body.productID;
    CreatorProduct.findOne({ _id: productID }).then((product, err) => {
        if(err) return res.json({ success: false });
        for(var i = 0; i < product.images.length; i++){
            fs.unlink(`./client/public/images/products/${product.images[i]}`, (err) => {
                if(err) console.log(err);
            })
        }
        CreatorProduct.deleteOne({ _id: productID }).then((deleted, err) => {
            if(err) return res.json({ success: false });
            else return res.json({ success: true });
        })
    })
})

router.post('/products/update', upload.array('images'), gatekeeperCheck, (req, res, next) => {
    var fileNames = [];
    var productID = req.body.productID;
    var imagesChanged = req.body.imagesChanged == 'true';
    var imagesCleared = req.body.imagesCleared == 'true';
    var originalImages = [];

    var sizes = req.body.sizes.replace(`'`, '').split(',').filter((e) => e.trim());

    CreatorProduct.findOne({ _id: productID }, (err, product) => {
        if(err) return res.json({ success: false });
        originalImages = product.images;
        if(imagesChanged){
            for(var i = 0; i < req.files.length; i++){
                fileNames.push(req.files[i].filename)
            }
            if(imagesCleared){
                // remove old product images
                for(var i = 0; i < product.images.length; i++){
                    fs.unlink(`./client/public/images/products/${product.images[i]}`, function(err) {
                        if(err) console.log('Err removing old product images');
                    });
                }
            } else originalImages = originalImages.concat(fileNames);
        }

        CreatorProduct.findOneAndUpdate({ _id: productID }, {
            $set: {
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                count: req.body.count,
                images: (imagesChanged && imagesCleared) ? fileNames : originalImages,
                type: req.body.type,
                sizes: sizes,
                dateToPost: req.body.dateToPost,
                customSize: req.body.customSize,
                imageOrder: req.body.imageOrder.split(",")
            }
        }, (err, docs) => {
            if(err) return res.json({ success: false });
            else return res.json({ success: true });
        })
    })
})

router.post('/products/:productID', gatekeeperCheck, (req, res, next) => {
    var username = req.body.username;
    var productID = req.params.productID;

    Creator.findOne({ tag: username }).then((user, err) => {
        if(err) return res.json({ success: false });
        CreatorProduct.findOne({ creator: user._id, _id: productID }).then((docs, err) => {
            if(err) return res.json({ success: false });
            else {
                return res.json({ success: true, product: docs});
            }
        })
    })
})

router.post('/products/all/:creatorTag', gatekeeperCheck, (req, res, next) => {
    var tag = req.params.creatorTag;
    Creator.findOne({ tag: tag }).then((user, err) => {
        if(err) return res.json({ success: false });
        CreatorProduct.find({ creator: user._id }).then((docs, err) => {
            if(err) return res.json({ success: false });
            else {
                return res.json({ success: true, products: docs });
            }
        })
    })
})

router.post('/:creatorTag', gatekeeperCheck, (req, res, next) => {
    var username = req.params.creatorTag;
    Creator.findOne({ tag: username }).then((user, err) => {
        if(err) return res.json({ success: false });
        if(user) return res.json({ success: true, user });
        else return res.json({ success: false });
    })
})

router.post('/update/:creatorTag', upload.single('creatorImage'), gatekeeperCheck, (req, res, next) => {
    var username = req.params.creatorTag;
    if(req.file){
        Creator.findOne({tag: username }).then((doc,err) => {
            if(doc.image){
                fs.unlink(`./client/public/images/${doc.image}`, function(err) {
                    if(err) console.log('Err removing old product images');
                    console.log(req.file);
                    Creator.findOneAndUpdate({ tag: username }, { $set: {
                        image: req.file.filename
                    }}).then((doc2, err2) => {
                        console.log(err2);
                        console.log(doc2);
                    })
                });
            }
        })
    }
    Creator.findOneAndUpdate({ tag: username }, { $set: {
        links: {
            instagram: req.body.instagramLink ? req.body.instagramLink : '',
            tiktok: req.body.tiktokLink ? req.body.tiktokLink : '',
            twitter: req.body.twitterLink ? req.body.twitterLink : '',
            twitch: req.body.twitchLink ? req.body.twitchLink : ''
        },
        shippingDetails: JSON.parse(req.body.shippingDetails),
        name: req.body.name ? req.body.name : '',
        email: req.body.email ? req.body.email : ''
    }}).then((doc, err) => {
        User.findOneAndUpdate({ username: username }, {
            $set: { email: req.body.email ? req.body.email : '' }
        }).then((doc, err) => {
            if(err) return res.json({ success: false });
            if(req.body.password){
                User.findOneAndUpdate({ username: username }, {
                    $set: { 
                        password: User.encryptPassword(req.body.password),
                    }
                }).then((doc, err) => {
                    if(err) return res.json({ success: false });
                    else return res.json({ success: true });
                })
            } else {
                if(err) return res.json({ success: false });
                else return res.json({ success: true });
            }
            return res.json({ success: true });
        })
    })
})

module.exports = router;