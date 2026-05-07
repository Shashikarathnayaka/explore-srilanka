
function loadPage(pageName) {
    // ① Hide all pages
    document.querySelectorAll(".page").forEach(function (p) {
        p.classList.remove("active");
    });

    // ② Show the target page
    var target = document.getElementById("page-" + pageName);
    if (target) {
        target.classList.add("active");
    }

    // ③ Update active nav link highlight
    document.querySelectorAll(".nav-link").forEach(function (link) {
        link.classList.remove("active");
        if (link.getAttribute("data-page") === pageName) {
            link.classList.add("active");
        }
    });

    // ④ Scroll content area to top on page switch
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* Logo click → go home */
document.querySelector(".logo-container").addEventListener("click", function () {
    loadPage("home");
});

/* ──────────────────────────────────────────
   NAVBAR SCROLL EFFECT
────────────────────────────────────────── */
window.addEventListener("scroll", function () {
    var navbar = document.getElementById("navbar");
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

/* ──────────────────────────────────────────
   SEARCH FUNCTION
────────────────────────────────────────── */
function searchDestination() {
    var input = document.getElementById("searchInput").value.toLowerCase().trim();
    var cards = document.querySelectorAll(".card");

    // Filter home page cards
    cards.forEach(function (card) {
        var title = card.querySelector("h3").textContent.toLowerCase();
        card.style.display = (input === "" || title.includes(input)) ? "" : "none";
    });

    // PHP server-side search
    if (input !== "") {
        fetch("../php/search.php?q=" + encodeURIComponent(input))
            .then(function (res) { return res.text(); })
            .then(function (data) {
                document.getElementById("php-result-content").innerHTML = data;
                document.getElementById("php-results").style.display = "block";
            })
            .catch(function () {
                document.getElementById("php-results").style.display = "none";
            });
    } else {
        document.getElementById("php-results").style.display = "none";
    }
}

// Enter key triggers search
document.getElementById("searchInput").addEventListener("keyup", function () {
    searchDestination();
});

/* ──────────────────────────────────────────
   STAR RATING
────────────────────────────────────────── */
document.querySelectorAll(".stars").forEach(function (starBox) {
    var stars = starBox.querySelectorAll("i");
    var scoreEl = starBox.nextElementSibling
        ? starBox.nextElementSibling.querySelector(".score")
        : null;

    stars.forEach(function (star, index) {
        // Hover preview
        star.addEventListener("mouseover", function () {
            stars.forEach(function (s, i) {
                s.classList.toggle("active", i <= index);
            });
        });

        // Reset on mouseout (back to saved state)
        star.addEventListener("mouseout", function () {
            var saved = parseInt(starBox.getAttribute("data-rating") || "0");
            stars.forEach(function (s, i) {
                s.classList.toggle("active", i < saved);
            });
        });

        // Click to save rating
        star.addEventListener("click", function () {
            var rating = index + 1;
            starBox.setAttribute("data-rating", rating);

            stars.forEach(function (s, i) {
                s.classList.toggle("active", i < rating);
            });

            if (scoreEl) { scoreEl.textContent = rating; }

            // Send to server
            var placeName = starBox.closest(".place").querySelector("h3").textContent;
            fetch("save_rating.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: "place=" + encodeURIComponent(placeName) + "&rating=" + rating
            });
        });
    });
});

/* ──────────────────────────────────────────
   COMMENT SYSTEM
────────────────────────────────────────── */
function addComment(btn) {
    var box = btn.parentElement;
    var input = box.querySelector("input");
    var text = input.value.trim();
    if (text === "") return;

    // Send to server
    var placeName = box.closest(".place").querySelector("h3").textContent;
    fetch("save_comment.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "place=" + encodeURIComponent(placeName) + "&comment=" + encodeURIComponent(text)
    });

    // Show on page
    var commentArea = box.nextElementSibling;
    var p = document.createElement("p");
    p.textContent = "💬 " + text;
    p.style.borderBottom = "1px solid #eee";
    p.style.padding = "5px 0";
    commentArea.appendChild(p);
    input.value = "";
}

/* ──────────────────────────────────────────
   CONTACT FORM
────────────────────────────────────────── */
function submitContact(e) {
    e.preventDefault();
    var btn = e.target.querySelector("button[type=submit]");
    btn.textContent = "✅ Message Sent!";
    btn.style.background = "#01951a";
    setTimeout(function () {
        btn.textContent = "Send Message";
        btn.style.background = "";
        e.target.reset();
    }, 3000);
}

/* ── Navbar login state check ── */
function updateNavAuth() {
    var user = JSON.parse(localStorage.getItem('esl_current_user') || 'null');
    var authOut = document.getElementById('auth-out');
    var authIn = document.getElementById('auth-in');
    var nameEl = document.getElementById('nav-user-name');

    if (user) {
        authOut.style.display = 'none';
        authIn.style.display = 'flex';
        nameEl.textContent = user.name;
    } else {
        authOut.style.display = 'flex';
        authIn.style.display = 'none';
    }
}

function logoutUser() {
    localStorage.removeItem('esl_current_user');
    localStorage.removeItem('esl_remember');
    updateNavAuth();
}

window.addEventListener('load', updateNavAuth);

(function () {

    /* ── State ── */
    let activePill = 'all';

    window.filterHotels = function () {
        const input = document.getElementById('hotelSearchInput');
        const clearBtn = document.getElementById('hotelClearBtn');
        const query = input.value.trim().toLowerCase();

        /* Show/hide clear button */
        clearBtn.classList.toggle('visible', query.length > 0);

        /* When user types, deactivate pills */
        if (query.length > 0) {
            setActivePill('all', false);   // visually reset pills
        }

        applyFilter(query);
    };

    /* ══════════════════════════════════════
       PILL FILTER  –  called by pill buttons
    ══════════════════════════════════════ */
    window.setPillFilter = function (btn, loc) {
        /* Clear text input */
        const input = document.getElementById('hotelSearchInput');
        const clearBtn = document.getElementById('hotelClearBtn');
        input.value = '';
        clearBtn.classList.remove('visible');

        activePill = loc;
        setActivePill(loc, true);
        applyFilter('', loc);
    };

    /* ══════════════════════════════════════
       CLEAR BUTTON
    ══════════════════════════════════════ */
    window.clearHotelSearch = function () {
        const input = document.getElementById('hotelSearchInput');
        const clearBtn = document.getElementById('hotelClearBtn');
        input.value = '';
        clearBtn.classList.remove('visible');
        activePill = 'all';
        setActivePill('all', true);
        applyFilter('');
    };

    /* ══════════════════════════════════════
       CORE FILTER LOGIC
       - query  : text typed in search box (lowercase)
       - locKey : pill location key  (e.g. 'ella') or 'all'
    ══════════════════════════════════════ */
    function applyFilter(query, locKey) {
        const cards = document.querySelectorAll('#hotelGrid .hotel-card');
        const noRes = document.getElementById('hotelNoResults');
        const countEl = document.getElementById('hotelResultCount');

        /* Resolve active location */
        const loc = locKey !== undefined ? locKey : activePill;

        let visible = 0;

        cards.forEach(function (card) {
            const cardLoc = card.getAttribute('data-location').toLowerCase();
            const cardText = card.innerText.toLowerCase();

            const matchLoc = (loc === 'all') || (cardLoc === loc);
            const matchQuery = (query === '') || cardText.includes(query);

            if (matchLoc && matchQuery) {
                card.classList.remove('hidden');
                /* Re-trigger fade-in animation */
                card.style.animation = 'none';
                card.offsetHeight;               // reflow
                card.style.animation = '';
                visible++;
            } else {
                card.classList.add('hidden');
            }
        });

        /* No-results state */
        if (noRes) {
            noRes.style.display = visible === 0 ? 'block' : 'none';
        }

        /* Result count text */
        if (countEl) {
            if (visible === cards.length) {
                countEl.textContent = 'Showing all ' + cards.length + ' hotels';
            } else if (visible === 0) {
                countEl.textContent = 'No hotels found';
            } else {
                const locLabel = loc === 'all' ? '' : ' in ' + capitalize(loc);
                countEl.textContent = 'Showing ' + visible + ' hotel' + (visible > 1 ? 's' : '') + locLabel;
            }
        }
    }

    /* ══════════════════════════════════════
       PILL ACTIVE STATE HELPER
    ══════════════════════════════════════ */
    function setActivePill(loc, activate) {
        const pills = document.querySelectorAll('.hotel-location-pills .pill');
        pills.forEach(function (p) {
            p.classList.toggle('active', activate && p.getAttribute('data-loc') === loc);
        });
    }

    /* ══════════════════════════════════════
       BOOKING MODAL
    ══════════════════════════════════════ */
    window.bookHotel = function (hotelName) {
        const overlay = document.getElementById('hotelModal');
        const nameEl = document.getElementById('modalHotelName');
        if (!overlay || !nameEl) return;

        nameEl.textContent = '🏨 ' + hotelName;
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    window.closeHotelModal = function (event) {
        /* If called from overlay click, only close when clicking the backdrop itself */
        if (event && event.target !== document.getElementById('hotelModal')) return;

        const overlay = document.getElementById('hotelModal');
        if (overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
    };

    /* Close modal with Escape key */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('hotelModal');
            if (overlay && overlay.classList.contains('open')) {
                overlay.classList.remove('open');
                document.body.style.overflow = '';
            }
        }
    });

    /* ══════════════════════════════════════
       SYNC WITH MAIN SEARCH BOX
       When user searches via the main search bar
       (searchDestination()), also filter hotels.
    ══════════════════════════════════════ */
    var _origSearch = window.searchDestination;
    window.searchDestination = function () {
        if (typeof _origSearch === 'function') _origSearch();

        /* Mirror main search into hotel filter */
        var mainInput = document.getElementById('searchInput');
        if (mainInput) {
            var q = mainInput.value.trim().toLowerCase();
            var hotelInput = document.getElementById('hotelSearchInput');
            if (hotelInput) {
                hotelInput.value = q;
                var clearBtn = document.getElementById('hotelClearBtn');
                if (clearBtn) clearBtn.classList.toggle('visible', q.length > 0);
            }
            setActivePill('all', false);
            applyFilter(q);
        }
    };

    /* ══════════════════════════════════════
       UTILITY
    ══════════════════════════════════════ */
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /* Initial count display on load */
    document.addEventListener('DOMContentLoaded', function () {
        var cards = document.querySelectorAll('#hotelGrid .hotel-card');
        var countEl = document.getElementById('hotelResultCount');
        if (countEl && cards.length) {
            countEl.textContent = 'Showing all ' + cards.length + ' hotels';
        }
    });

})();


