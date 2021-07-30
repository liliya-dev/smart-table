"use strict";
const { ERRORS, SUCCESS } = require("../../../config/functions/messages");
const TYPES = require("../../../config/functions/types");

module.exports = {
  add: async (context) => {
    try {
      const {
        request: {
          body: { email, name, phone },
        },
      } = context;

      if (!phone) {
        return { status: 400, title: ERRORS.PHONE };
      }

      if (phone) {
        const isPhoneValid = /^\+4\d{11}$/.test(phone);

        if (!isPhoneValid) {
          return { status: 400, title: ERRORS.VALID_PHONE };
        }

        const isPhoneTaken = await strapi
          .query(TYPES.CONTACT)
          .model.findOne({ phone });

        if (isPhoneTaken) {
          return { status: 400, title: ERRORS.TAKEN_PHONE };
        }
      }

      if (email) {
        const isEmailValid =
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            email
          );

        if (!isEmailValid) {
          return { status: 400, title: "This email is not valid!" };
        }

        const isEmailTaken = await strapi
          .query(TYPES.CONTACT)
          .model.findOne({ email });

        if (isEmailTaken) {
          return { status: 400, title: ERRORS.TAKEN_EMAIL };
        }
      }

      await strapi.query(TYPES.CONTACT).model.create({
        name,
        email,
        phone,
      });

      return { status: 200, title: SUCCESS.DEFAULT };
    } catch (error) {
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },
};
