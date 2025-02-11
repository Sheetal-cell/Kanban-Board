document.addEventListener("DOMContentLoaded", loadTasks);

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event, column) {
    event.preventDefault();
    let taskId = event.dataTransfer.getData("text");
    let task = document.getElementById(taskId);
    
    document.querySelector(`#${column} .task-list`).appendChild(task);
    updateTaskColumn(taskId, column);
    saveTasks();
}

// Open and Close Task Modal
function openTaskModal(column) {
    document.getElementById("taskModal").style.display = "block";
    document.getElementById("taskModal").dataset.column = column;
}

function closeTaskModal() {
    document.getElementById("taskModal").style.display = "none";
}

// Add a New Task
function addTask() {
    let column = document.getElementById("taskModal").dataset.column;
    let taskTitle = document.getElementById("taskTitle").value;
    let taskDeadline = document.getElementById("taskDeadline").value;
    let taskPriority = document.getElementById("taskPriority").value;

    if (taskTitle.trim() === "") {
        alert("Task title cannot be empty!");
        return;
    }

    let taskId = `task-${Date.now()}`;
    let isOverdue = new Date(taskDeadline) < new Date();
    
    let taskData = {
        id: taskId,
        title: taskTitle,
        deadline: taskDeadline,
        priority: taskPriority,
        column: column,
        overdue: isOverdue
    };

    let taskElement = createTaskElement(taskData);
    document.querySelector(`#${column} .task-list`).appendChild(taskElement);
    
    saveTaskToLocal(taskData);
    closeTaskModal();
}

// Create Task Element
function createTaskElement(task) {
    let taskElement = document.createElement("div");
    taskElement.className = `task ${task.priority}-priority`;
    if (task.overdue) taskElement.classList.add("overdue");
    
    taskElement.id = task.id;
    taskElement.draggable = true;
    taskElement.ondragstart = drag;
    taskElement.ondblclick = () => editTask(taskElement);

    taskElement.innerHTML = `
        <p>${task.title} (Due: ${task.deadline})</p>
        <button onclick="deleteTask('${task.id}')">❌</button>
    `;

    return taskElement;
}

// Edit Task
function editTask(taskElement) {
    let newTitle = prompt("Edit Task:", taskElement.innerText.replace("❌", "").trim());
    if (newTitle) {
        taskElement.querySelector("p").innerText = newTitle;
        updateTaskTitle(taskElement.id, newTitle);
        saveTasks();
    }
}

// Delete Task
function deleteTask(taskId) {
    document.getElementById(taskId).remove();
    removeTaskFromLocal(taskId);
    saveTasks();
}

// Update Task Column after Drag
function updateTaskColumn(taskId, column) {
    let tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || { todo: [], "in-progress": [], done: [] };
    
    for (let key in tasks) {
        tasks[key] = tasks[key].filter(task => task.id !== taskId);
    }
    
    let movedTask = document.getElementById(taskId);
    let newTaskData = {
        id: taskId,
        title: movedTask.querySelector("p").innerText.split(" (Due: ")[0],
        deadline: movedTask.querySelector("p").innerText.match(/\d{4}-\d{2}-\d{2}/)[0],
        priority: movedTask.classList.contains("high-priority") ? "high" : 
                  movedTask.classList.contains("medium-priority") ? "medium" : "low",
        column: column,
        overdue: movedTask.classList.contains("overdue")
    };

    tasks[column].push(newTaskData);
    localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

// Save Task to Local Storage
function saveTaskToLocal(task) {
    let tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || { todo: [], "in-progress": [], done: [] };
    tasks[task.column].push(task);
    localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

// Save All Tasks (for Editing)
function saveTasks() {
    let tasks = { todo: [], "in-progress": [], done: [] };

    document.querySelectorAll(".column").forEach(column => {
        let columnId = column.id;
        column.querySelectorAll(".task").forEach(task => {
            tasks[columnId].push({
                id: task.id,
                title: task.querySelector("p").innerText.split(" (Due: ")[0],
                deadline: task.querySelector("p").innerText.match(/\d{4}-\d{2}-\d{2}/)[0],
                priority: task.classList.contains("high-priority") ? "high" :
                          task.classList.contains("medium-priority") ? "medium" : "low",
                column: columnId,
                overdue: task.classList.contains("overdue")
            });
        });
    });

    localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

// Load Tasks from Local Storage
function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || { todo: [], "in-progress": [], done: [] };

    Object.keys(tasks).forEach(column => {
        tasks[column].forEach(task => {
            let taskElement = createTaskElement(task);
            document.querySelector(`#${column} .task-list`).appendChild(taskElement);
        });
    });
}

// Remove Task from Local Storage
function removeTaskFromLocal(taskId) {
    let tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || { todo: [], "in-progress": [], done: [] };

    for (let key in tasks) {
        tasks[key] = tasks[key].filter(task => task.id !== taskId);
    }

    localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

// Update Task Title in Local Storage
function updateTaskTitle(taskId, newTitle) {
    let tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || { todo: [], "in-progress": [], done: [] };

    for (let key in tasks) {
        tasks[key].forEach(task => {
            if (task.id === taskId) {
                task.title = newTitle;
            }
        });
    }

    localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

// Dark Mode Toggle
function toggleTheme() {
    document.body.classList.toggle("dark-mode");
}

