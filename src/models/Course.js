const  { Schema, model } = require("mongoose");

const CourseSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    professor: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    cycle: {
        type: String,
        required: true,
        trim: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
    
});

module.exports = model('Course', CourseSchema, 'courses');