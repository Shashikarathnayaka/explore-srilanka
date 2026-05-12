var currentAuthState = null;

// not using firebase auth state listener because we want to check with our server session
var cached = localStorage.getItem("auth_state");
if (cached) {
    try {
        currentAuthState = JSON.parse(cached);
        applyAuthUI(currentAuthState);
    } catch (e) { }
}

//verify with server to ensure session is still valid
checkAuthState();

function checkAuthState() {
    fetch("php/check_auth.php", {
        credentials: "include"
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            currentAuthState = data;
            localStorage.setItem("auth_state", JSON.stringify(data));
            applyAuthUI(data);

            setTimeout(function () { applyAuthUI(data); }, 300);
            setTimeout(function () { applyAuthUI(data); }, 800);
        })
        .catch(function (err) {
            console.error("Auth check failed:", err);
        });
}

function applyAuthUI(data) {
    var authOut = document.getElementById("auth-out");
    var authIn = document.getElementById("auth-in");
    var nameEl = document.getElementById("nav-user-name");

    if (!authOut || !authIn) return;

    if (data && data.logged_in) {
        authOut.style.display = "none";
        authIn.style.display = "flex";
        nameEl.textContent = "👋 " + data.name;
    } else {
        authOut.style.display = "flex";
        authIn.style.display = "none";
        nameEl.textContent = "";
    }
}

window.logoutUser = function () {
    fetch("php/logout.php", {
        credentials: "include"
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.success) {
                localStorage.removeItem("auth_state");
                currentAuthState = { logged_in: false };
                applyAuthUI(currentAuthState);
                alert("Logged out successfully!");
            }
        })
        .catch(function (err) {
            console.error("Logout failed:", err);
        });
};

window.applyAuthUI = applyAuthUI;
window.checkAuthState = checkAuthState;