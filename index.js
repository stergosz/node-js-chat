//express
var express = require('express');
var app = express();
var path = require('path');

//http
var http = require('http').Server(app);

//socket.io which requires http to work
var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'public')));

//landing page
app.get('/', function(req, res){

	//print a message
	// res.send('<h1>Hello world</h1>');

	res.sendFile('public/index.html');

});

var users = [];
var connections = [];

//socket.io listens to events, in this case the event is called "connection"
//socket.io will listen to new user connections via "connection" event
io.on('connection', function(socket){
	connections.push(socket);

	//message when a user connects
	console.log('a user connected');

	socket.on('chat new user', function(username, fn){
		//check if username is empty
		if (!username.trim()){
			sendErrorMessage(socket, 'Please enter a username');
			return;
		}
		//check if username is taken
		if (usernameExist(username)){
			console.log('username['+username+'] is already taken');
			sendErrorMessage(socket, 'This username is already taken.');
			return;
		}
		console.log('got username from a user('+username+')');

		// io.emit('chat user connected success', { username: username });
		fn({username: username});
		
		socket.username = username;
		users.push(socket.username);

		socket.on('chat user connected', function(){
			console.log('chat user connected');
			io.emit('chat user connected', { username: username });


			//send online users list
			io.emit('update online users', { online_users: getOnlineUsers() });
		});

		socket.on('chat message', function(message){
			//check if message is empty
			if (!message.trim()){
				sendErrorMessage(socket, 'Please type in a message');
				return;
			}
			console.log('['+socket.username+']: ' + message);
			io.emit('chat message', { username: username, message: message });
		});
	});


  	//listen to "disconnect" event when a user disconnects
	socket.on('disconnect', function(){
		if (!socket.username) return;

		//message when a user disconnects
		console.log('User: [%s] has disconnected', socket.username);


		connections.splice(connections.indexOf(socket), 1);
		users.splice(users.indexOf(socket.username), 1);

		console.log("Remaining users connected : " + users.length);

		
		io.emit('chat user disconnected', { username: socket.username });

		//send online users list
		io.emit('update online users', { online_users: getOnlineUsers() });

	});
});

//listen to 3000 port so we can start serving the page
http.listen(3000, function(){

	//debug message
	console.log('listening on *:3000');
});

function usernameExist(username){
	if (users.indexOf(username) == -1){
		return false;
	}

	return true;
}

function getOnlineUsers(){

	return users;

}

function sendErrorMessage(socket, message){

	socket.emit("error message", { message: message });

}