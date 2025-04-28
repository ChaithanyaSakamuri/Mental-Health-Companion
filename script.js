// DOM Elements
const authContainer = document.getElementById('auth-container');
const mainContainer = document.getElementById('main-container');
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const newChatBtn = document.getElementById('new-chat-btn');
const logoutBtn = document.getElementById('logout-btn');
const usernameDisplay = document.getElementById('username-display');
const userEmail = document.getElementById('user-email');
const chatHistory = document.getElementById('chat-history');

// API Key
const API_KEY = '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';
const API_ENDPOINT = 'https://api.example.com/v1/completions'; 

// Sample user data (in a real app, this would be from a database)
let users = [
    { id: 1, name: "Admin", email: "chaithanya23@lpu.in", password: "Chaitu@123" }
];

// Current user and chat state
let currentUser = null;
let currentChatId = null;
let chats = {};

// Initialize the app
function init() {
    // Check if user is logged in (in a real app, you'd check session/token)
    const loggedInUser = localStorage.getItem('mindcare_user');
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        showMainApp();
    } else {
        showAuthContainer();
    }
    
    setupEventListeners();
}

function setupEventListeners() {
    // Auth tab switching
    loginTab.addEventListener('click', () => switchAuthTab('login'));
    signupTab.addEventListener('click', () => switchAuthTab('signup'));
    
    // Form submissions
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    
    // Chat functionality
    sendBtn.addEventListener('click', handleUserInput);
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserInput();
        }
    });
    
    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // New chat and logout
    newChatBtn.addEventListener('click', startNewChat);
    logoutBtn.addEventListener('click', handleLogout);
}

function switchAuthTab(tab) {
    if (tab === 'login') {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    } else {
        loginTab.classList.remove('active');
        signupTab.classList.add('active');
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('mindcare_user', JSON.stringify(user));
        showMainApp();
    } else {
        alert('Invalid email or password');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    
    if (!name || !email || !password || !confirm) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirm) {
        alert('Passwords do not match');
        return;
    }
    
    const userExists = users.some(u => u.email === email);
    
    if (userExists) {
        alert('An account with this email already exists');
    } else {
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password
        };
        
        users.push(newUser);
        currentUser = newUser;
        localStorage.setItem('mindcare_user', JSON.stringify(newUser));
        showMainApp();
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('mindcare_user');
    showAuthContainer();
}

function showAuthContainer() {
    authContainer.style.display = 'flex';
    mainContainer.style.display = 'none';
    
    loginForm.reset();
    signupForm.reset();
    switchAuthTab('login');
}

function showMainApp() {
    authContainer.style.display = 'none';
    mainContainer.style.display = 'flex';
    
    usernameDisplay.textContent = currentUser.name;
    userEmail.textContent = currentUser.email;
    
    if (!chats[currentUser.id]) {
        chats[currentUser.id] = {};
        startNewChat();
    } else {
        loadChatHistory();
    }
}

function startNewChat() {
    currentChatId = Date.now().toString();
    chats[currentUser.id][currentChatId] = {
        id: currentChatId,
        title: "New Conversation",
        messages: []
    };
    
    loadChat(currentChatId);
    updateChatHistory();
}

function loadChatHistory() {
    chatHistory.innerHTML = '';
    
    const userChats = chats[currentUser.id];
    if (!userChats) return;
    
    Object.values(userChats).forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-history-item';
        chatItem.textContent = chat.title;
        chatItem.addEventListener('click', () => loadChat(chat.id));
        
        if (chat.id === currentChatId) {
            chatItem.classList.add('active');
        }
        
        chatHistory.appendChild(chatItem);
    });
}

