import mongoose from 'mongoose';
import log from '../helpers/logger';

let listenersAttached = false;

function handleDisconnect(): void {
  if (!listenersAttached) {
    mongoose.connection.setMaxListeners(20);

    mongoose.connection.on('open', () => {
      log.info('Connessione al database OK');

      if (!process.env.NODE_ENV) {
        mongoose.set('debug', (coll: string, method: string, query: any, doc: any) => {
          console.log(`${coll} ${method} ${JSON.stringify(query)} ${JSON.stringify(doc)}`);
        });
      }
    });

    mongoose.connection.on('error', (err) => {
      log.info("Errore nella connessione al database. Riprovo...");
      log.debug(err);
    });

    mongoose.connection.on('disconnected', () => {
      log.info("Database disconnesso. Tentativo di riconnessione in 5s...");
      setTimeout(() => connectToDatabase(), 5000);
    });

    listenersAttached = true;
  }

  connectToDatabase();
}

function connectToDatabase() {
  mongoose.connect(process.env.MONGODB_URI_PROD || '')
    .catch((error) => {
      log.info("C'è stato un problema durante la connessione al database. Riprovare");
      log.debug(error);
    });
}

export default handleDisconnect;
