import request from "supertest";
import app from "../app.js";
import Enrollment from "../models/enrollment.js";
import Course from "../models/course.js";
import User from "../models/user.js";

let instructorAgent: ReturnType<typeof request.agent>;
let studentAgent: ReturnType<typeof request.agent>;
let studentId: string;
let courseId: string;
let lessonId: string;
// This setup does the following steps in order:
//- Create an instructor user directly through the User model (api is not designed to have an endpoint to create an instructor user)
//- log the instructor user in using the instructorAgent
//- Create a course using the instructorAgent
//- Create a student user using the studentAgent
//- Lookup the User model and store id in studentId (we use it for creating enrollments)
//- Lookup the Course model and store id in courseId (we use it for creating enrollments)
beforeEach(async () => {
  await User.create({
    name: "John Doe",
    email: "john123@john.com",
    role: "instructor",
    password: "password1234",
  });

  instructorAgent = request.agent(app);

  await instructorAgent.post("/api/auth/login").send({
    email: "john123@john.com",
    password: "password1234",
  });

  await instructorAgent.post("/api/courses").send({
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
  });

  studentAgent = request.agent(app);

  await studentAgent.post("/api/auth/register").send({
    name: "Test User",
    email: "student@student.com",
    password: "password123",
  });

  const student = await User.findOne({ email: "student@student.com" });
  if (!student) throw new Error("Setup failed: student not created");

  studentId = String(student._id);

  const course = await Course.findOne({ title: "React.js Fundamentals" });
  if (!course) throw new Error("Setup failed: course not created");

  courseId = String(course._id);

  const lesson = course.lessons[0];
  if (!lesson) throw new Error("Setup failed: course has no lessons");
  lessonId = String(lesson._id);
});

describe("POST /api/enrollments", () => {
  it("creating an enrollment should return 201", async () => {
    // create an enrollment
    const res = await studentAgent.post("/api/enrollments").send({
      courseId,
    });

    expect(res.status).toBe(201);
    const enrollment = await Enrollment.findOne({ courseId });
    expect(enrollment!.amountPaid).toBe(0);
    expect(enrollment!.completedLessons).toHaveLength(0);
    expect(String(enrollment!.userId)).toBe(studentId);
  });

  it("returns 409 when the student is already enrolled", async () => {
    // create an enrollment
    await studentAgent.post("/api/enrollments").send({
      courseId,
    });

    // Try creating a second enrollment
    const res = await studentAgent.post("/api/enrollments").send({
      courseId,
    });

    expect(res.status).toBe(409);
    const count = await Enrollment.countDocuments({ courseId });
    expect(count).toBe(1);
  });

  it("returns 403 when an instructor tries to enroll", async () => {
    const res = await instructorAgent.post("/api/enrollments").send({
      courseId,
    });

    expect(res.status).toBe(403);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).post("/api/enrollments").send({
      courseId,
    });

    expect(res.status).toBe(401);
  });

  it("returns 404 for a course that does not exist", async () => {
    const res = await studentAgent.post("/api/enrollments").send({
      courseId: "6aecd69320fca879b1e9e63c",
    });

    expect(res.status).toBe(404);
  });

  it("returns 400 for a malformed courseId", async () => {
    const res = await studentAgent.post("/api/enrollments").send({
      courseId: "not-an-id",
    });

    expect(res.status).toBe(400);
  });
});

