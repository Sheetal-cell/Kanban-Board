function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();
    let data = event.dataTransfer.getData("text");
    let task = document.getElementById(data);
    event.target.appendChild(task);
    applyTaskColor(task, event.target.closest(".column").id);
    saveTasks();
    checkDueDates();
}

function addTask(columnId) {
    let title = prompt("Enter task title:");
    let description = prompt("Enter task description:");
    let priority = prompt("Set priority (high, medium, low):");
    let dueDate = prompt("Set due date (YYYY-MM-DD):") || "N/A";
    let assignedTo = prompt("Assign task to:") || "Unassigned";
    
    if (title) {
        let task = document.createElement("div");
        task.className = `task priority-${priority}`;
        task.innerHTML = `<strong>${title}</strong>
            <p>${description}</p>
            <p>Due: <span class="due-date">${dueDate}</span></p>
            <p>Assigned to: ${assignedTo}</p>
            <label>Priority: 
                <select onchange="updatePriority(this)">
                    <option value="high" ${priority === "high" ? "selected" : ""}>High</option>
                    <option value="medium" ${priority === "medium" ? "selected" : ""}>Medium</option>
                    <option value="low" ${priority === "low" ? "selected" : ""}>Low</option>
                </select>
            </label>
            <button onclick="addComment(this)">💬</button>
            <button onclick="editTask(this)">✏️</button>
            <button onclick="deleteTask(this)">❌</button>`;
        task.setAttribute("draggable", true);
        task.setAttribute("id", "task-" + Math.random().toString(36).substr(2, 9));
        task.ondragstart = drag;
        document.getElementById(columnId).querySelector(".task-list").appendChild(task);
        applyTaskColor(task, columnId);
        saveTasks();
        updateProgress();
        checkDueDates();
    }
}

function applyTaskColor(task, columnId) {
    task.style.backgroundColor = columnId === "todo" ? "red" :
                                 columnId === "inprogress" ? "yellow" :
                                 columnId === "done" ? "green" : "white";
}

function editTask(button) {
    let task = button.parentElement;
    let newTitle = prompt("Edit task title:", task.querySelector("strong").textContent);
    let newDescription = prompt("Edit task description:", task.querySelector("p").textContent);
    if (newTitle) task.querySelector("strong").textContent = newTitle;
    if (newDescription) task.querySelector("p").textContent = newDescription;
    saveTasks();
}

function deleteTask(button) {
    button.parentElement.remove();
    saveTasks();
    updateProgress();
}

function addComment(button) {
    let comment = prompt("Enter your comment:");
    if (comment) {
        let task = button.parentElement;
        let comments = task.querySelector(".comments");
        if (!comments) {
            comments = document.createElement("div");
            comments.className = "comments";
            task.appendChild(comments);
        }
        let commentNode = document.createElement("p");
        commentNode.textContent = comment;
        comments.appendChild(commentNode);
        saveTasks();
    }
}

function updatePriority(selectElement) {
    let task = selectElement.closest(".task");
    let priority = selectElement.value;
    task.className = `task priority-${priority}`;
    saveTasks();
}

function checkDueDates() {
    let currentDate = new Date().toISOString().split("T")[0];
    document.querySelectorAll(".task").forEach(task => {
        let dueDateElement = task.querySelector(".due-date");
        let dueDate = dueDateElement.textContent.trim();
        let columnId = task.parentElement.parentElement.id;
        
        if (dueDate !== "N/A" && dueDate < currentDate && (columnId === "todo" || columnId === "inprogress")) {
            dueDateElement.style.color = "red";
            dueDateElement.textContent = `${dueDate} (FAILED)`;
        }
    });
}

function saveTasks() {
    let tasks = [];
    document.querySelectorAll(".task").forEach(task => {
        tasks.push({
            id: task.id,
            title: task.querySelector("strong").textContent,
            description: task.querySelector("p").textContent,
            dueDate: task.querySelector(".due-date").textContent,
            column: task.parentElement.parentElement.id,
            priority: task.classList.contains("priority-high") ? "high" :
                      task.classList.contains("priority-medium") ? "medium" : "low"
        });
    });
    localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || [];
    tasks.forEach(taskData => {
        let task = document.createElement("div");
        task.className = `task priority-${taskData.priority}`;
        task.innerHTML = `<strong>${taskData.title}</strong>
            <p>${taskData.description}</p>
            <p>Due: <span class="due-date">${taskData.dueDate ? taskData.dueDate : "N/A"}</span></p>
            <label>Priority: 
                <select onchange="updatePriority(this)">
                    <option value="high" ${taskData.priority === "high" ? "selected" : ""}>High</option>
                    <option value="medium" ${taskData.priority === "medium" ? "selected" : ""}>Medium</option>
                    <option value="low" ${taskData.priority === "low" ? "selected" : ""}>Low</option>
                </select>
            </label>
            <button onclick="editTask(this)">✏️</button>
            <button onclick="deleteTask(this)">❌</button>`;
        task.setAttribute("draggable", true);
        task.setAttribute("id", taskData.id);
        task.ondragstart = drag;
        let column = document.getElementById(taskData.column);
        column.querySelector(".task-list").appendChild(task);
        applyTaskColor(task, taskData.column);
    });
    checkDueDates();
}

function updateProgress() {
    let totalTasks = document.querySelectorAll(".task").length;
    let doneTasks = document.querySelectorAll("#done .task").length;
    let progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;
    document.getElementById("progress-bar").style.width = progress + "%";
}

document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    updateProgress();
});
