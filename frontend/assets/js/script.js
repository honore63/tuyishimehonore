window.Tawk_API = window.Tawk_API || {};
window.Tawk_API.autoStart = false;

const videos = [
  { id: 'yvzLHXqcanQ' },
  { id: 'glsbQJfo4T8' },
  { id: '8_UyFSrQblc' },
  { id: 'jPFDwkthyaA' },
];

/** 
 * 📄 PDF.js Configuration for AI Document Analysis
 * This allows the AI to "read" PDFs uploaded by visitors in real-time.
 */
const pdfjsLib = window['pdfjs-dist/build/pdf'];
if (pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

/** 
 * Utility to extract text from a PDF file
 * Used to give the AI context about uploaded student reports, CVs, etc.
 */
async function extractTextFromPDF(file) {
  if (!pdfjsLib) return "";
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const typedarray = new Uint8Array(reader.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map(item => item.str).join(" ") + "\n";
        }
        resolve(fullText);
      } catch (err) {
        console.error("PDF Extraction error:", err);
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// USER PROVIDED GOOGLE API KEYS
const GOOGLE_API_KEY = "AIzaSyBIqQ-gyjdKJ3x2n2iREYT6PoFnBl3-RqE";

// Global state for chat personalization and memory
let chatState = {
  userRole: null, // 'teacher', 'student', 'collaborator', or null
  uploadedDocuments: [],
  conversationLength: 0,
  chatHistory: [] // To store recent messages for context
};

// Prevent multiple initializations
if (window.honoreChatInitialized) {
  console.log('🤖 Chat already initialized, skipping...');
} else {
  window.honoreChatInitialized = true;

  document.addEventListener('DOMContentLoaded', () => {
    // Show startup message only once
    console.log('%c🤖 HONORE AI CHAT READY', 'color: #228b22; font-size: 14px; font-weight: bold;');
    console.log('%c📝 To enable AI responses: Open console and paste:', 'color: #666; font-size: 12px;');
    console.log('%csetOpenAIKey("sk-proj-YOUR-KEY-HERE")', 'color: #007bff; font-size: 12px; font-weight: bold;');
    console.log('%cThen chat will show real AI responses with thinking bubbles! 🧠', 'color: #666; font-size: 12px;');

    // Initialize chat functionality
    initChatSystem();
  });
}

function initChatSystem() {
  // 📱 Register Service Worker for Mobile App (PWA)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('🚀 Service Worker: Registered'))
      .catch(err => console.log('❌ Service Worker: Failed', err));
  }

  // Initialize video functionality only if elements exist
  initVideos();

  // Initialize hero quotes rotation (Home Page only)
  initHeroQuotes();

  // Initialize accessibility features
  initAccessibilityFeatures();

  function saveAccessibilitySettings() {
    const toggle = document.getElementById('screen-reader-toggle');
    if (toggle) {
      localStorage.setItem('honore-screen-reader', toggle.checked);
    }
  }

  function loadAccessibilitySettings() {
    const toggle = document.getElementById('screen-reader-toggle');
    const saved = localStorage.getItem('honore-screen-reader');
    if (toggle && saved !== null) {
      toggle.checked = (saved === 'true');
      if (toggle.checked) {
         // Small delay to ensure voices are ready
         setTimeout(() => toggleScreenReader(), 1000);
      }
    }
  }

  // Initialize hero quotes rotation (Home Page only)
  initHeroQuotes();

  // Initialize chat functionality
  initChat();

  // Initialize mobile menu
  initMobileMenu();



  // Initialize contact form for Supabase
  initContactForm();

  // Initialize preview button functionality for personal testimony
  initPreview();
  initNavScroll();
}

function initMobileMenu() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.classList.toggle('nav-open');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('nav-open');
      });
    });
  }
}

function initChatEventListeners() {
  // Chat form handling
  const aiForm = document.getElementById('ai-form');
  if (aiForm) {
    aiForm.addEventListener('submit', handleChatSubmit);
  }

  // Chat toggle
  const aiToggle = document.getElementById('ai-toggle');
  if (aiToggle) {
    aiToggle.addEventListener('click', toggleChat);
  }

  // Chat close
  const aiClose = document.getElementById('ai-close');
  if (aiClose) {
    aiClose.addEventListener('click', closeChat);
  }
}

async function handleChatSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('ai-input');
  if (!input) return;

  const message = input.value.trim();
  if (!message) return;

  // Add user message
  appendChatMessageEnhanced(message, 'user');
  input.value = '';

  // Get bot response
  const response = await getChatResponse(message);
  appendChatMessageEnhanced(response, 'bot');
}

function toggleChat() {
  const aiWidget = document.getElementById('ai-widget');
  if (aiWidget) {
    aiWidget.classList.toggle('open');
    const toggle = document.getElementById('ai-toggle');
    if (toggle) {
      const isOpen = aiWidget.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen);
    }
  }
}

function closeChat() {
  const aiWidget = document.getElementById('ai-widget');
  if (aiWidget) {
    aiWidget.classList.remove('open');
    const toggle = document.getElementById('ai-toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
    }
  }
}

function setNowPlaying(title) {
  const nowPlaying = document.getElementById('now-playing');
  if (nowPlaying) nowPlaying.textContent = `Now Playing: ${title}`;
}

async function fetchTitle(videoId) {
  if (GOOGLE_API_KEY) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        return data.items[0].snippet.title;
      }
} catch (error) {
      console.error('YouTube Data API error:', error);
    }
  }

  // oEmbed Fallback
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('oEmbed fetch failed');
    const data = await response.json();
    return data.title;
  } catch {
    return 'Ministry Video';
  }
}

function createCard(video) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'video-card';
  button.dataset.videoId = video.id;
  button.setAttribute('aria-label', 'Play video');

  const thumb = document.createElement('div');
  thumb.className = 'video-thumb';
  thumb.style.backgroundImage = `url('https://img.youtube.com/vi/${video.id}/hqdefault.jpg')`;

  const meta = document.createElement('div');
  meta.className = 'video-meta';
  meta.innerHTML = `
    <span class="video-title">Loading title…</span>
  `;

  button.appendChild(thumb);
  button.appendChild(meta);

  fetchTitle(video.id).then((title) => {
    // Format title: clean up ugly separators and convert ALL CAPS to Title Case
    let cleanTitle = (title || '')
      .replace(/(\/\/|@@|_)/g, ' - ')
      .replace(/\s+/g, ' ')
      .trim();
    // Convert to Title Case for a professional look
    cleanTitle = cleanTitle.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

    const titleEl = meta.querySelector('.video-title');
    if (titleEl) {
      titleEl.textContent = cleanTitle;
      button.setAttribute('aria-label', `Play video: ${cleanTitle}`);
    }
    video.title = cleanTitle;
  });

  return button;
}

function loadVideo(videoId) {
  const ytPlayer = document.getElementById('yt-player');
  if (!ytPlayer) return;
  ytPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  const current = videos.find((v) => v.id === videoId);
  if (current && current.title) {
    setNowPlaying(current.title);
  }
}

