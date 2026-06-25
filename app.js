/* ==========================================================================
   PORTFOLIO INITIALIZATION & RENDERING
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderPortfolio();
  initializeLightbox();
  initializePDFExporter();
  
  // Re-run Lucide Icons to format elements
  lucide.createIcons();
});

// Render all galleries in HTML
function renderPortfolio() {
  const wrapper = document.getElementById("gallery-wrapper");
  wrapper.innerHTML = ""; // Clear existing

  // Update dynamic project count badge
  const badge = document.getElementById("project-count-badge");
  if (badge) {
    badge.textContent = `${projects.length} COMMERCIAL PROJECTS`;
  }

  projects.forEach(project => {
    // Create Section Container
    const section = document.createElement("section");
    section.className = `gallery-section ${project.category}-project`;
    section.id = `project-${project.id}`;

    // Section Header Markup
    section.innerHTML = `
      <div class="project-header">
        <div class="project-title-area">
          <div class="project-category">${project.category}</div>
          <h2 class="project-title">${project.title}</h2>
        </div>
        <div class="project-meta">${project.typeLabel}</div>
      </div>
      <div class="gallery-grid"></div>
    `;

    const grid = section.querySelector(".gallery-grid");

    // Populate Grid items
    project.images.forEach((img, idx) => {
      const item = document.createElement("div");
      item.className = `gallery-item ${img.layout || 'span-normal'}`;
      item.setAttribute("data-project-id", project.id);
      item.setAttribute("data-img-idx", idx);
      
      item.innerHTML = `
        <img src="${img.src}" alt="${img.title}" loading="lazy">
        <div class="item-overlay">
          <div class="overlay-content">
            <h4 class="overlay-title">${img.title}</h4>
            <p class="overlay-desc">${img.desc}</p>
          </div>
        </div>
      `;
      
      grid.appendChild(item);
    });

    wrapper.appendChild(section);
  });
}

/* ==========================================================================
   LIGHTBOX MODULE
   ========================================================================== */
let currentProjectIndex = 0;
let currentImageIndex = 0;

function initializeLightbox() {
  const lightbox = document.getElementById("lightbox");
  const closeBtn = document.querySelector(".lightbox-close");
  const prevBtn = document.querySelector(".lightbox-prev");
  const nextBtn = document.querySelector(".lightbox-next");
  const wrapper = document.getElementById("gallery-wrapper");

  // Attach click listener to grid items
  wrapper.addEventListener("click", (e) => {
    const item = e.target.closest(".gallery-item");
    if (!item) return;

    const projectId = item.getAttribute("data-project-id");
    const imgIdx = parseInt(item.getAttribute("data-img-idx"), 10);

    currentProjectIndex = projects.findIndex(p => p.id === projectId);
    currentImageIndex = imgIdx;

    openLightbox();
  });

  // Lightbox close trigger
  closeBtn.addEventListener("click", closeLightbox);
  
  // Close when clicking outside content
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Navigation triggers
  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateLightbox(-1);
  });
  
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateLightbox(1);
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("show")) return;
    
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigateLightbox(-1);
    if (e.key === "ArrowRight") navigateLightbox(1);
  });
}

function openLightbox() {
  const lightbox = document.getElementById("lightbox");
  lightbox.classList.add("show");
  updateLightboxContent();
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  lightbox.classList.remove("show");
}

function updateLightboxContent() {
  const project = projects[currentProjectIndex];
  const image = project.images[currentImageIndex];

  const lightboxImg = document.getElementById("lightbox-img");
  const titleEl = document.getElementById("lightbox-project-title");
  const descEl = document.getElementById("lightbox-image-desc");

  // Soft transition fade-in effect on change
  lightboxImg.style.opacity = 0;
  
  setTimeout(() => {
    lightboxImg.src = image.src;
    lightboxImg.alt = image.title;
    titleEl.textContent = `${project.title} — ${image.title}`;
    descEl.textContent = `${image.desc} (${project.typeLabel})`;
    lightboxImg.style.opacity = 1;
  }, 150);
}

function navigateLightbox(direction) {
  const project = projects[currentProjectIndex];
  currentImageIndex += direction;

  // Wrap around image indices inside the current project
  if (currentImageIndex < 0) {
    currentImageIndex = project.images.length - 1;
  } else if (currentImageIndex >= project.images.length) {
    currentImageIndex = 0;
  }

  updateLightboxContent();
}

// Navigation & category filters removed as all projects are Onelight

/* ==========================================================================
   PDF EXPORTER (HTML2PDF Compilation Engine)
   ========================================================================== */
