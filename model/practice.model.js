import {Schema, Types, model} from "mongoose"

const practiceSchema = new Schema({
    name: {type: String, required: true, trim: true},
    meeting: {type: String, required: true},
    type: {type: String, required: true, enum: ["Personal", "Group"]},
    price: {type: Number, required: true},
    placesLeft: {type: Number, default: 0, required: true},

    // Define Date + input time front
    date: {type: Date, required: true},
    time: {type: String, required: true},
    tag: [{type: String, enum: ["Hatha", "Vinyasa", "Yin", "Power", "Roket", "Meditation", "Vipassana"]}],
    level: [{type: String, enum: ["Beginner", "Intermediate", "Advanced"]}],
    createdAt: {type: Date, default: new Date(Date.now())},
    teacher: {type: Types.ObjectId, ref: "User"},
    students: [{type: Types.ObjectId, ref: "User"}],
    orders: [{type: Types.ObjectId, ref: "Order"}],
    description:{type: String, required: true},
    img: {type: String, required: true, default: "https://unsplash.com/photos/F2qh3yjz6Jk"},

// 1.24 aula terça x orders
})

export const PracticeModel = model("Practice", practiceSchema)