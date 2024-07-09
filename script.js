document.addEventListener('DOMContentLoaded', () => {
    // Mostrar la fecha actual en el elemento con id 'current_date'
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let formattedDate = new Intl.DateTimeFormat('es-ES', options).format(currentDate);
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    document.getElementById('current_date').textContent = formattedDate;

    // Obtener referencias a los elementos del DOM
    const todoInput = document.getElementById("todo-input");
    const dateInput = document.getElementById("date");
    const createButton = document.getElementById("create");
    const todoList = document.getElementById("todo-list");

    // Cola para mantener las tareas ordenadas por fecha
    let tasksQueue = [];

    // Establecer la fecha mínima para el campo de fecha
    const setDateMin = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const minDate = `${year}-${month}-${day}`;
        dateInput.setAttribute('min', minDate);
    };

    setDateMin();

    // Función para agregar una tarea a la cola y ordenar por fecha
    const addTaskToQueue = (todoText, todoDate) => {
        const newTask = { text: todoText, date: todoDate, pinned: false };
        tasksQueue.push(newTask);
        tasksQueue.sort((task1, task2) => new Date(task1.date) - new Date(task2.date));
        saveTasksToLocalStorage();
        renderTodoList();
    };

    // Función para renderizar la lista de tareas en el DOM
    const renderTodoList = () => {
        todoList.innerHTML = '';
        tasksQueue.forEach((task, index) => {
            const todoItem = createTodoElement(task, index);
            todoList.appendChild(todoItem);
        });
    };

    // Función para crear un elemento de tarea con botones
    const createTodoElement = (task, index) => {
        const todoItem = document.createElement("div");
        todoItem.classList.add("todo-item");

        const todoInfo = document.createElement("p");
        todoInfo.innerHTML = `<strong>TO-DO:</strong> ${task.text} <br> <strong>Deadline:</strong> ${task.date}`;
        todoItem.appendChild(todoInfo);

        const todoActions = document.createElement("div");
        todoActions.classList.add("todo-actions");

        const setButton = createButtonElement(task.pinned ? "Fijada" : "Fijar", "set-btn", () => pinTask(index));
        todoActions.appendChild(setButton);

        const editButton = createButtonElement("Editar", "edit-btn", () => editTask(index));
        todoActions.appendChild(editButton);

        const deleteButton = createButtonElement("Eliminar", "delete-btn", () => deleteTask(index));
        todoActions.appendChild(deleteButton);

        todoItem.appendChild(todoActions);
        return todoItem;
    };

    // Función para crear un botón con texto, clase y función clickHandler
    const createButtonElement = (text, className, clickHandler) => {
        const button = document.createElement("button");
        button.textContent = text;
        button.classList.add(className);
        button.addEventListener("click", clickHandler);
        return button;
    };

    // Función para fijar o desfijar una tarea
    const pinTask = (index) => {
        tasksQueue[index].pinned = !tasksQueue[index].pinned;
        saveTasksToLocalStorage();
        renderTodoList();
    };

    // Función para eliminar una tarea
    const deleteTask = (index) => {
        tasksQueue.splice(index, 1);
        saveTasksToLocalStorage();
        renderTodoList();
    };

    // Función para cargar las tareas desde el localStorage
    const loadTasksFromLocalStorage = () => {
        const storedTasks = localStorage.getItem('tasks');
        return storedTasks ? JSON.parse(storedTasks) : [];
    };

    // Función para guardar las tareas en el localStorage
    const saveTasksToLocalStorage = () => {
        localStorage.setItem('tasks', JSON.stringify(tasksQueue));
    };

    // Event listener para crear una nueva tarea
    createButton.addEventListener("click", (event) => {
        event.preventDefault();
        const todoText = todoInput.value.trim();
        const todoDate = dateInput.value;

        if (todoText === "" || todoDate === "") {
            alert("Por favor, completa todos los campos.");
            return;
        }

        addTaskToQueue(todoText, todoDate);

        todoInput.value = "";
        dateInput.value = "";
    });

    // Inicialización al cargar la página
    const initialize = () => {
        tasksQueue = loadTasksFromLocalStorage();
        renderTodoList();
    };

    initialize();
});

