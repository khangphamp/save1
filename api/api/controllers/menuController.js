const Menus = require('../../database/entities/Menus');
const PagedModel = require('../models/PagedModel');
const ResponseModel = require('../models/ResponseModel');
const { isValidObjectId, Types } = require('mongoose');
const RedisClient = require('../../utilities/redisClient');
async function createMenu(req, res) {
    if (req.actions.includes('createMenu')) {
        try {
            let menu = new Menus(req.body);
            menu.createdTime = Date.now();
            menu.user = req.userId;
            let newMenu = await menu.save();
            let response = new ResponseModel(1, 'Create menu success!', newMenu);
            res.json(response);
        } catch (error) {
            let response = new ResponseModel(404, error.message, error);
            res.status(404).json(response);
        }
    }
    else {
        res.sendStatus(403);
    }
}

async function updateMenu(req, res) {
    if (req.actions.includes('updateMenu')) {
        try {
            let newMenu = { updatedTime: Date.now(), user: req.userId, ...req.body };
            let updatedMenu = await Menus.findOneAndUpdate({ _id: req.params.id }, newMenu);
            if (!updatedMenu) {
                let response = new ResponseModel(0, 'No item found!', null)
                res.json(response);
            }
            else {
                let response = new ResponseModel(1, 'Update menu success!', newMenu)
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

async function deleteMenu(req, res) {
    if (req.actions.includes('deleteMenu')) {
        if (isValidObjectId(req.params.id)) {
            try {
                let menu = await Menus.findByIdAndDelete(req.params.id);
                if (!menu) {
                    let response = new ResponseModel(0, 'No item found!', null);
                    res.json(response);
                }
                else {
                    let response = new ResponseModel(1, 'Delete menu success!', null);
                    res.json(response);
                }
            } catch (error) {
                let response = new ResponseModel(404, error.message, error)
                res.status(404).json(response);
            }
        }
        else {
            res.status(404).json(new ResponseModel(404, 'MenuId is not valid!', null));
        }
    }
    else {
        res.sendStatus(403);
    }
}

async function getPagingMenus(req, res) {
    let pageSize = req.query.pageSize || 10;
    let pageIndex = req.query.pageIndex || 1;

    let searchObj = {}
    if (req.query.isShow) {
        searchObj = {
            isShow: req.query.isShow
        }
    }
    if (req.query.type) {
        searchObj.type = req.query.type

    }
    try {
        let menus = await Menus
            .find(searchObj)
            .skip((pageSize * pageIndex) - pageSize)
            .limit(parseInt(pageSize))
            .populate([
                { path: "representCategory", select: '-content' },
                { path: "children"}
            ])
            .sort({
                menuOrder: 'asc'
            })


        let count = await Menus.find(searchObj).countDocuments();
        let totalPages = Math.ceil(count / pageSize);
        let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, menus);

        res.json(pagedModel);
    } catch (error) {
        let response = new ResponseModel(404, error.message, error);
        res.status(404).json(response);
    }
}

async function getMenuById(req, res) {
    if (isValidObjectId(req.params.id)) {
        try {
            let menu = await Menus.findById(req.params.id);
            res.json(menu);
        } catch (error) {
            res.status(404).json(404, error.message, error);
        }
    }
    else {
        res.status(404).json(new ResponseModel(404, 'MenuId is not valid!', null));
    }
}
async function getMenuBySlug(req, res) {
    if (isValidObjectId(req.params.id)) {
        try {
            let menu = await Menus.find({slug: req.params.slug})
            res.json(menu);
        } catch (error) {
            res.status(404).json(404, error.message, error);
        }
    }
    else {
        res.status(404).json(new ResponseModel(404, 'MenuId is not valid!', null));
    }
}
async function getAllMenus(req, res) {
    try {
        let key = 'allMenus';
        const resValue = await RedisClient.get(key);
        if (resValue) {
            return res.json(JSON.parse(resValue));
        }
        let searchObj = {}
        if (req.query.isShow) {
            searchObj = {
                isShow: req.query.isShow
            }
        }
        if (req.query.type) {
            searchObj.type = req.query.type
    
        }
        let allMenus = await Menus
        .find(searchObj)
        .select('-content')
        .populate([
            { path: "representCategory", select: '-content' },
            { path: "children"}
        ])
        .sort({
            menuOrder: 'asc'
        })
        let newMenus = allMenus.map((menu) => {
            let children = allMenus.filter((x) => {
                if (x.parent) {
                    if (x.parent.equals(menu._id)) {
                        return true;
                    }
                }
            });
            if (children) {
                menu.children = children;
                return menu;
            }
        })
        let menus = newMenus.filter(x => x.parent === null || x.parent === '')
        RedisClient.set(key, JSON.stringify(menus), {
            EX: 360,
            NX: true,
        });
    
        res.json(menus);
    }catch(err) {
        console.log(err);
    }
  
}

module.exports = {
    createMenu,
    updateMenu,
    deleteMenu,
    getPagingMenus,
    getMenuById,
    getAllMenus,
    getMenuBySlug
}