
//Set up communication with web page
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    messages = [],
    sockets = []
    status = 'Waiting';

app.use( express.static(__dirname + '/public'));

server.listen(3333);


// Include the library
var DataSift = require('datasift-node');
var JQuery = require('jquery');
 
//include configuration file
var config = require('./config/config')

//Define brand and tags to filter for
var brand1 = 'Adidas'
var tag1 = 'allin'
var brand2 = 'Nike'
var tag2 = 'justdoit'


var filter = 'tag.brand "' + brand1 + '" {interaction.content contains "' + brand1 + '" OR interaction.hashtags contains "' + tag1 + '"} \
tag.brand "' + brand2 + '" {interaction.content contains_any "' + brand2 + '" OR interaction.hashtags contains "' + tag2 + '"} \
\
return { \
(interaction.content contains_any "' + brand1 + ', ' + brand2 + '" OR interaction.hashtags contains_any "' + tag1 + ', ' + tag2 + '") AND language.tag contains "en" \
}';
var dataSiftUserName = 'sam';//config.dsUser
var dataSiftToken = config.dsToken;


// Create a client
var ds = new DataSift(dataSiftUserName, dataSiftToken);

var count = 0;
var max = 20;
var info =[]

var adidas = 0;
var nike = 0;
var total = 0;
var newYork = 0;
var losAngeles = 0;
var chicago = 0;
var otherLocation = 0;
//ny geo[0], la geo[1], chicago geo[2], other geo[3]
var geoAdidas = [];
var geoNike = [];
var ccount = 0;
for (i=0; i<=3; i++){
	geoAdidas[i]=0;
	geoNike[i]=0;
}
 
// Compiles a stream from a CSDL definition:
function compileFilter(csdl) {
	ds.compile({ 'csdl': csdl }, function (err, response) {
		if (err) 
			console.log(err);
		else
		{
			console.log("Filter hash: " + response.hash);
			connect(response.hash); // Connects to DataSift
		}
	});
}


// Connects to DataSift and starts streaming data:
function connect(hash) {
 
	// Set up a 'connect' event handler, which will fire when a connection is established. When connected we compile our CSDL filter and subscribe to streaming data.
	ds.on('connect', function () {
		console.log('Connected to DataSift');
		console.log('loop:' + ccount)
		ds.subscribe(hash);
	});
 
	// Set up 'error' handler to alert us of any errors. For more details on possible errors see [http://dev.datasift.com/docs/resources/errors](http://dev.datasift.com/docs/resources/errors).
	ds.on('error', function (error) {
		console.log('ERROR: ' + error);
	});
 
	// Set up 'delete' handler. Depending on the data sources you are using, you may need to delete this data to stay compliant.
	ds.on('delete', function (data) {
		console.log('Data deleted: ', data); // TODO: Do something useful with the data!
	});
 
	// Set up 'interaction' handler - this receives our data! This is triggered each time we receive a new interaction - a piece of data on the live stream.
	ds.on('interaction', function (data) {
		if(count<max)
		{
			status = 'Demo running...';
		}
		else
		{
			status = 'Demo finished';
		}
		console.log(status);
		//console.log('Recieved data: ' + count, data);
		console.log('Recieved data: ' + count, data.hash);
		//info[count]=data;
		console.log('sending record' + count + 'to database')
		
//try this 
		
		
		var displayData = JSON.stringify(data);
		//console.log("This is the data: " + displayData);
		var dataRead = JSON.parse(displayData);
		console.log("This came from: " + dataRead.data.interaction.tag_tree.brand);
		sendRecord(data);
		count = count + 1;
		
		var brandTemp = dataRead.data.interaction.tag_tree.brand;
		//var locationTemp = dataRead.data.interaction.tag_tree.location;
		var authorTemp = dataRead.data.interaction.author.username;
      	var	textTemp = dataRead.data.interaction.content;
		var serviceTemp = dataRead.data.interaction.type

		//count brand mentions
		if (brandTemp == brand1){
			adidas++;
			total++;
					}
		if (brandTemp == brand2){
			nike++;
			total++;
					}
		console.log(brand1 +': ' + adidas + ' | ' + brand2 + ': ' + nike)
		
		/*
		if (locationTemp == "New York"){
			if (brandTemp == "Adidas"){
			geoAdidas[0]++;
			}
			if (brandTemp == "Nike"){
			geoNike[0]++;
			}
		}
		else if (locationTemp == "Los Angeles"){
			if (brandTemp == "Adidas"){
			geoAdidas[1]++;
			}
			if (brandTemp == "Nike"){
			geoNike[1]++;
			}
		}
		else if (locationTemp == "Chicago"){
			if (brandTemp == "Adidas"){
			geoAdidas[2]++;
			}
			if (brandTemp == "Nike"){
			geoNike[2]++;
			}
		}
		else {
			if (brandTemp == "Adidas"){
			geoAdidas[3]++;
			}
			if (brandTemp == "Nike"){
			geoNike[3]++;
			}
		}
		*/
/*
		console.log("Brand | NY | LA | Chicago | Other");
		console.log("Adidas | " + geoAdidas[0] + " | " + geoAdidas[1] + " | "+ geoAdidas[2] + " | " + geoAdidas[3]);
		console.log("Nike | " + geoNike[0] + " | " + geoNike[1] + " | "+ geoNike[2] + " | " + geoNike[3]);
  */
   		if (count>=max){
			ds.unsubscribe(hash);
			console.log('unsubcribed');
			status = 'Demo finished: ' + max + ' items';
			console.log(status)
			//javascript_abort();
			} 
    //send nike and adidas values to browser
		io.sockets.volatile.emit('tweet', {
      		service: serviceTemp,
      		user: authorTemp,
      		text: textTemp,
      		adidasPercent: (adidas/total)*100,
      		nikePercent: (nike/total)*100,
      		adidasTotal: adidas,
      		nikeTotal: nike,
      		totalTotal: total,
      		jobStatus: status,
      		webBrand1: brand1,
      		webBrand2: brand2
    	});

		/*
		io.sockets.on('connection', function (socket) {
		    sockets.push(socket);

		    socket.emit('messages-available', messages);

    		socket.on('add-message', function (data) {
        		messages.push(data);
        		sockets.forEach(function (socket) {
            		socket.emit('message-added', data);
        			});
    			});
			});
	*/
/*
broadcast_info('tweet', {
      user: adidas,
      text: nike
    });
*/



		/*
		if (count==10) {
			console.log('sending to database');
			sendData(info);
			console.log('data sent');
			// figure out how to stop the program here 
		}
		*/
});	
 
	// Now all handlers are set up, connect to DataSift!
		ds.connect();
/*
	if (ccount<2){
		ds.connect();
		}
	else{
		subscribe(hash);
	}	
*/
}
//if this breaks now take out the section below




