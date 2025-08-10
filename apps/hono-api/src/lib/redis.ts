import { createClient } from "redis";

let redisClient;

export async function getRedis() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on("error", (err) =>
      console.error("Redis Client Error", err)
    );

    await redisClient.connect();
    console.log("connected to redis")
  }
  return redisClient;
}
