/**
 * Fiona Alphonce — Professional Portfolio
 * js/main.js
 *
 * Features:
 *  - Dark / Light theme toggle with localStorage persistence
 *  - Mobile hamburger menu
 *  - Smooth-scroll active navigation highlighting
 *  - Scroll reveal animations (respects prefers-reduced-motion)
 *  - Typing / rotating hero headline effect
 *  - Project category filtering
 *  - Project detail modal
 *  - Back-to-top FAB
 *  - Copy email to clipboard
 *  - Dynamic footer year
 */

/* ============================================================
   Utilities
   ============================================================ */

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

/** Debounce helper */
function debounce(fn, delay = 80) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ============================================================
   1. Theme Toggle
   ============================================================ */

(function initTheme() {
  const html = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const iconEl = btn ? btn.querySelector('.theme-icon') : null;

  const DARK = 'dark';
  const LIGHT = 'light';

  // Determine initial theme: stored preference → OS preference → dark default
  const stored = localStorage.getItem('portfolio-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = stored || (prefersDark ? DARK : LIGHT);

  applyTheme(initial);

  if (btn) {
    btn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') === DARK ? DARK : LIGHT;
      applyTheme(current === DARK ? LIGHT : DARK);
    });
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    if (iconEl) {
      iconEl.textContent = theme === DARK ? '☀' : '☾';
      iconEl.setAttribute('title', theme === DARK ? 'Switch to light mode' : 'Switch to dark mode');
    }
    if (btn) {
      btn.setAttribute('aria-label', theme === DARK ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }
})();

/* ============================================================
   2. Mobile Hamburger Menu
   ============================================================ */

(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu on nav link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();

/* ============================================================
   3. Sticky Navbar Shadow on Scroll
   ============================================================ */

(function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', debounce(onScroll, 40), { passive: true });
})();

/* ============================================================
   4. Active Navigation Highlight on Scroll
   ============================================================ */

(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  function setActive() {
    let current = '';
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
      if (scrollY >= section.offsetTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle(
        'active',
        link.getAttribute('href') === `#${current}`
      );
    });
  }

  window.addEventListener('scroll', debounce(setActive, 60), { passive: true });
  setActive();
})();

/* ============================================================
   5. Scroll Reveal Animations
   ============================================================ */

(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  if (prefersReducedMotion) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();

/* ============================================================
   6. Typing / Rotating Hero Headline
   ============================================================ */

(function initTypingEffect() {
  const el = document.getElementById('hero-headline');
  if (!el) return;

  const roles = [
    'IT Professional',
    'Software Developer',
    'Business Analyst',
    'Data & Enterprise Systems Enthusiast',
  ];

  if (prefersReducedMotion) {
    el.textContent = roles.join(' | ');
    return;
  }

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingTimeout;

  function type() {
    const currentRole = roles[roleIndex];
    const displayed = currentRole.substring(0, charIndex);
    el.textContent = displayed;

    let speed = isDeleting ? 55 : 90;

    if (!isDeleting && charIndex === currentRole.length) {
      speed = 1800; // pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      speed = 400;
    }

    charIndex += isDeleting ? -1 : 1;
    typingTimeout = setTimeout(type, speed);
  }

  type();
})();

/* ============================================================
   7. Project Category Filtering
   ============================================================ */

(function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('#projects-grid .project-card');
  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show / hide cards
      projectCards.forEach(card => {
        const cats = card.getAttribute('data-category') || '';
        const show = filter === 'all' || cats.includes(filter);
        card.classList.toggle('hidden', !show);
      });
    });
  });
})();

/* ============================================================
   8. Project Detail Modal
   ============================================================ */