describe("GET /my", () => {
  it("returns the student's enrollments with the course populated", async () => {
    await studentAgent.post("/api/enrollments").send({
      courseId,
    });

    const res = await studentAgent.get("/api/enrollments/my");

    expect(res.status).toBe(200);
    const body = res.body as { enrollments: { courseId: { title: string } }[] };
    expect(body.enrollments).toHaveLength(1);
    expect(body.enrollments[0]!.courseId).not.toHaveProperty("lessons");
    expect(body.enrollments[0]!.courseId.title).toBe("React.js Fundamentals");
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/enrollments/my");
    expect(res.status).toBe(401);
  });

  it("returns 200 when list is empty", async () => {
    const res = await studentAgent.get("/api/enrollments/my");

    expect(res.status).toBe(200);
    const body = res.body as { enrollments: unknown[] };
    expect(body.enrollments).toHaveLength(0);
  });

  // cross student test

  it("ensure two users can access only their own enrollments", async () => {
    // create user number 2

    await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "student2@student.com",
      password: "password123",
    });

    const student2Agent = request.agent(app);

    await student2Agent.post("/api/auth/login").send({
      email: "student2@student.com",
      password: "password123",
    });

    // create 2 enrollments respectively one by each user enrolled in the same course.
    //enrollment 1
    await studentAgent.post("/api/enrollments").send({
      courseId,
    });

    // enrollment 2
    await student2Agent.post("/api/enrollments").send({
      courseId,
    });

    // check student 1's enrollments
    const resUser1 = await studentAgent.get("/api/enrollments/my");

    // check student 2's enrollments
    const resUser2 = await student2Agent.get("/api/enrollments/my");

    const resbody1 = resUser1.body as {
      enrollments: { userId: string; courseId: string }[];
    };
    if (!resbody1.enrollments[0]) {
      throw new Error("User 1's enrollments are empty");
    }

    const resbody2 = resUser2.body as {
      enrollments: { userId: string; courseId: string }[];
    };

    if (!resbody2.enrollments[0]) {
      throw new Error("User 2's enrollments are empty");
    }
    // compare id of user1 with userid from enrollment
    const user2 = await User.findOne({ email: "student2@student.com" });
    if (!user2) {
      throw new Error("User was not found in the findOne lookup.");
    }
    expect(resbody1.enrollments).toHaveLength(1);
    expect(resbody2.enrollments).toHaveLength(1);
    expect(resbody1.enrollments[0].userId).toEqual(studentId);
    expect(resbody2.enrollments[0].userId).toEqual(String(user2._id));
  });
});

describe("PATCH /api/enrollments/progress", () => {
  it("Marks progress and returns 200", async () => {
    await studentAgent.post("/api/enrollments").send({
      courseId,
    });

    const res = await studentAgent.patch("/api/enrollments/progress").send({
      courseId,
      lessonId,
    });

    expect(res.status).toBe(200);

    const enrollment = await Enrollment.findOne({
      courseId,
      userId: studentId,
    });

    if (!enrollment) {
      throw new Error("Couldn't find enrollment in the database");
    }
    expect(String(enrollment.completedLessons[0])).toEqual(lessonId);
  });

  it("adding the same lesson twice leaves one entry", async () => {
    // update the progress twice. second patch should be a no-op ...

    await studentAgent.post("/api/enrollments").send({
      courseId,
    });

    await studentAgent.patch("/api/enrollments/progress").send({
      courseId,
      lessonId,
    });

    // duplicate attempt
    const res = await studentAgent.patch("/api/enrollments/progress").send({
      courseId,
      lessonId,
    });

    expect(res.status).toBe(200);
    const enrollment = await Enrollment.findOne({
      courseId,
      userId: studentId,
    });

    if (!enrollment) {
      throw new Error("Couldn't find enrollment in the database");
    }
    expect(enrollment.completedLessons).toHaveLength(1);
  });

  it("returns 404, lesson not in the course", async () => {
    await studentAgent.post("/api/enrollments").send({
      courseId,
    });

    const res = await studentAgent.patch("/api/enrollments/progress").send({
      courseId,
      lessonId: "6aecd69320fca879b1e9e63f",
    });

    expect(res.status).toBe(404);
    const body = res.body as { message: string };
    expect(body.message).toBe("Lesson not found in this course");
  });

  it("returns 404, not enrolled in this course", async () => {
    const res = await studentAgent.patch("/api/enrollments/progress").send({
      courseId,
      lessonId,
    });

    expect(res.status).toBe(404);
    const body = res.body as { message: string };
    expect(body.message).toBe("You are not enrolled in this course");
  });

  it("returns 401, not logged in", async () => {
    await studentAgent.post("/api/enrollments").send({
      courseId,
    });

    const res = await request(app).patch("/api/enrollments/progress").send({
      courseId,
      lessonId,
    });

    expect(res.status).toBe(401);
  });
});
