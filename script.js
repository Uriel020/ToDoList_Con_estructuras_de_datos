const todoInput = document.querySelector(".todo-input");
const priorityInput = document.querySelector(".priority-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const filterOption = document.querySelector(".filter-todo");

// Eventos principales
document.addEventListener("DOMContentLoaded", getLocalTodos);
todoButton.addEventListener("click", addTodo);
todoList.addEventListener("click", deleteCheck);
filterOption.addEventListener("change", filterTodo);

// Función para añadir una nueva tarea
function addTodo(event) {
    event.preventDefault();

    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");

    const newTodo = document.createElement("li");
    newTodo.innerText = todoInput.value;
    newTodo.classList.add("todo-item");
    todoDiv.appendChild(newTodo);

    const priority = parseInt(priorityInput.value) || 1;  // Si no se ingresa prioridad, se establece en 1
    todoDiv.setAttribute('data-priority', priority);

    const completedButton = document.createElement("button");
    completedButton.innerHTML = '<i class="fas fa-check-circle"></i>';
    completedButton.classList.add("complete-btn");
    todoDiv.appendChild(completedButton);

    const trashButton = document.createElement("button");
    trashButton.innerHTML = '<i class="fas fa-trash"></i>';
    trashButton.classList.add("trash-btn");
    todoDiv.appendChild(trashButton);

    todoList.appendChild(todoDiv);

    saveLocalTodos(todoInput.value, priority);
    todoInput.value = "";
    priorityInput.value = "";

    displayTodos();
}

// Función para eliminar o completar una tarea
function deleteCheck(e) {
    const item = e.target;

    if (item.classList[0] === "trash-btn") {
        const todo = item.parentElement;
        todo.classList.add("slide");
        removeLocalTodos(todo);
        todo.addEventListener("transitionend", function() {
            todo.remove();
        });
    }

    if (item.classList[0] === "complete-btn") {
        const todo = item.parentElement;
        todo.classList.toggle("completed");
    }
}

// Función para filtrar las tareas
function filterTodo() {
    const todos = todoList.childNodes;
    todos.forEach(function(todo) {
        switch (filterOption.value) {
            case "all":
                todo.style.display = "flex";
                break;
            case "completed":
                if (todo.classList.contains("completed")) {
                    todo.style.display = "flex";
                } else {
                    todo.style.display = "none";
                }
                break;
            case "incompleted":
                if (!todo.classList.contains("completed")) {
                    todo.style.display = "flex";
                } else {
                    todo.style.display = "none";
                }
                break;
        }
    });
}

// Función para guardar tareas en localStorage
function saveLocalTodos(todo, priority) {
    let todos = localStorage.getItem("todos") === null ? [] : JSON.parse(localStorage.getItem("todos"));
    todos.push({ value: todo, priority: priority, timestamp: new Date().getTime() });
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Función para obtener tareas desde localStorage
function getLocalTodos() {
    let todos = localStorage.getItem("todos") === null ? [] : JSON.parse(localStorage.getItem("todos"));
    todos.forEach(function(todo) {
        const todoDiv = document.createElement("div");
        todoDiv.classList.add("todo");

        const newTodo = document.createElement("li");
        newTodo.innerText = todo.value;
        newTodo.classList.add("todo-item");
        todoDiv.appendChild(newTodo);

        todoDiv.setAttribute('data-priority', todo.priority);

        const completedButton = document.createElement("button");
        completedButton.innerHTML = '<i class="fas fa-check-circle"></i>';
        completedButton.classList.add("complete-btn");
        todoDiv.appendChild(completedButton);

        const trashButton = document.createElement("button");
        trashButton.innerHTML = '<i class="fas fa-trash"></i>';
        trashButton.classList.add("trash-btn");
        todoDiv.appendChild(trashButton);

        todoList.appendChild(todoDiv);
    });

    displayTodos();
}

// Función para eliminar tareas de localStorage
function removeLocalTodos(todo) {
    let todos = localStorage.getItem("todos") === null ? [] : JSON.parse(localStorage.getItem("todos"));
    const todoIndex = todo.children[0].innerText;
    todos.splice(todos.findIndex(t => t.value === todoIndex), 1);
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Función para mostrar las tareas ordenadas por prioridad
function displayTodos() {
    const todos = Array.from(todoList.children);
    todos.sort((a, b) => b.getAttribute('data-priority') - a.getAttribute('data-priority'));
    todos.forEach(todo => todoList.appendChild(todo));
}