const projectData = {
  woti: {
    title: 'WOTI Attendance Management System',
    subtitle: 'GPS/Geofencing-Based Attendance Platform',
    overview:
      'The WOTI Attendance Management System is a full-featured, GPS and geofencing-based platform for automating, monitoring, and managing employee attendance across distributed facility hierarchies. Designed for organizations that need precision, accountability, and auditability at scale.',
    challenge:
      'Traditional manual attendance tracking is error-prone, easily manipulated, and difficult to audit. Organizations with multiple locations needed a centralized, real-time solution that could enforce physical presence requirements with geofencing boundaries.',
    solution:
      'Built a robust Node.js/Express.js REST API backed by PostgreSQL with PostGIS spatial extensions. The system captures GPS coordinates on clock-in/clock-out events, validates them against facility geofences, and stores complete audit trails. The admin dashboard provides real-time visibility, reporting, and employee management capabilities.',
    technologies: [
      'Node.js', 'Express.js', 'PostgreSQL', 'PostGIS',
      'JavaScript', 'HTML', 'CSS', 'REST APIs',
      'GitHub Actions', 'Docker', 'Nginx',
    ],
    features: [
      'GPS-based attendance capture with geofence validation',
      'Clock in / clock out with location verification',
      'Employee management and facility hierarchy',
      'Monthly timesheets and reporting',
      'Admin dashboard with real-time data',
      'System Owner functionality',
      'Comprehensive audit logging',
      'Role-based access control (RBAC)',
      'Import / export functionality',
      'Responsive UI for desktop and mobile',
    ],
    lessons:
      'Deepened expertise in PostGIS spatial queries, CI/CD pipeline design with GitHub Actions, containerized deployment with Docker + Nginx, and building secure, auditable backend systems.',
    repo: '[YOUR GITHUB URL]/woti-ams',
    demo: '[LIVE DEMO URL]',
  },
  web1: {
    title: '[Web Project Title]',
    subtitle: 'Web Application',
    overview: '[Describe the web project — what it does, who it is for, and why it was built. Replace this placeholder with actual content.]',
    challenge: '[Describe the problem or challenge this project addresses.]',
    solution: '[Describe your approach and how the project solves the problem.]',
    technologies: ['[Technology 1]', '[Technology 2]', '[Technology 3]'],
    features: [
      '[Key feature 1]',
      '[Key feature 2]',
      '[Key feature 3]',
    ],
    lessons: '[Key takeaways and learning outcomes from this project.]',
    repo: '[YOUR GITHUB URL]',
    demo: '[LIVE DEMO URL]',
  },
  data1: {
    title: '[Data Analysis Project Title]',
    subtitle: 'Data Analysis Project',
    overview: '[Describe the data analysis project — dataset, objectives, methodology. Replace with actual content.]',
    challenge: '[Describe the data challenge or business question being answered.]',
    solution: '[Describe the analysis approach, tools used, and how insights were derived.]',
    technologies: ['Python', 'SQL', '[Tool]'],
    features: [
      '[Analysis type 1]',
      '[Visualization / output]',
      '[Key insight delivered]',
    ],
    lessons: '[Learnings from this data project.]',
    repo: '[YOUR GITHUB URL]',
    demo: '[LIVE DEMO URL]',
  },
  ba1: {
    title: '[BA Case Study Title]',
    subtitle: 'Business Analysis Case Study',
    overview: '[Describe the business analysis case study — scope, stakeholders, deliverables. Replace with actual content.]',
    challenge: '[Describe the business problem or gap being analyzed.]',
    solution: '[Describe the analysis methodology, artifacts produced, and outcome achieved.]',
    technologies: ['BRD', 'SRS', 'UAT', 'Process Modelling'],
    features: [
      '[Deliverable 1 — e.g., Business Requirements Document]',
      '[Deliverable 2 — e.g., Functional Specifications]',
      '[Outcome — e.g., System successfully delivered]',
    ],
    lessons: '[Learnings from this business analysis engagement.]',
    repo: null,
    demo: null,
  },
};