function loadChat(chatId) {
    currentChatId = chatId;
    const chat = chats[currentUser.id][chatId];
    
    document.getElementById('current-chat-title').textContent = chat.title;
    
    chatMessages.innerHTML = '';
    
    if (chat.messages.length === 0) {
        const welcomeMsg = document.createElement('div');
        welcomeMsg.className = 'welcome-message';
        welcomeMsg.innerHTML = `
            <h3>Welcome to MindCare AI</h3>
            <p>I'm here to support your mental health journey. You can talk to me about:</p>
            <ul>
                <li>Stress or anxiety you're experiencing</li>
                <li>Mood changes or depression symptoms</li>
                <li>Relationship or family issues</li>
                <li>Self-care and wellness strategies</li>
            </ul>
            <p>Remember, I'm not a substitute for professional help, but I can offer support and resources.</p>
        `;
        chatMessages.appendChild(welcomeMsg);
    } else {
        chat.messages.forEach(msg => {
            addMessage(msg.text, msg.isUser, false);
        });
    }
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    updateChatHistory();
}

function updateChatHistory() {
    loadChatHistory();
    
    const chat = chats[currentUser.id][currentChatId];
    if (chat.messages.length > 0 && chat.title === "New Conversation") {
        const firstMessage = chat.messages[0].text;
        chat.title = firstMessage.length > 30 
            ? firstMessage.substring(0, 30) + '...' 
            : firstMessage;
    }
}

function addMessage(text, isUser, saveToChat = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    if (saveToChat && currentChatId) {
        chats[currentUser.id][currentChatId].messages.push({
            text,
            isUser,
            timestamp: new Date().toISOString()
        });
        
        updateChatHistory();
    }
}

function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

async function handleUserInput() {
    const message = userInput.value.trim();
    if (message === '') return;
    
    addMessage(message, true);
    userInput.value = '';
    userInput.style.height = 'auto';
    
    showTypingIndicator();
    
    try {
        const response = await generateResponse(message);
        hideTypingIndicator();
        addMessage(response, false);
        
        if (shouldShowResources(message)) {
            showResources();
        }
    } catch (error) {
        hideTypingIndicator();
        addMessage("Sorry, there was an error processing your request. Please try again later.", false);
        console.error('Error generating response:', error);
    }
}

async function generateResponse(userMessage) {
    const lowerMsg = userMessage.toLowerCase();
    
    // Check for emergency keywords
    if (isEmergencyMessage(lowerMsg)) {
        return getEmergencyResponse();
    }
    
    // Check for gratitude
    if (lowerMsg.includes('thank') || lowerMsg.includes('thanks')) {
        return getGratitudeResponse();
    }
    
    // Make API call to generate response
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                prompt: `You are MindCare AI, a mental health companion. Provide a supportive and empathetic response to the following user message: "${userMessage}". Focus on mental health support, offering encouragement, validation, or simple coping strategies. If appropriate, suggest the user seek professional help but avoid diagnosing. Keep the tone warm and caring.`,
                max_tokens: 150,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].text.trim(); // Adjust based on actual API response structure
    } catch (error) {
        console.error('API Error:', error);
        // Fallback to local response if API fails
        return getFallbackResponse(lowerMsg);
    }
}

