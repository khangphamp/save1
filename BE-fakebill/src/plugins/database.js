import fp from "fastify-plugin";
import mongoose from "mongoose";

async function database(fastify, otps, done) {
  try {
    await mongoose.connect(fastify.config.MONGO_URL_CONNECT,  { dbName: fastify.config.MONGODB_DATABASE_NAME });
  } catch (error) {
    console.error(`Connect mongodb to ${fastify.config.MONGO_URL_CONNECT} failed`, error);
  }
}

export default fp(database, {
  name: "database",
});
