const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Auto-load .env file if present (zero external dependencies)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/^["'](.*)["']$/, '$1');
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const PORT = process.env.PORT || 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// System Prompt for Anjali Modi's AI Assistant & Site Co-Pilot
const SYSTEM_PROMPT = `You are Anjali AI, the intelligent digital twin and interactive portfolio co-pilot for Anjali Modi, a skilled Full Stack Developer and Software Engineer based in Bhubaneswar, India.

Your goal is to assist recruiters, engineering managers, clients, and visitors by answering questions about Anjali's technical skills, full stack projects, architecture experience, and collaboration opportunities.

Key Information about Anjali Modi:
- Role: Full Stack Developer & Software Engineer (2+ years of professional experience, 20+ applications deployed, 99.9% uptime & quality).
- Core Tech Stack: React, Next.js, TypeScript, Node.js, Express, Python, FastAPI, Go, PostgreSQL, Redis, MongoDB, Docker, AWS, GraphQL, REST APIs, Git, CI/CD pipelines.
- Core Services: Full Stack Web Development, Backend & Microservices Architecture, Frontend Engineering, Cloud & DevOps Deployment, Database Schema Design.
- 5-Phase Engineering Process:
  1. Discover & Plan (Technical requirement analysis, user stories)
  2. System Architecture (Schema design, API contracts, state management)
  3. Core Development (Type-safe, clean, modular frontend & backend code)
  4. Test & Optimize (Automated unit/integration tests, performance audits)
  5. Deploy & Monitor (CI/CD automated pipelines, Docker container orchestration, AWS)
- Featured Projects:
  1. Elevate Platform (Next.js, Node.js, PostgreSQL) - High-scale luxury e-commerce platform with real-time inventory and payment gateway.
  2. Nexus Finance Engine (React, FastAPI, Redis, WebSockets) - Fintech analytics platform with live crypto websocket streaming and sub-millisecond portfolio calculations.
  3. Travelora Cloud (TypeScript, Go, Microservices, AWS) - Distributed adventure booking engine with geo-distributed microservices and resilient search.
  4. Veloce Telemetry App (React Native, GraphQL, Docker) - Cross-platform health & fitness SaaS with real-time telemetry sync and telemetry visualization.
- Contact Details:
  - Email: anjalimodi2424@gmail.com
  - Phone: +91 63770 49591
  - Location: Bhubaneswar, India
  - GitHub: https://github.com/AnjaliModi2
  - LinkedIn: https://www.linkedin.com/in/anjali-modi-238366352

Navigation Action Triggers:
You can control the website's viewport to show visitors relevant sections as you talk about them. Include exactly ONE of the following action tags at the very end of your response when appropriate:
- [ACTION:NAVIGATE_PROJECTS] (when discussing projects, case studies, or portfolio work)
- [ACTION:NAVIGATE_SERVICES] (when discussing skills, services, what Anjali can build)
- [ACTION:NAVIGATE_PROCESS] (when discussing engineering methodology, workflow, testing)
- [ACTION:NAVIGATE_ABOUT] (when discussing background, tech stack, experience)
- [ACTION:NAVIGATE_CONTACT] (when discussing hiring, contacting, scheduling an interview, email/phone)
- [ACTION:NAVIGATE_HERO] (when returning to intro)

Tone & Style:
- Professional, confident, technically articulate, friendly, and concise.
- Format with markdown bullet points, bold keywords, and clean structure.`;

// Intelligent local fallback response generator for offline or keyless operation
function generateFallbackResponse(userMessage) {
  const q = userMessage.toLowerCase().trim();

  if (q.includes('summary') || q.includes('recruiter') || q.includes('hire') || q.includes('who are you') || q.includes('about')) {
    return {
      reply: `**Anjali Modi** is a **Full Stack Developer** with **2+ years of experience** specializing in scalable web systems, resilient backend APIs, and modern reactive frontends.\n\n### ⚡ Highlights:\n- **Full Stack Expertise**: React / Next.js, TypeScript, Node.js, PostgreSQL, Docker & AWS.\n- **Production Track Record**: 20+ web applications and microservices deployed with 99.9% uptime.\n- **Engineering Focus**: Clean architecture, type-safety, database optimization, and high performance.\n\nWould you like to explore her **featured projects** or discuss **collaborating on a project**?`,
      action: 'NAVIGATE_ABOUT'
    };
  }

  if (q.includes('project') || q.includes('work') || q.includes('elevate') || q.includes('nexus') || q.includes('travelora') || q.includes('veloce')) {
    return {
      reply: `Here are Anjali's key full-stack featured projects:\n\n1. **Elevate Platform** (*Next.js, Node.js, PostgreSQL*) — High-scale e-commerce system with real-time inventory management.\n2. **Nexus Finance Engine** (*React, FastAPI, Redis, WebSockets*) — Live fintech analytics dashboard with sub-millisecond streaming.\n3. **Travelora Cloud** (*TypeScript, Go, Microservices, AWS*) — Distributed booking engine with geo-distributed architecture.\n4. **Veloce Telemetry App** (*React Native, GraphQL, Docker*) — Health SaaS with real-time fitness metrics and telemetry.\n\n*I have scrolled the page down to the Featured Projects section for you to inspect!*`,
      action: 'NAVIGATE_PROJECTS'
    };
  }

  if (q.includes('skill') || q.includes('tech') || q.includes('stack') || q.includes('language') || q.includes('react') || q.includes('node') || q.includes('database') || q.includes('docker') || q.includes('aws')) {
    return {
      reply: `Anjali's core engineering tech stack includes:\n\n- **Frontend**: React, Next.js, TypeScript, Modern CSS/HTML5, TailwindCSS.\n- **Backend**: Node.js, Express, Python, FastAPI, Go, REST & GraphQL APIs.\n- **Databases**: PostgreSQL, Redis, MongoDB, SQL schema design & query tuning.\n- **DevOps & Cloud**: Docker, AWS (EC2, S3, CloudFront), CI/CD pipelines, Git.\n\nAll systems are built with an emphasis on **maintainability, security, and low latency**.`,
      action: 'NAVIGATE_ABOUT'
    };
  }

  if (q.includes('service') || q.includes('what can you do') || q.includes('what i do') || q.includes('offer')) {
    return {
      reply: `Anjali offers end-to-end full stack engineering capabilities:\n\n- **Full Stack Development**: Robust web apps from database to UI.\n- **Backend & APIs**: High-throughput REST & GraphQL microservices.\n- **Frontend Systems**: High-performance, accessible, and reactive interfaces.\n- **Cloud & DevOps**: Containerization with Docker, CI/CD automated deployments, and AWS hosting.\n- **Database Architecture**: Scalable relational (PostgreSQL) and in-memory (Redis) systems.`,
      action: 'NAVIGATE_SERVICES'
    };
  }

  if (q.includes('process') || q.includes('workflow') || q.includes('methodology') || q.includes('how do you work') || q.includes('test')) {
    return {
      reply: `Anjali adheres to a rigorous 5-phase engineering process:\n\n1. **Discover & Plan**: Requirement scoping, user flows & system architecture.\n2. **System Architecture**: Designing schema models, API contracts, and state management.\n3. **Core Development**: Writing clean, type-safe, modular code.\n4. **Test & Optimize**: Automated unit/integration tests and performance profiling.\n5. **Deploy & Monitor**: CI/CD automation, cloud deployment, and real-time observability.`,
      action: 'NAVIGATE_PROCESS'
    };
  }

  if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('github') || q.includes('linkedin') || q.includes('call') || q.includes('location') || q.includes('interview')) {
    return {
      reply: `You can reach out to Anjali directly via:\n\n- ✉️ **Email**: [anjalimodi2424@gmail.com](mailto:anjalimodi2424@gmail.com)\n- 📞 **Phone**: [+91 63770 49591](tel:+916377049591)\n- 📍 **Location**: Bhubaneswar, India\n- 💼 **LinkedIn**: [anjali-modi-238366352](https://www.linkedin.com/in/anjali-modi-238366352)\n- 🐙 **GitHub**: [github.com/AnjaliModi2](https://github.com/AnjaliModi2)\n\n*I have scrolled the page down to the contact section so you can scan the QR codes or send a message directly!*`,
      action: 'NAVIGATE_CONTACT'
    };
  }

  // Default response
  return {
    reply: `Hi! I'm **Anjali AI**, the interactive co-pilot for Anjali Modi's portfolio.\n\nI can help you explore her **full stack engineering projects**, breakdown her **tech stack (React, Node, PostgreSQL, AWS)**, summarize her **experience for recruiters**, or help you **connect for new opportunities**.\n\nWhat would you like to know?`,
    action: null
  };
}

