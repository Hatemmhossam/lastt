
const mongoose = require('mongoose');
const { Schema } = mongoose;

const voucherSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true
    }
});

const Voucher = mongoose.model('Voucher', voucherSchema);
module.exports = Voucher;