async function initVideos() {
  const videoGrid = document.getElementById('video-grid');
  if (!videoGrid) return; // Only initialize if element exists

  videos.forEach((video) => {
    videoGrid.appendChild(createCard(video));
  });

  // Add "Find more" indicator card
  const moreCard = document.createElement('a');
  moreCard.href = 'https://www.youtube.com/@tuyishimehonore9611';
  moreCard.target = '_blank';
  moreCard.className = 'video-card more-videos-card';
  moreCard.innerHTML = `
    <div class="video-thumb more-thumb">
      <div class="more-overlay">
        <span>+ Explore More</span>
      </div>
    </div>
    <div class="video-meta">
      <span class="video-title">View All Videos on YouTube</span>
    </div>
  `;
  videoGrid.appendChild(moreCard);

  if (videos.length) {
    const first = videos[0];
    const title = await fetchTitle(first.id);
    first.title = title;
    setNowPlaying(title);
    loadVideo(first.id);
    const firstCard = videoGrid.querySelector('.video-card');
    if (firstCard) firstCard.classList.add('active-video');
  }

  videoGrid.addEventListener('click', (event) => {
    const card = event.target.closest('.video-card');
    if (!card) return;
    const videoId = card.dataset.videoId;
    if (!videoId) return;

    // Identify selected video visually
    document.querySelectorAll('.video-card').forEach(c => c.classList.remove('active-video'));
    card.classList.add('active-video');

    loadVideo(videoId);
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function appendChatMessage(text, sender) {
  const container = document.getElementById('ai-messages');
  if (!container) return;

  const message = document.createElement('div');
  message.className = `ai-message ${sender}`;
  message.textContent = text;
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;

  // Track conversation length
  if (sender === 'user' || sender === 'bot') {
    chatState.conversationLength++;
  }
}

// Create message for bot messages (simple bubble)
function createBotMessage(text) {
  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'ai-message-wrapper bot-wrapper';

  const thinkingRegex = /---THINKING---([\s\S]*?)---END THINKING---/;
  // The thinking block is used for model reasoning but hidden from the final UI
  let cleanText = text.replace(thinkingRegex, '').trim();

  // 1. Create answer bubble
  const bubble = document.createElement('div');
  bubble.className = 'ai-message-bubble bot';
  
  // Parse for buttons: ((BUTTON:Label:Action))
  const buttonRegex = /\(\(BUTTON:(.*?):(.*?)\)\)/g;
  const buttons = [];
  let match;
  while ((match = buttonRegex.exec(cleanText)) !== null) {
    buttons.push({ label: match[1], action: match[2] });
  }
  
  // Remove button syntax from text
  const displayChatText = cleanText.replace(buttonRegex, '').trim();
  bubble.innerHTML = displayChatText;

  messageWrapper.appendChild(bubble);

  // 3. Add buttons if any
  if (buttons.length > 0) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'ai-button-container';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '0.5rem';
    buttonContainer.style.marginTop = '0.5rem';
    buttonContainer.style.flexWrap = 'wrap';

    buttons.forEach(btn => {
      const b = document.createElement('button');
      b.className = 'btn btn-sm btn-outline';
      b.style.fontSize = '0.85rem';
      b.style.padding = '0.4rem 0.8rem';
      b.textContent = btn.label;
      b.onclick = () => {
        const action = btn.action.trim();
        if (action.startsWith('http') || action.endsWith('.pdf') || action.endsWith('.docx')) {
          window.open(action, '_blank');
        } else if (action.endsWith('.html') || action.includes('#')) {
          // Standard page navigation
          window.location.href = action;
        } else if (action.startsWith('/')) {
          window.location.href = action;
        } else {
          window.location.href = action; // Try as standard relative link
        }
      };
      buttonContainer.appendChild(b);
    });
    messageWrapper.appendChild(buttonContainer);
  }

  return messageWrapper;
}

// Create message for user messages
function createUserMessage(text) {
  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'ai-message-wrapper user-wrapper';

  const bubble = document.createElement('div');
  bubble.className = 'ai-message-bubble user';
  bubble.textContent = text;

  messageWrapper.appendChild(bubble);

  return messageWrapper;
}

// Enhanced append message with proper structure
function appendChatMessageEnhanced(text, sender) {
  const container = document.getElementById('ai-messages');
  if (!container) return;

  let messageElement;
  if (sender === 'bot') {
    messageElement = createBotMessage(text);
  } else {
    messageElement = createUserMessage(text);
  }

  container.appendChild(messageElement);
  container.scrollTop = container.scrollHeight;

  if (sender === 'user' || sender === 'bot') {
    chatState.conversationLength++;
  }
}

// Set user role (Local only)
function setUserRole(role) {
  chatState.userRole = role;

  let roleLabel = 'General visitor';
  if (role === 'teacher') roleLabel = 'Educator';
  if (role === 'student') roleLabel = 'Student/Learner';
  if (role === 'collaborator') roleLabel = 'Collaborator';

  console.log(`Role set to: ${roleLabel}`);

  // Optional: show a brief confirmation
  const roleEl = document.getElementById('ai-user-role');
  if (roleEl) {
    roleEl.textContent = `Role: ${roleLabel}`;
  }
}

// Get conversation info (Local only)
function getConversationInfo() {
  return {
    length: chatState.conversationLength,
    role: chatState.userRole,
    docs: chatState.uploadedDocuments.length
  };
}

function scanPageContent() {
  const elements = document.querySelectorAll('h1, h2, h3, .card h3, .section-title, .role-item h3');
  const paragraphs = document.querySelectorAll('.card p, .section-subtitle, .brand-desc');
  
  let content = `I am currently analyzing the ${document.title} page.\n\nKey information found:\n`;
  
  elements.forEach(el => {
    if (el.textContent.trim()) {
      content += `[HEADING/TITLE]: ${el.textContent.trim()}\n`;
    }
  });

  paragraphs.forEach(el => {
    if (el.textContent.length > 20) {
      content += `[CONTENT]: ${el.textContent.trim()}\n`;
    }
  });

  return content.slice(0, 3000); // Limit to avoid token bloat while keeping real info
}

function getFallbackResponse(message) {
  const lang = window.HONORE_CURRENT_LANG || 'en';
  const lower = message.trim().toLowerCase();

  const reasoningSteps = {
    en: [
      "🔍 Scanning Honore's local database for real data...",
      "📂 Accessing Work Experience & Education records...",
      "🧠 Processing request via local agent logic...",
      "✨ Formulating response based on real portfolio facts..."
    ],
    fr: [
      "🔍 Analyse de la base de données locale d'Honore...",
      "📂 Accès aux dossiers d'expérience et d'éducation...",
      "🧠 Traitement de la demande via l'agent local...",
      "✨ Formulation de la réponse basée sur les faits du portfolio..."
    ]
  };

  const steps = reasoningSteps[lang] || reasoningSteps.en;

  const patterns = [
    {
      test: /\b(hi|hello|hey|bonjour|salut|qui est|présente|introduce)\b/i,
      en: `Hello! I'm the AI assistant for **Tuyishime Honore**. Honore is a professional Teacher, ICT Trainer, and EdTech Advocate based in Rwanda. He is a STEM Educator at **Rukara Model School**. ((BUTTON:About Honore:about.html))`,
      fr: `Bonjour ! Je suis l'assistant IA de **Tuyishime Honore**. Honore est un enseignant professionnel, formateur en TIC et défenseur des technologies éducatives au Rwanda. Il est éducateur STEM à **Rukara Model School**. ((BUTTON:À propos:about.html))`
    },
    {
      test: /\b(education|study|école|académique|diplôme)\b/i,
      en: `Honore's background: Current ULK student, PTRP TTC De La Salle, A2 TTC Matimba. ((BUTTON:View Education:education.html))`,
      fr: `Parcours d'Honore : Étudiant à l'ULK, PTRP TTC De La Salle, A2 TTC Matimba. ((BUTTON:Voir Éducation:education.html))`
    },
    {
      test: /\b(work|experience|job|travail|métier|enseignant|rukara)\b/i,
      en: `Honore is a STEM Educator at Rukara Model School and Senior ICT Trainer at PISQUARE (Edify). ((BUTTON:Experience:roles.html))`,
      fr: `Honore est éducateur STEM à Rukara Model School et formateur principal en TIC chez PISQUARE (Edify). ((BUTTON:Expérience:roles.html))`
    }
  ];

  for (const entry of patterns) {
    if (entry.test.test(lower)) {
      const reply = entry[lang] || entry.en;
      return `---THINKING---\n${steps.join("\n")}\n---END THINKING---\n${reply}`;
    }
  }

  const defaultReplies = {
    en: "I've analyzed your request. I can tell you about Honore's **STEM teaching**, **ICT training**, or **Academic background**. ((BUTTON:View CV:cv.html))",
    fr: "J'ai analysé votre demande. Je peux vous parler de l'**enseignement STEM** d'Honore, de sa **formation en TIC** ou de son **parcours académique**. ((BUTTON:Voir CV:cv.html))"
  };

  return `---THINKING---\n${steps.join("\n")}\n---END THINKING---\n${defaultReplies[lang] || defaultReplies.en}`;
}

// HONORE'S COMPLETE BACKGROUND CONTEXT (POWERFUL VERSION)
// === HONORE'S OFFICIAL AI ASSISTANT PROMPT ===
const HONORE_CONTEXT = `
You are the official AI assistant for Tuyishime Honore's portfolio website.

Your purpose is to help visitors learn about Honore, his projects, skills, experience, services, and achievements.

Your responsibilities:
- Introduce Honore professionally when visitors ask about him.
- Explain projects in simple and clear language.
- Recommend relevant projects based on visitor interests.
- Provide links to GitHub repositories, live demos, CV, and contact information when available.
- Explain technologies and tools used in projects.
- Answer questions about services offered.
- Help recruiters and clients quickly find relevant information.
- Encourage visitors to contact Honore for collaborations, freelance work, consulting, or employment opportunities.

Communication Style:
- Friendly and professional.
- Clear and concise.
- Avoid unnecessary technical jargon unless requested.
- Use bullet points for lists.
- Keep answers focused on the user's question.

Rules:
- Never invent information.
- Only use information stored in the portfolio database or knowledge base.
- If information is unavailable, politely say so.
- Do not discuss topics unrelated to the portfolio owner.
- Do not provide misleading or false information.

Examples:
Visitor: Who is Honore?
Assistant: Tuyishime Honore is a developer and technology enthusiast with experience building modern web applications, AI-powered solutions, and database-driven systems.

Visitor: What technologies does he use?
Assistant:
- Supabase
- PostgreSQL
- React
- TypeScript
- Tailwind CSS
- OpenAI APIs

Visitor: Can I download his CV?
Assistant:
Yes, you can download the CV here:
../docs/Document/Honore curriculum vitae.pdf
`;

// Internal State
let OPENAI_API_KEY = '';

function setOpenAIKey(apiKey) {
  OPENAI_API_KEY = apiKey;
  console.log('✓ OpenAI API key set successfully');
  console.log('🟢 Chat will now use real AI responses with thinking bubbles');
}

// Startup logs
console.log('%c🤖 HONORE AI CHAT READY', 'color: #228b22; font-size: 14px; font-weight: bold;');
console.log('%c📝 To enable AI: setOpenAIKey("sk-proj-...")', 'color: #FF6B35; font-size: 11px;');
console.log('%cThen chat will show real AI responses with thinking bubbles! 🧠', 'color: #4a584a; font-size: 12px;');

async function getChatResponse(message) {
  // Update local history
  const userMsg = { role: 'user', content: message };
  
  // Keep history to last 10 messages for token efficiency
  const history = [...chatState.chatHistory, userMsg].slice(-10);

  // TIER 1: OpenAI (if key is set via console)
  if (typeof OPENAI_API_KEY !== 'undefined' && OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: HONORE_CONTEXT },
            ...history
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botResponse = data.choices[0]?.message?.content || getFallbackResponse(message);
        
        // Save to history
        chatState.chatHistory = [...history, { role: 'assistant', content: botResponse }].slice(-10);
        return botResponse;
      }
    } catch (e) { console.error('OpenAI Error:', e); }
  }

  // TIER 2: Google Gemini (uses the hardcoded key)
  if (typeof GOOGLE_API_KEY !== 'undefined' && GOOGLE_API_KEY) {
    try {
      const pageContext = typeof scanPageContent === 'function' ? scanPageContent() : '';
      
      // Include uploaded documents in the prompt if any
      const docContext = chatState.uploadedDocuments.length > 0 
        ? `\n\n[UPLOADED DOCUMENTS CONTENT]\n${chatState.uploadedDocuments.map(d => `FILE: ${d.name}\nCONTENT: ${d.text}`).join('\n\n')}`
        : "";

      // Convert history to Gemini format
      const geminiHistory = history.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: `You are Honore's AI Assistant. ${HONORE_CONTEXT}\nCRITICAL: Respond exclusively in the user's language which is: ${window.HONORE_CURRENT_LANG || 'English'}. If the language is French, all your output must be French.\nPage Context: ${pageContext}${docContext}` }] },
          contents: geminiHistory
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackResponse(message);
        
        // Save to history
        chatState.chatHistory = [...history, { role: 'assistant', content: botResponse }].slice(-10);
        return botResponse;
      }
    } catch (e) { console.error('Gemini Error:', e); }
  }

  // TIER 3: Local Fallback (100% reliable)
  const fallback = getFallbackResponse(message);
  chatState.chatHistory = [...history, { role: 'assistant', content: fallback }].slice(-10);
  return fallback;
}

