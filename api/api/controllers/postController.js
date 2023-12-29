const { isValidObjectId } = require('mongoose');
const Categories = require('../../database/entities/Categories');
const Posts = require('../../database/entities/Posts');
const Tags = require('../../database/entities/Tags');
const PagedModel = require('../models/PagedModel');
const ResponseModel = require('../models/ResponseModel');
const fs = require('fs');
const RedisClient = require('../../utilities/redisClient');
async function createPost(req, res) {
    if (req.actions.includes('createPost')) {
        try {
            const p = await Posts.findOne({slug: req.body.slug});
            if(p){
                let response = new ResponseModel(404, "Tiêu dề or slug đã tồn tại" , null);
                return res.json(response);
            }
            let post = new Posts(req.body);
            post.createdTime = Date.now();
            await post.save((err, newPost) => {
                if (err) {
                    let response = new ResponseModel(-2, err.message, err);
                    res.json(response);
                }
                else {
                    let response = new ResponseModel(1, 'Create post success!', newPost);
                    res.json(response);
                }
            });
        } catch (error) {
            let response = new ResponseModel(404, error.message, error);
            res.status(404).json(response);
        }
    }
    else {
        res.sendStatus(403);
    }
}

async function updatePost(req, res) {
    if (req.actions.includes('updatePost')) {
        try {
            let newPost = { updatedTime: Date.now(), user: req.userId, ...req.body };
            let updatedPost = await Posts.findOneAndUpdate({ _id: req.params.id }, newPost);
            if (!updatedPost) {
                let response = new ResponseModel(0, 'No item found!', null)
                res.json(response);
            }
            else {
                let response = new ResponseModel(1, 'Update post success!', newPost)
                res.json(response);
            }
        }
        catch (error) {
            let response = new ResponseModel(404, error.message, error);
            res.status(404).json(response);
        }
    }
    else {
        res.sendStatus(403);
    }
}

async function deletePost(req, res) {
    if (req.actions.includes('deletePost')) {
        if (isValidObjectId(req.params.id)) {
            try {
                let post = await Posts.findByIdAndDelete(req.params.id);
                if (!post) {
                    let response = new ResponseModel(0, 'No item found!', null);
                    res.json(response);
                }
                else {
                    fs.rmSync(`public/images/${post.refId}`, { recursive: true, force: true });
                    let response = new ResponseModel(1, 'Delete post success!', null);
                    res.json(response);
                }
            } catch (error) {
                let response = new ResponseModel(404, error.message, error);
                res.status(404).json(response);
            }
        }
        else {
            res.status(404).json(new ResponseModel(404, 'PostId is not valid!', null));
        }
    }
    else {
        res.sendStatus(403);
    }
}

async function getPagingPosts(req, res) {
    let pageSize = req.query.pageSize || 10;
    let pageIndex = req.query.pageIndex || 1;

    let searchObj = { status: 1 }
    if (req.query.search && req.query.status) {
        searchObj = {
            status: 1,
            $or:
                [
                    { 'title': { $regex: req.query.search, $options: 'i' }  },
                    { 'slug': {$regex: req.query.search, $options: 'i' } },
                    { 'description': {$regex: req.query.search, $options: 'i' } },
                ]
        }
    }
    if (req.query.search || req.query.status) {
        if (req.query.search) {
            searchObj = {
                status: 1,
                $or:
                    [
                        { 'title': {$regex: req.query.search, $options: 'i' } },
                        { 'slug': {$regex: req.query.search, $options: 'i' } },
                        { 'description': {$regex: req.query.search, $options: 'i' } }
                    ]
            }
        }
        else {
            searchObj = {
                status: 1
            }
        }
    }
    if(req.query.isVideo){
        searchObj.isVideo = true
    }
    let sortObj = {}
    if(req.query.sortView){
        sortObj.numberOfReader = req.query.sortView
    }else {
        sortObj.createdTime =  'desc'
    }
    try {
        let posts = await Posts
            .find({...searchObj})
            .select('-content -ratingList')
            .skip((pageSize * pageIndex) - pageSize)
            .limit(parseInt(pageSize))
            .populate('tags')
            .populate([
                { path: "category", select: 'categoryName categorySlug' },
            ])
            .sort(sortObj)
        let count = await Posts.find(searchObj).countDocuments();
        let totalPages = Math.ceil(count / pageSize);
        let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, posts);

        res.json(pagedModel);

    } catch (error) {
        res.status(404).json(new ResponseModel(404, error.message, error));
    }
}

