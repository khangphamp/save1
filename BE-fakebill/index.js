import Fastify from "fastify"
import fEnv from "@fastify/env";
import fAutoLoad from "@fastify/autoload";
import Cors from "@fastify/cors"
import Sensible from "@fastify/sensible"
import fStatic from "@fastify/static"

import S from "fluent-json-schema";
import { join } from "desm"
import initData from "./src/defined/initData.js";
const fastify = Fastify({ logger: false })

global["fastify"] = fastify

const start = async () => {
    try {

        fastify.decorate('src', (p) => {
            return join(import.meta.url, `src/${p}`)
        })

        await fastify.register(fEnv, {
            schema: S.object()
                .prop("MODE", S.string().required())
                .prop("DOMAIN", S.string().required())
                .prop("TOKEN", S.string().required())
                .prop("TOKEN_EXPIRED", S.string().required())
                .prop("MONGO_URL_CONNECT", S.string().required())
                .prop("MONGODB_DATABASE_NAME", S.string().required())
                .prop("SERVER_PORT", S.string().required())
                .valueOf(),
            dotenv: {
                path: join(import.meta.url, ".env"),
                debug: true,
            },
        })

        fastify.register(Cors, {
            origin: "*",
            credentials: true,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
        })

        fastify.register(Sensible);

        fastify.register(fStatic, {
            root: join(import.meta.url, "/public"),
          }).ready(err => {
            throw err
        })

        fastify.register(fStatic, {
            root: fastify.src("assets"),
            prefix: "/assets",
            decorateReply: false
          }).ready(err => {
            throw err
        })

        fastify.setNotFoundHandler((_, reply) => {
            reply.sendFile('index.html')
        })
          
        await fastify.register(fAutoLoad, {
            dir: join(import.meta.url, 'src/plugins'),
            autoHooks: true,
            dirNameRoutePrefix: false,
        }).ready(err => {
            throw err
        })

        fastify.register(fAutoLoad, {
            dir: join(import.meta.url, 'src/modules'),
            dirNameRoutePrefix: false,
            autoHooks: false,
            matchFilter: (path) => /^.+\.route.js$/i.test(path)
        }).ready(err => {
            throw err
        })

      

        fastify.setValidatorCompiler(({ schema, method, url, httpPart }) => {
            return data => schema.validate(data)
        })

        fastify.listen({ port: fastify.config.SERVER_PORT, host: '::' }, (err) => {
            if (err) {
                fastify.log.error(err)
                process.exit(1)
            }
            initData();
            console.log('listen on', fastify.config.SERVER_PORT)
        })

    } catch (err) {
        console.log(err)
        fastify.log.error(err)
        process.exit(1)
    }
}

start();