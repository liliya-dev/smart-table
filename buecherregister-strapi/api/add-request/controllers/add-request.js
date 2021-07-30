"use strict";

const TYPES = require("../../../config/functions/types");
const { ERRORS, SUCCESS } = require("../../../config/functions/messages");
const { checkIsOwner } = require("../../../config/functions/checkIsOwner");
const {
  getImageProps,
  deleteFiles,
} = require("../../../config/functions/upload-image");

module.exports = {
  create: async (context) => {
    try {
      const {
        params: { code },
        request: {
          body: { fields },
        },
        state: { user },
      } = context;
      const isAuthenticated = context.isAuthenticated();
      const isOwner = checkIsOwner({ code, isAuthenticated, user });
      if (!isOwner) return { status: 400, title: ERRORS.OWNER };
      if (!code) return { status: 400, title: ERRORS.CODE };

      const coverImage = await getImageProps(fields.coverImage);
      const uploadedImages = await getImageProps(fields.uploadedImages);

      await strapi.query(TYPES.ADD_REQUEST).create(
        {
          ...fields,
          processed: false,
          code,
          cover_image: coverImage.attachments,
          uploaded_images: uploadedImages.attachments,
        },
        deleteFiles([...coverImage.pathes, ...uploadedImages.pathes] || [])
      );

      strapi.plugins["email"].services.email.send({
        to: process.env.NOTIFICATION_EMAIL,
        subject: "Appell von der Website buecherregister.com",
        html: `
          <div>
            <div>
              <p>Add request</p>
              <strong>User:</strong> <span>${code}</span>
              <p>wants to add new book '${fields.title}' to the library</p>
            </div>
          </div>
        `,
      });

      return { status: 200, title: SUCCESS.DEFAULT };
    } catch (error) {
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },
};
