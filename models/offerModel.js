const mongoose=require('mongoose')
const bannerSchema=new mongoose.Schema({
    banner:{
        type:String,
        required:true
    },

    image:{
        type:Object,
        required:true
    },
    url:{
        type:String,
        required:true
    }
})
const bannerModel=mongoose.model('banners',bannerSchema)
module.exports=bannerModel