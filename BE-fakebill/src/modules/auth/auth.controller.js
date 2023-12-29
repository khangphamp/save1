import User from "../../models/User.js"
import { generateHash } from "../../helpers/helpers.js";
const { fastify } = global
async function loginHandler(request, reply) {
    try {
        const { username, password } = request.body;
        const user = await User.findOne({ username }).select("username password role")
        if (!user) {
            return reply.unauthorized("Tên đăng nhập hoặc mật khẩu không chính xác")
        }
        let validPassword = false
        if (user.comparePassword(password)) {
            validPassword = true;
        }
        if (!validPassword) {
            return reply.unauthorized("Tên đăng nhập hoặc mật khẩu không chính xác")
        }
        const { password: p, oneTimePassword: op, ...tokenSign } = user._doc;
        const token = fastify.jwt.sign({ sub: tokenSign })
        return reply.send({
            success: 1,
            token
        })
    }
    catch (err) {
        console.log(err)
    }
}

async function registerHandler(request, reply) {
    try {
        const { username, password } = request.body;
        const user = await User.findOne({ username });
        if (user) {
            return reply.notAcceptable("Tên đăng nhập đã tồn tại")
        }
        await User.create({ username: username, password: generateHash(password), role: 1})
        return reply.send({
            success: 1,
            message: "Đăng kí thành công"
        })
    }
    catch (err) {
        console.log(err)
    }
}
export default {
    loginHandler,
    registerHandler
}