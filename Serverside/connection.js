import mongoose from "mongoose";

export default async function connection(){
    const db=await mongoose.connect('mongodb://127.0.0.1:27017/TALKY-Tok');
    console.log("database connected");
    
    return db
}