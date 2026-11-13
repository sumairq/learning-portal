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
  it("returns 409 error with duplicate email", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: email,
      password: "password123",
    });
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: email,
      password: "password123",
    });
    expect(res.status).toBe(409);
  });

  it("returns 400 error if password too short", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: email,
      password: "passwor",
    });
    const body = res.body as { errors: [{ field: string; message: string }] };
    expect(res.status).toBe(400);
    expect(body.errors[0].field).toBe("password");
    expect(body.errors[0].message).toBe(
      "Password must be at least 8 characters",
    );
  });

  it("returns 400 error if email not provided", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      password: "passwor1234",
    });
    const body = res.body as { errors: [{ field: string; message: string }] };
    expect(res.status).toBe(400);
    expect(body.errors[0].field).toBe("email");
  });

  it("Strips the role field from request body", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: email,
      password: "password1234",
      role: "instructor",
    });

    const user = await User.findOne({ email: email });
    expect(res.status).toBe(201);
    expect(user!.role).toBe("student");
  });
});
