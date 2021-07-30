'use strict';
const TYPES = require('../../../config/functions/types');
const { ERRORS, SUCCESS } = require('../../../config/functions/messages');

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

module.exports = {
  getData: async () => {
    try {
      const pageData = await strapi.query(TYPES.HOMEPAGE).model
                      .find()
                      .lean()
                      .select([
                        "hero", "aboutus", "quote", "description", "catalog", 
                        "features", "facilities", "works", "video", "faq", "contact"
                      ]);
      const data = pageData[0];
      const index = getRandomArbitrary(0, data.works[0].ref.editions.length - 6);

      const sectionsData = { 
        hero: {
          title: data.hero[0].ref.title,
          items: data.hero[0].ref.box.map(item => item.ref),
        },
        about: {
          title: data.aboutus[0].ref.title,
          text: data.aboutus[0].ref.text,
          items: data.aboutus[0].ref.items.map(item => item.ref),
          card: data.aboutus[0].ref.card[0].ref
        },
        quote: {
          title: data.quote[0].ref.title,
          text: data.quote[0].ref.name,
          photo:  data.quote[0].ref.photo,
        },
        description: {
          buttonTitle: data.description[0].ref.buttonTitle,
          items: data.description[0].ref.items.map(item => item.ref)
        },
        catalog: {
          title: data.catalog[0].ref.title,
          buttonTitle: data.catalog[0].ref.buttonTitle,
          placeholder: data.catalog[0].ref.placeholder,
          image: data.catalog[0].ref.image,
        },
        features: {
          title: data.features[0].ref.title,
          text: data.features[0].ref.text,
          items: data.features[0].ref.items.map(item => item.ref)
        },
        facilities: {
          title: data.facilities[0].ref.title,
          text: data.facilities[0].ref.text,
          items: data.facilities[0].ref.items.map(item => item.ref)
        },
        works: {
          title: data.works[0].ref.title,
          text: data.works[0].ref.text,
          items: {
            genres: data.works[0].ref.genres[0].ref,
            books: data.works[0].ref.books[0].ref,
            rareedition: data.works[0].ref.rareedition[0].ref,
            editions: data.works[0].ref.editions.map(edition => edition.ref.edition).slice(index, index + 6 ),
          }
        },
        video: {
          title: data.video[0].ref.title,
          text: data.video[0].ref.text,
          buttonTitle:  data.video[0].ref.buttonTitle,
        },
        faq: {
          title: data.faq[0].ref.title,
          text: data.faq[0].ref.text,
          questions: data.faq[0].ref.questions.map(item => item.ref)
        },
        contact: {
          title: data.contact[0].ref.title,
          text: data.contact[0].ref.text,
          phone: data.contact[0].ref.phone,
          email: data.contact[0].ref.email,
          buttonTitle:  data.contact[0].ref.buttonTitle,
        },
      }

      return { 
        status: 200, 
        title: SUCCESS, 
        pageData: {
          ...sectionsData
        }
      };
    } catch (error) {
      console.log(error.message)
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },
}
