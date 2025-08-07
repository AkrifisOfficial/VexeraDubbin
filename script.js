// DOM элементы
const elements = {
    search: {
        input: document.getElementById('search-input'),
        btn: document.getElementById('search-btn')
    },
    theme: document.getElementById('theme-toggle'),
    history: {
        btn: document.getElementById('history-btn'),
        link: document.getElementById('history-link'),
        list: document.getElementById('history-list')
    },
    pages: {
        home: document.getElementById('home-page'),
        anime: document.getElementById('anime-page'),
        history: document.getElementById('history-page')
    },
    anime: {
        featured: document.getElementById('featured-anime'),
        newEpisodes: document.getElementById('new-episodes'),
        all: document.getElementById('all-anime'),
        title: document.getElementById('anime-title'),
        cover: document.getElementById('anime-cover'),
        description: document.getElementById('anime-description'),
        year: document.getElementById('anime-year'),
        status: document.getElementById('anime-status'),
        rating: document.getElementById('anime-rating'),
        genres: document.getElementById('anime-genres')
    },
    player: {
        container: document.getElementById('player-container'),
        placeholder: document.getElementById('video-placeholder'),
        episodes: document.getElementById('episodes-container'),
        controls: {
            prev: document.getElementById('prev-btn'),
            play: document.getElementById('play-pause-btn'),
            next: document.getElementById('next-btn'),
            mute: document.getElementById('mute-btn'),
            volume: document.getElementById('volume-slider'),
            fullscreen: document.getElementById('fullscreen-btn')
        }
    },
    viewOptions: document.querySelectorAll('.view-option')
};

// Состояние приложения
const state = {
    currentAnime: null,
    currentEpisode: null,
    data: {
        all: [],
        featured: [],
        newEpisodes: []
    },
    viewMode: 'grid',
    theme: localStorage.getItem('theme') || 'dark'
};

// Инициализация приложения
async function initApp() {
    try {
        await loadData();
        applyTheme();
        setupEventListeners();
        renderHomePage();
        
        // Логирование для отладки
        console.log('Приложение инициализировано', {
            animeCount: state.data.all.length,
            featuredCount: state.data.featured.length,
            episodesCount: state.data.newEpisodes.length
        });
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        showError('Не удалось загрузить приложение');
    }
}

// Загрузка данных
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const rawData = await response.json();
        
        // Обработка и нормализация данных
        state.data.all = rawData.map(anime => ({
            ...anime,
            episodes: anime.episodes.map(episode => {
                // Поддержка старого и нового формата
                const urlMatch = episode.vk_url?.match(/video-(\d+)_(\d+)/);
                return {
                    ...episode,
                    vk_owner_id: urlMatch?.[1] ?? episode.vk_owner_id,
                    vk_video_id: urlMatch?.[2] ?? episode.vk_video_id
                };
            }).filter(ep => ep.vk_owner_id && ep.vk_video_id) // Фильтрация невалидных
        })).filter(anime => anime.episodes.length > 0); // Только аниме с эпизодами
        
        // Подготовка дополнительных данных
        state.data.featured = [...state.data.all]
            .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
            .slice(0, 5);
            
        state.data.newEpisodes = state.data.all
            .flatMap(anime => {
                const lastEpisode = anime.episodes[anime.episodes.length - 1];
                return lastEpisode ? [{
                    animeId: anime.id,
                    animeTitle: anime.title,
                    cover: anime.cover,
                    ...lastEpisode
                }] : [];
            });
            
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        throw error; // Пробрасываем для обработки в initApp
    }
}

// Воспроизведение эпизода
function playEpisode(episode) {
    if (!episode?.vk_owner_id || !episode?.vk_video_id) {
        console.error('Невалидные данные эпизода:', episode);
        return showError('Ошибка воспроизведения: неверные данные');
    }

    state.currentEpisode = episode;
    elements.player.placeholder.style.display = 'none';
    
    // Очистка и создание плеера
    elements.player.container.innerHTML = `
        <iframe src="https://vk.com/video_ext.php?oid=${episode.vk_owner_id}&id=${episode.vk_video_id}"
                frameborder="0" 
                allowfullscreen
                class="vk-player">
        </iframe>
    `;
    
    loadComments(episode);
    addToHistory(state.currentAnime, episode);
    
    // Прокрутка к плееру
    elements.player.container.scrollIntoView({ behavior: 'smooth' });
}

// Загрузка комментариев
function loadComments(episode) {
    const container = document.getElementById('vk-comments');
    container.innerHTML = '<div class="loading">Загрузка комментариев...</div>';
    
    const pageId = `video_${episode.vk_owner_id}_${episode.vk_video_id}`;
    
    const initWidget = () => {
        try {
            VK.Widgets.Comments('vk-comments', {
                limit: 15,
                attach: false,
                pageId: pageId
            }, episode.vk_video_id);
        } catch (e) {
            container.innerHTML = '<div class="error">Комментарии недоступны</div>';
            console.error('VK Widget Error:', e);
        }
    };
    
    if (window.VK?.Widgets) {
        initWidget();
    } else {
        const timer = setInterval(() => {
            if (window.VK?.Widgets) {
                clearInterval(timer);
                initWidget();
            }
        }, 500);
    }
}

// Показать страницу аниме
function showAnimePage(anime) {
    if (!anime) return;
    
    state.currentAnime = anime;
    const { title, cover, description, year, status, rating, genres } = anime;
    
    // Заполнение информации
    elements.anime.title.textContent = title;
    elements.anime.cover.src = cover;
    elements.anime.cover.onerror = () => {
        elements.anime.cover.src = 'https://via.placeholder.com/300x450?text=No+Image';
    };
    elements.anime.description.textContent = description;
    elements.anime.year.textContent = year;
    elements.anime.status.textContent = status;
    elements.anime.rating.textContent = rating;
    elements.anime.genres.textContent = genres.join(', ');
    
    // Рендер эпизодов
    renderEpisodes(anime.episodes);
    
    // Переключение страниц
    showPage('anime');
}

// Рендер эпизодов
function renderEpisodes(episodes) {
    elements.player.episodes.innerHTML = '';
    
    episodes.forEach(ep => {
        const btn = document.createElement('button');
        btn.className = 'episode-btn' + (ep.id === state.currentEpisode?.id ? ' active' : '');
        btn.textContent = `${ep.id}. ${ep.title}`;
        btn.addEventListener('click', () => playEpisode(ep));
        elements.player.episodes.appendChild(btn);
    });
}

// Вспомогательные функции
function showPage(page) {
    Object.values(elements.pages).forEach(p => p.classList.add('hidden'));
    elements.pages[page].classList.remove('hidden');
}

function showError(msg) {
    const el = document.createElement('div');
    el.className = 'error-message';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 5000);
}

function applyTheme() {
    document.body.classList.toggle('light-theme', state.theme === 'light');
    elements.theme.innerHTML = state.theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

// Инициализация
document.addEventListener('DOMContentLoaded', initApp);
