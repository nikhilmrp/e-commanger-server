import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "E-commerce API v1",
    timestamp: new Date().toISOString(),
  });
});

// Mount your routes here
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/products', productRoutes);

export default router;
