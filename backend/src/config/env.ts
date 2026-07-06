const _config = {
  mongo_url: process.env.MONGO_URL!,
  JWT_KEY: process.env.SECRET_KEY!,
  SMTP_USER:process.env.SMPT_MAIL!,
  SMTP_PASS:process.env.SMTP_PASSWORD!,
};

export const config = Object.freeze(_config);


