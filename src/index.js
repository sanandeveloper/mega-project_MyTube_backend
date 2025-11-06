import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import connectDB from "./db/db.js";
const PORT = process.env.PORT || 7000;
import app from "./app.js";

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n Server is running on PORT ${PORT} \n`);
    });
    console.log("first");
  })
  .catch((err) => {
    console.log("error account while database connect to express", err);
  });
