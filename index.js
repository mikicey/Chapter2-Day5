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
   
    
    client.query("SELECT * FROM public.projects ORDER BY id DESC", (err,result)=>{
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
    
    // Duration
    const duration = getDuration(req.body.startDate,req.body.endDate);
    const stringDate = getDateStringFormat(req.body.startDate) + '-' + getDateStringFormat(req.body.endDate);

    // Tech
    const technologies = {
        isNode: req.body.node ? true : false,
        isReact: req.body.react ? true:false,
        isJS : req.body.js ? true : false,
        isCSS : req.body.css ? true : false
    };

    // Image
    const imageUrl = '/images/pexels-pixabay-220453.jpg';

    client.query(`INSERT INTO public.projects("title", "startDate", "endDate", "stringDate", duration, description, img, projectowner_id, tech)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [newData.title, newData.startDate, newData.endDate, stringDate, duration, newData.description, imageUrl, 4 , technologies] , (err,result)=>{
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


    // Time related
    const duration = getDuration(req.body.startDate,req.body.endDate);
    const stringDate = getDateStringFormat(req.body.startDate) + '-' + getDateStringFormat(req.body.endDate);


    // Tech related
    const technologies = {
        isNode: req.body.node ? true : false,
        isReact: req.body.react ? true:false,
        isJS : req.body.js ? true : false,
        isCSS : req.body.css ? true : false
        };
    

    // Image Url
    const imageUrl = '/images/pexels-pixabay-220453.jpg';


    client.query(`UPDATE public.projects
	SET title=$1, "startDate"=$2, "endDate"=$3, "stringDate"=$4, duration=$5, description=$6, img=$7, tech=$8
	WHERE id=$9`,[updatedData.title, updatedData.startDate, updatedData.endDate, stringDate, duration, updatedData.description, imageUrl, technologies,id], (err,result)=>{
      if(err) throw err;
      res.redirect("/");
    });


})


});



app.listen(PORT, ()=>{
    console.log(`Connected to ${PORT}`)
})


