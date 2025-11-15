let tasks = []; // Array with tasks
let currentID = 0; // ID of each task

// Connecting variables between JS and HTML.
const input = document.getElementById("taskInput");
const task_list = document.getElementById("listOfTasks");
const errorMsg = document.getElementById("errorMsg");
const addBtn = document.getElementById("addBtn");

// Add task through click or "Enter" key.
addBtn.addEventListener("click", addTask);
input.addEventListener("keypress", (enter) => {
    if (enter.key === "Enter") addTask();
});

// Creates the task and adds it to the DOM and HTML.
function addTask() {
    const text = input.value.trim();

    // If the task input is empty.
    if (text === "") {
        errorMsg.textContent = "Tasks can not be empty."
        return;
    }

    // Checks for duplicates.
    if (tasks.some(t => t.text === text)) {
        errorMsg.textContent = "That task already exists.";
        return;
    }

    // Error message doesn't appear otherwise.
    errorMsg.textContent = "";

    // New task: give unique id #, inputted text, mark as incomplete
    const newTask = {
        id: currentID++,
        text: text,
        complete: false,
    };

    // Add task into tasks array
    tasks.push(newTask);
    input.value = ""; // Erase value from input bar.

    updateTasks();
};

function markTask(id) {
    for (let task of tasks) {
        if (task.id === id) {
            // Switches between true or flase when pressed.
            task.complete = !task.complete;
        };
    };
    updateTasks();
};

function eliminateTask(id) {
    // Make a new array that does not include this task.
    tasks = tasks.filter(task => task.id !== id);
    updateTasks();
};

function updateTasks() {
    task_list.innerHTML = "";
    for (let task of tasks) {
        // Creates task item li in HTML
        const list_item = document.createElement("li");
        list_item.className = "item";

        // Creates text span in the task item.
        const text = document.createElement("span");
        text.textContent = task.text;
        text.className = "task_words";

        // Creates button container.
        const btnContainer = document.createElement("div");
        btnContainer.className = "buttons";

        // Creates Complete button in the task item.
        const btnComplete = document.createElement("button");
        btnComplete.textContent = "Complete";
        btnComplete.classList.add("complete-btn");
        btnComplete.onclick = () => markTask(task.id);

        // Creates Eliminate button in the task item.
        const btnEliminate = document.createElement("button");
        btnEliminate.textContent = "Eliminate";
        btnEliminate.classList.add("eliminate-btn");
        btnEliminate.onclick = () => eliminateTask(task.id);

        // Checks if task is complete, applies changes.
        if (task.complete) {
            list_item.classList.add("complete-task");
            btnComplete.textContent = task.complete ? "Undo" : "Complete";
        };

        // Adds all the changes into the HTML.
        btnContainer.appendChild(btnComplete);
        btnContainer.appendChild(btnEliminate);
        list_item.appendChild(text);
        list_item.appendChild(btnContainer);
        task_list.appendChild(list_item);
    }
}