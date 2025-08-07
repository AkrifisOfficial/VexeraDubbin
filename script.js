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
const playPauseBtn = document.getElementById('play-pause-btn');
const nextBtn = document.getElementById('next-btn');
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

// Инициализация приложения
async function initApp() {
    await loadData();
    applySavedTheme();
    setupEventListeners();
    renderHomePage();
}

// Загрузка данных
    async function loadData() {
        try {
            const response = await fetch('data.json');
            return await response.json();
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
            return [];
        }
    }

    // Отображение списка аниме
    async function renderAnime() {
        const data = await loadData();
        animeList.innerHTML = '';
        
        data.forEach(anime => {
            const card = document.createElement('div');
            card.className = 'anime-card';
            card.innerHTML = 
                <img src="${anime.cover}" alt="${anime.title}">
                <h3>${anime.title}</h3>
                <p>${anime.rating} ★</p>
            ;
            
            card.addEventListener('click', () => showAnime(anime));
            animeList.appendChild(card);
        });
    }

    // Показать плеер с аниме
    function showAnime(anime) {
        animeList.style.display = 'none';
        playerSection.style.display = 'block';
        
        // Отображение информации об аниме
        document.getElementById('anime-title').textContent = anime.title;
        document.getElementById('anime-cover').src = anime.cover;
        document.getElementById('anime-description').textContent = anime.description;
        
        // Отображение списка серий
        const episodesList = document.getElementById('episodes-list');
        episodesList.innerHTML = '';
        
        anime.episodes.forEach(episode => {
            const episodeBtn = document.createElement('button');
            episodeBtn.className = 'episode-btn';
            episodeBtn.textContent = episode.title;
            episodeBtn.addEventListener('click', () => playEpisode(episode));
            episodesList.appendChild(episodeBtn);
        });
    }
33
    // Воспроизведение эпизода
    function playEpisode(episode) {
        if (!episode.vk_url) {
            console.error("Отсутствует URL видео");
            return;
        }
        
        // Парсим URL видео
        const urlParts = episode.vk_url.match(/video-(\d+)_(\d+)/);
        if (!urlParts) {
            console.error("Неверный формат URL видео");
            return;
        }
        
        const ownerId = urlParts[1];
        const videoId = urlParts[2];
        
        // Встраиваем плеер VK
        videoContainer.innerHTML = 
            <iframe 
                src="https://vk.com/video_ext.php?oid=${ownerId}&id=${videoId}"
                frameborder="0" 
                allowfullscreen
            ></iframe>
        ;
    }

    // Инициализация
    renderAnime();
});
        
        featuredAnimeData = [...allAnimeData].sort((a, b) => b.rating - a.rating).slice(0, 5);
        
        newEpisodesData = [];
        allAnimeData.forEach(anime => {
            if (anime.episodes.length > 0) {
                const lastEpisode = anime.episodes[anime.episodes.length - 1];
                newEpisodesData.push({
                    animeId: anime.id,
                    animeTitle: anime.title,
                    cover: anime.cover,
                    episodeId: lastEpisode.id,
                    title: `Серия ${lastEpisode.id}: ${lastEpisode.title}`,
                    vk_owner_id: lastEpisode.vk_owner_id,
                    vk_video_id: lastEpisode.vk_video_id
                });
            }
        });
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showError('Ошибка загрузки данных. Пожалуйста, попробуйте позже.');
    }
}

// Воспроизведение эпизода (универсальная версия)
function playEpisode(episode) {
    if (!episode.vk_owner_id || !episode.vk_video_id) {
        console.error("Отсутствуют данные видео");
        return;
    }

    currentEpisode = episode;
    videoPlaceholder.style.display = 'none';
    
    // Очистка предыдущего плеера
    const playerContainer = document.getElementById('player-container');
    playerContainer.innerHTML = '';
    
    // Создание iframe для VK видео
    const iframe = document.createElement('iframe');
    iframe.id = 'video-player';
    iframe.src = `https://vk.com/video_ext.php?oid=${episode.vk_owner_id}&id=${episode.vk_video_id}&hash=123abc`;
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('frameborder', '0');
    playerContainer.appendChild(iframe);
    
    // Загрузка комментариев
    loadVKComments(episode);
    
    // Добавление в историю
    addToHistory(currentAnime, episode);
    
    // Прокрутка к плееру
    document.querySelector('.player-section').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Загрузка комментариев VK
function loadVKComments(episode) {
    const commentsContainer = document.getElementById('vk-comments');
    commentsContainer.innerHTML = '<div class="loading">Загрузка комментариев...</div>';
    
    const pageId = `video_${episode.vk_owner_id}_${episode.vk_video_id}`;
    
    if (typeof VK !== 'undefined' && VK.Widgets) {
        initVKWidget(pageId);
    } else {
        const intervalId = setInterval(() => {
            if (typeof VK !== 'undefined' && VK.Widgets) {
                clearInterval(intervalId);
                initVKWidget(pageId);
            }
        }, 500);
    }
}

// Инициализация виджета комментариев VK
function initVKWidget(pageId) {
    const commentsContainer = document.getElementById('vk-comments');
    try {
        VK.Widgets.Comments('vk-comments', {
            limit: 20,
            attach: false,
            autoPublish: 0,
            pageUrl: `https://vk.com/video${pageId.split('_').slice(1).join('_')}`,
            pageId: pageId
        }, pageId.split('_')[2]);
    } catch (e) {
        commentsContainer.innerHTML = '<div class="error">Не удалось загрузить комментарии</div>';
        console.error('Ошибка VK виджета:', e);
    }
}

// Остальные функции остаются без изменений
// (showAnimePage, renderEpisodes, addToHistory, searchAnime и т.д.)

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initApp);
