const { Router } = require("express");
const CourseControllers = require("../controllers/course.controller");
const check = require("../middlewares/auth");

const router = Router();

router.get("/test", CourseControllers.test);
router.post("/add", check.auth, CourseControllers.add);
router.get("/courses", check.auth, CourseControllers.courses);
router.put("/update/:id", check.auth, CourseControllers.update);
router.delete("/remove/:id", check.auth, CourseControllers.remove);
router.get("/cycle-courses", check.auth, CourseControllers.cycleCourses);
router.get("/my-courses", check.auth, CourseControllers.myCourses);
router.get("/course/:id", check.auth, CourseControllers.course);

module.exports = router;