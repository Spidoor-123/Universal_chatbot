// chat-widget.js
document.addEventListener('DOMContentLoaded', () => {
  console.log("XON Chat Widget initializing...");

  if (document.getElementById('xon-chat-container')) return;

  // Helper to get primary color from the website
  const getThemeColor = () => {
    // Try to find a button or a specific themed element
    const cta = document.querySelector('.cta-button, .modern-search-button, .navbar-brand');
    if (cta) {
      const style = window.getComputedStyle(cta);
      return style.backgroundColor || style.color;
    }
    return '#3f71f3'; // Fallback
  };

  const primaryColor = getThemeColor();

  const chatHTML = `
    <div id="xon-chat-container" style="
      position:fixed; 
      bottom:20px; 
      right:20px; 
      z-index:2147483647; 
      font-family:'Poppins', sans-serif;
      --xon-primary: ${primaryColor};
      --xon-primary-gradient: linear-gradient(180deg, var(--xon-primary) 0%, #4284fb 100%);
    ">
      <button id="xon-chat-btn" style="background: var(--xon-primary-gradient); color:#fff; border:none; border-radius:50%; width:60px; height:60px; font-size:24px; cursor:pointer; box-shadow:0 4px 15px rgba(63, 113, 243, 0.4); transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; outline: none;">
        <i class="fas fa-robot"></i>
      </button>
      <div id="xon-chat-window" style="display:none; width:380px; height:500px; background:#fff; border-radius:15px; box-shadow:0 10px 30px rgba(0,0,0,0.2); flex-direction:column; margin-bottom:15px; overflow:hidden; border: 1px solid rgba(63, 113, 243, 0.1);">
        <div style="background: var(--xon-primary-gradient); color:#061e59; padding:18px; font-weight:600; display:flex; justify-content:space-between; align-items:center;">
          <span>XON AI Security Assistant</span>
          <button id="xon-chat-close" style="background:none; border:none; color:#061e59; cursor:pointer; font-size:18px; outline: none;">&times;</button>
        </div>
        <div id="xon-chat-history" style="flex:1; padding:15px; overflow-y:auto; font-size:14px; background:#fdfdfd; display:flex; flex-direction:column; gap:10px;">
          <div style="background:#fff; border: 1px solid #eef2ff; padding:12px; border-radius:12px 12px 12px 0; max-width:85%; align-self:flex-start; color:#333; line-height:1.4; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            <b>AI:</b> Hello! Enter your email to check if your data has been compromised, or ask me any security question!
          </div>
        </div>
        <div style="padding:15px; border-top:1px solid #eee; background:#fff; display:flex; gap:10px; align-items:center;">
          <input type="text" id="xon-chat-input" placeholder="Type email or question..." style="flex:1; padding:10px 15px; border:1px solid #ddd; border-radius:25px; outline:none; font-size:14px; transition: border-color 0.3s;">
          <button id="xon-chat-send" style="background: var(--xon-primary-gradient); color:#fff; border:none; width:40px; height:40px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(63, 113, 243, 0.3); outline: none;">
            <i class="fas fa-paper-plane" style="font-size: 14px;"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', chatHTML);

  const chatBtn = document.getElementById('xon-chat-btn');
  const chatWindow = document.getElementById('xon-chat-window');
  const chatClose = document.getElementById('xon-chat-close');
  const chatInput = document.getElementById('xon-chat-input');
  const chatSend = document.getElementById('xon-chat-send');
  const chatHistory = document.getElementById('xon-chat-history');

  let chatMessages = [];

  const toggleChat = () => {
    const isHidden = chatWindow.style.display === 'none';
    chatWindow.style.display = isHidden ? 'flex' : 'none';
    if (isHidden) chatInput.focus();
  };

  chatBtn.onclick = toggleChat;
  chatClose.onclick = toggleChat;

  const sendMessage = async () => {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatMessages.push({ role: "user", content: userMessage });

    chatHistory.innerHTML += `
      <div style="background: #548ef4ff; padding:12px; border-radius:12px 12px 0 12px; max-width:85%; align-self:flex-end; color:#0056b3; line-height:1.4;">
          <b>You:</b> ${userMessage}
      </div>
    `;

    chatInput.value = '';
    const loadingId = 'xon-loading-' + Date.now();
    chatHistory.innerHTML += `<div id="${loadingId}" style="color:#666; font-style:italic; font-size:12px; margin-top:5px;">AI is thinking...</div>`;
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
      const response = await fetch('http://localhost:8002/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages })
      });
      const data = await response.json();

      chatMessages.push({ role: "assistant", content: data.reply });

      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();

      chatHistory.innerHTML += `
        <div style="background:#fff; border: 1px solid #eef2ff; padding:12px; border-radius:12px 12px 12px 0; max-width:85%; align-self:flex-start; color:#333; line-height:1.4; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            <b>AI:</b> ${data.reply.replace(/\n/g, '<br>')}
        </div>
      `;
      chatHistory.scrollTop = chatHistory.scrollHeight;
    } catch (err) {
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.innerHTML = "<span style='color:#ed3237'>Connection error. Please try again.</span>";
    }
  };

  chatSend.onclick = sendMessage;
  chatInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

  console.log("XON Chat Widget ready!");
});
