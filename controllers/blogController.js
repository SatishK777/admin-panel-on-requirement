const Blog = require('../models/blogModel');
const Topic = require('../models/topicModel');
const Comment = require('../models/comment');
const upload = require('../config/multer');
const path = require('path')
const fs = require('fs')
const Subtopic = require('../models/subtopicModel');

exports.getaddBlog = (req, res) => {
  res.render('add-blog');
};

// Add Blog
exports.postaddBlog = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      req.flash('error_msg', err);
      return res.redirect('/blogs');
    } else {
      const { title, content } = req.body;
      const newBlog = new Blog({
        title,
        content,
        image: req.file ? `/uploads/${req.file.filename}` : null, // Save image path
        author: req.user._id,
      });
      await newBlog.save();
      // req.flash('success_msg', 'Blog added successfully');
      res.redirect('/my-blogs');
    }
  });
};

// Get All Blogs
exports.getBlogs = async (req, res) => {
  const blogs = await Blog.find().populate('author', 'fname');
  const comments = await Comment.find().populate('user', 'fname');
  res.render('blogs', { blogs,comments });
};

// Get My Blogs
exports.getMyBlogs = async (req, res) => {
  const blogs = await Blog.find({ author: req.user._id });
  res.render('my-blogs', { blogs });
};

exports.getEditBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog || blog.author.toString() !== req.user._id.toString()) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/my-blogs');
    }

    // Render the edit form and pass the current blog data
    res.render('edit-blog', { blog });
  } catch (err) {
    req.flash('error_msg', 'Error fetching blog details');
    res.redirect('/my-blogs');
  }
};

// Edit Blog
exports.editBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog || blog.author.toString() !== req.user._id.toString()) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/my-blogs');
    }

    // Update title and content fields
    blog.title = req.body.title;
    blog.content = req.body.content;

    // Check if a new image was uploaded
    if (req.file) {
      // Delete old image if it exists
      if (blog.image) {
        const oldImagePath = path.join(__dirname, '../public', blog.image); // Update old image path
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Delete old image
        }
      }

      // Assign the new image filename to the blog (with `/uploads/` path)
      blog.image = `/uploads/${req.file.filename}`;
    }

    // Save the updated blog post
    await blog.save();

    req.flash('success_msg', 'Blog updated successfully');
    res.redirect('/my-blogs');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating blog');
    res.redirect('/my-blogs');
  }
};


// Delete Blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    // Check if the blog exists and if the user is authorized
    if (!blog || blog.author.toString() !== req.user._id.toString()) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/my-blogs');
    }

    // Use findByIdAndDelete instead of remove
    await Blog.findByIdAndDelete(req.params.id);

    req.flash('success_msg', 'Blog deleted successfully');
    res.redirect('/my-blogs');
  } catch (err) {
    req.flash('error_msg', 'An error occurred while trying to delete the blog');
    res.redirect('/my-blogs');
  }
};


// Render Add Topic Form
// Render Add Topic Form with Topics List
exports.blogTopic = async (req, res) => {
  try {
    const topics = await Topic.find().populate('user', 'fname'); // Fetch topics and populate user info
    res.render('blogTopic', { topics, currentUserId: req.user._id }); // Pass topics and currentUserId
  } catch (error) {
    res.status(500).send('Error fetching topics');
  }
};


// Add a new topic
exports.postBlogTopic = async (req, res) => {
  const { title } = req.body;
  const userId = req.user._id; // Assuming user is authenticated

  try {
    const newTopic = new Topic({
      title,
      user: userId,
    });
    await newTopic.save();
    res.redirect('/topics-subtopics'); 
  } catch (error) {
    res.status(500).send('Error saving topic');
  }
};

// Get all topics
exports.allTopics = async (req, res) => {
  try {
    const topics = await Topic.find().populate('user', 'fname'); // Populate user info
    res.render('topics', { topics, currentUserId: req.user ? req.user._id : null }); // Pass topics and current user ID
  } catch (error) {
    res.status(500).send('Error fetching topics');
  }
};

// Remove a topic
exports.removeTopic = async (req, res) => {
  const topicId = req.params.id;
  const userId = req.user._id; 

  try {
    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).send('Topic not found');
    }

    // Ensure the logged-in user is the owner of the topic
    if (topic.user.toString() !== userId.toString()) {
      return res.status(403).send('You cannot delete this topic');
    }

    await Topic.findByIdAndDelete(topicId);
    res.redirect('/topics-subtopics');
  } catch (error) {
    res.status(500).send('Error deleting topic');
  }
};

// Render the form for adding a subtopic with existing topics
// exports.getAddSubtopic = async (req, res) => {
//   try {
//     const topics = await Topic.find(); 
//     res.render('addSubtopic', { topics }); 
//   } catch (error) {
//     res.status(500).send('Error fetching topics');
//   }
// };


exports.getAddSubtopic = async (req, res) => {
  try {
    // Fetch all existing topics and subtopics
    const topics = await Topic.find();
    const subtopics = await Subtopic.find().populate('topic', 'title');

    // Render the form with topics and subtopics
    res.render('addSubtopic', { topics, subtopics }); // Pass topics and subtopics to the view
  } catch (error) {
    res.status(500).send('Error fetching topics or subtopics');
  }
};

// Handle subtopic submission
exports.postAddSubtopic = async (req, res) => {
  const { topicId, subtopic } = req.body;

  try {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).send('Topic not found');
    }

    // Create the new subtopic
    const newSubtopic = new Subtopic({
      title: subtopic,
      topic: topicId,
      user: req.user._id,
    });

    await newSubtopic.save();

    // Update the topic to include the newly created subtopic
    topic.subtopics.push(newSubtopic._id);
    await topic.save();

    res.redirect('/topics-subtopics');
  } catch (error) {
    res.status(500).send('Error saving subtopic');
  }
};


// exports.getSubtopics = async (req, res) => {
//   try {
//     const subtopics = await Subtopic.find().populate('topic', 'title').populate('user', 'fname');
//     res.render('addSubtopic', { subtopics }); 
//   } catch (error) {
//     console.error('Error fetching subtopics:', error);
//     res.status(500).send('Error fetching subtopics');
//   }
// };

exports.getSubtopics = async (req, res) => {
  try {
    const topics = await Topic.find(); // Fetch topics to pass them to the view
    const subtopics = await Subtopic.find().populate('topic', 'title').populate('user', 'fname');
    
    // Render the 'addSubtopic' view and pass both topics and subtopics
    res.render('addSubtopic', { topics, subtopics }); 
  } catch (error) {
    console.error('Error fetching subtopics:', error);
    res.status(500).send('Error fetching subtopics');
  }
};



// Display all topics with their subtopics
exports.getTopicsWithSubtopics = async (req, res) => {
  try {
    // Fetch all topics and populate their subtopics and users
    const topics = await Topic.find()
      .populate('user', 'fname _id')
      .populate({
        path: 'subtopics',
        populate: { path: 'user', select: 'fname _id' },
      });

      const currentUserId = req.user ? req.user._id : null;

    res.render('topicsWithSubtopics', { topics , currentUserId });
  } catch (error) {
    console.error('Error fetching topics and subtopics:', error);
    res.status(500).send('Error fetching topics and subtopics');
  }
};

exports.addComment = async (req, res) => {
  try {
      const newComment = new Comment({
          blogId: req.params.id, 
          user: req.user._id,    
          content: req.body.comment 
      });

      await newComment.save();
      res.redirect('/blogs');
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
};


