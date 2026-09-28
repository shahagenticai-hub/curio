import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing. Did you create backend/.env from .env.example?");
  }

  mongoose.connection.on("connected", () => {
    console.log("[db] connected to MongoDB");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[db] connection error:", err.message);
  });

  await mongoose.connect(uri);
}
