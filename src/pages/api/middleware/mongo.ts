import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 
  'mongodb+srv://meidan23:236952147@cluster0.wd3wl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

declare global {
  // מאפשר cache אמיתי בין reloads
  var _mongoClient: MongoClient | null;
  var _mongoDb: Db | null;
}

export async function connectToDatabase(): Promise<Db> {
  if (global._mongoDb) {
    return global._mongoDb;
  }

  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri);
    await global._mongoClient.connect();
  }

  global._mongoDb = global._mongoClient.db('sc');
  return global._mongoDb;
}
