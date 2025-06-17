let stomp;

function connect() {
  const socket = new SockJS('/ws');
  stomp = Stomp.over(socket);

  stomp.connect({}, () => {
    // Subscribe to the user-specific message topic
    stomp.subscribe('/topic/messages/' + window.currentUserId, ({ body }) => {
      const message = JSON.parse(body);
      const line = document.createElement('div');
      line.innerText = message.senderId + ': ' + message.content;
      document.getElementById('chatWindow').append(line);
    });
  });
}

function sendMessage() {
  const content = document.getElementById('msgInput').value;

  // Ensure these variables are set in your page from server-side rendering
  const senderId = window.currentUserId;
  const receiverId = window.selectedFriendId;

  if (!senderId || !receiverId) {
    alert("Sender or receiver ID not set.");
    return;
  }

  stomp.send('/app/chat', {}, JSON.stringify({
    senderId: senderId,
    receiverId: receiverId,
    content: content
  }));

  document.getElementById('msgInput').value = '';
}

window.onload = connect;
