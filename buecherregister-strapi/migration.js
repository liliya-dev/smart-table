const { MongoClient } = require('mongodb');

async function migration() {
  try {
    const uriFrom='mongodb://admin:Xy0879TONZM88Bki@cluster0-shard-00-00.1jzp1.mongodb.net:27017,cluster0-shard-00-01.1jzp1.mongodb.net:27017,cluster0-shard-00-02.1jzp1.mongodb.net:27017/buecherregister?ssl=true&replicaSet=atlas-6ykn4m-shard-0&authSource=admin&retryWrites=true&w=majority'
    const clientFrom = new MongoClient(encodeURI(uriFrom), { useNewUrlParser: true , useUnifiedTopology: true });
    await clientFrom.connect();
    const databaseFrom = clientFrom.db('buecherregister');
    
    const uriTarget='mongodb://db-develop:1OzygUlp58KtdYEwWNGkU6DE31JqPsCGsylqVFHqSPKi9ngOWjTv7P8FqpwYhrXEzOlUnIuaNlWYztjzdTXgJQ==@db-develop.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&replicaSet=globaldb&maxIdleTimeMS=120000&appName=@db-develop@'
    const clientTarget = new MongoClient(encodeURI(uriTarget), { useNewUrlParser: true , useUnifiedTopology: true });
    await clientTarget.connect();
    const databaseTarget = clientTarget.db('buecherregister');


    /// get all collections names
    const collections =  await (await databaseFrom.listCollections().toArray()).map(item => item.name);

    /// delete existing values, add new
      for (let i = 0; i < collections.length; i++) {
        const collectionName = collections[i];
        const dataFrom = databaseFrom.collection(collectionName);
        const cursorFrom = await dataFrom.find();
        const selectedDataFrom = await cursorFrom.toArray();
        /// delete existing values
        await databaseTarget.collection(collectionName).deleteMany();
        console.log(collectionName, selectedDataFrom.length)
        if (selectedDataFrom && selectedDataFrom.length) {
          await databaseTarget.collection(collectionName).insertMany(selectedDataFrom)
        }
      }
      console.log('migration is finished')
    }
  catch (err) {
    console.log(err.message)
  }
}

/// when move first time to rename collections

const firstTimeMigration = async () => {
  const renamedCollections = [
    {
      oldName: 'contacts',
      newName: 'contact'
    },
    {
      oldName: 'editions',
      newName: 'edition'
    },
    {
      oldName: 'libraries',
      newName: 'library'
    },
    {
      oldName: 'messages',
      newName: 'message'
    },
    {
      oldName: 'registrations',
      newName: 'registration'
    },
    {
      oldName: 'sellers',
      newName: 'seller'
    },
  ]

  try {
      const uriFrom='mongodb://admin:Xy0879TONZM88Bki@cluster0-shard-00-00.1jzp1.mongodb.net:27017,cluster0-shard-00-01.1jzp1.mongodb.net:27017,cluster0-shard-00-02.1jzp1.mongodb.net:27017/buecherregister?ssl=true&replicaSet=atlas-6ykn4m-shard-0&authSource=admin&retryWrites=true&w=majority'
      const clientFrom = new MongoClient(encodeURI(uriFrom), { useNewUrlParser: true , useUnifiedTopology: true });
      await clientFrom.connect();
      const databaseFrom = clientFrom.db('buecherregister');
      
      const uriTarget='mongodb://db-develop:1OzygUlp58KtdYEwWNGkU6DE31JqPsCGsylqVFHqSPKi9ngOWjTv7P8FqpwYhrXEzOlUnIuaNlWYztjzdTXgJQ==@db-develop.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&replicaSet=globaldb&maxIdleTimeMS=120000&appName=@db-develop@'
      const clientTarget = new MongoClient(encodeURI(uriTarget), { useNewUrlParser: true , useUnifiedTopology: true });
      await clientTarget.connect();
      const databaseTarget = clientTarget.db('buecherregister');
    
      for (let i = 0; i < renamedCollections.length; i++) {
        const collectionFrom = renamedCollections[i].oldName;
        const collectionTarget = renamedCollections[i].newName;
        const dataFrom = databaseFrom.collection(collectionFrom);
        const cursorFrom = await dataFrom.find();
        const selectedDataFrom = await cursorFrom.toArray();
        /// delete existing values
        await databaseTarget.collection(collectionTarget).deleteMany();
        console.log(collectionTarget, selectedDataFrom.length)
        if (selectedDataFrom && selectedDataFrom.length) {
          await databaseTarget.collection(collectionTarget).insertMany(selectedDataFrom)
        }
      }
      console.log('migration is finished')
  } catch (error) {
    console.log(error.message)
  }
}



const remove = async () => {
  const renamedCollections = [
    {
      oldName: 'contacts',
      newName: 'contact'
    },
    {
      oldName: 'editions',
      newName: 'edition'
    },
    {
      oldName: 'libraries',
      newName: 'library'
    },
    {
      oldName: 'messages',
      newName: 'message'
    },
    {
      oldName: 'registrations',
      newName: 'registration'
    },
    {
      oldName: 'sellers',
      newName: 'seller'
    },
  ]
  try {
    const uriTarget='mongodb://db-develop:1OzygUlp58KtdYEwWNGkU6DE31JqPsCGsylqVFHqSPKi9ngOWjTv7P8FqpwYhrXEzOlUnIuaNlWYztjzdTXgJQ==@db-develop.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&replicaSet=globaldb&maxIdleTimeMS=120000&appName=@db-develop@'
    const clientTarget = new MongoClient(encodeURI(uriTarget), { useNewUrlParser: true , useUnifiedTopology: true });
    await clientTarget.connect();
    const databaseTarget = clientTarget.db('buecherregister');
    for (let i = 0; i < renamedCollections.length; i++) {
      const collectionTarget = renamedCollections[i].oldName;
      const x = await databaseTarget.collection(collectionTarget).find().toArray()
      if(x.length) {

        await databaseTarget.collection(collectionTarget).drop();
      }
    }
    console.log('migration is finished')
  } catch (error) {
    console.log(error.message)
  }
}


// migration();
// firstTimeMigration()
// remove()
