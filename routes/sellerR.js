const express = require('express');
const sellerController=require('../controller/sellerCtrl')
const router = express.Router();




router.get('/sellerReservstion', sellerController.sellres);
router.get('/dashboard', sellerController.ds);
module.exports=router;