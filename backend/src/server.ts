import cors from "cors";
import express from "express";
import { loadEnv } from "./env";
import { askStructured } from "./ask-core";

loadEnv();

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));


app.use(express.json());

app.post("/ask", async (req, res) => {


    try{
const {query} = req.body;
if(!query || String(query).trim() === "") {
   return res.status(400).json({error: 'Please provide a valid query'});
} 
   
const out = await askStructured(query);

return res.status(200).json(out);


    }catch(e){
        console.log(e);
        res.status(500).json({error: 'Something went wrong : now answer'});
    }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});