const request = require("supertest");

jest.mock("../server/prismaClient", () => ({
  product: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  order: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

const prisma = require("../server/prismaClient");

process.env.ADMIN_USERNAME = "test-admin";
process.env.ADMIN_PASSWORD_HASH = "test-hash";
process.env.JWT_SECRET = "test-secret";

const jwt = require("jsonwebtoken");
const app = require("../server/server");

const adminToken = jwt.sign(
  { username: "test-admin", role: "admin" },
  process.env.JWT_SECRET,
  { expiresIn: "1h" },
);

describe("Server tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /api/admin/login should block after 5 attempts", async () => {
    const responses = [];

    for (let i = 0; i < 6; i++) {
      const response = await request(app).post("/api/admin/login").send({
        username: "wrong-user",
        password: "wrong-password",
      });

      responses.push(response.statusCode);
    }

    expect(responses.slice(0, 5)).toEqual([401, 401, 401, 401, 401]);
    expect(responses[5]).toBe(429);
  });

  test("GET / should return server status", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Bakery API is running!");
  });

  test("GET /api/products should return products", async () => {
    const mockProducts = [
      {
        id: "1",
        name: "Chocolate Cake",
        category: "Cakes",
        options: [],
      },
    ];

    prisma.product.findMany.mockResolvedValue(mockProducts);

    const response = await request(app).get("/api/products");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockProducts);
    expect(prisma.product.findMany).toHaveBeenCalled();
  });

  test("POST /api/products should return 401 without token", async () => {
    const response = await request(app).post("/api/products").send({
      name: "Chocolate Cake",
      category: "Cakes",
      selectionType: "single",
    });

    expect(response.statusCode).toBe(401);
  });

  test("POST /api/products should return 403 with invalid token", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", "Bearer invalid-token")
      .send({
        name: "Chocolate Cake",
        category: "Cakes",
        selectionType: "single",
      });

    expect(response.statusCode).toBe(403);
  });

  test("POST /api/products should return 403 for non-admin user", async () => {
    const userToken = jwt.sign(
      { username: "test-user", role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "Chocolate Cake",
        category: "Cakes",
        selectionType: "single",
      });

    expect(response.statusCode).toBe(403);
  });

  test("GET /api/products should return 500 when database fails", async () => {
    prisma.product.findMany.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/api/products");

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({
      error: "שגיאה בשליפת המוצרים",
    });
  });

  test("POST /api/products should create a new product", async () => {
    const mockNewProduct = {
      id: "2",
      name: "Chocolate Cake",
      category: "Cakes",
      selectionType: "single",
      options: [],
    };

    prisma.product.create.mockResolvedValue(mockNewProduct);

    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Chocolate Cake",
        category: "Cakes",
        selectionType: "single",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(mockNewProduct);
    expect(prisma.product.create).toHaveBeenCalled();
  });

  test("POST /api/products should return 400 when required fields are missing", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Chocolate Cake",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
      error: "חסרים פרטי חובה למוצר",
    });

    expect(prisma.product.create).not.toHaveBeenCalled();
  });

  test("DELETE /api/products/:id should deactivate a product", async () => {
    const deactivatedProduct = {
      id: "123",
      name: "Chocolate Cake",
      isActive: false,
    };

    prisma.product.update.mockResolvedValue(deactivatedProduct);

    const response = await request(app)
      .delete("/api/products/123")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.product).toEqual(deactivatedProduct);
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: "123" },
      data: { isActive: false },
    });
  });

  test("PATCH /api/products/:id/restore should restore a product", async () => {
    const restoredProduct = {
      id: "123",
      name: "Chocolate Cake",
      isActive: true,
    };

    prisma.product.update.mockResolvedValue(restoredProduct);

    const response = await request(app)
      .patch("/api/products/123/restore")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.product).toEqual(restoredProduct);
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: "123" },
      data: { isActive: true },
    });
  });

  test("GET /api/orders should return orders", async () => {
    const mockOrders = [
      {
        id: "order-1",
        customerName: "Dana",
        items: [
          {
            id: "item-1",
            product: { name: "Chocolate Cake" },
            productOption: { name: "Large" },
          },
        ],
      },
      {
        id: "order-2",
        customerName: "Roni",
        items: [],
      },
    ];

    prisma.order.findMany.mockResolvedValue(mockOrders);

    const response = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOrders);

    expect(prisma.order.findMany).toHaveBeenCalledWith({
      include: {
        items: {
          include: {
            product: true,
            productOption: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  });

  test("GET /api/orders should return 500 when database fails", async () => {
    prisma.order.findMany.mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "שגיאה בשליפת ההזמנות",
    });
  });

  test("POST /api/orders should create a new order", async () => {
    const orderPayload = {
      customerName: "Test Customer",
      customerPhone: "0501234567",
      deliveryType: "pickup",
      deliveryDate: "2026-11-01",
      deliveryTime: "10:00",
      isGift: false,
      totalAmount: 100,
      items: [
        {
          productId: "product-1",
          productOptionId: null,
          quantity: 2,
          unitPrice: 50,
        },
      ],
    };
    prisma.product.findFirst.mockResolvedValue({
      id: "product-1",
      name: "Test Product",
      basePrice: 50,
      minQuantity: null,
      isActive: true,
      options: [],
    });

    const createdOrder = {
      id: "order-1",
      ...orderPayload,
    };

    prisma.order.create.mockResolvedValue(createdOrder);

    const response = await request(app).post("/api/orders").send(orderPayload);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("ההזמנה נוצרה בהצלחה");
    expect(response.body.order).toEqual(createdOrder);

    expect(prisma.order.create).toHaveBeenCalled();
  });
});
