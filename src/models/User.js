const  { Schema, model } = require("mongoose");

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    cycle: {
        type: String,
        trim: true
    },
    dni: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        required: true,
        default: 'student'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
    
});

module.exports = model('User', UserSchema, 'users');