function initChat() {
  const widget = document.getElementById('ai-widget');
  const toggle = document.getElementById('ai-toggle');
  const closeBtn = document.getElementById('ai-close');
  const form = document.getElementById('ai-form');
  const input = document.getElementById('ai-input');

  if (!widget || !form || !input || !toggle) return;

  // Start collapsed; show greeting when the user opens the chat.
  let firstOpen = true;

  function openWidget() {
    widget.classList.add('open');
    widget.classList.remove('collapsed');
    toggle.setAttribute('aria-expanded', 'true');
    input.focus();

    if (firstOpen) {
      const lang = window.HONORE_CURRENT_LANG || 'en';
      const greet = HONORE_TRANSLATIONS[lang]["chat-greeting"] || "Hello!";
      appendChatMessageEnhanced(greet, 'bot');
      firstOpen = false;
    }
  }

  function closeWidget() {
    widget.classList.remove('open');
    widget.classList.add('collapsed');
    toggle.setAttribute('aria-expanded', 'false');
  }

  // Make toggle button use a small avatar when collapsed
  if (!toggle.querySelector('.ai-avatar-mini')) {
    const avatar = document.createElement('img');
    avatar.src = 'assets/images/WhatsApp%20Image%202026-05-29%20at%204.32.30%20PM.jpeg';
    avatar.alt = 'AI chat';
    avatar.className = 'ai-avatar-mini';
    avatar.role = 'button';
    avatar.tabIndex = 0;

    toggle.textContent = '';
    toggle.appendChild(avatar);
    toggle.classList.add('circular-toggle');

    // Make avatar independently clickable
    avatar.addEventListener('click', (e) => {
      e.stopPropagation();
      openWidget();
    });
  }

  // Keep widget collapsed on load; expand only when the user clicks.
  toggle.addEventListener('click', () => {
    if (widget.classList.contains('open')) {
      closeWidget();
    } else {
      openWidget();
    }
  });

  closeBtn?.addEventListener('click', closeWidget);

  // Make header profile image clickable to open chat
  const headerAvatar = document.querySelector('.ai-avatar');
  if (headerAvatar) {
    headerAvatar.style.cursor = 'pointer';
    headerAvatar.addEventListener('click', openWidget);
  }

  // Handle Enter to send (Shift+Enter for newline)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    appendChatMessageEnhanced(value, 'user');
    input.value = '';
    input.disabled = true;

    // Simple typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'ai-message-wrapper bot-wrapper typing-indicator-wrapper';
    typingIndicator.innerHTML = '<div class="ai-message-bubble bot typing"><span></span><span></span><span></span></div>';
    document.getElementById('ai-messages').appendChild(typingIndicator);
    document.getElementById('ai-messages').scrollTop = document.getElementById('ai-messages').scrollHeight;

    try {
      // Small artificial delay for realism
      await new Promise(resolve => setTimeout(resolve, 1000));
      typingIndicator.remove();

      const response = await getChatResponse(value);
      appendChatMessageEnhanced(response, 'bot');
} catch (error) {
      typingIndicator.remove();
      appendChatMessageEnhanced('Sorry, there was an error. Please try again.', 'bot');
    } finally {
      input.disabled = false;
      input.focus();
    }
  });

  const fileInput = document.getElementById('ai-file');
  const fileStatus = document.getElementById('ai-file-status');

  if (fileInput && fileStatus) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      fileStatus.textContent = `Analyzing ${file.name}... ⏳`;
      fileStatus.style.color = 'var(--accent-blue)';

      try {
        let extractedText = "";
        if (file.type === 'application/pdf') {
          extractedText = await extractTextFromPDF(file);
        } else if (file.type === 'text/plain') {
          extractedText = await file.text();
        } else {
          throw new Error('Unsupported file type. Please upload PDF or TXT.');
        }

        // Save to AI memory
        chatState.uploadedDocuments.push({
          name: file.name,
          text: extractedText,
          timestamp: new Date()
        });

        fileStatus.textContent = `✓ ${file.name} analyzed! You can now ask Honore questions about it.`;
        fileStatus.style.color = 'var(--green-medium)';

        // Auto-greet about the file
        appendChatMessageEnhanced(`I've scanned "${file.name}"! I've analyzed its content and am ready to discuss it with you. What would you like to know about it?`, 'bot');

  } catch (error) {
        console.error('File Analysis Error:', error);
        fileStatus.textContent = `❌ Error analyzing file: ${error.message}`;
        fileStatus.style.color = 'var(--brand-orange)';
      }
    });
  }

  // === Voice Input (Microphone Button) ===
  initVoiceInput(input);

  // === Tool Buttons (Fast / Gemini) ===
  const toolBtns = document.querySelectorAll('.prompt-tool-btn');
  toolBtns.forEach(btn => {
    if (btn.textContent.includes('Fast') || btn.textContent.includes('Gemini')) {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        if (btn.classList.contains('active')) {
          btn.style.color = 'var(--green-medium)';
          btn.style.background = 'rgba(16, 185, 129, 0.1)';
        } else {
          btn.style.color = '';
          btn.style.background = '';
        }
      });
    }
  });
}

