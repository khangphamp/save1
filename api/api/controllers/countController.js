const Counts = require('../../database/entities/Counts');
const ResponseModel = require('../models/ResponseModel');

async function countClickLive(req, res) {
    const currentDateTimestamp = new Date().getTime();
    try {
        const count = await Counts.findOne({
            createdAt: {
              $gte: new Date(currentDateTimestamp).setHours(0, 0, 0, 0),
              $lt: new Date(currentDateTimestamp).setHours(23, 59, 59, 999)
            }
          })
        if(count){
            count.count = count.count + 1;
            await count.save();

        }else{
            await Counts.create({ count: 1});
        }
        res.status(200).json({});
    } catch (error) {
        let response = new ResponseModel(404, error.message, error);
        res.status(404).json(response);
    }
}
async function getCountClickLive(req, res) {
    try {
        const data = await Counts.find({});
        res.status(200).json(data);
    } catch (error) {
        let response = new ResponseModel(404, error.message, error);
        res.status(404).json(response);
    }
}
module.exports = {
    countClickLive,
    getCountClickLive
}