const Leagues = require('../../database/entities/Leagues');
const PagedModel = require('../models/PagedModel');
const ResponseModel = require('../models/ResponseModel');
const { isValidObjectId, Types } = require('mongoose');

async function createLeague(req, res) {
    try {
        let league = new Leagues(req.body);
        league.createdTime = Date.now();
        let newLeague = await league.save();
        let response = new ResponseModel(1, 'Create league success!', newLeague);
        res.json(response);
    } catch (error) {
        let response = new ResponseModel(404, error.message, error);
        res.status(404).json(response);
    }
}

async function updateLeague(req, res) {
        try {
            let newLeague = { updatedTime: Date.now(), ...req.body };
            let updatedLeague = await Leagues.findOneAndUpdate({ _id: req.params.id }, newLeague);
            if (!updatedLeague) {
                let response = new ResponseModel(0, 'No item found!', null)
                res.json(response);
            }
            else {
                let response = new ResponseModel(1, 'Update league success!', newLeague)
                res.json(response);
            }
        }
        catch (error) {
            let response = new ResponseModel(404, error.message, error);
            res.status(404).json(response);
        }
}

async function deleteLeague(req, res) {
        if (isValidObjectId(req.params.id)) {
            try {
                let league = await Leagues.findByIdAndDelete(req.params.id);
                if (!league) {
                    let response = new ResponseModel(0, 'No item found!', null);
                    res.json(response);
                }
                else {
                    let response = new ResponseModel(1, 'Delete league success!', null);
                    res.json(response);
                }
            } catch (error) {
                let response = new ResponseModel(404, error.message, error)
                res.status(404).json(response);
            }
        }
        else {
            res.status(404).json(new ResponseModel(404, 'LeagueId is not valid!', null));
        }
}

async function getPagingLeagues(req, res) {
    let pageSize = req.query.pageSize || 10;
    let pageIndex = req.query.pageIndex || 1;

    let searchObj = {}
    if (req.query.isShow) {
        searchObj = {
            isShow: req.query.isShow
        }
    }
    let select = 'name refId order slug thumb';
    if(req.query.odd){
        select += ' contentOdd'
    }
    if(req.query.schedule){
        select += ' contentSchedule'
    }
    if(req.query.rank){
        select += ' contentRank'
    }
    if(req.query.result){
        select += ' contentResult'
    }
    console.log(select)
    try {
        let data = await Leagues
            .find(searchObj)
            .skip((pageSize * pageIndex) - pageSize)
            .limit(parseInt(pageSize))
            .select(select)
            .sort({
                order: 'asc'
            })


        let count = await Leagues.find(searchObj).countDocuments();
        let totalPages = Math.ceil(count / pageSize);
        let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, data);

        res.json(pagedModel);
    } catch (error) {
        let response = new ResponseModel(404, error.message, error);
        res.status(404).json(response);
    }
}

async function getLeagueById(req, res) {
    if (isValidObjectId(req.params.id)) {
        try {
            let league = await Leagues.findById(req.params.id)
            res.json(league);
        } catch (error) {
            res.status(404).json(404, error.message, error);
        }
    }
    else {
        res.status(404).json(new ResponseModel(404, 'LeagueId is not valid!', null));
    }
}
async function getLeagueBySlug(req, res) {
        try {
            let league = await Leagues.find({slug: req.params.slug})
            res.json(league);
        } catch (error) {
            res.status(404).json(404, error.message, error);
        }
}


module.exports = {
    createLeague,
    updateLeague,
    deleteLeague,
    getPagingLeagues,
    getLeagueById,
    getLeagueBySlug
}
