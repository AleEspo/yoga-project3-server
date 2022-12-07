import {Schema, Types, model} from "mongoose"

const practiceSchema = new Schema({
    name: {type: String, required: true, trim: true},
    type: {type: String, required: true, enum: ["Personal", "Group"]},
    price: {type: Number, required: true},
    time: {type: Date, default: new Date(Date.now())},
    tag: [{type: String, enum: ["Hatha", "Vinyasa", "Yin", "Power", "Roket", "Meditation", "Vipassana"]}],
    createdAt: {type: Date, default: new Date(Date.now())},
    teacher: {type: Types.ObjectId, ref: "Teacher"},
    students: [{type: Types.ObjectId, ref: "User"}],
    orders: [{type: Types.ObjectId, ref: "Order"}],
    placesLeft: {type: Number, default: 0},
// 1.24 aula terça x orders
})

export const PracticeModel = model("Practice", practiceSchema)