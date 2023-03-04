//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-kritagya:Test123@cluster0.fi1gj.mongodb.net/todolistDB", {useNewUrlParser : true});

const itemSchema = {
   name : String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name : "Welcome to to-do list"
});

const item2 = new Item({
  name : "Press + button to add to the list"
});

const item3 = new Item({
  name : "<-- hit this to delete"
});

const defaultItem = [item1, item2, item3];

const listSchema = {
  name : String,
  items : [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItem){
    if (foundItem.length === 0){
      Item.insertMany(defaultItem, function(err){
        if(err){
          console.log(err);
        } else {
          console.log("Default data added succesfully");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItem});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name : itemName
  });
  
  if(listName === "Today"){
    item.save();

    res.redirect("/");  
  } else {
    List.findOne({name : listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checktedItenID = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);
  if (listName === "Today"){
    Item.findByIdAndRemove(checktedItenID, function(err){
      if(err){
        console.log(err);
      } else {
        console.log("Succesfully deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name : listName}, {$pull : {items : {_id : checktedItenID}}},function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }


});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name : customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //Create List
        const list = new List({
          name : customListName,
          items : defaultItem
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list",{listTitle: customListName, newListItems: foundList.items});
      }
    }
  })
})


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started succesfully");
});
