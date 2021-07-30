"use strict";
const TYPES = require("../../../config/functions/types");
const { ERRORS, SUCCESS } = require("../../../config/functions/messages");
const { checkIsOwner } = require("../../../config/functions/checkIsOwner");

const getConditions = (items) => {
  const cases = items.reduce((cases, item) => {
    const condition = item.ref ? item.ref.condition : item.condition;

    if (condition in cases) {
      cases[condition] += 1;
    } else {
      cases[condition] = 1;
    }

    return cases;
  }, {});
  const conditions = Object.entries(cases)
    .map(([key, value]) => ({
      title: key,
      value: +((100 / items.length) * value).toFixed(0),
    }))
    .sort((a, b) => {
      const getSerialNumber = (value) => {
        switch (value) {
          case "very_good":
            return 1;
          case "good":
            return 2;
          case "acceptable":
            return 3;
          default:
            return 4;
        }
      };

      return getSerialNumber(a.title) > getSerialNumber(b.title) ? 1 : -1;
    });

  return conditions;
};

const getSummary = ({ isOwner, library: { code, items = [] }, user } = {}) => {
  const filtered = isOwner
    ? items
    : items.filter((item) => !item.ref.isExemplarHidden);

  const getCosts = (items) => {
    if (!items.length) return { total: 0, average: 0 };

    const costsFiltered = isOwner
      ? items
      : filtered.filter((item) => item.ref.isCostVisible);

    const costs = costsFiltered
      .map((item) => +item.ref.cost)
      .filter((item) => item);
    const total = costs.reduce((total, item) => total + item, 0);
    const average = Math.round(total / costs.length);

    return { total, average };
  };

  const getCounts = (items) => {
    if (!items.length) return { exemplars: 0, volumes: 0 };
    const exemplars = items.length;
    const volumes = items.reduce(
      (total, item) => total + item.ref.edition.volumes,
      0
    );

    return { exemplars, volumes };
  };
  const getUser = ({ code, isOwner, user }) => {
    if (isOwner) {
      const date = new Date(user.createdAt);
      const year = date.getFullYear();
      const month =
        date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1;
      const day = date.getDate();
      return {
        code,
        date: `${day}.${month}.${year}`,
        name: user.name,
        status: user.status,
      };
    }

    return {
      code,
      date: "",
      name: "",
      status: "",
    };
  };

  const summary = {
    conditions: getConditions(filtered),
    costs: getCosts(filtered),
    counts: getCounts(filtered),
    user: getUser({ code, isOwner, user }),
  };

  return summary;
};

const getExemplarsForPublished = ({ library } = {}) => {
  if (!library.items) return [];

  const items = library.items.map(({ ref }, index) => {
    if (!ref || ref.isExemplarHidden) return;

    const exemplar = {
      _id: ref._id,
      condition: ref.condition,
      edition: {
        cover: ref.edition.cover,
        genre: ref.edition.genre,
        title: ref.edition.title,
        date: ref.edition.date,
        type: ref.edition.type,
        _id: ref.edition._id,
        abbreviation: ref.edition.abbreviation,
      },
    };

    return exemplar;
  });

  const filteredItems = items
    .filter((item) => item)
    .sort((a, b) => b.cost - a.cost);

  return filteredItems;
};

const getExemplars = ({
  isOwner,
  library,
  deleteRequestsId,
  editRequestsId,
} = {}) => {
  if (!library.items) return [];

  const items = library.items.map(({ ref }) => {
    if (!isOwner) {
      if (ref.isExemplarHidden) {
        return;
      }
    }

    const isDeleteRequest = deleteRequestsId.includes(
      ref.edition._id.toString()
    );
    const isEditRequest = editRequestsId.includes(ref.edition._id.toString());

    const exemplar = {
      ...ref,
      __v: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      cost: isOwner || ref.isCostVisible ? ref.cost : 0,
      date: isOwner || ref.isDateVisible ? ref.date : "",
      isDeleteRequest,
      isEditRequest,
      note: ref.note,
      edition: {
        ...ref.edition,
        __v: undefined,
        abbreviation: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        created_by: undefined,
        updated_by: undefined,
      },
    };

    return exemplar;
  });

  const filteredItems = items.filter((item) => item);

  return filteredItems;
};

