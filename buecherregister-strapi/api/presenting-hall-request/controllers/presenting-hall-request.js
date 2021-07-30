"use strict";
const TYPES = require("../../../config/functions/types");
const { ERRORS, SUCCESS } = require("../../../config/functions/messages");
const { checkIsOwner } = require("../../../config/functions/checkIsOwner");

module.exports = {
  create: async (context) => {
    try {
      const {
        state: { user },
      } = context;
      const {
        request: {
          body: { code },
        },
      } = context;

      if (!code) return { status: 400, title: ERRORS.CODE };

      const isAuthenticated = context.isAuthenticated();
      const isOwner = checkIsOwner({ code, isAuthenticated, user });
      if (!isOwner) return { status: 403, title: ERRORS.OWNER };

      const existsLibrary = await strapi
        .query(TYPES.LIBRARY)
        .model.exists({ code });
      if (!existsLibrary) return { status: 400, title: ERRORS.CODE_LIBRARY };

      await strapi.query(TYPES.PRESENTING_HALL_REQUEST).model.create({
        processed: false,
        code,
      });

      strapi.plugins["email"].services.email.send({
        to: process.env.NOTIFICATION_EMAIL,
        subject: "Appell von der Website buecherregister.com",
        html: `
          <div>
            <div>
              <p>Message</p>
              <strong>User:</strong> <span>${code} wants to add his library to presenting hall</span>
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
