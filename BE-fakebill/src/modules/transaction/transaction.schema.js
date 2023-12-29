
import S from "joi"


const CreateTransactionSchema = S.object({
    type: S.string().description("Loại giao dịch"),
    money: S.number().required().description("Số tiền giao dịch"),

})

const UpdateSuccessTransactionSchema = S.object({
    status: S.number().valid(-1,0,1).required().description("Trạng thái"),
})
export const $ref = {
    CreateTransactionSchema,
    UpdateSuccessTransactionSchema
}

