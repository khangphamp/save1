
import S from "joi"


const CreateBillSchema = S.object({
    params: S.string().required().description("string params url"),
    file: S.any(),

})

export const $ref = {
  CreateBillSchema
}

