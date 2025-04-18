import * as controller from "@/controllers/meli-melo.controller";
import { Router } from "express";

const router = Router();

router.get("/", controller.getMeliMelos);
router.get("/:id", controller.getMeliMelo);
router.post("/", controller.createMeliMelo);
router.put("/:id", controller.updateMeliMelo);
router.delete("/:id", controller.deleteMeliMelo);

export default router;