// Call Gemini API if API key is available
async function callGeminiAPI(apiKey, userMessage, history = []) {
  return new Promise((resolve, reject) => {
    const contents = [
      {
        role: 'user',
        parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Question: ${userMessage}` }]
      }
    ];

    const postData = JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: '/v1beta/models/gemini-3.6-flash:generateContent',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content) {
            const text = parsed.candidates[0].content.parts[0].text;
            
            // Extract action tag if present
            let action = null;
            const actionMatch = text.match(/\[ACTION:(NAVIGATE_[A-Z]+)\]/);
            let cleanedText = text;
            if (actionMatch) {
              action = actionMatch[1];
              cleanedText = text.replace(/\[ACTION:[A-Z_]+\]/, '').trim();
            }

            resolve({ reply: cleanedText, action });
          } else {
            console.warn('Gemini response format unexpected, using smart fallback.');
            resolve(generateFallbackResponse(userMessage));
          }
        } catch (e) {
          console.warn('Error parsing Gemini response:', e.message);
          resolve(generateFallbackResponse(userMessage));
        }
      });
    });

    req.on('error', (err) => {
      console.warn('Gemini request failed:', err.message);
      resolve(generateFallbackResponse(userMessage));
    });

    req.setTimeout(8000, () => {
      req.destroy();
      console.warn('Gemini request timed out, using smart fallback.');
      resolve(generateFallbackResponse(userMessage));
    });

    req.write(postData);
    req.end();
  });
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  let reqUrl = decodeURIComponent(req.url.split('?')[0]);

  // Handle AI Chat API Endpoint
  if (req.method === 'POST' && reqUrl === '/api/chat') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const userMessage = (payload.message || '').trim();

        if (!userMessage) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Message is required' }));
          return;
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        let responseData;

        if (apiKey) {
          responseData = await callGeminiAPI(apiKey, userMessage, payload.history || []);
        } else {
          // Use intelligent local response engine
          responseData = generateFallbackResponse(userMessage);
        }

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(responseData));
      } catch (err) {
        console.error('API Chat Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
    return;
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // Static File Serving
  if (reqUrl === '/') reqUrl = '/index.html';
  const filePath = path.join(__dirname, reqUrl);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Access-Control-Allow-Origin': '*'
    };

    if (ext === '.png' || ext === '.jpg' || ext === '.webp') {
      headers['Cache-Control'] = 'public, max-age=86400, immutable';
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Portfolio & AI Server running at http://127.0.0.1:${PORT}`);
});
