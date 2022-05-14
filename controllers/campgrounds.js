const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

const logger = require("/home/shivam/Desktop/Camping Grounds/logger");
var date = new Date();


module.exports.index = async (req, res) => {
    logger.info("[" + date.toGMTString() + "]" + " [/campgrounds/index] called");
    const campgrounds = await Campground.find({}).populate({
        path: 'popupText',
        strictPopulate: false,
    });
    res.render('campgrounds/index', { campgrounds })
    logger.info("[" + date.toGMTString() + "]" + " [/campgrounds/index] successful");
}

module.exports.renderNewForm = (req, res) => {
    logger.info("[" + date.toGMTString() + "]" + " [/campgrounds/new] called");
    res.render('campgrounds/new');
    logger.info("[" + date.toGMTString() + "]" + " [/campgrounds/new] successful");
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res,) => {
    logger.info("[" + date.toGMTString() + "]" + " [/campgrounds/show] called");
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
    logger.info("[" + date.toGMTString() + "]" + " [/campgrounds/show] successful");
}

module.exports.renderEditForm = async (req, res) => {
    logger.info("[" + date.toGMTString() + "]" + " [/campgrounds/edit] called");
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
    logger.info("[" + date.toGMTString() + "]" + " [/campgrounds/edit] successful");
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}