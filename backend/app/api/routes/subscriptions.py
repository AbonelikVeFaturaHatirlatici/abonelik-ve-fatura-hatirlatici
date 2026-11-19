from fastapi import APIRouter, Body, Path, status
from typing import Annotated
from app import schemas
from app.api.deps import CurrentUser, DbSession, Today, parse_subscription_id
from app.api.openapi_meta import SUBSCRIPTION_CREATE_EXAMPLES
from app.api.responses import (
    CANCEL_CONFLICT,
    NOT_FOUND,
    SUBSCRIPTION_CONFLICT,
    UNAUTHORIZED,
    VALIDATION_ERROR,
)
from app.services import subscriptions as subscription_service

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

SubscriptionIdParam = Annotated[
    str,
    Path(description="Abonelik kimliği", json_schema_extra={"format": "uuid"}),
]


@router.post(
    "",
    operation_id="createSubscription",
    summary="Takip listesine abonelik ekler",
    status_code=status.HTTP_201_CREATED,
    response_model=schemas.Subscription,
    response_description="Abonelik eklendi",
    responses={400: VALIDATION_ERROR, 401: UNAUTHORIZED, 409: SUBSCRIPTION_CONFLICT},
)
def create_subscription(
    body: Annotated[
        schemas.SubscriptionCreate, Body(openapi_examples=SUBSCRIPTION_CREATE_EXAMPLES)
    ],
    user: CurrentUser,
    db: DbSession,
    today: Today,
) -> schemas.Subscription:
    subscription = subscription_service.create_subscription(db, user.id, body, today)
    return subscription_service.to_response(subscription, today)


@router.get(
    "",
    operation_id="listSubscriptions",
    summary="Kullanıcının aboneliklerini hatırlatmalarıyla listeler",
    response_model=list[schemas.Subscription],
    response_description="Abonelik listesi",
    responses={401: UNAUTHORIZED},
)
def list_subscriptions(
    user: CurrentUser, db: DbSession, today: Today
) -> list[schemas.Subscription]:
    subscriptions = subscription_service.list_subscriptions(db, user.id)
    return [subscription_service.to_response(s, today) for s in subscriptions]


@router.get(
    "/{id}",
    operation_id="getSubscription",
    summary="Tek bir aboneliği getirir",
    response_model=schemas.Subscription,
    response_description="Abonelik",
    responses={401: UNAUTHORIZED, 404: NOT_FOUND},
)
def get_subscription(
    id: SubscriptionIdParam, user: CurrentUser, db: DbSession, today: Today
) -> schemas.Subscription:
    subscription = subscription_service.get_subscription(
        db, user.id, parse_subscription_id(id)
    )
    return subscription_service.to_response(subscription, today)


@router.post(
    "/{id}/cancel",
    operation_id="cancelSubscription",
    summary="Aboneliği takip listesinden çıkarır",
    description=(
        "Yalnızca uygulamadaki takibi sonlandırır; servisteki gerçek abonelik iptal edilmez.\n"
        "İptalden sonra yeni hatırlatma üretilmez, daha önce üretilenler listede kalır."
    ),
    response_model=schemas.Subscription,
    response_description="Abonelik iptal edildi",
    responses={401: UNAUTHORIZED, 404: NOT_FOUND, 409: CANCEL_CONFLICT},
)
def cancel_subscription(
    id: SubscriptionIdParam, user: CurrentUser, db: DbSession, today: Today
) -> schemas.Subscription:
    subscription = subscription_service.cancel_subscription(
        db, user.id, parse_subscription_id(id)
    )
    return subscription_service.to_response(subscription, today)
