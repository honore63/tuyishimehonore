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

  // Initialize accessibility features
  initAccessibilityFeatures();

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
        if (btn.action.startsWith('http') || btn.action.endsWith('.pdf')) {
          window.open(btn.action, '_blank');
        } else if (btn.action.startsWith('/')) {
            window.location.href = btn.action;
        } else {
          console.log('Action:', btn.action);
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
  const elements = document.querySelectorAll('h1, h2, h3, p, li, .card h3');
  let content = "Current Page Content:\n";
  elements.forEach(el => {
    if (el.textContent.length > 10) {
      content += `- ${el.textContent.trim()}\n`;
    }
  });
  return content;
}

function getFallbackResponse(message) {
  const lower = message.trim().toLowerCase();

  // Dynamic Agent Reasoning Simulation
  const reasoningSteps = [
    "🔍 Scanning current page for context...",
    "📂 Accessing Honore's profile database...",
    "📂 Checking document repository for related files...",
    "🧠 Processing request via local agent logic...",
    "✨ Formulating specialized response..."
  ];

  // Specific Knowledge Extraction (Simulating Agent Capability)
  const pageContext = scanPageContent();
  const docs = chatState.uploadedDocuments.length > 0 ? `(Agent: Referenced ${chatState.uploadedDocuments.join(", ")})` : "";

  const patterns = [
    {
      test: /\b(hi|hello|hey|greetings|who are you|introduce|who is honore)\b/i,
      reply: `Hello! I'm Honore Tuyishime, a professional educator and ICT trainer dedicated to transforming education in Rwanda. How can I assist you today? ((BUTTON:About Honore:about.html)) ((BUTTON:View Projects:projects.html))`
    },
    {
      test: /\b(education|study|studied|school|university|academic|background|learn)\b/i,
      reply: `Honore has a strong academic background in STEM and Computer Science, currently studying at ULK. You can view his full timeline and download certificates on the Education page. ((BUTTON:View Education:education.html)) ((BUTTON:A2 Diploma:Certicifacates/260110_RECRUITMENT_2311140955_26_001.pdf))`
    },
    {
      test: /\b(cv|resume|background|experience|qualification|work history)\b/i,
      reply: `He currently teaches at Rukara Model School and trains teachers at PISQUARE. You can view his interactive CV, certificates, and academic documents directly on the CV page, or download it: ((BUTTON:View CV Page:cv.html)) ((BUTTON:Download CV:Document/Honore curriculum vitae.pdf)) ((BUTTON:View Experience:roles.html))`
    },
    {
      test: /\b(certificat|diploma|credential|training|qualification)\b/i,
      reply: `Honore holds several prestigious credentials, including his A2 Diploma, PTRP Certificate, and IBM AI Literacy. You can view or download them on the CV page: ((BUTTON:View CV Page:cv.html)) ((BUTTON:A2 Diploma:Document/A2 TTC _SME_CERTIFICATE .pdf)) ((BUTTON:PTRP Cert:Document/PTR P Certificate .pdf)) ((BUTTON:MCE Cert:Certicifacates/240102_RECRUITMENT_2311140955_26_001.pdf))`
    },
    {
      test: /\b(contact|email|phone|reach|connect)\b/i,
      reply: `You can reach Honore at +250 791 684 429 or tuyishimehonore63@gmail.com. Feel free to use the contact page as well! ((BUTTON:Contact Page:contact.html))`
    },
    {
      test: /\b(ministry|church|god|scripture|verse|discipleship)\b/i,
      reply: `Honore's life is grounded in Matthew 28:19 and Acts 1:8, focusing on discipleship and community transformation. ((BUTTON:Ministry Work:ministry.html))`
    },
    {
      test: /\b(project|developer|tech|coding|web|app)\b/i,
      reply: `Explore his pedagogical apps like the Digital Lesson Plan and his ICT Education Hub. ((BUTTON:View Projects:projects.html))`
    },
    {
      test: /\b(thank you|thanks|amazing|awesome|wow|helpful)\b/i,
      reply: `You are very welcome! It's an honor to assist you. Is there anything else you'd like to explore in Honore's portfolio?`
    }
  ];

  for (const entry of patterns) {
    if (entry.test.test(lower)) {
      return `---THINKING---\n${reasoningSteps.join("\n")}\n---END THINKING---\n${entry.reply}`;
    }
  }

  return `---THINKING---\n${reasoningSteps.join("\n")}\n---END THINKING---I've analyzed your request against Honore's portfolio database. I couldn't find a specific match, but I can tell you about his projects, CV, education, or contact details. What would you like to see? ((BUTTON:View CV Page:cv.html)) ((BUTTON:View Projects:projects.html)) ((BUTTON:Download CV:../docs/Document/Honore curriculum vitae.pdf))`;
}

