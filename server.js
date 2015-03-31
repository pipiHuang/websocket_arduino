var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var SerialPort = require('serialport').SerialPort;
var sp = new SerialPort('/dev/ttyACM0', {baudRate: 115200});
var arduinoMSG = '';

//io.set( 'origins', 'http://192.168.194.128:8000');
var recvMSG = function(buffer, socket) {
	arduinoMSG += buffer.toString();

	if(arduinoMSG.indexOf('\r') >= 0) {
		socket.volatile.emit('notification', arduinoMSG);
		arduinoMSG = '';
	}
};

//load client side html
app.get('/', function(req, res) {
    //res.send('<h1> hi </h1>');
    res.sendFile(__dirname + '/client.html');
});

//create new websocket(socket.io)
//io.sockets.on('connection', function(socket) {
io.on('connection', function(socket) {
	//client(html) send signal to control board
	socket.on('lightStatus', function(lightStatus) {
		sp.write(lightStatus + '\r', function() {
			console.log('the light should be:' + lightStatus);
		});
	});

	//client(html) receive(and display) signal from board = client display data from serial port
	sp.on('data', function(data) {
		recvMSG(data, socket);
	});
});

//show serial port connection status
sp.on('open', function(){
	console.log('Port opened.');
});
sp.on('close', function(err) {
	console.log('Port closed.');
});
sp.on('error', function(err) {
	console.error('error:', err);
});

//show client side connection
io.on('connection', function(socket){
	console.log('new connection.');
});

http.listen(8000, function() {
	console.log('listen on *:8000');
});

