"use strict";
const TYPES = require("../../../config/functions/types");
const { ERRORS, SUCCESS } = require("../../../config/functions/messages");
const { checkIsOwner } = require("../../../config/functions/checkIsOwner");

module.exports = {
  create: async (context) => {
    ///check if request is already exists
    try {
      const {
        params: { code },
        request: {
          body: { id, date, title },
        },
        state: { user },
      } = context;

      if (!id) return { status: 400, title: ERRORS.ID };
      if (!date) return { status: 400, title: ERRORS.DATE };
      if (!title) return { status: 400, title: ERRORS.TITLE };
      if (!code) return { status: 400, title: ERRORS.CODE };

      const isAuthenticated = context.isAuthenticated();
      const isOwner = checkIsOwner({ code, isAuthenticated, user });
      if (!isOwner) return { status: 400, title: ERRORS.OWNER };

      await strapi.query(TYPES.DELETE_REQUEST).model.create({
        processed: false,
        code,
        exemplar_id: id,
        exemplar_title: title,
        exemplar_date: date,
      });

      strapi.plugins["email"].services.email.send({
        to: process.env.NOTIFICATION_EMAIL,
        subject: "Appell von der Website buecherregister.com",
        html: `
          <div>
            <div>
              <p>Delete request</p>
              <strong>User:</strong> <span>${code}</span>
              <p>wants to delete '${title}' from the library</p>
            </div>
          </div>
        `,
      });

      return { status: 200, title: SUCCESS.DEFAULT };
    } catch (error) {
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },
  delete: async (context) => {
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
      await strapi.query(TYPES.DELETE_REQUEST).delete({ exemplar_id: id });
      return { status: 200, title: SUCCESS.DEFAULT };
    } catch (error) {
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },
};
