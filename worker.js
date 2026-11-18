const SERVICE_NAMES = {
  reviews: "Наклейки для отзывов",
  website: "Наклейки для перехода на сайт",
  wifi: "Наклейки для Wi-Fi",
  other: "Другое",
};

const MAX_BODY_BYTES = 12_000;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/lead") {
      return env.ASSETS.fetch(request);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "Метод не поддерживается" }, 405, request, env);
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return json({ ok: false, error: "Слишком большой запрос" }, 413, request, env);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "Некорректный запрос" }, 400, request, env);
    }

    if (body.company) {
      return json({ ok: true }, 200, request, env);
    }

    const lead = validateLead(body);
    if (!lead.ok) {
      return json({ ok: false, error: lead.error }, 400, request, env);
    }

    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return json({ ok: false, error: "Приём заявок ещё настраивается" }, 503, request, env);
    }

    const message = [
      "Новая заявка с onetap.by",
      "",
      `Telegram: ${lead.value.telegram}`,
      `Телефон: ${lead.value.phone}`,
      `Назначение: ${SERVICE_NAMES[lead.value.service]}`,
      `Количество: ${lead.value.quantity}`,
      lead.value.comment ? `Комментарий: ${lead.value.comment}` : null,
    ].filter(Boolean).join("\n");

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: message,
          disable_web_page_preview: true,
        }),
      },
    );

    if (!telegramResponse.ok) {
      console.error("Telegram API error", telegramResponse.status);
      return json({ ok: false, error: "Не удалось отправить заявку. Попробуйте ещё раз" }, 502, request, env);
    }

    return json({ ok: true }, 200, request, env);
  },
};

export function validateLead(input) {
  if (!input || typeof input !== "object") return invalid("Заполните форму");

  const telegram = clean(input.telegram, 64);
  const phone = clean(input.phone, 32);
  const service = clean(input.service, 16);
  const quantity = clean(input.quantity, 32);
  const comment = clean(input.comment, 500);

  if (!/^@?[a-zA-Z0-9_]{5,32}$/.test(telegram)) {
    return invalid("Укажите корректный Telegram username");
  }
  if (!/^\+?[0-9 ()-]{7,24}$/.test(phone)) {
    return invalid("Укажите корректный номер телефона");
  }
  if (!Object.hasOwn(SERVICE_NAMES, service)) {
    return invalid("Выберите назначение наклеек");
  }
  if (!quantity) {
    return invalid("Укажите примерное количество");
  }

  return { ok: true, value: { telegram, phone, service, quantity, comment } };
}

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function invalid(error) {
  return { ok: false, error };
}

function corsHeaders(request, env) {
  const origin = request.headers.get("origin") || "";
  const allowedOrigin = env.ALLOWED_ORIGIN || new URL(request.url).origin;
  return {
    "access-control-allow-origin": origin === allowedOrigin ? origin : allowedOrigin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store",
    "vary": "Origin",
  };
}

function json(payload, status, request, env) {
  return Response.json(payload, { status, headers: corsHeaders(request, env) });
}
