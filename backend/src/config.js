import dotenv from "dotenv"; dotenv.config();
export const config={port:Number(process.env.PORT||5000),mongo:process.env.MONGODB_URI||"mongodb://127.0.0.1:27017/the-chair",jwt:process.env.JWT_SECRET||"dev-secret-change-me",frontend:process.env.FRONTEND_URL||"http://localhost:3000",prod:process.env.NODE_ENV==="production"};
