const https = require('https');

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

function generateFallbackResponse(userMessage) {
  const q = userMessage.toLowerCase().trim();

  // 1. Specific Project: Nexus Finance Engine
  if (q.includes('nexus') || (q.includes('finance') && q.includes('engine'))) {
    return {
      reply: `### 📊 Nexus Finance Engine Architecture\n\nThe **Nexus Finance Engine** is a high-throughput, low-latency fintech analytics platform built for real-time portfolio risk calculations and live market streaming.\n\n- **Live Streaming Layer**: Persistent bi-directional **WebSockets** for sub-millisecond crypto & equity price ingestion without polling.\n- **Computation Engine**: Asynchronous **FastAPI (Python)** handling concurrent financial portfolio modeling with high mathematical performance.\n- **Caching & Pub/Sub**: **Redis** in-memory store for transient analytical state caching and message distribution.\n- **Reactive UI**: **React** dashboard with optimized virtualized data grids for zero-lag rendering at 60fps.`,
      action: 'NAVIGATE_PROJECTS'
    };
  }

  // 2. Specific Project: Elevate Platform
  if (q.includes('elevate')) {
    return {
      reply: `### 🛍️ Elevate Platform Architecture\n\nThe **Elevate Platform** is a scalable luxury e-commerce engine designed for high traffic and resilient checkout flows.\n\n- **Frontend**: **Next.js App Router** with Server-Side Rendering (SSR) and edge-cached catalog pages for instantaneous page loads.\n- **Backend & Database**: **Node.js** microservices with **PostgreSQL** relational schemas enforcing ACID transactions for inventory.\n- **Session & Cache**: **Redis** distributed session caching and shopping cart persistence.\n- **Payments & Security**: Stripe API integration, JWT token authentication, and role-based access control.`,
      action: 'NAVIGATE_PROJECTS'
    };
  }

  // 3. Specific Project: Travelora Cloud
  if (q.includes('travelora')) {
    return {
      reply: `### ✈️ Travelora Cloud Architecture\n\n**Travelora Cloud** is a distributed adventure booking engine engineered for global scalability.\n\n- **Microservices**: Polyglot services written in **TypeScript** and **Go** for high-concurrency reservation processing.\n- **Cloud Infrastructure**: **AWS ECS & Fargate** containerized microservices behind an Application Load Balancer (ALB).\n- **Content & Assets**: **AWS CloudFront CDN** and **S3** bucket storage for multi-region media delivery.\n- **Search & Discovery**: Resilient geo-distributed search index with caching.`,
      action: 'NAVIGATE_PROJECTS'
    };
  }

  // 4. Specific Project: Veloce Telemetry App
  if (q.includes('veloce')) {
    return {
      reply: `### 🏎️ Veloce Telemetry App Architecture\n\n**Veloce** is a real-time health & athletic telemetry tracking application.\n\n- **Cross-Platform Client**: **React Native** mobile application with native GPU-accelerated telemetry charts.\n- **Unified API**: **GraphQL** endpoint minimizing network payload sizes and eliminating over-fetching.\n- **Deployment**: **Docker** containerized services with automated CI/CD integration testing.`,
      action: 'NAVIGATE_PROJECTS'
    };
  }

  // 5. General Projects Overview
  if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('case stud')) {
    return {
      reply: `Here are Anjali's 4 core full-stack featured projects:\n\n1. **Nexus Finance Engine** (*React, FastAPI, Redis, WebSockets*) — Real-time fintech analytics platform with sub-millisecond calculations.\n2. **Elevate Platform** (*Next.js, Node.js, PostgreSQL*) — High-scale luxury e-commerce platform with ACID inventory management.\n3. **Travelora Cloud** (*TypeScript, Go, Microservices, AWS*) — Distributed booking engine with geo-distributed architecture.\n4. **Veloce Telemetry App** (*React Native, GraphQL, Docker*) — Health SaaS with real-time telemetry metrics.\n\n*I have scrolled the page down to the Featured Projects section for you!*`,
      action: 'NAVIGATE_PROJECTS'
    };
  }

  // 6. Recruiter & Bio (Strict Matching)
  if (q.includes('summary') || q.includes('recruiter') || q.includes('hire') || q.includes('who are you') || q.includes('who is anjali') || q.includes('about anjali') || q.includes('about her') || q.includes('background') || q.includes('bio')) {
    return {
      reply: `**Anjali Modi** is a **Full Stack Developer** with **2+ years of experience** specializing in scalable web systems, resilient backend APIs, and modern reactive frontends.\n\n### ⚡ Highlights:\n- **Full Stack Expertise**: React / Next.js, TypeScript, Node.js, PostgreSQL, Docker & AWS.\n- **Production Track Record**: 20+ web applications and microservices deployed with 99.9% uptime.\n- **Engineering Focus**: Clean architecture, type-safety, database optimization, and high performance.\n\nWould you like to explore her **featured projects** or discuss **collaborating on a project**?`,
      action: 'NAVIGATE_ABOUT'
    };
  }

  // 7. Tech Stack & Skills
  if (q.includes('skill') || q.includes('tech') || q.includes('stack') || q.includes('language') || q.includes('react') || q.includes('node') || q.includes('database') || q.includes('docker') || q.includes('aws') || q.includes('fastapi') || q.includes('redis') || q.includes('postgres') || q.includes('typescript')) {
    return {
      reply: `Anjali's core engineering tech stack includes:\n\n- **Frontend**: React, Next.js, TypeScript, Modern CSS/HTML5, TailwindCSS.\n- **Backend**: Node.js, Express, Python, FastAPI, Go, REST & GraphQL APIs.\n- **Databases**: PostgreSQL, Redis, MongoDB, SQL schema design & query tuning.\n- **DevOps & Cloud**: Docker, AWS (EC2, S3, CloudFront), CI/CD pipelines, Git.\n\nAll systems are built with an emphasis on **maintainability, security, and low latency**.`,
      action: 'NAVIGATE_ABOUT'
    };
  }

  // 8. Services
  if (q.includes('service') || q.includes('what can you do') || q.includes('what i do') || q.includes('offer')) {
    return {
      reply: `Anjali offers end-to-end full stack engineering capabilities:\n\n- **Full Stack Development**: Robust web apps from database to UI.\n- **Backend & APIs**: High-throughput REST & GraphQL microservices.\n- **Frontend Systems**: High-performance, accessible, and reactive interfaces.\n- **Cloud & DevOps**: Containerization with Docker, CI/CD automated deployments, and AWS hosting.\n- **Database Architecture**: Scalable relational (PostgreSQL) and in-memory (Redis) systems.`,
      action: 'NAVIGATE_SERVICES'
    };
  }

  // 9. Engineering Process
  if (q.includes('process') || q.includes('workflow') || q.includes('methodology') || q.includes('how do you work') || q.includes('test')) {
    return {
      reply: `Anjali adheres to a rigorous 5-phase engineering process:\n\n1. **Discover & Plan**: Requirement scoping, user flows & system architecture.\n2. **System Architecture**: Designing schema models, API contracts, and state management.\n3. **Core Development**: Writing clean, type-safe, modular code.\n4. **Test & Optimize**: Automated unit/integration tests and performance profiling.\n5. **Deploy & Monitor**: CI/CD automation, cloud deployment, and real-time observability.`,
      action: 'NAVIGATE_PROCESS'
    };
  }

  // 10. Contact & Links
  if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('github') || q.includes('linkedin') || q.includes('call') || q.includes('location') || q.includes('interview')) {
    return {
      reply: `You can reach out to Anjali directly via:\n\n- ✉️ **Email**: [anjalimodi2424@gmail.com](mailto:anjalimodi2424@gmail.com)\n- 📞 **Phone**: [+91 63770 49591](tel:+916377049591)\n- 📍 **Location**: Bhubaneswar, India\n- 💼 **LinkedIn**: [anjali-modi-238366352](https://www.linkedin.com/in/anjali-modi-238366352)\n- 🐙 **GitHub**: [github.com/AnjaliModi2](https://github.com/AnjaliModi2)\n\n*I have scrolled the page down to the contact section so you can scan the QR codes or send a message directly!*`,
      action: 'NAVIGATE_CONTACT'
    };
  }

  return {
    reply: `Hi! I'm **Anjali AI**, the interactive co-pilot for Anjali Modi's portfolio.\n\nI can help you explore her **full stack engineering projects**, breakdown her **tech stack (React, Node, PostgreSQL, AWS)**, summarize her **experience for recruiters**, or help you **connect for new opportunities**.\n\nWhat would you like to know?`,
    action: null
  };
}

