const form = document.querySelector(".todo-form")
const todoInput = document.querySelector(".todo-input");
const addBtn = document.querySelector(".add-btn");
const todoList = document.querySelector(".todo-list");
const todoContainer = document.querySelector(".todo-container");

async function fetchTodos() {
    const response = await fetch ("/api/todos");
    const todos = await response.json();
    return todos; 
}

fetchTodos().then((todos) => {
  console.log(todos);
});

function renderTodos(todos) {
    // clear existing todos
    todoList.innerHTML = "";

    todos.forEach((todo) => {
        // create element
        const li = document.createElement("li");
        const span = document.createElement("span");
        const deleteTodo = document.createElement("button");
        deleteTodo.classList.add("btn", "delete-button");
        const toggleBtn = document.createElement("button");
        toggleBtn.classList.add("btn", "toggle-button");
        const editButton = document.createElement("button");
        editButton.classList.add("btn", "edit-button")
        const btnContainer = document.createElement("div");
        btnContainer.classList.add("button-group");

        // set text
        span.textContent = todo.text;
        deleteTodo.textContent = "Delete"
        editButton.textContent = "Edit"
        
    // set toggle button text
    if(todo.done) {
        toggleBtn.textContent = "Undo";
    } else {
        toggleBtn.textContent = "Done";
    }
    
    // toggle handler
    toggleBtn.addEventListener("click", async () => {
        await fetch(`/api/todos/${todo._id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ done: !todo.done })
        });
        await loadTodos();
    });

    let editInput;

    editButton.addEventListener("click", async () => {

        if(editButton.textContent === "Edit") {
            editInput = document.createElement("input");
            editInput.classList.add("edit-input");
            editInput.value = todo.text;
            editInput.focus();
            li.replaceChild(editInput, span);
            editButton.textContent = "Save"

        }  else if(editButton.textContent === "Save") {
            const newText = editInput.value.trim();
            if(!newText) {
                return;
            }
            await fetch(`/api/todos/${todo._id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: newText })
        });
        await loadTodos();
        }
    })

    // delete handler
    deleteTodo.addEventListener("click", async () => {
        await fetch(`/api/todos/${todo._id}`, {
        method: "DELETE"
    });

    await loadTodos();
});
    // mark as done
    if (todo.done) {
        li.classList.add("completed");
    }

    // add to DOM
    btnContainer.append(toggleBtn, editButton, deleteTodo );
    li.append(span);
    li.append(btnContainer);
    todoList.append(li);
    });
};


async function loadTodos() {
    const todos = await fetchTodos();
    renderTodos(todos);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = todoInput.value.trim();

    if(!text) return;

    await fetch("/api/todos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
    });
    todoInput.value = "";
    await loadTodos();
});
loadTodos();