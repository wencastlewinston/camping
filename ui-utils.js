function filterData(val, btn, type) {
    if (type === 'year') {
        document.querySelectorAll('.year-tag').forEach(t => t.classList.remove('active'));
        currentYearFilter = val;
    } else {
        document.querySelectorAll('.area-tag').forEach(t => t.classList.remove('active'));
        currentAreaFilter = val;
    }
    btn.classList.add('active');
    searchTable();
}

function searchTable() { 
    const searchInput = document.getElementById("searchInput").value.toUpperCase(); 
    document.querySelectorAll(".camp-item").forEach(item => { 
        const text = item.textContent.toUpperCase();
        const matchYear = currentYearFilter === "" || text.includes(currentYearFilter);
        const matchArea = currentAreaFilter === "" || text.includes(currentAreaFilter);
        const matchSearch = searchInput === "" || text.includes(searchInput);
        item.style.display = (matchYear && matchArea && matchSearch) ? "" : "none"; 
    }); 
    updateStats(); 
}

function updateStats() {
    const mainContainers = document.querySelectorAll('#campBody, #list-camping');
    let visibleItems = [];
    mainContainers.forEach(container => {
        const items = Array.from(container.querySelectorAll('.camp-item:not(.is-upcoming)')).filter(item => item.style.display !== 'none');
        visibleItems = visibleItems.concat(items);
    });

    const totalEl = document.getElementById('stat-total');
    if(totalEl) {
        document.getElementById('stat-total').innerText = visibleItems.length;
        document.getElementById('stat-camps').innerText = visibleItems.filter(item => !item.querySelector('.revisit-tag')).length;
        document.getElementById('stat-visit2').innerText = visibleItems.filter(item => {
            const tag = item.querySelector('.revisit-tag');
            return tag && tag.getAttribute('data-visit') === "2";
        }).length;
        document.getElementById('stat-visit3').innerText = visibleItems.filter(item => {
            const tag = item.querySelector('.revisit-tag');
            return tag && parseInt(tag.getAttribute('data-visit')) >= 3;
        }).length;
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
            box.innerHTML = ''; items.reverse().forEach(item => box.appendChild(item)); 
        }
    }); 
}

window.onscroll = () => { 
    const btn = document.getElementById("goTopBtn");
    if(btn) btn.style.display = (window.scrollY > 300) ? "flex" : "none"; 
};