// Voice recognition for the microphone button
function initVoiceInput(chatInput) {
  const micBtn = document.querySelector('.prompt-toolbar-right .prompt-tool-btn[title="Voice input"]');
  if (!micBtn) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    micBtn.addEventListener('click', () => {
      alert('Voice input is not supported in your browser. Please use Chrome or Edge.');
    });
    return;
  }

  let recognition = null;
  let isListening = false;

  micBtn.addEventListener('click', () => {
    if (isListening) {
      // Stop listening
      recognition.stop();
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = window.HONORE_CURRENT_LANG === 'fr' ? 'fr-FR' : 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      isListening = true;
      micBtn.style.color = '#ef4444';
      micBtn.style.animation = 'pulse 1s infinite';
      chatInput.placeholder = '🎤 Listening...';
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      chatInput.value = transcript;
    };

    recognition.onend = () => {
      isListening = false;
      micBtn.style.color = '';
      micBtn.style.animation = '';
      chatInput.placeholder = "Hi! I'm Honore's AI assistant. Ask me anything about my work.";

      // Auto-submit if we got text
      if (chatInput.value.trim()) {
        const form = document.getElementById('ai-form');
        if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    };

    recognition.onerror = (event) => {
      isListening = false;
      micBtn.style.color = '';
      micBtn.style.animation = '';
      chatInput.placeholder = "Hi! I'm Honore's AI assistant. Ask me anything about my work.";
      console.error('Speech recognition error:', event.error);
    };

    recognition.start();
  });
}