/*/////////////////////////////////*/
/* ═══════════════════════════════════════════════════════
   hotels.js  –  Hotel Section: Filter + Booking Logic
   /* ════════════════════════════════════════
   CULTURAL EVENTS - JavaScript
   Save as: cultural-events.js
════════════════════════════════════════ */

// ── Event Data ──────────────────────────────────────────────────
// const culturalEventsData = [
//     {
//         id: 1,
//         name: "Esala Perahera",
//         category: "religious",
//         categoryLabel: "Religious",
//         date: { day: "19", month: "Aug" },
//         location: "Kandy",
//         duration: "10 Days",
//         status: "upcoming",
//         image: "images/maligawa.jpg",
//         shortDesc: "Sri Lanka's grandest and most sacred procession celebrating the Sacred Tooth Relic.",
//         fullDesc: "The Esala Perahera in Kandy is one of the oldest and grandest Buddhist festivals in the world. This magnificent procession features elaborately decorated elephants, traditional Kandyan dancers, fire-breathers, and drummers parading through the streets of Kandy at night. The festival honours the Sacred Tooth Relic of the Buddha enshrined at Sri Dalada Maligawa."
//     },
//     {
//         id: 2,
//         name: "Sinhala & Tamil New Year",
//         category: "festival",
//         categoryLabel: "Festival",
//         date: { day: "13", month: "Apr" },
//         location: "Island-Wide",
//         duration: "2 Days",
//         status: "upcoming",
//         image: "images/hero-sri-lanka.jpg",
//         shortDesc: "The most celebrated national festival marking the traditional new year.",
//         fullDesc: "Celebrated on April 13–14, the Sinhala and Tamil New Year (Aluth Avurudda / Puthandu) marks the end of the harvest season. Families light the hearth at the auspicious time, prepare traditional sweets like kavum and kokis, play village games, and visit elders. It's a vibrant nationwide celebration uniting communities across the island."
//     },
//     {
//         id: 3,
//         name: "Vesak Festival",
//         category: "religious",
//         categoryLabel: "Religious",
//         date: { day: "12", month: "May" },
//         location: "Island-Wide",
//         duration: "2 Days",
//         status: "ongoing",
//         image: "images/maligawa.jpg",
//         shortDesc: "The most important Buddhist festival illuminating the island with lanterns and dansalas.",
//         fullDesc: "Vesak commemorates the birth, enlightenment, and passing of the Buddha. Sri Lanka transforms into a magical world of hand-crafted paper lanterns, illuminated pandals (thoranas) depicting Jataka stories, and free food stalls (dansalas). Streets are pedestrianized and the entire nation comes alive with colour, light and devotion."
//     },
//     {
//         id: 4,
//         name: "Galle Literary Festival",
//         category: "cultural",
//         categoryLabel: "Cultural",
//         date: { day: "23", month: "Jan" },
//         location: "Galle Fort",
//         duration: "5 Days",
//         status: "upcoming",
//         image: "images/ella.jpg",
//         shortDesc: "A world-class literary festival held inside the historic UNESCO Galle Fort.",
//         fullDesc: "The Galle Literary Festival attracts award-winning authors, poets, and thinkers from across the globe to the stunning UNESCO World Heritage Galle Fort. Events include readings, panel discussions, workshops, and cultural performances. It celebrates literature, ideas, and Sri Lanka's vibrant arts scene against an extraordinary colonial backdrop."
//     },
//     {
//         id: 5,
//         name: "Arugam Bay Surf Festival",
//         category: "sport",
//         categoryLabel: "Sport",
//         date: { day: "15", month: "Jul" },
//         location: "Arugam Bay",
//         duration: "3 Days",
//         status: "upcoming",
//         image: "images/mirs.jpg",
//         shortDesc: "International surf competition on one of the world's top point breaks.",
//         fullDesc: "Held at Arugam Bay — ranked among the world's top 10 surf spots — this festival brings together professional surfers from around the globe. Alongside competitive surfing, the event features beach parties, local food stalls, arts and crafts, and live music celebrating Sri Lanka's vibrant coastal culture and surf community."
//     },
//     {
//         id: 6,
//         name: "Navam Perahera",
//         category: "religious",
//         categoryLabel: "Religious",
//         date: { day: "11", month: "Feb" },
//         location: "Colombo",
//         duration: "2 Nights",
//         status: "upcoming",
//         image: "images/hero-sri-lanka.jpg",
//         shortDesc: "Colombo's spectacular full-moon procession with over 50 elephants.",
//         fullDesc: "The Navam Perahera at Gangaramaya Temple in Colombo is one of the most spectacular Buddhist processions in the country. Held on the full moon day of Navam (February), it features over 50 caparisoned elephants, traditional dancers, musicians, acrobats, and torch bearers parading through the streets around Viharamahadevi Park."
//     }
// ];

