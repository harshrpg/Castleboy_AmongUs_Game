import mongoose from 'mongoose';

const conn = {}

async function dbConnect() {
    if (conn.isConnected) {
        return
    }

    const db = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: true,
        autoIndex: true,
    })
    console.log(conn);
    conn.isConnected = db.connections[0].readyState;
    console.log(conn);
}

export default dbConnect;