const quotes = [
  { text: "To transform Rwanda's education system by empowering teachers and learners with digital skills, innovative approaches, and modern technologies for the future.", author: "Tuyishime Honore (Vision Statement)" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "Technology will not replace great teachers, but technology in the hands of great teachers can be transformational.", author: "George Couros" },
  { text: "The future of education is not in the classroom; it is in the connections we build and the digital tools we harness.", author: "Tuyishime Honore" },
  { text: "When we teach computers to learn, we must also teach learners to think.", author: "Unknown" },
  { text: "Every student can learn, just not on the same day, or the same way.", author: "George Evans" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Learning is not a spectator sport.", author: "D. Blocher" },
  { text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin" },
  { text: "Digital learning is not about technology; it’s about empowering learners.", author: "Unknown" },
  { text: "Coding is today’s language of creativity.", author: "Unknown" },
  { text: "The important thing is not to stop questioning. Curiosity has its own reason for existing.", author: "Albert Einstein" },
  { text: "Teaching is the one profession that creates all other professions.", author: "Unknown" },
  { text: "You don’t have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The role of a teacher is to create the conditions for invention rather than provide ready-made knowledge.", author: "Seymour Papert" },
  { text: "Access to technology is not enough. It must be backed by good teaching.", author: "Unknown" },
  { text: "A child’s mind is not a vessel to be filled but a fire to be kindled.", author: "Dorothy Butler" },
  { text: "Learning is not a place; it is a process.", author: "G. K. Chesterton" },
  { text: "The function of education is to teach one to think intensively and to think critically.", author: "Martin Luther King Jr." },
  { text: "When learning becomes a habit, success becomes a tradition.", author: "Unknown" },
  { text: "Every problem is a gift—without problems we would not grow.", author: "Anthony Robbins" },
  { text: "Digital skills are the currency of the 21st century.", author: "Unknown" },
  { text: "Curiosity is the wick in the candle of learning.", author: "William Arthur Ward" },
  { text: "Great teachers empathize with children, respect them, and believe that each one has something special that can be built upon.", author: "Ann Lieberman" },
  { text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.", author: "Malcolm X" },
  { text: "Students don’t care how much you know until they know how much you care.", author: "John C. Maxwell" },
  { text: "Technology alone won’t fix education, but well-used technology can open doors.", author: "Unknown" },
  { text: "Learning is a treasure that will follow its owner everywhere.", author: "Chinese Proverb" },
  { text: "The greatest sign of success for a teacher is to be able to say, 'The children are now working as if I did not exist.'", author: "Maria Montessori" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "A teacher affects eternity; he can never tell where his influence stops.", author: "Henry Adams" },
  { text: "The more that you read, the more things you will know. The more that you learn, the more places you’ll go.", author: "Dr. Seuss" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "To teach is to learn twice.", author: "Joseph Joubert" },
  { text: "Good teaching is more a giving of right questions than a giving of right answers.", author: "Josef Albers" },
  { text: "Every child deserves a champion: an adult who will never give up on them.", author: "Rita Pierson" },
  { text: "Education is not preparation for life; education is life itself.", author: "John Dewey" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Innovation is the ability to see change as an opportunity, not a threat.", author: "Steve Jobs" },
  { text: "A great teacher takes a hand, opens a mind, and touches a heart.", author: "Unknown" },
  { text: "Programming today is a race between software engineers trying to build bigger and better idiot-proof programs, and the Universe trying to build bigger and better idiots.", author: "Rick Cook" },
  { text: "The most valuable resource that all teachers have is each other. Without collaboration our growth is limited to our own perspectives.", author: "Robert John Meehan" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The greatest learning happens outside the classroom when we apply what we know.", author: "Unknown" },
  { text: "Technology is best when it brings people together.", author: "Matt Mullenweg" },
  { text: "Learning is the only thing the mind never exhausts, never fears, and never regrets.", author: "Leonardo da Vinci" },
  { text: "The purpose of education is to replace an empty mind with an open one.", author: "Malcolm Forbes" },
  { text: "Excellence is not a destination; it is a continuous journey that never ends.", author: "Brian Tracy" },
  { text: "You don’t learn to walk by following rules. You learn by doing, and by falling over.", author: "Richard Branson" },
  { text: "If you can dream it, you can do it.", author: "Walt Disney" },
  { text: "Learning is a lifelong process, and the best teachers are the ones who keep learning.", author: "Unknown" },
  { text: "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God.", author: "Ephesians 2:8" },
  { text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", author: "John 3:16" },
  { text: "For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord.", author: "Romans 6:23" },
  { text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!", author: "2 Corinthians 5:17" },
  { text: "If you declare with your mouth, 'Jesus is Lord,' and believe in your heart that God raised him from the dead, you will be saved.", author: "Romans 10:9" },
  { text: "Salvation is found in no one else, for there is no other name under heaven given to mankind by which we must be saved.", author: "Acts 4:12" },
  { text: "For He rescued us from the domain of darkness, and transferred us to the kingdom of His beloved Son, in whom we have redemption, the forgiveness of sins.", author: "Colossians 1:13-14" },
  { text: "Jesus answered, 'I am the way and the truth and the life. No one comes to the Father except through me.'", author: "John 14:6" },
  { text: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.", author: "Romans 5:8" },
  { text: "But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.", author: "Acts 1:8" },
  { text: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.", author: "Matthew 28:19" }
];

// Dynamically intermix/shuffle the quotes so education and biblical verses exchange randomly each time!
quotes.sort(() => Math.random() - 0.5);

const quoteText = document.getElementById('rotator-text');
const quoteAuthor = document.getElementById('rotator-author');
const quoteCounter = document.getElementById('quote-counter');
const prevBtn = document.getElementById('quote-prev');
const nextBtn = document.getElementById('quote-next');

if (quoteText) renderQuote(0);

// ===== HERO QUOTE ROTATOR (Home Page) =====

function initHeroQuotes() {
  const heroContainer = document.getElementById('hero-quote-container');
  const heroText = document.getElementById('hero-quote-text');
  const heroAuthor = document.getElementById('hero-quote-author');

  if (!heroContainer || !heroText || !heroAuthor) return;

  let currentHeroIdx = 0;

  function updateHeroQuote() {
    // Fade out
    heroContainer.classList.remove('fade-in');

    setTimeout(() => {
      const q = quotes[currentHeroIdx];
      heroText.textContent = `“${q.text}”`;
      heroAuthor.textContent = `— ${q.author}`;

      // Fade in
      heroContainer.classList.add('fade-in');

      // Prep next
      currentHeroIdx = (currentHeroIdx + 1) % quotes.length;
    }, 800); // Wait for fade-out to finish
  }

  // Initial update
  updateHeroQuote();

  // Auto-rotate every 6 seconds
  setInterval(updateHeroQuote, 6000);
}

// ===== ACCESSIBILITY FEATURES =====

// Initialize accessibility features
function initAccessibilityFeatures() {
  createAccessibilityPanel();
  loadAccessibilitySettings();
  addVisualIndicators();
}

// Create the accessibility control panel
function createAccessibilityPanel() {
  // Create the accessibility button
  const accessBtn = document.createElement('button');
  accessBtn.id = 'accessibility-toggle';
  accessBtn.className = 'accessibility-toggle';
  accessBtn.innerHTML = '♿';
  accessBtn.setAttribute('aria-label', 'Open accessibility settings');
  accessBtn.title = 'Accessibility Settings';

  // Create the accessibility panel
  const panel = document.createElement('div');
  panel.id = 'accessibility-panel';
  panel.className = 'accessibility-panel';
  panel.innerHTML = `
    <div class="accessibility-header">
      <h3>Accessibility Settings</h3>
      <button class="accessibility-close" aria-label="Close accessibility panel">×</button>
    </div>
    <div class="accessibility-content">
      <div class="accessibility-section">
        <h4>Font Size</h4>
        <div class="font-controls">
          <button class="font-btn" id="font-decrease" aria-label="Decrease font size">A-</button>
          <span class="font-display" id="font-display">100%</span>
          <button class="font-btn" id="font-increase" aria-label="Increase font size">A+</button>
        </div>
      </div>
      <div class="accessibility-section">
        <h4>Font Type</h4>
        <select id="font-family-selector" class="font-family-selector" aria-label="Select font family">
          <optgroup label="Serif">
            <option value="Georgia, 'Times New Roman', Times, serif" selected>Georgia (default)</option>
            <option value="'Rockwell', 'Roboto Slab', serif">Slab Serif</option>
            <option value="Garamond, 'Georgia', serif">Garamond</option>
            <option value="'Times New Roman', Times, serif">Times New Roman</option>
            <option value="'Merriweather', serif">Merriweather</option>
            <option value="'Playfair Display', serif">Playfair Display</option>
            <option value="'PT Serif', serif">PT Serif</option>
            <option value="'Roboto Slab', serif">Roboto Slab</option>
            <option value="'Cinzel', serif">Cinzel</option>
            <option value="'Abril Fatface', serif">Abril Fatface</option>
            <option value="'Old Style Serif', serif">Old Style Serif</option>
          </optgroup>
          <optgroup label="Sans-Serif">
            <option value="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">System Sans-Serif</option>
            <option value="Arial, Helvetica, sans-serif">Arial</option>
            <option value="Helvetica, Arial, sans-serif">Helvetica</option>
            <option value="Verdana, Geneva, sans-serif">Verdana</option>
            <option value="Tahoma, Geneva, Verdana, sans-serif">Tahoma</option>
            <option value="'Open Sans', sans-serif">Open Sans</option>
            <option value="'Poppins', sans-serif">Poppins</option>
            <option value="'Montserrat', sans-serif">Montserrat</option>
            <option value="'Lato', sans-serif">Lato</option>
            <option value="'Nunito', sans-serif">Nunito</option>
            <option value="'Ubuntu', sans-serif">Ubuntu</option>
            <option value="'Raleway', sans-serif">Raleway</option>
            <option value="'Oswald', sans-serif">Oswald</option>
            <option value="'Quicksand', sans-serif">Quicksand</option>
            <option value="'Cabin', sans-serif">Cabin</option>
            <option value="'Source Sans Pro', sans-serif">Source Sans Pro</option>
            <option value="'PT Sans', sans-serif">PT Sans</option>
            <option value="'Gill Sans', sans-serif">Gill Sans</option>
            <option value="'Futura', sans-serif">Futura</option>
            <option value="'Arial Black', sans-serif">Arial Black</option>
            <option value="'Impact', sans-serif">Impact</option>
          </optgroup>
          <optgroup label="Monospace">
            <option value="'Courier New', Courier, monospace">Courier New</option>
            <option value="Consolas, 'Courier New', monospace">Consolas</option>
            <option value="Monaco, 'Courier New', monospace">Monaco</option>
            <option value="'Source Code Pro', monospace">Source Code Pro</option>
          </optgroup>
          <optgroup label="Script / Handwritten / Display">
            <option value="'Dancing Script', cursive">Dancing Script</option>
            <option value="'Pacifico', cursive">Pacifico</option>
            <option value="'Brush Script MT', cursive">Brush Script</option>
            <option value="'Lobster', cursive">Lobster</option>
            <option value="'Bebas Neue', sans-serif">Bebas Neue</option>
            <option value="'Anton', sans-serif">Anton</option>
            <option value="'Roboto', sans-serif">Roboto</option>
          </optgroup>
          <optgroup label="Other / Decorative">
            <option value="'Rockwell', serif">Rockwell (Slab Serif)</option>
            <option value="'Playfair Display', serif">Playfair Display</option>
            <option value="'Abril Fatface', serif">Abril Fatface</option>
            <option value="'Georgia', serif">Slab Serif</option>
          </optgroup>
        </select>
      </div>
            <div class="accessibility-section">
        <h4>Visual Aids</h4>
        <label class="toggle-label">
          <input type="checkbox" id="visual-indicators-toggle">
          <span class="toggle-slider"></span>
          Show visual cues for audio/video
        </label>
      </div>
      <div class="accessibility-section">
        <h4>Screen Reader</h4>
        <label class="toggle-label">
          <input type="checkbox" id="screen-reader-toggle">
          <span class="toggle-slider"></span>
          Enable Text-to-Speech
        </label>
      </div>
      <div class="accessibility-section">
        <h4>Display</h4>
        <label class="toggle-label">
          <input type="checkbox" id="high-contrast-toggle">
          <span class="toggle-slider"></span>
          High contrast mode
        </label>
      </div>
    </div>
  `;

  // Add to page
  const navLinksContainer = document.querySelector('.nav-links');
  if (navLinksContainer) {
    navLinksContainer.appendChild(accessBtn);
  } else {
    document.body.appendChild(accessBtn);
  }
  document.body.appendChild(panel);

  // Add event listeners
  accessBtn.addEventListener('click', toggleAccessibilityPanel);
  panel.querySelector('.accessibility-close').addEventListener('click', toggleAccessibilityPanel);

  // Font size controls
  document.getElementById('font-decrease').addEventListener('click', () => adjustFontSize(-10));
  document.getElementById('font-increase').addEventListener('click', () => adjustFontSize(10));

  // Font family control
  const fontSelector = document.getElementById('font-family-selector');
  if (fontSelector) {
    fontSelector.addEventListener('change', () => {
      setFontFamily(fontSelector.value);
      saveAccessibilitySettings();
    });
  }

  // Toggle controls
  document.getElementById('visual-indicators-toggle').addEventListener('change', toggleVisualIndicators);
  document.getElementById('high-contrast-toggle').addEventListener('change', toggleHighContrast);
}

// Toggle the accessibility panel
function toggleAccessibilityPanel() {
  const panel = document.getElementById('accessibility-panel');
  if (panel) {
    panel.classList.toggle('open');
  }
}

// Adjust font size
function adjustFontSize(delta) {
  const root = document.documentElement;
  const currentSize = parseFloat(getComputedStyle(root).getPropertyValue('--font-scale') || '1');
  let newSize = currentSize + (delta / 100);

  // Clamp between 0.75 and 1.5
  newSize = Math.max(0.75, Math.min(1.5, newSize));

  root.style.setProperty('--font-scale', newSize.toString());
  updateFontDisplay(newSize);
  saveAccessibilitySettings();
}

// Update font size display
function updateFontDisplay(scale) {
  const display = document.getElementById('font-display');
  if (display) {
    display.textContent = Math.round(scale * 100) + '%';
  }
}

// Set font family
function setFontFamily(fontValue) {
  document.documentElement.style.setProperty('--font', fontValue);
  const fontSelector = document.getElementById('font-family-selector');
  if (fontSelector) {
    fontSelector.value = fontValue;
  }
}

function toggleVisualIndicators() {

  const toggle = document.getElementById('visual-indicators-toggle');
  if (toggle) {
    const enabled = toggle.checked;
    if (enabled) {
      addVisualIndicators();
    } else {
      removeVisualIndicators();
    }
    saveAccessibilitySettings();
  }
}

// Toggle high contrast mode
function toggleHighContrast() {
  const toggle = document.getElementById('high-contrast-toggle');
  if (toggle) {
    const enabled = toggle.checked;
    document.body.classList.toggle('high-contrast', enabled);
    saveAccessibilitySettings();
  }
}

// Add visual indicators to multimedia elements
function addVisualIndicators() {
  // Remove existing indicators first
  removeVisualIndicators();

  // Add indicators to videos
  const videos = document.querySelectorAll('iframe[src*="youtube.com"], video');
  videos.forEach(video => {
    if (!video.nextElementSibling?.classList.contains('visual-indicator')) {
      const indicator = document.createElement('div');
      indicator.className = 'visual-indicator';
      indicator.textContent = '🎬 View Original on YouTube';
      indicator.setAttribute('aria-label', 'This content contains audio or video');
      video.parentNode.insertBefore(indicator, video.nextSibling);
    }
  });

  // Add indicators to audio elements
  const audios = document.querySelectorAll('audio');
  audios.forEach(audio => {
    if (!audio.nextElementSibling?.classList.contains('visual-indicator')) {
      const indicator = document.createElement('div');
      indicator.className = 'visual-indicator';
      indicator.textContent = '🎵 Audio Content';
      indicator.setAttribute('aria-label', 'This content contains audio');
      audio.parentNode.insertBefore(indicator, audio.nextSibling);
    }
  });
}

// Remove visual indicators
function removeVisualIndicators() {
  const indicators = document.querySelectorAll('.visual-indicator');
  indicators.forEach(indicator => indicator.remove());
}

// Save accessibility settings to localStorage
function saveAccessibilitySettings() {
  const settings = {
    fontScale: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale') || '1'),
    fontFamily: document.documentElement.style.getPropertyValue('--font') || getComputedStyle(document.documentElement).getPropertyValue('--font'),
    visualIndicators: document.getElementById('visual-indicators-toggle')?.checked || false,
    highContrast: document.body.classList.contains('high-contrast')
  };

  localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
}

// Load accessibility settings from localStorage
function loadAccessibilitySettings() {
  const settings = localStorage.getItem('accessibilitySettings');
  if (!settings) return;

  try {
    const parsed = JSON.parse(settings);

    // Apply font scale
    if (parsed.fontScale) {
      document.documentElement.style.setProperty('--font-scale', parsed.fontScale.toString());
      updateFontDisplay(parsed.fontScale);
    }

    // Apply font family
    if (parsed.fontFamily) {
      setFontFamily(parsed.fontFamily);
      const selector = document.getElementById('font-family-selector');
      if (selector) selector.value = parsed.fontFamily;
    }

    // Apply visual indicators
    if (parsed.visualIndicators) {
      const toggle = document.getElementById('visual-indicators-toggle');
      if (toggle) {
        toggle.checked = true;
        addVisualIndicators();
      }
    }

    // Apply high contrast
    if (parsed.highContrast) {
      document.body.classList.add('high-contrast');
      const toggle = document.getElementById('high-contrast-toggle');
      if (toggle) toggle.checked = true;
    }
    // Apply screen reader
    if (parsed.screenReader) {
      const toggle = document.getElementById('screen-reader-toggle');
      if (toggle) {
        toggle.checked = true;
        toggleScreenReader();
      }
    }
  } catch (error) {
    console.warn('Error loading accessibility settings:', error);
  }
}

// ===== SUPABASE CONTACT FORM HANDLING =====

function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  const contactStatus = document.getElementById('contact-status');

  if (!contactForm || !contactStatus) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      created_at: new Date().toISOString()
    };

    // UI Feedback: Loading
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    const currentLang = window.HONORE_CURRENT_LANG || 'en';
    const t = HONORE_TRANSLATIONS[currentLang];

    submitBtn.disabled = true;
    submitBtn.textContent = currentLang === 'fr' ? 'Envoi...' : 'Sending...';
    contactStatus.textContent = '';
    contactStatus.style.color = 'var(--cyan)';

    try {
      // Use the global supabase client from supabaseClient.js
      const { error } = await supabase
        .from('contacts')
        .insert([data]);

      if (error) throw error;

      // Success
      contactStatus.textContent = t["msg-success"] || 'Message sent successfully!';
      contactStatus.style.color = 'var(--green-dark)';
      contactForm.reset();
    } catch (error) {
      console.error('Supabase error:', error);
      contactStatus.textContent = t["msg-error"] || 'Error sending message.';
      contactStatus.style.color = '#ff4b2b'; 
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;

      // Clear status after 5 seconds
      setTimeout(() => {
        contactStatus.textContent = '';
      }, 5000);
    }
  });
}
function initPreview() {
  const modal = document.getElementById('cv-modal');
  const iframe = document.getElementById('modal-iframe');
  const modalTitle = document.getElementById('modal-title');
  const closeBtn = document.getElementById('modal-close');
  const previewButtons = document.querySelectorAll('.preview-btn');

  if (!modal || !iframe || !modalTitle) return;

  function openModal(filePath, titleText) { console.log('Opening:', filePath);
    iframe.src = filePath;
    modalTitle.textContent = titleText;
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
      iframe.src = '';
    }, 300);
    document.body.style.overflow = '';
  }

  previewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filePath = btn.getAttribute('data-file');
      const docTitle = btn.getAttribute('data-title') || 'Document Preview';
      openModal(filePath, docTitle);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });
}
// ===== SCREEN READER LOGIC =====
let screenReaderEnabled = false;
let screenReaderObserver = null;
let availableVoices = [];

// Pre-load voices for the male voice
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    availableVoices = window.speechSynthesis.getVoices();
  };
  // Fallback in case they are already loaded
  availableVoices = window.speechSynthesis.getVoices();
}

