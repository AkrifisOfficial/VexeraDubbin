// DOM элементы
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const themeToggle = document.getElementById('theme-toggle');
const historyBtn = document.getElementById('history-btn');
const historyLink = document.getElementById('history-link');
const homePage = document.getElementById('home-page');
const animePage = document.getElementById('anime-page');
const historyPage = document.getElementById('history-page');
const featuredAnime = document.getElementById('featured-anime');
const newEpisodes = document.getElementById('new-episodes');
const allAnime = document.getElementById('all-anime');
const animeTitle = document.getElementById('anime-title');
const animeCover = document.getElementById('anime-cover');
const animeDescription = document.getElementById('anime-description');
const animeYear = document.getElementById('anime-year');
const animeStatus = document.getElementById('anime-status');
const animeRating = document.getElementById('anime-rating');
const animeGenres = document.getElementById('anime-genres');
const episodesContainer = document.getElementById('episodes-container');
const videoPlaceholder = document.getElementById('video-placeholder');
const historyList = document.getElementById('history-list');
const viewOptions = document.querySelectorAll('.view-option');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const playPauseBtn = document.getElementById('play-pause-btn');
const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume-slider');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// Переменные состояния
let currentAnime = null;
let currentEpisode = null;
let allAnimeData = [];
let featuredAnimeData = [];
let newEpisodesData = [];
let viewMode = 'grid';
let player = null;

// Инициализация приложения
async function initApp() {
    // Загрузка данных
    await loadData();
    
    // Применение сохраненной темы
    applySavedTheme();
    
    // Обработчики событий
    setupEventListeners();
    
    // Отображение данных
    renderHomePage();
}

// Загрузка данных
async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        allAnimeData = data;
        
        // Формируем данные для популярных аниме (первые 5)
        featuredAnimeData = [...allAnimeData].slice(0, 5);
        
        // Формируем данные для новых серий
        newEpisodesData = [];
        allAnimeData.forEach(anime => {
            if (anime.episodes.length > 0) {
                const lastEpisode = anime.episodes[anime.episodes.length - 1];
                newEpisodesData.push({
                    animeId: anime.id,
                    animeTitle: anime.title,
                    cover: anime.cover,
                    episodeId: lastEpisode.id,
                    title: `Серия ${lastEpisode.id}: ${lastEpisode.title}`
                });
            }
        });
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Переключение темы
    themeToggle.addEventListener('click', toggleTheme);
    
    // Поиск
    searchBtn.addEventListener('click', searchAnime);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchAnime();
    });
    
    // История
    historyBtn.addEventListener('click', showHistoryPage);
    historyLink.addEventListener('click', showHistoryPage);
    
    // Переключение вида
    viewOptions.forEach(option => {
        option.addEventListener('click', () => {
            viewOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            viewMode = option.dataset.view;
            renderHomePage();
        });
    });
    
    // Навигация по эпизодам
    prevBtn.addEventListener('click', playPrevEpisode);
    nextBtn.addEventListener('click', playNextEpisode);
    
    // Управление плеером
    playPauseBtn.addEventListener('click', togglePlayPause);
    muteBtn.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', setVolume);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
}

// Применение сохраненной темы
function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Переключение темы
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeToggle.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Поиск аниме
function searchAnime() {
    const term = searchInput.value.trim().toLowerCase();
    if (!term) {
        renderHomePage();
        return;
    }
    
    const filtered = allAnimeData.filter(anime => 
        anime.title.toLowerCase().includes(term) ||
        (anime.description && anime.description.toLowerCase().includes(term)) ||
        (anime.genres && anime.genres.some(genre => genre.toLowerCase().includes(term)))
    );
    
    renderSearchResults(filtered);
}

// Отображение главной страницы
function renderHomePage() {
    showPage(homePage);
    renderFeaturedAnime();
    renderNewEpisodes();
    renderAllAnime();
}

// Отображение популярных аниме
function renderFeaturedAnime() {
    featuredAnime.innerHTML = '';
    
    if (featuredAnimeData.length === 0) {
        featuredAnime.innerHTML = '<div class="no-results">Нет популярных аниме</div>';
        return;
    }
    
    featuredAnimeData.forEach(anime => {
        const card = createAnimeCard(anime);
        featuredAnime.appendChild(card);
    });
}

