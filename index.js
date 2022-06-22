const express = require("express");
const app = express();
const PORT = process.env.PORT || 80
const db = require("./connection/db")

const {getDuration} = require("./helpers/index");
const {getDateStringFormat} = require("./helpers/index")


// Url encoded middleware

app.use(express.urlencoded({extended:false}));

// Static middleware
app.use(express.static("static"));

// Engine
app.set("view engine", "hbs");


// Connect
db.connect(function(err,client,done){

// GET ALL
app.get("/" , (req,res)=> {
    if(err) throw err;
   
    
    client.query("SELECT * FROM public.projects", (err,result)=>{
        if(err) throw err;

        let data = result.rows;
        const isPostNotThere = data.length == 0 ? true : false;
        res.render("home",{data:data,isPostNotThere})
        
    })

})


// GET SINGLE
app.get("/single/:id",(req,res)=>{
    if(err) throw err;

    const id = req.params.id;

    client.query(`SELECT * FROM public.projects WHERE id=${id}`, (err,result)=>{
        let data = result.rows[0];
        res.render("single",{data:data})
        
    });

});

app.get("/addmyproject",(req,res)=>{
    res.render("addproject")    
});

app.get("/contact",(req,res)=>{
    res.render("contact")
});

// POST
app.post("/postmyproject",(req,res)=>{

    if(err) throw err;
    const newData = req.body;

    const duration = getDuration(req.body.startDate,req.body.endDate);
    const stringDate = getDateStringFormat(req.body.startDate) + '-' + getDateStringFormat(req.body.endDate);

    const isNode = req.body.node ? true : false;
    const isReact = req.body.react ? true : false;
    const isJS = req.body.js ? true : false;
    const isCSS = req.body.css ? true : false;

    const imageUrl = '/images/pexels-pixabay-220453.jpg';


   
    client.query(`INSERT INTO public.projects("title", "startDate", "endDate", "stringDate", duration, description, img, "isNode", "isReact", "isJS", "isCSS")
        VALUES ((${newData.title}), $$newData.startDate$$, $$newData.endDate$$, $$stringDate$$, $$duration$$, 
            $$newData.description$$, $$imageUrl$$, ${isNode}, ${isReact}, ${isJS}, ${isCSS})`, (err,result)=>{
            if(err) throw err;
            res.redirect("/"); })
});

// DELETE
app.get("/deletemyproject/:id",(req,res)=>{

    
    const id = req.params.id;
    
    client.query(`DELETE FROM public.projects
	WHERE id=${id}`, (err,result)=>{
        if(err) throw err;
        res.redirect("/");
    })

})

// EDIT
     // get edit form page
app.get("/editproject/:id", (req,res)=>{
       if(err) throw err;
       const id = req.params.id;

       client.query(`SELECT * FROM public.projects WHERE id=${id}`, (err,result)=>{
        if(err) throw err;

        let data = result.rows[0];
        res.render("editproject",{dataToEdit:data})
    });
       

});
    // submit form from edit page
app.post("/editmyproject/:id",(req,res)=>{
    if(err) throw err;

    const id = req.params.id
    const updatedData = req.body;


    const duration = getDuration(req.body.startDate,req.body.endDate);
    const stringDate = getDateStringFormat(req.body.startDate) + '-' + getDateStringFormat(req.body.endDate);

    console.log(duration,stringDate)

    const isNode = req.body.node ? true : false;
    const isReact = req.body.react ? true : false;
    const isJS = req.body.js ? true : false;
    const isCSS = req.body.css ? true : false;

    const imageUrl = '/images/pexels-pixabay-220453.jpg';


    client.query(`UPDATE public.projects
	SET title=$$updatedData.title$$, "startDate"=$$updatedData.startDate$$, "endDate"=$$updatedData.endDate$$, "stringDate"=$$stringDate$$, duration=$$duration$$, description=$$updatedData.description$$, img=$$imageUrl$$, "isNode"=${isNode}, "isReact"=${isReact}, "isJS"=${isJS}, "isCSS"=${isCSS}
	WHERE id=${id}`, (err,result)=>{
      if(err) throw err;
      res.redirect("/");
    });

})


});



app.listen(PORT, ()=>{
    console.log(`Connected to ${PORT}`)
})


