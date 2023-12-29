

import { $ref } from "./bill.schema.js"
import billController from "./bill.controller.js"

export const autoPrefix = "api/bill";
export default async function (fastify, opts, done) {
    fastify.post("/create/:id", {
        schema: {
            tags: ["User"],
            description: "Mua bill",
            body: $ref['CreateBillSchema']
        },
        preHandler: [fastify.guard.role([1,2])],
    }, billController.createBill);;
    
}
