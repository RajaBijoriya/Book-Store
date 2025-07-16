import dotenv from "dotenv";
import mongoose from "mongoose";
// import mongoose from "mongoose"
// import dotenv from "dotenv"

dotenv.config();

mongoose
  .connect("mongodb://127.0.0.1:27017/Authentication")
  .then(() => {
    console.log("mongoDb connected....");
  })
  .catch((err) => {
    console.log("failed connection", err);
  });

// mongoose.connect(process.env.MONGO_URL)

// mongoose.connection.on("connected" ,()=>{
//     console.log("mongoDb connected....");
// })

// mongoose.connection.on("Disconnected" ,()=>{
//     console.log("Database is not connected....");
// })

// mongoose.connection.on("error", (err)=>{
//     console.log(err);
// })

export default mongoose;
