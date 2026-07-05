const _config = {
  mongo_url: process.env.MONGO_URL!,
  JWT_KEY: process.env.SECRET_KEY!,
};

export const config = Object.freeze(_config);