module.exports = {

  getItem: async (context) => {
    try {
      const {
        params: { code },
        state: { user },
      } = context;

  

      if (!code) return { status: 400, title: ERRORS.CODE };

      const library = await strapi
        .query(TYPES.LIBRARY)
        .model.findOne({ code })
        .lean()
        .select(["code", "items"]);

      const deleteRequests = await strapi
        .query(TYPES.DELETE_REQUEST)
        .model.find({ code });
      const editRequests = await strapi
        .query(TYPES.EDIT_REQUEST)
        .model.find({ code });
      const editRequestsId = editRequests
        ? editRequests.map((req) => {
            if (!req.processed) return req.exemplar_id;
          })
        : [];
      const deleteRequestsId = deleteRequests
        ? deleteRequests.map((req) => {
            if (!req.processed) return req.exemplar_id;
          })
        : [];

      if (!library) return { status: 404, title: ERRORS.CODE_LIBRARY };

      const isAuthenticated = context.isAuthenticated();
      const isOwner = checkIsOwner({ code, isAuthenticated, user });
      const exemplars = getExemplars({
        isOwner,
        library,
        deleteRequestsId,
        editRequestsId,
      });
      const summary = getSummary({ isOwner, library, user });

      const isPublished = isOwner
        ? await strapi
            .query(TYPES.PRESENTING_HALL_REQUEST)
            .model.exists({ code })
        : false;

      return {
        data: {
          code,
          exemplars,
          isAuthenticated,
          isOwner,
          summary,
          isPublished,
        },
        status: 200,
        title: SUCCESS.DEFAULT,
      };
    } catch (error) {
      console.log(error);
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },
  setNewOptions: async () => {
    try {
      const library = await strapi.query(TYPES.LIBRARY).model.find();

      for (let j = 0; j < library.length; j++) {
        const { items } = await library[j];
        for (let i = 0; i < items.length; i++) {
          const item = items[i].ref;
          item["isDateVisible"] = false;
          item["isCostVisible"] = false;
          item["isExemplarHidden"] = false;
          await item.save();
        }
      }
      return { status: 200, title: SUCCESS.DEFAULT };
    } catch (error) {
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },

  getExemplarOptions: async (context) => {
    try {
      const {
        state: { user },
      } = context;
      const {
        params: { id, code },
      } = context;

      if (!code || !id) return { status: 403, item: null, title: ERRORS.CODE };

      const isAuthenticated = context.isAuthenticated();
      // if (!isAuthenticated) return { status: 200, item: null, details: null, title: ERRORS.OWNER };

      const isOwner = checkIsOwner({ code, isAuthenticated, user });
      const library = await strapi
        .query(TYPES.LIBRARY)
        .model
        .findOne({ code })
        .lean()
        .select(["code", "items"]);
    
      if (!library)
        return { status: 403, item: null, title: ERRORS.CODE_LIBRARY };
      const items = library.items;
      const itemIndex = items.findIndex(
        (item) => item.ref.edition._id.toString() === id
      );
      const selectedItem = items[itemIndex].ref;

      if (!isOwner) {
        const details = {
          cost: selectedItem.isCostVisible ? selectedItem.cost : null,
          date: selectedItem.isDateVisible ? selectedItem.date : null,
          condition: selectedItem.condition,
        };
        return { status: 200, item: null, details, title: SUCCESS.DEFAULT };
      }
     

      const deleteRequests = await strapi
        .query(TYPES.DELETE_REQUEST)
        .model.find({ exemplar_id: id, code });
      const editRequests = await strapi
        .query(TYPES.EDIT_REQUEST)
        .model.find({ exemplar_id: id, code });

      let isDeleteMark = false;
      let isEditMark = false;
      if (deleteRequests.length > 0)
        isDeleteMark = !deleteRequests[0].processed;
      if (editRequests.length > 0) isEditMark = !editRequests[0].processed;

      return {
        status: 200,
        title: SUCCESS.DEFAULT,
        item: {
          isDeleteRequest: isDeleteMark,
          isEditRequest: isEditMark,
          date: selectedItem.date,
          _id: selectedItem._id,
          isDateVisible: selectedItem.isDateVisible,
          isExemplarHidden: selectedItem.isExemplarHidden,
          isCostVisible: selectedItem.isCostVisible,
          edition: {
            title: selectedItem.edition.title,
            _id: selectedItem.edition._id,
          },
        },
        details: {
          cost: selectedItem.cost,
          date: selectedItem.date,
          condition: selectedItem.condition,
        },
      };
    } catch (error) {
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },

  getExemplar: async (context) => {
    try {
      const {
        params: { code, id },
        state: { user },
      } = context;
      const isAuthenticated = context.isAuthenticated();
      const isOwner = checkIsOwner({ code, isAuthenticated, user });

      if (!isOwner) return { status: 400, title: ERRORS.OWNER };
      if (!code) return { status: 400, title: ERRORS.CODE };
      if (!id) return { status: 400, title: ERRORS.ID };

      const library = await strapi
        .query(TYPES.LIBRARY)
        .model.findOne({ code })
        .lean()
        .select(["code", "items"]);
      const items = library.items;
      const itemIndex = items.findIndex(
        (item) => item.ref.edition._id.toString() === id
      );

      return {
        status: 200,
        item: items[itemIndex],
        title: SUCCESS.DEFAULT,
      };
    } catch (error) {
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },

  hide: async (context) => {
    try {
      const {
        params: { code },
      } = context;
      const {
        request: {
          body: { id, value, option },
        },
        state: { user },
      } = context;
      if (!code) return { status: 400, title: ERRORS.CODE };
      if (!id) return { status: 400, title: ERRORS.ID };

      const isAuthenticated = context.isAuthenticated();
      const isOwner = checkIsOwner({ code, isAuthenticated, user });
      if (!isOwner) return { status: 400, title: ERRORS.OWNER };

      const library = await strapi.query(TYPES.LIBRARY).model.findOne({ code });

      const { items } = library;
      for (let i = 0; i < items.length; i++) {
        const item = items[i].ref;
        if (item._id.toString() === id) {
          item[option] = value;
          await item.save();
        }
      }
      return { status: 200, library, title: SUCCESS.DEFAULT };
    } catch (error) {
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },

  checkIsExisting: async (context) => {
    try {
      const {
        params: { code },
      } = context;

      if (!code) return { status: 400, title: ERRORS.CODE };

      const exists = await strapi.query(TYPES.LIBRARY).model.exists({ code });

      return {
        data: { code, exists },
        status: 200,
        title: SUCCESS.DEFAULT,
      };
    } catch (error) {
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },

  getItemsWithEdition: async (context) => {
    try {
      const {
        params: { id },
      } = context;

      if (!id) return { status: 400, title: ERRORS.ID };


      const ObjectId = require('mongodb').ObjectID;
      const exemplars = await strapi.query('library.exemplar').model.aggregate([
        { $match: { edition: ObjectId(id) } },
        { $project: {  _id: 1, condition: 1 }},
      ])
  
      const refsExemplars = exemplars.map(item => item._id)
      const libraries = await strapi.query(TYPES.LIBRARY).model.aggregate( [
          { $match: { public: true }},
          { $match: { items: { $elemMatch: { ref: { $in: refsExemplars } } }}},
           
          {
            $project: {
              id: 1,
              code: true,
              items: { $filter: { input: "$items", as: "item", cond: { $in: ["$$item.ref", refsExemplars ]} } }
            }
          },
        ])
  
      const librariesWithItems = libraries.map(library => {
        const code = library.code;
        const itemRef = library.items[0].ref
  
        const item = exemplars.find(exemplar => exemplar._id.toString() === itemRef.toString())
        return { 
          code,
          items: [
            { condition: item.condition }
          ]
          
        }
      })

      return { status: 200, title: SUCCESS.DEFAULT, data: { items: librariesWithItems } };
    } catch (error) {
      console.log(error);
      return { status: 502, title: ERRORS.SERVER, error: error.message };
    }
  },

  getOneForPublic: async (context) => {
    const {
      params: { code },
    } = context;
    try {
      const library = await strapi
        .query(TYPES.LIBRARY)
        .model.find({ code })
        .lean()
        .select(["id", "code", "items", "public", "published_At", "rate_plan"]);

      if (!library || !library[0])
        return {
          status: 200,
          data: { libraries: null, count: 0 },
          title: ERRORS.CODE_LIBRARY,
        };

      const items = getExemplarsForPublished({ library: library[0] });
      const conditions = getConditions(items);

      const processedLibrary = {
        ...library[0],
        items,
        itemsNumber: items.length,
        conditions,
        public: false,
      };

      return {
        status: 200,
        data: { libraries: [processedLibrary], count: 1 },
        title: SUCCESS.DEFAULT,
      };
    } catch (error) {
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },

  getMaxMinItems: async () => {
    try {
      const itemsMaxMin =  await strapi.query(TYPES.LIBRARY).model.aggregate([
        { $match: { public: true } },
        {
          $project: {
              item: 1,
              itemsLength: { 
                $cond: { if: { $isArray: "$items" }, then: { $size: "$items" }, else: "NA"}, 
              },  
          }
        },
        { $sort : { itemsLength : 1 } },
        { $group : { _id: null, max: { $max : "$itemsLength" }, min: { $min : "$itemsLength" }}}
      ])
      return { status: 200, max: itemsMaxMin[0].max, min: itemsMaxMin[0].min }
    } catch (error) {
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },

  getPublicLibraries: async (context) => {
    try { 
      const page = +context.request.query.page - 1 || 0;
      const limit = 3;
      const query = context.request.query.query || '';
      const minLength = (!+context.request.query.itemsMin || +context.request.query.itemsMin < 4) ? 4 : +context.request.query.itemsMin;
      const maxLength = +context.request.query.itemsMax || Infinity;
      const sortBy = context.request.query.sortBy;
      const direction = context.request.query.direction;
 
      const getSort = () => {
        const sorters = {
          length: 'itemsLength'
        }
        const sortDirection = direction === 'true' ? -1 : 1
        return sortBy ? { [sorters[sortBy]]: sortDirection } : { createdAt: sortDirection }
      }

    
      const data = await strapi.query(TYPES.LIBRARY).model.aggregate([
          { $match: { public: true } },
          { $project: { code: 1, items: 1, itemsNumber: { 
                  $cond: { if: { $isArray: "$items" }, then: { $size: "$items" }, else: "NA"}, 
                },  
             }
          },
          { $match: {itemsNumber: { $gte: minLength } }},
          { $match: {itemsNumber: { $lte: maxLength } }},
          { $match: {code : {$regex : query }}},
          { $lookup: { from: 'components_library_exemplars', localField: "items.ref", foreignField: "_id", as: "items" }},
          { $lookup: { from: 'edition', localField: "items.edition", foreignField: "_id", as: "editions" }},
          { $addFields: { 
              editions: {
                $slice: [
                  { $filter: { input: "$editions", as: "edition", cond: "$$edition.cover" }},
                  4
                ]
              },
            }
          },
          { $lookup: { from: 'upload_file', localField: "editions.cover", foreignField: "_id", as: "covers" }},
          {
            $project: {
              id: 1,
              code: true,
              items: { _id: 1, condition: 1, isExemplarHidden: 1,  edition: 1, published_At: 1, rate_plan: 1 },
              editions: { cover: 1, genre: 1, title: 1, date: 1, type: 1, _id: 1, abbreviation: 1 },
              covers: { _id: 1, url: 1 },
              editionsLength: { 
                $cond: { if: { $isArray: "$editions" }, then: { $size: "$editions" }, else: "NA"}, 
              },
              itemsLength: { 
                $cond: { if: { $isArray: "$items" }, then: { $size: "$items" }, else: "NA"}, 
              },
            }
          },
          { $match: {editionsLength: { $gte: 4 } }},
          { $sort : { ...getSort() } },
          {
            $facet: {
              data: [
                { $skip: page * limit },
                { $limit: limit }
              ],
              pagination: [
                { $count: "total" }
              ]
            }
          }
        ])

        const libraries  = data[0].data;
        const pagination = data[0].pagination;

        const processedLibraries = libraries 
            ? libraries.map(library => {
              const { _id, code, published_At, rate_plan, itemsLength, items, editions, covers } = library;
              const conditions = getConditions(items);
              const itemsConnected = editions.map((edition, index) => {
                const itemNew = items.find(item => edition._id.toString() === item.edition.toString())
                const coverNew = covers.find(cover => edition.cover.toString() === cover._id.toString())
                return { 
                  ...itemNew,
                  edition: {
                    ...edition,
                    cover: coverNew
                  }
                }
              })
              return { 
                _id, 
                code, 
                published_At, 
                rate_plan, 
                itemsNumber: 
                itemsLength, 
                items: itemsConnected, 
                public: true, 
                conditions
              }
            })
            : []

      return {status: 200,  data: processedLibraries, pagination: pagination }

    } catch(err) {
      console.log(err.message)
      return {err}
    }
  },

  getPublic: async () => {
    const x = Date.now();
    try {
      const libraries = await strapi
        .query(TYPES.LIBRARY)
        .model.find({ public: true })
        .lean()
        .select(["id", "code", "items", "public", "published_At", "rate_plan"]);
        console.log(libraries)
        

      const MIN_BOOKS_NUMBER_FOR_PRESENTING_HALL = 4;
      const books = await strapi
        .query(TYPES.EDITION)
        .model.find({ cover: { $ne: null } })
        .lean()
        .select(["genre", "title", "type", "_id", "cover", "abbreviation"]);

      let processedLibraries = libraries
        ? libraries
            .map((library) => {
              const items = getExemplarsForPublished({ library });
              const conditions = getConditions(items);
              return {
                ...library,
                itemsNumber: items.length,
                items,
                conditions,
              };
            })
            .filter((library) => {
              const items = library.items;
              let coversNumber = 0;
              for (let i = 0; i < items.length; i++) {
                if (items[i].edition.cover) {
                  coversNumber++;
                }
              }
              return (
                coversNumber >= MIN_BOOKS_NUMBER_FOR_PRESENTING_HALL &&
                items.length >= MIN_BOOKS_NUMBER_FOR_PRESENTING_HALL
              );
            })
            .map((library) => {
              return {
                ...library,
                items: library.items
                  .filter((item) => item.edition.cover)
                  .slice(0, 4),
              };
            })
        : [];

      const booksProcessed = books.map((book) => {
        return {
          _id: book._id,
          genre: book.genre,
          type: book.type,
          abbreviation: book.abbreviation,
          title: book.title,
          cover: book.cover,
        };
      });

      return {
        status: 200,
        data: {
          libraries: processedLibraries,
          count: libraries.length,
          books: booksProcessed,
        },
        title: SUCCESS.DEFAULT,
      };
    } catch (error) {
      console.log(error);
      return { status: 502, title: ERRORS.SERVER, error };
    }
  },
  awake: () => {
    return { status: 2001 };
  },
};