function initializePDFExporter() {
  const exportBtn = document.getElementById("btn-pdf");
  
  exportBtn.addEventListener("click", () => {
    // Show download visual feedback
    const originalContent = exportBtn.innerHTML;
    exportBtn.disabled = true;
    exportBtn.innerHTML = `<span style="font-size:0.75rem;">GENERATING PDF...</span>`;
    
    // Compile PDF Layout in temporary shadow DOM element
    const pdfSource = document.createElement("div");
    pdfSource.style.fontFamily = "'Outfit', sans-serif";
    pdfSource.style.color = "#f0f0f5";
    pdfSource.style.background = "#08080a";
    pdfSource.style.width = "210mm";
    pdfSource.style.margin = "0";
    pdfSource.style.padding = "0";
    
    // Add Cover Page
    pdfSource.innerHTML = `
      <div class="pdf-page" style="box-sizing: border-box; width: 210mm; height: 296mm; padding: 40mm 20mm; text-align: center; border: 12px double #d4af37; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: #08080a; margin: 0; position: relative;">
        <!-- Accent Glows (drawn via CSS gradient in PDF) -->
        <div style="position: absolute; width: 150mm; height: 150mm; border-radius: 50%; background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, rgba(0,0,0,0) 70%); top: -50mm; right: -50mm; pointer-events: none;"></div>
        <div style="position: absolute; width: 150mm; height: 150mm; border-radius: 50%; background: radial-gradient(circle, rgba(58, 80, 107, 0.08) 0%, rgba(0,0,0,0) 70%); bottom: -50mm; left: -50mm; pointer-events: none;"></div>

        <h1 style="font-family: 'Syne', sans-serif; font-size: 38pt; font-weight: 800; color: #ffffff; letter-spacing: 5px; margin: 0 0 15px 0; text-transform: uppercase; line-height: 1.2;">
          <span style="color: #d4af37;">VISUAL</span> ARCHIVE
        </h1>
        <div style="width: 80px; height: 2px; background-color: #d4af37; margin: 15px auto 25px auto;"></div>
        <p style="font-size: 13pt; color: #a0a0b0; font-weight: 300; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 100px 0;">Onelight Commercial Portfolio</p>
        <p style="font-size: 9.5pt; color: #6e6e7d; font-style: italic; margin: 0; letter-spacing: 1px;">Curated Premium Lookbook</p>
      </div>
    `;
    
    // Append each project as a separate page block
    projects.forEach((project) => {
      const sectionHtml = `
        <div class="pdf-page" style="box-sizing: border-box; width: 210mm; height: 296mm; padding: 20mm 15mm; background-color: #08080a; margin: 0; display: flex; flex-direction: column; justify-content: flex-start; position: relative;">
          <!-- Accent Glows -->
          <div style="position: absolute; width: 120mm; height: 120mm; border-radius: 50%; background: radial-gradient(circle, rgba(212, 175, 55, 0.04) 0%, rgba(0,0,0,0) 70%); top: -30mm; right: -30mm; pointer-events: none;"></div>
          
          <!-- Section Header -->
          <div style="border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-end; width: 100%;">
            <div style="text-align: left;">
              <p style="font-size: 8pt; font-weight: 700; color: #d4af37; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 3px 0;">${project.category}</p>
              <h2 style="font-family: 'Syne', sans-serif; font-size: 18pt; font-weight: 700; margin: 0; color: #ffffff; letter-spacing: 0.5px;">${project.title}</h2>
            </div>
            <span style="font-size: 8pt; color: #a0a0b0; font-style: italic; font-weight: 300;">${project.typeLabel}</span>
          </div>
          
          <p style="font-size: 9pt; color: #a0a0b0; margin: 0 0 20px 0; max-width: 100%; line-height: 1.5; font-weight: 300; text-align: left;">${project.meta}</p>
          
          <!-- Image Grid (2 columns, up to 3 rows) -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; width: 100%;">
            ${project.images.map(img => `
              <div style="border: 1px solid rgba(212, 175, 55, 0.15); border-radius: 6px; padding: 8px; background-color: rgba(22, 22, 28, 0.6); box-shadow: 0 4px 10px rgba(0,0,0,0.3); text-align: left;">
                <div style="aspect-ratio: 16/9; overflow: hidden; border-radius: 4px; background-color: #101014; margin-bottom: 5px;">
                  <img src="${img.src}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                </div>
                <h4 style="font-size: 8.5pt; font-weight: 600; color: #f0f0f5; margin: 0 0 1px 0;">${img.title}</h4>
                <p style="font-size: 7.5pt; color: #d4af37; margin: 0; font-weight: 300;">${img.desc}</p>
              </div>
            `).join("")}
          </div>
        </div>
      `;
      pdfSource.innerHTML += sectionHtml;
    });

    // html2pdf Options Configuration
    const opt = {
      margin: 0,
      filename: 'visual_archive_portfolio.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'before', before: '.pdf-page' }
    };
    
    // Execute html2pdf action
    html2pdf().from(pdfSource).set(opt).save().then(() => {
      // Restore download button
      exportBtn.innerHTML = originalContent;
      exportBtn.disabled = false;
      lucide.createIcons();
    }).catch(err => {
      console.error("PDF generation failed:", err);
      exportBtn.innerHTML = originalContent;
      exportBtn.disabled = false;
      lucide.createIcons();
      alert("ไม่สามารถบันทึก PDF ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
    });
  });
}
