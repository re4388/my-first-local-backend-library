/*
The scheme defines an author has having String SchemaTypes for the first and family names, 
that are required and have a maximum of 100 characters, 
and Date fields for the date of birth and death.
*/


var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');



var AuthorSchema = new Schema(
    {
        first_name: { type: String, required: true, max: 100 },
        family_name: { type: String, required: true, max: 100 },
        date_of_birth: { type: Date },
        date_of_death: { type: Date },
    }
);

// Virtual for author's full name
AuthorSchema
    .virtual('name')
    .get(function () {
        return this.family_name + ', ' + this.first_name;
    });

// Virtual for author's lifespan
AuthorSchema
    .virtual('lifespan')
    .get(function () {
        return (this.date_of_death.getYear() - this.date_of_death.getYear()).toString();
    });

/*
virtual "url" returns the absolute URL required to get a particular instance of the model — 
we'll use the property in our templates whenever we need to get a link to a particular author.
*/
// Virtual for author's URL
AuthorSchema
    .virtual('url')
    .get(function () {
        return '/catalog/author/' + this._id;
    });


//Add the virtual property due_back_formatted to a more friendly format: December 6th, 2016. 
AuthorSchema
    .virtual('date_of_birth_formatted')
    .get(function () {
        return moment(this.date_of_birth).format('MMMM Do, YYYY');
    });

AuthorSchema
    .virtual('date_of_death_formatted')
    .get(function () {
        return this.date_of_death ? moment(this.date_of_death).format('MMMM Do, YYYY') : '';
    });


    

//Export model
module.exports = mongoose.model('Author', AuthorSchema);