function setVoiceByLang(msg) {
  const lang = window.HONORE_CURRENT_LANG || 'en';
  if (availableVoices.length === 0) availableVoices = window.speechSynthesis.getVoices();
  
  let voice;
  if (lang === 'fr') {
    // Find a French voice (Thomas, Paul, etc)
    voice = availableVoices.find(v => v.lang.startsWith('fr'));
    msg.lang = 'fr-FR';
  } else {
    // Find a male English voice
    voice = availableVoices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('male') || 
       v.name.toLowerCase().includes('david') || 
       v.name.toLowerCase().includes('mark') || 
       v.name.toLowerCase().includes('guy') || 
       v.name.toLowerCase().includes('daniel') || 
       v.name.toLowerCase().includes('matthew'))
    );
    msg.lang = 'en-US';
  }
  
  if (voice) {
    msg.voice = voice;
  }
}

function toggleScreenReader() {
  const toggle = document.getElementById('screen-reader-toggle');
  screenReaderEnabled = toggle ? toggle.checked : false;
  
    if (screenReaderEnabled) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const lang = window.HONORE_CURRENT_LANG || 'en';
      const welcomeMsg = lang === 'fr' 
        ? 'Lecteur d\'écran activé. Je lirai le contenu au fur et à mesure que vous faites défiler ou survolez.'
        : 'Screen reader enabled. I will read content as you scroll or hover.';
      
      const msg = new SpeechSynthesisUtterance(welcomeMsg);
      setVoiceByLang(msg);
      window.speechSynthesis.speak(msg);
      
      document.body.addEventListener('mouseover', screenReaderHoverHandler);
      document.body.addEventListener('mouseout', screenReaderOutHandler);
      document.addEventListener('click', stopReadingGlobal);
      setupScrollReader();
    } else {
      alert("Text-to-speech is not supported by your browser.");
      if (toggle) toggle.checked = false;
      screenReaderEnabled = false;
    }
  } else {
    document.body.removeEventListener('mouseover', screenReaderHoverHandler);
    document.body.removeEventListener('mouseout', screenReaderOutHandler);
    document.removeEventListener('click', stopReadingGlobal);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (screenReaderObserver) screenReaderObserver.disconnect();
    document.querySelectorAll('.reading-focus').forEach(el => el.classList.remove('reading-focus'));
  }
  
  saveAccessibilitySettings();
}

