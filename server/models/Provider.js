//server/models/Provider.js

const mongoose = require('mongoose');

const ProviderSchema = new mongoose.Schema({
    name: String,
    ssm_num: String,
    email: String,
    password: String,
    no_tel: String,
    owner_name: String,
    doe: Date,
    address: String,
    image: String,
    status: {
        type: String,
        enum: ['Pending', 'Approve', 'Blocked', 'Rejected']
    }
});

const ProviderModel = mongoose.model("providers", ProviderSchema);
module.exports = ProviderModel;
