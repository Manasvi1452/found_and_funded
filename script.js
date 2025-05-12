// User data storage (in a real app, this would be in a database)
let users = [
    {
        id: 1,
        role: 'investor',
        name: 'Test Investor',
        organization: 'Test Investment Firm',
        email: 'investor@test.com',
        password: 'password123',
        domain: 'Technology',
        verified: true,
        capital: '$1M - $5M',
        profilePicture: 'default-avatar.png'
    },
    {
        id: 2,
        role: 'startup',
        name: 'Test Startup',
        organization: 'Test Startup Inc',
        email: 'startup@test.com',
        password: 'password123',
        domain: 'Technology',
        founder: 'John Doe',
        verified: true,
        capital: '$100K - $500K',
        profilePicture: 'default-avatar.png'
    }
];
let currentUser = null;
let matches = [];
let conversations = [];

// Sample data for connections and messages
let connections = [
    {
        id: 1,
        name: "TechStart Inc.",
        image: "https://via.placeholder.com/50",
        status: "Online",
        lastMessage: "Looking forward to discussing the investment opportunity!"
    },
    {
        id: 2,
        name: "Green Energy Solutions",
        image: "https://via.placeholder.com/50",
        status: "Offline",
        lastMessage: "Thank you for your interest in our project"
    }
];

let messages = {
    1: [
        { sender: "TechStart Inc.", content: "Hello! We're interested in your startup", time: "10:30 AM" },
        { sender: "You", content: "Great! Let's discuss the details", time: "10:32 AM" },
        { sender: "TechStart Inc.", content: "Looking forward to discussing the investment opportunity!", time: "10:33 AM" }
    ],
    2: [
        { sender: "Green Energy Solutions", content: "Hi there!", time: "9:15 AM" },
        { sender: "You", content: "Hello! I'm interested in your green energy project", time: "9:20 AM" },
        { sender: "Green Energy Solutions", content: "Thank you for your interest in our project", time: "9:25 AM" }
    ]
};

// Role selection and form handling
function selectRole(role) {
    document.getElementById('authOptions').style.display = 'block';
    document.getElementById('investorBtn').classList.remove('active');
    document.getElementById('startupBtn').classList.remove('active');
    document.getElementById(role + 'Btn').classList.add('active');
    currentUser = { role: role };
}

function showForm(type) {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('investorRegisterForm').style.display = 'none';
    document.getElementById('startupRegisterForm').style.display = 'none';

    if (type === 'login') {
        document.getElementById('loginForm').style.display = 'block';
    } else {
        document.getElementById(currentUser.role + 'RegisterForm').style.display = 'block';
    }
}

// Authentication
function login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('userType', user.role); // Store user role
        
        if (!user.verified) {
            window.location.href = 'verification.html';
        } else {
            // Redirect to appropriate dashboard based on role
            if (user.role === 'investor') {
                window.location.href = 'startup_dashboard.html';
            } else if (user.role === 'startup') {
                window.location.href = 'investors_dashboard.html';
            }
        }
        return true;
    } else {
        alert('Invalid credentials');
        return false;
    }
}

function register(userData) {
    users.push(userData);
    currentUser = userData;
    window.location.href = 'verification.html';
}

// Verification
function verifyUser(verificationData) {
    // In a real app, this would check against a database
    const isValid = true; // Placeholder for actual verification logic
    
    if (isValid) {
        currentUser.verified = true;
        window.location.href = 'profile.html';
    } else {
        document.getElementById('verificationStatus').style.display = 'block';
        document.querySelector('.status-message').textContent = 'Verification denied';
    }
}

// Profile
function loadProfile() {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
        window.location.href = 'login.html';
        return;
    }

    currentUser = JSON.parse(storedUser); // Retrieve user data from localStorage

    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role;
    document.getElementById('userOrg').textContent = currentUser.organization;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userDomain').textContent = currentUser.domain;
    document.getElementById('userCapital').textContent = currentUser.capital || 'Not specified';
}

// Matching
function loadNextMatch() {
    // In a real app, this would fetch from a database
    const potentialMatches = users.filter(u => 
        u.role !== currentUser.role && 
        u.verified && 
        !matches.some(m => m.userId === u.id)
    );

    if (potentialMatches.length > 0) {
        const match = potentialMatches[0];
        document.getElementById('matchName').textContent = match.name;
        document.getElementById('matchOrg').textContent = match.organization;
        document.getElementById('matchDomain').textContent = match.domain;
        document.getElementById('matchDescription').textContent = match.description || 'No description available';
        document.getElementById('profileImage').src = match.profilePicture || 'default-avatar.png';
    } else {
        document.getElementById('currentCard').innerHTML = '<p>No more matches available</p>';
    }
}

