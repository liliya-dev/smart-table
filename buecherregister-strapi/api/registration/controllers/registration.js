"use strict";
const { ERRORS, SUCCESS } = require("../../../config/functions/messages");

// const TYPES = require("../../../config/functions/types");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  registration: async (context) => {
    try {
      const {
        request: {
          body: {
            email,
            name,
            phone,
            surname,
            date,
            street,
            city,
            postCode,
            country,
            aboutUs,
            messageCountWorks,
            files,
          },
        },
      } = context;

      if (!phone) return { status: 400, title: ERRORS.PHONE };
      if (!date) return { status: 400, title: ERRORS.DATE };
      if (!name) return { status: 400, title: ERRORS.NAME };
      if (!surname) return { status: 400, title: ERRORS.SURNAME };
      if (!street) return { status: 400, title: ERRORS.PHONE };
      if (!postCode) return { status: 400, title: ERRORS.POST_CODE };

      if (phone) {
        const isPhoneValid = /^\+4\d{11}$/.test(phone);

        if (!isPhoneValid) {
          return { status: 400, title: ERRORS.VALID_PHONE };
        }
      }

      // const res = await strapi.query(TYPES.REGISTRATION).model.create({
      //   name,
      //   email,
      //   surname,
      //   phone,
      //   country,
      //   date,
      //   street,
      //   postCode,
      //   city,
      //   aboutUs,
      //   messageCountWorks,
      // });

      const sendFiles = [];
      for (let i = 0; i < files.length; i += 1) {
        const matches = files[i].base64File.match(
          /^data:([A-Za-z-+\/]+);base64,(.+)$/
        );

        sendFiles.push({
          content: matches[2],
          filename: files[i].name,
          disposition: "attachment",
          type: files[i].type,
          content_id: `${files[i].name}_${files[i].size}`,
        });
      }

      strapi.plugins["email"].services.email
        .send({
          to: process.env.NOTIFICATION_EMAIL,
          subject: "Appell von der Website buecherregister.com",
          attachments: sendFiles,
          html: `
          <div>
            <div>
              <strong>Vorname:</strong> <span>${name || "unknown"}</span>
            </div>
            <div>
              <strong>Nachname:</strong> <span>${surname || "unknown"}</span>
            </div>
            <div>
              <strong>Geburtsdatum:</strong> <span>${date || "unknown"}</span>
            </div>
            <div>
              <strong>Telefonnummer:</strong> <span>${phone || "unknown"}</span>
            </div>
            <div>
              <strong>Email:</strong> <span>${email || "unknown"}</span>
            </div>
            <div>
              <strong>Strasse, Hausnummer:</strong> <span>${
                street || "unknown"
              }</span>
            </div>
            <div>
              <strong>Postleizahl:</strong> <span>${
                postCode || "unknown"
              }</span>
            </div>
            <div>
              <strong>Stadt:</strong> <span>${city || "unknown"}</span>
            </div>
            <div>
              <strong>Land:</strong> <span>${country || "unknown"}</span>
            </div>
            <hr />
            <h1>Zusätzliche Informationen</h1>
            <h3>Wie viele Werke sollen registriert werden?</h3>
            <p>${messageCountWorks}</p>
            <h3>Wie haben Sie von uns erfahren?</h3>
            <p>${aboutUs}</p>
          </div>
        `,
        })
        .catch(console.log);

      return { status: 200, title: SUCCESS.DEFAULT };
    } catch (error) {
      console.log(error);
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },
};
