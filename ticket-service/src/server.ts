import firestore from '@google-cloud/firestore';
import { PubSub } from '@google-cloud/pubsub';
import bodyParser from 'body-parser';
import express from 'express';
import { PubSubClient } from './client/pubsub';
import { PaymentEvent } from './domain/event';
import TicketHandler from './handler/ticket';
import { FirestoreTransactionManager } from './repository/transactional/transaction';
import { GrantedEventPublisher } from './service/grantedEventPublisher';
import { TicketCanceller } from './service/ticketCanceller';
import { TicketGranter } from './service/ticketGranter';
import { errorHandler, logErrors, pubsubHandlerWrapper } from './util/handler';

const app = express();
// jsonでrequest bodyをパースするときに必要
app.use(bodyParser.json());

const firestoreTransactionManager = new FirestoreTransactionManager(new firestore.Firestore());

const granter = new TicketGranter(firestoreTransactionManager);
const canceller = new TicketCanceller(firestoreTransactionManager);
const publisher = new GrantedEventPublisher(new PubSubClient(new PubSub()))
const ticketHandler = new TicketHandler(granter, canceller, publisher)

app.post(
  '/grant',
  pubsubHandlerWrapper<any, any, PaymentEvent>(async (req, res, next) => {
    await ticketHandler.grantTicket(req, res, next);
  })
);

app.post(
  '/cancel',
  pubsubHandlerWrapper<any, any, PaymentEvent>(async (req, res, next) => {
    await ticketHandler.cancelTicket(req, res, next);
  })
);

// エラーがスローされたときに、出力＋エラーレスポンス返す
app.use(logErrors);
app.use(errorHandler);

export default app;
