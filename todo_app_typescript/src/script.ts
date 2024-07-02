import flatpickr from "flatpickr";

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll<HTMLDivElement>('.tab');
    const contentElements = document.querySelectorAll<HTMLDivElement>('.content');
    const dayNameElement = document.getElementById('day-name') as HTMLDivElement;
    const fullDateElement = document.getElementById('full-date') as HTMLDivElement;
    const prevDateButton = document.getElementById('prev-date') as HTMLButtonElement;
    const nextDateButton = document.getElementById('next-date') as HTMLButtonElement;
    const taskInput = document.getElementById('task-input') as HTMLInputElement;
    const timeIcon = document.getElementById('time-icon') as HTMLDivElement;
    const container = document.querySelector('.container') as HTMLDivElement;
    const spinner = document.getElementById('spinner') as HTMLDivElement;

    const hourHand = document.getElementById('hour-hand') as HTMLDivElement;
    const minuteHand = document.getElementById('minute-hand') as HTMLDivElement;
    const secondHand = document.getElementById('second-hand') as HTMLDivElement;

    let currentDate: Date = new Date();
    let selectedDate: Date | null = null;
    let selectedTime: string | null = null;

    // Show spinner and hide container
    if (container) container.style.display = 'none';
    if (spinner) spinner.style.display = 'block';

    function updateClock() {
        const now = new Date();
        const seconds = now.getSeconds();
        const minutes = now.getMinutes();
        const hours = now.getHours();
        
        const secondsDeg = ((seconds / 60) * 360) + 90;
        const minutesDeg = ((minutes / 60) * 360) + 90;
        const hoursDeg = ((hours / 12) * 360) + 90;

        if (secondHand) secondHand.style.transform = `rotate(${secondsDeg}deg)`;
        if (minuteHand) minuteHand.style.transform = `rotate(${minutesDeg}deg)`;
        if (hourHand) hourHand.style.transform = `rotate(${hoursDeg}deg)`;
    }

    setInterval(updateClock, 1000);
    updateClock();

    function updateDateDisplay() {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
        const fullDate = currentDate.toLocaleDateString('en-US', options).replace(dayName + ', ', '');
        if (dayNameElement) dayNameElement.textContent = dayName;
        if (fullDateElement) fullDateElement.textContent = fullDate;
    }

    function changeDate(days: number) {
        currentDate.setDate(currentDate.getDate() + days);
        updateDateDisplay();
    }

    function createTaskElement(taskText: string, taskDueDate: Date, taskDueTime: string, isPinned = false, isChecked = false) {
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
        const currentContent = isChecked 
            ? document.getElementById('completed-content') as HTMLDivElement 
            : getContentElement(taskDueDate); // Assuming taskDueDate is already a Date object
        if (currentContent) {
            const pinnedTasksContainer = currentContent.querySelector<HTMLDivElement>('.pinned-tasks');
            const taskListContainer = currentContent.querySelector<HTMLDivElement>('.task-list');

            if (isPinned && pinnedTasksContainer) {
                pinnedTasksContainer.appendChild(task);
            } else if (taskListContainer) {
                taskListContainer.appendChild(task);
            }

            ellipsisBtn.addEventListener('click', () => {
                dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
            });

            pinItem.addEventListener('click', () => {
                task.classList.toggle('pinned');
                pinIcon.style.display = task.classList.contains('pinned') ? 'inline' : 'none';
                if (task.classList.contains('pinned')) {
                    if (pinnedTasksContainer) pinnedTasksContainer.appendChild(task);
                    pinItem.textContent = '📌 Remove from pin';
                } else {
                    if (taskListContainer) taskListContainer.appendChild(task);
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
                if ((event.target as HTMLInputElement).checked) {
                    moveTaskToCompleted(task);
                    addNotification('Task Completed', taskText);
                    saveTasks();
                } else {
                    moveTaskToActive(task);
                    addNotification('Task Uncompleted', taskText);
                    saveTasks();
                }
            });

            document.addEventListener('click', (event) => {
                if (!event.target || !(event.target as HTMLElement).matches('.ellipsis-btn')) {
                    dropdownMenu.style.display = 'none';
                }
            });

            addNotification('Task Created', taskText);
            saveTasks();
        }
    }

    function moveTaskToCompleted(task: HTMLDivElement) {
        const completedContent = document.getElementById('completed-content') as HTMLDivElement;
        const completedTaskList = completedContent.querySelector<HTMLDivElement>('.task-list');
        if (completedTaskList) completedTaskList.appendChild(task);
    }

    function moveTaskToActive(task: HTMLDivElement) {
        const taskSubtext = task.querySelector('.task-subtext')?.textContent;
        if (taskSubtext) {
            const taskDueDate = new Date(taskSubtext.split('Due: ')[1].split(' ')[0]);
            const currentContent = getContentElement(taskDueDate);
            const taskListContainer = currentContent.querySelector<HTMLDivElement>('.task-list');
            if (taskListContainer) taskListContainer.appendChild(task);
        }
    }

    function getContentElement(dueDate: Date): HTMLDivElement {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfToday.getTime()); // Copy the date
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Get start of the week (Sunday)
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        if (dueDate >= startOfToday && dueDate < new Date(startOfToday.getTime() + 86400000)) { // Tomorrow
            return document.getElementById('day-content') as HTMLDivElement;
        } else if (dueDate >= startOfWeek && dueDate < new Date(startOfWeek.getTime() + 7 * 86400000)) { // Next week
            return document.getElementById('week-content') as HTMLDivElement;
        } else if (dueDate >= startOfMonth && dueDate < new Date(startOfMonth.getTime() + 32 * 86400000)) { // Next month
            return document.getElementById('month-content') as HTMLDivElement;
        } else if (dueDate >= startOfYear && dueDate < new Date(startOfYear.getTime() + 366 * 86400000)) { // Next year
            return document.getElementById('year-content') as HTMLDivElement; // Default to yearContent for dates outside the current year
        } else {
            return document.getElementById('year-content') as HTMLDivElement; // Default to yearContent for dates outside the current year
        }
    }

    function addNotification(type: string, taskText: string) {
        const notificationContent = document.getElementById('notification-content') as HTMLDivElement;
        const notificationList = notificationContent.querySelector<HTMLDivElement>('.notification-list');
        
        if (notificationList) {
            const notification = document.createElement('div');
            notification.className = 'notification';
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            notification.innerHTML = `<strong>${type}:</strong> ${taskText} at ${timeString}`;
            
            notificationList.insertBefore(notification, notificationList.firstChild);
        }
    }

    function saveTasks() {
        const allTasks: { text: string, subtext: string, pinned: boolean, checked: boolean }[] = [];

        document.querySelectorAll<HTMLDivElement>('.task').forEach(task => {
            const taskText = task.querySelector('.task-text')?.textContent || '';
            const taskSubtext = task.querySelector('.task-subtext')?.textContent || '';
            const isPinned = task.classList.contains('pinned');
            const isChecked = task.querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked || false;

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
        const savedTasks: { text: string, subtext: string, pinned: boolean, checked: boolean }[] = JSON.parse(localStorage.getItem('tasks') || '[]');

        if (savedTasks) {
            savedTasks.forEach(task => {
                const dueDate = new Date(task.subtext.split('Due: ')[1].split(' ')[0]);
                const dueTime = task.subtext.split(' ')[2];
                createTaskElement(task.text, dueDate, dueTime, task.pinned, task.checked);
            });
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const activeTab = document.querySelector<HTMLDivElement>('.tab.active');
            if (activeTab) activeTab.classList.remove('active');
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

    document.querySelector<HTMLDivElement>('.date')?.addEventListener('click', () => {
        flatpickr(fullDateElement, {
            defaultDate: currentDate,
            onChange: function(selectedDates: Date[]) {
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
            onChange: function(selectedDates: Date[], dateStr: string) {
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
            } else {
                alert('Please select a due date and time for the task.');
            }
        }
    });

    function sortTasksByName(content: HTMLDivElement) {
        const tasks = Array.from(content.querySelectorAll<HTMLDivElement>('.task-list .task'));
        tasks.sort((a: HTMLDivElement, b: HTMLDivElement) => {
            const nameA = (a.querySelector('.task-text') as HTMLSpanElement)?.textContent?.toUpperCase() || '';
            const nameB = (b.querySelector('.task-text') as HTMLSpanElement)?.textContent?.toUpperCase() || '';
            return nameA.localeCompare(nameB);
        });
        const taskList = content.querySelector<HTMLDivElement>('.task-list');
        if (taskList) {
            taskList.innerHTML = '';
            tasks.forEach((task: HTMLDivElement) => taskList.appendChild(task));
        }
    }

    function sortTasksByDate(content: HTMLDivElement) {
        const tasks = Array.from(content.querySelectorAll<HTMLDivElement>('.task-list .task'));
        tasks.sort((a: HTMLDivElement, b: HTMLDivElement) => {
            const dateA = new Date((a.querySelector('.task-subtext') as HTMLSpanElement)?.textContent?.split('Due: ')[1] || '');
            const dateB = new Date((b.querySelector('.task-subtext') as HTMLSpanElement)?.textContent?.split('Due: ')[1] || '');
            return dateA.getTime() - dateB.getTime();
        });
        const taskList = content.querySelector<HTMLDivElement>('.task-list');
        if (taskList) {
            taskList.innerHTML = '';
            tasks.forEach((task: HTMLDivElement) => taskList.appendChild(task));
        }
    }

    updateDateDisplay();
    loadTasks();

    // Hide spinner and show container
    if (container) container.style.display = 'flex';
    if (spinner) spinner.style.display = 'none';
});