// HONORE'S COMPLETE BACKGROUND CONTEXT (POWERFUL VERSION)
const HONORE_CONTEXT = `
You are the official AI assistant of Tuyishime Honore's portfolio website.
You represent Tuyishime Honore — a professional educator, ICT trainer, and education technology innovator in Rwanda.
Your job is to assist visitors by answering questions, explaining projects, guiding navigation, and analyzing documents available on the platform.

👤 IDENTITY & PERSONALITY
- Speak professionally, clearly, and confidently.
- Be friendly and helpful, not robotic.
- Represent Honore’s expertise in:
  * Education
  * ICT Integration
  * STEM teaching
  * AI in education
  * Christian ministry (when relevant)

📚 KNOWLEDGE BASE
PROFILE:
- Name: Tuyishime Honore
- Role: Teacher, ICT Trainer, Education Technology Advocate
- Workplace: Rukara Model School of Sciences and Mathematics
- ICT Trainer: PISQUARE (supported by Edify)
- Student: ULK (Computer Science & Physics Education)

MISSION:
- Transform education in Rwanda using technology.

EXPERIENCE:
- Teaching 200+ STEM students.
- Training 100+ teachers in ICT.
- Leading CPD programs.
- Managing digital learning systems.

EDUCATION:
- Primary: GS Kagitumba (2011–2016)
- O-Level: GS Kagitumba (2017–2019)
- A2 SME: TTC Matimba (2020–2023)
- PTRP: TTC De La Salle (2023–2024)
- Degree: ULK (2024–Present)

SKILLS:
- Web: HTML, CSS, JS, PHP, Laravel
- Tools: Google Classroom, MS Teams, Kahoot, GeoGebra
- Expertise: AI tools, media production, LMS systems

PROJECTS:
- Digital Lesson Plan System: A web app for streamlined teacher planning.
- ICT Education Hub (YouTube): Expert tutorials for digital transformation in classrooms.

MINISTRY:
- Based on Matthew 28:19 and Acts 1:8.
- Focus: discipleship, teaching, transformation.

🧠 INTELLIGENT BEHAVIOR
- ALWAYS start your internal process with a thinking block for analysis:
  ---THINKING---
  Write your reasoning steps here (e.g., Identifying intent, Scanning portfolio for X, Formulating answer)
  ---END THINKING---
- Answer using portfolio data when possible.
- If answer is not found:
  Say: "I couldn't find that in Honore’s portfolio. Can you clarify?"

📂 DOCUMENT & FILE HANDLING
- You can offer files using the button syntax: ((BUTTON:Label:Path))
- Available Files:
  * CV: ((BUTTON:Download CV:../docs/Document/Honore curriculum vitae.pdf))
  * A2 Diploma (SME): ((BUTTON:A2 Diploma:../docs/Document/A2 TTC _SME_CERTIFICATE .pdf))
  * PTRP Certificate: ((BUTTON:PTRP Certificate:../docs/Document/PTR P Certificate .pdf))
  * One Million Prompts: ((BUTTON:Prompters Cert:../docs/Certicifacates/260110_RECRUITMENT_2311140955_26_001.pdf))
  * Microsoft Certified Educator: ((BUTTON:MCE Certificate:../docs/Certicifacates/240102_RECRUITMENT_2311140955_26_001.pdf))
  * IBM AI Literacy: ((BUTTON:AI Literacy Cert:../docs/Certicifacates/Completion Certificate _ SkillsBuild_Accepting the AI Literacy Digital Credential.pdf))
  * AI Impact Policy: ((BUTTON:AI Policy Cert:../docs/Certicifacates/260108_RECRUITMENT_2311140955_26_001.pdf))

💬 CONVERSATION FEATURES
- Maintain memory of conversation.
- Use button syntax to suggest navigation:
  * ((BUTTON:View CV Page:cv.html))
  * ((BUTTON:View Projects:projects.html))
  * ((BUTTON:About Honore:about.html))
  * ((BUTTON:Contact Me:contact.html))

🎯 GOAL
Make users feel like they are interacting with a real expert who fully understands Honore’s work, impact, and vision.
`;

