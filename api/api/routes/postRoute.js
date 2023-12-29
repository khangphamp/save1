const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const middlewares = require('./middlewares');
const fs = require('fs');
const multer = require('multer');
const { preventMultipleCalls } = require('../../utilities/preventMultipleCalls');
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if(fs.existsSync(`public/images/${req.body.refId}`)){
      cb(null, `public/images/${req.body.refId}`);
    }else {
      fs.mkdir(`public/images/${req.body.refId}`, (err) => {
        if (err) {
            return console.error(err);
        }
        console.log('Directory created successfully!');
        cb(null, `public/images/${req.body.refId}`);
      });
    }
   
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.originalname
    );
  },
});

let upload = multer({
  storage: storage,
});
let uploadFile = upload.single("file");




router.post('/insert', middlewares.authorize, postController.createPost);
router.post('/createComment/:id', preventMultipleCalls,  postController.createComment);
router.post('/createRating/:id', postController.createRating);
router.post('/upload', middlewares.authorize, uploadFile, postController.upload);
router.put('/update/:id', middlewares.authorize, postController.updatePost);
router.delete('/delete/:id', middlewares.authorize, postController.deletePost);
router.get('/getById/:id', postController.getPostById);
router.get('/getCommentById/:id', postController.getCommentById);
router.get('/getBySlug/:slug', postController.getPostBySlug);
router.get('/getPaging', postController.getPagingPosts);
router.get('/getPagingV2', postController.getPagingPostsV2);
router.get('/getByCategorySlug/:categorySlug', postController.getPostsByCategorySlug);
router.get('/getByTagSlug/:tagSlug', postController.getPostsByTagSlug);
router.get('/getReletivePosts/:postId', postController.getRelativePosts);

module.exports = router;