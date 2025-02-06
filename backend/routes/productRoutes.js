import express from "express";
import {
  createProduct,
  getProducts,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
