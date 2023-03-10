const mongoose=require('mongoose')
 
function mongodb()
{
    mongoose.set('strictQuery', true)
mongoose.connect('mongodb://127.0.0.1:27017/GCART')
.then(result=>{
   console.log('DataBase Connected')
})
.catch(err=>{
console.log('error :',err)
})

}
module.exports=mongodb