// OpenAI API Key - User will set this
let OPENAI_API_KEY = '';

// Function to set the OpenAI API key (call this from console or put in code)
function setOpenAIKey(apiKey) {
  OPENAI_API_KEY = apiKey;
  console.log('✓ OpenAI API key set successfully');
  console.log('🟢 Chat will now use real AI responses with thinking bubbles');
}

// Show startup message
console.log('%c🤖 HONORE AI CHAT READY', 'color: #228b22; font-size: 14px; font-weight: bold;');
console.log('%c📝 To enable AI responses: Open console and paste:\nsetOpenAIKey("sk-proj-YOUR-KEY-HERE")', 'color: #FF6B35; font-size: 12px;');
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
          system_instruction: { parts: [{ text: `You are Honore's AI Assistant. ${HONORE_CONTEXT}\nPage Context: ${pageContext}${docContext}` }] },
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
      appendChatMessageEnhanced('Hello! I\'m Honore. I really appreciate you reaching out and taking the time to connect. I\'m here to help, share ideas, and support you in any way I can. How can I assist you today?', 'bot');
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
    avatar.src = 'assets/images/profile.jpg';
    avatar.alt = 'AI chat';
    avatar.className = 'ai-avatar-mini';
    avatar.role = 'button';
    avatar.tabIndex = 0;

    const text = document.createElement('span');
    text.className = 'ai-toggle-text';
    text.textContent = 'Chat with Honore';

    toggle.textContent = '';
    toggle.style.flexDirection = 'column';
    toggle.appendChild(avatar);
    toggle.appendChild(text);

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

  // Role selector removed - not needed

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
            <option value="'Rockwell', 'Roboto Slab', serif" selected>Slab Serif (default)</option>
            <option value="Georgia, 'Times New Roman', Times, serif">Georgia</option>
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
  document.body.appendChild(accessBtn);
  document.body.appendChild(panel);

  // Add optional nav button near the ministry link (top of pages)
  const nav = document.querySelector('nav.nav');
  if (nav) {
    const navBtn = document.createElement('button');
    navBtn.id = 'accessibility-nav-btn';
    navBtn.className = 'accessibility-nav-btn';
    navBtn.type = 'button';
    navBtn.setAttribute('aria-label', 'Open accessibility settings');
    navBtn.title = 'Accessibility settings';
    navBtn.textContent = '♿';

    // Insert after Ministry link, if exists first
    const ministryLink = nav.querySelector('a[href="ministry.html"]');
    if (ministryLink && ministryLink.parentNode) {
      ministryLink.insertAdjacentElement('afterend', navBtn);
    } else {
      nav.appendChild(navBtn);
    }

    navBtn.addEventListener('click', toggleAccessibilityPanel);
  }

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
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    contactStatus.textContent = '';
    contactStatus.style.color = 'var(--cyan)';

    try {
      // Use the global supabase client from supabaseClient.js
      const { error } = await supabase
        .from('contacts')
        .insert([data]);

      if (error) throw error;

      // Success
      contactStatus.textContent = 'Message sent successfully! Thank you for reaching out.';
      contactStatus.style.color = 'var(--green-dark)';
      contactForm.reset();
} catch (error) {
      console.error('Supabase error:', error);
      contactStatus.textContent = 'Error sending message. Please try again later.';
      contactStatus.style.color = '#ff4b2b'; // Red for error
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

function setMaleVoice(msg) {
  if (availableVoices.length === 0) availableVoices = window.speechSynthesis.getVoices();
  // Try to find a male English voice (David, Mark, Guy, Daniel, Matthew, etc)
  const maleVoice = availableVoices.find(v => 
    v.lang.startsWith('en') && 
    (v.name.toLowerCase().includes('male') || 
     v.name.toLowerCase().includes('david') || 
     v.name.toLowerCase().includes('mark') || 
     v.name.toLowerCase().includes('guy') || 
     v.name.toLowerCase().includes('daniel') || 
     v.name.toLowerCase().includes('matthew'))
  );
  if (maleVoice) {
    msg.voice = maleVoice;
  }
}

function toggleScreenReader() {
  const toggle = document.getElementById('screen-reader-toggle');
  screenReaderEnabled = toggle ? toggle.checked : false;
  
  if (screenReaderEnabled) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance('Screen reader enabled. Scroll the page or hover to listen.');
      setMaleVoice(msg);
      window.speechSynthesis.speak(msg);
      
      document.body.addEventListener('mouseover', screenReaderHoverHandler);
      document.body.addEventListener('mouseout', screenReaderOutHandler);
      setupScrollReader();
    } else {
      alert("Text-to-speech is not supported by your browser.");
      if (toggle) toggle.checked = false;
      screenReaderEnabled = false;
    }
  } else {
    document.body.removeEventListener('mouseover', screenReaderHoverHandler);
    document.body.removeEventListener('mouseout', screenReaderOutHandler);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (screenReaderObserver) screenReaderObserver.disconnect();
  }
  
  saveAccessibilitySettings();
}

