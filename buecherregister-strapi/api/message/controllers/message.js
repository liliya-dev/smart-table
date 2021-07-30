"use strict";
const TYPES = require("../../../config/functions/types");
const { ERRORS, SUCCESS } = require("../../../config/functions/messages");

module.exports = {
  addRequestForContact: async (context) => {
    try {
      const {
        request: {
          body: { email, message, name, phone, subject },
        },
      } = context;
      /* creating new Message instance in database --> */

      if (!phone) {
        return { status: 400, title: ERRORS.PHONE };
      }

      if (phone) {
        const isPhoneValid = /^\+4\d{11}$/.test(phone);

        if (!isPhoneValid) {
          return { status: 400, title: ERRORS.VALID_PHONE };
        }
      }

      await strapi.query(TYPES.MESSAGE).model.create({
        name,
        email,
        phone,
        subject,
        message,
        processed: false,
      });

      /* sending notification email --> */

      strapi.plugins["email"].services.email.send({
        to: process.env.NOTIFICATION_EMAIL,
        subject: "Appell von der Website buecherregister.com",
        html: `
          <div>
            <div>
              <strong>Name:</strong> <span>${name || "unknown"}</span>
            </div>
            <div>
              <strong>Phone:</strong> <span>${phone || "unknown"}</span>
            </div>
            <div>
              <strong>Email:</strong> <span>${email || "unknown"}</span>
            </div>
            <h3>${subject}</h3>
            <p>${message}</p>
          </div>
        `,
      });

      return { status: 200, title: SUCCESS.DEFAULT };
    } catch (error) {
      console.log(error);
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },
  addRequestForPasswordRecovery: async (context) => {
    try {
      const {
        request: {
          body: { code, name, phone },
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
      }

      const library = await strapi.query(TYPES.LIBRARY).findOne({ code });
      const message = `Password recovery request with code: ${code}.${
        !library
          ? `\nBut the library with such code was not found in the database!`
          : ""
      }`;
      const subject = `Request for password recovery`;

      await strapi.query(TYPES.MESSAGE).model.create({
        name,
        email: "",
        phone,
        subject,
        message,
        processed: false,
      });

      /* sending notification email --> */

      strapi.plugins["email"].services.email.send({
        to: process.env.NOTIFICATION_EMAIL,
        subject: "Appell von der Website buecherregister.com",
        html: `
          <div>
            <div>
              <strong>Name:</strong> <span>${name || "unknown"}</span>
            </div>
            <div>
              <strong>Phone:</strong> <span>${phone || "unknown"}</span>
            </div>
            <div>
              <strong>Code:</strong> <span>${code || "unknown"}</span>
            </div>
            <h3>Password recovery</h3>
            <p>Library owner is requesting a password recovery.</p>
          </div>
        `,
      });

      return { status: 200, title: SUCCESS.DEFAULT };
    } catch (error) {
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },
  test: async (context) => {
    try {
      return { status: 200, title: SUCCESS.DEFAULT };
    } catch (error) {
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },
};