// // ── State ────────────────────────────────────────────────────────
// let activeEventFilter = 'all';

// // ── Render Events ────────────────────────────────────────────────
// function renderCulturalEvents(filter) {
//     const grid = document.getElementById('eventsGrid');
//     const noResults = document.getElementById('eventsNoResults');
//     if (!grid) return;

//     let visible = 0;
//     const cards = grid.querySelectorAll('.event-card');

//     cards.forEach(card => {
//         const cat = card.dataset.category;
//         const show = filter === 'all' || cat === filter;
//         card.classList.toggle('hidden', !show);
//         if (show) visible++;
//     });

//     noResults.style.display = visible === 0 ? 'block' : 'none';
// }

// // ── Tab Filter ───────────────────────────────────────────────────
// function setEventFilter(btn, filter) {
//     document.querySelectorAll('.events-filter-tabs .tab-btn').forEach(b => b.classList.remove('active'));
//     btn.classList.add('active');
//     activeEventFilter = filter;
//     renderCulturalEvents(filter);
// }

// // ── Open Event Modal ─────────────────────────────────────────────
// function openEventModal(id) {
//     const ev = culturalEventsData.find(e => e.id === id);
//     if (!ev) return;

//     const overlay = document.getElementById('eventModal');
//     const tagClass = `tag-${ev.category}`;

