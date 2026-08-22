const STORAGE_KEY = "stories:items:v1";
const STORY_TTL_MS = 24 * 60 * 60 * 1000;
const STORY_VIEW_MS = 5000;
const EXPIRY_SWEEP_MS = 30 * 1000;
const MAX_IMAGE_DIMENSION = 1440;

const elements = {
  addStoryButton: document.querySelector("#add-story-button"),
  addStoryLabel: document.querySelector("#add-story-label"),
  fileInput: document.querySelector("#story-file-input"),
  storyRail: document.querySelector("#story-rail"),
  statusBanner: document.querySelector("#status-banner"),
  storyCount: document.querySelector("#story-count"),
  storyCountNote: document.querySelector("#story-count-note"),
  nextExpiry: document.querySelector("#next-expiry"),
  storageUsage: document.querySelector("#storage-usage"),
  viewer: document.querySelector("#viewer"),
  viewerShell: document.querySelector(".viewer-shell"),
  viewerBackdrop: document.querySelector("#viewer-backdrop"),
  viewerProgress: document.querySelector("#viewer-progress"),
  viewerStoryCount: document.querySelector("#viewer-story-count"),
  viewerStoryTitle: document.querySelector("#viewer-story-title"),
  viewerStoryTime: document.querySelector("#viewer-story-time"),
  viewerImage: document.querySelector("#viewer-image"),
  viewerExpiryNote: document.querySelector("#viewer-expiry-note"),
  viewerClose: document.querySelector("#viewer-close"),
  viewerPrev: document.querySelector("#viewer-prev"),
  viewerNext: document.querySelector("#viewer-next"),
  viewerFrame: document.querySelector("#viewer-frame"),
};

const state = {
  stories: [],
  activeStoryIndex: 0,
  viewerOpen: false,
  viewerProgressMs: 0,
  viewerLastFrameAt: 0,
  viewerRafId: 0,
  viewerPaused: false,
  uploading: false,
  statusTimerId: 0,
  gestureStart: null,
  previousFocus: null,
};

function init() {
  hydrateStories();
  attachEvents();
  render();
  window.setInterval(handleExpirySweep, EXPIRY_SWEEP_MS);
}

function attachEvents() {
  elements.addStoryButton.addEventListener("click", () => {
    elements.fileInput.click();
  });

  elements.fileInput.addEventListener("change", handleFileSelection);

  elements.storyRail.addEventListener(
    "error",
    (event) => {
      const target = event.target;

      if (!(target instanceof HTMLImageElement) || !target.dataset.storyId) {
        return;
      }

      removeStoryById(target.dataset.storyId, "A story was removed because its image could not be loaded.");
    },
    true,
  );

  elements.storyRail.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const trigger = event.target.closest("[data-story-index]");

    if (!trigger) {
      return;
    }

    openViewer(Number(trigger.dataset.storyIndex));
  });

  elements.viewerClose.addEventListener("click", closeViewer);
  elements.viewerBackdrop.addEventListener("click", closeViewer);
  elements.viewerPrev.addEventListener("click", () => moveViewer(-1));
  elements.viewerNext.addEventListener("click", () => moveViewer(1));
  elements.viewerImage.addEventListener("error", handleViewerImageError);

  elements.viewer.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const closeTrigger = event.target.closest("#viewer-close, #viewer-backdrop");

    if (closeTrigger) {
      closeViewer();
      return;
    }

    if (event.target.closest("#viewer-prev")) {
      moveViewer(-1);
      return;
    }

    if (event.target.closest("#viewer-next")) {
      moveViewer(1);
      return;
    }

    if (event.target === elements.viewer) {
      closeViewer();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!state.viewerOpen) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveViewer(-1);
      return;
    }

    if (event.key === "ArrowRight" || event.key === " ") {
      event.preventDefault();
      moveViewer(1);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeViewer();
    }
  });

  document.addEventListener("visibilitychange", () => {
    state.viewerPaused = document.hidden;

    if (!document.hidden && state.viewerOpen) {
      state.viewerLastFrameAt = performance.now();
    }
  });

  elements.viewerFrame.addEventListener("pointerdown", handlePointerDown);
  elements.viewerFrame.addEventListener("pointerup", handlePointerUp);
  elements.viewerFrame.addEventListener("pointercancel", clearPointerGesture);
  elements.viewerFrame.addEventListener("pointerleave", clearPointerGesture);
  elements.viewerFrame.addEventListener("click", handleViewerFrameClick);
}

