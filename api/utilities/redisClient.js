const { createClient } = require("redis");

class RedisClient {
  #client = null;

  constructor() {
    this.createRedisConnection();
  }

  async createRedisConnection() {
    const client = createClient(process.env.REDIS_PORT || 6379);
    client.on("error", (err) => console.log("Redis Client Error", err));
    await client.connect();

    this.#client = client;
    console.log("Redis client connect successfully.");
  }

  set(key, value, options = {}) {
    this.#client.set(key, value, options);
  }

  get(key) {
    return this.#client.get(key);
  }

  del(key) {
    return this.#client.del(key);
  }
}

module.exports = new RedisClient();
