
import S from "joi"


const loginRequestSchema = S.object({
    username: S.string().required().description("Tên đăng nhập"),
    password: S.string().required().description("Mật khẩu"),
})

const registerRequestSchema = S.object({
    username: S.string().required().description("Tên đăng nhập"),
    password: S.string().required().description("Mật khẩu"),
})

export const $ref = {
    loginRequestSchema,
    registerRequestSchema
}

