const mongoose=require('mongoose')
const categorySchema=new mongoose.Schema({
    category:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        required:true,
        default:true
    }
})
const categoryModel=mongoose.model('category',categorySchema)
module.exports=categoryModel