//     document.getElementById('modalEventCatTag').className = `modal-cat-tag ${tagClass}`;
//     document.getElementById('modalEventCatTag').textContent = ev.categoryLabel;
//     document.getElementById('modalEventTitle').textContent = ev.name;
//     document.getElementById('modalEventDate').textContent = `${ev.date.day} ${ev.date.month}`;
//     document.getElementById('modalEventLocation').textContent = ev.location;
//     document.getElementById('modalEventDuration').textContent = ev.duration;
//     document.getElementById('modalEventDesc').textContent = ev.fullDesc;

//     overlay.classList.add('open');
//     document.body.style.overflow = 'hidden';
// }

// // ── Close Event Modal ────────────────────────────────────────────
// function closeEventModal(e) {
//     if (e && e.target !== document.getElementById('eventModal')) return;
//     document.getElementById('eventModal').classList.remove('open');
//     document.body.style.overflow = '';
// }

// function closeEventModalBtn() {
//     document.getElementById('eventModal').classList.remove('open');
//     document.body.style.overflow = '';
// }

// // ── Init on DOM Ready ────────────────────────────────────────────
// document.addEventListener('DOMContentLoaded', function () {
//     renderCulturalEvents('all');
// });


/* ════════════════════════════════════════
   CULTURAL EVENTS - JavaScript
   Save as: cultural-events.js
════════════════════════════════════════ */

