import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please set MONGODB_URI in your .env.local file.");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
   
  var mongooseCache: MongooseCache | undefined;
}

const globalWithMongoose = global as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cached: MongooseCache = globalWithMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
};

// store cache globally in development (prevents multiple connections on hot reload)
if (process.env.NODE_ENV !== "production") {
  globalWithMongoose.mongooseCache = cached;
}

export async function dbConnect(): Promise<typeof mongoose> {
  // ✅ already connected
  if (cached.conn) {
    console.log("🟢 MongoDB already connected");
    return cached.conn;
  }

  // ✅ create connection promise if not exists
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("⏳ Connecting to MongoDB...");

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log("🚀 MongoDB connected successfully");
      console.log(`🌐 Host: ${mongoose.connection.host}`);
      console.log(`📦 DB Name: ${mongoose.connection.name}`);

      // 🔥 detect remote (MongoDB Atlas)
      if (mongoose.connection.host.includes("mongodb.net")) {
        console.log("☁️ Connected to MongoDB Atlas (Remote)");
      } else {
        console.log("🏠 Connected to Local MongoDB");
      }

      return mongoose;
    });
  }

  // ✅ wait for connection
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }

  return cached.conn;
}