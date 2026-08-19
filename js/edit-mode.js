/* =========================================================
   edit-mode.js — Frontend Edit Mode / Admin Panel
   ========================================================= */

const EDIT_PIN_KEY = 'portfolio-edit-pin';
const DEFAULT_PIN_HASH = btoa('1234');

/* ---- Public API ---- */
function initEditMode() {
  ensurePinExists();
  bindEditToggleBtn();
}

/* ---- PIN management ---- */
function ensurePinExists() {
  if (!localStorage.getItem(EDIT_PIN_KEY)) {
    localStorage.setItem(EDIT_PIN_KEY, DEFAULT_PIN_HASH);
  }
}

function verifyPin(pin) {
  return btoa(pin) === localStorage.getItem(EDIT_PIN_KEY);
}

function changePin(newPin) {
  localStorage.setItem(EDIT_PIN_KEY, btoa(newPin));
}

/* ---- Edit toggle button ---- */
function bindEditToggleBtn() {
  const btn = document.getElementById('edit-toggle-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (document.body.classList.contains('edit-mode-active')) {
      exitEditMode();
    } else {
      showPinModal(() => activateEditMode());
    }
  });
}

/* ---- PIN Modal ---- */
function showPinModal(onSuccess, title = 'Enter Edit PIN', sub = 'Default PIN is 1234') {
  removePinModal();
  const overlay = document.createElement('div');
  overlay.className = 'pin-modal-overlay';
  overlay.id = 'pin-modal-overlay';
  overlay.innerHTML = `
    <div class="pin-modal" role="dialog" aria-modal="true" aria-label="${escHtml(title)}">
      <div class="pin-modal-icon">🔐</div>
      <div class="pin-modal-title">${escHtml(title)}</div>
      <div class="pin-modal-sub">${escHtml(sub)}</div>
      <input type="password" class="pin-input" id="pin-input" maxlength="8" placeholder="••••" autocomplete="off" inputmode="numeric">
      <div class="pin-error-msg" id="pin-error"></div>
      <div class="pin-modal-actions">
        <button class="pin-cancel-btn">Cancel</button>
        <button class="pin-confirm-btn">Unlock</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#pin-input');
  const errorEl = overlay.querySelector('#pin-error');

  setTimeout(() => input.focus(), 50);

  overlay.querySelector('.pin-cancel-btn').addEventListener('click', () => removePinModal());
  overlay.querySelector('.pin-confirm-btn').addEventListener('click', confirmPin);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmPin(); });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) removePinModal(); });

  function confirmPin() {
    const val = input.value;
    if (verifyPin(val)) {
      removePinModal();
      onSuccess();
    } else {
      input.classList.add('error');
      errorEl.textContent = 'Incorrect PIN. Try again.';
      input.value = '';
      setTimeout(() => input.classList.remove('error'), 400);
    }
  }
}

function removePinModal() {
  const overlay = document.getElementById('pin-modal-overlay');
  if (overlay) overlay.remove();
}

/* ---- Activate / Deactivate Edit Mode ---- */
function activateEditMode() {
  document.body.classList.add('edit-mode-active');
  document.getElementById('edit-toggle-btn')?.classList.add('active');
  showEditToolbar();
  refreshEditMode();
  showToast('Edit mode activated. Click any text to edit.', '');
}

function exitEditMode() {
  document.body.classList.remove('edit-mode-active');
  document.getElementById('edit-toggle-btn')?.classList.remove('active');
  hideEditToolbar();
  renderAll(portfolioData);
  initReveal();
  showToast('Edit mode exited.', '');
}

/* ---- Toolbar ---- */
function showEditToolbar() {
  let toolbar = document.getElementById('edit-toolbar');
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.id = 'edit-toolbar';
    toolbar.className = 'edit-toolbar';
    toolbar.innerHTML = `
      <div class="edit-toolbar-left">
        <span class="edit-badge"><span class="edit-badge-dot"></span> Editing Mode Active</span>
      </div>
      <div class="edit-toolbar-right">
        <button class="toolbar-btn toolbar-btn-save" id="tb-save" title="Save all changes to localStorage">💾 Save All</button>
        <button class="toolbar-btn toolbar-btn-export" id="tb-export" title="Export portfolio data as JSON">📤 Export JSON</button>
        <button class="toolbar-btn toolbar-btn-import" id="tb-import" title="Import portfolio data from JSON">📥 Import JSON</button>
        <button class="toolbar-btn toolbar-btn-pin" id="tb-pin" title="Change PIN">🔑 Change PIN</button>
        <button class="toolbar-btn toolbar-btn-reset" id="tb-reset" title="Reset to default placeholder data">↺ Reset</button>
        <button class="toolbar-btn toolbar-btn-exit" id="tb-exit" title="Exit edit mode">✕ Exit</button>
      </div>
    `;
    document.body.prepend(toolbar);
  }
  toolbar.classList.add('open');

  document.getElementById('tb-save').addEventListener('click', handleSaveAll);
  document.getElementById('tb-export').addEventListener('click', handleExport);
  document.getElementById('tb-import').addEventListener('click', handleImport);
  document.getElementById('tb-pin').addEventListener('click', handleChangePin);
  document.getElementById('tb-reset').addEventListener('click', handleReset);
  document.getElementById('tb-exit').addEventListener('click', exitEditMode);
}

function hideEditToolbar() {
  const toolbar = document.getElementById('edit-toolbar');
  if (toolbar) toolbar.classList.remove('open');
}

function markUnsaved() {
  const btn = document.getElementById('tb-save');
  if (btn) btn.classList.add('unsaved');
}

function clearUnsaved() {
  const btn = document.getElementById('tb-save');
  if (btn) btn.classList.remove('unsaved');
}

/* ---- Debounced auto-save ---- */
let autoSaveTimer = null;
function scheduleAutoSave() {
  markUnsaved();
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    saveData();
    clearUnsaved();
  }, 2000);
}

/* ---- Toolbar Actions ---- */
function handleSaveAll() {
  saveData();
  clearUnsaved();
  showToast('All changes saved!', 'success');
}

function handleExport() {
  const blob = new Blob([JSON.stringify(portfolioData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'portfolio-data.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('portfolio-data.json exported!', 'success');
}

function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.personal || !parsed.about) throw new Error('Invalid structure');
        if (!confirm('This will replace all current content with the imported data. Continue?')) return;
        portfolioData = parsed;
        saveData();
        renderAll(portfolioData);
        refreshEditMode();
        initReveal();
        showToast('Portfolio data imported successfully!', 'success');
      } catch (err) {
        showToast('Invalid JSON file. Import failed.', 'error');
      }
    };
    reader.readAsText(file);
  });
  input.click();
}

function handleReset() {
  if (!confirm('Reset all content to default placeholders? This cannot be undone.')) return;
  portfolioData = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
  saveData();
  renderAll(portfolioData);
  refreshEditMode();
  initReveal();
  showToast('Reset to default content.', '');
}

function handleChangePin() {
  showPinModal(() => {
    const newPin = prompt('Enter new PIN (numbers only, min 4 digits):');
    if (!newPin || newPin.length < 4) { showToast('PIN must be at least 4 digits.', 'error'); return; }
    changePin(newPin);
    showToast('PIN changed successfully.', 'success');
  }, 'Confirm Current PIN', 'Enter your current PIN to change it');
}

/* ---- Refresh Edit Mode (after render) ---- */
function refreshEditMode() {
  if (!document.body.classList.contains('edit-mode-active')) return;

  // Add edit overlay to photo
  const photo = document.getElementById('hero-photo');
  if (photo && !photo.querySelector('.photo-edit-overlay')) {
    photo.insertAdjacentHTML('beforeend', `<div class="photo-edit-overlay"><span class="icon">📷</span><span>Change Photo</span></div>`);
  }
  if (photo) {
    photo.onclick = null;
    photo.addEventListener('click', handlePhotoEdit, { once: true });
  }

  // show CV file edit
  showCvFileEdit();

  // Bind editable fields
  document.querySelectorAll('[data-editable]').forEach(el => {
    el.addEventListener('click', handleInlineEdit, { once: true });
  });

  // Add "Add item" buttons for each section
  addSectionControls();
}

/* ---- Photo Edit ---- */
function handlePhotoEdit() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const canvas = document.createElement('canvas');
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const MAX = 400;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
        else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        portfolioData.personal.profileImage = base64;
        scheduleAutoSave();
        renderHero(portfolioData);
        refreshEditMode();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
  input.click();
}

/* ---- CV File Edit ---- */
function showCvFileEdit() {
  const cvActionsCard = document.querySelector('.cv-actions-card');
  if (!cvActionsCard || cvActionsCard.querySelector('.cv-file-edit')) return;
  const wrap = document.createElement('div');
  wrap.className = 'cv-file-edit';
  wrap.innerHTML = `
    <label>CV File Path / URL</label>
    <div class="cv-file-row">
      <input type="text" class="cv-path-input" id="cv-path-input" value="${escHtml(portfolioData.personal.cvFile || '')}" placeholder="assets/documents/CV.pdf or URL">
    </div>
  `;
  cvActionsCard.appendChild(wrap);
  document.getElementById('cv-path-input')?.addEventListener('change', (e) => {
    portfolioData.personal.cvFile = e.target.value.trim();
    scheduleAutoSave();
    const dl = document.getElementById('cv-download-btn');
    const vw = document.getElementById('cv-view-btn');
    if (dl) dl.href = portfolioData.personal.cvFile;
    if (vw) vw.href = portfolioData.personal.cvFile;
  });
}

/* ---- Inline Edit ---- */
function handleInlineEdit(e) {
  const el = e.currentTarget;
  const field = el.dataset.field;
  if (!field) return;

  const originalText = el.textContent.trim();
  const isMultiline = originalText.length > 80 || field.includes('description') || field.includes('bio') || field.includes('summary') || field.includes('responsibilities') || field.includes('problem') || field.includes('solution');

  const editor = document.createElement(isMultiline ? 'textarea' : 'input');
  editor.className = 'inline-editor';
  editor.value = originalText;
  el.innerHTML = '';
  el.appendChild(editor);
  editor.focus();
  if (editor.tagName === 'INPUT') editor.select();

  function commit() {
    const newVal = editor.value.trim() || originalText;
    setNestedValue(portfolioData, field, newVal);
    el.textContent = newVal;
    scheduleAutoSave();
    // Re-bind editable click for next time
    el.addEventListener('click', handleInlineEdit, { once: true });
  }

  editor.addEventListener('blur', commit);
  editor.addEventListener('keydown', (ev) => {
    if (!isMultiline && ev.key === 'Enter') { ev.preventDefault(); editor.blur(); }
    if (ev.key === 'Escape') { el.textContent = originalText; el.addEventListener('click', handleInlineEdit, { once: true }); }
  });
}

/* ---- Deep field setter ---- */
function setNestedValue(obj, path, value) {
  // path examples: "personal.name", "experience[0].title", "cv.education[1].degree"
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur == null) return;
    cur = cur[parts[i]];
  }
  if (cur != null) cur[parts[parts.length - 1]] = value;
}

/* ---- Section Controls (Add/Delete) ---- */
function addSectionControls() {
  // Experience
  addSectionAddBtn('experience-list', 'experience', addExperience);
  addDeleteBtns('experience-list', '[data-exp-id]', deleteExperienceById);

  // Skills
  addSkillControls();

  // Projects
  addSectionAddBtn('projects-grid', 'projects', addProject);
  addDeleteBtns('projects-grid', '[data-project-id]', deleteProjectById);

  // Certifications
  addSectionAddBtn('certs-grid', 'certifications', addCertification);
  addDeleteBtns('certs-grid', '[data-cert-id]', deleteCertById);

  // CV Education
  addSectionAddBtn('edu-list', 'cv-education', addEducation);
  addDeleteBtns('edu-list', '[data-edu-id]', deleteEducationById);
}

function addSectionAddBtn(containerId, section, handler) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (container.parentElement.querySelector(`.add-item-btn[data-section="${section}"]`)) return;
  const btn = document.createElement('button');
  btn.className = 'add-item-btn';
  btn.dataset.section = section;
  btn.innerHTML = `+ Add ${section === 'cv-education' ? 'Education' : section.charAt(0).toUpperCase() + section.slice(1, -1)}`;
  btn.addEventListener('click', handler);
  container.parentElement.appendChild(btn);
}

function addDeleteBtns(containerId, selector, handler) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll(selector).forEach(item => {
    if (item.querySelector('.delete-item-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'delete-item-btn';
    btn.innerHTML = '✕';
    btn.title = 'Delete this item';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Delete this item?')) handler(item);
    });
    item.appendChild(btn);
  });
}

/* ---- Add helpers ---- */
function uid() { return 'id_' + Math.random().toString(36).slice(2, 9); }

function addExperience() {
  portfolioData.experience.push({
    id: uid(), title: "New Job Title", organization: "Organization", startDate: "Month Year",
    endDate: "Present", location: "Location", responsibilities: ["Responsibility 1"], technologies: ["Tech"]
  });
  scheduleAutoSave();
  renderExperience(portfolioData);
  refreshEditMode();
}

function deleteExperienceById(item) {
  const id = item.dataset.expId;
  portfolioData.experience = portfolioData.experience.filter(e => e.id !== id);
  scheduleAutoSave();
  renderExperience(portfolioData);
  refreshEditMode();
}

function addProject() {
  portfolioData.projects.push({
    id: uid(), featured: false, title: "New Project", category: "Web",
    description: "Project description.", problem: "", solution: "", role: "",
    technologies: ["Tech"], features: ["Feature"], github: "", demo: "", image: null
  });
  scheduleAutoSave();
  renderProjects(portfolioData);
  refreshEditMode();
}

function deleteProjectById(item) {
  const id = item.dataset.projectId;
  portfolioData.projects = portfolioData.projects.filter(p => p.id !== id);
  scheduleAutoSave();
  renderProjects(portfolioData);
  refreshEditMode();
}

function addCertification() {
  portfolioData.certifications.push({
    id: uid(), name: "Certification Name", issuer: "Issuer", date: "Year", credentialId: "", credentialUrl: "", image: null
  });
  scheduleAutoSave();
  renderCertifications(portfolioData);
  refreshEditMode();
}

function deleteCertById(item) {
  const id = item.dataset.certId;
  portfolioData.certifications = portfolioData.certifications.filter(c => c.id !== id);
  scheduleAutoSave();
  renderCertifications(portfolioData);
  refreshEditMode();
}

function addEducation() {
  if (!portfolioData.cv.education) portfolioData.cv.education = [];
  portfolioData.cv.education.push({
    id: uid(), degree: "Degree Name", institution: "Institution", year: "Year", details: ""
  });
  scheduleAutoSave();
  renderCV(portfolioData);
  refreshEditMode();
}

function deleteEducationById(item) {
  const id = item.dataset.eduId;
  portfolioData.cv.education = portfolioData.cv.education.filter(e => e.id !== id);
  scheduleAutoSave();
  renderCV(portfolioData);
  refreshEditMode();
}

/* ---- Skill Controls ---- */
function addSkillControls() {
  const container = document.getElementById('skills-container');
  if (!container) return;

  // per-category: add skill tag + delete category
  container.querySelectorAll('.skill-category').forEach(catEl => {
    const cat = catEl.dataset.cat;
    const tagsEl = catEl.querySelector('.skill-tags');
    if (!tagsEl) return;

    // wrap each tag for delete
    tagsEl.querySelectorAll('.skill-tag').forEach(tag => {
      if (tag.parentElement.classList.contains('skill-tag-edit-wrap')) return;
      const tagName = tag.dataset.tag;
      const wrap = document.createElement('span');
      wrap.className = 'skill-tag-edit-wrap';
      tag.replaceWith(wrap);
      wrap.appendChild(tag);
      const del = document.createElement('button');
      del.className = 'delete-item-btn';
      del.innerHTML = '✕';
      del.title = 'Remove skill';
      del.addEventListener('click', () => {
        if (!confirm(`Remove "${tagName}"?`)) return;
        portfolioData.skills[cat] = portfolioData.skills[cat].filter(s => s !== tagName);
        scheduleAutoSave();
        renderSkills(portfolioData);
        addSkillControls();
      });
      wrap.appendChild(del);
    });

    // add-skill input if not already there
    if (tagsEl.querySelector('.add-skill-input')) return;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'add-skill-input';
    input.placeholder = '+ add skill';
    input.title = 'Type skill name and press Enter';
    tagsEl.appendChild(input);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value.trim();
        if (!val) return;
        if (!portfolioData.skills[cat]) portfolioData.skills[cat] = [];
        portfolioData.skills[cat].push(val);
        scheduleAutoSave();
        renderSkills(portfolioData);
        addSkillControls();
        input.value = '';
      }
    });
  });

  // add category button
  if (!document.getElementById('add-skill-cat-btn')) {
    const grid = document.getElementById('skills-container');
    const btn = document.createElement('button');
    btn.id = 'add-skill-cat-btn';
    btn.className = 'add-item-btn';
    btn.dataset.section = 'skills';
    btn.innerHTML = '+ Add Skill Category';
    btn.addEventListener('click', () => {
      const name = prompt('Category name:');
      if (!name || !name.trim()) return;
      portfolioData.skills[name.trim()] = [];
      scheduleAutoSave();
      renderSkills(portfolioData);
      addSkillControls();
    });
    grid.parentElement.appendChild(btn);
  }

  // delete category buttons
  container.querySelectorAll('.skill-category').forEach(catEl => {
    if (catEl.querySelector('.delete-cat-btn')) return;
    const cat = catEl.dataset.cat;
    const btn = document.createElement('button');
    btn.className = 'delete-item-btn delete-cat-btn';
    btn.innerHTML = '✕';
    btn.title = 'Delete category';
    btn.style.marginLeft = 'auto';
    btn.addEventListener('click', () => {
      if (!confirm(`Delete category "${cat}"?`)) return;
      delete portfolioData.skills[cat];
      scheduleAutoSave();
      renderSkills(portfolioData);
      addSkillControls();
    });
    const titleEl = catEl.querySelector('.skill-cat-title');
    if (titleEl) titleEl.appendChild(btn);
  });
}
