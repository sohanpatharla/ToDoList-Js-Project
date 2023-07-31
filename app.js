//jshint esversion:6

const express = require("express");
const mongoose=require("mongoose");
const bodyParser = require("body-parser");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://sohanpatharla:sohanpatharla@cluster0.ijh4lvp.mongodb.net/todolsitDB");


const itemsSchema={
  name:String,
}
const Item = mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome!"
});

const item2=new Item({
  name:"Hit + to add the tasks"
});

const item3=new Item({
  name:"Hit <--- to delete tasks"
});

const defaultItems=[item1,item2,item3];

const listsSchema={
  name:String,
  items:[]
}

const List=mongoose.model("List",listsSchema);


app.get("/", function(req, res) {

  Item.find({}).then(function (foundItems){
    if (foundItems.length===0) {
      Item.insertMany(defaultItems).then(function(err) {
        console.log("Inserted into DB!");
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }   
  });
});

app.get("/:customListName",function (req,res) {
  const customListName= _.capitalize(req.params.customListName);
  List.findOne({name:customListName}).then(function(foundList){
    if(!foundList){
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();

      res.redirect("/"+customListName);
    }
    else{
      res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
    }
  })

  
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}).then(function (foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
  
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndDelete(checkedItemId).then(function (docs) {
      console.log("Deleted:"+docs);
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},{'new':true}).then(function(){
        res.redirect("/"+listName); 
    });
  }
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
