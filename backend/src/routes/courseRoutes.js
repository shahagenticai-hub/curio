import { Router } from "express";
import { createCourse, listCourses, getCourse } from "../controllers/courseController.js";

const router = Router();

router.post("/", createCourse);
router.get("/", listCourses);
router.get("/:id", getCourse);

export default router;
