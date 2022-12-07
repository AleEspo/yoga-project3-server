import mongoose from "mongoose"

export async function dbConnection () {
    try {
        const connectionToDB = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`Connected to db: ${connectionToDB.connection.name}`)
    } catch (err) {
        console.log(err)
    }
}