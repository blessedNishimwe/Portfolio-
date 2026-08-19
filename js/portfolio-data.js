/**
 * Default portfolio data — edit this file or use Edit Mode in the browser.
 * All content is driven from this object.
 */
const DEFAULT_PORTFOLIO_DATA = {
  personal: {
    name: "[YOUR FULL NAME]",
    headline: "IT Professional | Software Developer | Business Analyst",
    tagline: "Passionate about building robust systems, analysing complex business problems, and delivering data-driven solutions.",
    email: "[YOUR EMAIL]",
    linkedin: "[YOUR LINKEDIN URL]",
    github: "[YOUR GITHUB URL]",
    location: "[YOUR LOCATION]",
    phone: "[YOUR PHONE]",
    profileImage: null,
    cvFile: "assets/documents/CV.pdf"
  },
  about: {
    bio: "I am an IT professional with a strong background in software development, business analysis, and enterprise systems. I enjoy bridging the gap between technical teams and business stakeholders, designing scalable solutions, and turning data into meaningful insights. My work spans backend development, database design, requirements engineering, and digital transformation initiatives.",
    highlights: ["IT Professional", "Software Developer", "Business Analyst", "Data & Enterprise Systems"]
  },
  experience: [
    {
      id: "exp1",
      title: "[Job Title]",
      organization: "[Organization]",
      startDate: "[Start Date]",
      endDate: "[End Date or Present]",
      location: "[Location]",
      responsibilities: [
        "[Responsibility 1]",
        "[Responsibility 2]",
        "[Responsibility 3]"
      ],
      technologies: ["[Tech 1]", "[Tech 2]"]
    }
  ],
  skills: {
    "Programming": ["Python", "JavaScript", "Java", "SQL"],
    "Backend & APIs": ["Node.js", "Express.js", "REST APIs"],
    "Databases": ["PostgreSQL", "PostGIS", "SQL Server"],
    "Business Analysis": ["BRD", "SRS", "Requirements Gathering", "UAT", "Business Process Modelling"],
    "DevOps & Tools": ["Git", "GitHub", "Docker", "CI/CD", "Nginx", "VS Code", "Postman"],
    "Data & Enterprise Systems": ["Data Analysis", "DHIS2", "Reporting", "Enterprise Systems"]
  },
  projects: [
    {
      id: "woti",
      featured: true,
      title: "WOTI Attendance Management System",
      category: "Backend",
      description: "GPS/geofencing-based attendance management platform for enterprise workforce tracking.",
      problem: "[Describe the problem this system was built to solve]",
      solution: "[Describe your solution and approach]",
      role: "[Your role on this project]",
      technologies: ["Node.js", "Express.js", "PostgreSQL", "PostGIS", "Docker", "Nginx", "GitHub Actions"],
      features: [
        "GPS Attendance & Geofencing",
        "Clock In / Clock Out",
        "Employee Management",
        "Facility Hierarchy",
        "Monthly Timesheets",
        "Reporting & Analytics",
        "Admin Dashboard",
        "Role-based Access Control",
        "Audit Logging",
        "Import / Export"
      ],
      github: "[GITHUB REPO URL]",
      demo: "[LIVE DEMO URL]",
      image: null
    },
    {
      id: "project2",
      featured: false,
      title: "[Project Title]",
      category: "Web",
      description: "[Project description]",
      problem: "[Problem statement]",
      solution: "[Solution description]",
      role: "[Your role]",
      technologies: ["HTML", "CSS", "JavaScript"],
      features: ["[Feature 1]", "[Feature 2]"],
      github: "[GITHUB REPO URL]",
      demo: "[LIVE DEMO URL]",
      image: null
    }
  ],
  certifications: [
    {
      id: "cert1",
      name: "[Certification Name]",
      issuer: "[Issuing Organization]",
      date: "[Date]",
      credentialId: "[Credential ID]",
      credentialUrl: "[Credential URL]",
      image: null
    }
  ],
  cv: {
    summary: "[Your professional summary — a concise paragraph describing your expertise, experience areas, and career goals.]",
    education: [
      {
        id: "edu1",
        degree: "[Degree Name]",
        institution: "[Institution Name]",
        year: "[Year]",
        details: "[Any additional details]"
      }
    ]
  }
};
