/*
  SKYEZ UC SHOP — Cloudflare Worker + YooKassa

  Required Worker Secrets:
    YOOKASSA_SHOP_ID
    YOOKASSA_SECRET_KEY

  Endpoints:
    POST /create-payment
    POST /webhook/yookassa

  IMPORTANT:
  This Worker creates payments and receives YooKassa webhook events.
  Automatic UC delivery is intentionally not implemented here because
  the delivery provider/API and business workflow are not specified.
*/

const ALLOWED_ORIGIN = 'https://skyezucshop.github.io/SKYEZ-UC-SHOP';

const PACKS = {
  '60': {
    uc: 60,
    amount: '79.00',
    label: 'Стартовый'
  },
  '325': {
    uc: 325,
    amount: '399.00',
    label: 'Популярный'
  },
  '660': {
    uc: 660,
    amount: '799.00',
    label: 'Выгодный'
  },
  '1800': {
    uc: 1800,
    amount: '1990.00',
    label: 'Большой'
  },
  '3850': {
    uc: 3850,
    amount: '3990.00',
    label: 'Премиум'
  },
  '8100': {
    uc: 8100,
    amount: '7990.00',
    label: 'Максимум'
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders()
  });
}

function isValidPlayerId(value) {
  return /^[0-9]{5,30}$/.test(value);
}

async function createYooKassaPayment(env, body) {
  const packId = String(body.packId || '');
  const nickname = String(body.nickname || '').trim();
  const playerId = String(body.playerId || '').trim();

  const pack = PACKS[packId];

  if (!pack) {
    return json({ error: 'Неизвестный пакет UC.' }, 400);
  }

  if (!nickname || nickname.length > 40) {
    return json({ error: 'Некорректный ник.' }, 400);
  }

  if (!isValidPlayerId(playerId)) {
    return json({ error: 'Некорректный PUBG Mobile ID.' }, 400);
  }

  if (!env.YOOKASSA_SHOP_ID || !env.YOOKASSA_SECRET_KEY) {
    return json({ error: 'Платёжный сервис не настроен на сервере.' }, 500);
  }

  const auth = btoa(
    `${env.YOOKASSA_SHOP_ID}:${env.YOOKASSA_SECRET_KEY}`
  );

  const paymentBody = {
    amount: {
      value: pack.amount,
      currency: 'RUB'
    },
    capture: true,
    confirmation: {
      type: 'redirect',
      return_url:
        'https://skyezucshop.github.io/SKYEZ-UC-SHOP/success.html'
    },
    description:
      `SKYEZ UC SHOP — ${pack.uc} UC`,
    metadata: {
      shop: 'SKYEZ-UC-SHOP',
      pack_id: packId,
      uc: String(pack.uc),
      nickname,
      player_id: playerId
    }
  };

  const yooResponse = await fetch(
    'https://api.yookassa.ru/v3/payments',
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': crypto.randomUUID()
      },
      body: JSON.stringify(paymentBody)
    }
  );

  const data = await yooResponse.json();

  if (!yooResponse.ok) {
    console.error('YooKassa create payment error:', data);
    return json({
      error: 'ЮKassa не смогла создать платёж.'
    }, 502);
  }

  return json({
    success: true,
    payment_id: data.id,
    status: data.status,
    confirmation_url:
      data.confirmation?.confirmation_url || null
  });
}

async function handleYooKassaWebhook(request, env) {
  const event = await request.json();

  console.log('YooKassa webhook:', JSON.stringify(event));

  if (
    event.type === 'notification' &&
    event.event === 'payment.succeeded'
  ) {
    const payment = event.object;

    console.log('SUCCESSFUL PAYMENT', JSON.stringify({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      metadata: payment.metadata
    }));

    /*
      Здесь можно подключить автоматическую выдачу UC.

      payment.metadata содержит:
        pack_id
        uc
        nickname
        player_id

      Перед выдачей товара дополнительно рекомендуется запросить
      актуальное состояние платежа через YooKassa API и проверить
      status === "succeeded".
    */
  }

  return new Response('OK', { status: 200 });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    const url = new URL(request.url);

    try {
      if (
        request.method === 'POST' &&
        url.pathname === '/create-payment'
      ) {
        return await createYooKassaPayment(env, await request.json());
      }

      if (
        request.method === 'POST' &&
        url.pathname === '/webhook/yookassa'
      ) {
        return await handleYooKassaWebhook(request, env);
      }

      return json({
        service: 'SKYEZ UC SHOP payment API',
        status: 'online'
      });
    } catch (error) {
      console.error(error);

      return json({
        error: 'Внутренняя ошибка сервера.'
      }, 500);
    }
  }
};
