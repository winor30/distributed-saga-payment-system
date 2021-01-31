# Buildトリガーの設定

GCP_PROJECT="YOUR_GCP_PROJECT_NAME"

PROJECT_NUMBER="YOUR_GCP_PROJECT_NUMBER"

POINT_SERVICE_URL="point-service-url"

ORDER_SERVICE_URL="order-service-url"

TICKET_SERVICE_URL="ticket-service-url"

# pubsubにcloud runを叩ける権限を与える
add-iam-pubsub:
	gcloud projects add-iam-policy-binding $(GCP_PROJECT) \
     --member=serviceAccount:service-$(PROJECT_NUMBER)@gcp-sa-pubsub.iam.gserviceaccount.com \
     --role=roles/iam.serviceAccountTokenCreator

create-service-account:
	gcloud iam service-accounts create distributed-payment-system \
     --display-name "Distributed Payment Syestem"

# point-serviceとticket-serviceをpub/subでトリガーできるように権限付与
grant-right:
	gcloud run services add-iam-policy-binding point-service \
		--member=serviceAccount:distributed-payment-system@$(GCP_PROJECT).iam.gserviceaccount.com \
		--role=roles/run.invoker \
		--region=asia-northeast1 && \
	gcloud run services add-iam-policy-binding ticket-service \
		--member=serviceAccount:distributed-payment-system@$(GCP_PROJECT).iam.gserviceaccount.com \
		--role=roles/run.invoker \
		--region=asia-northeast1

# topic作成
create-topic:
	gcloud pubsub topics create distributed-payment-system-topic

# subscription作成
create-subscriptions:
	gcloud pubsub subscriptions create order-subscription --topic distributed-payment-system-topic \
		--message-filter='attributess.event_type = "granted-ticket"' && \
	gcloud pubsub subscriptions create point-subscription --topic distributed-payment-system-topic \
		--push-endpoint=$(POINT_SERVICE_URL)/consume \
		--push-auth-service-account=distributed-payment-system@$(GCP_PROJECT).iam.gserviceaccount.com \
		--message-filter='attributess.event_type = "started-order"' && \
	gcloud pubsub subscriptions create ticket-subscription --topic distributed-payment-system-topic \
		--push-endpoint=$(TICKET_SERVICE_URL)/grant \
		--push-auth-service-account=distributed-payment-system@$(GCP_PROJECT).iam.gserviceaccount.com \
		--message-filter='attributess.event_type = "consumed-point"'

all-deploy:
	cd ./order-service &&  gcloud builds submit --config cloudbuild.yaml . && cd ../ \
	cd ./point-service &&  gcloud builds submit --config cloudbuild.yaml . && cd ../ \
	cd ./ticket-service &&  gcloud builds submit --config cloudbuild.yaml .

set-pj:
	gcloud config set project $(GCP_PROJECT)

test-order:
	curl -XPOST --data '{"userId": "p46YnOKECwwucbs7cCKh", "price": 2000, "ticketId": "2ueF2Zt5OaN2SkDJe2Tq"}' --header 'content-type: application/json' $(ORDER_SERVICE_URL)/order
