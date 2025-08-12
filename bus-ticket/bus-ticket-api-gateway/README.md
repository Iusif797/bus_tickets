# Bus Ticket API‑Gateway

Node/Express прокси к Odoo (JSON‑RPC). Прячет секреты, решает CORS, даёт чистые REST ручки.

## Запуск

1. Скопируйте переменные окружения:
   ```bash
   cp .env.example .env
   ```
2. Заполните `ODOO_URL`, `ODOO_DB`, `ODOO_LOGIN`, и один из вариантов:
   - `ODOO_API_KEY` (API‑ключ пользователя), или
   - `ODOO_PASSWORD` (пароль пользователя Odoo, для временного тестового доступа)
3. Установка и запуск:
   ```bash
   npm i
   npm run dev
   ```

Сервер поднимется на порту из `PORT` (по умолчанию 3001).

## Эндпоинты (M1)
- `GET /api/stops` — `bus.stop.search_read` (поля: id, name, code)
- `GET /api/search?from=&to=&date=` — список `bus.trip` по дате (поля: id, date, sell_enabled, free_seats, capacity). Возвращает `priceFrom` (пока 0, TODO).
- `GET /api/trips/:id` — детали рейса + простая карта мест (fallback 4×10 при отсутствии seat map).
- `POST /api/reservations` — `{ trip_id, seat_no }` → создаёт резервацию с `hold_until` (+15 мин).
- `POST /api/tickets/checkout` — `{ trip_id, from_stop_id, to_stop_id, passenger:{name,email} }` → создаёт черновик билета, возвращает `{ ticket_id }`.
- `GET /api/partners` / `POST /api/partners` — пример CRUD поверх `res.partner`.

Формат ответа:
- Успех: `{ data, traceId }`
- Ошибка: `{ error:{ message, code? }, traceId }`

## Безопасность
- Odoo API‑key/пароль хранятся ТОЛЬКО на сервере. В браузер они не попадают, фронтенд общается с прокси.
- Это предотвращает кражу ключа и обходит CORS ограничение у Odoo.

## TODO (M2+)
- Расчёт `priceFrom` из `base_price` и `price_rules`.
- Реальная `seat_map` из `bus.seat.map.layout_json`.
- Политики продаж, очистка `hold_until` кроном.
- Авторизация пользователей (OAuth2/JWT).
- Платежи и webhook → обновление `bus.ticket.state`.
