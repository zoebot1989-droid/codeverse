export interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
}

export const defaultProject: FileNode = {
  name: "demo-project",
  type: "folder",
  children: [
    {
      name: "index.html",
      type: "file",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio — Built Different</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav class="navbar">
    <div class="logo">⚡ DevPortfolio</div>
    <ul class="nav-links">
      <li><a href="#about">About</a></li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#contact">Contact</a></li>
      <li><button id="theme-toggle" aria-label="Toggle theme">🌙</button></li>
    </ul>
  </nav>

  <header class="hero">
    <div class="hero-content">
      <h1 class="glitch" data-text="Hello World.">Hello World.</h1>
      <p class="subtitle">Full-stack developer. Coffee enthusiast. Bug creator & fixer.</p>
      <div class="cta-group">
        <a href="#projects" class="btn btn-primary">View My Work</a>
        <a href="#contact" class="btn btn-outline">Get In Touch</a>
      </div>
    </div>
    <div class="hero-visual">
      <div class="code-window">
        <div class="window-dots">
          <span></span><span></span><span></span>
        </div>
        <pre><code>const developer = {
  name: "Your Name",
  skills: ["TypeScript", "React", "Node.js"],
  passion: "Building cool stuff",
  coffee: Infinity
};</code></pre>
      </div>
    </div>
  </header>

  <section id="about" class="section">
    <h2>About Me</h2>
    <p>I build things for the web. Sometimes they even work on the first try.</p>
  </section>

  <section id="projects" class="section">
    <h2>Projects</h2>
    <div class="project-grid" id="project-grid">
      <!-- Populated by app.js -->
    </div>
  </section>

  <section id="contact" class="section">
    <h2>Let's Talk</h2>
    <form id="contact-form" class="contact-form">
      <input type="text" name="name" placeholder="Your Name" required>
      <input type="email" name="email" placeholder="your@email.com" required>
      <textarea name="message" placeholder="What's on your mind?" rows="5" required></textarea>
      <button type="submit" class="btn btn-primary">Send Message</button>
    </form>
  </section>

  <footer>
    <p>&copy; 2024 DevPortfolio. Built with ❤️ and too much caffeine.</p>
  </footer>

  <script src="app.js"></script>
</body>
</html>`,
    },
    {
      name: "style.css",
      type: "file",
      content: `/* Modern CSS with Custom Properties */
:root {
  --bg-primary: #0f0f0f;
  --bg-secondary: #1a1a2e;
  --bg-card: #16213e;
  --text-primary: #eee;
  --text-secondary: #a0a0b0;
  --accent: #e94560;
  --accent-hover: #ff6b81;
  --gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  --radius: 12px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="light"] {
  --bg-primary: #fafafa;
  --bg-secondary: #ffffff;
  --bg-card: #f0f0f5;
  --text-primary: #1a1a2e;
  --text-secondary: #555;
  --shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  overflow-x: hidden;
}

/* Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(15, 15, 15, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
  align-items: center;
}

.nav-links a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: var(--transition);
}

.nav-links a:hover {
  color: var(--accent);
}

#theme-toggle {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1.2rem;
  transition: var(--transition);
}

#theme-toggle:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Hero */
.hero {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 6rem 4rem 4rem;
  gap: 4rem;
}

.hero h1 {
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 800;
  margin-bottom: 1rem;
  position: relative;
}

.subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.cta-group {
  display: flex;
  gap: 1rem;
}

.btn {
  display: inline-block;
  padding: 0.8rem 2rem;
  border-radius: var(--radius);
  font-weight: 600;
  text-decoration: none;
  transition: var(--transition);
  cursor: pointer;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(233, 69, 96, 0.4);
}

.btn-outline {
  border: 2px solid var(--accent);
  color: var(--accent);
  background: transparent;
}

.btn-outline:hover {
  background: var(--accent);
  color: white;
}

/* Code Window */
.code-window {
  background: #1e1e2e;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.window-dots {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
}

.window-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.window-dots span:nth-child(1) { background: #ff5f57; }
.window-dots span:nth-child(2) { background: #febc2e; }
.window-dots span:nth-child(3) { background: #28c840; }

.code-window pre {
  padding: 1.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  color: #a6e3a1;
  overflow-x: auto;
}

/* Sections */
.section {
  padding: 6rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section h2 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Project Grid */
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.project-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 2rem;
  transition: var(--transition);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow);
  border-color: var(--accent);
}

.project-card h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.project-card p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.tech-stack {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tech-tag {
  background: rgba(233, 69, 96, 0.15);
  color: var(--accent);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Contact Form */
.contact-form {
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-form input,
.contact-form textarea {
  padding: 1rem;
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
  transition: var(--transition);
}

.contact-form input:focus,
.contact-form textarea:focus {
  outline: none;
  border-color: var(--accent);
}

/* Footer */
footer {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-content { animation: fadeInUp 0.8s ease-out; }
.hero-visual { animation: fadeInUp 0.8s ease-out 0.2s both; }

@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 6rem 2rem 2rem;
  }
  .section { padding: 4rem 2rem; }
  .nav-links { gap: 1rem; }
}`,
    },
    {
      name: "app.js",
      type: "file",
      content: `// Portfolio App — Dynamic functionality
"use strict";

// ============================================
// Project Data
// ============================================
const projects = [
  {
    title: "🚀 SpaceTrader",
    description: "Real-time commodity trading sim with WebSocket price feeds and animated charts.",
    tech: ["React", "Node.js", "WebSocket", "D3.js"],
  },
  {
    title: "🎨 PixelForge",
    description: "Browser-based pixel art editor with layers, animation timeline, and export to GIF.",
    tech: ["Canvas API", "TypeScript", "IndexedDB"],
  },
  {
    title: "📡 APIForge",
    description: "Visual API builder — drag-and-drop endpoint creation with auto-generated docs.",
    tech: ["Vue.js", "Express", "OpenAPI", "Docker"],
  },
];

// ============================================
// Render Projects
// ============================================
function renderProjects() {
  const grid = document.getElementById("project-grid");
  if (!grid) return;

  grid.innerHTML = projects
    .map(
      (project) => \`
    <div class="project-card">
      <h3>\${project.title}</h3>
      <p>\${project.description}</p>
      <div class="tech-stack">
        \${project.tech.map((t) => \`<span class="tech-tag">\${t}</span>\`).join("")}
      </div>
    </div>
  \`
    )
    .join("");
}

// ============================================
// Dark Mode Toggle
// ============================================
function initThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  const saved = localStorage.getItem("theme");
  if (saved === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    toggle.textContent = "☀️";
  }

  toggle.addEventListener("click", () => {
    const isLight =
      document.documentElement.getAttribute("data-theme") === "light";
    document.documentElement.setAttribute(
      "data-theme",
      isLight ? "dark" : "light"
    );
    toggle.textContent = isLight ? "🌙" : "☀️";
    localStorage.setItem("theme", isLight ? "dark" : "light");
  });
}

// ============================================
// Contact Form Handler
// ============================================
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Simulate API call
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = "Sending...";
    btn.disabled = true;

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Form submitted:", data);
      btn.textContent = "✓ Sent!";
      form.reset();
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 2000);
    } catch (err) {
      btn.textContent = "Error — try again";
      btn.disabled = false;
    }
  });
}

// ============================================
// Smooth Scroll
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// ============================================
// Intersection Observer for Animations
// ============================================
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".section").forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(30px)";
    section.style.transition = "all 0.6s ease-out";
    observer.observe(section);
  });
}

// ============================================
// Init
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  renderProjects();
  initThemeToggle();
  initContactForm();
  initSmoothScroll();
  initScrollAnimations();
  console.log("🚀 Portfolio loaded. Welcome!");
});`,
    },
    {
      name: "README.md",
      type: "file",
      content: `# Demo Project

This entire IDE was built by AI. Yes, really.

Your move, human. 😏

## What You're Looking At

A **full browser-based IDE** with:
- 📁 File explorer with tree view
- ✏️ Syntax-highlighted code editor (built from scratch!)
- 💻 Simulated terminal
- 👁️ Live preview panel
- 🎨 Multiple themes
- ⌨️ Keyboard shortcuts
- 💾 LocalStorage persistence

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** — because we're professionals
- **Tailwind CSS** — utility-first styling
- **Framer Motion** — smooth animations
- **Custom syntax highlighter** — no Monaco, no CodeMirror. From scratch.

## The Point

AI isn't magic. It's a tool. A really, really good one.

The question isn't "will AI take my job?"
The question is "how much more dangerous can I be WITH AI?"

---

*Built by Zoe (AI) • Powered by caffeine and gradient descent* ☕`,
    },
    {
      name: "utils",
      type: "folder",
      children: [
        {
          name: "helpers.js",
          type: "file",
          content: `// ============================================
// Utility Functions — The Swiss Army Knife
// ============================================

/**
 * Debounce — delays function execution until after a pause.
 * Perfect for search inputs, window resize handlers, etc.
 *
 * @param {Function} fn - Function to debounce
 * @param {number} ms - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, ms = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Throttle — limits function calls to once per interval.
 * Great for scroll handlers, mousemove events, etc.
 *
 * @param {Function} fn - Function to throttle
 * @param {number} ms - Minimum interval between calls
 * @returns {Function} Throttled function
 */
export function throttle(fn, ms = 100) {
  let lastCall = 0;
  let timeoutId = null;

  return function (...args) {
    const now = Date.now();
    const remaining = ms - (now - lastCall);

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn.apply(this, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * Format a date into a human-readable string.
 *
 * @param {Date|string|number} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const d = new Date(date);
  const defaults = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };
  return new Intl.DateTimeFormat("en-US", defaults).format(d);
}

/**
 * Generate a unique ID (UUID v4-ish).
 * Good enough for client-side use. Don't use for crypto.
 *
 * @returns {string} Random UUID-like string
 */
export function generateId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Deep clone an object (structuredClone wrapper with fallback).
 *
 * @param {any} obj - Object to clone
 * @returns {any} Deep clone
 */
export function deepClone(obj) {
  if (typeof structuredClone === "function") {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Sleep — async delay utility.
 *
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clamp a value between min and max.
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Simple event emitter for decoupled communication.
 */
export class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const cbs = this.listeners.get(event);
    if (cbs) {
      this.listeners.set(event, cbs.filter((cb) => cb !== callback));
    }
  }

  emit(event, ...args) {
    const cbs = this.listeners.get(event) || [];
    cbs.forEach((cb) => cb(...args));
  }
}`,
        },
        {
          name: "api.js",
          type: "file",
          content: `// ============================================
// API Client — Simulated REST Client
// ============================================

const BASE_URL = "https://api.example.com/v1";

/**
 * Core fetch wrapper with error handling, timeouts, and retries.
 */
async function request(endpoint, options = {}) {
  const {
    method = "GET",
    body = null,
    headers = {},
    timeout = 10000,
    retries = 2,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    signal: controller.signal,
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(\`\${BASE_URL}\${endpoint}\`, config);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(
          error.message || \`HTTP \${response.status}\`,
          response.status,
          error
        );
      }

      return await response.json();
    } catch (err) {
      lastError = err;

      if (err.name === "AbortError") {
        throw new ApiError("Request timed out", 408);
      }

      if (attempt < retries && err.status >= 500) {
        // Exponential backoff
        await new Promise((r) =>
          setTimeout(r, Math.pow(2, attempt) * 1000)
        );
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ============================================
// API Methods
// ============================================

export const api = {
  // Users
  getUsers: () => request("/users"),
  getUser: (id) => request(\`/users/\${id}\`),
  createUser: (data) =>
    request("/users", { method: "POST", body: data }),
  updateUser: (id, data) =>
    request(\`/users/\${id}\`, { method: "PUT", body: data }),
  deleteUser: (id) =>
    request(\`/users/\${id}\`, { method: "DELETE" }),

  // Posts
  getPosts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(\`/posts\${query ? "?" + query : ""}\`);
  },
  getPost: (id) => request(\`/posts/\${id}\`),
  createPost: (data) =>
    request("/posts", { method: "POST", body: data }),

  // Auth
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: { email, password },
    }),
  logout: () => request("/auth/logout", { method: "POST" }),
  refreshToken: () =>
    request("/auth/refresh", { method: "POST" }),
};

export { ApiError };`,
        },
      ],
    },
  ],
};

export function flattenFiles(
  node: FileNode,
  path = ""
): Record<string, string> {
  const result: Record<string, string> = {};
  const currentPath = path ? `${path}/${node.name}` : node.name;

  if (node.type === "file") {
    result[currentPath] = node.content || "";
  } else if (node.children) {
    for (const child of node.children) {
      Object.assign(result, flattenFiles(child, currentPath));
    }
  }

  return result;
}

export function getLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    html: "html",
    htm: "html",
    css: "css",
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    json: "json",
    md: "markdown",
    txt: "plaintext",
  };
  return map[ext || ""] || "plaintext";
}

export function getFileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const icons: Record<string, string> = {
    html: "🌐",
    css: "🎨",
    js: "⚡",
    jsx: "⚛️",
    ts: "💠",
    tsx: "⚛️",
    py: "🐍",
    json: "📋",
    md: "📝",
    txt: "📄",
  };
  return icons[ext || ""] || "📄";
}
