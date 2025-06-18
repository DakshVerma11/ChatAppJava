// Global variables
let stomp;
let selectedFriendId = null;
let currentUserId = null;
let isConnected = false;

// Initialize chat when page loads
window.onload = function() {
    // Get current user ID from the page
    currentUserId = window.currentUserId || parseInt(document.querySelector('[data-user-id]')?.getAttribute('data-user-id'));
    
    if (currentUserId) {
        connect();
    } else {
        console.error('Current user ID not found');
    }
};

/**
 * Establish WebSocket connection
 */
function connect() {
    const socket = new SockJS('/ws');
    stomp = Stomp.over(socket);
    
    // Disable debug logging
    stomp.debug = null;
    
    stomp.connect({}, function(frame) {
        console.log('Connected: ' + frame);
        isConnected = true;
        
        // Subscribe to messages
        stomp.subscribe('/topic/messages', function(messageOutput) {
            try {
                const message = JSON.parse(messageOutput.body);
                handleIncomingMessage(message);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });
        
        // Update connection status
        updateConnectionStatus(true);
        
    }, function(error) {
        console.error('WebSocket connection error:', error);
        isConnected = false;
        updateConnectionStatus(false);
        
        // Attempt to reconnect after 5 seconds
        setTimeout(connect, 5000);
    });
}

/**
 * Handle incoming WebSocket messages
 */
function handleIncomingMessage(message) {
    // Only show messages relevant to current user and selected friend
    const isRelevantMessage = (message.receiverId === currentUserId && message.senderId === selectedFriendId) ||
                             (message.senderId === currentUserId && message.receiverId === selectedFriendId);
    
    if (isRelevantMessage && selectedFriendId) {
        displayMessage(message, false); // false = don't clear chat
        scrollToBottom();
    }
}

/**
 * Send a message
 */
function sendMessage() {
    const msgInput = document.getElementById('msgInput');
    const content = msgInput.value.trim();

    // Validation
    if (!content) {
        alert("Please enter a message");
        return;
    }
	if (!currentUserId){
		alert("wat da hell"+currentUserId+" "+selectedFriendId);
		return;
	}
    if (!currentUserId || !selectedFriendId) {
        alert("Please select a friend to chat with");
        return;
    }

    if (!isConnected) {
        alert("Not connected to server. Please wait...");
        return;
    }

    // Create message object
    const messageData = {
        senderId: currentUserId,
        receiverId: selectedFriendId,
        content: content
    };

    try {
        // Send via WebSocket
        stomp.send('/app/chat', {}, JSON.stringify(messageData));
        
        // Clear input
        msgInput.value = '';
        
		/* Duplicating lil pos
        // Optionally display the message immediately (optimistic UI)
        const optimisticMessage = {
            ...messageData,
            sentAt: new Date().toISOString()
        };
		
		
        displayMessage(optimisticMessage, false);
		*/
        scrollToBottom();
        
    } 
	
	catch (error) {
		
        console.error('Error sending message:', error);
        alert("Failed to send message. Please try again.");
		
    }
	
}

/**
 * Select a friend to chat with
 */
function selectFriend(elem) {
    const friendId = parseInt(elem.getAttribute('data-id'));
    const friendName = elem.textContent.trim();
    
    if (!friendId) {
        console.error('Invalid friend ID');
        return;
    }
    
    selectedFriendId = friendId;
    window.selectedFriendId = selectedFriendId; // For backward compatibility
    
    // Update UI
    highlightSelectedFriend(elem);
    updateChatHeader(friendName);
    
    // Load message history
    loadMessageHistory(friendId);
    
    // Focus on message input
    document.getElementById('msgInput').focus();
}

/**
 * Highlight the selected friend in the friends list
 */
function highlightSelectedFriend(selectedElem) {
    // Remove highlight from all friends
    document.querySelectorAll('.friends-list li').forEach(li => {
        li.classList.remove('selected');
        li.style.background = '';
    });
    
    // Highlight selected friend
    selectedElem.classList.add('selected');
    selectedElem.style.background = '#d4f1f4';
}

/*

Add Friend

*/

function addFriend(event) {
    event.preventDefault();
    const username = document.getElementById('addFriendInput').value;
    const resultSpan = document.getElementById('addFriendResult');
    resultSpan.textContent = '';
    fetch('/add-friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'username=' + encodeURIComponent(username)
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            resultSpan.style.color = 'green';
            resultSpan.textContent = 'Friend added!';
            setTimeout(() => window.location.reload(), 1000);
        } else {
            resultSpan.style.color = 'red';
            resultSpan.textContent = data.message || 'Error adding friend.';
        }
    }).catch(() => {
        resultSpan.textContent = 'Server error.';
    });
    return false;
}


/**
 * Update chat header with friend name
 */
function updateChatHeader(friendName) {
    let chatHeader = document.getElementById('chatHeader');
    if (!chatHeader) {
        // Create chat header if it doesn't exist
        chatHeader = document.createElement('div');
        chatHeader.id = 'chatHeader';
        chatHeader.style.cssText = 'padding: 10px; border-bottom: 1px solid #ccc; background: #f0f0f0; font-weight: bold;';
        
        const chatWindow = document.getElementById('chatWindow');
        chatWindow.parentNode.insertBefore(chatHeader, chatWindow);
    }
    
    chatHeader.textContent = `Chatting with ${friendName}`;
}
/**
 * Load message history for a specific friend
 */
