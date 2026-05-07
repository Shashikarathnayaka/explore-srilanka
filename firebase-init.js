// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "explore-srilanka-a364b.firebaseapp.com",
    projectId: "explore-srilanka-a364b",
    storageBucket: "explore-srilanka-a364b.firebasestorage.app",
    messagingSenderId: "359754130881",
    appId: "1:359754130881:web:a6f7c19221df71fcd6fb40",
    measurementId: "G-V0FWTTVFQG"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);