function getFallbackResponse(lowerMsg) {
    // Fallback responses if API call fails
    if (lowerMsg.includes('anxious') || lowerMsg.includes('anxiety')) {
        return `I understand you're feeling anxious. Anxiety can be overwhelming, but there are techniques that might help. Have you tried deep breathing exercises? The 4-7-8 technique (inhale for 4 seconds, hold for 7, exhale for 8) can be particularly effective. Would you like me to guide you through it?`;
    }
    
    if (lowerMsg.includes('depress') || lowerMsg.includes('sad') || lowerMsg.includes('down')) {
        return `I hear you're feeling down. Depression can make everything feel harder. Remember that what you're feeling is valid, and it's okay to not be okay. Small steps like getting some sunlight, drinking water, or reaching out to someone you trust can help. Would you like to talk more about what's on your mind?`;
    }
    
    if (lowerMsg.includes('stress') || lowerMsg.includes('overwhelm')) {
        return `Stress can feel debilitating at times. It might help to break things down into smaller, manageable tasks. Prioritizing self-care, even in small ways, can make a difference. What's one small thing you could do today to care for yourself?`;
    }
    
    if (lowerMsg.includes('lonely') || lowerMsg.includes('alone')) {
        return `Feeling lonely can be really difficult. Human connection is so important for our mental health. Even if you can't be with people physically right now, sometimes joining an online community or reaching out to someone via message can help. Would you like some suggestions for supportive communities?`;
    }
    
    if (lowerMsg.includes('sleep') || lowerMsg.includes('insomnia')) {
        return `Sleep issues can significantly impact mental health. Maintaining a consistent sleep schedule, limiting screen time before bed, and creating a relaxing bedtime routine can help. Have you noticed any patterns in your sleep difficulties?`;
    }
    
    const defaultResponses = [
        "I appreciate you sharing that with me. It takes courage to talk about these things. Would you like to explore this feeling further?",
        "I hear you. What you're experiencing sounds challenging. Remember that your feelings are valid, even if they're difficult.",
        "Thank you for trusting me with this. Mental health journeys aren't linear - there are ups and downs. Would you like to talk more about what you're experiencing?",
        "I'm here to listen. Sometimes just putting our feelings into words can help process them. Is there more you'd like to share?",
        "What you're going through matters. Would it help to brainstorm some coping strategies together?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

function isEmergencyMessage(message) {
    const emergencyKeywords = [
        'suicide', 'kill myself', 'end my life', 'self-harm', 
        'hurting myself', 'want to die', 'can\'t go on'
    ];
    
    return emergencyKeywords.some(keyword => message.includes(keyword));
}

function getEmergencyResponse() {
    const responses = [
        `I'm really concerned about what you're sharing. Your safety is incredibly important. Please reach out to a crisis hotline immediately. In the U.S., you can call or text 988 for the Suicide & Crisis Lifeline. You're not alone, and there are people who want to help.`,
        `What you're describing sounds very serious. I strongly encourage you to contact emergency services or a crisis hotline right away. Your life matters, and there are professionals available 24/7 who can provide the support you need.`,
        `This sounds like an emergency situation. Please call your local emergency number or reach out to someone you trust immediately. You deserve support and care during this difficult time.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function getGratitudeResponse() {
    const responses = [
        "You're very welcome. I'm here to support you whenever you need. Remember, taking care of your mental health is important every day.",
        "I'm glad I could help. Don't hesitate to reach out again if you need more support - your mental health matters.",
        "It's my pleasure to support you. Remember, it's okay to ask for help whenever you need it."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function shouldShowResources(message) {
    const resourceTriggers = [
        'resource', 'help', 'support', 'information', 'learn more',
        'therapy', 'counseling', 'professional', 'psychologist'
    ];
    
    return resourceTriggers.some(trigger => message.toLowerCase().includes(trigger));
}

function showResources() {
    setTimeout(() => {
        const resourcesDiv = document.createElement('div');
        resourcesDiv.className = 'resources-container';
        resourcesDiv.innerHTML = `
            <h3>Mental Health Resources</h3>
            
            <div class="resource-item">
                <h4>Crisis Support</h4>
                <p>If you're in immediate distress, these services can help:</p>
                <a href="https://988lifeline.org" target="_blank" class="resource-link">
                    <i class="fas fa-external-link-alt"></i> 988 Suicide & Crisis Lifeline (US)
                </a>
            </div>
            
            <div class="resource-item">
                <h4>Therapy Directories</h4>
                <p>Find licensed mental health professionals:</p>
                <a href="https://www.psychologytoday.com" target="_blank" class="resource-link">
                    <i class="fas fa-external-link-alt"></i> Psychology Today Therapist Directory
                </a>
            </div>
            
            <div class="resource-item">
                <h4>Mental Health Education</h4>
                <p>Learn more about mental health conditions:</p>
                <a href="https://www.nami.org" target="_blank" class="resource-link">
                    <i class="fas fa-external-link-alt"></i> National Alliance on Mental Illness (NAMI)
                </a>
            </div>
            
            <div class="resource-item">
                <h4>Mindfulness & Meditation</h4>
                <p>Tools for stress reduction and emotional regulation:</p>
                <a href="https://www.headspace.com" target="_blank" class="resource-link">
                    <i class="fas fa-external-link-alt"></i> Headspace
                </a>
            </div>
        `;
        
        chatMessages.appendChild(resourcesDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 500);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);