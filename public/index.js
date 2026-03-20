const form = document.querySelector(".todo-form")
const todoInput = document.querySelector(".todo-input");
const addBtn = document.querySelector(".add-btn");
const todoList = document.querySelector(".todo-list");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log(todoInput.value);
    todoInput.value = "";
})

async function loadTodos() {
    const res = await fetch("/api/todos");
    const todos = await res.json();
    console.log("Todos from API:", todos);
}

loadTodos();

