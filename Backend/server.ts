import app from './src/app.js'
import "./src/services/ai.service.js";
import "./src/services/graph.service.js"

app.listen(3000,()=>{
    console.log("Server is running...")
})