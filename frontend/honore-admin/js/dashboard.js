/**
 * dashboard.js
 * Comprehensive CMS Client-Side Logic for Honore's Admin Panel
 */

document.addEventListener("DOMContentLoaded", () => {
    // === AUTHENTICATION & INITIALIZATION ===
    const verifyAuth = () => {
        const isLoggedIn = sessionStorage.getItem("admin_logged_in") === "true" || 
                           localStorage.getItem("admin_logged_in") === "true";
        if (!isLoggedIn) {
            window.location.replace("index.html");
        }
    };
    verifyAuth();

    let currentUser = "Honore";
    // Setup initial defaults if absent
    const checkInit = (key, defaultVal) => {
        const currentVal = localStorage.getItem(key);
        if (!currentVal || currentVal === "[]" || currentVal === "{}" || currentVal === '{"name":"Honore","title":"Software Engineer","bio":"","intro":"","mission":"","vision":"","pic":"","cover":"","resBtn":"Download CV","socials":"{}"}') {
            localStorage.setItem(key, JSON.stringify(defaultVal));
        }
    };

    checkInit("admin_about", { name: "TUYISHIME Honore", title: "STEM Teacher & ICT Trainer", bio: "Dedicated educator with expertise in Computer Science, Physics, and ICT integration. Passionate about transforming education in Rwanda through innovative technology.", intro: "Teacher at Rukara Model School of Sciences and Mathematics, pursuing Bachelor's degree in Computer Science and Physics Education at ULK Gisenyi Campus.", mission: "Transform education in Rwanda through innovative technology integration, empowering both teachers and students with the digital skills needed for a brighter future.", vision: "A future where every Rwandan student has access to world-class digital education.", pic: "assets/images/WhatsApp%20Image%202026-05-29%20at%204.32.30%20PM.jpeg", cover: "assets/images/WhatsApp%20Image%202026-05-29%20at%204.32.30%20PM.jpeg", resBtn: "Download CV", socials: "{}" });
    checkInit("admin_roles", [
        { title: "STEM Teacher", org: "Rukara Model School of Sciences and Mathematics", icon: "fa-solid fa-chalkboard-user", status: "Active" },
        { title: "ICT Trainer", org: "PISQUARE (Partnership in ICT)", icon: "fa-solid fa-laptop-code", status: "Active" },
        { title: "Resident Teacher", org: "GS Gacurabwenge", icon: "fa-solid fa-school", status: "Completed" },
        { title: "Teaching Intern", org: "GS Kagitumba", icon: "fa-solid fa-person-chalkboard", status: "Completed" }
    ]);
    checkInit("admin_dev", [
        { name: "Web Development", icon: "fa-solid fa-code", desc: "HTML5, CSS3, JS, PHP, Laravel", cat: "Development", prof: "90", exp: "3 Years" },
        { name: "Educational Technology", icon: "fa-solid fa-laptop-code", desc: "GeoGebra, Kahoot, Google Classroom", cat: "EdTech", prof: "95", exp: "4 Years" },
        { name: "Content Creation", icon: "fa-solid fa-video", desc: "Video production, AI tools for teaching", cat: "Media", prof: "85", exp: "2 Years" }
    ]);
    checkInit("admin_edu", [
        { school: "Kigali Independent University (ULK)", qual: "B.Ed in Computer Science and Physics", start: "2024", end: "Present", desc: "Pursuing Bachelor's degree", loc: "Gisenyi Campus", status: "In Progress" },
        { school: "Promise Bible Centre", qual: "Christian Education Certificate", start: "2024", end: "2024", desc: "34-Course Theology Program with 90% aggregate", loc: "Rwanda", status: "Completed" },
        { school: "Africa Multination for Christ College", qual: "Professional Theological Dev.", start: "2024", end: "Present", desc: "Foundational Certificate in Discipleship", loc: "Rwanda", status: "In Progress" },
        { school: "TTC De La Salle", qual: "PTRP Certificate", start: "2023", end: "2024", desc: "Primary Teaching Residency Program", loc: "Byumba", status: "Completed" },
        { school: "TTC Matimba", qual: "A2 Diploma in Teaching (SME)", start: "2020", end: "2023", desc: "Advanced Level Secondary School", loc: "Rwanda", status: "Completed" }
    ]);
    checkInit("admin_projects", [
        { title: "Digital Lesson Plan", desc: "A web application to help educators structure, store, and share lesson plans.", tech: "HTML/CSS/JS", git: "", live: "https://digital-lesson-plan.vercel.app/", img: "", cat: "Web App", status: "Live", feat: true },
        { title: "ICT Education Hub", desc: "YouTube learning repository for teacher empowerment.", tech: "Video Production", git: "", live: "https://www.youtube.com/@TuyishimeHonore-qt9hd", img: "", cat: "Content Creation", status: "Live", feat: true },
        { title: "Marks Management System", desc: "Web app to generate report cards and assessments.", tech: "PHP/MySQL", git: "", live: "https://marksmanagmentsystem.vercel.app", img: "", cat: "Web App", status: "Live", feat: true }
    ]);
    checkInit("admin_cv", [
        { date: new Date().toISOString(), name: "Honore curriculum vitae.pdf", downloads: 120 }
    ]);
    checkInit("admin_ministry", [
        { date: new Date().toISOString(), title: "PBC PREACHING: HOMILETICS LESSON", cat: "Preaching", content: "Teaching Homiletics at Promise Bible Center", img: "", vid: "https://www.youtube.com/embed/9FSDNYlUieU", refs: "Matthew 28:19", status: "Published" },
        { date: new Date().toISOString(), title: "IMBARAGA ZA MWUKA WERA ZIZANWA NO GUTEGEREZA", cat: "Message", content: "Intumwa zategerereje mumurwa", img: "", vid: "https://www.youtube.com/embed/2NCixEXk3xw", refs: "Acts 1:8", status: "Published" }
    ]);
    checkInit("admin_contact", []);
    checkInit("admin_media", []);
    checkInit("admin_activity", []);
    checkInit("admin_history", []);
    checkInit("admin_settings", { name: "Honore Portfolio", favicon: "", color: "#10b981", desc: "", ga: "" });

    // === UTILS ===
    const getPlatformInfo = () => {
        const ua = navigator.userAgent;
        let browser = "Unknown";
        if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Chrome")) browser = "Chrome";
        else if (ua.includes("Safari")) browser = "Safari";
        
        let os = "Unknown";
        if (ua.includes("Win")) os = "Windows";
        else if (ua.includes("Mac")) os = "MacOS";
        else if (ua.includes("Linux")) os = "Linux";
        
        return `${browser} on ${os}`;
    };

    const formatDate = (isoString) => {
        if (!isoString) return "";
        try {
            const date = new Date(isoString);
            return date.toLocaleString();
        } catch (e) {
            return isoString;
        }
    };

    const escapeHTML = (str) => {
        if (typeof str !== 'string') return "";
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    };

    // === CORE LOGGING & HISTORY ===
    const logActivity = (actionDetail, targetDesc) => {
        const acts = JSON.parse(localStorage.getItem("admin_activity"));
        acts.unshift({
            time: new Date().toISOString(),
            user: currentUser,
            action: actionDetail,
            target: targetDesc,
            platform: getPlatformInfo()
        });
        if (acts.length > 200) acts.pop();
        localStorage.setItem("admin_activity", JSON.stringify(acts));
        renderActivity();
    };

    const logHistory = (section, oldValue, action) => {
        const hists = JSON.parse(localStorage.getItem("admin_history"));
        hists.unshift({
            date: new Date().toISOString(),
            section: section,
            oldVal: typeof oldValue === 'object' ? JSON.stringify(oldValue) : oldValue,
            action: action
        });
        if (hists.length > 200) hists.pop();
        localStorage.setItem("admin_history", JSON.stringify(hists));
        renderHistory();
    };

    // Update global dashboard stats
    const updateStats = () => {
        const counts = {
            projects: JSON.parse(localStorage.getItem("admin_projects")).length,
            roles: JSON.parse(localStorage.getItem("admin_roles")).length,
            dev: JSON.parse(localStorage.getItem("admin_dev")).length,
            edu: JSON.parse(localStorage.getItem("admin_edu")).length,
            cv: JSON.parse(localStorage.getItem("admin_cv")).length,
            ministry: JSON.parse(localStorage.getItem("admin_ministry")).length,
            contact: JSON.parse(localStorage.getItem("admin_contact")).length,
            certs: 0 // Count certs specifically from edu array if needed
        };

        const eduList = JSON.parse(localStorage.getItem("admin_edu"));
        counts.certs = eduList.filter(e => e.qual.toLowerCase().includes("certificate")).length;

        document.getElementById("stat-projects-count").textContent = counts.projects;
        document.getElementById("stat-roles-count").textContent = counts.roles;
        document.getElementById("stat-skills-count").textContent = counts.dev;
        document.getElementById("stat-certs-count").textContent = counts.certs;
        document.getElementById("stat-cv-count").textContent = counts.cv;
        document.getElementById("stat-ministry-count").textContent = counts.ministry;
        document.getElementById("stat-messages-count").textContent = counts.contact;
        
        let lastUpdate = "Never";
        const acts = JSON.parse(localStorage.getItem("admin_activity"));
        if (acts.length > 0) {
            lastUpdate = formatDate(acts[0].time).split(",")[0];
        }
        document.getElementById("stat-last-updated").textContent = lastUpdate;
    };

    // === UI NAVIGATION & MODALS ===
    const sidebarLinks = document.querySelectorAll(".sidebar-nav li[data-tab]");
    const sections = document.querySelectorAll(".dashboard-section");

    sidebarLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("data-tab");
            
            sidebarLinks.forEach(item => item.classList.remove("active"));
            link.classList.add("active");

            sections.forEach(sec => sec.classList.remove("active"));
            const targetSec = document.getElementById(targetId);
            if (targetSec) targetSec.classList.add("active");

            if (window.innerWidth <= 768) {
                document.getElementById("admin-sidebar").classList.remove("active");
            }
            updateStats();
        });
    });

    const sidebarToggle = document.getElementById("sidebar-toggle");
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", () => document.getElementById("admin-sidebar").classList.toggle("active"));
    }

    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault();
            logActivity("Logged out", "System Auth");
            sessionStorage.removeItem("admin_logged_in");
            localStorage.removeItem("admin_logged_in");
            window.location.replace("index.html");
        });
    }

    window.openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = "flex";
    };

    window.closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = "none";
    };

    // Close modals on clicking outside overlay
    window.addEventListener("click", (e) => {
        document.querySelectorAll(".admin-modal").forEach(modal => {
            if (e.target === modal) modal.style.display = "none";
        });
    });


    // ================= RENDERING & CRUD =================

    // 1. ABOUT
    const renderAbout = () => {
        const about = JSON.parse(localStorage.getItem("admin_about"));
        document.getElementById("about-name").value = about.name || '';
        document.getElementById("about-title").value = about.title || '';
        document.getElementById("about-bio").value = about.bio || '';
        document.getElementById("about-intro").value = about.intro || '';
        document.getElementById("about-mission").value = about.mission || '';
        document.getElementById("about-vision").value = about.vision || '';
        document.getElementById("about-pic").value = about.pic || '';
        document.getElementById("about-cover").value = about.cover || '';
        document.getElementById("about-res-btn").value = about.resBtn || '';
        document.getElementById("about-socials").value = about.socials || '{}';
    };
    
    document.getElementById("about-content-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const oldAbout = JSON.parse(localStorage.getItem("admin_about"));
        const newAbout = {
            name: document.getElementById("about-name").value,
            title: document.getElementById("about-title").value,
            bio: document.getElementById("about-bio").value,
            intro: document.getElementById("about-intro").value,
            mission: document.getElementById("about-mission").value,
            vision: document.getElementById("about-vision").value,
            pic: document.getElementById("about-pic").value,
            cover: document.getElementById("about-cover").value,
            resBtn: document.getElementById("about-res-btn").value,
            socials: document.getElementById("about-socials").value,
        };
        localStorage.setItem("admin_about", JSON.stringify(newAbout));
        logHistory("About", oldAbout, "Updated Profile");
        logActivity("Updated About Content", "About Section");
        alert("About details saved!");
    });


    // 2. ROLES
    const renderRoles = () => {
        const records = JSON.parse(localStorage.getItem("admin_roles"));
        const tbody = document.getElementById("roles-tbody");
        tbody.innerHTML = records.map((rec, i) => `
            <tr>
              <td><i class="${escapeHTML(rec.icon)}"></i></td>
              <td><strong>${escapeHTML(rec.title)}</strong></td>
              <td>${escapeHTML(rec.org)}</td>
              <td><span style="padding:4px 8px; border-radius:10px; background:${rec.status==='Active'?'#dcfce7':'#f1f5f9'}; color:${rec.status==='Active'?'#16a34a':'#64748b'}; font-size:0.8rem">${rec.status}</span></td>
              <td>
                <button class="btn-sm btn-edit" onclick="editRole(${i})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-sm btn-delete" onclick="deleteRole(${i})"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
        `).join("");
    };

    window.editRole = (idx) => {
        const records = JSON.parse(localStorage.getItem("admin_roles"));
        const rec = records[idx];
        document.getElementById("role-id").value = idx;
        document.getElementById("role-title").value = rec.title;
        document.getElementById("role-org").value = rec.org;
        document.getElementById("role-icon").value = rec.icon;
        document.getElementById("role-status").value = rec.status;
        openModal("modal-role");
    };

    window.deleteRole = (idx) => {
        if(confirm("Delete role?")) {
            const records = JSON.parse(localStorage.getItem("admin_roles"));
            const old = records.splice(idx, 1);
            localStorage.setItem("admin_roles", JSON.stringify(records));
            logHistory("Roles", old[0], "Deleted Role");
            logActivity("Deleted Role", old[0].title);
            renderRoles();
            updateStats();
        }
    };

    document.getElementById("form-role")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const records = JSON.parse(localStorage.getItem("admin_roles"));
        const id = document.getElementById("role-id").value;
        const newObj = {
            title: document.getElementById("role-title").value,
            org: document.getElementById("role-org").value,
            icon: document.getElementById("role-icon").value || "fa-solid fa-briefcase",
            status: document.getElementById("role-status").value
        };

        if (id !== "") {
            logHistory("Roles", records[id], "Edited Role");
            records[id] = newObj;
            logActivity("Edited Role", newObj.title);
        } else {
            records.push(newObj);
            logActivity("Added Role", newObj.title);
        }

        localStorage.setItem("admin_roles", JSON.stringify(records));
        closeModal("modal-role");
        document.getElementById("form-role").reset();
        document.getElementById("role-id").value = "";
        renderRoles();
        updateStats();
    });


    // 3. DEVELOPMENT
    const renderDev = () => {
        const records = JSON.parse(localStorage.getItem("admin_dev"));
        const tbody = document.getElementById("dev-tbody");
        tbody.innerHTML = records.map((rec, i) => `
            <tr>
              <td>${rec.icon || '<i class="fa-solid fa-code"></i>'}</td>
              <td><strong>${escapeHTML(rec.name)}</strong></td>
              <td>${escapeHTML(rec.cat)}</td>
              <td>${escapeHTML(rec.prof)}%</td>
              <td>${escapeHTML(rec.exp)}</td>
              <td>
                <button class="btn-sm btn-edit" onclick="editDev(${i})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-sm btn-delete" onclick="deleteDev(${i})"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
        `).join("");
    };

    window.editDev = (idx) => {
        const records = JSON.parse(localStorage.getItem("admin_dev"));
        const rec = records[idx];
        document.getElementById("dev-id").value = idx;
        document.getElementById("dev-name").value = rec.name;
        document.getElementById("dev-icon").value = rec.icon;
        document.getElementById("dev-desc").value = rec.desc;
        document.getElementById("dev-cat").value = rec.cat;
        document.getElementById("dev-prof").value = rec.prof;
        document.getElementById("dev-exp").value = rec.exp;
        openModal("modal-dev");
    };

    window.deleteDev = (idx) => {
        if(confirm("Delete skill?")) {
            const records = JSON.parse(localStorage.getItem("admin_dev"));
            const old = records.splice(idx, 1);
            localStorage.setItem("admin_dev", JSON.stringify(records));
            logHistory("Development", old[0], "Deleted Dev Skill");
            logActivity("Deleted Tech Skill", old[0].name);
            renderDev();
            updateStats();
        }
    };

    document.getElementById("form-dev")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const records = JSON.parse(localStorage.getItem("admin_dev"));
        const id = document.getElementById("dev-id").value;
        const newObj = {
            name: document.getElementById("dev-name").value,
            icon: document.getElementById("dev-icon").value,
            desc: document.getElementById("dev-desc").value,
            cat: document.getElementById("dev-cat").value,
            prof: document.getElementById("dev-prof").value,
            exp: document.getElementById("dev-exp").value
        };

        if (id !== "") {
            logHistory("Development", records[id], "Edited Skill");
            records[id] = newObj;
            logActivity("Edited Skill", newObj.name);
        } else {
            records.push(newObj);
            logActivity("Added Skill", newObj.name);
        }

        localStorage.setItem("admin_dev", JSON.stringify(records));
        closeModal("modal-dev");
        document.getElementById("form-dev").reset();
        document.getElementById("dev-id").value = "";
        renderDev();
        updateStats();
    });


    // 4. EDUCATION
    const renderEdu = () => {
        const records = JSON.parse(localStorage.getItem("admin_edu"));
        const tbody = document.getElementById("edu-tbody");
        tbody.innerHTML = records.map((rec, i) => `
            <tr>
              <td><strong>${escapeHTML(rec.school)}</strong></td>
              <td>${escapeHTML(rec.qual)}</td>
              <td>${escapeHTML(rec.start)} - ${escapeHTML(rec.end)}</td>
              <td><span style="font-size:0.8rem; padding:4px; border-radius:4px; background:#e0f2fe">${escapeHTML(rec.status)}</span></td>
              <td>
                <button class="btn-sm btn-edit" onclick="editEdu(${i})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-sm btn-delete" onclick="deleteEdu(${i})"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
        `).join("");
    };

    window.editEdu = (idx) => {
        const records = JSON.parse(localStorage.getItem("admin_edu"));
        const rec = records[idx];
        document.getElementById("edu-id").value = idx;
        document.getElementById("edu-school").value = rec.school;
        document.getElementById("edu-qual").value = rec.qual;
        document.getElementById("edu-start").value = rec.start;
        document.getElementById("edu-end").value = rec.end;
        document.getElementById("edu-desc").value = rec.desc;
        document.getElementById("edu-loc").value = rec.loc;
        document.getElementById("edu-status").value = rec.status;
        openModal("modal-edu");
    };

    window.deleteEdu = (idx) => {
        if(confirm("Delete education?")) {
            const records = JSON.parse(localStorage.getItem("admin_edu"));
            const old = records.splice(idx, 1);
            localStorage.setItem("admin_edu", JSON.stringify(records));
            logHistory("Education", old[0], "Deleted");
            logActivity("Deleted Education", old[0].school);
            renderEdu();
            updateStats();
        }
    };

    document.getElementById("form-edu")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const records = JSON.parse(localStorage.getItem("admin_edu"));
        const id = document.getElementById("edu-id").value;
        const newObj = {
            school: document.getElementById("edu-school").value,
            qual: document.getElementById("edu-qual").value,
            start: document.getElementById("edu-start").value,
            end: document.getElementById("edu-end").value,
            desc: document.getElementById("edu-desc").value,
            loc: document.getElementById("edu-loc").value,
            status: document.getElementById("edu-status").value
        };

        if (id !== "") {
            records[id] = newObj;
            logActivity("Edited Education", newObj.school);
        } else {
            records.push(newObj);
            logActivity("Added Education", newObj.school);
        }

        localStorage.setItem("admin_edu", JSON.stringify(records));
        closeModal("modal-edu");
        document.getElementById("form-edu").reset();
        document.getElementById("edu-id").value = "";
        renderEdu();
        updateStats();
    });


    // 5. PROJECTS
    const renderProjects = () => {
        const records = JSON.parse(localStorage.getItem("admin_projects"));
        const tbody = document.getElementById("projects-tbody");
        tbody.innerHTML = records.map((rec, i) => `
            <tr>
              <td><strong>${escapeHTML(rec.title)}</strong></td>
              <td>${escapeHTML(rec.cat)}</td>
              <td>${rec.status}</td>
              <td>${rec.feat ? '<i class="fa-solid fa-star" style="color:gold;"></i>' : '-'}</td>
              <td>
                <button class="btn-sm btn-edit" onclick="editProject(${i})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-sm btn-edit" onclick="dupProject(${i})" style="background:#f3e8ff; color:#9333ea;"><i class="fa-solid fa-copy"></i></button>
                <button class="btn-sm btn-delete" onclick="deleteProject(${i})"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
        `).join("");
    };

    window.editProject = (idx) => {
        const records = JSON.parse(localStorage.getItem("admin_projects"));
        const rec = records[idx];
        document.getElementById("proj-id").value = idx;
        document.getElementById("proj-title").value = rec.title;
        document.getElementById("proj-desc").value = rec.desc;
        document.getElementById("proj-tech").value = rec.tech;
        document.getElementById("proj-git").value = rec.git;
        document.getElementById("proj-live").value = rec.live;
        document.getElementById("proj-img").value = rec.img;
        document.getElementById("proj-cat").value = rec.cat;
        document.getElementById("proj-status").value = rec.status;
        document.getElementById("proj-feat").checked = rec.feat;
        openModal("modal-project");
    };

    window.dupProject = (idx) => {
        const records = JSON.parse(localStorage.getItem("admin_projects"));
        const rec = {...records[idx], title: records[idx].title + " (Copy)"};
        records.push(rec);
        localStorage.setItem("admin_projects", JSON.stringify(records));
        logActivity("Duplicated Project", rec.title);
        renderProjects();
        updateStats();
    };

    window.deleteProject = (idx) => {
        if(confirm("Delete project?")) {
            const records = JSON.parse(localStorage.getItem("admin_projects"));
            const old = records.splice(idx, 1);
            localStorage.setItem("admin_projects", JSON.stringify(records));
            logHistory("Projects", old[0], "Deleted");
            logActivity("Deleted Project", old[0].title);
            renderProjects();
            updateStats();
        }
    };

    document.getElementById("form-project")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const records = JSON.parse(localStorage.getItem("admin_projects"));
        const id = document.getElementById("proj-id").value;
        const newObj = {
            title: document.getElementById("proj-title").value,
            desc: document.getElementById("proj-desc").value,
            tech: document.getElementById("proj-tech").value,
            git: document.getElementById("proj-git").value,
            live: document.getElementById("proj-live").value,
            img: document.getElementById("proj-img").value,
            cat: document.getElementById("proj-cat").value,
            status: document.getElementById("proj-status").value,
            feat: document.getElementById("proj-feat").checked
        };

        if (id !== "") {
            records[id] = newObj;
            logActivity("Edited Project", newObj.title);
        } else {
            records.push(newObj);
            logActivity("Added Project", newObj.title);
        }

        localStorage.setItem("admin_projects", JSON.stringify(records));
        closeModal("modal-project");
        document.getElementById("form-project").reset();
        document.getElementById("proj-id").value = "";
        renderProjects();
        updateStats();
    });

    
    // 6. CV
    const renderCV = () => {
        const records = JSON.parse(localStorage.getItem("admin_cv"));
        const tbody = document.getElementById("cv-tbody");
        tbody.innerHTML = records.map((rec, i) => `
            <tr>
              <td>${formatDate(rec.date)}</td>
              <td>${i===0 ? '<span style="color:var(--admin-accent);font-weight:bold;">Active version</span>' : 'Archived'}</td>
              <td>${rec.downloads || 0}</td>
              <td>
                <button class="btn-sm btn-delete" onclick="deleteCV(${i})"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
        `).join("");
    };

    document.getElementById("btn-upload-cv")?.addEventListener("click", () => {
        const input = document.getElementById("cv-upload");
        if(input.files && input.files[0]) {
            const records = JSON.parse(localStorage.getItem("admin_cv"));
            const newDoc = {
                date: new Date().toISOString(),
                name: input.files[0].name,
                downloads: 0
            };
            records.unshift(newDoc); // append as first/active
            localStorage.setItem("admin_cv", JSON.stringify(records));
            logActivity("Uploaded New CV", input.files[0].name);
            input.value = "";
            renderCV();
            updateStats();
        } else {
            alert("Select a PDF file first.");
        }
    });

    window.deleteCV = (idx) => {
        const records = JSON.parse(localStorage.getItem("admin_cv"));
        records.splice(idx, 1);
        localStorage.setItem("admin_cv", JSON.stringify(records));
        renderCV();
        updateStats();
    };


    // 7. MINISTRY
    const renderMinistry = () => {
        const records = JSON.parse(localStorage.getItem("admin_ministry"));
        const tbody = document.getElementById("ministry-tbody");
        tbody.innerHTML = records.map((rec, i) => `
            <tr>
              <td>${formatDate(rec.date).split(",")[0]}</td>
              <td><strong>${escapeHTML(rec.title)}</strong></td>
              <td>${escapeHTML(rec.cat)}</td>
              <td>${escapeHTML(rec.status)}</td>
              <td>
                <button class="btn-sm btn-edit" onclick="editMinistry(${i})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-sm btn-delete" onclick="deleteMinistry(${i})"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
        `).join("");
    };

    window.editMinistry = (idx) => {
        const records = JSON.parse(localStorage.getItem("admin_ministry"));
        const rec = records[idx];
        document.getElementById("min-id").value = idx;
        document.getElementById("min-title").value = rec.title;
        document.getElementById("min-cat").value = rec.cat;
        document.getElementById("min-content").value = rec.content;
        document.getElementById("min-img").value = rec.img;
        document.getElementById("min-vid").value = rec.vid;
        document.getElementById("min-refs").value = rec.refs;
        document.getElementById("min-status").value = rec.status;
        openModal("modal-ministry");
    };

    window.deleteMinistry = (idx) => {
        if(confirm("Delete post?")) {
            const records = JSON.parse(localStorage.getItem("admin_ministry"));
            const old = records.splice(idx, 1);
            localStorage.setItem("admin_ministry", JSON.stringify(records));
            logActivity("Deleted Ministry Post", old[0].title);
            renderMinistry();
            updateStats();
        }
    };

    document.getElementById("form-ministry")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const records = JSON.parse(localStorage.getItem("admin_ministry"));
        const id = document.getElementById("min-id").value;
        const newObj = {
            date: id !== "" ? records[id].date : new Date().toISOString(),
            title: document.getElementById("min-title").value,
            cat: document.getElementById("min-cat").value,
            content: document.getElementById("min-content").value,
            img: document.getElementById("min-img").value,
            vid: document.getElementById("min-vid").value,
            refs: document.getElementById("min-refs").value,
            status: document.getElementById("min-status").value
        };

        if (id !== "") {
            records[id] = Object.assign(records[id], newObj);
            logActivity("Edited Ministry Post", newObj.title);
        } else {
            records.unshift(newObj);
            logActivity("Added Ministry Post", newObj.title);
        }

        localStorage.setItem("admin_ministry", JSON.stringify(records));
        closeModal("modal-ministry");
        document.getElementById("form-ministry").reset();
        document.getElementById("min-id").value = "";
        renderMinistry();
        updateStats();
    });


    // 8. CONTACT
    const renderContact = () => {
        const records = JSON.parse(localStorage.getItem("admin_contact"));
        const fullTbody = document.getElementById("messages-tbody-full");
        const dashTbody = document.getElementById("recent-messages-tbody");
        
        const markup = records.map((rec, i) => `
            <tr>
              <td>${formatDate(rec.created_at)}</td>
              <td>${escapeHTML(rec.name)}</td>
              <td><a href="mailto:${escapeHTML(rec.email)}">${escapeHTML(rec.email)}</a></td>
              <td style="max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHTML(rec.message)}</td>
              <td>${rec.status || 'Unread'}</td>
              <td><button class="btn-sm btn-delete" onclick="deleteContact(${i})"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `).join("");

        if (fullTbody) fullTbody.innerHTML = markup;
        
        if (dashTbody) {
            dashTbody.innerHTML = records.slice(0, 3).map(rec => `
            <tr>
              <td><strong>${escapeHTML(rec.name)}</strong></td>
              <td>${escapeHTML(rec.email)}</td>
              <td style="max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHTML(rec.message)}</td>
              <td>${formatDate(rec.created_at).split(",")[0]}</td>
            </tr>
            `).join("");
        }
    };

    window.deleteContact = (idx) => {
        if(confirm("Delete message log?")) {
            const records = JSON.parse(localStorage.getItem("admin_contact"));
            records.splice(idx, 1);
            localStorage.setItem("admin_contact", JSON.stringify(records));
            renderContact();
            updateStats();
        }
    };

    document.getElementById("btn-clear-msgs")?.addEventListener("click", () => {
        if(confirm("Are you sure you want to clear ALL messages?")) {
            localStorage.setItem("admin_contact", "[]");
            logActivity("Cleared all contact messages", "Messages");
            renderContact();
            updateStats();
        }
    });


    // 9. MEDIA & LOGS
    const renderActivity = () => {
        const acts = JSON.parse(localStorage.getItem("admin_activity"));
        const tbody = document.getElementById("activity-tbody");
        if(tbody) tbody.innerHTML = acts.map(a => `
            <tr>
              <td style="font-size:0.85rem">${formatDate(a.time)}</td>
              <td><strong>${escapeHTML(a.user)}</strong></td>
              <td>${escapeHTML(a.action)}</td>
              <td><span style="background:#f1f5f9; padding:3px 6px; border-radius:4px; font-size:0.8rem">${escapeHTML(a.platform)}</span></td>
            </tr>
        `).join("");
        
        const dashActTbody = document.getElementById("recent-activity-tbody");
        if(dashActTbody) dashActTbody.innerHTML = acts.slice(0, 4).map(a => `
            <tr>
              <td style="font-size:0.85rem">${formatDate(a.time).split(",")[0]}</td>
              <td>${escapeHTML(a.action)}</td>
              <td style="font-size:0.8rem">${escapeHTML(a.platform)}</td>
            </tr>
        `).join("");
    };

    const renderHistory = () => {
        const hists = JSON.parse(localStorage.getItem("admin_history"));
        const tbody = document.getElementById("history-tbody");
        if(tbody) tbody.innerHTML = hists.map((h, i) => `
            <tr>
              <td style="font-size:0.85rem">${formatDate(h.date)}</td>
              <td><strong>${escapeHTML(h.section)}</strong></td>
              <td style="max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHTML(h.oldVal)}</td>
              <td>
                <button class="btn-sm btn-edit" title="Restore (Mock)" onclick="alert('Feature coming soon')"><i class="fa-solid fa-clock-rotate-left"></i> Restore</button>
              </td>
            </tr>
        `).join("");
    };

    
    // 10. SEARCH
    document.getElementById("global-search")?.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        // A simple visual mock filter that hides rows not containing the term across all tables
        const activeTable = document.querySelector(".dashboard-section.active .admin-table tbody");
        if(activeTable) {
            Array.from(activeTable.querySelectorAll("tr")).forEach(tr => {
                tr.style.display = tr.textContent.toLowerCase().includes(term) ? "" : "none";
            });
        }
    });

    // 11. SETTINGS
    const renderSettings = () => {
        const s = JSON.parse(localStorage.getItem("admin_settings"));
        document.getElementById("set-name").value = s.name || '';
        document.getElementById("set-favicon").value = s.favicon || '';
        document.getElementById("set-color").value = s.color || '';
        document.getElementById("set-desc").value = s.desc || '';
        document.getElementById("set-ga").value = s.ga || '';
    };

    document.getElementById("settings-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const newSet = {
            name: document.getElementById("set-name").value,
            favicon: document.getElementById("set-favicon").value,
            color: document.getElementById("set-color").value,
            desc: document.getElementById("set-desc").value,
            ga: document.getElementById("set-ga").value
        };
        localStorage.setItem("admin_settings", JSON.stringify(newSet));
        
        const newPass = document.getElementById("set-pass").value;
        if(newPass && newPass.length >= 6) {
            localStorage.setItem("admin_password", newPass);
            alert("Password updated");
            document.getElementById("set-pass").value = "";
        }
        
        logActivity("Changed System Settings", "Global Configuration");
        alert("Settings saved!");
    });


    // Bootstrap
    renderAbout();
    renderRoles();
    renderDev();
    renderEdu();
    renderProjects();
    renderCV();
    renderMinistry();
    renderContact();
    renderActivity();
    renderHistory();
    renderSettings();
    updateStats();

    // Make sure recent login is updated if valid auth
    if(sessionStorage.getItem("just_logged_in") !== "false") {
        logActivity("Logged in via Admin Portal", "System Auth");
        sessionStorage.setItem("just_logged_in", "false"); // Prevents multiple logs on refresh
    }

});