(function initModal() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  const modalContent = document.getElementById('modal-content');
  if (!overlay || !closeBtn || !modalContent) return;

  function openModal(projectKey) {
    const data = projectData[projectKey];
    if (!data) return;

    modalContent.innerHTML = renderModal(data);
    overlay.removeAttribute('hidden');
    closeBtn.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.setAttribute('hidden', '');
    document.body.style.overflow = '';
    // Return focus to the trigger
    const trigger = document.activeElement;
    if (trigger && trigger !== closeBtn) trigger.blur();
  }

  function renderModal(d) {
    const techList = d.technologies.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('');
    const featureList = d.features.map(f => `<li>${escapeHtml(f)}</li>`).join('');
    const repoBtn = d.repo && !d.repo.includes('[')
      ? `<a href="${escapeHtml(d.repo)}" class="btn btn-outline" target="_blank" rel="noopener noreferrer">View Repository</a>`
      : '';
    const demoBtn = d.demo && !d.demo.includes('[')
      ? `<a href="${escapeHtml(d.demo)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Live Demo</a>`
      : '';

    return `
      <h2 id="modal-title">${escapeHtml(d.title)}</h2>
      <p style="color:var(--accent);font-size:0.875rem;font-weight:600;margin-bottom:1.5rem;">${escapeHtml(d.subtitle)}</p>

      <div class="modal-section">
        <h3>Overview</h3>
        <p>${escapeHtml(d.overview)}</p>
      </div>

      <div class="modal-section">
        <h3>The Challenge</h3>
        <p>${escapeHtml(d.challenge)}</p>
      </div>

      <div class="modal-section">
        <h3>The Solution</h3>
        <p>${escapeHtml(d.solution)}</p>
      </div>

      <div class="modal-section">
        <h3>Technologies</h3>
        <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">${techList}</div>
      </div>

      <div class="modal-section">
        <h3>Key Features</h3>
        <ul>${featureList}</ul>
      </div>

      <div class="modal-section">
        <h3>Lessons Learned</h3>
        <p>${escapeHtml(d.lessons)}</p>
      </div>

      <div class="modal-actions">${repoBtn}${demoBtn}</div>
    `;
  }

  // Open modal on button click
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.project-modal-btn');
    if (btn) {
      const key = btn.getAttribute('data-project');
      openModal(key);
    }
  });

  // Close on button, overlay background, or Escape
  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hasAttribute('hidden')) closeModal();
  });

  // Trap focus inside modal
  overlay.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = overlay.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();

/* ============================================================
   9. Back to Top FAB
   ============================================================ */

(function initBackToTop() {
  const fab = document.getElementById('back-to-top-fab');
  if (!fab) return;

  function onScroll() {
    const show = window.scrollY > 400;
    if (show) {
      fab.removeAttribute('hidden');
    } else {
      fab.setAttribute('hidden', '');
    }
  }

  window.addEventListener('scroll', debounce(onScroll, 60), { passive: true });

  fab.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
})();

/* ============================================================
   10. Copy Email to Clipboard
   ============================================================ */

(function initCopyEmail() {
  const btn = document.getElementById('copy-email-btn');
  if (!btn) return;

  const emailEl = btn.closest('div');
  // Find the sibling span that contains the email
  const emailSpan = emailEl ? emailEl.querySelector('span') : null;

  btn.addEventListener('click', async () => {
    const email = emailSpan ? emailSpan.textContent.trim() : '';
    if (!email || email.startsWith('[')) {
      btn.textContent = 'No email set';
      setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      return;
    }
    try {
      await navigator.clipboard.writeText(email);
      btn.textContent = '✓ Copied!';
      btn.style.color = 'var(--accent)';
    } catch {
      btn.textContent = 'Failed';
    }
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.style.color = '';
    }, 2500);
  });
})();

/* ============================================================
   11. Dynamic Footer Year
   ============================================================ */

(function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = `© ${new Date().getFullYear()}`;
})();

/* ============================================================
   12. HTML Escape Utility (used in modal renderer)
   ============================================================ */

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
