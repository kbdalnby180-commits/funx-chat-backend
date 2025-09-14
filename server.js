const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // غيّرها فيما بعد لرابط موقعك
});

app.use(cors());
app.use(express.static("public"));

let messages = [];

io.on("connection", (socket) => {
  console.log("a user connected");

  // أرسل الرسائل القديمة عند الدخول
  messages.forEach(m => socket.emit("chat message", m));

  socket.on("chat message", (msg) => {
    msg.id = socket.id;
    msg.timestamp = Date.now(); // وقت الإرسال
    messages.push(msg);
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// مسح الرسائل الأقدم من يوم
setInterval(() => {
  const cutoff = Date.now() - (24 * 60 * 60 * 1000);
  messages = messages.filter(m => m.timestamp >= cutoff);
}, 60000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
