async function fetchCampData() {
    try {
        const urls = [
            sheetUrl1, sheetUrl2, sheetUrl3, sheetUrl4, sheetUrl5,
            sheetUrl6, sheetUrl7, sheetUrl8, sheetUrl9, sheetUrl10
        ];

        const responses = await Promise.all(urls.map(url => fetch(url)));
        const dataTexts = await Promise.all(responses.map(res => res.text()));

        const parseCsv = (text) => {
            const rows = [];
            let currentRow = "";
            let insideQuotes = false;
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                if (char === '"') insideQuotes = !insideQuotes;
                if (char === '\n' && !insideQuotes) { rows.push(currentRow); currentRow = ""; }
                else { currentRow += char; }
            }
            if (currentRow) rows.push(currentRow);
            return rows;
        };

        const allRows = dataTexts.map(text => parseCsv(text));

        const campBody = document.getElementById('campBody');
        const listContainers = [
            document.getElementById('list-camping'),
            document.getElementById('list-other'),
            document.getElementById('list-other3'),
            document.getElementById('list-other4'),
            document.getElementById('list-other5'),
            document.getElementById('list-other6'),
            document.getElementById('list-other7'),
            document.getElementById('list-other8'),
            document.getElementById('list-other9'),
            document.getElementById('list-other10')
        ];

        const countIds = [
            'count-camping',
            'count-other',
            'count-other3',
            'count-other4',
            'count-other5',
            'count-other6',
            'count-other7',
            'count-other8',
            'count-other9',
            'count-other10'
        ];

        const areaBar = document.getElementById('area-tool-bar');

        if (campBody) campBody.innerHTML = "";
        listContainers.forEach(container => {
            if (container) container.innerHTML = "";
        });

        const currentTrack = {};
        const areas = new Set();

        const createCampItem = (cols, isFriendList = false) => {
            const [cat, count, date, name, v1, v2, v3, playlist, , altitude, location, tentCount, weather, photoLinks] = cols;
            if (location && location.trim() !== "") {
                const cleanLoc = location.trim().replace(/^[\[\(\{（【]+|[\]\}\)）】]+$/g, '').trim();
                if (cleanLoc) {
                    const mainCity = cleanLoc.length >= 2 ? cleanLoc.substring(0, 2) : cleanLoc;
                    if (mainCity) areas.add(mainCity);
                }
            }

            let seasonIcon = "";
            if (date) {
                const month = parseInt(date.split('.')[1]);
                if (month >= 3 && month <= 5) seasonIcon = " 🌸";
                else if (month >= 6 && month <= 8) seasonIcon = " ☀️";
                else if (month >= 9 && month <= 11) seasonIcon = " 🍁";
                else seasonIcon = " ❄️";
            }

            let weatherIcon = "";
            if (weather) {
                const w = weather.trim();
                if (w === "1") weatherIcon = "🌤️";
                else if (w === "2") weatherIcon = " ☁️";
                else if (w === "3") weatherIcon = " 🌧️";
                else if (w === "4") weatherIcon = " ⛈️";
                else if (w !== "") weatherIcon = ` ${w}`;
            }

            const hasVideo = (v1 && v1.trim() !== "") || (v2 && v2.trim() !== "") || (v3 && v3.trim() !== "") || (playlist && playlist.trim() !== "");
            const isUpcoming = !hasVideo;
            let revisitHtml = "";
            if (!isFriendList) {
                currentTrack[name] = (currentTrack[name] || 0) + 1;
                const thisVisitNum = currentTrack[name];
                revisitHtml = (thisVisitNum > 1) ? `<div class="revisit-tag" data-visit="${thisVisitNum}">${"🏅".repeat(thisVisitNum)} 第 ${thisVisitNum} 訪</div>` : "";
            }

            let altHtml = "";
            if (altitude) {
                const altV = parseInt(altitude);
                const barColor = altV > 1000 ? "var(--high)" : (altV > 500 ? "var(--mid)" : "var(--low)");
                const barWidth = Math.min((altV / 2000) * 100, 100);
                altHtml = `<div class="altitude-row"><div class="alt-bar-fill" style="width:${barWidth}%; background:${barColor}; opacity:0.3;"></div><span class="altitude-tag">⛰️ ${altitude}m</span></div>`;
            }
            let tentHtml = (tentCount && tentCount.trim() !== "") ? `<div class="tent-count-tag"><span>🏕️ 同行帳數：${tentCount} 帳</span></div>` : "";

            let idBtnsHtml = `<div class="thumb-id-row">`;
            [v1, v2, v3].forEach((vid, index) => {
                if (vid && vid.trim() !== "") {
                    let iconClass = index === 0 && (!playlist || playlist.trim() === "") ? 'fa-play' : 'fa-stop';
                    let safeVid = vid.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                    const isFirstActive = index === 0 && (!v1 || v1.trim() === "");
                    idBtnsHtml += `<div class="id-btn red-mode ${isFirstActive ? 'active' : ''}" onclick="event.stopPropagation(); if(window.switchThumb) switchThumb(this, '${safeVid}')"><i class="fas ${iconClass}"></i></div>`;
                }
            });
            if (playlist && playlist.trim() !== "") {
                const ytPl = (window.parseYoutube) ? parseYoutube(playlist) : null;
                const plTarget = ytPl ? (ytPl.listId || ytPl.id) : playlist;
                let safePl = plTarget.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const isPlActive = (!v1 || v1.trim() === "");
                idBtnsHtml += `<div class="id-btn red-mode ${isPlActive ? 'active' : ''}" onclick="event.stopPropagation(); if(window.openVid) openVid('${safePl}')"><i class="fas fa-list"></i></div>`;
            }
            if (photoLinks && photoLinks.includes("http")) {
                let safeAlbum = photoLinks.replace(/\n/g, ' ').replace(/`/g, '\\`').replace(/'/g, "\\'");
                idBtnsHtml += `<span class="album-icon-btn" onclick="event.stopPropagation(); if(window.openAlbum) openAlbum(\`${safeAlbum}\`)">📸</span>`;
            }
            idBtnsHtml += `</div>`;

            const item = document.createElement('div');
            item.className = `camp-item fade-in ${isUpcoming ? 'is-upcoming' : ''}`;
            
            let ytTarget = null;
            if (v1 && v1.trim() !== "") {
                ytTarget = (window.parseYoutube) ? parseYoutube(v1) : null;
            } else if (playlist && playlist.trim() !== "") {
                ytTarget = (window.parseYoutube) ? parseYoutube(playlist) : null;
            }

            let thumbUrl = "";
            if (ytTarget && ytTarget.id && !ytTarget.isList) {
                thumbUrl = `https://img.youtube.com/vi/${ytTarget.id}/mqdefault.jpg`;
            } else if (ytTarget && ytTarget.isList) {
                thumbUrl = `https://img.youtube.com/vi/${ytTarget.id}/mqdefault.jpg`;
            }

            let mainThumbAction = "";
            if (!isUpcoming && ytTarget) {
                const targetVal = (v1 && v1.trim() !== "") ? v1 : playlist;
                let safeTarget = targetVal.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                mainThumbAction = `onclick="openVid('${safeTarget}')"`;
            }

            item.innerHTML = `
                <div class="col-thumb">
                    <div class="thumb-box" ${mainThumbAction}>
                        ${isUpcoming ? `<div class="upcoming-thumb"><span class="center-text">預備..</span></div>` : (thumbUrl ? `<img src="${thumbUrl}" class="camp-thumb-img" loading="lazy">` : `<div class="upcoming-thumb"><span class="center-text">播放清單</span></div>`)}
                        <div class="count-badge">${count}</div>
                    </div>
                    ${isUpcoming ? '' : idBtnsHtml}${(!isUpcoming && revisitHtml) ? revisitHtml : ''}
                </div>
                <div class="col-info">
                    <div class="camp-date">📅 ${date}${seasonIcon}${weatherIcon}</div>
                    <div class="camp-location">[${location || '未標註'}]</div>
                    <div class="camp-name-row"><span class="camp-name">${name}</span>${isUpcoming ? '<span class="status-badge">期待中</span>' : ''}</div>
                    ${altHtml}${tentHtml}
                </div>`;
            return { item, cat: cat ? cat.trim() : "" };
        };

        const processRow = (row) => {
            const cols = [];
            let currCol = "";
            let inQ = false;
            for (let i = 0; i < row.length; i++) {
                const c = row[i];
                if (c === '"') inQ = !inQ;
                else if (c === ',' && !inQ) { cols.push(currCol.trim()); currCol = ""; }
                else currCol += c;
            }
            cols.push(currCol.trim());
            return cols;
        };

        allRows[0].slice(1).forEach((row) => {
            const cols = processRow(row);
            if (cols.length < 4) return;
            const { item, cat } = createCampItem(cols, false);
            if (cat === "露營") {
                if (listContainers[0]) listContainers[0].appendChild(item);
            } else {
                if (campBody) campBody.prepend(item);
            }
        });

        for (let i = 1; i < 10; i++) {
            if (allRows[i]) {
                allRows[i].slice(1).forEach((row) => {
                    const cols = processRow(row);
                    if (cols.length < 4) return;
                    const { item } = createCampItem(cols, true);
                    if (listContainers[i]) listContainers[i].appendChild(item);
                });
            }
        }

        listContainers.forEach((container, idx) => {
            if (container) {
                const countEl = document.getElementById(countIds[idx]);
                if (countEl) {
                    const totalItems = container.querySelectorAll('.camp-item').length;
                    countEl.innerText = `(${totalItems})`;
                }
            }
        });

        if (areaBar) {
            areaBar.innerHTML = '';
            const allTag = document.createElement('div');
            allTag.className = 'tag active area-tag';
            allTag.innerText = '所有地區';
            allTag.onclick = function() { filterData('', this, 'area'); };
            areaBar.appendChild(allTag);

            Array.from(areas).sort().forEach(city => {
                const tag = document.createElement('div');
                tag.className = 'tag area-tag'; 
                tag.innerText = city;
                tag.onclick = function() { filterData(city, this, 'area'); };
                areaBar.appendChild(tag);
            });
        }

        if(window.updateStats) updateStats();

    } catch (e) {
        console.error("載入失敗：", e);
    }
}

fetchCampData();