function loadMessageHistory(friendId) {
    if (!friendId) return;
    
    // Show loading indicator
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.innerHTML = '<div style="text-align: center; color: #666;">Loading messages...</div>';
    
    fetch(`/api/messages/${friendId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(messages => {
            chatWindow.innerHTML = ''; // Clear loading message
            
            if (messages.length === 0) {
                chatWindow.innerHTML = '<div style="text-align: center; color: #666;">No messages yet. Start the conversation!</div>';
                return;
            }
            
            console.log('Loaded message history:', messages);
            
            // Display all messages WITHOUT duplication
            messages.forEach(message => {
                displayMessage(message, false); // false = don't clear chat
            });
            
            scrollToBottom();
        })
        .catch(error => {
            console.error('Error loading message history:', error);
            chatWindow.innerHTML = '<div style="text-align: center; color: red;">Error loading messages. Click friend again to retry.</div>';
        });
}

/**
 * Handle incoming WebSocket messages
 */
function handleIncomingMessage(message) {
    // Only show messages relevant to current user and selected friend
    const isRelevantMessage = (message.receiverId === currentUserId && message.senderId === selectedFriendId) ||
                             (message.senderId === currentUserId && message.receiverId === selectedFriendId);
    
    if (isRelevantMessage && selectedFriendId) {
        displayMessage(message, false); // false = don't clear chat
        scrollToBottom();
    }
}

/**
 * Display a message in the chat window
 */
function displayMessage(message, clearChat = false) {
    const chatWindow = document.getElementById('chatWindow');
    
    if (clearChat) {
        chatWindow.innerHTML = '';
    }
    
    const messageDiv = document.createElement('div');
    const isCurrentUser = message.senderId === currentUserId;
    const senderName = isCurrentUser ? 'You' : 'Friend';
    
    // Format timestamp - handle both formats
    let timestamp;
    if (message.sentAt) {
        // Handle different timestamp formats
        const date = new Date(message.sentAt);
        timestamp = date.toLocaleTimeString();
    } else {
        timestamp = new Date().toLocaleTimeString();
    }
    
    messageDiv.innerHTML = `
        <div style="margin-bottom: 2px;">
            <strong>${senderName}:</strong> ${escapeHtml(message.content)}
        </div>
        <small style="color: #666; font-size: 0.8em;">
            ${timestamp}
        </small>
    `;
    
    // Style messages differently for current user vs friend
    messageDiv.style.cssText = `
        text-align: ${isCurrentUser ? 'right' : 'left'};
        margin-bottom: 10px;
        padding: 8px;
        background-color: ${isCurrentUser ? '#e3f2fd' : '#f5f5f5'};
        border-radius: 8px;
        max-width: 80%;
        margin-left: ${isCurrentUser ? 'auto' : '0'};
        margin-right: ${isCurrentUser ? '0' : 'auto'};
        word-wrap: break-word;
    `;
    
    chatWindow.appendChild(messageDiv);
}

/**
 * Display a message in the chat window
 */
function displayMessage(message, clearChat = false) {
    const chatWindow = document.getElementById('chatWindow');
    
    if (clearChat) {
        chatWindow.innerHTML = '';
    }
    
    const messageDiv = document.createElement('div');
    const isCurrentUser = message.senderId === currentUserId;
    const senderName = isCurrentUser ? 'You' : 'Friend';
    
    // Format timestamp
    const timestamp = message.sentAt ? new Date(message.sentAt).toLocaleTimeString() : new Date().toLocaleTimeString();
    
    messageDiv.innerHTML = `
        <div style="margin-bottom: 2px;">
            <strong>${senderName}:</strong> ${escapeHtml(message.content)}
        </div>
        <small style="color: #666; font-size: 0.8em;">
            ${timestamp}
        </small>
    `;
    
    // Style messages differently for current user vs friend
    messageDiv.style.cssText = `
        text-align: ${isCurrentUser ? 'right' : 'left'};
        margin-bottom: 10px;
        padding: 8px;
        background-color: ${isCurrentUser ? '#e3f2fd' : '#f5f5f5'};
        border-radius: 8px;
        max-width: 80%;
        margin-left: ${isCurrentUser ? 'auto' : '0'};
        margin-right: ${isCurrentUser ? '0' : 'auto'};
        word-wrap: break-word;
    `;
    
    chatWindow.appendChild(messageDiv);
}

/**
 * Scroll chat window to bottom
 */
function scrollToBottom() {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

/**
 * Update connection status indicator
 */
function updateConnectionStatus(connected) {
    let statusIndicator = document.getElementById('connectionStatus');
    if (!statusIndicator) {
        statusIndicator = document.createElement('div');
        statusIndicator.id = 'connectionStatus';
        statusIndicator.style.cssText = 'position: fixed; top: 10px; right: 10px; padding: 5px 10px; border-radius: 5px; font-size: 12px; z-index: 1000;';
        document.body.appendChild(statusIndicator);
    }
    
    if (connected) {
        statusIndicator.textContent = '● Connected';
        statusIndicator.style.backgroundColor = '#4CAF50';
        statusIndicator.style.color = 'white';
    } else {
        statusIndicator.textContent = '● Disconnected';
        statusIndicator.style.backgroundColor = '#f44336';
        statusIndicator.style.color = 'white';
    }
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

/**
 * Handle Enter key press in message input
 */
document.addEventListener('DOMContentLoaded', function() {
    const msgInput = document.getElementById('msgInput');
    if (msgInput) {
        msgInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});

/**
 * Handle page visibility change to manage connection
 */
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, could pause some activities
        console.log('Page hidden');
    } else {
        // Page is visible, ensure connection is active
        console.log('Page visible');
        if (!isConnected) {
            connect();
        }
    }
});

/**
 * Disconnect WebSocket when page unloads
 */
window.addEventListener('beforeunload', function() {
    if (stomp && isConnected) {
        stomp.disconnect();
    }
});