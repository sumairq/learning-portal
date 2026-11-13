import request from "supertest";
import app from "../app.js";
import User from "../models/user.js";

const email = "test@example.com";
describe("POST /api/auth/register", () => {
  it("creates a user and returns 201", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: email,
      password: "password123",
    });
    const body = res.body as { user: { email: string }; token: string };
    expect(res.status).toBe(201);
    expect(body.user.email).toBe(email);
    expect(body.user).not.toHaveProperty("password");
    expect(body.token).toBeDefined();
    const user = await User.findOne({ email: email }).select("+password");
    expect(user).not.toBeNull();
    expect(user!.password).not.toBe("password123");
    expect(user!.password).toMatch(/^\$2[aby]\$/);
  });
});
