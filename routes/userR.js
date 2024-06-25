const express = require('express');
const userController=require('../controller/userCtrl')
const router = express.Router();



router.get('/CusViewRes', userController.cvres);
router.get('/resturants', userController.restaurants);
router.get('/restaurant/:id', userController.restaurantid);
router.post('/details', userController.det);
router.get('/profile',userController.prof);
router.post('/customerssignup', userController.csu);
router.post('/restreq',userController.rere);
router.post('/signin', userController.si);
router.get('/logout', userController.lo);
router.get('/search', userController.ser);
router.post('/save-voucher',userController.savevo);
router.post('/check-voucher',userController.checkvo);

router.get('/CusViewRes',userController.cvrr);




module.exports=router;