// ── Event Data ──────────────────────────────────────────────────
const culturalEventsData = [
    {
        id: 1,
        name: "Esala Perahera",
        category: "religious",
        categoryLabel: "Religious",
        date: { day: "19", month: "Aug" },
        location: "Kandy",
        duration: "10 Days",
        status: "upcoming",
        image: "images/maligawa.jpg",
        shortDesc: "Sri Lanka's grandest and most sacred procession celebrating the Sacred Tooth Relic.",
        fullDesc: "The Esala Perahera in Kandy is one of the oldest and grandest Buddhist festivals in the world. This magnificent procession features elaborately decorated elephants, traditional Kandyan dancers, fire-breathers, and drummers parading through the streets of Kandy at night. The festival honours the Sacred Tooth Relic of the Buddha enshrined at Sri Dalada Maligawa."
    },
    {
        id: 2,
        name: "Sinhala & Tamil New Year",
        category: "festival",
        categoryLabel: "Festival",
        date: { day: "13", month: "Apr" },
        location: "Island-Wide",
        duration: "2 Days",
        status: "upcoming",
        image: "images/hero-sri-lanka.jpg",
        shortDesc: "The most celebrated national festival marking the traditional new year.",
        fullDesc: "Celebrated on April 13–14, the Sinhala and Tamil New Year (Aluth Avurudda / Puthandu) marks the end of the harvest season. Families light the hearth at the auspicious time, prepare traditional sweets like kavum and kokis, play village games, and visit elders. It's a vibrant nationwide celebration uniting communities across the island."
    },
    {
        id: 3,
        name: "Vesak Festival",
        category: "religious",
        categoryLabel: "Religious",
        date: { day: "12", month: "May" },
        location: "Island-Wide",
        duration: "2 Days",
        status: "ongoing",
        image: "images/maligawa.jpg",
        shortDesc: "The most important Buddhist festival illuminating the island with lanterns and dansalas.",
        fullDesc: "Vesak commemorates the birth, enlightenment, and passing of the Buddha. Sri Lanka transforms into a magical world of hand-crafted paper lanterns, illuminated pandals (thoranas) depicting Jataka stories, and free food stalls (dansalas). Streets are pedestrianized and the entire nation comes alive with colour, light and devotion."
    },
    {
        id: 4,
        name: "Galle Literary Festival",
        category: "cultural",
        categoryLabel: "Cultural",
        date: { day: "23", month: "Jan" },
        location: "Galle Fort",
        duration: "5 Days",
        status: "upcoming",
        image: "images/ella.jpg",
        shortDesc: "A world-class literary festival held inside the historic UNESCO Galle Fort.",
        fullDesc: "The Galle Literary Festival attracts award-winning authors, poets, and thinkers from across the globe to the stunning UNESCO World Heritage Galle Fort. Events include readings, panel discussions, workshops, and cultural performances. It celebrates literature, ideas, and Sri Lanka's vibrant arts scene against an extraordinary colonial backdrop."
    },
    {
        id: 5,
        name: "Arugam Bay Surf Festival",
        category: "sport",
        categoryLabel: "Sport",
        date: { day: "15", month: "Jul" },
        location: "Arugam Bay",
        duration: "3 Days",
        status: "upcoming",
        image: "images/mirs.jpg",
        shortDesc: "International surf competition on one of the world's top point breaks.",
        fullDesc: "Held at Arugam Bay — ranked among the world's top 10 surf spots — this festival brings together professional surfers from around the globe. Alongside competitive surfing, the event features beach parties, local food stalls, arts and crafts, and live music celebrating Sri Lanka's vibrant coastal culture and surf community."
    },
    {
        id: 6,
        name: "Navam Perahera",
        category: "religious",
        categoryLabel: "Religious",
        date: { day: "11", month: "Feb" },
        location: "Colombo",
        duration: "2 Nights",
        status: "upcoming",
        image: "images/hero-sri-lanka.jpg",
        shortDesc: "Colombo's spectacular full-moon procession with over 50 elephants.",
        fullDesc: "The Navam Perahera at Gangaramaya Temple in Colombo is one of the most spectacular Buddhist processions in the country. Held on the full moon day of Navam (February), it features over 50 caparisoned elephants, traditional dancers, musicians, acrobats, and torch bearers parading through the streets around Viharamahadevi Park."
    }
];

