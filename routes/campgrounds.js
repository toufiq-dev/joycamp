const express = require('express')
const router = express.Router()
const catchAsync = require('../utility/catchAsync')
const Campground = require('../models/campground')
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')

router.get(
  '/',
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
  })
)

router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new')
})

router.post(
  '/',
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    if (!req.body.campground)
      throw new ExpressError('Invalid Campground Data', 400)
    const campground = new Campground(req.body.campground)
    campground.author = req.user._id
    await campground.save()
    req.flash('success', 'New Campground made successfully')
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

router.get(
  '/:id',
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
      .populate({ path: 'reviews', populate: { path: 'author' } })
      .populate('author')

    if (!campground) {
      req.flash('error', `Couldn't find that campground`)
      return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
  })
)

router.get(
  '/:id/edit',
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
      req.flash('error', `Couldn't find that campground`)
      return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
  })
)

router.put(
  '/:id',
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params

    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    })
    req.flash('success', 'Updated Campground successfully')
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

router.delete(
  '/:id',
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Deleted Successfully')
    res.redirect('/campgrounds')
  })
)

module.exports = router