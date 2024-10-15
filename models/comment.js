const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    content: {
        type: String,
        required: true
    }
});

const Comment =  mongoose.model('Comment', commentSchema);
module.exports = Comment;
