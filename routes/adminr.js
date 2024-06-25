const express = require('express');
const adminController=require('../controller/adminCtrl')
const router = express.Router();

router.get('/requests',adminController.viewreq);
router.post('/requests/:id/accept', adminController.accreq);
router.post('/requests/:id/decline',adminController.decreq);
router.get('/viewReservation',adminController.vres);
router.post('/addReservation',adminController.addres);
router.post('/deleteReservation/:id',adminController.delres);





module.exports=router;
