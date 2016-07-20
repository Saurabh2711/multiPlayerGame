// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
app.use(express.static(__dirname + '/public'));
    

var players=[];
var a,b;
var score=100;
var gameRooms=[];
var gamers_username={};
io.on('connection', function (socket) {
    console.log("Player Connected");
    //send unique id to client (perticular client)
    socket.emit('id',{id:socket.id});
    socket.broadcast.emit('getPlayers',players);
    socket.broadcast.emit('newPlayerId',{id:socket.id});
    io.emit("showGameRooms",gameRooms);
    
    //
    var created=0;
    
    socket.on("setUsername",function(data){
       console.log(socket.id+"  :  "+data.username);
       gamers_username[socket.id]=data.username; 
    });
    
    socket.on('createGame',function(data){
        console.log("createGame Recieved");
        if(created==1)
            socket.emit('error_msg',"You have already created Game");
        else
        {
            created++;
            
            socket.join(data.room);
            sendRoomUsers(data);
            console.log(data.room);
            getUsersInRoomNumber(data.room);
            gameRooms.push({room:data.room,name:data.name});
            io.emit("showGameRooms",gameRooms);
        }
        console.log("createGame finished");
    });
    function find_index(arr,el)
    {
        for(var i=0;i<arr.length;++i)
            if(arr[i].room==el.room)
                return i;
        return -1;
    }
    
    function closeGamefun(data)
    {
        var index=find_index(gameRooms,data);
        if(index!=-1)
            gameRooms.splice(index,1);
        io.emit("showGameRooms",gameRooms);
        created--;
        
        socket.emit('afterCloseOperation',data);
    }
    
    socket.on('closeGame',function(data){
        
        closeGamefun(data);
        io.sockets.in(data.room).emit('afterCloseOperation_room',data);
        //io.sockets.in(data.room).leave(data.room);
    });
    
    
    var getUsersInRoomNumber = function(roomName, namespace) {
            if (!namespace) namespace = '/';
            var room = io.sockets.adapter.rooms[roomName];
            if (!room) return null;
            console.log(room);
            return room.length;
    }
    
    function startGame(data)
    {
        
        var a=Math.round(Math.random()*100);
        var b=Math.round(Math.random()*100);
        io.sockets.in(data.room).emit('setOnMark',{time:10000,a:a,b:b,room:data.room});
        closeGamefun(data);
    }
    
    socket.on('answerRecieve',function(data){
       console.log(data);
       if(data.a+data.b==data.ans)
            socket.emit("yourScore",{score:100,room:data.room});
       else
            socket.emit("yourScore",{score:0,room:data.room});
    });
    
    socket.on("leaveRoom",function(data){
       socket.leave(data.room);
        console.log("leaveRoom");
        getUsersInRoomNumber(data.room);
    });
    socket.on('startGame',function(data){
        console.log("start game request recieved");
        var x;
        if((x=getUsersInRoomNumber(data.room))<2)
           socket.emit('error_msg',"No user joined :"+x);
        else
           {
               startGame(data);
              // io.sockets.in(data.room).emit('error_msg',"Game is about to start ..");
           }
        console.log("start game request recieved "+x);
    });
    
    function sendRoomUsers(data)
    {
        var userInThisRoom=[];
        for(var clients in io.nsps['/'].adapter.rooms[data.room].sockets)
        {
            console.log(clients+" : "+gamers_username[clients]);
            userInThisRoom.push(gamers_username[clients]);
        }
        io.sockets.in(data.room).emit('displyUserInThisRoom',userInThisRoom);
    }
    
    function closeGamefun_auto(data)
    {
        var index=find_index(gameRooms,data);
        if(index!=-1)
            gameRooms.splice(index,1);
        io.emit("showGameRooms",gameRooms);
        io.sockets.in(data.room).emit('afterCloseOperation_auto',{room:data.room});
        
       // socket.emit('afterCloseOperation',data);
    }
    
    socket.on('done',function(){
        created--;
    });
    
    
    function startGame_auto(data)
    {
        
        var a=Math.round(Math.random()*100);
        var b=Math.round(Math.random()*100);
        io.sockets.in(data.room).emit('setOnMark',{time:10000,a:a,b:b,room:data.room});
        closeGamefun_auto(data);
    }
    socket.on("joinThisRoom",function(data){
       socket.join(data.room);
        console.log("join: "+data.room);
        sendRoomUsers(data);
       var x=getUsersInRoomNumber(data.room);
       console.log(data.room+" : "+x);
        if(x>=4)
        {
            //closeGamefun(data);
            startGame_auto(data);
            for(var clients in io.nsps['/'].adapter.rooms[data.room].sockets)
                console.log(clients);
            //io.sockets.in(data.room).emit('error_msg',"Game is about to start ..");
        }
    });
    
    
    
    
    
    
    
    //start Recieving
    /*
    socket.on('start_Game',function(){
        a=Math.round(Math.random()*100);
        b=Math.round(Math.random()*100);
        score=100;
        socket.emit('recieveGame',{a:a,b:b});
        socket.broadcast.emit('recieveGame',{a:a,b:b});
    });
    
    socket.on('createGameRoom',function(data){
        socket.join(data.id);
        socket.broadcast.emit('gameRoom',{id:data.id});
    });
    socket.on("joinRoom",function(data){
        socket.join(data.room);
        console.log(socket.id+" joined");
        io.to(data.room).emit("roomMessage","Welcome to "+data.room);
        //.broadcast.to(data.room).emit("roomMessage","Welcome to "+data.room);
         
    });
    socket.on('finishGame',function(ans){
        console.log(ans);
        if(ans.ans==(a+b))
        {
            socket.emit('score',score);
            socket.broadcast.emit('score',score);
        }
        else
        {
            socket.emit('score',0);
            socket.broadcast.emit('score',0);
        }
        score=score-20;
    });
    
    
    */
    //Handles disconnection of player
    socket.on('disconnect',function(){
       console.log("Player Disconnected"); 
        socket.broadcast.emit('playerDisconnected',{id:socket.id});
        removePlayer(socket.id);
    });
    
    players.push(socket.id);
    function removePlayer(id)
    {
        for(var i=0;i<players.length;++i)
            if(players[i]==id)
                players.splice(i,1);
    }
});