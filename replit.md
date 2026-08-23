# Інформатика та ШІ — Збірник ресурсів

Вебсайт-бібліотека навчальних ресурсів для вчителів і студентів, які вивчають інформатику та штучний інтелект. Містить курси, статті, інструменти, відео та набори даних із фільтрацією за категорією, тегами та пошуком.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — запустити API сервер (порт 8080)
- `pnpm --filter @workspace/edtech-resources run dev` — запустити фронтенд (порт 22480)
- `pnpm run typecheck` — повна перевірка типів по всіх пакетах
- `pnpm run build` — typecheck + build всіх пакетів
- `pnpm --filter @workspace/api-spec run codegen` — перегенерувати API hooks та Zod-схеми з OpenAPI-специфікації
- `pnpm --filter @workspace/db run push` — застосувати зміни схеми БД (тільки dev)
- Required env: `DATABASE_URL` — рядок підключення до Postgres

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (`artifacts/edtech-resources`)
- API: Express 5 (`artifacts/api-server`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (з OpenAPI-специфікації)
- Styling: Tailwind CSS + shadcn/ui

## Where things live

- `lib/api-spec/openapi.yaml` — єдине джерело правди для API-контракту
- `lib/db/src/schema/resources.ts` — схема таблиці ресурсів
- `artifacts/api-server/src/routes/` — маршрути: resources, categories, tags, stats
- `artifacts/edtech-resources/src/` — React-фронтенд

## Architecture decisions

- OpenAPI-first: специфікація генерує React Query hooks та Zod-схеми — жодного ручного написання типів
- Integers in OpenAPI: використовуємо `type: number` (не `integer`), бо Orval генерує `zod.int()` несумісний із Zod v3
- Path params: передаються як `string` у специфікації для уникнення конфліктів Zod codegen
- Tags фільтрація: реалізована в памʼяті (array contains складна в SQL з Drizzle)

## Product

- **Головна** (`/`) — герой-секція, статистика, вибрані ресурси, швидкі посилання на категорії
- **Ресурси** (`/resources`) — повний каталог із пошуком і фільтрами (категорія, тег, тип, рівень)
- **Деталі ресурсу** (`/resources/:id`) — повна сторінка ресурсу із зовнішнім посиланням
- **Категорії** (`/categories`) — огляд усіх категорій із лічильниками

## User preferences

_Заповнюється в процесі роботи._

## Gotchas

- Orval 8.23+ з `type: integer` генерує `zod.int()` → не компілюється з Zod v3. Використовуй `type: number`.
- Фронтенд використовує `BASE_PATH` та `PORT` з середовища — не хардкоди порти у vite.config.
- Запускай codegen після кожної зміни `openapi.yaml`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
