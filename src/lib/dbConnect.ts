import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to database");
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI! || "");
    connection.isConnected = db.connections[0].readyState;

    console.log("DB Connected Successfully");
  } catch (err) {
    console.log(err);
    console.log("DB Connection Failed");

    process.exit(1);
  }
}

export { dbConnect };