async function getPagingPostsV2(req, res) {
    let pageSize = req.query.pageSize || 10;
    let pageIndex = req.query.pageIndex || 1;

    let searchObj = {}
    if (req.query.status) {
        searchObj.status = req.query.status;
    }
    if (req.query.title) {
        searchObj.title = { $regex: '.*' + req.query.title + '.*' };
    }
    if (req.query.slug) {
        searchObj.slug = { $regex: '.*' + req.query.slug + '.*' };
    }
    if(req.query.description){
        searchObj.description = { $regex: '.*' + req.query.description + '.*' };
    }
    try {
        let posts = await Posts
            .find(searchObj)
            .skip((pageSize * pageIndex) - pageSize)
            .limit(parseInt(pageSize))
            .populate('tags')
            .populate('user')
            .populate([
                { path: "category", select: 'categoryName categorySlug' },
            ])
            .sort({
                createdTime: 'desc'
            });
        posts = posts.map((post) => {
            if (post.user) {
                post.user.password = '';
                return post;
            }
            else {
                return post
            }
        });
        let count = await Posts.find(searchObj).countDocuments();
        let totalPages = Math.ceil(count / pageSize);
        let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, posts);

        res.json(pagedModel);

    } catch (error) {
        res.status(404).json(new ResponseModel(404, error.message, error));
    }
}

async function getPostById(req, res) {
    if (isValidObjectId(req.params.id)) {
        try {
            let post = await Posts.findById(req.params.id)
                .populate('tags')
                // .populate('user')
                .populate('category');
            if (post) {
                // post.user.password = '';
                res.json(post);
            }
            else {
                res.status(404).json(new ResponseModel(404, 'Post was not found', null));
            }
        } catch (error) {
            res.status(404).json(new ResponseModel(404, error.message, error));
        }
    }
    else {
        res.status(404).json(new ResponseModel(404, 'PostId is not valid!', null));
    }
}

async function getPostBySlug(req, res) {
    let post = await Posts.findOneAndUpdate({ slug: req.params.slug }, {$inc : {numberOfReader : 1}})
        .select("-comment")
        .populate('tags')
        .populate([
            { path: "category", select: 'categoryName categorySlug' },
        ]);
    if (post) {
        const postNew = {...post._doc, countRating: post.ratingList.length}
        delete postNew.ratingList
        res.json(postNew);
    }
    else {
        res.status(404).json(404, 'Post was not found', null);
    }
}

async function getPostsByCategorySlug(req, res) {
    let pageSize = req.query.pageSize || 10;
    let pageIndex = req.query.pageIndex || 1;
    try {
        let key = 'posts-category';
        if (pageSize) {
          key += '-' + pageSize;
        }
        if (pageIndex) {
            key += '-' + pageIndex;
        }
        if (req.params.categorySlug) {
            key += '-' + req.params.categorySlug;
        }
        const resValue = await RedisClient.get(key);
        if (resValue) {
          return res.json(JSON.parse(resValue));
        }
    
        let searchObj ={}
        if(req.query.categoryIds){
            searchObj = {
                status: 1,
                category: {$in: req.query.categoryIds.split(",")}        
            }
        }else {
            const cate = await Categories.findOne({ categorySlug: req.params.categorySlug });
            if(cate){
                searchObj = {
                    status: 1,
                    category: cate._id
                }
            }else {
                return res.status(404).json(new ResponseModel(404, 'category was not found!', null))
            }
        } 
            Posts
                .find(searchObj)
                .skip((pageSize * pageIndex) - pageSize)
                .limit(parseInt(pageSize))
                .select('-content -ratingList')
                .populate('tags')
                .populate([
                    { path: "category", select: 'categoryName categorySlug' },
                ])
                .sort({
                    createdTime: 'desc'
                })
                .exec((error, posts) => {
                    if (error) {
                        res.status(404).json(new ResponseModel(404, error.message, error));
                    }
                    else {
                        posts = posts.map((post) => {
                            if (post.user != undefined && post.user != null && post.user != '') {
                                post.user.password = '';
                                return post;
                            }
                            else {
                                return post
                            }
                        });
                        Posts.find(searchObj).countDocuments( async(error, count) => {
                            if (error) {
                                res.status(404).json(new ResponseModel(404, error.message, error));
                            }
                            else {
                                let totalPages = Math.ceil(count / pageSize);
                                let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, posts);
                                await RedisClient.set(key, JSON.stringify(pagedModel), {
                                    EX: 360,
                                    NX: true,
                                  });
                                res.json(pagedModel);
                            }
                        });
                    }
                });
    } catch (error) {
        res.status(404).json(new ResponseModel(404, error?.message, null))
    }

    
}

