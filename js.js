function updateClock() {
    const clock = document.getElementById("clock");
    clock.textContent = new Date().toLocaleTimeString();
}

updateClock();
setInterval(updateClock, 1000);

const modeSwitch = document.getElementById("modeSwitch");
const modeLabel = document.getElementById("modeLabel");
const darkModeSwitch = document.getElementById("darkModeSwitch");

modeSwitch.addEventListener("click", () => {
    const modernMode = document.body.classList.toggle("mode-2026");
    modeSwitch.setAttribute("aria-pressed", String(modernMode));
    modeLabel.textContent = modernMode ? "2026 mode" : "1997 mode";
    darkModeSwitch.hidden = !modernMode;
    darkModeSwitch.setAttribute("aria-hidden", String(!modernMode));
    if (!modernMode) {
        document.body.classList.remove("mode-dark");
        darkModeSwitch.setAttribute("aria-pressed", "false");
    }
});

darkModeSwitch.addEventListener("click", () => {
    if (!document.body.classList.contains("mode-2026")) return;
    const darkMode = document.body.classList.toggle("mode-dark");
    darkModeSwitch.setAttribute("aria-pressed", String(darkMode));
});

const notepad = document.getElementById("notepad");

notepad.value = localStorage.getItem("retroTabsNote") || "";

notepad.addEventListener("input", () => {
    localStorage.setItem("retroTabsNote", notepad.value);
});

const monthYear = document.getElementById("monthYear");
const calendarDays = document.getElementById("calendarDays");
const previousMonth = document.getElementById("previousMonth");
const nextMonth = document.getElementById("nextMonth");

let displayedDate = new Date();

function renderCalendar() {
    const year = displayedDate.getFullYear();
    const month = displayedDate.getMonth();

    monthYear.textContent = displayedDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });

    calendarDays.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
        calendarDays.appendChild(document.createElement("span"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement("span");
        dayElement.textContent = day;

        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {
            dayElement.classList.add("today");
        }

        calendarDays.appendChild(dayElement);
    }
}

previousMonth.addEventListener("click", () => {
    displayedDate.setMonth(displayedDate.getMonth() - 1);
    renderCalendar();
});

nextMonth.addEventListener("click", () => {
    displayedDate.setMonth(displayedDate.getMonth() + 1);
    renderCalendar();
});

renderCalendar();

document.querySelectorAll(".upButton, .downButton").forEach((button) => {
    button.addEventListener("click", () => {
        const app = button.closest(".app");
        const appContainer = app?.parentElement;
        if (!app || !appContainer) return;
        if (button.classList.contains("upButton") && app.previousElementSibling) {
            appContainer.insertBefore(app, app.previousElementSibling);
        }
        if (button.classList.contains("downButton") && app.nextElementSibling) {
            appContainer.insertBefore(app.nextElementSibling, app);
        }
    });
});

const projectMinimize = document.getElementById("minimizeMyProjects");
const projectsApp = projectMinimize?.closest(".app");

projectMinimize?.addEventListener("click", () => {
    const isMinimized = projectsApp.classList.toggle("projectsMinimized");
    projectMinimize.textContent = isMinimized ? "Enlarge" : "Minimize";
    projectMinimize.setAttribute("aria-expanded", String(!isMinimized));
});

const doomCanvas = document.getElementById("doomCanvas");
const doomGame = document.getElementById("doomGame");

