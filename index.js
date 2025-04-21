const express =require ("express");
const users =require("./MOCK_DATA.json");
const fs=require("fs");


const app = express();
const PORT =8000;

// middleware
app.use(express.urlencoded({extended: false})); 
app.use(express.json());

app.use((req, res, next)=>{
 
    fs.appendFile('log.txt',`${Date.now()}: ${req.ip}: ${req.method}: ${req.path}\n`, (err, data)=>{
    next();
  })
})


app.get("/users",(req, res)=>{   // HTML document rendering or SSR(server side rendering)
    const html=`
        <ul> 
          ${users.map(user => `<li> ${user.first_name}</li>`).join("")}
        </ul>
    `;
    res.send(html);
})

//REST APIs

app.get("/api/users",(req, res)=>{ //listing all users in JSON
    return res.json(users);
})

app.route("/api/users/:id")
.get ((req, res) =>
    { // dynamically getting users with their id's
  
    const id=Number(req.params.id);
    const user=users.find((user) => user.id === id);
    if(!user){res.status(404).json({error : "User not found"})};
    return res.json(user);
}).put((req, res) => { 
    const id = Number(req.params.id);
    const userIndex = users.findIndex((user) => user.id === id);

    users[userIndex] = { ...users[userIndex], ...req.body, id };

    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), () => {
        return res.json({ status: "updated", user: users[userIndex] });
})      
    
}).delete((req, res) => { 
    const id = Number(req.params.id);
    const userIndex = users.findIndex((user) => user.id === id);

    users.splice(userIndex, 1);

    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), () => {
        return res.json({ status: "deleted", id });
    });
})

app.post("/api/users",(req, res)=>{ 
    const body=req.body;    
    if(!body || 
       !body.first_name || 
       !body.last_name  || 
       !body.email || 
       !body.gender || 
       !body.job_title
    ){
        return res.status(400).json({msg : "All fields are required"});
    }
    users.push({...body, id: users.length+1});
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
        return res.status(201).json({status: "success", id:users.length})
    })
 
})

app.listen(PORT, ()=>{
    console.log(`Server started at PORT: ${PORT}`);
})


