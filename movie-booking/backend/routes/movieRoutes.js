const express = require('express');
const router = express.Router();
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getAllMoviesAdmin,
} = require('../controllers/movieController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public
router.get('/', getAllMovies);

// Admin only
router.get('/admin/all', protect, adminOnly, getAllMoviesAdmin);
router.post('/', protect, adminOnly, createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);
router.get('/:id', getMovieById);

module.exports = router;
