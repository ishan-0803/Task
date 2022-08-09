const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const { name } = require("ejs");
const _=require("lodash");
const date = require('date-and-time');

const app=express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ishan_0803:8791835547@cluster0.3kmz0i4.mongodb.net/todolistDB");

const itemsSchema={
    name: String
};

const Item=mongoose.model('Item',itemsSchema);

// const chanting=new Item({
//     name: "chanting"
// });

// const study=new Item({
//     name: "study"
// });

const now = new Date();
console.log(_.capitalize(date.format(now, 'ddd, MMM DD').replace(/\s+/g, '')));
const curDate=date.format(now, 'ddd, MMM DD YYYY');
const PresentDay=_.capitalize(date.format(now, 'ddd, MMM DD').replace(/\s+/g, ''));

const defaultitems=[];

const listSchema={
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){
    Item.find({},function(err,foundItems)
    {
        if(foundItems.length===0){
            Item.insertMany(defaultitems,function(err){
                if(err){
                    console.log("Haribola!!, error");
                }
                else{
                    console.log("Haribol^_^, inserted many");
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list",{listTitle: PresentDay,newListItem:foundItems});
        }
    });
});

app.post("/",function(req,res){
    const itemName=req.body.itemName;
    const listName=req.body.list;

    const item=new Item({
        name: itemName
    });

    if(listName === PresentDay){
        item.save();
        res.redirect("/");
    }
    else{  
        List.findOne({name: listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
});

app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const checkedList=req.body.listName;
//    console.log(req.body); 

    if(checkedList===PresentDay){
        Item.deleteOne({_id:checkedItemId},function(err){
            if(err){
                console.log("Haribola!!, error");
            }
            else{
                console.log("Haribol^_^, inserted many");
            }       
        });
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name: checkedList},{$pull: {items: {_id: checkedItemId}}},function(err,foundlist){
            if(!err){
                res.redirect("/"+checkedList);
            }
        });
    }
});

app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);
    if(req.params.customListName==="about"){
        res.render("about");
        return;
    }    
    // console.log(customListName);

    List.findOne({name:customListName},function(err,foundList){
            if(!err){
                if(!foundList){
                    //Creating a new list
                    const list=new List({
                        name: customListName,
                        items: defaultitems
                    });

                    list.save();
                    res.redirect("/"+customListName);
                }
                else{
                    //show an existing listITEM
                    res.render("list",{listTitle:foundList.name,newListItem:foundList.items});
                }
            }
            else{
                console.log("oops, error");
            }
        });
    });

app.get("/about",function(req,res){
    res.render("about");
});

app.listen(process.env.PORT || 3000,function(){
    console.log("Hare Krsna, Server is running on port : 3000");
});