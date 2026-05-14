(function() {
    console.log("XON Multi-Platform Embed Loaded");

    const scriptTag = document.currentScript;
    const siteKey = scriptTag ? scriptTag.getAttribute('data-site-key') : 'xon-internal';
    const apiBase = scriptTag ? scriptTag.getAttribute('data-api-base') : 'http://localhost:8002';

    if (document.getElementById('xon-chat-wrapper')) return;

    // Load Font Awesome
    const fa = document.createElement('link');
    fa.rel = 'stylesheet';
    fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    document.head.appendChild(fa);

    // Theme Detection Logic
    const getThemeColor = () => {
        const cta = document.querySelector('.cta-button, .modern-search-button, .navbar-brand, button, h1');
        if (cta) {
            const style = window.getComputedStyle(cta);
            const color = style.backgroundColor || style.color;
            return color !== 'rgba(0, 0, 0, 0)' ? color : '#3f71f3';
        }
        return '#3f71f3';
    };

    const primaryColor = getThemeColor();

    // Inject Styles
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
        
        #xon-chat-wrapper { 
            position: fixed; bottom: 20px; right: 20px; z-index: 999999; 
            font-family: 'Poppins', sans-serif;
            --xon-primary: ${primaryColor};
            --xon-primary-gradient: linear-gradient(135deg, var(--xon-primary) 0%, #4284fb 100%);
        }
        #xon-launcher { 
            width: 65px; height: 65px; border-radius: 50%; 
            background: var(--xon-primary-gradient); color: white; border: none; cursor: pointer; 
            box-shadow: 0 6px 20px rgba(63, 113, 243, 0.4); font-size: 28px; 
            display: flex; align-items: center; justify-content: center; 
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            outline: none;
        }
        #xon-launcher:hover { transform: scale(1.1) rotate(5deg); }
        #xon-window { 
            display: none; width: 380px; height: 550px; background: white; border-radius: 20px; 
            box-shadow: 0 15px 50px rgba(0,0,0,0.15); flex-direction: column; overflow: hidden; 
            margin-bottom: 15px; border: 1px solid rgba(0,0,0,0.05);
            animation: xon-fade-in 0.3s ease-out;
        }
        @keyframes xon-fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .xon-header { 
            background: var(--xon-primary-gradient); color: white; padding: 20px; 
            font-weight: 600; display: flex; justify-content: space-between; align-items: center;
        }
        .xon-messages { 
            flex: 1; padding: 20px; overflow-y: auto; background: #fdfdfd; 
            display: flex; flex-direction: column; gap: 12px;
        }
        .xon-msg { 
            padding: 12px 16px; border-radius: 15px; max-width: 85%; font-size: 14px; line-height: 1.5;
            position: relative;
        }
        .xon-msg-ai { 
            background: white; border: 1px solid #f0f0f0; align-self: flex-start; 
            color: #444; box-shadow: 0 2px 5px rgba(0,0,0,0.02);
            border-bottom-left-radius: 2px;
        }
        .xon-msg-user { 
            background: var(--xon-primary-gradient); color: white; align-self: flex-end; 
            box-shadow: 0 4px 10px rgba(63, 113, 243, 0.2);
            border-bottom-right-radius: 2px;
        }
        .xon-input-box { padding: 15px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; }
        .xon-input-box input { 
            flex: 1; padding: 12px 20px; border: 1px solid #eee; border-radius: 30px; 
            outline: none; font-size: 14px; transition: border-color 0.3s;
        }
        .xon-input-box input:focus { border-color: var(--xon-primary); }
        .xon-input-box button { 
            background: var(--xon-primary-gradient); color: white; border: none; 
            width: 45px; height: 45px; border-radius: 50%; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: opacity 0.3s;
        }
        .xon-input-box button:hover { opacity: 0.9; }
    `;
    document.head.appendChild(style);

    // Inject HTML
    const html = `
        <div id="xon-chat-wrapper">
            <div id="xon-window">
                <div class="xon-header">
                    <span><i class="fas fa-shield-halved"></i> XON AI Security</span>
                    <button id="xon-close" style="background:none; border:none; color:white; cursor:pointer; font-size:20px;"><i class="fas fa-times"></i></button>
                </div>
                <div id="xon-messages" class="xon-messages">
                    <div class="xon-msg xon-msg-ai">Hi! I'm the AI security assistant. How can I help you today?</div>
                </div>
                <div class="xon-input-box">
                    <input type="text" id="xon-input" placeholder="Ask a security question...">
                    <button id="xon-send"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
            <button id="xon-launcher"><i class="fas fa-robot"></i></button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    // Logic
    const launcher = document.getElementById('xon-launcher');
    const windowEl = document.getElementById('xon-window');
    const closeBtn = document.getElementById('xon-close');
    const inputEl = document.getElementById('xon-input');
    const sendBtn = document.getElementById('xon-send');
    const msgContainer = document.getElementById('xon-messages');

    let history = [];

    launcher.onclick = () => {
        windowEl.style.display = windowEl.style.display === 'flex' ? 'none' : 'flex';
        if (windowEl.style.display === 'flex') inputEl.focus();
    };

    closeBtn.onclick = () => windowEl.style.display = 'none';

    const addMsg = (role, text) => {
        const div = document.createElement('div');
        div.className = `xon-msg xon-msg-${role}`;
        div.innerHTML = text.replace(/\n/g, '<br>');
        msgContainer.appendChild(div);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    };

    const send = async () => {
        const text = inputEl.value.trim();
        if (!text) return;

        addMsg('user', text);
        history.push({ role: 'user', content: text });
        inputEl.value = '';

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'xon-msg xon-msg-ai';
        loadingDiv.innerText = 'Analyzing...';
        msgContainer.appendChild(loadingDiv);
        msgContainer.scrollTop = msgContainer.scrollHeight;

        try {
            const resp = await fetch(`${apiBase}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history, site_key: siteKey })
            });

            if (resp.status === 403) {
                loadingDiv.innerText = "Error: Invalid Site Key for this domain.";
                return;
            }

            const data = await resp.json();
            loadingDiv.innerHTML = data.reply.replace(/\n/g, '<br>');
            history.push({ role: 'assistant', content: data.reply });
        } catch (err) {
            loadingDiv.innerText = "Connection error. Please try again.";
        }
        msgContainer.scrollTop = msgContainer.scrollHeight;
    };

    sendBtn.onclick = send;
    inputEl.onkeypress = (e) => { if (e.key === 'Enter') send(); };

})();