function hydrateStories() {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    state.stories = [];
    return;
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    state.stories = sanitizeStories(parsedValue);
    pruneExpiredStories({ persist: true, rerenderViewer: false });
  } catch (error) {
    state.stories = [];
    showStatus("Stored stories were reset because the local data was invalid.", "error");
    localStorage.removeItem(STORAGE_KEY);
  }
}

function sanitizeStories(candidate) {
  if (!Array.isArray(candidate)) {
    return [];
  }

  return sortStories(
    candidate
      .filter((story) => {
        return (
          story &&
          typeof story.id === "string" &&
          typeof story.image === "string" &&
          isSupportedImageSource(story.image) &&
          Number.isFinite(story.createdAt) &&
          Number.isFinite(story.expiresAt)
        );
      })
      .map((story) => ({
        id: story.id,
        image: story.image,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
      })),
  );
}

function sortStories(stories) {
  return [...stories].sort((left, right) => right.createdAt - left.createdAt);
}

function handleExpirySweep() {
  const removedCount = pruneExpiredStories({ persist: true, rerenderViewer: true });

  if (removedCount > 0) {
    render();
  } else if (state.viewerOpen) {
    syncViewerProgress();
    syncViewerMeta();
  }
}

function pruneExpiredStories({ persist, rerenderViewer }) {
  const now = Date.now();
  const freshStories = state.stories.filter((story) => story.expiresAt > now);
  const removedCount = state.stories.length - freshStories.length;

  if (removedCount === 0) {
    return 0;
  }

  state.stories = sortStories(freshStories);

  if (persist) {
    persistStories();
  }

  if (state.viewerOpen) {
    if (state.stories.length === 0) {
      closeViewer();
    } else {
      state.activeStoryIndex = Math.min(state.activeStoryIndex, state.stories.length - 1);

      if (rerenderViewer) {
        renderViewer();
      }
    }
  }

  return removedCount;
}

async function handleFileSelection(event) {
  const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));

  if (!files.length) {
    elements.fileInput.value = "";
    return;
  }

  setUploading(true);

  const previousStories = [...state.stories];

  try {
    const newStories = [];

    for (const file of files) {
      const base64Image = await convertImageToBase64(file);
      newStories.push(buildStoryRecord(base64Image));
    }

    state.stories = sortStories([...newStories, ...state.stories]);
    persistStories();
    render();

    const postedCount = newStories.length;
    showStatus(
      `${postedCount} ${postedCount === 1 ? "story" : "stories"} posted. They will disappear in 24 hours.`,
      "success",
    );
  } catch (error) {
    state.stories = previousStories;
    render();
    showStatus(resolveUploadErrorMessage(error), "error");
  } finally {
    elements.fileInput.value = "";
    setUploading(false);
  }
}

function resolveUploadErrorMessage(error) {
  if (error instanceof Error && error.message.toLowerCase().includes("quota")) {
    return "Browser storage is full. Try posting fewer or smaller images.";
  }

  return "The selected image could not be turned into a story.";
}

function setUploading(isUploading) {
  state.uploading = isUploading;
  elements.addStoryButton.disabled = isUploading;
  elements.addStoryLabel.textContent = isUploading ? "Posting..." : "Add Story";
}

function buildStoryRecord(image) {
  const createdAt = Date.now();

  return {
    id: buildStoryId(),
    image,
    createdAt,
    expiresAt: createdAt + STORY_TTL_MS,
  };
}

