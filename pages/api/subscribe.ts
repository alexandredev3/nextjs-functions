import { NowRequest, NowResponse } from '@vercel/node';
import { MongoClient, Db } from 'mongodb';
import url from 'url'; // ja vem com o node.

// "Db" e a tipagem da conexão.
let cachedDb: Db = null;

async function connectionToDatabase(uri: string) {
  // se ja tiver uma conexão no cachedDb, eu vou retorna a conexão que estar no cachedDb.
  if (cachedDb) {
    return cachedDb;
  }

  // conexão com o cluster(servidor mongo)
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // pegando o nome do banco de dados atraves da url.
  const dbName = url.parse(uri).pathname.substr(1);
  
  // acessando o bando de dados que estar dentro do cluster.
  const db = client.db(dbName);

  // gravando conexão no cache.
  cachedDb = db;

  return db;
}

export default async (request: NowRequest, response: NowResponse) => {
  const { email } = request.body;

  const db = await connectionToDatabase(process.env.MONGODB_URI);

  // "subscribe" e o nome da collection(tabela).
  const collection = db.collection('subscribers');

  // como argumento do "insertOne" vai os dados que queremos inserir.
  await collection.insertOne({
    email,
    subscribeAt: new Date() // data que foi inscrito na NewsLatter.
  });

  return response.status(201).json({ ok: true });
}