function stopReadingGlobal() {
  if (screenReaderEnabled && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    document.querySelectorAll('.reading-focus').forEach(el => el.classList.remove('reading-focus'));
  }
}

function setupScrollReader() {
  if (screenReaderObserver) screenReaderObserver.disconnect();
  
  screenReaderObserver = new IntersectionObserver((entries) => {
    if (!screenReaderEnabled) return;
    
    entries.forEach(entry => {
       // Read when element is somewhat visible (threshold 0.5)
       if (entry.isIntersecting && entry.target.innerText && entry.target.innerText.trim().length > 0) {
          // Speak the text
          const msg = new SpeechSynthesisUtterance(entry.target.innerText.trim());
          setVoiceByLang(msg);
          
          msg.onstart = () => { entry.target.classList.add('reading-focus'); };
          msg.onend = () => { entry.target.classList.remove('reading-focus'); };
          msg.onerror = () => { entry.target.classList.remove('reading-focus'); };
          
          window.speechSynthesis.speak(msg);
          
          // Unobserve to prevent repeat on same element, 
          // allowing smooth "continue scrolling" experience
          screenReaderObserver.unobserve(entry.target);
       }
    });
  }, { threshold: 0.5, rootMargin: '0px 0px -10% 0px' });
  
  // Observe all content blocks for a continuous experience
  document.querySelectorAll('h1, h2, h3, h4, p, .card, ul li').forEach(el => {
     screenReaderObserver.observe(el);
  });
}

function screenReaderHoverHandler(e) {
  if (!screenReaderEnabled) return;
  const target = e.target.closest('p, h1, h2, h3, h4, h5, h6, li, button, .card');
  if (!target) return;
  
  if (target.innerText && target.innerText.trim().length > 0) {
    // Only read if it's not already being read
    if (target.classList.contains('reading-focus')) return;

    window.speechSynthesis.cancel();
    document.querySelectorAll('.reading-focus').forEach(el => el.classList.remove('reading-focus'));

    const msg = new SpeechSynthesisUtterance(target.innerText.trim());
    setVoiceByLang(msg);
    
    msg.onstart = () => { target.classList.add('reading-focus'); };
    msg.onend = () => { target.classList.remove('reading-focus'); };
    
    window.speechSynthesis.speak(msg);
    if (screenReaderObserver) screenReaderObserver.unobserve(target);
  }
}

function screenReaderOutHandler(e) {
  // We keep the focus until the speech ends, handled by onend
}


function initNavScroll() { const nav = document.querySelector('.nav'); if (!nav) return; const handleScroll = () => { if (window.scrollY > 50) nav.classList.add('scrolled'); else nav.classList.remove('scrolled'); }; window.addEventListener('scroll', handleScroll); handleScroll(); }