// ── State ────────────────────────────────────────────────────────
let activeEventFilter = 'all';

// ── Render Events ────────────────────────────────────────────────
function renderCulturalEvents(filter) {
    const grid = document.getElementById('eventsGrid');
    const noResults = document.getElementById('eventsNoResults');
    if (!grid) return;

    let visible = 0;
    const cards = grid.querySelectorAll('.event-card');

    cards.forEach(card => {
        const cat = card.dataset.category;
        const show = filter === 'all' || cat === filter;
        card.classList.toggle('hidden', !show);
        if (show) visible++;
    });

    noResults.style.display = visible === 0 ? 'block' : 'none';
}

// ── Tab Filter ───────────────────────────────────────────────────
function setEventFilter(btn, filter) {
    document.querySelectorAll('.events-filter-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeEventFilter = filter;
    renderCulturalEvents(filter);
}

// ── Open Event Modal ─────────────────────────────────────────────
function openEventModal(id) {
    const ev = culturalEventsData.find(e => e.id === id);
    if (!ev) return;

    const overlay = document.getElementById('eventModal');
    const tagClass = `tag-${ev.category}`;

    document.getElementById('modalEventCatTag').className = `modal-cat-tag ${tagClass}`;
    document.getElementById('modalEventCatTag').textContent = ev.categoryLabel;
    document.getElementById('modalEventTitle').textContent = ev.name;
    document.getElementById('modalEventDate').textContent = `${ev.date.day} ${ev.date.month}`;
    document.getElementById('modalEventLocation').textContent = ev.location;
    document.getElementById('modalEventDuration').textContent = ev.duration;
    document.getElementById('modalEventDesc').textContent = ev.fullDesc;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

// ── Close Event Modal ────────────────────────────────────────────
function closeEventModal(e) {
    if (e && e.target !== document.getElementById('eventModal')) return;
    document.getElementById('eventModal').classList.remove('open');
    document.body.style.overflow = '';
}

function closeEventModalBtn() {
    document.getElementById('eventModal').classList.remove('open');
    document.body.style.overflow = '';
}

// ── Gallery Page Filter (separate grid) ─────────────────────────
function setEventFilterGallery(btn, filter) {
    // reset only the gallery tab group
    btn.closest('.events-filter-tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const grid = document.getElementById('eventsGridGallery');
    const noResults = document.getElementById('eventsNoResultsGallery');
    if (!grid) return;

    let visible = 0;
    grid.querySelectorAll('.event-card').forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !show);
        if (show) visible++;
    });

    noResults.style.display = visible === 0 ? 'block' : 'none';
}

// ── Init on DOM Ready ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    renderCulturalEvents('all');
});
function showDetail(place) {
    alert('Showing details for: ' + place);
}
// ══════════════════════════════════════
//  TRADITIONAL FOODS — Data & Logic
// ══════════════════════════════════════

