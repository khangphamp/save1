

import { $ref } from "./auth.schema.js"
import authController from "./auth.controller.js"

export const autoPrefix = "api/auth";
export default async function (fastify, opts, done) {
    fastify.post("/login", {
        schema: {
            tags: ["User", "Admin"],
            description: "Đăng nhập admin, người dùng",
            body: $ref['loginRequestSchema']
        },
    }, authController.loginHandler);

    fastify.post("/register", {
        schema: {
            tags: ["Đại lý", "Admin"],
            description: "Đăng ký người dùng",
            body: $ref['registerRequestSchema']
        },
    }, authController.registerHandler);
    
}
