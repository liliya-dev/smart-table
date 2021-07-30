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
          body: { title, sender, message, recipient, id, details },
        },
      } = context;

      if (!sender) return { status: 400, title: ERRORS.SENDER };
      if (!recipient) return { status: 400, title: ERRORS.RECIPIENT };
      if (!title) return { status: 400, title: ERRORS.TITLE };
      if (!message) return { status: 400, title: ERRORS.MESSAGE };

      const isAuthenticated = context.isAuthenticated();
      const isOwner = checkIsOwner({ code: sender, isAuthenticated, user });
      if (!isOwner && sender !== "unregistered user")
        return { status: 403, title: ERRORS.OWNER };

      const existsSender = await strapi
        .query(TYPES.LIBRARY)
        .model.exists({ code: sender });
      if (!existsSender && sender !== "unregistered user")
        return { status: 400, title: ERRORS.SENDER_LIBRARY };
      const existsRecipient = await strapi
        .query(TYPES.LIBRARY)
        .model.exists({ code: recipient });
      if (!existsRecipient) return { status: 400, title: ERRORS.CODE_LIBRARY };

      await strapi.query(TYPES.USER_MESSAGE).model.create({
        exemplar_title: title,
        sender,
        message,
        recipient,
        processed: false,
        edition_id: id,
        details,
      });

      strapi.plugins["email"].services.email.send({
        to: process.env.NOTIFICATION_EMAIL,
        subject: "Appell von der Website buecherregister.com",
        html: `
          <div>
            <div>
              <p>Message</p>
              <strong>User:</strong> <span>${sender} wants to send next message to ${recipient}</span>
              <p>${message}</p>
              <p>About ${title} edition</p>
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