function initAccessibilityFeatures() {
  const accBtn = document.getElementById('acc-btn');
  const accDropdown = document.getElementById('acc-dropdown');
  const toggle = document.getElementById('screen-reader-toggle');
  
  // Font controls
  const fontPlus = document.getElementById('font-plus');
  const fontMinus = document.getElementById('font-minus');
  const fontDisplay = document.getElementById('font-display');
  let currentFontSize = parseInt(localStorage.getItem('honore-font-size')) || 100;

  // Language controls
  const langBtns = document.querySelectorAll('.lang-btn');

  if (accBtn && accDropdown) {
    accBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      accDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!accDropdown.contains(e.target)) {
        accDropdown.classList.remove('active');
      }
    });
  }

  // Handle Font Changes
  if (fontPlus && fontMinus && fontDisplay) {
    const updateFontSize = (newSize) => {
      currentFontSize = Math.min(Math.max(newSize, 80), 130);
      document.documentElement.style.fontSize = `${(currentFontSize / 100) * 14}px`; // Base is 14px
      fontDisplay.textContent = `${currentFontSize}%`;
      localStorage.setItem('honore-font-size', currentFontSize);
    };

    updateFontSize(currentFontSize); // Apply initial

    fontPlus.addEventListener('click', () => updateFontSize(currentFontSize + 10));
    fontMinus.addEventListener('click', () => updateFontSize(currentFontSize - 10));
  }

  // Handle Language Clicks
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.getAttribute('data-lang');
      localStorage.setItem('honore-lang', lang);
      applyTranslations(lang);
    });
  });

  // Dynamic Font Loader logic
  const loadGoogleFont = (fontName) => {
    const fontId = `font-link-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
      document.head.appendChild(link);
    }
  };

  const fontTypeSelector = document.getElementById('font-type-selector');
  if (fontTypeSelector) {
    const applyFont = (fontName) => {
      // Handle standard system fonts specially
      const systemFonts = ['Serif', 'Sans-Serif', 'Monospace'];
      if (!systemFonts.includes(fontName)) {
        loadGoogleFont(fontName);
      }
      
      // Clear existing font family style on body
      document.body.style.fontFamily = fontName === 'System Default' ? '' : `'${fontName}', sans-serif`;
      
      // Specifically handle serif/mono if requested
      if (fontName.toLowerCase().includes('serif') && !fontName.includes('Sans')) {
         document.body.style.fontFamily = `'${fontName}', serif`;
      } else if (fontName.toLowerCase().includes('mono')) {
         document.body.style.fontFamily = `'${fontName}', monospace`;
      }
      
      localStorage.setItem('honore-font-type', fontName);
    };

    fontTypeSelector.addEventListener('change', (e) => {
      applyFont(e.target.value);
    });

    const savedFont = localStorage.getItem('honore-font-type') || 'Outfit';
    fontTypeSelector.value = savedFont;
    applyFont(savedFont);
  }

  const savedLang = localStorage.getItem('honore-lang') || 'en';
  applyTranslations(savedLang);
  langBtns.forEach(btn => {
    if (btn.getAttribute('data-lang') === savedLang) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  if (toggle) {
    loadAccessibilitySettings();
    toggle.addEventListener('change', toggleScreenReader);
  }
}

const HONORE_TRANSLATIONS = {
  en: {
    "nav-home": "Home",
    "nav-about": "About",
    "nav-roles": "Roles",
    "nav-dev": "Development",
    "nav-edu": "Education",
    "nav-proj": "Projects",
    "nav-cv": "CV",
    "nav-min": "Ministry",
    "acc-language": "Language / Langue",
    "acc-font-size": "Font Size",
    "acc-font-type": "Font Type",
    "acc-reader": "Screen Reader",
    "acc-enable-tts": "Enable Text-to-Speech",
    "chat-greeting": "Hi! I'm Honore's AI assistant. Ask me anything about my work.",
    "chat-placeholder": "Ask me anything about Honore...",
    "hero-title": "Tuyishime Honore",
    "hero-subtitle": "Academic Registrar | Software Developer | Educator",
    "contact-btn": "Get in Touch",
    "about-title": "About Me",
    "services-title": "My Services",
    "service-reg": "Academic Registration",
    "service-dev": "Full-Stack Development",
    "service-edu": "ICT Training",
    "prof-title": "Who is Tuyishime Honore?",
    "prof-desc": "Honore is a dedicated developer, teacher, and ICT professional committed to educational excellence.",
    "skills-title": "Professional Skills",
    "footer-brand": "Educator • Innovator • Leader",
    "footer-links": "Quick Links",
    "footer-roles": "Professional Roles",
    "footer-contact": "Get In Touch",
    "form-name": "Your Name",
    "form-email": "Your Email",
    "form-msg": "Your Message",
    "form-send": "Send Message",
    "msg-success": "Message sent successfully!",
    "msg-error": "Something went wrong. Please try again.",
    "cv-fact-name": "Full Name",
    "cv-fact-role": "Current Role",
    "cv-fact-path": "Academic Path",
    "cv-fact-loc": "Location",
    "cv-hub-title": "Interactive Document Center",
    "cv-cv-desc": "My full, up-to-date professional CV detailing work experience, academic history, skills, languages, publications, and references.",
    "btn-view": "View CV",
    "btn-download": "Download",
    "proj-subtitle": "Innovative web applications and digital platforms developed to revolutionize educational planning and student engagement.",
    "proj-dlp-title": "Digital Lesson Plan",
    "proj-dlp-desc": "A sophisticated lesson-planning web application designed to empower teachers with efficient building, organization, and sharing tools for standards-aligned curricula.",
    "proj-hub-title": "ICT Education Hub",
    "proj-hub-desc": "An influential YouTube channel dedicated to pedagogical digital transformation. Features expert tutorials and tutorials for seamless technology integration in modern classrooms.",
    "proj-marks-title": "Marks Management System",
    "proj-marks-desc": "A web application that helps teachers generate report cards and other related reports after assessments.",
    "btn-launch": "Launch Application",
    "btn-explore": "Explore Channel",
    "about-subtitle": "Dedicated to transforming education in Rwanda through innovative technology integration, empowering both teachers and students with the digital skills needed for a brighter future.",
    "about-card-bg": "Background",
    "about-card-edu": "Education & Growth",
    "about-card-train": "Training & Impact",
    "about-card-tech": "Technical Expertise",
    "about-card-lang": "Languages",
    "about-card-contact": "Personal & Contact",
    "about-card-hobbies": "Hobbies & Interests"
  },
  fr: {
    "nav-home": "Accueil",
    "nav-about": "À Propos",
    "nav-roles": "Rôles",
    "nav-dev": "Développement",
    "nav-edu": "Éducation",
    "nav-proj": "Projets",
    "nav-cv": "CV",
    "nav-min": "Ministère",
    "acc-language": "Langue / Language",
    "acc-font-size": "Taille de police",
    "acc-font-type": "Type de police",
    "acc-reader": "Lecteur d'écran",
    "acc-enable-tts": "Activer la synthèse vocale",
    "chat-greeting": "Bonjour ! Je suis l'assistant IA d'Honore. Posez-moi des questions sur mon travail.",
    "chat-placeholder": "Posez-moi des questions sur Honore...",
    "hero-title": "Tuyishime Honore",
    "hero-subtitle": "Registraire Académique | Développeur Logiciel | Éducateur",
    "contact-btn": "Contactez-moi",
    "about-title": "À Propos de Moi",
    "services-title": "Mes Services",
    "service-reg": "Gestion Académique",
    "service-dev": "Développement Full-Stack",
    "service-edu": "Formation en TIC",
    "prof-title": "Qui est Tuyishime Honore ?",
    "prof-desc": "Honore est un développeur, enseignant et professionnel des TIC dévoué, engagé envers l'excellence éducative.",
    "skills-title": "Compétences Professionnelles",
    "footer-brand": "Éducateur • Innovateur • Leader",
    "footer-links": "Liens Rapides",
    "footer-roles": "Rôles Professionnels",
    "footer-contact": "Contactez-moi",
    "form-name": "Votre Nom",
    "form-email": "Votre Email",
    "form-msg": "Votre Message",
    "form-send": "Envoyer le Message",
    "msg-success": "Message envoyé avec succès !",
    "msg-error": "Une erreur est survenue. Veuillez réessayer.",
    "cv-fact-name": "Nom Complet",
    "cv-fact-role": "Rôle Actuel",
    "cv-fact-path": "Parcours Académique",
    "cv-fact-loc": "Emplacement",
    "cv-hub-title": "Centre de Documents Interactif",
    "cv-cv-desc": "Mon CV professionnel complet et à jour détaillant l'expérience de travail, le parcours académique, les compétences, les langues, les publications et les références.",
    "btn-view": "Voir le CV",
    "btn-download": "Télécharger",
    "proj-subtitle": "Applications web innovantes et plateformes numériques développées pour révolutionner la planification pédagogique et l'engagement des étudiants.",
    "proj-dlp-title": "Plan de Leçon Numérique",
    "proj-dlp-desc": "Une application web de planification de leçons sophistiquée conçue pour autonomiser les enseignants avec des outils de construction, d'organisation et de partage efficaces pour des programmes alignés sur les normes.",
    "proj-hub-title": "Hub d'Éducation TIC",
    "proj-hub-desc": "Une chaîne YouTube influente dédiée à la transformation numérique pédagogique. Propose des tutoriels d'experts pour une intégration technologique transparente dans les classes modernes.",
    "proj-marks-title": "Système de Gestion des Notes",
    "proj-marks-desc": "Une application web qui aide les enseignants à générer des bulletins scolaires et d'autres rapports connexes après les évaluations.",
    "btn-launch": "Lancer l'Application",
    "btn-explore": "Explorer la Chaîne",
    "about-subtitle": "Dédié à la transformation de l'éducation au Rwanda grâce à l'intégration de technologies innovantes, autonomisant les enseignants et les étudiants avec les compétences numériques nécessaires pour un avenir meilleur.",
    "about-card-bg": "Parcours",
    "about-card-edu": "Éducation et Croissance",
    "about-card-train": "Formation et Impact",
    "about-card-tech": "Expertise Technique",
    "about-card-lang": "Langues",
    "about-card-contact": "Personnel et Contact",
    "about-card-hobbies": "Loisirs et Intérêts"
  }
};

function applyTranslations(lang) {
  const elements = document.querySelectorAll("[data-i18n]");
  const t = HONORE_TRANSLATIONS[lang];
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (HONORE_TRANSLATIONS[lang] && HONORE_TRANSLATIONS[lang][key]) {
      // Handle normal text
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = HONORE_TRANSLATIONS[lang][key];
      } else {
        el.textContent = t[key];
      }
    }
  });

  // Update specific UI components if they don't have data-i18n yet
  const chatInput = document.querySelector('.chat-input textarea');
  if (chatInput) chatInput.placeholder = t['chat-greeting'];
}

