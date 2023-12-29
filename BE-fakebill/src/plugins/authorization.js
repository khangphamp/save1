import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import User from "../models/User.js";

async function jwtAuthorization(fastify, opts, done) {
  fastify.register(fastifyJwt, {
    secret: fastify.config.TOKEN,
  });

  fastify.decorate("guard", {
    role: (roles, permissions = []) => async (request, reply) => {
      try {
        await request.jwtVerify();
        const { sub } = request.user
        console.log(sub)
        const user = await User.findById(sub._id).lean();
        if (user && ((Array.isArray(roles) && roles.includes(sub.role)) || roles === user.role)) {
          request.user.sub = user
        }else if (sub.role == 1){
          if(request.method === 'GET'){
            request.user.sub = user
          }else {
            if(user && permissions.some(r=> user.permissions.includes(r))){
              request.user.sub = user
            }else {
              return reply.notAcceptable()
            }
          }
        }
        else {
          return reply.notAcceptable()
        }
      } catch (err) {
        return reply.unauthorized()
      }
    },
  });

}

export default fp(jwtAuthorization, {
  name: "guard",
});
