import express from "express";
import cors from "cors";

// import routes
import audioRoutes from "./task1/index.js";
import imageRoutes from "./task2/index2.js";

const app = express();
app.use(cors());

// use both routes
app.use("/api", audioRoutes);
app.use("/api", imageRoutes);

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});