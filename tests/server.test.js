const request = require("supertest");

jest.mock("../server/prismaClient", () => ({
  product: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  order: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

const prisma = require("../server/prismaClient");
const app = require("../server/server");

describe("Server tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    const response = await request(app).post("/api/products").send({
      name: "Chocolate Cake",
      category: "Cakes",
      selectionType: "single",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(mockNewProduct);
    expect(prisma.product.create).toHaveBeenCalled();
  });

  test("POST /api/products should return 400 when required fields are missing", async () => {
    const response = await request(app).post("/api/products").send({
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

    const response = await request(app).delete("/api/products/123");

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

    const response = await request(app).patch("/api/products/123/restore");

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

    const response = await request(app).get("/api/orders");

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

    const response = await request(app).get("/api/orders");

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

  const createdOrder = {
    id: "order-1",
    ...orderPayload,
  };

  prisma.order.create.mockResolvedValue(createdOrder);

  const response = await request(app)
    .post("/api/orders")
    .send(orderPayload);

  expect(response.status).toBe(201);
  expect(response.body.message).toBe("ההזמנה נוצרה בהצלחה");
  expect(response.body.order).toEqual(createdOrder);

  expect(prisma.order.create).toHaveBeenCalled();
});

});
