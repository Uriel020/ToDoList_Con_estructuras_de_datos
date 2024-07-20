document.addEventListener('DOMContentLoaded', () => {
    // Mostrar la fecha actual en el elemento con id 'current_date'
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let formattedDate = new Intl.DateTimeFormat('es-ES', options).format(currentDate);
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    document.getElementById('current_date').textContent = formattedDate;

    // Obtener referencias a los elementos del DOM
    const todoInput = document.querySelector(".todo-input");
    const dateInput = document.getElementById("date");
    const createButton = document.getElementById("create");
    const todoList = document.getElementById("todo__list");

    // Cola para mantener las tareas ordenadas por prioridad y fecha
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

    // Función para cargar las tareas desde el localStorage
    const loadTasksFromLocalStorage = () => {
        const storedTasks = localStorage.getItem('tasks');
        return storedTasks ? JSON.parse(storedTasks) : [];
    };

    // Función para guardar las tareas en el localStorage
    const saveTasksToLocalStorage = () => {
        localStorage.setItem('tasks', JSON.stringify(tasksQueue));
    };

    // Función para agregar una tarea a la cola y ordenar por prioridad y fecha
    const addTaskToQueue = (todoText, todoDate, todoPriority) => {
        const newTask = { text: todoText, date: todoDate, priority: todoPriority, pinned: true };
        tasksQueue.push(newTask);
        sortTasksByPriorityAndDate();
        saveTasksToLocalStorage();
        renderTodoList();
    };

    // Función para fijar o desfijar una tarea
    const pinTask = (index) => {
        const pinnedTask = tasksQueue.splice(index, 1)[0];
        pinnedTask.pinned = !pinnedTask.pinned;
        
        if (pinnedTask.pinned) {
            pinnedTask.priority = calculatePriority(); // Asignar prioridad
            tasksQueue.unshift(pinnedTask); // Insertar tarea fijada al principio
        } else {
            pinnedTask.priority = null; // Quitar prioridad si se desfija
            tasksQueue.push(pinnedTask); // Insertar tarea no fijada al final
        }

        sortTasksByPriorityAndDate();
        saveTasksToLocalStorage();
        renderTodoList();
    };

    // Función para calcular la prioridad actual
    const calculatePriority = () => {
        const pinnedTasks = tasksQueue.filter(task => task.pinned && task.priority !== null);
        const highestPriority = pinnedTasks.length > 0 ? Math.max(...pinnedTasks.map(task => task.priority)) : 0;
        return highestPriority + 1;
    };

    // Función para eliminar una tarea
    const deleteTask = (index) => {
        tasksQueue.splice(index, 1);
        saveTasksToLocalStorage();
        renderTodoList();
    };

    // Función para editar una tarea
    const editTask = (index, newText, newDate) => {
        tasksQueue[index].text = newText;
        tasksQueue[index].date = newDate;
        saveTasksToLocalStorage();
        renderTodoList();
    };

    // Función para ordenar las tareas por prioridad y fecha
    const sortTasksByPriorityAndDate = () => {
        tasksQueue.sort((task1, task2) => {
            // Ordenar primero por prioridad (mayor a menor)
            if (task1.pinned && !task2.pinned) return -1;
            if (!task1.pinned && task2.pinned) return 1;
            if (task1.pinned && task2.pinned) {
                return task2.priority - task1.priority; // Ordenar tareas fijadas por prioridad
            } else {
                // Si no están fijadas, ordenar por fecha ascendente
                return new Date(task1.date) - new Date(task2.date);
            }
        });
    };

    // Función para crear un elemento de tarea con botones
    const createTodoElement = (task, index) => {
        const todoItem = document.createElement("div");
        todoItem.classList.add("todo-item");

        const todoInfo = document.createElement("p");
        todoInfo.innerHTML = `<strong>TO-DO:</strong> ${task.text} <br> <strong>Fecha :</strong> ${task.date}`;
        todoItem.appendChild(todoInfo);

        const todoActions = document.createElement("div");
        todoActions.classList.add("todo-actions");

        // Botones de acción
        const setButton = createButtonElement(task.pinned ? "Fijada" : "Fijar", "set-btn", () => pinTask(index));
        todoActions.appendChild(setButton);

        const editButton = createButtonElement("Editar", "edit-btn", () => {
            const todoInfo = todoItem.querySelector("p");
            const originalText = todoInfo.querySelector("strong").nextSibling.textContent.trim();
            const originalDate = todoInfo.querySelector("strong").nextSibling.nextSibling.textContent.trim();

            // Crear un formulario para editar la tarea
            const editForm = document.createElement("form");
            editForm.classList.add("edit-form");

            const editText = document.createElement("input");
            editText.type = "text";
            editText.value = originalText;
            editForm.appendChild(editText);

            const editDate = document.createElement("input");
            editDate.type = "date";
            editDate.value = originalDate;
            editForm.appendChild(editDate);

            const saveButton = document.createElement("button");
            saveButton.textContent = "Guardar";
            saveButton.classList.add("save-btn");

            // Event listener para guardar los cambios
            saveButton.addEventListener("click", (e) => {
                e.preventDefault();
                const editedText = editText.value.trim();
                const editedDate = editDate.value;

                if (editedText === "" || editedDate === "") {
                    alert("Por favor, completa todos los campos.");
                    return;
                }

                editTask(index, editedText, editedDate);

                // Reemplazar el formulario de edición con la nueva información de tarea
                const newTodoInfo = document.createElement("p");
                newTodoInfo.innerHTML = `<strong>TO-DO:</strong> ${editedText} <br> <strong>Fecha :</strong> ${editedDate}`;
                editForm.replaceWith(newTodoInfo);
            });

            editForm.appendChild(saveButton);
            todoInfo.replaceWith(editForm);
        });
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

    // Función para renderizar la lista de tareas en el DOM
    const renderTodoList = () => {
        todoList.innerHTML = '';
        tasksQueue.forEach((task, index) => {
            const todoItem = createTodoElement(task, index);
            todoList.appendChild(todoItem);
        });
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

        addTaskToQueue(todoText, todoDate, null); // Inicialmente sin prioridad

        // Limpiar campos de entrada
        todoInput.value = "";
        dateInput.value = "";
    });

    // Inicialización al cargar la página
    const initialize = () => {
        tasksQueue = loadTasksFromLocalStorage();
        sortTasksByPriorityAndDate();
        renderTodoList();
    };

    setDateMin(); // Configurar la fecha mínima en la carga inicial
    initialize(); // Inicializar la aplicación
});
