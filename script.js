document.addEventListener('DOMContentLoaded', function() {
  const animeListContainer = document.getElementById('anime-list');
  const episodesListContainer = document.getElementById('episodes-list');
  const videoPlayer = document.getElementById('video-player');
  const videoTitle = document.getElementById('video-title');
  const videoDescription = document.getElementById('video-description');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');

  let animeData = [];
  let filteredAnime = [];

  // Загрузка данных
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      animeData = data.anime_list;
      filteredAnime = [...animeData];
      renderAnimeList(filteredAnime);
    })
    .catch(error => console.error('Ошибка загрузки данных:', error));

  // Рендер списка аниме
  function renderAnimeList(animeList) {
    animeListContainer.innerHTML = '';
    
    animeList.forEach(anime => {
      const animeCard = document.createElement('div');
      animeCard.className = 'anime-card';
      animeCard.innerHTML = `
        <img src="${anime.poster}" alt="${anime.title}" class="anime-poster">
        <div class="anime-title">${anime.title}</div>
      `;
      
      animeCard.addEventListener('click', () => {
        showAnimeDetails(anime);
      });
      
      animeListContainer.appendChild(animeCard);
    });
  }

  // Показать детали аниме и список серий
  function showAnimeDetails(anime) {
    videoTitle.textContent = anime.title;
    videoDescription.textContent = anime.description;
    
    // Очищаем видео
    videoPlayer.src = '';
    videoPlayer.poster = anime.poster;
    
    // Рендерим список серий
    renderEpisodesList(anime.episodes);
  }

  // Рендер списка серий
  function renderEpisodesList(episodes) {
    episodesListContainer.innerHTML = '<h3>Список серий:</h3>';
    
    episodes.forEach(episode => {
      if (episode.vexera_dubbing) {
        const episodeItem = document.createElement('div');
        episodeItem.className = 'episode-item';
        episodeItem.innerHTML = `
          ${episode.number}. ${episode.title}
        `;
        
        episodeItem.addEventListener('click', () => {
          playEpisode(episode);
        });
        
        episodesListContainer.appendChild(episodeItem);
      }
    });
  }

  // Воспроизведение серии
  function playEpisode(episode) {
    videoTitle.textContent = `${videoTitle.textContent} - ${episode.number}. ${episode.title}`;
    videoPlayer.src = episode.video_url;
    videoPlayer.load();
    videoPlayer.play();
  }

  // Поиск аниме
  searchBtn.addEventListener('click', searchAnime);
  searchInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
      searchAnime();
    }
  });

  function searchAnime() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (searchTerm.trim() === '') {
      filteredAnime = [...animeData];
    } else {
      filteredAnime = animeData.filter(anime => 
        anime.title.toLowerCase().includes(searchTerm) || 
        anime.description.toLowerCase().includes(searchTerm)
    }
    
    renderAnimeList(filteredAnime);
  }
});
