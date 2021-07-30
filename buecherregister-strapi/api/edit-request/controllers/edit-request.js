"use strict";
const TYPES = require("../../../config/functions/types");
const { ERRORS, SUCCESS } = require("../../../config/functions/messages");
const { checkIsOwner } = require("../../../config/functions/checkIsOwner");
const {
  deleteFiles,
  getImageProps,
} = require("../../../config/functions/upload-image");

/// need add virificatioт when creating request(if request with this code and id is exests already)

module.exports = {
  createRequest: async (context) => {
    try {
      const {
        params: { code },
        request: {
          body: { id, fields, exemplar_name },
        },
        state: { user },
      } = context;
      const coverImage = await getImageProps(fields.coverImage);
      const uploadedImages = await getImageProps(fields.uploadedImages);
      const isAuthenticated = context.isAuthenticated();
      const isOwner = checkIsOwner({ code, isAuthenticated, user });
      if (!isOwner) return { status: 400, title: ERRORS.OWNER };
      if (!code) return { status: 400, title: ERRORS.CODE };
      if (!id) return { status: 400, title: ERRORS.ID };

      await strapi.query(TYPES.EDIT_REQUEST).create(
        {
          ...fields,
          processed: false,
          code,
          exemplar_name,
          exemplar_id: id,
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
                <p>Edit request</p>
                <strong>User:</strong> <span>${code}</span>
                <p>wants to edit '${exemplar_name}'</p>
              </div>
            </div>
          `,
      });

      return { status: 200, title: SUCCESS.DEFAULT };
    } catch (error) {
      return { status: 502, title: ERRORS.SERVER, error: eror.message };
    }
  },
  deleteRequest: async (context) => {
    try {
      const {
        params: { code, id },
        state: { user },
      } = context;
      if (!id) return { status: 400, title: ERRORS.ID };
      if (!code) return { status: 400, title: ERRORS.CODE };

      const isAuthenticated = context.isAuthenticated();
      const isOwner = checkIsOwner({ code, isAuthenticated, user });
      if (!isOwner) return { status: 400, title: ERRORS.OWNER };

      await strapi.query(TYPES.EDIT_REQUEST).delete({ code, exemplar_id: id });

      return { status: 200, title: SUCCESS.DEFAULT };
    } catch (error) {
      console.log(error);
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },
};
