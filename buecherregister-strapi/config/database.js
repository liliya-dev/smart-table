module.exports = ({ env }) => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "mongoose",
      settings: {
        uri: env("MONGO_URI"),
        database: env("MONGO_DATABASE_NAME"),
      },
      options: {
        ssl: true,
      },
    },
  },
});
