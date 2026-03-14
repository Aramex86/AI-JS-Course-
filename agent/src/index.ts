import "dotenv/config";
import express from "express";
import cors from "cors";
import { searchRouter } from "./routes/search_Icel";

const app = express();

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN,
  }),
);

app.use(express.json());

app.use("/search", searchRouter);

const port = process.env.PORT || 5174;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