const foodData = {
    1: {
        title: 'Rice & Curry',
        category: 'Rice & Curry',
        location: 'Island-Wide',
        spice: 'Mild to Spicy',
        desc: 'Sri Lanka\'s national dish. A plate of steamed rice surrounded by multiple curries — typically dhal, chicken or fish curry, pol sambol (coconut relish), and crispy papadum. Every household and region has its own unique recipe passed down through generations. Best enjoyed on a banana leaf for the full experience.'
    },
    2: {
        title: 'Kottu Roti',
        category: 'Snack',
        location: 'Island-Wide',
        spice: 'Medium',
        desc: 'Made by chopping up godamba roti on a hot griddle with vegetables, eggs, cheese, or meat and a blend of spices. The rhythmic clanging of the metal blades is the signature sound of Sri Lankan street food culture. Available in chicken, beef, egg, or vegetable varieties.'
    },
    3: {
        title: 'Hoppers (Appa)',
        category: 'Snack',
        location: 'Colombo, Kandy',
        spice: 'Mild',
        desc: 'Fermented rice flour and coconut milk batter poured into a small wok-shaped pan, creating a crispy bowl with a soft centre. Egg hoppers have an egg cracked into the centre while it cooks. String hoppers (idiyappam) are a steamed noodle variation. Served with lunu miris (onion chilli paste) or coconut sambol.'
    },
    4: {
        title: 'Jaffna Crab Curry',
        category: 'Seafood',
        location: 'Jaffna',
        spice: 'Very Spicy',
        desc: 'A fiercely spiced crab curry from Sri Lanka\'s Northern Province. Cooked with freshly ground Jaffna curry powder, dried red chillies, and coconut milk. The unique Jaffna spice blend gives this dish an unmatched depth of flavour. Best enjoyed with string hoppers or steamed rice.'
    },
    5: {
        title: 'Watalappan',
        category: 'Sweet',
        location: 'Island-Wide',
        spice: 'Not Spicy',
        desc: 'A creamy steamed pudding of Malay origin, made with coconut milk, jaggery (kithul treacle), eggs, and warming spices like cardamom and nutmeg. Often garnished with cashew nuts. A staple at Eid celebrations and Muslim households, but enjoyed island-wide at special occasions and restaurants.'
    },
    6: {
        title: 'Isso Vadai',
        category: 'Seafood',
        location: 'Negombo, Jaffna',
        spice: 'Medium',
        desc: 'Crispy deep-fried lentil fritters topped with whole prawns (isso), chillies, and onion. A beloved coastal snack sold by vendors at beachside stalls and markets. The crunchy exterior, soft interior, and juicy prawn on top make it one of Sri Lanka\'s most addictive street foods.'
    },
    7: {
        title: 'Kavum',
        category: 'Sweet',
        location: 'Island-Wide',
        spice: 'Not Spicy',
        desc: 'Traditional deep-fried sweet cakes made from rice flour and kithul treacle (dark palm jaggery syrup). A quintessential Sri Lankan New Year (Avurudu) treat, shaped into round discs and fried to a deep golden colour. Often made alongside kokis (crispy Dutch-influenced fried pastries) as part of festive preparations.'
    },
    8: {
        title: 'Lamprais',
        category: 'Rice & Curry',
        location: 'Colombo',
        spice: 'Mild',
        desc: 'A Dutch-Burgher heritage dish — rice cooked in stock, accompanied by a combination of curries, a blachan (prawn paste), and other accompaniments, all wrapped together in a banana leaf and baked. The banana leaf infuses a unique earthy aroma. A beloved Sunday lunch tradition among Burgher communities in Colombo.'
    }
};

// ── Filter tabs ──────────────────────
function setFoodFilter(btn, cat) {
    document.querySelectorAll('.food-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    let visible = 0;
    document.querySelectorAll('.food-card').forEach(card => {
        const show = cat === 'all' || card.dataset.category === cat;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
    });

    const noResults = document.getElementById('foodsNoResults');
    if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
}

// ── Modal open ───────────────────────
function openFoodModal(id) {
    const data = foodData[id];
    if (!data) return;

    document.getElementById('modalFoodTitle').textContent = data.title;
    document.getElementById('modalFoodLocation').textContent = data.location;
    document.getElementById('modalFoodSpice').textContent = data.spice;
    document.getElementById('modalFoodDesc').textContent = data.desc;

    const catTag = document.getElementById('modalFoodCatTag');
    catTag.textContent = data.category;
    catTag.className = 'modal-food-cat-tag';

    const catClassMap = {
        'Rice & Curry': 'tag-rice',
        'Snack': 'tag-snack',
        'Sweet': 'tag-sweet',
        'Seafood': 'tag-seafood'
    };
    catTag.classList.add(catClassMap[data.category] || '');

    document.getElementById('foodModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ── Modal close ──────────────────────
function closeFoodModal(e) {
    if (e && e.target !== document.getElementById('foodModal')) return;
    closeFoodModalBtn();
}

function closeFoodModalBtn() {
    document.getElementById('foodModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Close on Escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeFoodModalBtn();
});