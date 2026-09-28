require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

console.log("SERVER FILE RUNNING ✅");

const connectDB = require("./config/db.js");

const app = express();

/* ================= CREATE HTTP SERVER ================= */
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Make io accessible in controllers
app.set("io", io);

/* ================= CONNECT DATABASE ================= */
connectDB();

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC FRONTEND ================= */
const clientPath = path.join(__dirname, "../client");
app.use(express.static(clientPath));

/* ================= API ROUTES ================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));

/* ================= HEALTH CHECK ================= */
app.get("/test", (req, res) => {
  res.send("WORKING ✅");
});

/* ================= PAGE ROUTES ================= */

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(clientPath, "pages", "index.html"));
});

// Login
app.get("/login", (req, res) => {
  res.sendFile(path.join(clientPath, "pages", "login.html"));
});

// Register
app.get("/register", (req, res) => {
  res.sendFile(path.join(clientPath, "pages", "register.html"));
});

// User Dashboard
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(clientPath, "pages", "userDashboard.html"));
});

// Admin Dashboard
app.get("/admin", (req, res) => {
  res.sendFile(path.join(clientPath, "pages", "adminDashboard.html"));
});

/* ================= SOCKET CONNECTION ================= */
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

/* ================= 404 HANDLER ================= */
app.use((req, res) => {
  res.status(404).json({ message: "Page not found ❌" });
});

/* ================= GLOBAL ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error(" SERVER ERROR:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});