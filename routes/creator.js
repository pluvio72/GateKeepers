const express = require('express');
const creator = require('../client/src/models/creator');
const creatorPost = require('../client/src/models/creatorPost');
const creatorProduct = require('../client/src/models/creatorProduct');
var router = express.Router();

router.get('/all-posts', (req, res, next) => {
    creatorPost.find({}).populate('creator', 'links tag -_id').select('-_id ').exec((err, docs) => {
        if(err) return res.status(400).json(err);
        else return res.json(docs);
    })
});

router.get('/products/own/:creatorTag', (req, res, next) => {
    creatorProduct.find({type: "own"}).populate({
        path: 'creator',
        select: '-_id',
        match: { tag: req.params.creatorTag }
    }).select('-_id name price images imageOrder uri dateToPost count').exec((err, docs) => {
        // filter resulting docs because with populate if there is no match the creator
        // field is empty but still returns doc
        if(err) return res.status(400).json(err);
        var products = docs.filter((a) => a.creator);
        if(products.length > 0) return res.json({ products, success: true });
        else return res.json({ success: false });
    })
});

router.get('/products/made/:creatorTag', (req, res, next) => {
    creatorProduct.find({type: "made"}).populate({
        path: 'creator',
        select: '-_id',
        match: { tag: req.params.creatorTag }
    }).select('-_id name price images imageOrder uri dateToPost count').exec((err, docs) => {
        if(err) return res.status(400).json(err);
        var products = docs.filter((a) => a.creator);
        if(products.length > 0) return res.json({ products, success: true });
        else return res.json({ success: false });
    })
});

router.get('/products/:productURI', (req, res, next) => {
    creatorProduct.findOne({ uri: req.params.productURI }).populate('creator', 'tag').then((product, err) => {
        if(err) return res.json({ success: false });
        if(product) return res.json({ success: true, product });
        else return res.json({ success: false });
    })
})

router.get('/all-creators', (req, res, next) => {
    creator.find({}).select('-_id').then((creators, err) => {
        if(err) return res.status(400).json(err);
        else return res.json(creators);
    })
});

router.get('/:creatorTag', (req, res, next) => {
    var username = req.params.creatorTag;

    creator.findOne({ tag: username }).select('-_id name').then((user, err) => {
        if(err) return res.json({ success: false });
        else return res.json({ success: true, user });
    })
})

module.exports = router;