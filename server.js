import express from "express";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";

const IP = process.env.YOUR_HOST || "0.0.0.0";
const port = process.env.PORT || 3000;

var minutes = 5,
  the_interval = minutes * 60 * 1000;


var lines = [];
// funzione che viene eseguita ciclicamente dal server
/* setInterval(function () {
  var curr_time = new Date().getTime();
   console.log("running schedule....")
  lines.forEach((line) => {
    if(curr_time - line.life > 1000 * 60 * 5)  {
     
        lines.pop(line)};
        
  });
}, the_interval); */







const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);


// SNAKE
var points = []
var snakes = [];
setInterval(function () {

  var p = {x: 400 + parseInt(Math.random()*800), y: 100+ parseInt(Math.random()*500) }
  points.push(p)
  io.emit("point",p)
}, 1000);





io.on("connection", (socket) => {



  socket.on("conn", (connection) => {
    
    socket.emit("old_lines",lines);
  });
  // nuovo messaggio
  socket.on("line", (msg) => {
    lines.push(msg);
    io.emit("new_line", msg)
    
  });

  socket.on("eat", (head) => {
         
    // trova lo snake in snakes di id socket.it
    // appendi head
    // ritorna lo snake
    io.emit("snake_g", {id: socket.id, head})
  })

  // l'utente x slogga
  socket.on("disconnect", () => {});
});

// GET FILES
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/snake", (req, res) => {
  res.sendFile(__dirname + "/snake.html");
});
app.get("/socket.js", (req, res) => {
  res.sendFile(__dirname + "/node_modules/socket.io/client-dist/socket.io.js");
});
server.listen(port, IP, () => {
  console.log("listening on port: " + port);
});
