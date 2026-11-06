import app from './src/app.js'
import "./src/services/ai.service.js";
import "./src/services/graph.service.js"

app.get("/health",(req,res)=>{
    res.status(200).json({
        message:"Server is healthy and good"
    })
})

app.listen(3000,()=>{
    console.log("Server is running...")
})