# 🧩 SOLUTION.md

## ✅ Overview

This project is a full-stack application with a focus on:

- **Searchable and paginated item listing**
- **Virtualized rendering for performance**
- **RESTful backend with file-based persistence**
- **Comprehensive testing**
- **Clean and maintainable React components**

---

## 🚀 Backend (Node + Express)

### 📁 File-Based Storage

- JSON file (`items.json`) used to persist item data.
- All read/write operations are **asynchronous** using `fs.promises`.

### 🔍 Server-Side Pagination & Search

- Supports query parameters:
  - `q`: case-insensitive name search
  - `page`: current page number
  - `pageSize`: items per page
- Example request:

### 🧠 Endpoints

| Method | Route            | Description                               |
| ------ | ---------------- | ----------------------------------------- |
| GET    | `/api/items`     | List items (with `q`, `page`, `pageSize`) |
| GET    | `/api/items/:id` | Fetch single item by ID                   |
| POST   | `/api/items`     | Add a new item                            |

### ❗ Trade-offs

- **Pros:** Simple, file-based, easy to debug
- **Cons:** Loads full data into memory → not scalable for very large datasets
- **Future:** Migrate to a DB like SQLite or MongoDB for scale

---

## 💻 Frontend (React)

### 🧭 URL-Driven State

- Uses `useSearchParams` to keep search and pagination reflected in the URL.
- Makes UI shareable/bookmarkable.

### 🖼 Virtualization with `react-window`

- Integrated to render only visible items in a scrollable list.
- Reduces DOM load for large data sets.

### 🧠 Smart Fetching

- `fetchItems` accepts `page`, `q`, and `AbortSignal`.
- Uses `AbortController` to cancel stale requests and avoid memory leaks.

### 🎨 UI/UX

- Clean, responsive layout with:
  - Styled inputs and buttons
  - Pagination controls
  - Loading and error messages
- Easily extendable to skeleton loaders or dark mode

---

## 🧪 Testing

### 🧪 Backend (Jest + Supertest)

- Resets JSON file before each test to ensure isolation.
- Covers:
  - All GET/POST routes
  - Error handling (404, empty input)
  - Query and pagination edge cases

### 🔬 Frontend (React Testing Library)

- Mocks `useData` context
- Tests:
  - Loading state
  - Search form behavior
  - Pagination buttons
  - Error state on fetch failure

### 🧪 Sample Test

```js
expect(screen.getByText(/Loading.../)).toBeInTheDocument();
await waitFor(() => expect(fetchItems).toHaveBeenCalled());
expect(screen.getByText("Apple")).toBeInTheDocument();
```
