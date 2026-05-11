/* chat.js — Raccoon chatbot widget */
(function () {
  const WORKER_URL = 'https://aditya-chat-proxy.adityapoudel.workers.dev';

  const widget   = document.getElementById('chat-widget');
  const bubble   = document.getElementById('chat-bubble');
  const robotBtn = document.getElementById('chat-robot-btn');
  const panel    = document.getElementById('chat-panel');
  const backdrop = document.getElementById('chat-backdrop');
  const closeBtn = document.getElementById('chat-close');
  const messages = document.getElementById('chat-messages');
  const input    = document.getElementById('chat-input');
  const sendBtn  = document.getElementById('chat-send');

  const history = [];

  // Mobile: lock panel to visual viewport so keyboard doesn't move it
  function lockPanelToViewport() {
    if (window.innerWidth > 600) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const offsetY = window.innerHeight - (vv.offsetTop + vv.height);
    panel.style.transform = `translateY(-${offsetY}px)`;
  }

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      if (!panel.classList.contains('hidden')) lockPanelToViewport();
    });
    window.visualViewport.addEventListener('scroll', () => {
      if (!panel.classList.contains('hidden')) lockPanelToViewport();
    });
  }

  function openChat() {
    panel.classList.remove('hidden');
    backdrop.classList.remove('hidden');
    bubble.style.display = 'none';
    widget.style.display = 'none';
    if (window.innerWidth <= 600) document.body.style.overflow = 'hidden';
    lockPanelToViewport();
    input.focus();
  }
  function closeChat() {
    panel.classList.add('hidden');
    backdrop.classList.add('hidden');
    panel.style.transform = '';
    bubble.style.display = '';
    widget.style.display = '';
    document.body.style.overflow = '';
  }

  robotBtn.addEventListener('click', openChat);
  bubble.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);
  backdrop.addEventListener('click', closeChat);

  // Rotating prompts
  const prompts = [
    "Ask something about Aditya?",
    "Where did Aditya grow up?",
    "What has he built?",
    "Talk with Racoon about Aditya :)",
  ];
  let promptIndex = 0;
  const bubbleText = document.getElementById('chat-bubble-text');

  setInterval(() => {
    if (!panel.classList.contains('hidden') || bubble.style.display === 'none') return;
    bubbleText.classList.add('fade-out');
    setTimeout(() => {
      promptIndex = (promptIndex + 1) % prompts.length;
      bubbleText.textContent = prompts[promptIndex];
      bubbleText.classList.remove('fade-out');
    }, 400);
  }, 3500);

  function appendMsg(role, text) {
    const el = document.createElement('div');
    el.className = `chat-msg ${role}`;
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || sendBtn.disabled) return;

    input.value = '';
    input.style.height = 'auto';
    appendMsg('user', text);
    history.push({ role: 'user', content: text });

    sendBtn.disabled = true;
    const typing = appendMsg('assistant', 'Thinking…');
    typing.classList.add('typing');

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      const reply = data?.content?.[0]?.text || 'Sorry, something went wrong.';
      typing.textContent = reply;
      typing.classList.remove('typing');
      history.push({ role: 'assistant', content: reply });
    } catch {
      typing.textContent = 'Network error — please try again.';
      typing.classList.remove('typing');
      history.pop();
    }

    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 96) + 'px';
  });
})();
