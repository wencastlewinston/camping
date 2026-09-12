function filterData(val, btn, type) {
    if (type === 'year') {
        document.querySelectorAll('.year-tag').forEach(t => t.classList.remove('active'));
        currentYearFilter = val;
    } else {
        document.querySelectorAll('.area-tag').forEach(t => t.classList.remove('active'));
        currentAreaFilter = val;
    }
    if (btn) btn.classList.add('active');
    searchTable();
}

function searchTable() { 
    const searchInput = document.getElementById("searchInput") ? document.getElementById("searchInput").value.toUpperCase() : ""; 
    document.querySelectorAll(".camp-item").forEach(item => { 
        const text = item.textContent.toUpperCase();
        const locEl = item.querySelector(".camp-location");
        const locText = locEl ? locEl.textContent.toUpperCase() : text;

        const matchYear = currentYearFilter === "" || text.includes(currentYearFilter);
        const matchArea = currentAreaFilter === "" || locText.includes(currentAreaFilter.toUpperCase()) || text.includes(currentAreaFilter.toUpperCase());
        const matchSearch = searchInput === "" || text.includes(searchInput);

        const isMatch = matchYear && matchArea && matchSearch;
        item.style.display = isMatch ? "" : "none"; 
    }); 
    if (window.updateStats) updateStats(); 
}

function updateStats() {
    const mainContainers = document.querySelectorAll('#campBody, #list-camping');
    let visibleItems = [];
    mainContainers.forEach(container => {
        if (container) {
            const items = Array.from(container.querySelectorAll('.camp-item:not(.is-upcoming)')).filter(item => item.style.display !== 'none');
            visibleItems = visibleItems.concat(items);
        }
    });

    const totalEl = document.getElementById('stat-total');
    if(totalEl) {
        totalEl.innerText = visibleItems.length;
        const campsEl = document.getElementById('stat-camps');
        if (campsEl) campsEl.innerText = visibleItems.filter(item => !item.querySelector('.revisit-tag')).length;
        
        const visit2El = document.getElementById('stat-visit2');
        if (visit2El) {
            visit2El.innerText = visibleItems.filter(item => {
                const tag = item.querySelector('.revisit-tag');
                return tag && tag.getAttribute('data-visit') === "2";
            }).length;
        }

        const visit3El = document.getElementById('stat-visit3');
        if (visit3El) {
            visit3El.innerText = visibleItems.filter(item => {
                const tag = item.querySelector('.revisit-tag');
                return tag && parseInt(tag.getAttribute('data-visit')) >= 3;
            }).length;
        }
    }
}

function toggleView() { document.body.classList.toggle("grid-mode"); }

function togglePlaylist(type = 'camping') { 
    const types = ['camping', 'other', 'other3', 'other4', 'other5', 'other6', 'other7', 'other8', 'other9', 'other10'];
    types.forEach(t => {
        if (t !== type) {
            const otherContent = document.getElementById(`list-${t}`);
            const otherArrow = document.getElementById(`arrow-${t}`);
            if (otherContent) otherContent.style.display = "none";
            if (otherArrow) otherArrow.innerText = "展開";
        }
    });

    const content = document.getElementById(`list-${type}`); 
    const arrow = document.getElementById(`arrow-${type}`);
    if (content) {
        const isHidden = content.style.display === "none";
        content.style.display = isHidden ? "block" : "none"; 
        if (arrow) arrow.innerText = isHidden ? "收合" : "展開";
    }
}

function reverseAll() { 
    const boxes = [
        document.getElementById('campBody'),
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
    boxes.forEach(box => { 
        if (box) {
            const items = Array.from(box.children); 
            box.innerHTML = ''; 
            items.reverse().forEach(item => box.appendChild(item)); 
        }
    }); 
}

window.onscroll = () => { 
    const btn = document.getElementById("goTopBtn");
    if(btn) btn.style.display = (window.scrollY > 300) ? "flex" : "none"; 
};
