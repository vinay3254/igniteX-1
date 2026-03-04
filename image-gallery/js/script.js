/* ============================================================
   RESPONSIVE IMAGE GALLERY — script.js
   Features:
   - Category filter buttons
   - Lightbox: open / close / next / previous
   - Keyboard navigation (arrow keys, Escape)
   - Touch/swipe support for mobile
   ============================================================ */


/* ── DOM References ──────────────────────────────────────── */
const gallery         = document.getElementById("gallery");
const lightbox        = document.getElementById("lightbox");
const lightboxBackdrop = document.getElementById("lightboxBackdrop");
const lightboxImg     = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxCounter = document.getElementById("lightboxCounter");
const lightboxClose   = document.getElementById("lightboxClose");
const lightboxPrev    = document.getElementById("lightboxPrev");
const lightboxNext    = document.getElementById("lightboxNext");
const filterBtns      = document.querySelectorAll(".filter-btn");

/* ── State ───────────────────────────────────────────────── */
let currentIndex    = 0;      // index of currently displayed image
let visibleItems    = [];     // array of currently visible gallery items
let touchStartX     = 0;      // for swipe detection


/* ── 1. Build visibleItems from the DOM ──────────────────── */
/**
 * Refreshes the `visibleItems` array to contain only
 * gallery items that are not hidden (i.e., match current filter).
 */
function refreshVisibleItems() {
  visibleItems = Array.from(
    document.querySelectorAll(".gallery-item:not(.hidden)")
  );
}


/* ── 2. Filter Logic ─────────────────────────────────────── */
/**
 * Handles filter button clicks.
 * Shows/hides gallery items based on their data-category attribute.
 */
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;

    /* Update active button state */
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    /* Show or hide each gallery item */
    document.querySelectorAll(".gallery-item").forEach((item) => {
      const matchesAll      = filter === "all";
      const matchesCategory = item.dataset.category === filter;

      if (matchesAll || matchesCategory) {
        item.classList.remove("hidden");
      } else {
        item.classList.add("hidden");
      }
    });

    refreshVisibleItems();
  });
});


/* ── 3. Open Lightbox ────────────────────────────────────── */
/**
 * Opens the lightbox and displays the image at the given index
 * within `visibleItems`.
 * @param {number} index - Index into visibleItems array
 */
function openLightbox(index) {
  refreshVisibleItems();

  if (index < 0 || index >= visibleItems.length) return;

  currentIndex = index;
  const item   = visibleItems[currentIndex];
  const img    = item.querySelector("img");
  const caption = item.querySelector(".overlay-caption");

  /* Reset animation by briefly resetting opacity */
  lightboxImg.style.opacity = "0";
  lightboxImg.style.transform = "scale(0.85)";

  /* Set image source and caption */
  lightboxImg.src   = img.src;
  lightboxImg.alt   = img.alt;
  lightboxCaption.textContent = caption ? caption.textContent : img.alt;
  lightboxCounter.textContent = `${currentIndex + 1} / ${visibleItems.length}`;

  /* Activate lightbox and backdrop */
  lightbox.classList.add("active");
  lightboxBackdrop.classList.add("active");

  /* Prevent body scrolling while lightbox is open */
  document.body.style.overflow = "hidden";

  /* Update navigation button states */
  updateNavButtons();

  /* Trigger animation on next frame */
  requestAnimationFrame(() => {
    lightboxImg.style.opacity   = "";
    lightboxImg.style.transform = "";
  });
}


/* ── 4. Close Lightbox ───────────────────────────────────── */
/**
 * Closes the lightbox and re-enables body scroll.
 */
function closeLightbox() {
  lightbox.classList.remove("active");
  lightboxBackdrop.classList.remove("active");
  document.body.style.overflow = "";

  /* Clear image source after transition */
  setTimeout(() => {
    lightboxImg.src = "";
  }, 350);
}


/* ── 5. Navigate Images ──────────────────────────────────── */
/**
 * Moves to the previous image in the visible list.
 */
function prevImage() {
  if (currentIndex > 0) {
    openLightbox(currentIndex - 1);
  }
}

/**
 * Moves to the next image in the visible list.
 */
function nextImage() {
  if (currentIndex < visibleItems.length - 1) {
    openLightbox(currentIndex + 1);
  }
}

/**
 * Disables/enables Prev and Next buttons based on position.
 */
function updateNavButtons() {
  lightboxPrev.disabled = currentIndex === 0;
  lightboxNext.disabled = currentIndex === visibleItems.length - 1;
}


/* ── 6. Gallery Click Handler ────────────────────────────── */
/**
 * Listens for clicks on gallery items using event delegation.
 */
gallery.addEventListener("click", (e) => {
  const item = e.target.closest(".gallery-item");
  if (!item || item.classList.contains("hidden")) return;

  refreshVisibleItems();

  /* Find the clicked item's position in visible list */
  const index = visibleItems.indexOf(item);
  if (index !== -1) {
    openLightbox(index);
  }
});


/* ── 7. Lightbox Button Events ───────────────────────────── */
lightboxClose.addEventListener("click", closeLightbox);
lightboxPrev.addEventListener("click", prevImage);
lightboxNext.addEventListener("click", nextImage);

/* Clicking the dark backdrop also closes the lightbox */
lightboxBackdrop.addEventListener("click", closeLightbox);


/* ── 8. Keyboard Navigation ──────────────────────────────── */
/**
 * Allows navigating the lightbox using keyboard:
 * - ArrowLeft / ArrowRight: navigate images
 * - Escape: close lightbox
 */
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("active")) return;

  switch (e.key) {
    case "ArrowLeft":
      prevImage();
      break;
    case "ArrowRight":
      nextImage();
      break;
    case "Escape":
      closeLightbox();
      break;
  }
});


/* ── 9. Touch/Swipe Support ──────────────────────────────── */
/**
 * Allows swiping left/right on mobile to navigate images.
 */
lightbox.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });

lightbox.addEventListener("touchend", (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const deltaX    = touchStartX - touchEndX;

  /* Swipe threshold: 50px */
  if (Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
      nextImage();   // swipe left → next
    } else {
      prevImage();   // swipe right → previous
    }
  }
}, { passive: true });


/* ── 10. Initialize ──────────────────────────────────────── */
/**
 * Set initial visible items on page load.
 */
refreshVisibleItems();
