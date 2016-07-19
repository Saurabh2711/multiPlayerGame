$(function() {
 
    
    $createGameButton=$("#createGame");
    $gameDisplayDiv=$("#gameDisplay");
    $inputAns=$("#inputAns");
    $gameList=$("#yourGameList");
    $activeGameRoom=$("#onlineGameRooms");
    $startGameButton=$("#startGame");
    $closeGameButton=$("#closeGame");
    $roomButton=$(".room");
    $closeGameButton.hide();
    $startGameButton.hide();
    $inputAns.hide();
    var socket = io();
    var username=prompt("Please enter Username", "Vegeta");
    if(username==null)
        username="vegeta";
    console.log(username);
    
    $createGameButton.click(function(){
        var gamename=prompt("Please enter Game Name", "gamer_team");
        if(gamename==null)
            gamename="gamer_team";
        socket.emit("createGame",{room:socket.id,name:gamename});
        $closeGameButton.show();
        $startGameButton.show();
    });
    
    $startGameButton.click(function(){
       socket.emit('startGame',{room:socket.id}); 
    });
    
    $closeGameButton.click(function(){
        socket.emit("closeGame",{room:socket.id});
    });
    
    $roomButton.click(function(){
       var room=$(this).attr("name");
       socket.emit("joinThisRoom",{room:room});
    });
    
    function addButton(data,toelement)
    {
        var element=document.createElement("button");
        element.name=data.room;
        element.className="room";
        element.innerHTML=data.name;
        element.onclick=function (){
            console.log("room clicked "+data);
            socket.emit("joinThisRoom",{room:data.room}); 
            };
        toelement.append(element).append("</br>");
    }
    socket.on("showGameRooms",function(data){
        console.log("showGameRooms recieved");
        $activeGameRoom.text("");
        console.log(data.length);
       for(var i=0;i<data.length;++i)
        {
           if(data[i].room!=socket.id)    
                addButton(data[i],$activeGameRoom);
        }
    });
    
    socket.on('setOnMark',function(data){
        $gameDisplayDiv.text("Game is starting in "+10+" sec...");
        $inputAns.show();
        var count=data.time/1000-1;
        var timer=setInterval(function(){
            if(count!=0)
                $gameDisplayDiv.text("Game is starting in "+count+" sec...");
            else
            {
                count=data.time/1000-1;
                clearInterval(timer);
                $gameDisplayDiv.text(data.a+" + "+data.b+"       "+count);
                var timer2=setInterval(function(){
                    if(count!=0)
                        $gameDisplayDiv.text(data.a+" + "+data.b+"       "+count);
                    else
                    {
                        clearInterval(timer2);
                        socket.emit('answerRecieve',{ans:$inputAns.val(),a:data.a,b:data.b});
                        $inputAns.hide();
                        $gameDisplayDiv.text("");
                    }
                count--;
                },1000);
            
            }
            count--;
        },1000);
        
            
       
    });
    
    socket.on('error_msg',function(data){
       console.log(data);
       alert(data); 
    });
    
    socket.on('afterCloseOperation',function(){
       $startGameButton.hide();
       $closeGameButton.hide();
    });
    
    socket.on('reconnect',function(){
       $startGameButton.hide();
       $closeGameButton.hide();
       $inputAns.hide();
        $inputAns.val("");
        $gameDisplayDiv.hide();
    });
    
    
    

  
});
