const { Router } = require("express");
const AttendControllers = require("../controllers/attend.controler");
const check = require("../middlewares/auth");

const router = Router();

router.get("/test", AttendControllers.test);
router.post("/register", check.auth, AttendControllers.register);
router.get("/attends", check.auth, AttendControllers.attends);
router.get("/my-attends", check.auth, AttendControllers.myAttends);
router.get("/course-attends", check.auth, AttendControllers.courseAttends);

module.exports = router;