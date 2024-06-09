module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/secure-chat-app',
  secretOrKey: process.env.JWT_SECRET || 'your_secret_key',
  emailUser: process.env.EMAIL || 'mynewsocial12345@gmail.com',
  emailPassword: process.env.EMAIL_PASSWORD || 'vkqo qafe aoqu jrfa',
};
