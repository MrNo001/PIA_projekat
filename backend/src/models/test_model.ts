import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
    polje1:{type:String},
    polje2:{type:String}
});

export default mongoose.model("testSchemaNAme",testSchema);