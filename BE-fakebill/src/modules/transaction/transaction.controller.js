import Transactions from "../../models/Transactions.js"
import Users from "../../models/User.js"

async function createTransaction(request, reply) {
    try {
        const { type, money } = request.body;
        const { _id: userId } = request.user.sub;
        const u = await Users.findById(userId);
        if(!u){
            return reply.notFound('Người dùng không tìm thấy')
        }
        const transaction = await Transactions.create({user: userId, type, money});
        return reply.send({
            success: 1,
            data: transaction
        })
    }
    catch (err) {
        return reply.code(500).send({message: err.message})
    }
}
async function updateSuccessTransaction(request, reply) {
    try {
        const transaction = await Transactions.findOneAndUpdate({_id: request.params.id, status: 0}, {status: 1}, {new: true})
        if(!transaction){
            return reply.notFound("giao dịch không tìm thấy hoặc đã nạp thành công")
        }
        await Users.findByIdAndUpdate(transaction.user, {$inc : {'money' : Number(transaction.money)}})
        return reply.send({
            success: 1,
            data: transaction
        })
    }
    catch (err) {
        return reply.code(500).send({message: err.message})
    }
}
export default {
    createTransaction,
    updateSuccessTransaction
}