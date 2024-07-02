"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const contentElements = document.querySelectorAll('.content');
    const dayNameElement = document.getElementById('day-name');
    const fullDateElement = document.getElementById('full-date');
    const prevDateButton = document.getElementById('prev-date');
    const nextDateButton = document.getElementById('next-date');
    const taskInput = document.getElementById('task-input');
    const timeIcon = document.getElementById('time-icon');
    const container = document.querySelector('.container');
    const spinner = document.getElementById('spinner');
    const hourHand = document.getElementById('hour-hand');
    const minuteHand = document.getElementById('minute-hand');
    const secondHand = document.getElementById('second-hand');
    let currentDate = new Date();
    let selectedDate = null;
    let selectedTime = null;
    // Show spinner and hide container
    container.style.display = 'none';
    spinner.style.display = 'block';
    function updateClock() {
        const now = new Date();
        const seconds = now.getSeconds();
        const minutes = now.getMinutes();
        const hours = now.getHours();
        const secondsDeg = ((seconds / 60) * 360) + 90;
        const minutesDeg = ((minutes / 60) * 360) + 90;
        const hoursDeg = ((hours / 12) * 360) + 90;
        secondHand.style.transform = `rotate(${secondsDeg}deg)`;
        minuteHand.style.transform = `rotate(${minutesDeg}deg)`;
        hourHand.style.transform = `rotate(${hoursDeg}deg)`;
    }
    setInterval(updateClock, 1000);
    updateClock();
    function updateDateDisplay() {
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
        const fullDate = currentDate.toLocaleDateString('en-US', options).replace(dayName + ', ', '');
        dayNameElement.textContent = dayName;
        fullDateElement.textContent = fullDate;
    }
    function changeDate(days) {
        currentDate.setDate(currentDate.getDate() + days);
        updateDateDisplay();
    }
    function createTaskElement(taskText, taskDueDate, taskDueTime, isPinned = false, isChecked = false) {
        const task = document.createElement('div');
        task.className = 'task';
        if (isPinned) {
            task.classList.add('pinned');
        }
        const pinIcon = document.createElement('div');
        pinIcon.className = 'pin-icon';
        pinIcon.textContent = '📌';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isChecked;
        const taskDetails = document.createElement('div');
        taskDetails.className = 'task-details';
        const taskTextElement = document.createElement('span');
        taskTextElement.className = 'task-text';
        taskTextElement.textContent = taskText;
        const taskSubtext = document.createElement('span');
        taskSubtext.className = 'task-subtext';
        taskSubtext.textContent = `Due: ${taskDueDate.toLocaleDateString()} ${taskDueTime}`;
        taskSubtext.style.display = 'block';
        const ellipsisBtn = document.createElement('button');
        ellipsisBtn.className = 'ellipsis-btn';
        ellipsisBtn.textContent = '⋯';
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'dropdown-menu';
        const pinItem = document.createElement('div');
        pinItem.className = 'dropdown-item';
        pinItem.textContent = isPinned ? '📌 Remove from pin' : '📌 Pin on the top';
        const memoItem = document.createElement('div');
        memoItem.className = 'dropdown-item';
        memoItem.textContent = '📝 Add a memo';
        const deleteItem = document.createElement('div');
        deleteItem.className = 'dropdown-item';
        deleteItem.textContent = '🗑️ Delete';
        const sortByNameItem = document.createElement('div');
        sortByNameItem.className = 'dropdown-item';
        sortByNameItem.textContent = 'Sort by Name';
        const sortByDateItem = document.createElement('div');
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
        const currentContent = isChecked ? document.getElementById('completed-content') : getContentElement(taskDueDate);
        const pinnedTasksContainer = currentContent.querySelector('.pinned-tasks');
        const taskListContainer = currentContent.querySelector('.task-list');
        if (isPinned) {
            pinnedTasksContainer.appendChild(task);
        }
        else {
            taskListContainer.appendChild(task);
        }
        ellipsisBtn.addEventListener('click', (event) => {
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });
        pinItem.addEventListener('click', () => {
            task.classList.toggle('pinned');
            pinIcon.style.display = task.classList.contains('pinned') ? 'inline' : 'none';
            if (task.classList.contains('pinned')) {
                pinnedTasksContainer.appendChild(task);
                pinItem.textContent = '📌 Remove from pin';
            }
            else {
                taskListContainer.appendChild(task);
                pinItem.textContent = '📌 Pin on the top';
            }
            dropdownMenu.style.display = 'none';
            addNotification('Task Pinned', taskText);
            saveTasks();
        });
        memoItem.addEventListener('click', () => {
            const memo = prompt('Enter memo:');
            if (memo) {
                taskSubtext.textContent += ` | Memo: ${memo}`;
            }
            dropdownMenu.style.display = 'none';
        });
        deleteItem.addEventListener('click', () => {
            task.remove();
            addNotification('Task Deleted', taskText);
            saveTasks();
        });
        sortByNameItem.addEventListener('click', () => {
            sortTasksByName(currentContent);
            dropdownMenu.style.display = 'none';
        });
        sortByDateItem.addEventListener('click', () => {
            sortTasksByDate(currentContent);
            dropdownMenu.style.display = 'none';
        });
        checkbox.addEventListener('change', (event) => {
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
        document.addEventListener('click', (event) => {
            if (!event.target.matches('.ellipsis-btn')) {
                dropdownMenu.style.display = 'none';
            }
        });
        addNotification('Task Created', taskText);
        saveTasks();
    }
    function moveTaskToCompleted(task) {
        const completedContent = document.getElementById('completed-content');
        const completedTaskList = completedContent.querySelector('.task-list');
        completedTaskList.appendChild(task);
    }
    function moveTaskToActive(task) {
        const taskSubtext = task.querySelector('.task-subtext');
        const taskDueDate = new Date(taskSubtext.textContent.split('Due: ')[1].split(' ')[0]);
        const currentContent = getContentElement(taskDueDate);
        const taskListContainer = currentContent.querySelector('.task-list');
        taskListContainer.appendChild(task);
    }
    function getContentElement(dueDate) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Get start of the week (Sunday)
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
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
            return document.getElementById('year-content');
        }
        else {
            return document.getElementById('year-content'); // Default to yearContent for dates outside the current year
        }
    }
    function addNotification(type, taskText) {
        const notificationContent = document.getElementById('notification-content');
        const notificationList = notificationContent.querySelector('.notification-list');
        const notification = document.createElement('div');
        notification.className = 'notification';
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        notification.innerHTML = `<strong>${type}:</strong> ${taskText} at ${timeString}`;
        notificationList.insertBefore(notification, notificationList.firstChild);
    }
    function saveTasks() {
        const allTasks = [];
        document.querySelectorAll('.task').forEach(task => {
            const taskText = task.querySelector('.task-text').textContent;
            const taskSubtext = task.querySelector('.task-subtext').textContent;
            const isPinned = task.classList.contains('pinned');
            const isChecked = task.querySelector('input[type="checkbox"]').checked;
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
        const savedTasks = JSON.parse(localStorage.getItem('tasks'));
        if (savedTasks) {
            savedTasks.forEach((task) => {
                const dueDate = new Date(task.subtext.split('Due: ')[1].split(' ')[0]);
                const dueTime = task.subtext.split(' ')[2];
                createTaskElement(task.text, dueDate, dueTime, task.pinned, task.checked);
            });
        }
    }
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelector('.tab.active').classList.remove('active');
            tab.classList.add('active');
            const contentId = tab.getAttribute('data-content');
            contentElements.forEach(content => {
                content.classList.remove('active');
                if (content.id === contentId) {
                    content.classList.add('active');
                }
            });
        });
    });
    prevDateButton.addEventListener('click', () => changeDate(-1));
    nextDateButton.addEventListener('click', () => changeDate(1));
    document.querySelector('.date').addEventListener('click', () => {
        flatpickr(fullDateElement, {
            defaultDate: currentDate,
            onChange: function (selectedDates) {
                currentDate = selectedDates[0];
                selectedDate = selectedDates[0];
                updateDateDisplay();
            }
        }).open();
    });
    timeIcon.addEventListener('click', () => {
        flatpickr(timeIcon, {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            onChange: function (selectedDates, dateStr) {
                selectedTime = dateStr;
            }
        }).open();
    });
    taskInput.addEventListener('keypress', (event) => {
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
        const tasks = Array.from(content.querySelectorAll('.task-list .task'));
        tasks.sort((a, b) => {
            const nameA = a.querySelector('.task-text').textContent.toUpperCase();
            const nameB = b.querySelector('.task-text').textContent.toUpperCase();
            return nameA.localeCompare(nameB);
        });
        const taskList = content.querySelector('.task-list');
        taskList.innerHTML = '';
        tasks.forEach(task => taskList.appendChild(task));
    }
    function sortTasksByDate(content) {
        const tasks = Array.from(content.querySelectorAll('.task-list .task'));
        tasks.sort((a, b) => {
            const dateA = new Date(a.querySelector('.task-subtext').textContent.split('Due: ')[1]);
            const dateB = new Date(b.querySelector('.task-subtext').textContent.split('Due: ')[1]);
            return dateA.getTime() - dateB.getTime();
        });
        const taskList = content.querySelector('.task-list');
        taskList.innerHTML = '';
        tasks.forEach(task => taskList.appendChild(task));
    }
    updateDateDisplay();
    loadTasks();
    // Hide spinner and show container
    container.style.display = 'flex';
    spinner.style.display = 'none';
});
