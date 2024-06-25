const mongoose=require('mongoose');
const schema=mongoose.Schema;

const customerSchema=new schema({name:String,email:String,password:String,phone:Number,location:String})
const customerdata=mongoose.model('customerdataa',customerSchema);

module.exports=customerdata