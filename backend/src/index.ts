import { app } from "./app";
import { connectdb } from "./config/db";

connectdb()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server Started at http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error("Server Error", err);
    process.exit(1);
  });
