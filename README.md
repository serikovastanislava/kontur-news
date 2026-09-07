# Контур — news portal

React + Vite проект, сверстанный по промо-референсу с адаптивной версией.

## Запуск локально

Требуется Node.js 18+.

```bash
npm install
npm run dev
```

После запуска Vite покажет адрес вида `http://localhost:5173/`.

## Сборка

```bash
npm run build
npm run preview
```

### Важно

В этой версии исправлен корневой `index.html`: ранее он был пустым, из-за чего Vite открывал страницу без React root и приложение не отображалось.
