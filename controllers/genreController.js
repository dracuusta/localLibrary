const Genre = require("../models/genre");
const asyncHandler = require("express-async-handler");
const Book = require("../models/book");
const  {body, validationResult}= require("express-validator")
// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find().sort({ name: 1 }).exec();
  res.render("genre_list", {
    title: "Genre List",
    list_genres: allGenres,
  });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  // Get details of genre and all associated books (in parallel)
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);
  if (genre === null) {
    // No results.
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail", {
    title: "Genre Detail",
    genre: genre,
    genre_books: booksInGenre,
  });
});


// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form",{title:"Create Genre"})
};

// Handle Genre create on POST.
exports.genre_create_post = [
    // validate and sanitize the name field
    body("name","Genre must contain at least 3 characters")
    .trim()
    .isLength({min:3})
    .escape(),


    asyncHandler (async(req,res,next)=>{
      //extract the validation errors from a request
     const errors=validationResult(req);  

     const genre=new Genre({name:req.body.name})


     if(!errors.isEmpty()){
        //the data is polluted, print the form again
      res.render("genre_form",{
        title:"Create genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    }else 
  
    {
      //Data form is valid
      // Check if data with same name exists

      const genreExists=await Genre.findOne({name:req.body.name})
                                    .collation({locale:"en",strength:2}) 
                                    .exec()

      if(genreExists){
        res.redirect(genreExists.url)
      }
      else{
        await genre.save()

        res.redirect(genre.url);
      }
    }
    })
]


// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre,AllBooksByGenre]=await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({genre : req.params.id},"title summary").exec(),
  ])

  if(genre===null){
    res.redirect("/catalog/genres")
  }
  res.render("genre_delete",{
    title:"Delete Genre",
    genre:genre,
    genre_books:AllBooksByGenre,
  })
});

// Handle Genre delete on POST.
exports.genre_delete_post =asyncHandler(async(req,res,next)=>{
  const [genre,AllBooksByGenre]=await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({genre:req.params.id},"title summary").exec(),
  ])

  if(AllBooksByGenre.length>0){
    res.render("genre_delete",{
    title:"Delete Genre",
    genre:genre,
    genre_books:AllBooksByGenre,
    })
    return;
  }
  else{
    await Genre.findByIdAndDelete(req.body.genreid)
    res.redirect('/catalog/genres')
  }

})

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre=await Genre.findById(req.params.id).exec()

  if(genre===null){
    const err=new Error("No Genre found")
    err.status=404;
    return next(err);
  }

  res.render("genre_form",{
    title:"Update Genre",
    genre:genre
  })

});

// Handle Genre update on POST.
exports.genre_update_post = [
  body("name","The genre name must be at least 3 letters")
  .trim()
  .isLength({min:3})
  .escape(),

    asyncHandler (async(req,res,next)=>{
      //extract the validation errors from a request
     const errors=validationResult(req);  

     const genre=new Genre({name:req.body.name})


     if(!errors.isEmpty()){
        //the data is polluted, print the form again
      res.render("genre_form",{
        title:"Update genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    }else 
  
    {
      //Data form is valid
      // Check if data with same name exists

      const genreExists=await Genre.findOne({name:req.body.name})
                                    .collation({locale:"en",strength:2}) 
                                    .exec()
      if(genreExists){
        res.redirect(genreExists.url)
      }
      else{
        await genre.save()

        res.redirect(genre.url);
      }
    }
    })
]

