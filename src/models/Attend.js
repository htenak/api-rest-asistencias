const  { Schema, model } = require("mongoose");

const AttendSchema = new Schema({
    student: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: Schema.ObjectId,
        ref: 'Course',
        required: true
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
    date: {
        type: Date,
        default: Date.now
    },
    created_at: {
        type: Date,
        default: Date.now
    }
    
});

module.exports = model('Attend', AttendSchema, 'attends');