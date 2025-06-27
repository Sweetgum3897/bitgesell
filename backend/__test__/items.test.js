const request = require("supertest");
const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const itemsRouter = require("../src/routes/items.js");

const DATA_PATH = path.join(__dirname, "../../data/items.json");

// Sample test data
const testData = [
  { id: 1, name: "Apple", price: 10 },
  { id: 2, name: "Banana", price: 20 },
  { id: 3, name: "Apricot", price: 30 },
  { id: 4, name: "Blueberry", price: 40 },
  { id: 5, name: "Avocado", price: 50 },
];

// Helper to reset data before each test
async function resetData() {
  await fs.writeFile(DATA_PATH, JSON.stringify(testData, null, 2));
}

const app = express();
app.use(express.json());
app.use("/api/items", itemsRouter);

beforeEach(async () => {
  await resetData();
});

describe("GET /api/items", () => {
  it("should return paginated items with defaults", async () => {
    const res = await request(app).get("/api/items");
    expect(res.statusCode).toBe(200);
    expect(res.body.items.length).toBe(5); // default pageSize=10, total=5 items
    expect(res.body.total).toBe(5);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(10);
  });

  it("should paginate results properly", async () => {
    // pageSize=2, page=2 means items 3 & 4
    const res = await request(app).get("/api/items?page=2&pageSize=2");
    expect(res.statusCode).toBe(200);
    expect(res.body.items.length).toBe(2);
    expect(res.body.items[0].name).toBe("Apricot");
    expect(res.body.items[1].name).toBe("Blueberry");
    expect(res.body.page).toBe(2);
    expect(res.body.pageSize).toBe(2);
    expect(res.body.total).toBe(5);
  });

  it("should filter items by query 'q'", async () => {
    const res = await request(app).get("/api/items?q=ap");
    expect(res.statusCode).toBe(200);
    // Items with "ap" in name: Apple, Aprico (case insensitive)
    expect(res.body.total).toBe(2);
    expect(res.body.items.map((i) => i.name)).toEqual(
      expect.arrayContaining(["Apple", "Apricot"])
    );
  });

  it("should filter and paginate together", async () => {
    // q=ap filters 2 items, pageSize=2 page=1 returns the 2 items
    const res = await request(app).get("/api/items?q=ap&page=1&pageSize=2");
    expect(res.statusCode).toBe(200);
    expect(res.body.items.length).toBe(2);
    expect(res.body.items[0].name).toBe("Apple");
    expect(res.body.total).toBe(2);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(2);
  });
});

describe("GET /api/items/:id", () => {
  it("should return an item by id", async () => {
    const res = await request(app).get("/api/items/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Apple");
  });

  it("should return 404 for missing id", async () => {
    const res = await request(app).get("/api/items/999");
    expect(res.statusCode).toBe(404);
    expect(res.body.message || res.text).toMatch(/Item not found/i);
  });
});

describe("POST /api/items", () => {
  it("should create a new item", async () => {
    const newItem = { name: "Cherry", price: 60 };
    const res = await request(app).post("/api/items").send(newItem);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Cherry");
    expect(res.body).toHaveProperty("id");
  });

  it("should add item to data store", async () => {
    const newItem = { name: "Date", price: 70 };
    await request(app).post("/api/items").send(newItem);
    const res = await request(app).get("/api/items");
    expect(res.body.total).toBe(testData.length + 1);
    expect(res.body.items.some((i) => i.name === "Date")).toBe(true);
  });
});
