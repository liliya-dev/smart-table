module.exports = ({ env }) => {
  return {
    settings: {
      cache: {
        enabled: true,
        models: [
          {
            model: "libraries/published",
            singleType: true,
            maxAge: 3600000,
          },
          {
            model: "editions/published",
            singleType: true,
            maxAge: 3600000,
          },
          {
            model: "libraries/items/edition",
            singleType: true,
            maxAge: 3600000,
          },
        ],
        cacheTimeout: 20000,
        populateStrapiMiddleware: true,
        enableEtagSupport: true,
        clearRelatedCache: true,
      },
      parser: {
        enabled: true,
        multipart: true,
        formLimit: "500mb",
        jsonLimit: "200mb",
        textLimit: "200mb",
        formidable: {
          maxFileSize: 10737418240,
        },
      },
    },
  };
};
