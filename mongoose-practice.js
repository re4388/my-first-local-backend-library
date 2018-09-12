//Import the mongoose module
var mongoose = require('mongoose');




/*Connecting to MongoDB*/
//Set up default mongoose connection
var mongoDB = 'mongodb://127.0.0.1/my_database';
mongoose.connect(mongoDB);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));





/*Defining schemas*/
//Define a schema
var Schema = mongoose.Schema;
//use the Schema constructor to create a new schema instance
var SomeModelSchema = new Schema({
    a_string: String,
    a_date: Date
});


/*Creating a model*/
// Compile model from schema
var SomeModel = mongoose.model('SomeModel', SomeModelSchema);





/****Using models ****/
/*Creating and modifying documents*/
// Create an instance of model SomeModel
var awesome_instance = new SomeModel({ name: 'awesome' });
// Save the new model instance, passing a callback
awesome_instance.save(function (err) {
    if (err) return handleError(err);
    // saved!
});

// Access model field values using dot notation
console.log(awesome_instance.name); //should log 'also_awesome'
// Change record by modifying the fields, then calling save().
awesome_instance.name = "New cool name";
awesome_instance.save(function (err) {
    if (err) return handleError(err); // saved!
});



/*Searching for records*/
var Athlete = mongoose.model('Athlete', yourSchema);
//You can search for records using query methods, specifying the query conditions as 
//a JSON document. The code fragment below shows how you might find all athletes in a 
//database that play tennis, returning just the fields for athlete name and age. 
Athlete.find({ 'sport': 'Tennis' }, 'name age', function (err, athletes) {
    if (err) return handleError(err);
    // 'athletes' contains the list of athletes that match the criteria.
})

//All callbacks in Mongoose use the pattern callback(error, result)


//If you don't specify a callback then the API will return a variable of type Query. 
//You can use this query object to build up your query and then execute it 
//(with a callback) later using the exec() method.

//i.e. find all athletes that play tennis
var query = Athlete.find({ 'sport': 'Tennis' });

// selecting the 'name' and 'age' fields
query.select('name age');

// limit our results to 5 items
query.limit(5);

// sort by age
query.sort({ age: -1 });

// execute the query at a later time
query.exec(function (err, athletes) {
    if (err) return handleError(err);
    // athletes contains an ordered list of 5 athletes who play Tennis
})


//Above we've defined the query conditions in the find() method. 
//We can also do this using a where() function, and we can chain all the parts 
//of our query together using the dot operator (.) rather than adding them separately. 

Athlete.
    find().
    where('sport').equals('Tennis').
    where('age').gt(17).lt(50).  //Additional where query
    limit(5).
    sort({ age: -1 }).
    select('name age').
    exec(callback); // where callback is the name of our callback function.




/*Working with related documents — population*/
//the following schema defines authors and stories. 
//Each author can have multiple stories, which we represent as an array of ObjectId
var mongoose = require('mongoose')
    , Schema = mongoose.Schema

var authorSchema = Schema({
    name: String,
    stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }]
});

var storySchema = Schema({
    author: { type: Schema.Types.ObjectId, ref: 'Author' },
    title: String
});

var Story = mongoose.model('Story', storySchema);
var Author = mongoose.model('Author', authorSchema);


//Below we create an author, then a story, and assign the author id 
//to our stories author field
var bob = new Author({ name: 'Bob Smith' });

bob.save(function (err) {
    if (err) return handleError(err);

    //Bob now exists, so lets create a story
    var story = new Story({
        title: "Bob goes sledding",
        author: bob._id    // assign the _id from the our author Bob. This ID is created by default!
    });

    story.save(function (err) {
        if (err) return handleError(err);
        // Bob now has his story
    });
});

// In order to get the author information in our story results we use populate()

Story
    .findOne({ title: 'Bob goes sledding' })
    .populate('author') //This populates the author id with actual author information!
    .exec(function (err, story) {
        if (err) return handleError(err);
        console.log('The author is %s', story.author.name);
        // prints "The author is Bob Smith"
    });




/* Virtual properties

var myFirstSchema = new Schema(
    {
        name: {
            first: String,
            last: String
        }
    }
);

var Person = mongoose.model("Person",myFirstSchema);

var ben = new Person(
    {
        name:{
            first:"ben",
            last: "hu"
        }
    }
);

console.log(
    ben.name.first + " " + ben.name.last
);  //ben hu

myFirstSchema.virtual("fullName").get(function() {
    return this.name.first + " " + this.name.last
})

console.log(ben.fullName);
*/




