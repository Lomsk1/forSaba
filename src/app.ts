import dotenv from "dotenv";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import { errorController } from "./controllers/errors/error.controller";
import userRouter from "./routes/user/user.route";
import productRouter from "./routes/product/product.routes";
import soldProductRouter from "./routes/product/soldProduct.routes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:4200", "http://127.0.0.1:4200"],
  })
);
app.options("*", cors());

app.use(express.json());

app.use(mongoSanitize());

app.use(helmet());

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

/* Routes */
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/soldProduct", soldProductRouter);

app.use(compression());

app.use(errorController);

export default app;
