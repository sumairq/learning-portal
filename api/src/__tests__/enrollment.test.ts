import request from "supertest";
import app from "../app.js";
import Enrollment from "../models/enrollment.js";
import Course from "../models/course.js";
import User from "../models/user.js";

let studentToken: string;
let instructorToken: string;
let studentId: string;
let courseId: string;
// This setup does the following steps in order:
//- Create an instructor user directly through the User model (api is not designed to have an endpoint to create an instructor user)
//- log the instructor user in (save the instructor token in the variable instructorToken)
//- Create a course using the instructor token
//- Create a student user
//- Log the student user in (save the student token in the variable studentToken)
//- Lookup the User model and store id in studentId (we use it for creating enrollments)
//- Lookup the Course model and store id in courseId (we use it for creating enrollments)
beforeEach(async () => {
  await User.create({
    name: "John Doe",
    email: "john123@john.com",
    role: "instructor",
    password: "password1234",
  });

  const res1 = await request(app).post("/api/auth/login").send({
    email: "john123@john.com",
    password: "password1234",
  });

  const body = res1.body as { token: string };
  instructorToken = body.token;

  await request(app)
    .post("/api/courses")
    .send({
      title: "React.js Fundamentals",
      description:
        "Learn React.js from the ground up, covering components, JSX, props, state management, event handling, hooks, React Router, and API integration. Build interactive and reusable user interfaces using modern React development practices.",
      category: "programming",
      price: 0,
      lessons: [
        {
          title: "Introduction to React.js",
          videoUrl: "https://www.youtube.com/watch?v=Tn6-PIqc4UM",
          order: 1,
        },
        {
          title: "Understanding JSX and Components",
          videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk",
          order: 2,
        },
        {
          title: "Props and Component Composition",
          videoUrl: "https://www.youtube.com/watch?v=PHaECbrKgs0",
          order: 3,
        },
        {
          title: "State and Event Handling",
          videoUrl: "https://www.youtube.com/watch?v=O6P86uwfdR0",
          order: 4,
        },
        {
          title: "React Hooks: useState and useEffect",
          videoUrl: "https://www.youtube.com/watch?v=O6P86uwfdR0",
          order: 5,
        },
        {
          title: "Working with Forms in React",
          videoUrl: "https://www.youtube.com/watch?v=IYvD9oBCuJI",
          order: 6,
        },
        {
          title: "React Router and Navigation",
          videoUrl: "https://www.youtube.com/watch?v=Ul3y1LXxzdU",
          order: 7,
        },
        {
          title: "Fetching Data from APIs in React",
          videoUrl: "https://www.youtube.com/watch?v=ZqgiuPt5QZo",
          order: 8,
        },
      ],
    })
    .set("Authorization", `Bearer ${instructorToken}`);

  await request(app).post("/api/auth/register").send({
    name: "Test User",
    email: "student@student.com",
    password: "password123",
  });

  const res2 = await request(app).post("/api/auth/login").send({
    email: "student@student.com",
    password: "password123",
  });

  const body2 = res2.body as { token: string };
  studentToken = body2.token;

  const student = await User.findOne({ email: "student@student.com" });
  if (!student) throw new Error("Setup failed: student not created");

  studentId = String(student._id);

  const course = await Course.findOne({ title: "React.js Fundamentals" });
  if (!course) throw new Error("Setup failed: course not created");

  courseId = String(course._id);
});

describe("POST /api/enrollments", () => {
  it("creating an enrollment should return 201", async () => {
    // create an enrollment
    const res = await request(app)
      .post("/api/enrollments")
      .send({
        courseId,
      })
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(201);
    const enrollment = await Enrollment.findOne({ courseId });
    expect(enrollment!.amountPaid).toBe(0);
    expect(enrollment!.completedLessons).toHaveLength(0);
    expect(String(enrollment!.userId)).toBe(studentId);
  });

  it("returns 409 when the student is already enrolled", async () => {
    // create an enrollment
    await request(app)
      .post("/api/enrollments")
      .send({
        courseId,
      })
      .set("Authorization", `Bearer ${studentToken}`);

    // Try creating a second enrollment
    const res = await request(app)
      .post("/api/enrollments")
      .send({
        courseId,
      })
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(409);
    const count = await Enrollment.countDocuments({ courseId });
    expect(count).toBe(1);
  });
  it("returns 403 when an instructor tries to enroll", async () => {
    const res = await request(app)
      .post("/api/enrollments")
      .send({
        courseId,
      })
      .set("Authorization", `Bearer ${instructorToken}`);

    expect(res.status).toBe(403);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).post("/api/enrollments").send({
      courseId,
    });

    expect(res.status).toBe(401);
  });

  it("returns 404 for a course that does not exist", async () => {
    const res = await request(app)
      .post("/api/enrollments")
      .send({
        courseId: "6aecd69320fca879b1e9e63c",
      })
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 for a malformed courseId", async () => {
    const res = await request(app)
      .post("/api/enrollments")
      .send({
        courseId: "not-an-id",
      })
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(400);
  });
});
