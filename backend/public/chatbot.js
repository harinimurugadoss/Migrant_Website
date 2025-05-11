// Simple chatbot for the TN Migrant Worker Portal
document.addEventListener('DOMContentLoaded', function() {
  // Create the chatbot UI
  const chatbotHTML = `
    <div id="chatbot-container">
      <div id="chatbot-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <div id="chat-notification" style="display: none;">1</div>
      </div>
      <div id="chatbot-panel">
        <div id="chatbot-header">
          <div>Help Assistant</div>
          <div id="chatbot-close">✕</div>
        </div>
        <div id="chatbot-messages">
          <div class="chat-message bot-message">
            <div class="avatar">TN</div>
            <div class="message">
              Hello! How can I help you today with the Tamil Nadu Migrant Worker Portal? 
              <div class="suggestions">
                <button class="suggestion-btn" data-query="How do I register?">How do I register?</button>
                <button class="suggestion-btn" data-query="What documents do I need?">What documents do I need?</button>
                <button class="suggestion-btn" data-query="How to verify Aadhar?">How to verify Aadhar?</button>
              </div>
            </div>
          </div>
        </div>
        <div id="chatbot-input-container">
          <input type="text" id="chatbot-input" placeholder="Type your question here...">
          <button id="chatbot-send">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // Insert the chatbot HTML into the document
  const chatbotDiv = document.createElement('div');
  chatbotDiv.innerHTML = chatbotHTML;
  document.body.appendChild(chatbotDiv);

  // Add CSS for the chatbot
  const style = document.createElement('style');
  style.textContent = `
    #chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    #chatbot-button {
      width: 60px;
      height: 60px;
      background-color: #028090;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      color: white;
      position: relative;
      transition: all 0.3s;
    }
    #chatbot-button:hover {
      background-color: #114B5F;
      transform: translateY(-2px);
    }
    #chat-notification {
      position: absolute;
      top: -5px;
      right: -5px;
      background-color: #F45B69;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 12px;
      font-weight: bold;
    }
    #chatbot-panel {
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 350px;
      height: 450px;
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    #chatbot-header {
      padding: 15px;
      background-color: #028090;
      color: white;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #chatbot-close {
      cursor: pointer;
      font-size: 16px;
    }
    #chatbot-messages {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .chat-message {
      display: flex;
      gap: 10px;
      max-width: 80%;
    }
    .bot-message {
      align-self: flex-start;
    }
    .user-message {
      align-self: flex-end;
      flex-direction: row-reverse;
    }
    .avatar {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background-color: #028090;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      font-size: 12px;
      flex-shrink: 0;
    }
    .user-message .avatar {
      background-color: #F45B69;
    }
    .message {
      background-color: #f1f0f0;
      padding: 10px 15px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.4;
    }
    .user-message .message {
      background-color: #E1F5F9;
    }
    #chatbot-input-container {
      padding: 15px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 10px;
    }
    #chatbot-input {
      flex: 1;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 20px;
      font-size: 14px;
      outline: none;
    }
    #chatbot-input:focus {
      border-color: #028090;
    }
    #chatbot-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #028090;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #chatbot-send svg {
      width: 18px;
      height: 18px;
    }
    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 10px;
    }
    .suggestion-btn {
      background-color: #ffffff;
      border: 1px solid #028090;
      color: #028090;
      border-radius: 15px;
      padding: 5px 10px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .suggestion-btn:hover {
      background-color: #028090;
      color: white;
    }
  `;
  document.head.appendChild(style);

  // Get elements
  const chatbotButton = document.getElementById('chatbot-button');
  const chatbotPanel = document.getElementById('chatbot-panel');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSend = document.getElementById('chatbot-send');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatNotification = document.getElementById('chat-notification');

  // Add event listeners
  chatbotButton.addEventListener('click', toggleChatbot);
  chatbotClose.addEventListener('click', closeChatbot);
  chatbotSend.addEventListener('click', sendMessage);
  chatbotInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Show notification after a delay
  setTimeout(() => {
    if (chatbotPanel.style.display !== 'flex') {
      chatNotification.style.display = 'flex';
    }
  }, 5000);

  // Bind events for suggestion buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('suggestion-btn')) {
      const query = e.target.getAttribute('data-query');
      chatbotInput.value = query;
      sendMessage();
    }
  });

  // Functions
  function toggleChatbot() {
    if (chatbotPanel.style.display === 'flex') {
      chatbotPanel.style.display = 'none';
    } else {
      chatbotPanel.style.display = 'flex';
      chatNotification.style.display = 'none';
      chatbotInput.focus();
    }
  }

  function closeChatbot() {
    chatbotPanel.style.display = 'none';
  }

  function sendMessage() {
    const message = chatbotInput.value.trim();
    if (message === '') return;

    // Add user message to chat
    addMessage(message, 'user');
    chatbotInput.value = '';

    // Send to our chatbot endpoint and get response
    setTimeout(() => {
      const response = getBotResponse(message);
      addMessage(response, 'bot');
    }, 500);
  }

  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';
    avatarDiv.textContent = sender === 'user' ? 'You' : 'TN';
    
    const messageContentDiv = document.createElement('div');
    messageContentDiv.className = 'message';
    
    // If it's a bot message with suggestions
    if (sender === 'bot' && text.includes('SUGGESTIONS:')) {
      const parts = text.split('SUGGESTIONS:');
      messageContentDiv.textContent = parts[0].trim();
      
      if (parts[1]) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'suggestions';
        
        const suggestions = parts[1].split('|');
        suggestions.forEach(suggestion => {
          suggestion = suggestion.trim();
          if (suggestion) {
            const button = document.createElement('button');
            button.className = 'suggestion-btn';
            button.setAttribute('data-query', suggestion);
            button.textContent = suggestion;
            suggestionsDiv.appendChild(button);
          }
        });
        
        messageContentDiv.appendChild(suggestionsDiv);
      }
    } else {
      messageContentDiv.textContent = text;
    }
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(messageContentDiv);
    chatbotMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  // Simple response logic
  function getBotResponse(message) {
    message = message.toLowerCase();
    
    if (message.includes('register') || message.includes('sign up')) {
      return "To register as a migrant worker, click on the 'Register' button in the navigation menu. You'll need to provide your personal details including name, contact information, Aadhar number, and home state. After registration, you'll receive a unique Worker ID. SUGGESTIONS: What documents do I need?|How do I verify my Aadhar?|How long does registration take?";
    }
    
    else if (message.includes('aadhar') || message.includes('verify') || message.includes('verification')) {
      return "Aadhar verification is done through an OTP sent to the mobile number linked with your Aadhar. After registration, go to the 'Aadhar Verification' page, enter your 12-digit Aadhar number, receive the OTP, and submit it to complete verification. SUGGESTIONS: What if my mobile number has changed?|Can I update my Aadhar details?|Why is Aadhar verification required?";
    }
    
    else if (message.includes('document') || message.includes('upload')) {
      return "Required documents include Aadhar Card, a recent photograph, and proof of address. Additional documents may include work certificates, skills certificates, or previous employment letters. You can upload these documents from your dashboard after logging in. SUGGESTIONS: What format should documents be in?|Is there a size limit?|How long does verification take?";
    }
    
    else if (message.includes('job') || message.includes('work') || message.includes('employment')) {
      return "You can find job listings in the 'Jobs' section. Filter by location, job type, or salary range to find suitable opportunities. Once you find a job, click 'Apply Now' and complete the application form. SUGGESTIONS: How do I apply for a job?|What types of jobs are available?|How will I be contacted?";
    }
    
    else if (message.includes('scheme') || message.includes('benefit') || message.includes('government')) {
      return "Government schemes are available in the 'Gov. Schemes' section. Browse through various central and state government programs for which you may be eligible. You can check eligibility criteria and apply through our portal. SUGGESTIONS: What schemes am I eligible for?|How do I apply for schemes?|What documents are needed for schemes?";
    }
    
    else if (message.includes('login') || message.includes('sign in') || message.includes('account')) {
      return "To log in, use the 'Login' button in the navigation menu. Enter your email or Worker ID and password. If you've forgotten your password, use the 'Forgot Password' option to reset it. SUGGESTIONS: I forgot my password|Can I use Worker ID to login?|How to change my password?";
    }
    
    else if (message.includes('contact') || message.includes('help') || message.includes('support')) {
      return "For additional support, you can contact our helpline at 1800-XXX-XXXX or email support@tnmigrantportal.gov.in. Our support team is available Monday to Saturday, 9 AM to 6 PM. SUGGESTIONS: Is there an office I can visit?|How long does support take to respond?|Can I get help in my language?";
    }
    
    else {
      return "I'm here to help you with registration, document uploads, job applications, government schemes, and general navigation of the Tamil Nadu Migrant Worker Portal. Please let me know what specific information you need. SUGGESTIONS: How do I register?|How to find jobs?|What government schemes are available?";
    }
  }
});