if (doomCanvas && doomGame) {
    const doomContext = doomCanvas.getContext("2d");
    const doomWidth = doomCanvas.width;
    const doomHeight = doomCanvas.height;
    const map = [
        "111111111111", "100000000001", "101111011101",
        "100001000001", "101101011101", "100100000001",
        "100101111101", "100000000001", "111111111111"
    ];
    const keys = {};
    const player = { x: 2.5, y: 1.8, angle: 0.15, health: 100, ammo: 24, score: 0 };
    const enemies = [
        { x: 8.5, y: 1.8, health: 2, cooldown: 0 },
        { x: 3.4, y: 3.5, health: 2, cooldown: 0 },
        { x: 9.2, y: 5.5, health: 2, cooldown: 0 },
        { x: 2.4, y: 7.1, health: 2, cooldown: 0 },
        { x: 7.5, y: 7.2, health: 2, cooldown: 0 }
    ];
    let lastFrame = performance.now();
    let gameOver = false;
    let muzzleFlash = 0;

    function isWall(x, y) { return map[Math.floor(y)]?.[Math.floor(x)] === "1"; }
    function canWalk(x, y) {
        return !isWall(x - 0.18, y) && !isWall(x + 0.18, y) && !isWall(x, y - 0.18) && !isWall(x, y + 0.18);
    }
    function angleDifference(angle) {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    }
    function hasLineOfSight(enemy) {
        const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
        const steps = Math.ceil(distance * 12);
        for (let step = 1; step < steps; step++) {
            const ratio = step / steps;
            if (isWall(player.x + (enemy.x - player.x) * ratio, player.y + (enemy.y - player.y) * ratio)) return false;
        }
        return true;
    }
    function shoot() {
        if (gameOver || player.ammo <= 0) return;
        player.ammo--;
        muzzleFlash = 0.09;
        let target = null;
        let closest = Infinity;
        enemies.forEach((enemy) => {
            if (enemy.health <= 0 || !hasLineOfSight(enemy)) return;
            const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
            const aim = Math.abs(angleDifference(Math.atan2(enemy.y - player.y, enemy.x - player.x) - player.angle));
            if (aim < 0.09 && distance < closest) { target = enemy; closest = distance; }
        });
        if (target) {
            target.health--;
            if (target.health <= 0) player.score++;
        }
    }
    function update(delta) {
        if (gameOver) return;
        const speed = delta * 2.2;
        let moveX = 0;
        let moveY = 0;
        if (keys.w) { moveX += Math.cos(player.angle) * speed; moveY += Math.sin(player.angle) * speed; }
        if (keys.s) { moveX -= Math.cos(player.angle) * speed; moveY -= Math.sin(player.angle) * speed; }
        if (keys.a) { moveX += Math.cos(player.angle - Math.PI / 2) * speed; moveY += Math.sin(player.angle - Math.PI / 2) * speed; }
        if (keys.d) { moveX += Math.cos(player.angle + Math.PI / 2) * speed; moveY += Math.sin(player.angle + Math.PI / 2) * speed; }
        if (canWalk(player.x + moveX, player.y)) player.x += moveX;
        if (canWalk(player.x, player.y + moveY)) player.y += moveY;
        muzzleFlash = Math.max(0, muzzleFlash - delta);
        enemies.forEach((enemy) => {
            if (enemy.health <= 0) return;
            enemy.cooldown -= delta;
            const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
            if (distance < 5 && distance > 0.7 && hasLineOfSight(enemy)) {
                const enemySpeed = delta * 0.24;
                const nextX = enemy.x + (player.x - enemy.x) / distance * enemySpeed;
                const nextY = enemy.y + (player.y - enemy.y) / distance * enemySpeed;
                if (canWalk(nextX, enemy.y)) enemy.x = nextX;
                if (canWalk(enemy.x, nextY)) enemy.y = nextY;
            }
            if (distance < 2.8 && enemy.cooldown <= 0 && hasLineOfSight(enemy)) {
                player.health = Math.max(0, player.health - 8);
                enemy.cooldown = 1.1;
            }
        });
        if (player.health <= 0 || player.score === enemies.length) gameOver = true;
        document.getElementById("doomHealth").textContent = player.health;
        document.getElementById("doomAmmo").textContent = player.ammo;
        document.getElementById("doomScore").textContent = player.score;
    }
    function render() {
        doomContext.fillStyle = "#493f4a";
        doomContext.fillRect(0, 0, doomWidth, doomHeight / 2);
        doomContext.fillStyle = "#292323";
        doomContext.fillRect(0, doomHeight / 2, doomWidth, doomHeight / 2);
        const columns = 160;
        for (let column = 0; column < columns; column++) {
            const rayAngle = player.angle - 0.55 + column / columns * 1.1;
            let distance = 0;
            while (distance < 15 && !isWall(player.x + Math.cos(rayAngle) * distance, player.y + Math.sin(rayAngle) * distance)) distance += 0.025;
            const correctedDistance = distance * Math.cos(rayAngle - player.angle);
            const wallHeight = Math.min(doomHeight, doomHeight / Math.max(correctedDistance, 0.1));
            const shade = Math.max(24, 160 - correctedDistance * 18);
            doomContext.fillStyle = `rgb(${shade}, ${Math.floor(shade * 0.32)}, ${Math.floor(shade * 0.22)})`;
            doomContext.fillRect(column * 4, (doomHeight - wallHeight) / 2, 5, wallHeight);
        }
        enemies.filter((enemy) => enemy.health > 0).sort((a, b) => Math.hypot(b.x - player.x, b.y - player.y) - Math.hypot(a.x - player.x, a.y - player.y)).forEach((enemy) => {
            const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
            const relativeAngle = angleDifference(Math.atan2(enemy.y - player.y, enemy.x - player.x) - player.angle);
            if (Math.abs(relativeAngle) > 0.62 || !hasLineOfSight(enemy)) return;
            const screenX = doomWidth / 2 + relativeAngle / 1.1 * doomWidth;
            const size = Math.min(170, doomHeight / distance * 0.7);
            const top = doomHeight / 2 - size / 2;
            doomContext.fillStyle = "#7f201d";
            doomContext.fillRect(screenX - size * 0.28, top + size * 0.28, size * 0.56, size * 0.7);
            doomContext.fillStyle = "#c44a2c";
            doomContext.fillRect(screenX - size * 0.22, top, size * 0.44, size * 0.4);
            doomContext.fillStyle = "#ffd34e";
            doomContext.fillRect(screenX - size * 0.14, top + size * 0.14, size * 0.08, size * 0.07);
            doomContext.fillRect(screenX + size * 0.06, top + size * 0.14, size * 0.08, size * 0.07);
        });
        doomContext.fillStyle = "#343434";
        doomContext.fillRect(doomWidth / 2 - 52, doomHeight - 60, 104, 60);
        doomContext.fillStyle = "#111";
        doomContext.fillRect(doomWidth / 2 - 20, doomHeight - 70, 40, 70);
        doomContext.fillStyle = "#aaa";
        doomContext.fillRect(doomWidth / 2 - 3, doomHeight - 43, 6, 43);
        doomContext.fillRect(doomWidth / 2 - 16, doomHeight - 25, 32, 5);
        doomContext.fillStyle = "#ddd";
        doomContext.fillRect(doomWidth / 2 - 1, doomHeight / 2 - 7, 2, 14);
        doomContext.fillRect(doomWidth / 2 - 7, doomHeight / 2 - 1, 14, 2);
        if (muzzleFlash) {
            doomContext.fillStyle = "#ffd34e";
            doomContext.beginPath();
            doomContext.arc(doomWidth / 2, doomHeight - 75, 22, 0, Math.PI * 2);
            doomContext.fill();
        }
        if (gameOver) {
            doomContext.fillStyle = "rgba(0, 0, 0, 0.7)";
            doomContext.fillRect(0, 0, doomWidth, doomHeight);
            doomContext.fillStyle = player.score === enemies.length ? "#f5d66d" : "#e24a36";
            doomContext.font = "bold 28px Courier New";
            doomContext.textAlign = "center";
            doomContext.fillText(player.score === enemies.length ? "SECTOR CLEARED" : "YOU DIED", doomWidth / 2, doomHeight / 2);
            doomContext.font = "14px Courier New";
            doomContext.fillText("CLICK TO RESTART", doomWidth / 2, doomHeight / 2 + 28);
        }
    }
    function frame(now) {
        const delta = Math.min((now - lastFrame) / 1000, 0.05);
        lastFrame = now;
        update(delta);
        render();
        requestAnimationFrame(frame);
    }
    window.addEventListener("keydown", (event) => { keys[event.key.toLowerCase()] = true; });
    window.addEventListener("keyup", (event) => { keys[event.key.toLowerCase()] = false; });
    doomCanvas.addEventListener("mousemove", (event) => {
        if (document.pointerLockElement === doomCanvas) player.angle += event.movementX * 0.003;
    });
    doomCanvas.addEventListener("click", () => {
        if (gameOver) window.location.reload();
        else doomCanvas.requestPointerLock();
        shoot();
        document.getElementById("doomPrompt").textContent = "WASD MOVE | MOUSE AIM | CLICK FIRE";
    });
    doomGame.addEventListener("mouseleave", () => document.getElementById("doomPrompt").classList.remove("isOver"));
    doomGame.addEventListener("mouseenter", () => document.getElementById("doomPrompt").classList.add("isOver"));
    requestAnimationFrame(frame);
}