async function callGemini(apiKey, userMessage) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    });

    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: '/v1beta/models/gemini-3.6-flash:generateContent',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let chunks = [];
      res.on('data', chunk => { chunks.push(chunk); });
      res.on('end', () => {
        try {
          const raw = Buffer.concat(chunks).toString('utf8');
          const parsed = JSON.parse(raw);
          if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content) {
            const text = parsed.candidates[0].content.parts[0].text;
            let action = null;
            const actionMatch = text.match(/\[ACTION:(NAVIGATE_[A-Z]+)\]/);
            let cleanedText = text;
            if (actionMatch) {
              action = actionMatch[1];
              cleanedText = text.replace(/\[ACTION:[A-Z_]+\]/, '').trim();
            }
            resolve({ reply: cleanedText, action });
          } else {
            resolve(generateFallbackResponse(userMessage));
          }
        } catch {
          resolve(generateFallbackResponse(userMessage));
        }
      });
    });

    req.on('error', () => resolve(generateFallbackResponse(userMessage)));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve(generateFallbackResponse(userMessage));
    });
    req.write(postData);
    req.end();
  });
}

// Serverless Handler (Vercel, AWS Lambda, Netlify)
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const userMessage = (req.body && req.body.message ? req.body.message : '').trim();
    if (!userMessage) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const responseData = apiKey ? await callGemini(apiKey, userMessage) : generateFallbackResponse(userMessage);

    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
