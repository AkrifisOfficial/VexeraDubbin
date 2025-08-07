// Воспроизведение эпизода (новая версия)
function playEpisode(episode) {
    currentEpisode = episode;
    videoPlaceholder.style.display = 'none';
    
    // Парсим URL видео VK
    const urlParts = episode.vk_url.match(/video-(\d+)_(\d+)/);
    if (!urlParts || urlParts.length < 3) {
        console.error("Неверный формат URL видео VK");
        return;
    }
    
    const owner_id = urlParts[1];
    const video_id = urlParts[2];
    
    // Удаляем предыдущий плеер
    const oldPlayer = document.getElementById('video-player');
    if (oldPlayer) oldPlayer.remove();
    
    // Создаём iframe плеера VK
    const iframe = document.createElement('iframe');
    iframe.id = 'video-player';
    iframe.src = `https://vk.com/video_ext.php?oid=${owner_id}&id=${video_id}&hash=123abc`;
    iframe.allowFullscreen = true;
    iframe.setAttribute('frameborder', '0');
    
    document.getElementById('player-container').appendChild(iframe);
    loadVKComments(episode);
    addToHistory(currentAnime, episode);
}

// Загрузка комментариев VK (обновлённая)
function loadVKComments(episode) {
    const urlParts = episode.vk_url.match(/video-(\d+)_(\d+)/);
    if (!urlParts) return;
    
    const pageId = `video_${urlParts[1]}_${urlParts[2]}`;
    initVKWidget(pageId);
}
