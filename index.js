// If you're using environment variables, uncomment and configure dotenv
// import dotenv from 'dotenv';
// dotenv.config();
import dbConfig from "./config/dbConfig.js"
import express from "express";
import cors from "cors";
import router from "./routes/userRoutes.js";
import bookRouter from "./routes/bookRoutes.js";

const app = express();

const PORT = 7000 || 9000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api", router);
app.use("/uploads", express.static("uploads"));
app.use("/api/books", bookRouter);

app.listen(PORT, () => {
  console.log(`server is fun on port no http://localhost:${PORT}`);
});