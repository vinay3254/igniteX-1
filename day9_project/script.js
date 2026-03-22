const apiKey = "YOUR_TMDB_API_KEY";
const imageBase = "https://image.tmdb.org/t/p/";

const endpoints = {
  trending: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`,
  popular: `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`,
  topRated: `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}`,
};

const hero = document.getElementById("hero");
const heroTitle = document.getElementById("heroTitle");
const heroDescription = document.getElementById("heroDescription");
const navbar = document.getElementById("navbar");

const setHero = (movie) => {
  if (!movie) return;
  hero.style.backgroundImage = `url(${imageBase}w1280${movie.backdrop_path})`;
  heroTitle.textContent = movie.title || movie.name;
  heroDescription.textContent = movie.overview || "No description available.";
};

const createCard = (movie) => {
  const card = document.createElement("div");
  card.className = "movie-card";

  const img = document.createElement("img");
  img.src = movie.poster_path
    ? `${imageBase}w500${movie.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";
  img.alt = movie.title || movie.name;

  const info = document.createElement("div");
  info.className = "movie-info";

  const title = document.createElement("div");
  title.className = "movie-title";
  title.textContent = movie.title || movie.name;

  const meta = document.createElement("div");
  meta.className = "movie-meta";
  meta.textContent = `Rating: ${movie.vote_average?.toFixed(1) || "N/A"}`;

  info.append(title, meta);
  card.append(img, info);

  return card;
};

const populateRow = async (rowId, url, isHero = false) => {
  const row = document.getElementById(rowId);
  if (!row) return;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const movies = data.results || [];

    row.innerHTML = "";
    movies.slice(0, 18).forEach((movie, index) => {
      if (isHero && index === 0) {
        setHero(movie);
      }
      row.appendChild(createCard(movie));
    });
  } catch (error) {
    row.innerHTML = "<p class=\"movie-meta\">Failed to load movies.</p>";
    console.error("TMDB error:", error);
  }
};

const initScrollButtons = () => {
  document.querySelectorAll(".row-section").forEach((section) => {
    const track = section.querySelector(".row-track");
    const buttons = section.querySelectorAll(".row-arrow");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const direction = button.dataset.direction === "left" ? -1 : 1;
        track.scrollBy({ left: direction * 400, behavior: "smooth" });
      });
    });
  });
};

const initNavbar = () => {
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 80);
  });
};

const warnMissingApiKey = () => {
  if (apiKey === "YOUR_TMDB_API_KEY") {
    console.warn("Please replace YOUR_TMDB_API_KEY with a valid TMDB API key.");
  }
};

const init = () => {
  warnMissingApiKey();
  populateRow("trending", endpoints.trending, true);
  populateRow("popular", endpoints.popular);
  populateRow("topRated", endpoints.topRated);
  initScrollButtons();
  initNavbar();
};

init();