function buildStoryId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `story-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function convertImageToBase64(file) {
  const dataUrl = await readFileAsDataUrl(file);
  return downscaleImage(dataUrl, file.type);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The selected file could not be read."));
    reader.readAsDataURL(file);
  });
}

function downscaleImage(dataUrl, mimeType) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const longestSide = Math.max(image.width, image.height);
      const scale = longestSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / longestSide : 1;
      const canvas = document.createElement("canvas");
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("The browser could not prepare the uploaded image."));
        return;
      }

      canvas.width = width;
      canvas.height = height;

      context.fillStyle = "#08101e";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      const targetType = mimeType === "image/png" ? "image/png" : "image/jpeg";
      const output = canvas.toDataURL(targetType, 0.86);
      resolve(output);
    };

    image.onerror = () => reject(new Error("The selected image format is not supported."));
    image.src = dataUrl;
  });
}

function persistStories() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.stories));
}

function render() {
  renderStoryRail();
  renderMetrics();
  syncViewerState();
}

function renderStoryRail() {
  elements.storyRail.innerHTML = "";

  if (state.stories.length === 0) {
    const emptyCard = document.createElement("article");
    emptyCard.className = "empty-rail";
    emptyCard.innerHTML = `
      <strong>No stories yet</strong>
      <span>Use the plus button to upload an image and create the first 24-hour story.</span>
    `;
    elements.storyRail.append(emptyCard);
    ensureStatusMessage();
    return;
  }

  const fragment = document.createDocumentFragment();

  state.stories.forEach((story, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `story-card ${resolveStoryCardVariant(index)}`;
    card.dataset.storyIndex = String(index);

    card.innerHTML = `
      <span class="story-card__preview">
        <img class="story-card__image" src="${story.image}" alt="Story ${index + 1}" data-story-id="${story.id}" />
      </span>
      <span class="story-card__body">
        <span class="story-card__row">
          <strong class="story-card__title">Story ${index + 1}</strong>
          <span class="story-card__tag">Live</span>
        </span>
        <span class="story-card__meta">${formatRelativeTime(story.createdAt)} • ${formatTimeRemaining(
          story.expiresAt - Date.now(),
        )} left</span>
      </span>
    `;

    fragment.append(card);
  });

  elements.storyRail.append(fragment);
  ensureStatusMessage();
}

function renderMetrics() {
  const liveStories = state.stories.length;
  const nextExpiryStory = state.stories.reduce((nearest, story) => {
    if (!nearest || story.expiresAt < nearest.expiresAt) {
      return story;
    }

    return nearest;
  }, null);

  elements.storyCount.textContent = String(liveStories);
  elements.storyCountNote.textContent =
    liveStories === 0
      ? "Nothing has been posted yet."
      : `${liveStories === 1 ? "One story is" : `${liveStories} stories are`} active in this browser.`;
  elements.nextExpiry.textContent = nextExpiryStory
    ? formatTimeRemaining(nextExpiryStory.expiresAt - Date.now())
    : "Waiting";
  elements.storageUsage.textContent = formatStorageUsage();
}

function formatStorageUsage() {
  const sizeInBytes = new Blob([JSON.stringify(state.stories)]).size;

  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  }

  return `${(sizeInBytes / 1024).toFixed(1)} KB`;
}

function ensureStatusMessage() {
  if (elements.statusBanner.textContent.trim()) {
    return;
  }

  elements.statusBanner.textContent =
    state.stories.length === 0
      ? "Your stories stay local to this browser until they expire."
      : "Tap any story to open the viewer.";
  elements.statusBanner.dataset.tone = "info";
}

function resolveStoryCardVariant(index) {
  if (index % 5 === 0) {
    return "story-card--tall";
  }

  if (index % 4 === 0) {
    return "story-card--square";
  }

  return "story-card--standard";
}

function showStatus(message, tone) {
  window.clearTimeout(state.statusTimerId);
  elements.statusBanner.textContent = message;
  elements.statusBanner.dataset.tone = tone;
  state.statusTimerId = window.setTimeout(() => {
    elements.statusBanner.textContent = "";
    elements.statusBanner.dataset.tone = "info";
    ensureStatusMessage();
  }, 4200);
}

function openViewer(index) {
  if (!state.stories.length) {
    return;
  }

  state.viewerOpen = true;
  state.activeStoryIndex = clamp(index, 0, state.stories.length - 1);
  state.viewerProgressMs = 0;
  state.viewerPaused = false;
  state.previousFocus = document.activeElement;
  document.body.classList.add("viewer-open");
  renderViewer();
  startViewerLoop();
  elements.viewer.hidden = false;
  elements.viewer.setAttribute("aria-hidden", "false");
  elements.viewerShell.focus();
}

function closeViewer() {
  state.viewerOpen = false;
  state.viewerProgressMs = 0;
  state.viewerPaused = false;
  stopViewerLoop();
  elements.viewer.hidden = true;
  elements.viewer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("viewer-open");
  elements.viewerImage.removeAttribute("src");
  elements.viewerBackdrop.style.backgroundImage = "";
  clearPointerGesture();

  if (state.previousFocus && typeof state.previousFocus.focus === "function") {
    state.previousFocus.focus();
  }
}

function moveViewer(direction) {
  if (!state.stories.length) {
    closeViewer();
    return;
  }

  const nextIndex = state.activeStoryIndex + direction;

  if (nextIndex < 0) {
    state.activeStoryIndex = 0;
    state.viewerProgressMs = 0;
    state.viewerLastFrameAt = performance.now();
    syncViewerProgress();
    syncViewerMeta();
    return;
  }

  if (nextIndex >= state.stories.length) {
    closeViewer();
    return;
  }

  state.activeStoryIndex = nextIndex;
  state.viewerProgressMs = 0;
  state.viewerLastFrameAt = performance.now();
  renderViewer();
}

function renderViewer() {
  if (!state.viewerOpen) {
    return;
  }

  const activeStory = state.stories[state.activeStoryIndex];

  if (!activeStory) {
    closeViewer();
    return;
  }

  syncViewerMeta();
  rebuildViewerProgress();
  elements.viewerImage.removeAttribute("src");
  elements.viewerImage.alt = "Loading story";
  elements.viewerBackdrop.style.backgroundImage = "";

  const activeStoryId = activeStory.id;
  const activeStoryImage = activeStory.image;

  preloadImage(activeStoryImage)
    .then(() => {
      const currentStory = state.stories[state.activeStoryIndex];

      if (!state.viewerOpen || !currentStory || currentStory.id !== activeStoryId) {
        return;
      }

      elements.viewerImage.src = activeStoryImage;
      elements.viewerImage.alt = `Story ${state.activeStoryIndex + 1}`;
      elements.viewerBackdrop.style.backgroundImage = `url("${activeStoryImage}")`;
    })
    .catch(() => {
      removeStoryById(activeStoryId, "That story image was invalid, so it has been removed.");
    });
}

function syncViewerMeta() {
  if (!state.viewerOpen) {
    return;
  }

  const activeStory = state.stories[state.activeStoryIndex];

  if (!activeStory) {
    return;
  }

  elements.viewerStoryCount.textContent = `${state.activeStoryIndex + 1} / ${state.stories.length}`;
  elements.viewerStoryTitle.textContent = `Story ${state.activeStoryIndex + 1}`;
  elements.viewerStoryTime.textContent = `Posted ${formatRelativeTime(activeStory.createdAt)} ago`;
  elements.viewerExpiryNote.textContent = `Expires in ${formatTimeRemaining(activeStory.expiresAt - Date.now())}.`;
}

function rebuildViewerProgress() {
  elements.viewerProgress.innerHTML = "";

  const fragment = document.createDocumentFragment();

  state.stories.forEach(() => {
    const segment = document.createElement("span");
    segment.className = "progress-segment";
    segment.innerHTML = '<span class="progress-fill"></span>';
    fragment.append(segment);
  });

  elements.viewerProgress.append(fragment);
  syncViewerProgress();
}

function syncViewerProgress() {
  const fills = Array.from(elements.viewerProgress.querySelectorAll(".progress-fill"));

  fills.forEach((fill, index) => {
    let width = 0;

    if (index < state.activeStoryIndex) {
      width = 100;
    } else if (index === state.activeStoryIndex) {
      width = Math.min(100, (state.viewerProgressMs / STORY_VIEW_MS) * 100);
    }

    fill.style.width = `${width}%`;
  });
}

function syncViewerState() {
  if (!state.viewerOpen) {
    return;
  }

  if (!state.stories.length) {
    closeViewer();
    return;
  }

  if (state.activeStoryIndex >= state.stories.length) {
    state.activeStoryIndex = state.stories.length - 1;
  }

  renderViewer();
}

function startViewerLoop() {
  stopViewerLoop();
  state.viewerLastFrameAt = performance.now();

  const tick = (frameAt) => {
    if (!state.viewerOpen) {
      return;
    }

    if (!state.viewerPaused) {
      state.viewerProgressMs += frameAt - state.viewerLastFrameAt;
    }

    state.viewerLastFrameAt = frameAt;

    if (state.viewerProgressMs >= STORY_VIEW_MS) {
      moveViewer(1);
      state.viewerLastFrameAt = performance.now();
    } else {
      syncViewerProgress();
      syncViewerMeta();
    }

    if (state.viewerOpen) {
      state.viewerRafId = window.requestAnimationFrame(tick);
    }
  };

  state.viewerRafId = window.requestAnimationFrame(tick);
}

function stopViewerLoop() {
  window.cancelAnimationFrame(state.viewerRafId);
  state.viewerRafId = 0;
}

function handlePointerDown(event) {
  state.gestureStart = {
    x: event.clientX,
    y: event.clientY,
  };
}

function handlePointerUp(event) {
  if (!state.gestureStart) {
    return;
  }

  const deltaX = event.clientX - state.gestureStart.x;
  const deltaY = event.clientY - state.gestureStart.y;

  clearPointerGesture();

  if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
    moveViewer(deltaX > 0 ? -1 : 1);
    return;
  }

  if (deltaY > 90) {
    closeViewer();
  }
}

function clearPointerGesture() {
  state.gestureStart = null;
}

function handleViewerFrameClick(event) {
  if (!(event.target instanceof Element) || !state.viewerOpen || !state.stories.length) {
    return;
  }

  if (event.target.closest("#viewer-prev, #viewer-next")) {
    return;
  }

  const frameRect = elements.viewerFrame.getBoundingClientRect();
  const relativeX = event.clientX - frameRect.left;
  const leftZoneWidth = frameRect.width * 0.34;
  const rightZoneStart = frameRect.width * 0.66;

  if (relativeX <= leftZoneWidth) {
    moveViewer(-1);
    return;
  }

  if (relativeX >= rightZoneStart) {
    moveViewer(1);
  }
}

function handleViewerImageError() {
  const activeStory = state.stories[state.activeStoryIndex];

  if (!activeStory) {
    closeViewer();
    return;
  }

  removeStoryById(activeStory.id, "That story image could not be displayed and was removed.");
}

function removeStoryById(storyId, message) {
  const nextStories = state.stories.filter((story) => story.id !== storyId);

  if (nextStories.length === state.stories.length) {
    return;
  }

  state.stories = sortStories(nextStories);
  persistStories();
  render();

  if (state.viewerOpen) {
    if (!state.stories.length) {
      closeViewer();
    } else {
      state.activeStoryIndex = clamp(state.activeStoryIndex, 0, state.stories.length - 1);
      renderViewer();
    }
  }

  showStatus(message, "error");
}

function isSupportedImageSource(source) {
  return (
    source.startsWith("data:image/") ||
    source.startsWith("blob:") ||
    source.startsWith("http://") ||
    source.startsWith("https://") ||
    source.startsWith("./") ||
    source.startsWith("../") ||
    source.startsWith("/")
  );
}

function preloadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(source);
    image.onerror = () => reject(new Error("Unable to load image."));
    image.src = source;
  });
}

function formatTimeRemaining(ms) {
  if (ms <= 0) {
    return "expired";
  }

  const totalMinutes = Math.ceil(ms / 60000);

  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 24) {
    return "24h";
  }

  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

function formatRelativeTime(timestamp) {
  const diffMs = Math.max(0, Date.now() - timestamp);
  const totalMinutes = Math.floor(diffMs / 60000);

  if (totalMinutes < 1) {
    return "just now";
  }

  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const hours = Math.floor(totalMinutes / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  return `${Math.floor(hours / 24)}d`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

init();
