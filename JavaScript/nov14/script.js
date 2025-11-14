let tasks = [];
let taskIdCounter = 1;

// DOM Elements
const inputTask = document.getElementById("inputTask");
const btnAdd = document.getElementById("btnAdd");
const taskList = document.getElementById("taskList");

btnAdd.addEventListener("click", addTask);

inputTask.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

function addTask() {
  const taskText = inputTask.value.trim();

  if (taskText === "") {
    console.error("Please enter a task before adding!");
    return;
  }

  const isDuplicate = tasks.some((task) => {
    return task.text.toLowerCase() === taskText.toLowerCase();
  });

  if (isDuplicate) {
    console.error("This task already exists in your list!");
    return;
  }

  const newTask = {
    id: taskIdCounter++,
    text: taskText,
    completed: false
  };

  tasks.push(newTask);

  inputTask.value = "";
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => { return task.id !== id });
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML = "<p>No tasks yet. Add your first task!</p>"
    return;
  }

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];

    const taskItem = document.createElement("div");
    taskItem.className = "task-item";
    if (task.completed) {
      taskItem.classList.add("completed");
    }

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "task-buttons";

    const btnDelete = document.createElement("button");
    btnDelete.className = "btn-delete";
    btnDelete.textContent = "Delete";
    btnDelete.addEventListener("click", () => {
      deleteTask(task.id);
    });

    buttonsContainer.appendChild(btnDelete);

    taskItem.appendChild(taskText);
    taskItem.appendChild(buttonsContainer);

    taskList.appendChild(taskItem);
  }
}
renderTasks();
