/* =========================================================
   main.js — Portfolio rendering, navigation, animations
   ========================================================= */

/* ---- Theme ---- */
(function initTheme() {
  const saved = localStorage.getItem('portfolio-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();

/* ---- Data Loading ---- */
let portfolioData;

function loadData() {
  try {
    const saved = localStorage.getItem('portfolioData');
    if (saved) {
      portfolioData = JSON.parse(saved);
    } else {
      portfolioData = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
    }
  } catch (e) {
    portfolioData = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
  }
}

function saveData() {
  localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
}

/* ---- Render Functions ---- */
function renderAll(data) {
  renderNavBrand(data);
  renderHero(data);
  renderAbout(data);
  renderExperience(data);
  renderSkills(data);
  renderProjects(data);
  renderCertifications(data);
  renderCV(data);
  renderContact(data);
  renderFooter(data);
}

function renderNavBrand(data) {
  const el = document.getElementById('nav-brand-name');
  if (el) el.textContent = data.personal.name;
}

function renderHero(data) {
  const p = data.personal;
  setText('hero-name', p.name);
  setText('hero-headline', p.headline);
  setText('hero-tagline', p.tagline);

  const photo = document.getElementById('hero-photo');
  if (photo) {
    if (p.profileImage) {
      photo.innerHTML = `<img src="${p.profileImage}" alt="Profile photo of ${escHtml(p.name)}">`;
    } else {
      photo.innerHTML = `<div class="hero-photo-placeholder"><span class="icon">👤</span><span class="label">Click to add photo</span></div>`;
    }
    // add edit overlay if edit mode active
    if (document.body.classList.contains('edit-mode-active')) {
      photo.insertAdjacentHTML('beforeend', `<div class="photo-edit-overlay"><span class="icon">📷</span><span>Change Photo</span></div>`);
    }
  }

  const cvBtn = document.getElementById('hero-cv-btn');
  if (cvBtn) cvBtn.href = p.cvFile || '#';

  const emailBtn = document.getElementById('hero-email-btn');
  if (emailBtn) emailBtn.href = `mailto:${p.email}`;

  const ghBtn = document.getElementById('hero-github-btn');
  if (ghBtn) ghBtn.href = p.github || '#';
}

function renderAbout(data) {
  setText('about-bio', data.about.bio);

  const highlightsEl = document.getElementById('about-highlights');
  if (highlightsEl) {
    highlightsEl.innerHTML = data.about.highlights.map(h =>
      `<span class="highlight-chip" data-type="highlight" data-value="${escHtml(h)}">${escHtml(h)}</span>`
    ).join('');
  }
}

function renderExperience(data) {
  const container = document.getElementById('experience-list');
  if (!container) return;
  if (!data.experience || data.experience.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);text-align:center">No experience entries yet.</p>';
    return;
  }
  container.innerHTML = data.experience.map((exp, i) => `
    <div class="timeline-item reveal edit-item-wrap" data-exp-id="${escHtml(exp.id)}">
      <div class="timeline-dot"></div>
      <div class="timeline-card">
        <div class="exp-header">
          <span class="exp-title" data-editable data-field="experience[${i}].title">${escHtml(exp.title)}</span>
          <span class="exp-dates">${escHtml(exp.startDate)} — ${escHtml(exp.endDate)}</span>
        </div>
        <div class="exp-org" data-editable data-field="experience[${i}].organization">${escHtml(exp.organization)}</div>
        <div class="exp-location" data-editable data-field="experience[${i}].location">📍 ${escHtml(exp.location)}</div>
        <ul class="exp-responsibilities">
          ${exp.responsibilities.map((r, ri) => `<li data-editable data-field="experience[${i}].responsibilities[${ri}]">${escHtml(r)}</li>`).join('')}
        </ul>
        <div class="exp-tech">
          ${exp.technologies.map(t => `<span class="tech-tag">${escHtml(t)}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

function renderSkills(data) {
  const container = document.getElementById('skills-container');
  if (!container) return;
  const cats = data.skills;
  container.innerHTML = Object.entries(cats).map(([cat, tags]) => `
    <div class="skill-category reveal edit-item-wrap" data-cat="${escHtml(cat)}">
      <div class="skill-cat-title">⚡ <span data-editable data-field="skill-cat" data-cat="${escHtml(cat)}">${escHtml(cat)}</span></div>
      <div class="skill-tags" data-cat-tags="${escHtml(cat)}">
        ${tags.map(t => `<span class="skill-tag" data-editable data-field="skill-tag" data-cat="${escHtml(cat)}" data-tag="${escHtml(t)}">${escHtml(t)}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

function renderProjects(data) {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  const categories = ['All', ...new Set(data.projects.map(p => p.category))];
  const filtersEl = document.getElementById('project-filters');
  if (filtersEl) {
    const active = filtersEl.querySelector('.filter-btn.active')?.dataset.filter || 'All';
    filtersEl.innerHTML = categories.map(c =>
      `<button class="filter-btn${c === active ? ' active' : ''}" data-filter="${escHtml(c)}">${escHtml(c)}</button>`
    ).join('');
    filtersEl.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterProjects(btn.dataset.filter);
      });
    });
  }

  container.innerHTML = data.projects.map((proj, i) => `
    <div class="project-card${proj.featured ? ' featured' : ''} reveal edit-item-wrap" data-project-id="${escHtml(proj.id)}" data-category="${escHtml(proj.category)}">
      <div class="project-image">
        ${proj.image ? `<img src="${proj.image}" alt="${escHtml(proj.title)}">` : `<span class="project-image-placeholder">🖥️</span>`}
        ${proj.featured ? `<span class="featured-badge">⭐ Featured</span>` : ''}
      </div>
      <div class="project-body">
        <div class="project-category" data-editable data-field="projects[${i}].category">${escHtml(proj.category)}</div>
        <div class="project-title" data-editable data-field="projects[${i}].title">${escHtml(proj.title)}</div>
        <div class="project-desc" data-editable data-field="projects[${i}].description">${escHtml(proj.description)}</div>
        <div class="project-tech">
          ${proj.technologies.map(t => `<span class="tech-tag">${escHtml(t)}</span>`).join('')}
        </div>
        <div class="project-actions">
          <button class="btn btn-primary" onclick="openProjectModal('${escHtml(proj.id)}')">View Details</button>
          ${proj.github ? `<a href="${escHtml(proj.github)}" target="_blank" rel="noopener" class="btn btn-outline">GitHub</a>` : ''}
          ${proj.demo ? `<a href="${escHtml(proj.demo)}" target="_blank" rel="noopener" class="btn btn-outline">Live Demo</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function filterProjects(cat) {
  const cards = document.querySelectorAll('#projects-grid .project-card');
  cards.forEach(card => {
    card.style.display = (cat === 'All' || card.dataset.category === cat) ? '' : 'none';
  });
}

function renderCertifications(data) {
  const container = document.getElementById('certs-grid');
  if (!container) return;
  if (!data.certifications || data.certifications.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);text-align:center">No certifications yet.</p>';
    return;
  }
  container.innerHTML = data.certifications.map((cert, i) => `
    <div class="cert-card reveal edit-item-wrap" data-cert-id="${escHtml(cert.id)}">
      <div class="cert-image">
        ${cert.image ? `<img src="${cert.image}" alt="${escHtml(cert.name)}">` : `🏆`}
      </div>
      <div class="cert-name" data-editable data-field="certifications[${i}].name">${escHtml(cert.name)}</div>
      <div class="cert-issuer" data-editable data-field="certifications[${i}].issuer">${escHtml(cert.issuer)}</div>
      <div class="cert-date" data-editable data-field="certifications[${i}].date">${escHtml(cert.date)}</div>
      ${cert.credentialId ? `<div class="cert-id" data-editable data-field="certifications[${i}].credentialId">ID: ${escHtml(cert.credentialId)}</div>` : ''}
      ${cert.credentialUrl ? `<a href="${escHtml(cert.credentialUrl)}" target="_blank" rel="noopener" class="btn btn-ghost" style="font-size:0.8rem;padding:0.3rem 0.5rem">View Credential →</a>` : ''}
    </div>
  `).join('');
}

function renderCV(data) {
  setText('cv-summary', data.cv.summary);
  const eduList = document.getElementById('edu-list');
  if (eduList) {
    eduList.innerHTML = (data.cv.education || []).map((edu, i) => `
      <div class="edu-item reveal edit-item-wrap" data-edu-id="${escHtml(edu.id || 'edu' + i)}">
        <div class="edu-degree" data-editable data-field="cv.education[${i}].degree">${escHtml(edu.degree)}</div>
        <div class="edu-institution" data-editable data-field="cv.education[${i}].institution">${escHtml(edu.institution)}</div>
        <div class="edu-year" data-editable data-field="cv.education[${i}].year">${escHtml(edu.year)}</div>
        ${edu.details ? `<div class="edu-details" data-editable data-field="cv.education[${i}].details">${escHtml(edu.details)}</div>` : ''}
      </div>
    `).join('');
  }
  const cvDownloadBtn = document.getElementById('cv-download-btn');
  if (cvDownloadBtn) cvDownloadBtn.href = data.personal.cvFile || '#';
  const cvViewBtn = document.getElementById('cv-view-btn');
  if (cvViewBtn) cvViewBtn.href = data.personal.cvFile || '#';
}

function renderContact(data) {
  const p = data.personal;
  setHref('contact-email-link', `mailto:${p.email}`);
  setHref('contact-linkedin-link', p.linkedin);
  setHref('contact-github-link', p.github);
  setText('contact-email-val', p.email);
  setText('contact-linkedin-val', p.linkedin);
  setText('contact-github-val', p.github);
  setText('contact-location-val', p.location);
  setText('contact-phone-val', p.phone);
}

function renderFooter(data) {
  const p = data.personal;
  setText('footer-name', p.name);
  const ghLink = document.getElementById('footer-github-link');
  if (ghLink) ghLink.href = p.github || '#';
  const liLink = document.getElementById('footer-linkedin-link');
  if (liLink) liLink.href = p.linkedin || '#';
  const emLink = document.getElementById('footer-email-link');
  if (emLink) emLink.href = `mailto:${p.email}`;
}

/* ---- Project Modal ---- */
function openProjectModal(id) {
  const proj = portfolioData.projects.find(p => p.id === id);
  if (!proj) return;
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  document.getElementById('modal-title').textContent = proj.title;
  document.getElementById('modal-category').textContent = proj.category;
  document.getElementById('modal-description').textContent = proj.description;
  document.getElementById('modal-problem').textContent = proj.problem || '—';
  document.getElementById('modal-solution').textContent = proj.solution || '—';
  document.getElementById('modal-role').textContent = proj.role || '—';
  document.getElementById('modal-tech').innerHTML = (proj.technologies || []).map(t => `<span class="tech-tag">${escHtml(t)}</span>`).join('');
  document.getElementById('modal-features').innerHTML = (proj.features || []).map(f => `<div class="modal-feature">${escHtml(f)}</div>`).join('');

  const ghLink = document.getElementById('modal-github-link');
  if (ghLink) { ghLink.href = proj.github || '#'; ghLink.style.display = proj.github ? '' : 'none'; }
  const demoLink = document.getElementById('modal-demo-link');
  if (demoLink) { demoLink.href = proj.demo || '#'; demoLink.style.display = proj.demo ? '' : 'none'; }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ---- Helpers ---- */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || '';
}

function setHref(id, val) {
  const el = document.getElementById(id);
  if (el) el.href = val || '#';
}

function escHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function showToast(msg, type = '') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  requestAnimationFrame(() => { toast.classList.add('show'); });
  setTimeout(() => { toast.classList.remove('show'); }, 2600);
}

/* ---- Navigation ---- */
function initNav() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const themeToggle = document.getElementById('theme-toggle');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
    highlightNav();
  });

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('portfolio-theme', next);
      themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
    });
    themeToggle.textContent = (localStorage.getItem('portfolio-theme') === 'dark') ? '☀️' : '🌙';
  }
}

function highlightNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}

/* ---- Back to Top ---- */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---- Scroll Reveal ---- */
function initReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ---- Modal Close ---- */
function initModalClose() {
  const overlay = document.getElementById('project-modal');
  if (!overlay) return;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeProjectModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeProjectModal(); });
}

/* ---- Contact Form ---- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]')?.value;
    const email = form.querySelector('[name="email"]')?.value;
    const msg = form.querySelector('[name="message"]')?.value;
    const mailto = `mailto:${portfolioData.personal.email}?subject=Portfolio%20Contact%20from%20${encodeURIComponent(name)}&body=${encodeURIComponent(msg)}%0A%0AFrom%3A%20${encodeURIComponent(email)}`;
    window.location.href = mailto;
  });
}

/* ---- Footer Year ---- */
function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderAll(portfolioData);
  initNav();
  initBackToTop();
  initReveal();
  initModalClose();
  initContactForm();
  initFooterYear();
  if (typeof initEditMode === 'function') initEditMode();
});