async function getPostsByTagSlug(req, res) {
    let pageSize = req.query.pageSize || 10;
    let pageIndex = req.query.pageIndex || 1;

    Tags.findOne({ tagSlug: req.params.tagSlug }, (error, tag) => {
        if (error) {
            res.status(404).json(new ResponseModel(404, error.message, error))
        }
        else {
            if (tag) {
                let searchObj = {
                    status: 1,
                    tags: tag._id
                }

                if (req.query.search) {
                    searchObj = {
                        status: 1,
                        tags: tag._id,
                        title: { $regex: '.*' + req.query.search + '.*' }
                    }
                }
                Posts
                    .find(searchObj)
                    .skip((pageSize * pageIndex) - pageSize)
                    .limit(parseInt(pageSize))
                    .select('-content -comment -ratingList')
                    .populate('tags')
                    .populate([
                        { path: "category", select: 'categoryName categorySlug' },
                    ])
                    .sort({
                        createdTime: 'desc'
                    })
                    .exec((err, posts) => {
                        if (err) {
                            let response = new ResponseModel(-99, err.message, err);
                            res.status(404).json(response);
                        }
                        else {
                            Posts.find(searchObj).countDocuments((err, count) => {
                                if (err) {
                                    let response = new ResponseModel(-99, err.message, err);
                                    res.json(response);
                                }
                                else {
                                    let totalPages = Math.ceil(count / pageSize);
                                    let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, posts);
                                    res.json(pagedModel);
                                }
                            });
                        }
                    });
            }
            else {
                res.status(404).json(new ResponseModel(404, 'Tag was not found!', null))
            }
        }
    });
}

async function getRelativePosts(req, res) {
    try {
        let posts = await Posts.find({ _id: { $ne: req.params.postId }, category: req.query.category, status: 1})
            .limit(req.query.limit ?? 10)
            .sort({
                createdTime: 'desc'
            })
        res.json(posts);
    } catch (error) {
        res.status(404).json(new ResponseModel(404, error.message, error));
    }
}
async function upload(req, res) {
    try {        
        let filename =req.file.filename;
        res.status(200).json({ status: 'success' , data: { url: filename} });
    } catch (error) {
        res.status(404).json(new ResponseModel(404, error.message, error));
    }
}
async function deleteImages () {
    try {
        const posts = await Posts.find({});
        if(posts){
            const refIds = posts.map(post => post.refId)
            fs.readdir('public/images', (err, files) => {
                files?.forEach(file => {
                  if(!refIds.includes(file) && file != "common"){
                     fs.rmSync(`public/images/${file}`,  { recursive: true });
                  }
                });
              });
        }
        
    } catch (error) {
        res.status(404).json(new ResponseModel(404, error.message, error));
    }
}
async function getCommentById(req, res) {
	try {
		const post = await Posts.findOne({ _id: req.params.id }).select("comment")
        post.comment.sort((a, b) => a.createdAt > b.createdAt ? -1 : 1);
		res.json(post.comment);
    }catch (error) {
		const response = new ResponseModel("error", "Có lỗi xảy ra, vui lòng thử lại", err);
		res.json(response);
    }
}
async function createComment(req, res) {
	try {
		const { comment, name } = req.body;
		const post = await Posts.findOne({ _id: req.params.id }).select("comment")


		if (!post) {
			const response = new ResponseModel("error", "Bài viết không được tìm thấy", []);
			return res.json(response);
		}

		const review = {
			comment,
			name
		}

		post.comment.push(review);
		await post.save();
        post.comment.sort((a, b) => a.createdAt > b.createdAt ? -1 : 1);
		const response = new ResponseModel("success", "Bình luận đã được thêm", post.comment);
		res.json(response);
	} catch (err) {
		res.status(404).json(new ResponseModel(404, err.message, err));
	}
}

async function createRating(req, res) {
	try {
        const { rating } = req.body;
		const post = await Posts.findById({ _id: req.params.id }).select("ratingList ratingValue");
        post.ratingList.push(rating);
        const length = post.ratingList.length;
        const average = (post.ratingList.reduce((a, b) => a + b, 0) / length).toFixed(1);
        post.ratingValue = average;
        await post.save();
        const response = new ResponseModel("success", "Rating thành công", {countRating: length, ratingValue: post.ratingValue});
		res.json(response);
    }catch (err) {
        res.status(404).json(new ResponseModel(404, err.message, err));
    }
}
module.exports = {
    createPost,
    createComment,
    createRating,
    upload,
    updatePost,
    deletePost,
    getPagingPosts,
    getPagingPostsV2,
    getPostById,
    getCommentById,
    getPostBySlug,
    getPostsByCategorySlug,
    getPostsByTagSlug,
    getRelativePosts,
    deleteImages
}