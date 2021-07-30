const { MongoClient } = require('mongodb');
const https = require('https');
require('dotenv').config();

let isReindexed = false;

let timerId = setInterval(checkIfAppStarted, 70000);

function checkIfAppStarted () {

  try {
      if (!isReindexed) {
      https.get('https://back-end-development.azurewebsites.net/libraries/awake', (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
          data += chunk;
        });
        resp.on('end', () => {
          console.log(22, isReindexed, data)
          if (data === '{"status":2001}') {
            isReindexed = true;
            reindex();
          }
        });
      
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });
    } else {
      clearInterval(timerId)
    }
      
    } catch (error) {
      console.log(error.message)
    }
 
}

async function reindex() {
  console.log(isReindexed)
  try {
    const uriTarget=process.env.MONGO_URI
    const clientTarget = new MongoClient(encodeURI(uriTarget), { useNewUrlParser: true , useUnifiedTopology: true });
    await clientTarget.connect();
    const databaseTarget = clientTarget.db(process.env.MONGO_DATABASE_NAME);

    const coll = 'core_store'
    const keys = await databaseTarget.collection(coll).find().toArray()

    const getKey = (keyName) => {
      if (keyName[1] === 'application') {
        return keyName[2].split('.')[1]
      } else {
        return keyName[2].split('.').join('_')
      }
    }
    const taretKeys = keys
      .map(item => {
        if(JSON.parse(item.value).metadatas) {
          return {
            key: item.key.split('::'),
            value: Object.keys(JSON.parse(item.value).metadatas)
          }
        }
      })
      .filter(item => item && item.key[0] !== 'plugin_content_manager_configuration_components')
      .map(item => {
        return { 
          ...item,
          key: getKey(item.key),
        }
      })

    for (let i = 0; i < taretKeys.length; i++) {
      const collectionName = taretKeys[i].key;
      const allKeys = taretKeys[i].value

      if (allKeys) {
        for(let i = 0; i < allKeys.length; i++) {
          const key = allKeys[i]
          console.log(key, collectionName)
          await databaseTarget.collection(collectionName).createIndex({ [key]: 1 }, { sparse: true, background: true } )
        }
      }

      await databaseTarget.collection(collectionName).createIndex({ id: 1 }, { sparse: true, background: true } )
    }
    console.log('reindexing database is finished')
  }
  catch (err) {
    console.log(err.message)
  }
}

const ObjectId = require('mongodb').ObjectID;

async function sort() {
  const x = Date.now()
  console.log(0)
 
    const uriTarget=process.env.MONGO_URI
    const clientTarget = new MongoClient(encodeURI(uriTarget), { useNewUrlParser: true , useUnifiedTopology: true });
    await clientTarget.connect();
    const databaseTarget = clientTarget.db(process.env.MONGO_DATABASE_NAME);
    const idToFind = '5f725a136982e000176f415e'
    const y = Date.now()
    console.log(Date.now()-x)


    const coll = 'components_library_exemplars'
    const exemplars = await databaseTarget.collection(coll).aggregate([
      { $match: { edition: ObjectId(idToFind) } },
      { $project: {  _id: 1, condition: 1 }},
    ]).toArray();

    const refsExemplars = exemplars.map(item => item._id)

    const libraries = await databaseTarget.collection('library').aggregate( [
      { 
        $match: { items: { $elemMatch: { ref: { $in: refsExemplars } } }}},
      {
        $project: {
          id: 1,
          code: true,
          items: { $filter: { input: "$items", as: "item", cond: { $in: ["$$item.ref", refsExemplars ]} } }
        }
      },
     
      ] ).toArray()

    const librariesFiltered = libraries.map(library => {
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

    console.log(librariesFiltered)
    console.log(Date.now() - y, Date.now()-x)
}

// sort()

// reindex();

