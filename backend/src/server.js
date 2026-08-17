import express from "express";import cors from "cors";import helmet from "helmet";import morgan from "morgan";import rateLimit from "express-rate-limit";import { connectDB } from "./db.js";import { config } from "./config.js";import { router } from "./routes.js";
await connectDB();
const app = express();
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const allowedOrigins = [
  config.frontend,
  "http://localhost:3000",
  "http://localhost:3001"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      (config.frontend && origin.startsWith(config.frontend))
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for client API integrations
  },
  credentials: true
}));app.use(express.json({limit:"1mb"}));app.use(morgan(config.prod?"combined":"dev"));app.use("/api",rateLimit({windowMs:60_000,limit:240,standardHeaders:"draft-7",legacyHeaders:false}),router);app.use((err,req,res,next)=>{console.error(err);if(err?.name==="ZodError")return res.status(400).json({message:"Validation failed",issues:err.issues});res.status(err.status||500).json({message:config.prod&&(!err.status||err.status>=500)?"Server error":err.message||"Server error"})});app.listen(config.port,()=>console.log(`THE CHAIR API on http://localhost:${config.port}`));
