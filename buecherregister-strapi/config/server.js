module.exports = ({ env }) => {
console.log(888)
  return ({
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    admin: {
      auth: {
        secret: env('ADMIN_JWT_SECRET', process.env.ADMIN_JWT_SECRET),
      },
    },
  })
};