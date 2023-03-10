const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
   name:{ 
    type:String,
    required:true
   },
   email:{
    type:String,
    required:true
   },
   phoneNumber:{
   type:String,
   required:true
   },
   password:{
    type:String,
    required:true
   },
   staff:{
      type:Boolean,
      default:false
   },
   address:{
      type:Array,
      default:[]
   },
   whishlist:{
      type:Array,
      default:[]
   },
   cart:{
      type:Array,
      default:[]
   },
   wallet:{
      type:Number,
      default:0
   }

})

const userModel=mongoose.model('user',userSchema)
module.exports=userModel