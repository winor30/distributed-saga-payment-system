import firestore from '@google-cloud/firestore';
import { PubSub } from '@google-cloud/pubsub';
import bodyParser from 'body-parser';
import express from 'express';
import { PubSubClient } from './client/pubsub';
import { PaymentEvent } from './domain/event';
import PointHandler from './handler/point';
import { FirestoreTransactionManager } from './repository/transactional/transaction';
import { ConsumedEventPublisher } from './service/consumedEventPublisher';
import { PointConsumer } from './service/pointConsumer';
import { errorHandler, logErrors, pubsubHandlerWrapper } from './util/handler';

const app = express();
// jsonでrequest bodyをパースするときに必要
app.use(bodyParser.json());

const firestoreTransactionManager = new FirestoreTransactionManager(new firestore.Firestore());

const pointConsumer = new PointConsumer(firestoreTransactionManager);
const publisher = new ConsumedEventPublisher(new PubSubClient(new PubSub()))
const pointHandler = new PointHandler(pointConsumer, publisher)

app.post(
  '/consume',
  pubsubHandlerWrapper<any, any, PaymentEvent>(async (req, res, next) => {
    await pointHandler.consumePoint(req, res, next);
  })
);

// エラーがスローされたときに、出力＋エラーレスポンス返す
app.use(logErrors);
app.use(errorHandler);

export default app;
