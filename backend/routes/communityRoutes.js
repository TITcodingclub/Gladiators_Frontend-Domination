const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const verifyFirebaseToken = require('../auth/verifyFirebaseToken');

// Public routes (no authentication required)
router.get('/', communityController.getAllPosts);
router.get('/:id', communityController.getPostById);
router.get('/search', communityController.searchPosts);

// Protected routes (require authentication)
router.post('/', verifyFirebaseToken, communityController.createPost);
router.put('/:id', verifyFirebaseToken, communityController.updatePost);
router.delete('/:id', verifyFirebaseToken, communityController.deletePost);

// Interaction routes
router.post('/:id/like', verifyFirebaseToken, communityController.likePost);
router.post('/:id/comment', verifyFirebaseToken, communityController.addComment);
router.post('/:id/share', verifyFirebaseToken, communityController.sharePost);

// Comment routes
router.get('/:id/comments', communityController.getPostComments);
router.get('/comments/:commentId/replies', communityController.getCommentReplies);
router.post('/comments/:commentId/like', verifyFirebaseToken, communityController.likeComment);
router.delete('/comments/:commentId', verifyFirebaseToken, communityController.deleteComment);

// User-specific routes
router.get('/user/:uid', communityController.getUserPosts);

module.exports = router;