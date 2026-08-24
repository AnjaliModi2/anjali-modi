/**
 * ============================================================================
 * ANJALI AI — PORTFOLIO CO-PILOT & INTERACTIVE ASSISTANT
 * Floating Glassmorphic Chat Interface with Autonomous Site Navigation
 * ============================================================================
 */

(function () {
  'use strict';

  // --- DOM Elements ---
  const orbTrigger = document.getElementById('ai-orb-trigger');
  const chatDrawer = document.getElementById('ai-chat-drawer');
  const closeBtn = document.getElementById('ai-close-btn');
  const clearBtn = document.getElementById('ai-clear-btn');
  const messagesContainer = document.getElementById('ai-messages-container');
  const chatForm = document.getElementById('ai-chat-form');
  const chatInput = document.getElementById('ai-chat-input');
  const chipsContainer = document.getElementById('ai-quick-chips');

  // --- State ---
  let isOpen = false;
  let isGenerating = false;
  const conversationHistory = [];

  // --- Quick Prompt Chips ---
  const QUICK_PROMPTS = [
    { label: '⚡ 30-sec Summary', prompt: 'Give me a 30-second recruiter summary of Anjali Modi.' },
    { label: '🛠️ Tech Stack', prompt: 'What technologies and frameworks does Anjali specialize in?' },
    { label: '🚀 Featured Projects', prompt: 'Show me Anjali\'s key full stack featured projects.' },
    { label: '📬 Contact & Hire', prompt: 'How can I contact or hire Anjali Modi?' }
  ];

  // --- Markdown Formatter (Lightweight & Safe) ---
  function formatMarkdown(text) {
    if (!text) return '';

    let formatted = text
      // Escape raw HTML entities
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Code blocks
      .replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre class="ai-code-block"><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')
      // Headings
      .replace(/^### (.*$)/gim, '<h4 class="ai-heading">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 class="ai-heading">$1</h3>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="ai-link">$1</a>')
      // Lists
      .replace(/^\s*[-•]\s+(.*)$/gim, '<li class="ai-list-item">$1</li>')
      // Numbered lists
      .replace(/^\s*(\d+)\.\s+(.*)$/gim, '<li class="ai-list-item-num"><span class="num-badge">$1.</span> $2</li>')
      // Paragraph breaks
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');

    return formatted;
  }

  // --- Render Message Bubble ---
  function appendMessage(sender, text, isMarkdown = true) {
    const msgWrapper = document.createElement('div');
    msgWrapper.className = `ai-msg-row ${sender === 'user' ? 'msg-user' : 'msg-ai'}`;

    if (sender === 'ai') {
      const avatar = document.createElement('div');
      avatar.className = 'ai-msg-avatar';
      avatar.innerHTML = '✦';
      msgWrapper.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = 'ai-msg-bubble';

    if (isMarkdown) {
      bubble.innerHTML = formatMarkdown(text);
    } else {
      bubble.textContent = text;
    }

    msgWrapper.appendChild(bubble);
    messagesContainer.appendChild(msgWrapper);
    scrollToBottom();
    return msgWrapper;
  }

  // --- Typing Indicator ---
  function showTypingIndicator() {
    const typingRow = document.createElement('div');
    typingRow.className = 'ai-msg-row msg-ai typing-indicator-row';
    typingRow.id = 'ai-typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'ai-msg-avatar';
    avatar.innerHTML = '✦';

    const bubble = document.createElement('div');
    bubble.className = 'ai-msg-bubble typing-bubble';
    bubble.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    `;

    typingRow.appendChild(avatar);
    typingRow.appendChild(bubble);
    messagesContainer.appendChild(typingRow);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('ai-typing-indicator');
    if (indicator) indicator.remove();
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // --- Autonomous Co-Pilot Page Navigation ---
  function executeNavigationAction(action) {
    if (!action) return;

    let targetElement = null;

    switch (action) {
      case 'NAVIGATE_PROJECTS':
      case 'NAVIGATE_PROCESS':
        targetElement = document.getElementById('process-and-work');
        break;
      case 'NAVIGATE_SERVICES':
        targetElement = document.getElementById('what-i-do');
        break;
      case 'NAVIGATE_ABOUT':
        targetElement = document.getElementById('about-and-tools');
        break;
      case 'NAVIGATE_CONTACT':
        targetElement = document.getElementById('contact');
        break;
      case 'NAVIGATE_HERO':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      default:
        break;
    }

    if (targetElement) {
      // Offset for sticky navigation/header
      const offset = 40;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = targetElement.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  // --- Send Message to AI Backend ---
  async function sendMessage(userText) {
    if (!userText || isGenerating) return;

    isGenerating = true;
    appendMessage('user', userText, false);
    chatInput.value = '';
    showTypingIndicator();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: conversationHistory
        })
      });

      removeTypingIndicator();

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      const aiReply = data.reply || "I'm sorry, I couldn't process that request right now.";
      
      appendMessage('ai', aiReply, true);
      conversationHistory.push({ role: 'user', content: userText });
      conversationHistory.push({ role: 'model', content: aiReply });

      // Execute autonomous co-pilot navigation action
      if (data.action) {
        executeNavigationAction(data.action);
      }
    } catch (err) {
      removeTypingIndicator();
      console.warn('AI Assistant error:', err);
      appendMessage('ai', "I'm having a little trouble connecting right now, but feel free to explore the sections or reach out directly to **anjalimodi2424@gmail.com**!", true);
    } finally {
      isGenerating = false;
    }
  }

  // --- Initialize Quick Chips ---
  function renderQuickChips() {
    if (!chipsContainer) return;
    chipsContainer.innerHTML = '';

    QUICK_PROMPTS.forEach(item => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'ai-quick-chip';
      chip.textContent = item.label;
      chip.addEventListener('click', () => {
        sendMessage(item.prompt);
      });
      chipsContainer.appendChild(chip);
    });
  }

  // --- Toggle Chat Drawer ---
  function toggleChat(openState) {
    isOpen = typeof openState === 'boolean' ? openState : !isOpen;

    if (isOpen) {
      chatDrawer.classList.add('active');
      orbTrigger.classList.add('open');
      setTimeout(() => chatInput.focus(), 300);
    } else {
      chatDrawer.classList.remove('active');
      orbTrigger.classList.remove('open');
    }
  }

  function clearConversation() {
    messagesContainer.innerHTML = '';
    conversationHistory.length = 0;
    // Welcome message
    appendMessage('ai', "👋 Hello! I'm **Anjali AI**, your interactive portfolio co-pilot.\n\nAsk me anything about Anjali's **technical skills**, **full stack projects**, **architecture experience**, or select a prompt below!", true);
  }

  // --- Event Listeners ---
  function initEvents() {
    if (orbTrigger) {
      orbTrigger.addEventListener('click', () => toggleChat());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => toggleChat(false));
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => clearConversation());
    }

    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (text) {
          sendMessage(text);
        }
      });
    }

    // Close on Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        toggleChat(false);
      }
    });
  }

  // --- Bootstrap ---
  function init() {
    initEvents();
    renderQuickChips();
    clearConversation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
