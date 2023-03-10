const mongoose=require('mongoose')

    const orderSchema= new mongoose.Schema({
        orderStatus:{
            type:String,
            default:"pending"
        },
        paid:{
            type:Boolean,
            default:false
        },
        address:{
            type:Object,
          
        },
        product:{
            type:Object
        },
        userId:{
            type:String
        },
        quantity:{
            type:Number
        },
        dispatch:{
            type:Date,
            default: new Date(new Date().setDate(new Date().getDate() + 7))
        },
        payment:{
            type:Object,
            default:{}
        },
        paymentType:{
            type:String,
            default:'cod'
        },
        total:{
            type:Number
        },
        amountPayable:{
            type:Number,
            default:0
        }
    },{timestamps:true})
    const orderModel= mongoose.model("order", orderSchema);
    module.exports=orderModel