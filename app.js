/* ==========================================================================
   PORTFOLIO INITIALIZATION & RENDERING
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderPortfolio();
  initializeLightbox();
  
  // Re-run Lucide Icons to format elements
  lucide.createIcons();
});

// Render all galleries in HTML
function renderPortfolio() {
  const wrapper = document.getElementById("gallery-wrapper");
  wrapper.innerHTML = ""; // Clear existing

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
