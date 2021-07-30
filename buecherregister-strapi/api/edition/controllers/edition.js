"use strict";
const TYPES = require("../../../config/functions/types");
const { ERRORS, SUCCESS } = require("../../../config/functions/messages");

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

module.exports = {
  getPublicEditions: async (context) => {
    try {
      const page = +context.request.query.page - 1 || 0;
      const limit = 24;
      const query = context.request.query.query || '';
      const sortBy = context.request.query.sortBy;
      const direction = context.request.query.direction;
      const genresQuery = context.request.query.genres
      const genresAll = [
        "unknown",
        "apocalypses__beatus_manuscripts",
        "astronomy__astrology",
        "bestiaries",
        "bibles__gospels",
        "books_of_hours__prayer_books",
        "cassettes",
        "chronicles__history__law",
        "games__hunting",
        "geography__maps",
        "islam__oriental",
        "judaism__hebrew",
        "leonardo_da_vinci",
        "literature__poetry",
        "liturgical_manuscripts",
        "manual",
        "medicine__botany__alchemy",
        "music",
        "mythology__prophecies",
        "other_religious_works",
        "psalteries",
        "saints_legends",
        "treatises__secular_works"
      ];

      const genres = genresQuery ? genresQuery.split(',') : genresAll;

        const getSort = () => {
          const sorters = {
            title: 'title'
          }
          const sortDirection = direction === 'true' ? -1 : 1
          return sortBy ? { [sorters[sortBy]]: sortDirection } : { createdAt: sortDirection }
        }

        const data = await strapi.query(TYPES.EDITION).model.aggregate([
          { $match: {cover: { $ne: null }} },
          { $match: { genre: { $in: genres }}},
          { $match: { $or: [{ title: { $regex : query, $options: "i" }}, { abbreviation: { $regex : query, $options: "i"} }] } },
          { $lookup: { from: 'upload_file', localField: 'cover', foreignField: '_id', as: "cover" }},
          { $project: {
              genre: 1, 
              title: 1, 
              type: 1, 
              _id: 1, 
              cover: 1, 
              abbreviation: 1,
              cover: { url: 1 }
            }
          },
          { $sort : { ...getSort() } },
          {
            $facet: {
              data: [
                { $skip: page * limit },
                { $limit: limit }
              ],
              pagination: [
                { $count: "total" }
              ],
              titlesAndAbbreviations: [

                {
                  $group:
                    {
                      _id: null,
                      titles: { $push:  { title: "$title", abbreviation: "$abbreviation" } }
                    }
                }
              ]
            }
          }
        ])

        const books  = data[0].data;
        const titles = data[0].titlesAndAbbreviations[0].titles.map(item => [item.title, item.abbreviation]).flat()
        const pagination = data[0].pagination
        return { status: 200, books, pagination, titles }

    } catch (error) {
      return { status: 502, title: ERRORS.SERVER, error: error.message}
    }
  },
  getItem: async (context) => {
    try {
      const {
        params: { id },
      } = context;
      if (!id) return { status: 400, title: ERRORS.ID };
      const edition = await strapi
        .query(TYPES.EDITION)
        .model.findById(id)
        .lean();
      if (!edition) return { status: 404, title: ERRORS.ID_EDITION };
      return { status: 200, title: SUCCESS.DEFAULT, data: edition };
    } catch (error) {
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },

  getRandom: async (context) => {
    try {
      const {
        params: { quantity },
      } = context;
      const editions = await strapi
        .query(TYPES.EDITION)
        .model.find({ isShown: true })
        .lean()
        .select(["id", "title", "description", "cover", "type"]);

      const index = getRandomArbitrary(0, editions.length - quantity);
      return {
        status: 200,
        books: editions.slice(index, index + Number(quantity)),
      };
    } catch (error) {
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },
  getVolumes: async () => {
    try {
      const editions = await strapi
        .query(TYPES.EDITION)
        .model.find({ volumes: { $ne: 1 } })
        .lean()
        .select(["volumes"]);
      const total = await strapi
        .query(TYPES.EDITION)
        .model.estimatedDocumentCount({ volumes: 1 });
      const reduced = editions.reduce(
        (accumulator, currentValue) => accumulator + currentValue.volumes,
        0
      );
      return { status: 200, volumes: reduced + total - editions.length };
    } catch (error) {
      console.log(error.message);
      return { status: 502, title: ERRORS.SERVER, error: error.message };
    }
  },
};
