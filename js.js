function updateClock() {
    const clock = document.getElementById("clock");
    clock.textContent = new Date().toLocaleTimeString();
}

updateClock();
setInterval(updateClock, 1000);

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
