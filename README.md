# Fiona Alphonce — Professional Portfolio

A complete, polished personal portfolio website built with **HTML5, CSS3, and Vanilla JavaScript**, designed to be hosted on **GitHub Pages**.

---

## Purpose

This portfolio presents Fiona Alphonce as a professional in IT, software development, business analysis, data systems, and enterprise technology. It showcases technical skills, work experience, featured projects (including the WOTI Attendance Management System), certifications, CV, and contact information.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic) |
| Styles | CSS3 (custom properties, flexbox, grid, responsive) |
| Behaviour | Vanilla JavaScript (ES6+) |
| Hosting | GitHub Pages (static, no backend) |

No frameworks or build tools required. Works by simply opening `index.html`.

---

## Project Structure

```
Portfolio-/
├── index.html               # Main HTML file
├── css/
│   └── style.css            # All styles (CSS variables, responsive, dark/light mode)
├── js/
│   └── main.js              # All JavaScript features
├── assets/
│   ├── images/              # Profile photo, project screenshots, OG image
│   ├── icons/               # Custom icons (optional)
│   └── documents/           # CV/Resume PDF
└── README.md
```

---

## How to Customize Content

All placeholder text is clearly marked with square brackets, e.g.:

- `[YOUR FULL NAME]`
- `[YOUR EMAIL]`
- `[YOUR LINKEDIN URL]`
- `[YOUR GITHUB URL]`
- `[YOUR LOCATION]`
- `[YOUR-NAME]-CV.pdf`

Open `index.html` and search for `[` to find every placeholder requiring your personal data.

---

## How to Add Projects

1. Open `index.html` and find the `#projects-grid` section.
2. Copy an existing `<article class="project-card ...">` block.
3. Update: `data-category`, title, description, technologies, and button `data-project` value.
4. Open `js/main.js` and add a matching entry to the `projectData` object at the top of Section 8.

---

## How to Replace the CV

1. Export your CV as a PDF.
2. Rename it to match the filename used in `index.html`, e.g. `Fiona-Alphonce-CV.pdf`.
3. Place the file in `assets/documents/`.
4. Both the Download CV and View CV buttons will work automatically.

---

## How to Replace the Profile Image

1. Prepare a square profile photo (recommended: 400×400 px or larger).
2. Save it to `assets/images/profile.jpg` (or `.png`, `.webp`).
3. In `index.html`, find the `.profile-placeholder` div and replace the inner `<span>` with:

```html
<img src="assets/images/profile.jpg" alt="Fiona Alphonce" />
```

4. Update the CSS in `css/style.css` to adjust the `.profile-placeholder` styles as needed (e.g., remove padding, add `object-fit: cover`).

---

## Features

- **Dark / Light mode** with `localStorage` persistence
- **Mobile hamburger menu** (fully accessible)
- **Smooth scrolling** and **active nav highlighting**
- **Scroll reveal animations** (respects `prefers-reduced-motion`)
- **Typing / rotating hero headline**
- **Project category filtering** (All, Web, Backend, Data, Business Analysis, Systems)
- **Project detail modal** with full project breakdown
- **Back-to-top FAB**
- **Copy email to clipboard**
- **Dynamic copyright year**
- **Contact form** (structured for Formspree; uses `mailto:` fallback)
- **SEO metadata** and **Open Graph tags**

---

## GitHub Pages Deployment

### Quick Deploy

1. Push the repository to GitHub (the default branch, typically `main`).
2. Go to **Settings → Pages**.
3. Under **Source**, select **Deploy from a branch**.
4. Select `main` branch and `/ (root)` folder.
5. Click **Save**.
6. Your portfolio will be live at `https://<your-username>.github.io/<repo-name>/`.

### Custom Domain (optional)

1. Add a `CNAME` file in the repo root containing your domain, e.g. `fionaalphonce.dev`.
2. Configure your DNS provider with a CNAME record pointing to `<your-username>.github.io`.

---

## Connect Formspree (Optional)

The contact form is pre-structured for Formspree integration:

1. Create a free account at [formspree.io](https://formspree.io).
2. Create a new form and copy the endpoint URL (e.g. `https://formspree.io/f/abcdefgh`).
3. In `index.html`, find the `<form class="contact-form"` tag.
4. Replace `action="mailto:[YOUR EMAIL]"` with `action="https://formspree.io/f/YOUR-ID"`.
5. Change `method="get"` to `method="post"`.

---

## License

This portfolio is for personal use. If you adapt it, please give credit.
