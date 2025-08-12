# Bus Ticket Web (Vite + React)

MVP пассажирского флоу: поиск → список рейсов → детали/места → чек‑аут (без оплаты).

## Запуск

```bash
npm i
cp .env.example .env
npm run dev
```

Переменные окружения:
- `VITE_API_BASE` — базовый URL API‑gateway (по умолчанию `http://localhost:3001/api`).

Флоу:
- Домашняя страница `/` — форма поиска. Использует `/stops` для автокомплита.
- `/search` — результаты `/search` карточками.
- `/trip/:id` — детали рейса + выбор места.
- `/checkout` — форма пассажира → `POST /reservations` → `POST /tickets/checkout` → успех с `ticket_id`.

См. API‑gateway README для эндпоинтов.
