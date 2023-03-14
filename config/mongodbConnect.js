const mongoose=require('mongoose')
 
function mongodb()
{
    mongoose.set('strictQuery', true)
mongoose.connect(process.env.DB_CONFIG)
.then(result=>{
   console.log('DataBase Connected')
})
.catch(err=>{
console.log('error :',err)
})

}
module.exports=mongodb