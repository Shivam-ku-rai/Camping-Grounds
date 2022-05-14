const User = require('../models/user');

const logger = require("/home/shivam/Desktop/Camping Grounds/logger");
var date = new Date();

module.exports.renderRegister = (req, res) => {
    logger.info("[" + date.toGMTString() + "]" + " [/users/register] called");
    res.render('users/register');
    logger.info("[" + date.toGMTString() + "]" + " [/users/register] successful");
}

module.exports.register = async (req, res, next) => {
    logger.info("[" + date.toGMTString() + "]" + " [/campgrounds/register] called");
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
        logger.info("[" + date.toGMTString() + "]" + " [/campgrounds/register] successful");
    } catch (e) {
        logger.error("[" + date.toGMTString() + "] " + "[/campgrounds/register]" + e);
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    logger.info("[" + date.toGMTString() + "] " + "[/users/login] called");
    res.render('users/login');
    logger.info("[" + date.toGMTString() + "] " + "[/users/login] successful");
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    // req.session.destroy();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
}