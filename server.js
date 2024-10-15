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
 setInterval(function () {
  var curr_time = new Date().getTime();
   console.log("running schedule....")
  lines.forEach((line) => {
    if(curr_time - line.life > 1000 * 60 * 5)  {
     
        lines.pop(line)};
        
  });
}, the_interval); 







const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);


// SNAKE
var foods = [];

// {id: socket, tile: []}
var snakes = [];

var snake_size = 25;
var tilex = 1200/snake_size;
var tiley = 700/snake_size;
// genera il cibo
setInterval(function () {
  
  if(snakes.length > 0) 
  {var p = {food_id: Math.trunc(Math.random()*10000), x:snake_size*parseInt(Math.random()*tilex), y: snake_size*parseInt(Math.random()*tiley) }

  foods.push(p)
  io.emit("point",p)
}
}, 3000/(Math.max(snakes.length, 1)));



setInterval(function() {
// avviso tutti della cosa
io.emit('current_snakes', snakes)
}, 1000/15)




io.on("connection", (socket) => {


  // nuovo giocatore (gli invio tutte le linee)
  socket.on("conn", (connection) => {
    
    socket.emit("old_lines",lines);
  });
  // nuovo messaggio ( app delle linee)
  socket.on("line", (msg) => {
    lines.push(msg);
    io.emit("new_line", msg)
    
  });


  // nuovo giocatore
  socket.on("new_snake", (snake) => {
     console.log("NEW SNAKE!")
     snakes.push(snake)
     socket.emit('food', foods)
     socket.emit('current_snakes', snakes)
    
  })

  // update ogni frame di tutti gli snake
  socket.on("snake", (snake_update) => {
    

    // aggiorno lo snake che ha inviato il messaggio
    snakes.forEach(snake =>  {
      if(snake.snake_id == snake_update.snake_id) {
        
        snake.tiles = snake_update.tiles
      }
    })
    

  })

   // update ogni frame di tutti gli snake
  socket.on("nickname", (snake_update) => {
    

    // aggiorno lo snake che ha inviato il messaggio
    snakes.forEach(snake =>  {
      if(snake.snake_id == snake_update.snake_id) {
        
        snake.nickname = snake_update.nickname
      }
    })
    

  })
  
  socket.on("eat", (food) => {
         
    // trova il cibo, eliminalo ed avvisa tutti
    foods.forEach((p, index) => {
      if(p.food_id == food.food_id) {
        foods.splice(index, 1)
      }
    })

    io.emit("food", foods)

   
  })

  // l'utente x slogga -> cancello il suo snake
  socket.on("disconnect", () => {

    snakes.forEach((snake, index) => {
      if(snake.snake_id == socket.id) {
        snakes.splice(index,1)
      }
    })


  });
});

// GET FILES
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/paint", (req, res) => {
  res.sendFile(__dirname + "/paint.html");
});
app.get("/socket.js", (req, res) => {
  res.sendFile(__dirname + "/node_modules/socket.io/client-dist/socket.io.js");
});
server.listen(port, IP, () => {
  console.log("listening on port: " + port);
});
