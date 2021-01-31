import firestore from '@google-cloud/firestore';
import { PubSub } from '@google-cloud/pubsub';
import bodyParser from 'body-parser';
import express from 'express';
import { PubSubClient } from './client/pubsub';
import OrderHandler from './handler/order';
import { FirestoreOrderRepository } from './repository/firestore/order';
import { FinishEventSubscriber } from './service/finishOrderEventSubscriber';
import { PurchaseTicketOrderer } from './service/purchaseTicketOrderer';
import { StartEventPublisher } from './service/startOrderEventPublisher';
import { asyncWrapper, errorHandler, logErrors } from './util/handler';

const app = express();
// jsonでrequest bodyをパースするときに必要
app.use(bodyParser.json());

const orderRepository = new FirestoreOrderRepository(new firestore.Firestore());
const pubsub = new PubSubClient(new PubSub());

const orderer = new PurchaseTicketOrderer(orderRepository);
const publisher = new StartEventPublisher(pubsub);
const subscriber = new FinishEventSubscriber(pubsub);
const pointHandler = new OrderHandler(orderer, publisher, subscriber)

app.post(
  '/order',
  asyncWrapper<any, any, { userId?: string; price?: number; ticketId?: string }>(async (req, res, next) => {
    await pointHandler.purchaseTicket(req, res, next);
  })
);

// エラーがスローされたときに、出力＋エラーレスポンス返す
app.use(logErrors);
app.use(errorHandler);

export default app;
