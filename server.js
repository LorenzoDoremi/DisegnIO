import express from "express";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";

const IP = process.env.YOUR_HOST || "0.0.0.0";
const port = process.env.PORT || 3000;

var minutes = 1,
  the_interval = minutes * 60 * 1000;

// funzione che viene eseguita ciclicamente dal server
setInterval(function () {
  var curr_time = new Date().getTime();
   console.log("running schedule....")
  lines.forEach((line) => {
    if(curr_time - line.time > 1000 * 60 * 10)  {
        lines.pop(line)};
        
  });
}, the_interval);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

var lines = [];
io.on("connection", (socket) => {


  /* io.sockets.socket(socket.id).emit("new_data", lines) */
  socket.on("conn", (connection) => {
    
    socket.emit("old_lines",lines);
  });
  // nuovo messaggio
  socket.on("line", (msg) => {
    lines.push(msg);
    io.emit("new_line", msg)
    
  });

  // l'utente x slogga
  socket.on("disconnect", () => {});
});

// GET FILES
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/socket.js", (req, res) => {
  res.sendFile(__dirname + "/node_modules/socket.io/client-dist/socket.io.js");
});
server.listen(port, IP, () => {
  console.log("listening on port: " + port);
});
