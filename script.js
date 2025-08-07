// Конфигурация
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/AkrifisOfficial/VexeraDubbin/main/anime.json";
const UPDATE_INTERVAL = 60 * 1000; // 5 минут
let animeData = [];

// DOM элементы
const animeContainer = document.getElementById('anime-container');
const episodeModal = document.getElementById('episode-modal');
const episodeList = document.getElementById('episode-list');
const lastUpdateElement = document.getElementById('last-update');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadAnimeData();
    setInterval(loadAnimeData, UPDATE_INTERVAL);
    
    // Закрытие модального окна
    document.querySelector('.close').addEventListener('click', () => {
        episodeModal.classList.add('hidden');
    });
});

// Загрузка данных с GitHub
async function loadAnimeData() {
    try {
        const timestamp = new Date().toLocaleTimeString();
        const response = await fetch(`${GITHUB_RAW_URL}?t=${Date.now()}`);
        
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        
        const data = await response.json();
        lastUpdateElement.textContent = `Последнее обновление: ${timestamp}`;
        
        // Обновляем только если данные изменились
        if (JSON.stringify(data) !== JSON.stringify(animeData)) {
            animeData = data;
            renderAnimeList();
        }
    } catch (error) {
        console.error('Ошибка:', error);
        animeContainer.innerHTML = `
            <div class="error">
                <h2>Ошибка загрузки данных</h2>
                <p>Попробуйте перезагрузить страницу</p>
            </div>
        `;
    }
}

// Рендеринг списка аниме
function renderAnimeList() {
    animeContainer.innerHTML = '';
    
    animeData.forEach(anime => {
        const animeCard = document.createElement('div');
        animeCard.className = 'anime-card';
        animeCard.innerHTML = `
            <img src="${anime.image}" alt="${anime.title}">
            <div class="anime-info">
                <h2>${anime.title}</h2>
                <p>${anime.description}</p>
            </div>
        `;
        
        animeCard.addEventListener('click', () => showEpisodes(anime));
        animeContainer.appendChild(animeCard);
    });
}

// Показ списка серий
function showEpisodes(anime) {
    episodeList.innerHTML = '';
    
    anime.episodes.forEach(episode => {
        const episodeCard = document.createElement('div');
        episodeCard.className = 'episode-card';
        episodeCard.innerHTML = `
            <h3>${episode.number}. ${episode.title}</h3>
            <p>Длительность: ${episode.duration} мин</p>
        `;
        
        episodeCard.addEventListener('click', () => {
            window.open(episode.video_url, '_blank');
        });
        
        episodeList.appendChild(episodeCard);
    });
    
    episodeModal.classList.remove('hidden');
}
