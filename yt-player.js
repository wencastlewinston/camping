function parseYoutube(idOrUrl) {
    if (!idOrUrl || idOrUrl.trim() === "") return null;
    const str = idOrUrl.trim();
    if (str.includes("v=")) {
        const vid = str.split("v=")[1].split("&")[0];
        const listId = str.includes("list=") ? str.split("list=")[1].split("&")[0] : null;
        return { id: vid, listId: listId, isList: false };
    }
    if (str.includes("youtu.be/")) {
        const vid = str.split("youtu.be/")[1].split("?")[0];
        const listId = str.includes("list=") ? str.split("list=")[1].split("&")[0] : null;
        return { id: vid, listId: listId, isList: false };
    }
    if (str.includes("list=")) {
        return { id: str.split("list=")[1].split("&")[0], listId: str.split("list=")[1].split("&")[0], isList: true };
    }
    return { id: str, listId: null, isList: false };
}

function switchThumb(btn, vid) {
    const container = btn.closest('.col-thumb');
    const thumbImg = container.querySelector('.camp-thumb-img');
    const thumbBox = container.querySelector('.thumb-box');
    const btns = container.querySelectorAll('.id-btn');
    
    btns.forEach(b => {
        b.classList.remove('active');
        const icon = b.querySelector('i');
        if (icon) { icon.classList.remove('fa-play'); icon.classList.add('fa-stop'); }
    });

    btn.classList.add('active');
    const currentIcon = btn.querySelector('i');
    if (currentIcon) { currentIcon.classList.remove('fa-stop'); currentIcon.classList.add('fa-play'); }

    const yt = parseYoutube(vid);
    if (yt && thumbImg) {
        if (!yt.isList && yt.id) {
            thumbImg.src = `https://img.youtube.com/vi/${yt.id}/mqdefault.jpg`;
        }
        if (thumbBox) thumbBox.onclick = () => openVid(vid);
    }
}

function openVid(u) { 
    const yt = parseYoutube(u); 
    if(!yt) return; 
    const player = document.getElementById('popup_player');
    const overlay = document.getElementById('videoOverlay');
    if (player) {
        if (yt.isList) {
            player.src = `https://www.youtube.com/embed/videoseries?list=${yt.id}&autoplay=1`;
        } else if (yt.listId) {
            player.src = `https://www.youtube.com/embed/${yt.id}?list=${yt.listId}&autoplay=1`;
        } else {
            player.src = `https://www.youtube.com/embed/${yt.id}?autoplay=1`;
        }
    }
    if (overlay) overlay.style.display = 'flex'; 
}

function closeVid() { 
    const player = document.getElementById('popup_player');
    const overlay = document.getElementById('videoOverlay');
    if (player) player.src = ""; 
    if (overlay) overlay.style.display = 'none'; 
}

function openAlbum(linksText) {
    if (!linksText || linksText.trim() === "" || linksText === "undefined") return;
    currentAlbum = linksText.replace(/"/g, '').split(/[\s,]+/).filter(link => link.startsWith('http'));
    if (currentAlbum.length === 0) return;
    currentIndex = 0;
    renderPhoto();
    const overlay = document.getElementById('albumOverlay');
    if (overlay) overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function renderPhoto() {
    const mainPhoto = document.getElementById('mainPhoto');
    const strip = document.getElementById('filmstrip');
    if (!mainPhoto || !strip) return;
    mainPhoto.style.opacity = '0.5';
    mainPhoto.src = currentAlbum[currentIndex];
    mainPhoto.onload = () => { mainPhoto.style.opacity = '1'; };
    strip.innerHTML = "";
    currentAlbum.forEach((link, index) => {
        const img = document.createElement('img');
        img.src = link.includes('iili.io') ? link.replace(/\.(jpg|png|jpeg)$/i, '.md.$1') : link; 
        img.className = `strip-thumb ${index === currentIndex ? 'active' : ''}`;
        img.onclick = (e) => { e.stopPropagation(); stopAutoPlay(); currentIndex = index; renderPhoto(); };
        strip.appendChild(img);
    });
    const activeThumb = strip.querySelector('.active');
    if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function toggleAutoPlay() { if (isAutoPlaying) stopAutoPlay(); else startAutoPlay(); }
function startAutoPlay() {
    if (currentAlbum.length <= 1) return;
    isAutoPlaying = true;
    const btn = document.getElementById('autoPlayBtn');
    if (btn) { btn.innerText = "⏸️"; btn.classList.add('playing'); }
    autoPlayTimer = setInterval(() => {
        currentIndex = (currentIndex < currentAlbum.length - 1) ? currentIndex + 1 : 0;
        renderPhoto();
    }, 3000);
}
function stopAutoPlay() {
    isAutoPlaying = false;
    const btn = document.getElementById('autoPlayBtn');
    if (btn) { btn.innerText = "▶️"; btn.classList.remove('playing'); }
    if (autoPlayTimer) { clearInterval(autoPlayTimer); autoPlayTimer = null; }
}
function closeAlbum() { 
    stopAutoPlay();
    const overlay = document.getElementById('albumOverlay');
    if (overlay) overlay.style.display = 'none'; 
    document.body.style.overflow = 'auto';
}

const albumOverlay = document.getElementById('albumOverlay');
if (albumOverlay) {
    albumOverlay.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, false);
    albumOverlay.addEventListener('touchend', e => { touchEndX = e.changedTouches[0].screenX; 
        if (Math.abs(touchEndX - touchStartX) > 50) {
            stopAutoPlay();
            if (touchEndX < touchStartX) { if (currentIndex < currentAlbum.length - 1) { currentIndex++; renderPhoto(); } }
            else { if (currentIndex > 0) { currentIndex--; renderPhoto(); } }
        }
    }, false);
}
