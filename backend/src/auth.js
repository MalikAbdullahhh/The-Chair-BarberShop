import jwt from "jsonwebtoken"; import bcrypt from "bcryptjs"; import { config } from "./config.js"; import { User } from "./models.js";
export function sign(user){return jwt.sign({sub:user._id,role:user.role},config.jwt,{expiresIn:"7d"})}
export async function hash(v){return bcrypt.hash(v,12)} export async function verify(v,h){return bcrypt.compare(v,h)}
export async function requireAuth(req,res,next){try{const raw=req.headers.authorization?.replace(/^Bearer\s+/i,"");if(!raw)return res.status(401).json({message:"Authentication required"});const p=jwt.verify(raw,config.jwt);const u=await User.findById(p.sub);if(!u||!u.active)return res.status(401).json({message:"Invalid account"});req.user=u;next()}catch{return res.status(401).json({message:"Invalid or expired token"})}}
export function requireAdmin(req,res,next){if(req.user?.role!=="admin")return res.status(403).json({message:"Admin access required"});next()}
