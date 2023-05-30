const { Router } = require("express");
const UserControllers = require("../controllers/user.controller");
const check = require("../middlewares/auth");

const router = Router();


router.get("/test", UserControllers.test);
router.post("/register", UserControllers.register);
router.post("/login", UserControllers.login);
router.put("/update", check.auth, UserControllers.update);
router.get("/profile", check.auth, UserControllers.profile);
router.delete("/remove/:id", check.auth, UserControllers.remove);
router.get("/users", check.auth, UserControllers.users);
router.get("/professors", check.auth, UserControllers.professors);
router.delete("/remove-students", check.auth, UserControllers.removeStudents);
router.delete("/remove-professors", check.auth, UserControllers.removeProfessors);

module.exports = router;