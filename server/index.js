import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import authRoutes from "./route/authRoute.js";
import cafeRoute from "./route/cafeRoute.js";
import paymentRouter from './route/paymentRoute.js'

import { connectDB } from "./db/db.js";
connectDB();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);



app.get("/", (req, res) => {
  res.send("Hello from the Café Server!");
});

app.use("/api/auth", authRoutes);
app.use("/api/cafes", cafeRoute);
app.use('/api/payment', paymentRouter); 


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
