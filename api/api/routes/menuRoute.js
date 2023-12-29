const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const middlewares = require('./middlewares');

router.post('/insert', middlewares.authorize, menuController.createMenu);
router.put('/update/:id', middlewares.authorize, menuController.updateMenu);
router.delete('/delete/:id', middlewares.authorize, menuController.deleteMenu);
router.get('/getById/:id', menuController.getMenuById);
router.get('/getBySlug/:slug', menuController.getMenuBySlug);
router.get('/getPaging', menuController.getPagingMenus);
router.get('/getAll', menuController.getAllMenus);

module.exports = router;