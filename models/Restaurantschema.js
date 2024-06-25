const mongoose=require('mongoose');
const schema=mongoose.Schema;

const restaurantSchema=new schema({name:String,email:String,password:String,phone:Number,location:String,openingTime:String,closingTime:String,description:String,category:String,menuUrl:String,locationUrl:String,logoUrl:String,photoUrl:String,  status: {
    type: String,
    default: 'pending' // Default value for status field
}})
const restaurantdata=mongoose.model('restaurantdataa',restaurantSchema);
module.exports=restaurantdata