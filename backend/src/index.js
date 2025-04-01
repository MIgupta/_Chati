import express from 'express';
import dotenv from "dotenv";
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { ConnectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';



dotenv.config()
const app = express();
const PORT = process.env.PORT
app.use(express.json())   // for extract the json data from response body
app.use(cookieParser());
console.log(PORT)
app.use("/api/auth",authRoutes);
app.use("/api/message",messageRoutes);

app.listen(PORT, () =>{
    console.log(`Server is listening on ${PORT}`);
    ConnectDB()
});