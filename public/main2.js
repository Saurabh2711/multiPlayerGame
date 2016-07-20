$(function() {
 
    
    $createGameButton=$("#createGame");
    $gameDisplayDiv=$("#gameDisplay");
    $inputAns=$("#inputAns");
    $gameList=$("#yourGameList");
    $activeGameRoom=$("#onlineGameRooms");
    $startGameButton=$("#startGame");
    $closeGameButton=$("#closeGame");
    $roomButton=$(".room");
    $userInThisRoom=$("#userInThisRoom");
    $closeGameButton.hide();
    $startGameButton.hide();
    var previousText="Join the game";
    $inputAns.hide();
    var socket = io();
    var gameCreated=false;
    var username=prompt("Please enter Username", "Vegeta");
    if(username==null)
        username="vegeta";
    socket.emit("setUsername",{room:socket.id,username:username});
    console.log(username);
    
    $createGameButton.click(function(){
        $gameDisplayDiv.html("");
        $userInThisRoom.html("");
        var gamename=prompt("Please enter Game Name", "gamer_team");
        if(gamename==null)
            gamename="gamer_team";
        socket.emit("createGame",{room:socket.id,name:gamename});
        $closeGameButton.show();
        $startGameButton.show();
        $("#onlineUserTitle").html("Users online in gameroom: "+gamename);
        previousText="Users online in gameroom: "+gamename;
        gameCreated=true;
        $("#yourGameTitle").html(gamename);
    });
    
    $startGameButton.click(function(){
       socket.emit('startGame',{room:socket.id});
       $("#gameRoom").hide();
       
    });
    
    $closeGameButton.click(function(){
        socket.emit("closeGame",{room:socket.id});
        $("#gameRoom").show();
    });
    
    /*$roomButton.click(function(){
       var room=$(this).attr("name");
        $("#gameRoom").hide();
       $("#onlineUserTitle").html("You have joined "+room);
       socket.emit("joinThisRoom",{room:room,username:username});
       
    });
    */
    function addButton(data,toelement)
    {
        var element=document.createElement("button");
        element.name=data.room;
        element.className="room";
        element.innerHTML=data.name;
        element.onclick=function (){
            console.log("room clicked "+data);
            socket.emit("joinThisRoom",{room:data.room});
            $("#gameRoom").hide();
            $("#gameController").hide();
            $gameDisplayDiv.html("");
            $userInThisRoom.html("");
            $("#onlineUserTitle").html("Users online in gameroom: "+data.name);
            
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
    
    socket.on('displyUserInThisRoom',function(data){
        var list="";
        $gameDisplayDiv.html("");
        for(x in data)
        {
                   list+="<p>"+data[x]+"</p>";
        }
        $userInThisRoom.html(list);
    });
    
    socket.on("yourScore",function(data){
        $gameDisplayDiv.html("Your Score: "+data.score);
        $userInThisRoom.html("");
        $("#onlineUserTitle").html(previousText);
        if(gameCreated)
           $userInThisRoom.html(username);
        
        socket.emit("leaveRoom",{room:data.room});
    })
    socket.on('setOnMark',function(data){
        $("#gameRoom").hide();
        $("#gameController").hide();
        $("#onlineUserDiv").hide();
        if(socket.id==data.id)
            gameCreated=false;
        $gameDisplayDiv.text("Game is starting in "+10+" sec...");
        //$inputAns.show();
        var count=data.time/1000-1;
        var timer=setInterval(function(){
            if(count!=0)
                $gameDisplayDiv.text("Game will start in "+count+" sec...");
            else
            {
                count=data.time/1000-1;
                clearInterval(timer);
                $gameDisplayDiv.html("Game will end in "+10+"</br>"+data.a+" + "+data.b);
                $inputAns.val("");
                $inputAns.show();
                var timer2=setInterval(function(){
                    if(count!=0)
                        $gameDisplayDiv.html("Game will end in "+count+"</br>"+data.a+" + "+data.b);
                    else
                    {
                        clearInterval(timer2);
                        socket.emit('answerRecieve',{ans:$inputAns.val(),a:data.a,b:data.b,room:data.room});
                        $inputAns.hide();
                        $gameDisplayDiv.text("");
                        $("#gameRoom").show();
                        $("#gameController").show();
                        $("#onlineUserDiv").show();
                    }
                count--;
                },1000);
            
            }
            count--;
        },1000);
        
            
       
    });
    
    socket.on('error_msg',function(data){
       $("#gameRoom").show();
       $("#gameController").show();
       console.log(data);
       alert(data); 
    });
    
    socket.on('afterCloseOperation',function(data){
       $startGameButton.hide();
       $closeGameButton.hide();
        $("#yourGameTitle").html("No Game");
        previousText="Join the game";
        $("#onlineUserTitle").html(previousText);
        $userInThisRoom.html("");
        gameCreated=false;
        console.log("After close "); 
        socket.emit("leaveRoom",data);
    });
    
    socket.on('afterCloseOperation_auto',function(data){
        if(socket.id==data.room)
        {
            $startGameButton.hide();
            $closeGameButton.hide();
            $("#yourGameTitle").html("No Game");
            previousText="Join the game";
            $("#onlineUserTitle").html(previousText);
            $userInThisRoom.html("");
            gameCreated=false;
            socket.emit('done');
        }
        
        socket.emit("leaveRoom",data);    
    });
    
    
    socket.on('afterCloseOperation_room',function(data){
  
        $("#gameRoom").show();
        $("#gameController").show();
        $("#onlineUserTitle").html(previousText);
        if(gameCreated)
           $userInThisRoom.html(username);
        else
            $userInThisRoom.html("");
        socket.emit("leaveRoom",data);
         
    });
    
    socket.on('reconnect',function(){
       $startGameButton.hide();
       $closeGameButton.hide();
       $inputAns.hide();
        $inputAns.val("");
        $gameDisplayDiv.hide();
    });
    
    
    

  
});
