var Genre = require('../models/genre');
var async = require('async');
var mongoose = require('mongoose');
var Book = require('../models/book');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');



// Display list of all genre.
exports.genre_list = function (req, res, next) {

    Genre.find()
        .sort([['name', 'ascending']])
        .exec(function (err, list_genres) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
        });

};

// Display detail page for a specific Genre.
/*
The ID is accessed within the controller via the request parameters: req.params.id. 
It is used in Genre.findById() to get the current genre. 

It is also used to get all Book objects that have the genre ID in their genre field: 
Book.find({ 'genre': req.params.id }).
*/
exports.genre_detail = function (req, res, next) {
    var id = mongoose.Types.ObjectId(req.params.id);  
    async.parallel({
        genre: function (callback) {
            Genre.findById(id)
                .exec(callback);
        },

        genre_books: function (callback) {
            Book.find({ 'genre': id })
                .exec(callback);
        },

    }, function (err, results) {
        if (err) { return next(err); }
        if (results.genre == null) { // No results.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books });
    });

};

// Display Genre create form on GET.
// simply renders the genre_form.pug view, passing a title variable
exports.genre_create_get = function (req, res, next) {
    res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.

//the controller specifies an array of middleware functions. 
//The array is passed to the router function and each method is called in order.

exports.genre_create_post = [

    // Validate that the name field is not empty.
    body('name', 'Genre name required').isLength({ min: 1 }).trim(),

    //Sanitize (trim and escape) the name field.
    //Sanitizers run during validation do not modify the request. 
    //That is why we have to call trim() in both steps above!
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        var genre = new Genre(
            { name: req.body.name }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.
            // Check if Genre with same name already exists.
            Genre.findOne({ 'name': req.body.name })
                .exec(function (err, found_genre) {
                    if (err) { return next(err); }

                    if (found_genre) {
                        // Genre exists, redirect to its detail page.
                        res.redirect(found_genre.url);
                    }
                    else {

                        genre.save(function (err) {
                            if (err) { return next(err); }
                            // Genre saved. Redirect to genre detail page.
                            res.redirect(genre.url);
                        });

                    }

                });
        }
    }
];




// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res, next) {

    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id).exec(callback)
        },
        genre_books: function (callback) {
            Book.find({ 'genre': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.genre == null) { // No results.
            res.redirect('/catalog/genres');
        }
        // Successful, so render.
        res.render('genre_delete', {
            title: 'Delete Genre',
            genre: results.genre,
            genre_books: results.genre_books
        });
    });

};


// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res, next) {
    // First we validate that an id has been provided 
    // this is sent via the form body parameters, rather than using the version in the URL
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.body.genreid).exec(callback)
        },
        // Then we get the genre and their associated books in the same way as for the GET route
        genres_books: function (callback) {
            Book.find({ 'genre': req.body.genreid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success
        if (results.genres_books.length > 0) {
            // Genre has books. Render in same way as for GET route.
            res.render('genre_delete', { title: 'Delete Genre', 
                                        genre: results.genre, 
                                        genre_books: results.genres_books });
            return;
        }
        else {
            // Genre has no books. Delete object and redirect to the list of genres.
            Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
                if (err) { return next(err); }
                // Success - go to genre list
                res.redirect('/catalog/genres')
            })
        }
    });
};








// Display genre update form on GET.
exports.genre_update_get = function (req, res, next) {

    // Get genres for form.
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id)
                .exec(callback);
        },
       
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.genre == null) { // No results.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        
        res.render('genre_form', { title: 'Update Genre',  
                                genres: results.genre, 
                                 });
    });

};






// Handle Genre update on POST.
exports.genre_update_post = [


    // Validate fields.
    // Validate that the name field is not empty.
    body('name', 'Genre name required').isLength({ min: 1 }).trim(),
    

    // Sanitize fields.
    sanitizeBody('genre.*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Genre object with escaped/trimmed data and old id.
        var genre = new Genre(
            {
                name: req.body.name,
                genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
                _id: req.params.id //update book, we do this o.w a new ID will be assigned
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form generation.
            async.parallel({
                
                genres: function (callback) {
                    Genre.find(callback);
                },
            }, function (err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                
                res.render('genre_form', {
                   
                    genres: results.genres,
                    errors: errors.array()
                });
            });
            return;
        }
        else {
            // Data from form is valid. 
            // Update the record.
            Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err, thegenre) {
                if (err) { return next(err); }
                // Successful - redirect to book detail page.
                res.redirect(thegenre.url);
            });
        }
    }
];