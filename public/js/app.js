var socket = io.connect('http://localhost:3333');

function displayMessage (data){
   $('#messages').text('Adidas: ' + data.name + ' / Nike: ' + data.message);
}

// This will be fired 
socket.on('messages-available', function (data) {
    for (var i = 0; i < data.length; i++) {
        displayMessage(data[i]);
    }
});

// This listens for any individual messages coming back from the server
socket.on('message-added', displayMessage);

// When someone clicks the "Create Message" button, we'll emit the data to the server
$('#create-message').submit(function (e) {

    // Don't let the form actually post to the server
    e.preventDefault();
    
    // Send the "add-message" message to the server with our values
    socket.emit('add-message', {
      //  name: $('input[name="name"]').val(),
        message: $('input[name="message"]').val(),
        b1: $('input[name="brand1"]').val(),
        b2: $('input[name="brand2"]').val(),
        b1ht: $('input[name="brand1ht"]').val(),
        b2ht: $('input[name="brand2ht"]').val(),
        dsName: $('input[name="dsun"]').val(),
        dsToken: $('input[name="dstok"]').val()
    });
    startCollection();
    // Clear out the message value
    $('textarea[name="message"]').val('');

});