function swipe(direction) {
    const currentMatch = getCurrentMatch();
    if (direction === 'right') {
        // Check if the other user has already liked this user
        const isMatch = matches.some(m => 
            m.userId === currentMatch.id && 
            m.likedUserId === currentUser.id
        );

        if (isMatch) {
            showMatchModal(currentMatch);
        } else {
            matches.push({
                userId: currentUser.id,
                likedUserId: currentMatch.id,
                timestamp: new Date()
            });
        }
    }
    loadNextMatch();
}

function showMatchModal(matchedUser) {
    document.getElementById('matchedUserName').textContent = matchedUser.name;
    document.getElementById('matchModal').style.display = 'block';
}

// Chat
function loadConversations() {
    const conversationList = document.getElementById('conversationList');
    conversationList.innerHTML = '';

    conversations.forEach(conv => {
        const conversationElement = document.createElement('div');
        conversationElement.className = 'conversation';
        conversationElement.innerHTML = `
            <img src="${conv.partner.profilePicture || 'default-avatar.png'}" alt="Profile Picture">
            <div>
                <h3>${conv.partner.name}</h3>
                <p>${conv.lastMessage || 'No messages yet'}</p>
            </div>
        `;
        conversationElement.onclick = () => loadChat(conv);
        conversationList.appendChild(conversationElement);
    });
}

function loadChat(conversation) {
    document.getElementById('partnerName').textContent = conversation.partner.name;
    document.getElementById('partnerImage').src = conversation.partner.profilePicture || 'default-avatar.png';
    
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.innerHTML = '';

    conversation.messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${msg.sender === currentUser.id ? 'sent' : 'received'}`;
        messageElement.textContent = msg.content;
        messageContainer.appendChild(messageElement);
    });
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    
    if (content) {
        const currentConversation = getCurrentConversation();
        if (currentConversation) {
            currentConversation.messages.push({
                sender: currentUser.id,
                content: content,
                timestamp: new Date()
            });
            loadChat(currentConversation);
            input.value = '';
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch (currentPage) {
        case 'profile.html':
            loadProfile();
            break;
        case 'match.html':
            loadNextMatch();
            break;
        case 'chat.html':
            loadConversations();
            break;
    }
});

// Form submissions
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    login(email, password);
});

document.getElementById('investorRegisterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const userData = {
        id: Date.now(),
        role: 'investor',
        name: document.getElementById('investorName').value,
        organization: document.getElementById('investorOrg').value,
        email: document.getElementById('investorEmail').value,
        password: document.getElementById('investorPassword').value,
        domain: document.getElementById('investorDomain').value,
        verified: false
    };
    register(userData);
});

document.getElementById('startupRegisterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const userData = {
        id: Date.now(),
        role: 'startup',
        name: document.getElementById('startupName').value,
        organization: document.getElementById('startupOrg').value,
        email: document.getElementById('startupEmail').value,
        password: document.getElementById('startupPassword').value,
        founder: document.getElementById('startupFounder').value,
        domain: document.getElementById('startupDomain').value,
        verified: false
    };
    register(userData);
});

// Profile picture upload
document.getElementById('profilePicture')?.addEventListener('click', () => {
    document.getElementById('pictureUpload').click();
});

document.getElementById('pictureUpload')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('profilePicture').style.backgroundImage = `url(${e.target.result})`;
            currentUser.profilePicture = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Function to determine which dashboard to go to
function goToDashboard() {
    // Redirect to profile page instead of dashboard
    window.location.href = 'profile.html';
}

// Function to load connections in the sidebar
function loadConnections() {
    const connectionsList = document.getElementById('connectionsList');
    if (!connectionsList) return;

    connectionsList.innerHTML = '';
    connections.forEach(connection => {
        const connectionItem = document.createElement('div');
        connectionItem.className = 'connection-item';
        connectionItem.onclick = () => selectConnection(connection.id);
        
        connectionItem.innerHTML = `
            <img src="${connection.image}" alt="${connection.name}">
            <div class="connection-info">
                <h3>${connection.name}</h3>
                <p>${connection.lastMessage}</p>
            </div>
        `;
        
        connectionsList.appendChild(connectionItem);
    });
}

// Function to select a connection and load messages
function selectConnection(connectionId) {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;

    // Update chat header
    document.getElementById('partnerImage').src = connection.image;
    document.getElementById('partnerName').textContent = connection.name;
    document.getElementById('partnerStatus').textContent = connection.status;

    // Load messages
    loadMessages(connectionId);

    // Update active state in sidebar
    document.querySelectorAll('.connection-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.connection-item:nth-child(${connectionId})`).classList.add('active');
}

