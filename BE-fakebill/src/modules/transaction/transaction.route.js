

import { $ref } from "./transaction.schema.js"
import transactionController from "./transaction.controller.js"

export const autoPrefix = "api/transaction";
export default async function (fastify, opts, done) {
    fastify.post("/create", {
        schema: {
            tags: ["User"],
            description: "Tạo giao dịch người dùng",
            body: $ref['CreateTransactionSchema']
        },
        preHandler: [fastify.guard.role([1])],
    }, transactionController.createTransaction);
    fastify.post("/update-success/:id", {
        schema: {
            tags: ["User"],
            description: "Update giao dịch người dùng đã thành công",
        },
        preHandler: [fastify.guard.role([1])],
    }, transactionController.updateSuccessTransaction);
    
}
