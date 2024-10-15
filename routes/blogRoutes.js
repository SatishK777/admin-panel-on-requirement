const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
// const { ensureAuthenticated } = require('../config/db');
const upload = require('../config/multer')


// View all blogs
router.get('/blogs', ensureAuthenticated, blogController.getBlogs);

// View my blogs
router.get('/my-blogs', ensureAuthenticated, blogController.getMyBlogs);

router.get('/blogs/add', ensureAuthenticated, blogController.getaddBlog);

// Add a blog
router.post('/blogs/add', ensureAuthenticated, blogController.postaddBlog);

router.get('/blogs/edit/:id', ensureAuthenticated, blogController.getEditBlog);

// Edit a blog
router.post('/blogs/edit/:id', ensureAuthenticated,upload, blogController.editBlog);

// Delete a blog
router.post('/blogs/delete/:id', ensureAuthenticated, blogController.deleteBlog);

// Get topic form
router.get('/add-topic', ensureAuthenticated, blogController.blogTopic);

// Add topic 
router.post('/add-topic', ensureAuthenticated, blogController.postBlogTopic);

// Fetch all topics
router.get('/topics', ensureAuthenticated, blogController.allTopics);

// Delete a topic (Only the owner can delete their own topics)
router.post('/delete-topic/:id', ensureAuthenticated, blogController.removeTopic);

// Render the form for adding a subtopic
router.get('/add-subtopic', ensureAuthenticated, blogController.getAddSubtopic);

// Handle subtopic submission
router.post('/add-subtopic', ensureAuthenticated, blogController.postAddSubtopic);
router.get('/subtopics',ensureAuthenticated,blogController.getSubtopics);

// Route to display topics and their subtopics
router.get('/topics-subtopics', ensureAuthenticated, blogController.getTopicsWithSubtopics);

router.post('/blogs/:id', ensureAuthenticated, blogController.addComment);
// router.get('/blogs/:id', ensureAuthenticated, blogController.getComments);


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}   

module.exports = router;