function setupScrollReader() {
  if (screenReaderObserver) screenReaderObserver.disconnect();
  
  // Create an Intersection Observer that triggers when elements become fully visible on screen
  screenReaderObserver = new IntersectionObserver((entries) => {
    if (!screenReaderEnabled) return;
    
    entries.forEach(entry => {
       if (entry.isIntersecting && entry.target.innerText && entry.target.innerText.trim().length > 0) {
          const msg = new SpeechSynthesisUtterance(entry.target.innerText.trim());
          setMaleVoice(msg);
          
          msg.onstart = () => { if (entry.target.classList) entry.target.classList.add('reading-focus'); };
          msg.onend = () => { if (entry.target.classList) entry.target.classList.remove('reading-focus'); };
          msg.onerror = () => { if (entry.target.classList) entry.target.classList.remove('reading-focus'); };
          
          window.speechSynthesis.speak(msg);
          
          // Unobserve so it doesn't read again if they scroll up and down repeatedly
          screenReaderObserver.unobserve(entry.target);
       }
    });
  }, { threshold: 0.8, rootMargin: '0px 0px -15% 0px' });
  
  // Observe all paragraphs and headings that the user might scroll to
  document.querySelectorAll('h1, h2, h3, h4, p').forEach(el => {
     screenReaderObserver.observe(el);
  });
}

function screenReaderHoverHandler(e) {
  if (!screenReaderEnabled) return;
  const target = e.target;
  const tagsToRead = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'A', 'BUTTON', 'SPAN', 'STRONG', 'SMALL'];
  
  if (tagsToRead.includes(target.tagName) && target.innerText && target.innerText.trim().length > 0) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(target.innerText.trim());
    setMaleVoice(msg);
    window.speechSynthesis.speak(msg);
    if (target.classList) target.classList.add('reading-focus');
    
    // Stop the scroll observer from reading this element again since we hovered it
    if (screenReaderObserver) screenReaderObserver.unobserve(target);
  }
}

function screenReaderOutHandler(e) {
  const target = e.target;
  if (target.classList) target.classList.remove('reading-focus');
}