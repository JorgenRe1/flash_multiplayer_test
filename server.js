var http = require('http'),
    fs = require('fs');
  console.log('start');
var port = Number(process.env.PORT || 3000);
//Kjøres bare når en bruker går til siden
var app = http.createServer(function (request, response) {
    fs.readFile("client.html", 'utf-8', function (error, data) {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    });
}).listen(port);
 
var io = require('socket.io').listen(app);

var brukere = [];
var cid_fb = [];
io.on('connection', function(socket){
  console.log('a user connected');
    socket.on('ny_bruker', function(data) {
      	var cid = socket.id;
      	console.log("Kanskje ny bruker");
    });
  //Når en melding skal sendes til alle
  socket.on('message_all', function(data) {
	  //send til alle tilkoblede brukerne
        io.sockets.emit("message_to_client",{ message: data["message"] });
    });
   
   //Hente alle brukere som er logget paa
  socket.on('hent_brukere', function(data) {
  	
        io.to(socket.id).emit("bruker_liste",{ message: bruker_liste });
    });
    //Når bruker chatter:
  socket.on('message_to_server', function (data) {
  	var stop = false;
  	if (check_message(data["message"])) stop = true;
	  var cid = socket.id;
	  var fb_id = cid_fb[cid];
	  var navn = data["navn"];
	  console.log("ID: "+cid);
	  if (brukere[fb_id] == null){
              var msg_t = "ikke_registrert";
	  } else if(!stop) {
	  	//Dersom bruker har blitt auto logget av
	  	brukere[fb_id]["status"] = true;
	  	var logg = brukere[fb_id]["logg"];
	  	console.log("MSG: "+data["message"]);
	  	if (brukere[fb_id]["last"] == fb_id){
	  	    brukere[fb_id]["logg"] += "<br>&nbsp"+data["message"];	
	  	} else {
	  	   if (logg != "") brukere[fb_id]["logg"] += "<br>";
	  	   brukere[fb_id]["logg"] += "<span style='font-weight: bold; border-bottom: solid black;'>"+brukere[fb_id]["navn"]+"</span><br>&nbsp"+data["message"];
	  	}
	  	var msg_t = brukere[fb_id]["logg"];
	  }
	  brukere[fb_id]["last"] = fb_id;
	  console.log("Sender melding til: "+cid);
	  if(!stop) io.to(cid).emit('message_to_client',{message: msg_t, from: "self"});
	  //Send saa til admin som kan da bli notifisert om at det chattes
	  if(!stop) io.sockets.emit("notify_admin",{ message: fb_id });
  });
  
  //når admin chatter så må chatt logg objectet sendes til admin og bruker som hjelpes
  socket.on('admin_to_user',function(data){

          io.sockets.emit("chat_sett",{ fb_id: user_fb });
  });
  
  socket.on('hent_chat',function(data){
  	
  });
  //Når en bruker logger av
  socket.on('disconnect', function(){
    console.log('user disconnected. ID: '+socket.id);
  });
});
