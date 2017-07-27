$(function () {

  var socket = io();

  $('form.messageForm').submit(function(){
    // if (!$('#m').val().trim()) return false;
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });

  socket.on('chat message', function(data){
    $('#messages').append($('<li>').html("<strong>"+data.username+":</strong> " + data.message));
  });

  socket.on('chat user connected', function(data){
    $('#messages').append($('<li>').html("User <strong>"+data.username+"</strong> has connected."));
  });

  socket.on('chat user disconnected', function(data){
    $('#messages').append($('<li>').html("User <strong>"+data.username+"</strong> has disconnected"));
  });

  socket.on('error message', function(data){
    alert(data.message);
  });

  socket.on('update online users', function(data){

    var total_online_users = data.online_users.length;

    var online_users_html = '';

    for (var usr in data.online_users){
      online_users_html += '<div class="item">'+data.online_users[usr]+'</div>';
    }

    $('.online-users-number').html(total_online_users);
    $(".online-users").html(online_users_html);

  });

  if ($("#username_popup").length && !$("#username_popup").hasClass("hidden")){
    $("#username_popup input").focus();
  }
  $("#username_popup form").submit(function(e){
    e.preventDefault();
    var username = $(this).find("input");
    // if (!username.val().trim()) return false;
    
    socket.emit('chat new user', username.val(), function(data){

      socket.emit('chat user connected');

      $("#username_popup").addClass("hidden");
    });

    return false;
  });

});