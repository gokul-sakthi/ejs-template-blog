//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const path = require('path');
const _ = require('lodash');

const homeStartingContent = "Hello there...thank you for visiting this page .. This post is an experimental one to know the workings of this site. You can write your own posts..also beware that you can't delete the posts after it has been created... But I will add the feature soon. For now  please bear with it. Also you cannot create posts that have the same title.. So that's about it for now.. Wouldn't want to bore you with the pesky details..have fun now woulde we..";
const aboutContent = "This page is a small blog website with minimal featues.. please do mind the lack of options for now ...this was done with the basic technologies";
const contactContent = "now if you want to contact me .. I would be glad to send you my details. Feel free to report any errors or details other than the delete option not being included..Thanks for using this site";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-gokul:gokul123@cluster0-3ukjw.mongodb.net/blogDB", {useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify:false});

const blogSchema = new mongoose.Schema({
  title:{
    type:String,
    required:true
  },
  post:String
});

const Article = mongoose.model("Article", blogSchema);

const home = new Article ({
  title:"Home",
  post:homeStartingContent
});

const about = new Article({
  title:"About",
  post:aboutContent
});

const contact = new Article({
  title:"Contact",
  post:contactContent
});



app.get("/", (req, res) => {

  Article.find({title: {$nin:["Contact", "About"]}}, (err, foundItems) => {

    if(err) {
      console.log(err);
    } else {
      if(foundItems.length == 0) {
        // inserting documents
        Article.insertMany([home, about, contact], (err, result) => {

          if(err) {
            console.log(err);
          } else {
            console.log("Successfully Inserted");
          }

        });
        res.redirect("/");
      } else {
        res.render("home", {posts: foundItems});
      }
    }

  });

});

app.get("/posts/:postId", (req,res)=> {
  const urlPostId = req.params.postId;
  // console.log(req.params.postId);
  Article.findById({_id:urlPostId}, (err, foundPost) => {
    if(!foundPost) {
      res.render("error");
    } else {
      res.render("post", {postItem:foundPost});
    }
  });

});

app.get("/about", (req, res) => {

  Article.findOne({title:"About"}, (err, foundPost) => {
    if(err) {
      console.log(err);
    } else {
      res.render("about", {about: foundPost.post});
    }
  });

});

app.get("/contact", (req, res) => {

  Article.findOne({title:"Contact"}, (err, foundPost) => {
    if(err) {
      console.log(err);
    } else {
      res.render("contact", {contact: foundPost.post});
    }
  });

});

app.get("/compose", (req, res) => {
  res.render("compose");
});


app.post("/compose", (req, res) => {

  const composedTitle = _.capitalize(req.body.publishText);
  const composedPost = req.body.postBody;

  Article.findOne({title:composedTitle}, (err, foundPost) =>{

    if(foundPost) {
      // window.alert("Post already exists .. please change the name of title or modify it");
      res.render("compose");
    } else {
      const post = new Article({
        title:composedTitle,
        post:composedPost
      });
      post.save();
      res.redirect("/");
    }
  });

});

let port = process.env.PORT;
if(port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