// Отображение новых серий
function renderNewEpisodes() {
    newEpisodes.innerHTML = '';
    
    if (newEpisodesData.length === 0) {
        newEpisodes.innerHTML = '<div class="no-results">Нет новых серий</div>';
        return;
    }
    
    newEpisodesData.forEach(episode => {
        const card = createEpisodeCard(episode);
        newEpisodes.appendChild(card);
    });
}

// Отображение всех аниме
function renderAllAnime() {
    allAnime.innerHTML = '';
    
    if (allAnimeData.length === 0) {
        allAnime.innerHTML = '<div class="no-results">Аниме не найдены</div>';
        return;
    }
    
    allAnimeData.forEach(anime => {
        const card = createAnimeCard(anime);
        allAnime.appendChild(card);
    });
}

// Создание карточки аниме
function createAnimeCard(anime) {
    const card = document.createElement('div');
    card.className = 'anime-card';
    card.innerHTML = `
        <img src="${anime.cover}" alt="${anime.title}" onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
        <div class="card-content">
            <h3>${anime.title}</h3>
            <div class="episode-count">
                <i class="fas fa-play-circle"></i>
                <span>${anime.episodes.length} серий</span>
            </div>
        </div>
        <div class="rating">
            <i class="fas fa-star"></i>
            <span>${anime.rating}</span>
        </div>
    `;
    
    card.addEventListener('click', () => showAnimePage(anime));
    return card;
}

// Создание карточки серии
function createEpisodeCard(episode) {
    const card = document.createElement('div');
    card.className = 'episode-card';
    card.innerHTML = `
        <img src="${episode.cover}" alt="${episode.title}" onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
        <div class="content">
            <div class="anime-title">${episode.animeTitle}</div>
            <div class="episode-title">${episode.title}</div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        const anime = allAnimeData.find(a => a.id === episode.animeId);
        if (anime) {
            const foundEpisode = anime.episodes.find(e => e.id === episode.episodeId);
            if (foundEpisode) {
                showAnimePage(anime);
                setTimeout(() => playEpisode(foundEpisode), 300);
            }
        }
    });
    
    return card;
}

// Показать страницу аниме
function showAnimePage(anime) {
    showPage(animePage);
    currentAnime = anime;
    
    // Заполнение информации об аниме
    animeTitle.textContent = anime.title;
    animeCover.src = anime.cover;
    animeCover.alt = anime.title;
    animeDescription.textContent = anime.description;
    animeYear.textContent = anime.year;
    animeStatus.textContent = anime.status;
    animeRating.textContent = anime.rating;
    animeGenres.textContent = anime.genres.join(', ');
    
    // Обработка ошибки загрузки изображения
    animeCover.onerror = function() {
        this.src = 'https://via.placeholder.com/300x450?text=No+Image';
    };
    
    // Отображение списка серий
    renderEpisodes(anime.episodes);
    
    // Сброс плеера
    videoPlaceholder.style.display = 'flex';
    if (document.getElementById('video-player')) {
        document.getElementById('video-player').remove();
    }
}

// Отображение списка серий
function renderEpisodes(episodes) {
    episodesContainer.innerHTML = '';
    
    episodes.forEach(episode => {
        const btn = document.createElement('button');
        btn.className = 'episode-btn';
        btn.textContent = `Серия ${episode.id}: ${episode.title}`;
        btn.addEventListener('click', () => playEpisode(episode));
        episodesContainer.appendChild(btn);
    });
}

// Воспроизведение эпизода
function playEpisode(episode) {
    currentEpisode = episode;
    videoPlaceholder.style.display = 'none';
    
    // Удаление предыдущего плеера
    if (document.getElementById('video-player')) {
        document.getElementById('video-player').remove();
    }
    
    // Создание iframe для видео VK
    const iframe = document.createElement('iframe');
    iframe.id = 'video-player';
    iframe.src = `https://vk.com/video_ext.php?oid=${episode.vk_owner_id}&id=${episode.vk_video_id}&hash=123abc`;
    iframe.allowFullscreen = true;
    
    document.getElementById('player-container').appendChild(iframe);
    
    // Сохран
