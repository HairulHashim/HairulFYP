//server/models/Admin.js

const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    username: String,
    password: String
});

const AdminModel = mongoose.model("admin", AdminSchema);
module.exports = AdminModel;
