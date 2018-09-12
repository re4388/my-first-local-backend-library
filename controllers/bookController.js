var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');


/*
Display Index page

The async.parallel() method is passed an object with functions for getting the counts for 
each of our models. These functions are all started at the same time. 

When all of them have completed the final callback is invoked with the counts 
in the results parameter (or an error).
*/

exports.index = function (req, res) {

    async.parallel({
        book_count: function (callback) {
            Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        book_instance_count: function (callback) {
            BookInstance.countDocuments({}, callback);
        },
        book_instance_available_count: function (callback) {
            BookInstance.countDocuments({ status: 'Available' }, callback);
        },
        author_count: function (callback) {
            Author.countDocuments({}, callback);
        },
        genre_count: function (callback) {
            Genre.countDocuments({}, callback);
        },
    }, function (err, results) {
        res.render('index', { title: "本地圖書館首頁", error: err, data: results });
    });
};


/*
Display list of all Books.
The method uses the model's find() function to return all Book objects, 
selecting to return only the title and author as we don't need the other fields
Here we also call populate() on Book, specifying the author field—this will replace the 
stored book author id with the full author details.

On success, the callback passed to the query renders the book_list(.pug) template, 
passing the title and book_list (list of books with authors) as variables.
*/

exports.book_list = function (req, res, next) {

    Book.find({}, 'title author')
        .populate('author')
        .exec(function (err, list_books) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('book_list', { title: 'Book List', book_list: list_books });
        });

};



// Display detail page for a specific book.
exports.book_detail = function (req, res, next) {

    async.parallel({
        book: function (callback) {

            Book.findById(req.params.id)
                .populate('author')
                .populate('genre')
                .exec(callback);
        },
        book_instance: function (callback) {

            BookInstance.find({ 'book': req.params.id })
                .exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.book == null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('book_detail', { title: 'Title', book: results.book, book_instances: results.book_instance });
    });

};

// Display book create form on GET.
exports.book_create_get = function (req, res, next) {

    //Get all authors and genres, which we can use for adding to our book.
    //These are then passed to the view book_form.pug as variables named authors and genres 
    async.parallel({
        authors: function (callback) {
            Author.find(callback);
        },
        genres: function (callback) {
            Genre.find(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
    });

};




// Handle book create on POST.
exports.book_create_post = [
    // The form returns an array of Genre items (while for other fields it returns a string).
    // Convert the genre to an array.
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined')
                req.body.genre = [];
            else
                req.body.genre = new Array(req.body.genre);
        }
        next();
    },

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

    // Sanitize fields (using wildcard).
    // use a wildcard to trim and escape all fields in one go (rather than sanitising them individually)
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var book = new Book(
            {
                title: req.body.title,
                author: req.body.author,
                summary: req.body.summary,
                isbn: req.body.isbn,
                genre: req.body.genre
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function (callback) {
                    Author.find(callback);
                },
                genres: function (callback) {
                    Genre.find(callback);
                },
            }, function (err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        // Current genre is selected. Set "checked" flag.
                        results.genres[i].checked = 'true';
                    }
                }
                res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            book.save(function (err) {
                if (err) { return next(err); }
                //successful - redirect to new book record.
                res.redirect(book.url);
            });
        }
    }
];



// Display book delete form on GET.
exports.book_delete_get = function (req, res, next) {

    async.parallel({
        book: function (callback) {
            Book.findById(req.params.id).exec(callback)
        },
        books_bookinstances: function (callback) {
            BookInstance.find({ 'bookinstance': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.book == null) { // No results.
            res.redirect('/catalog/books');
        }
        // Successful, so render.
        res.render('book_delete', {
            title: 'Delete Book',
            book: results.book,
            book_bookinstances: results.books_bookinstances
        });
    });

};




// Handle Book delete on POST.
exports.book_delete_post = function (req, res, next) {
    // First we validate that an id has been provided 
    // this is sent via the form body parameters, rather than using the version in the URL
    async.parallel({
        book: function (callback) {
            Book.findById(req.body.bookid).exec(callback)
        },
        // Then we get the book and their associated bookinstances in the same way as for the GET route
        books_bookinstances: function (callback) {
            BookInstance.find({ 'bookinstance': req.body.bookinstanceid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success
        if (results.books_bookinstances.length > 0) {
            // Book has booksinstances. Render in same way as for GET route.
            res.render('book_delete', { title: 'Delete Book', 
                                        book: results.book, 
                                        book_bookinstances: results.books_bookinstances });
            return;
        }
        else {
            // Book has no booksinstances. Delete object and redirect to the list of books.
            Book.findByIdAndRemove(req.body.bookid, function deleteBook(err) {
                if (err) { return next(err); }
                // Success - go to book list
                res.redirect('/catalog/books')
            })
        }
    });
};











// Display book update form on GET.

// updating is much like creating book, will populate the form with values from the database.
exports.book_update_get = function (req, res, next) {

    // Get book, authors and genres for form.
    // uses the async.parallel() to parallel
    // (populating its genre and author fields) and lists of all the Author and Genre objects. 
    async.parallel({
        // gets the id of the Book to be updated from the URL parameter (req.params.id)
        // 找到目前要update的這本書，另外要列出author和genre
        book: function (callback) {
            Book.findById(req.params.id)
                .populate('author')
                .populate('genre')
                .exec(callback);
        },
        //找出對應的author
        authors: function (callback) {
            Author.find(callback);
        },
        //找出對應的genre
        genres: function (callback) {
            Genre.find(callback);
        },
        //其他update畫面的title, summary和ISBN沒有邏輯動作要處理

    }, function (err, results) {
        //第一個if, if there's error then pass the the next middlewave chain
        if (err) { return next(err); }
        //第二個if, to check if we have no book found error
        if (results.book == null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Success.

        // When all operations have completed it marks the currently selected genres as checked
        //把找到的genre跟這個選到的書確認然後checked
        for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
            for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                if (results.genres[all_g_iter]._id.toString() == results.book.genre[book_g_iter]._id.toString()) {
                    results.genres[all_g_iter].checked = 'true';
                }
            }
        }
        //render view page 和設定好上面找到的變數，和對應值
        res.render('book_form', { title: 'Update Book', 
                                authors: results.authors, 
                                genres: results.genres, 
                                book: results.book });
                                
    });

};

// Handle book update on POST.
exports.book_update_post = [

    // Convert the genre to an array, 本來為字串，later operation needed
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined')
                req.body.genre = [];
            else
                req.body.genre = new Array(req.body.genre);
        }
        next();
    },

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('title').trim().escape(),
    sanitizeBody('author').trim().escape(),
    sanitizeBody('summary').trim().escape(),
    sanitizeBody('isbn').trim().escape(),
    sanitizeBody('genre.*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var book = new Book(
            {
                title: req.body.title,
                author: req.body.author,
                summary: req.body.summary,
                isbn: req.body.isbn,
                genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
                _id: req.params.id //update book, we do this o.w a new ID will be assigned
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form generation.
            async.parallel({
                authors: function (callback) {
                    Author.find(callback);
                },
                genres: function (callback) {
                    Genre.find(callback);
                },
            }, function (err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked = 'true';
                    }
                }
                res.render('book_form', { title: 'Update Book', 
                                        authors: results.authors, 
                                        genres: results.genres, 
                                        book: book, 
                                        errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. 
            // Update the record.
            Book.findByIdAndUpdate(req.params.id, book, {}, function (err, thebook) {
                if (err) { return next(err); }
                // Successful - redirect to book detail page.
                res.redirect(thebook.url);
            });
        }
    }
];