/**
 * contentLoader.js
 * Automatically intercepts page loads to merge admin edits from local storage
 * and dynamically renders customized projects, skills, certificates, and content.
 */

(function () {
  // --- DEFAULT DATA SEEDING ---
  const defaultProjects = [
    {
      id: "proj-1",
      title: "Digital Lesson Plan",
      description: "A sophisticated lesson-planning web application designed to empower teachers with efficient building, organization, and sharing tools for standards-aligned curricula.",
      link: "https://digital-lesson-plan.vercel.app/",
      linkText: "Launch Application",
      icon: "fa-solid fa-rocket",
      colorClass: "card-blue"
    },
    {
      id: "proj-2",
      title: "ICT Education Hub",
      description: "An influential YouTube channel dedicated to pedagogical digital transformation. Features expert tutorials and tutorials for seamless technology integration in modern classrooms.",
      link: "https://www.youtube.com/@TuyishimeHonore-qt9hd",
      linkText: "Explore Channel",
      icon: "fa-brands fa-youtube",
      colorClass: "card-red"
    },
    {
      id: "proj-3",
      title: "Marks Management System",
      description: "A web application that helps teachers generate report cards and other related reports after assessments.",
      link: "https://marksmanagmentsystem.vercel.app",
      linkText: "Launch Application",
      icon: "fa-solid fa-chart-line",
      colorClass: "card-green"
    }
  ];

  const defaultSkills = [
    {
      category: "Programming & Languages",
      items: ["HTML5", "CSS3", "JavaScript", "PHP", "Laravel", "MySQL", "jQuery", "Scratch", "Turtle Art"]
    },
    {
      category: "Educational Technology (EdTech)",
      items: ["Google Classroom", "Microsoft Teams", "GeoGebra", "Kahoot", "Quizlet", "Khan Academy", "EduPuzzle", "Flip Grid", "Plickers", "Mentimeter"]
    },
    {
      category: "Office Productivity",
      items: ["Microsoft Word", "Microsoft Excel", "Microsoft PowerPoint", "Microsoft Access", "Google Docs", "Google Sheets"]
    },
    {
      category: "Other Strengths",
      items: ["XO Laptop Programming", "AI Tools for Teaching", "Video Production", "Design (Certificates/Flyers)", "Printing & Projection", "Cattle & Livestock Keeping"]
    },
    {
      category: "Languages",
      items: ["English (Excellent)", "Kinyarwanda (Native)", "French (Good)"]
    }
  ];

  const defaultCertificates = [
    {
      id: "cert-1",
      title: "Curriculum Vitae",
      description: "My full, up-to-date professional CV detailing work experience, academic history, skills, languages, publications, and references.",
      file: "../docs/Document/Honore curriculum vitae.pdf",
      colorClass: "border-top: 4px solid var(--brand-orange);"
    },
    {
      id: "cert-2",
      title: "A2 Teaching Diploma",
      description: "A2 Diploma in Teaching (Science and Mathematics Education - SME) from TTC Matimba, certifying fundamental pedagogical and academic competence.",
      file: "../docs/Document/A2 TTC _SME_CERTIFICATE .pdf",
      colorClass: "border-top: 4px solid var(--accent-blue);"
    },
    {
      id: "cert-3",
      title: "PBC Christian Education",
      description: "Certificate of Completion for the 34-Course Theology Program from Promise Bible Centre with a 90% aggregate.",
      file: "../docs/Certicifacates/PBC _ HONORE CERTIFICATE CHRISTIAN EDUCATION .pdf",
      colorClass: "border-top: 4px solid var(--gold);"
    },
    {
      id: "cert-4",
      title: "PTRP Certificate",
      description: "Certificate of Completion for the Primary Teaching Residency Program (PTRP) at TTC De La Salle Byumba, focusing on ICT, methodologies, and English.",
      file: "../docs/Document/PTR P Certificate .pdf",
      colorClass: "border-top: 4px solid var(--green-medium);"
    },
    {
      id: "cert-5",
      title: "Microsoft Certified Educator",
      description: "Professional MCE certificate validating global technology literacy and capability to integrate ICT tools dynamically into the curriculum.",
      file: "../docs/Certicifacates/240102_RECRUITMENT_2311140955_26_001.pdf",
      colorClass: "border-top: 4px solid #4f46e5;"
    },
    {
      id: "cert-6",
      title: "IBM AI Literacy Credential",
      description: "SkillsBuild digital credential certificate validating foundation-level understanding, interaction, and ethical application of Artificial Intelligence.",
      file: "../docs/Certicifacates/Completion Certificate _ SkillsBuild_Accepting the AI Literacy Digital Credential.pdf",
      colorClass: "border-top: 4px solid #0f172a;"
    },
    {
      id: "cert-7",
      title: "AI Impact Policy & Other Certs",
      description: "Additional professional development training documents and certifications in modern AI impact, teaching, and prompt engineering.",
      file: "../docs/Certicifacates/260108_RECRUITMENT_2311140955_26_001.pdf",
      colorClass: "border-top: 4px solid #db2777;"
    },
    {
      id: "cert-8",
      title: "One Million Prompts",
      description: "Specialized AI Prompting certificate validating mastery in advanced prompt engineering and interactions.",
      file: "../docs/Certicifacates/260110_RECRUITMENT_2311140955_26_001.pdf",
      colorClass: "border-top: 4px solid #f97316;"
    }
  ];

  const defaultBlogs = [
    {
      id: "blog-1",
      title: "Transforming Education in Rwanda with ICT",
      content: "Information and Communication Technology (ICT) plays a critical role in standardizing education and lesson planning. My project, Digital Lesson Plan, helps 100+ teachers plan standard curricula. The goal is to transition all schools to collaborative digital platforms by 2030.",
      date: "2026-06-25",
      author: "Tuyishime Honore"
    },
    {
      id: "blog-2",
      title: "Promoting Biblical Discipleship in Local Communities",
      content: "Teaching the Word of God goes hand-in-hand with academic instruction. At Promise Bible Center (PBC), we focus on biblical hermeneutics, theology, and discipleship. Let us continue to serve with a heart of humility and Christ-centered worship.",
      date: "2026-06-28",
      author: "Tuyishime Honore"
    }
  ];

  const defaultMessages = [
    {
      id: "msg-12345",
      name: "Dr. Barnabas Muyengwa",
      email: "principal@rukaramodelschool.com",
      message: "Hi Honore, outstanding work on the Marks Management integration. Let's arrange a consultation on Wednesday.",
      created_at: "2026-06-29T10:30:00.000Z"
    },
    {
      id: "msg-12346",
      name: "Erick Iyamuremyi",
      email: "erick.dos@rukaramodel.com",
      message: "The teachers found the Digital Lesson Plan training very transformative. Thank you for the session!",
      created_at: "2026-06-29T12:45:00.000Z"
    }
  ];

  // Seed data if not already present
  if (!localStorage.getItem("admin_projects")) {
    localStorage.setItem("admin_projects", JSON.stringify(defaultProjects));
  }
  if (!localStorage.getItem("admin_skills")) {
    localStorage.setItem("admin_skills", JSON.stringify(defaultSkills));
  }
  if (!localStorage.getItem("admin_certificates")) {
    localStorage.setItem("admin_certificates", JSON.stringify(defaultCertificates));
  }
  if (!localStorage.getItem("admin_blogs")) {
    localStorage.setItem("admin_blogs", JSON.stringify(defaultBlogs));
  }
  if (!localStorage.getItem("admin_messages")) {
    localStorage.setItem("admin_messages", JSON.stringify(defaultMessages));
  }

  // --- MERGE DYNAMIC TRANSLATION OVERRIDES ---
  const mergeTranslations = () => {
    const translationsStr = localStorage.getItem("admin_translations");
    if (translationsStr && window.HONORE_TRANSLATIONS) {
      try {
        const customTranslations = JSON.parse(translationsStr);
        // Merge custom translations into existing ones
        if (customTranslations.en) {
          window.HONORE_TRANSLATIONS.en = {
            ...window.HONORE_TRANSLATIONS.en,
            ...customTranslations.en
          };
        }
        if (customTranslations.fr) {
          window.HONORE_TRANSLATIONS.fr = {
            ...window.HONORE_TRANSLATIONS.fr,
            ...customTranslations.fr
          };
        }
      } catch (err) {
        console.warn("Could not merge custom translations", err);
      }
    }
  };

  // Run translation merge prior to language rendering
  mergeTranslations();

  // --- DYNAMIC RENDERING CODE ---
  document.addEventListener("DOMContentLoaded", () => {
    // 1. Update Profile Image URL if overridden
    const customProfileImg = localStorage.getItem("admin_profile_image");
    if (customProfileImg) {
      // Find all profile/hero/avatar images on the page and update them
      const imgElements = document.querySelectorAll(
        "img[src*='WhatsApp'], .footer-logo-zoom, .ai-avatar"
      );
      imgElements.forEach((img) => {
        if (img.tagName === "IMG") {
          img.src = customProfileImg;
        } else {
          // For background images or div elements
          img.style.backgroundImage = `url('${customProfileImg}')`;
        }
      });
      // Specifcally check hero header on home page
      const heroHeader = document.querySelector("body.home header");
      if (heroHeader) {
        heroHeader.style.backgroundImage = `url('${customProfileImg}')`;
      }
    }

    // 2. Update CV links if overridden
    const customCVFile = localStorage.getItem("admin_cv_file");
    if (customCVFile) {
      const cvLinks = document.querySelectorAll("a[href*='curriculum vitae']");
      cvLinks.forEach((link) => {
        link.href = customCVFile;
      });
    }

    // 3. Render Custom Projects if available
    const pageName = window.location.pathname.split("/").pop() || "index.html";
    if (pageName === "projects.html" || pageName === "cv.html") {
      const projectsGrid = document.querySelector("main.container section .card-grid, .card-grid");
      if (projectsGrid) {
        // Retrieve projects from localStorage
        const projects = JSON.parse(localStorage.getItem("admin_projects") || "[]");
        if (projects.length > 0) {
          let html = "";
          projects.forEach((proj) => {
            html += `
              <div class="card ${proj.colorClass || 'card-blue'}" style="${proj.colorClass && proj.colorClass.startsWith('border') ? proj.colorClass : ''}">
                <h3>${proj.title}</h3>
                <p>${proj.description}</p>
                <div style="margin-top: 1.5rem;">
                  <a href="${proj.link}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                    <i class="${proj.icon || 'fa-solid fa-link'}"></i> 
                    <span>${proj.linkText || 'Launch Application'}</span>
                  </a>
                </div>
              </div>
            `;
          });
          // Only replace elements inside this specific project highlights card grid
          // Let's identify the projects grid on cv.html vs projects.html
          if (pageName === "projects.html") {
            projectsGrid.innerHTML = html;
          } else if (pageName === "cv.html") {
            // In cv.html there are multiple card grids. The projects highlights card grid is the 3rd one.
            // Let's find the section title 'Project Highlights'
            const projTitle = Array.from(document.querySelectorAll("h3")).find(h => h.textContent.includes("Project Highlights"));
            if (projTitle && projTitle.nextElementSibling) {
              projTitle.nextElementSibling.innerHTML = html;
            }
          }
        }
      }
    }

    // 4. Render Custom Skills if available
    if (pageName === "about.html" || pageName === "cv.html") {
      const skillsContainer = document.querySelector(".skills-group")?.parentNode;
      if (skillsContainer) {
        const skillsObj = JSON.parse(localStorage.getItem("admin_skills") || "[]");
        if (skillsObj.length > 0) {
          let html = "";
          skillsObj.forEach((group) => {
            html += `
              <div class="skills-group">
                <h4>${group.category}</h4>
                <div class="skills-pills">
                  ${group.items.map(skl => `<span class="skill-pill">${skl}</span>`).join("\n")}
                </div>
              </div>
            `;
          });
          
          if (pageName === "about.html") {
            // Find about.html technical expertise card
            const techCard = Array.from(document.querySelectorAll(".card h3")).find(h => h.textContent.includes("Technical Expertise"))?.parentNode;
            if (techCard) {
              techCard.innerHTML = `
                <h3><i class="fa-solid fa-code"></i> Technical Expertise</h3>
                <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;">
                  ${skillsObj.map(s => `
                    <p style="margin-bottom: 0.5rem; font-size: 0.95rem;">
                      <strong>${s.category}:</strong> ${s.items.join(", ")}
                    </p>
                  `).join("")}
                </div>
              `;
            }
          } else if (pageName === "cv.html") {
            // Technical card is inside the 2-column layout column 2 card
            const skillsCard = document.querySelector(".skills-group")?.closest(".card");
            if (skillsCard) {
              skillsCard.innerHTML = html;
            }
          }
        }
      }
    }

    // 5. Render Custom Certificates if available
    if (pageName === "cv.html") {
      const certsSectionTitle = Array.from(document.querySelectorAll("h3")).find(h => h.textContent.includes("Interactive Document Center"));
      if (certsSectionTitle) {
        const certsGrid = certsSectionTitle.nextElementSibling;
        if (certsGrid) {
          const certs = JSON.parse(localStorage.getItem("admin_certificates") || "[]");
          if (certs.length > 0) {
            let html = "";
            certs.forEach((cert) => {
              const fileType = cert.file && cert.file.toLowerCase().endsWith(".pdf") ? "PDF" : "Credential";
              const isLocalCV = cert.title === "Curriculum Vitae" || cert.title.includes("CV");
              const viewBtnText = isLocalCV ? "View CV" : "View Certificate";
              
              html += `
                <div class="card doc-card" style="${cert.colorClass || 'border-top: 4px solid var(--green-medium);'}">
                  <div>
                    <h3>${cert.title}</h3>
                    <p>${cert.description}</p>
                  </div>
                  <div class="doc-card-actions">
                    <a class="btn btn-view" href="${cert.file}" target="_blank" title="${cert.title}"><i class="fa-solid fa-eye"></i> <span>${viewBtnText}</span></a>
                    <a href="${cert.file}" download="${cert.title}.pdf" class="btn btn-download"><i class="fa-solid fa-download"></i> <span>Download</span></a>
                  </div>
                </div>
              `;
            });
            certsGrid.innerHTML = html;
          }
        }
      }
    }

    // Ensure translations reapply if any overrides were merged
    if (typeof applyTranslations === "function") {
      const savedLang = localStorage.getItem("honore-lang") || "en";
      applyTranslations(savedLang);
    }
  });
})();
