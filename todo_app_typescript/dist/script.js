"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var flatpickr_1 = __importDefault(require("flatpickr"));
document.addEventListener('DOMContentLoaded', function () {
    var _a;
    var tabs = document.querySelectorAll('.tab');
    var contentElements = document.querySelectorAll('.content');
    var dayNameElement = document.getElementById('day-name');
    var fullDateElement = document.getElementById('full-date');
    var prevDateButton = document.getElementById('prev-date');
    var nextDateButton = document.getElementById('next-date');
    var taskInput = document.getElementById('task-input');
    var timeIcon = document.getElementById('time-icon');
    var container = document.querySelector('.container');
    var spinner = document.getElementById('spinner');
    var hourHand = document.getElementById('hour-hand');
    var minuteHand = document.getElementById('minute-hand');
    var secondHand = document.getElementById('second-hand');
    var currentDate = new Date();
    var selectedDate = null;
    var selectedTime = null;
    // Show spinner and hide container
    if (container)
        container.style.display = 'none';
    if (spinner)
        spinner.style.display = 'block';
    function updateClock() {
        var now = new Date();
        var seconds = now.getSeconds();
        var minutes = now.getMinutes();
        var hours = now.getHours();
        var secondsDeg = ((seconds / 60) * 360) + 90;
        var minutesDeg = ((minutes / 60) * 360) + 90;
        var hoursDeg = ((hours / 12) * 360) + 90;
        if (secondHand)
            secondHand.style.transform = "rotate(".concat(secondsDeg, "deg)");
        if (minuteHand)
            minuteHand.style.transform = "rotate(".concat(minutesDeg, "deg)");
        if (hourHand)
            hourHand.style.transform = "rotate(".concat(hoursDeg, "deg)");
    }
    setInterval(updateClock, 1000);
    updateClock();
    function updateDateDisplay() {
        var options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        var dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
        var fullDate = currentDate.toLocaleDateString('en-US', options).replace(dayName + ', ', '');
        if (dayNameElement)
            dayNameElement.textContent = dayName;
        if (fullDateElement)
            fullDateElement.textContent = fullDate;
    }
    function changeDate(days) {
        currentDate.setDate(currentDate.getDate() + days);
        updateDateDisplay();
    }
    function createTaskElement(taskText, taskDueDate, taskDueTime, isPinned, isChecked) {
        if (isPinned === void 0) { isPinned = false; }
        if (isChecked === void 0) { isChecked = false; }
        var task = document.createElement('div');
        task.className = 'task';
        if (isPinned) {
            task.classList.add('pinned');
        }
        var pinIcon = document.createElement('div');
        pinIcon.className = 'pin-icon';
        pinIcon.textContent = '📌';
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isChecked;
        var taskDetails = document.createElement('div');
        taskDetails.className = 'task-details';
        var taskTextElement = document.createElement('span');
        taskTextElement.className = 'task-text';
        taskTextElement.textContent = taskText;
        var taskSubtext = document.createElement('span');
        taskSubtext.className = 'task-subtext';
        taskSubtext.textContent = "Due: ".concat(taskDueDate.toLocaleDateString(), " ").concat(taskDueTime);
        taskSubtext.style.display = 'block';
        var ellipsisBtn = document.createElement('button');
        ellipsisBtn.className = 'ellipsis-btn';
        ellipsisBtn.textContent = '⋯';
        var dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'dropdown-menu';
        var pinItem = document.createElement('div');
        pinItem.className = 'dropdown-item';
        pinItem.textContent = isPinned ? '📌 Remove from pin' : '📌 Pin on the top';
        var memoItem = document.createElement('div');
        memoItem.className = 'dropdown-item';
        memoItem.textContent = '📝 Add a memo';
        var deleteItem = document.createElement('div');
        deleteItem.className = 'dropdown-item';
        deleteItem.textContent = '🗑️ Delete';
        var sortByNameItem = document.createElement('div');
        sortByNameItem.className = 'dropdown-item';
        sortByNameItem.textContent = 'Sort by Name';
        var sortByDateItem = document.createElement('div');
        sortByDateItem.className = 'dropdown-item';
        sortByDateItem.textContent = 'Sort by Date';
        dropdownMenu.appendChild(pinItem);
        dropdownMenu.appendChild(memoItem);
        dropdownMenu.appendChild(deleteItem);
        dropdownMenu.appendChild(sortByNameItem);
        dropdownMenu.appendChild(sortByDateItem);
        taskDetails.appendChild(taskTextElement);
        taskDetails.appendChild(taskSubtext);
        task.appendChild(pinIcon);
        task.appendChild(checkbox);
        task.appendChild(taskDetails);
        task.appendChild(ellipsisBtn);
        task.appendChild(dropdownMenu);
        // Add task to the appropriate list based on the due date and completion status
        var currentContent = isChecked
            ? document.getElementById('completed-content')
            : getContentElement(taskDueDate); // Assuming taskDueDate is already a Date object
        if (currentContent) {
            var pinnedTasksContainer_1 = currentContent.querySelector('.pinned-tasks');
            var taskListContainer_1 = currentContent.querySelector('.task-list');
            if (isPinned && pinnedTasksContainer_1) {
                pinnedTasksContainer_1.appendChild(task);
            }
            else if (taskListContainer_1) {
                taskListContainer_1.appendChild(task);
            }
            ellipsisBtn.addEventListener('click', function () {
                dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
            });
            pinItem.addEventListener('click', function () {
                task.classList.toggle('pinned');
                pinIcon.style.display = task.classList.contains('pinned') ? 'inline' : 'none';
                if (task.classList.contains('pinned')) {
                    if (pinnedTasksContainer_1)
                        pinnedTasksContainer_1.appendChild(task);
                    pinItem.textContent = '📌 Remove from pin';
                }
                else {
                    if (taskListContainer_1)
                        taskListContainer_1.appendChild(task);
                    pinItem.textContent = '📌 Pin on the top';
                }
                dropdownMenu.style.display = 'none';
                addNotification('Task Pinned', taskText);
                saveTasks();
            });
            memoItem.addEventListener('click', function () {
                var memo = prompt('Enter memo:');
                if (memo) {
                    taskSubtext.textContent += " | Memo: ".concat(memo);
                }
                dropdownMenu.style.display = 'none';
            });
            deleteItem.addEventListener('click', function () {
                task.remove();
                addNotification('Task Deleted', taskText);
                saveTasks();
            });
            sortByNameItem.addEventListener('click', function () {
                sortTasksByName(currentContent);
                dropdownMenu.style.display = 'none';
            });
            sortByDateItem.addEventListener('click', function () {
                sortTasksByDate(currentContent);
                dropdownMenu.style.display = 'none';
            });
            checkbox.addEventListener('change', function (event) {
                if (event.target.checked) {
                    moveTaskToCompleted(task);
                    addNotification('Task Completed', taskText);
                    saveTasks();
                }
                else {
                    moveTaskToActive(task);
                    addNotification('Task Uncompleted', taskText);
                    saveTasks();
                }
            });
            document.addEventListener('click', function (event) {
                if (!event.target || !event.target.matches('.ellipsis-btn')) {
                    dropdownMenu.style.display = 'none';
                }
            });
            addNotification('Task Created', taskText);
            saveTasks();
        }
    }
    function moveTaskToCompleted(task) {
        var completedContent = document.getElementById('completed-content');
        var completedTaskList = completedContent.querySelector('.task-list');
        if (completedTaskList)
            completedTaskList.appendChild(task);
    }
    function moveTaskToActive(task) {
        var _a;
        var taskSubtext = (_a = task.querySelector('.task-subtext')) === null || _a === void 0 ? void 0 : _a.textContent;
        if (taskSubtext) {
            var taskDueDate = new Date(taskSubtext.split('Due: ')[1].split(' ')[0]);
            var currentContent = getContentElement(taskDueDate);
            var taskListContainer = currentContent.querySelector('.task-list');
            if (taskListContainer)
                taskListContainer.appendChild(task);
        }
    }
    function getContentElement(dueDate) {
        var now = new Date();
        var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var startOfWeek = new Date(startOfToday.getTime()); // Copy the date
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Get start of the week (Sunday)
        var startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        var startOfYear = new Date(now.getFullYear(), 0, 1);
        if (dueDate >= startOfToday && dueDate < new Date(startOfToday.getTime() + 86400000)) { // Tomorrow
            return document.getElementById('day-content');
        }
        else if (dueDate >= startOfWeek && dueDate < new Date(startOfWeek.getTime() + 7 * 86400000)) { // Next week
            return document.getElementById('week-content');
        }
        else if (dueDate >= startOfMonth && dueDate < new Date(startOfMonth.getTime() + 32 * 86400000)) { // Next month
            return document.getElementById('month-content');
        }
        else if (dueDate >= startOfYear && dueDate < new Date(startOfYear.getTime() + 366 * 86400000)) { // Next year
            return document.getElementById('year-content'); // Default to yearContent for dates outside the current year
        }
        else {
            return document.getElementById('year-content'); // Default to yearContent for dates outside the current year
        }
    }
    function addNotification(type, taskText) {
        var notificationContent = document.getElementById('notification-content');
        var notificationList = notificationContent.querySelector('.notification-list');
        if (notificationList) {
            var notification = document.createElement('div');
            notification.className = 'notification';
            var now = new Date();
            var timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            notification.innerHTML = "<strong>".concat(type, ":</strong> ").concat(taskText, " at ").concat(timeString);
            notificationList.insertBefore(notification, notificationList.firstChild);
        }
    }
    function saveTasks() {
        var allTasks = [];
        document.querySelectorAll('.task').forEach(function (task) {
            var _a, _b, _c;
            var taskText = ((_a = task.querySelector('.task-text')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
            var taskSubtext = ((_b = task.querySelector('.task-subtext')) === null || _b === void 0 ? void 0 : _b.textContent) || '';
            var isPinned = task.classList.contains('pinned');
            var isChecked = ((_c = task.querySelector('input[type="checkbox"]')) === null || _c === void 0 ? void 0 : _c.checked) || false;
            allTasks.push({
                text: taskText,
                subtext: taskSubtext,
                pinned: isPinned,
                checked: isChecked
            });
        });
        localStorage.setItem('tasks', JSON.stringify(allTasks));
    }
    function loadTasks() {
        var savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        if (savedTasks) {
            savedTasks.forEach(function (task) {
                var dueDate = new Date(task.subtext.split('Due: ')[1].split(' ')[0]);
                var dueTime = task.subtext.split(' ')[2];
                createTaskElement(task.text, dueDate, dueTime, task.pinned, task.checked);
            });
        }
    }
    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            var activeTab = document.querySelector('.tab.active');
            if (activeTab)
                activeTab.classList.remove('active');
            tab.classList.add('active');
            var contentId = tab.getAttribute('data-content');
            contentElements.forEach(function (content) {
                content.classList.remove('active');
                if (content.id === contentId) {
                    content.classList.add('active');
                }
            });
        });
    });
    prevDateButton.addEventListener('click', function () { return changeDate(-1); });
    nextDateButton.addEventListener('click', function () { return changeDate(1); });
    (_a = document.querySelector('.date')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
        (0, flatpickr_1.default)(fullDateElement, {
            defaultDate: currentDate,
            onChange: function (selectedDates) {
                currentDate = selectedDates[0];
                selectedDate = selectedDates[0];
                updateDateDisplay();
            }
        }).open();
    });
    timeIcon.addEventListener('click', function () {
        (0, flatpickr_1.default)(timeIcon, {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            onChange: function (selectedDates, dateStr) {
                selectedTime = dateStr;
            }
        }).open();
    });
    taskInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter' && taskInput.value.trim() !== '') {
            if (selectedDate && selectedTime) {
                createTaskElement(taskInput.value.trim(), selectedDate, selectedTime);
                taskInput.value = '';
                selectedTime = null;
            }
            else {
                alert('Please select a due date and time for the task.');
            }
        }
    });
    function sortTasksByName(content) {
        var tasks = Array.from(content.querySelectorAll('.task-list .task'));
        tasks.sort(function (a, b) {
            var _a, _b, _c, _d;
            var nameA = ((_b = (_a = a.querySelector('.task-text')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || '';
            var nameB = ((_d = (_c = b.querySelector('.task-text')) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.toUpperCase()) || '';
            return nameA.localeCompare(nameB);
        });
        var taskList = content.querySelector('.task-list');
        if (taskList) {
            taskList.innerHTML = '';
            tasks.forEach(function (task) { return taskList.appendChild(task); });
        }
    }
    function sortTasksByDate(content) {
        var tasks = Array.from(content.querySelectorAll('.task-list .task'));
        tasks.sort(function (a, b) {
            var _a, _b, _c, _d;
            var dateA = new Date(((_b = (_a = a.querySelector('.task-subtext')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.split('Due: ')[1]) || '');
            var dateB = new Date(((_d = (_c = b.querySelector('.task-subtext')) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.split('Due: ')[1]) || '');
            return dateA.getTime() - dateB.getTime();
        });
        var taskList = content.querySelector('.task-list');
        if (taskList) {
            taskList.innerHTML = '';
            tasks.forEach(function (task) { return taskList.appendChild(task); });
        }
    }
    updateDateDisplay();
    loadTasks();
    // Hide spinner and show container
    if (container)
        container.style.display = 'flex';
    if (spinner)
        spinner.style.display = 'none';
});