io.sockets.on('connection', function (socket) {
	
    sockets.push(socket);

    socket.emit('messages-available', messages);

    socket.on('add-message', function (data) {
       messages.push(data);
        count = 0;
        max = data.message;
        brand1 = data.b1;
        brand2 = data.b2;
        tag1 = data.b1ht;
        tag2 = data.b2ht;
        dataSiftUserName = data.dsName;
        dataSiftToken = data.dsToken;
        filter = 'tag.brand "' + brand1 + '" {interaction.content contains "' + brand1 + '" OR interaction.hashtags contains "' + tag1 + '"} \
tag.brand "' + brand2 + '" {interaction.content contains_any "' + brand2 + '" OR interaction.hashtags contains "' + tag2 + '"} \
\
return { \
(interaction.content contains_any "' + brand1 + ', ' + brand2 + '" OR interaction.hashtags contains_any "' + tag1 + ', ' + tag2 + '") AND language.tag contains "en" \
}';
		//see if this will let it run more than once
		//console.log(data.dsName);
		//console.log(dataSiftUserName);
		ds = new DataSift(dataSiftUserName, dataSiftToken);
        console.log('there was a new message. max is now ' + max);
        console.log(max*3)
        compileFilter(filter);
        ccount++;    
/*
        if(ccount<2){
        	compileFilter(filter);
        	ccount++;
    	}
    	else{
    		subscribe(hash);
    	}
  */
        console.log('loop:' + ccount)
   		sockets.forEach(function (socket) {
            socket.emit('message-added', data);
           });
    });
});



// the code before here could be the bad code



// Initiate our script by comiling the filter, which in turn will connect us to DataSift
//compileFilter(filter);

//Connect to SuperShoes Demo 0e33107ca8b48b5101b608f5fc2599cd
//connect(superShoesHash);


//send data to database
var dbURL = config.couchURL;
var dbPort = config.couchPort;
var dbAuth = config.couchAuth;
var dbUser = config.couchUser;
var dbPassword = config.couchPassword;
var dbDatabase = config.dbname;

var cradle = require('cradle');

var db = new(cradle.Connection)('https://saybar.iriscouch.com', 6984, {
	auth: { username: 'dsreceiver', password: 'dsrpassword211ars'}
}).database('supershoes');
var db = new(cradle.Connection)(dbURL, dbPort,
 {auth: {username: dbUser, password: dbPassword}}).database(dbDatabase);

// var db = new(cradle.Connection)().database('datasifttest');

function sendRecord(singleItem){
		db.save(singleItem,
			function (err, res) {
				if (err) {
					// Handle error
					console.log(' SAVE ERROR: Could not save record!!');
				}
				else {
					console.log(' Sucessful Save');
				}
			});
}


function sendData(dataArray){
for (i = 0; i < max; i++){
  db.save(info[i], 
  	function (err, res) {
      if (err) {
          // Handle error
          console.log(' SAVE ERROR: Could not save record!!');
      } else {
          // Handle success
          console.log(' SUCESSFUL SAVE');
      }
  })};
}

function javascript_abort()
{
   throw new Error('You successfully saved ' + count + ' records. Goodbye');
}

function broadcast_info(broadcast_name, broadcast_data)
{
	io.sockets.emit(broadcast_name, broadcast_data)
}