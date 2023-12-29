import { readFileSync } from "fs";
import { join } from "desm";
import fp from "fastify-plugin";
import Swagger from "@fastify/swagger";

import joi2Json from 'joi-to-json'

const { version } = JSON.parse(readFileSync(join(import.meta.url, "../../package.json")));

async function swaggerGenerator(fastify, opts, done) {

  fastify.register(Swagger, {
    routePrefix: "/api-docs",
    swagger: {
      info: {
        title: "API Bill",
        description: "",
        version: 1,
      },
      externalDocs: {
        url: "https://...",
        description: "Tìm thêm thông tin tại đây",
      },
      host: fastify.config.DOMAIN.replace(/^https?:\/\//, ""),
      schemes: ["http", "https"],
      consumes: ["application/json", "multipart/form-data"],
      produces: ["application/json", "text/html"],
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        }
        // Csrf: {
        //   type: 'apiKey',
        //   name: 'x-csrf-token',
        //   in: 'header'
        // }
      },
      security: [
        {
          "bearerAuth": []
        }
      ]
    },

    transform: ({ schema, url }) => {

      const {
        params,
        body,
        querystring,
        headers,
        response,
        ...transformedSchema
      } = schema
      let transformedUrl = url


      if (params) transformedSchema.params = joi2Json(params)
      if (body) transformedSchema.body = joi2Json(body)
      if (querystring) transformedSchema.querystring = joi2Json(querystring)
      if (headers) transformedSchema.headers = joi2Json(headers)
      if (response) transformedSchema.response = joi2Json(response)

      return { schema: transformedSchema, url: transformedUrl }
    },

    exposeRoute: true
  }

  )
  done()
}
export default fp(swaggerGenerator, {
  name: "swaggerGenerator",
});
