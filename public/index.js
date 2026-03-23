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

async function renderTodos(todos) {
  // clear existing todos
  todoList.innerHTML = "";

  todos.forEach((todo) => {
    // create element
    const li = document.createElement("li");

    // set text
    li.textContent = todo.text;

    // mark as done if completed
    if (todo.done) {
      li.classList.add("completed");
    }

    // add to DOM
    todoList.appendChild(li);
  });
};

async function loadTodos() {
    const todos = await fetchTodos();
    renderTodos(todos);
}
loadTodos();

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