// Function to load messages for a connection
function loadMessages(connectionId) {
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) return;

    messageContainer.innerHTML = '';
    const connectionMessages = messages[connectionId] || [];

    connectionMessages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender === 'You' ? 'sent' : 'received'}`;
        
        messageDiv.innerHTML = `
            <div class="message-content">
                ${message.content}
            </div>
            <div class="message-time">${message.time}</div>
        `;
        
        messageContainer.appendChild(messageDiv);
    });

    // Scroll to bottom
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Function to send a message
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    if (!message) return;

    const activeConnection = document.querySelector('.connection-item.active');
    if (!activeConnection) return;

    const connectionId = connections.findIndex(c => c.id === parseInt(activeConnection.dataset.id)) + 1;
    
    // Add message to messages object
    if (!messages[connectionId]) {
        messages[connectionId] = [];
    }
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messages[connectionId].push({
        sender: 'You',
        content: message,
        time: timeString
    });

    // Update UI
    loadMessages(connectionId);
    messageInput.value = '';

    // Update last message in connections list
    const connectionItem = document.querySelector(`.connection-item:nth-child(${connectionId}) .connection-info p`);
    if (connectionItem) {
        connectionItem.textContent = message;
    }
}

// Function to search connections
function searchConnections() {
    const searchInput = document.getElementById('searchConnections');
    const searchTerm = searchInput.value.toLowerCase();
    
    document.querySelectorAll('.connection-item').forEach(item => {
        const name = item.querySelector('h3').textContent.toLowerCase();
        const lastMessage = item.querySelector('p').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || lastMessage.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadConnections();
    
    // Add event listeners
    const searchInput = document.getElementById('searchConnections');
    if (searchInput) {
        searchInput.addEventListener('input', searchConnections);
    }
    
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

// Sample array of valid ID numbers (in a real app, this would be in a database)
const validIDs = [
    '123456789012', // Aadhar
    'ABCDE1234F',   // PAN
    'A1234567'      // Passport
];

const validAddressProofs = [
    '123456789012', // Aadhar
    'UTIL123456',   // Utility Bill
    'BANK123456'    // Bank Statement
];

// Function to preview uploaded documents
function previewDocument(inputId, boxId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(inputId + 'Preview');
    const box = document.getElementById(boxId);
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            box.style.borderColor = '#4CAF50';
        }
        
        reader.readAsDataURL(input.files[0]);
    }
}

// Function to verify documents
function verifyDocuments() {
    const idProof = document.getElementById('idProof');
    const addressProof = document.getElementById('addressProof');
    const statusDiv = document.getElementById('verificationStatus');
    const statusMessage = statusDiv.querySelector('.status-message');

    // Check if both documents are uploaded
    if (!idProof.files[0] || !addressProof.files[0]) {
        statusDiv.style.display = 'block';
        statusDiv.className = 'verification-status error';
        statusMessage.textContent = 'Please upload both ID proof and address proof documents.';
        return;
    }

    // Simulate document verification (in a real app, this would be done server-side)
    const isIDValid = Math.random() > 0.3; // 70% chance of success
    const isAddressValid = Math.random() > 0.3; // 70% chance of success

    if (isIDValid && isAddressValid) {
        statusDiv.style.display = 'block';
        statusDiv.className = 'verification-status success';
        statusMessage.textContent = 'Verification successful! Redirecting to dashboard...';
        
        // Store verification status
        localStorage.setItem('isVerified', 'true');
        
        // Redirect to appropriate dashboard after 2 seconds
        setTimeout(() => {
            const userType = localStorage.getItem('userType');
            window.location.href = userType === 'investor' ? 'investors_dashboard.html' : 'startup_dashboard.html';
        }, 2000);
    } else {
        statusDiv.style.display = 'block';
        statusDiv.className = 'verification-status error';
        statusMessage.textContent = 'Verification failed. Please try again with valid documents.';
    }
} 