const cl = console.log;

const todoForm = document.getElementById("todoForm");
const todoName = document.getElementById("todoName");
const description = document.getElementById("description");
const isCompleted = document.getElementById("isCompleted");
const todoContainer = document.getElementById("todoContainer");

// buttons
const addTodoBtn = document.getElementById("addTodoBtn");
const updateTodoBtn = document.getElementById("updateTodoBtn");

// spinner

const spinner = document.getElementById("spinner");

let BASE_URL = `https://todo-crud-async-await-generic-default-rtdb.firebaseio.com`;

let TODO_URL = `${BASE_URL}/todo3.json`;

let state = {
  todoArr: [],
  editId: null,
};

// Functions

// Obj to Arr

function objToArr(obj) {
  state.todoArr = Object.entries(obj || {}).map(([id, todo]) => {
    return {
      ...todo,
      id: id,
    };
  }).reverse();
}

// snackbar

function snackbar(msg, icon) {
  return Swal.fire({
    text: msg,
    icon: icon,
    timer: 1800,
  });
}

// spinner

function showSpinner(flag) {
  if (flag) {
    spinner.classList.remove("d-none");
  } else {
    spinner.classList.add("d-none");
  }
}

// Create

async function onTodoAdd(event) {
  try {
    event.preventDefault();

    let newTodo = {
      todoItem: todoName.value.trim(),
      description: description.value.trim(),
      isCompleted: isCompleted.value === "yes" ? true : false,
    };

    showSpinner(true);
    let res = await fetch(TODO_URL, {
      method: "POST",
      body: JSON.stringify(newTodo),
      headers: {
        "Content-Type": "application/json",
        Authorization: "JWT TOKEN",
      },
    });

    let data = await res.json();

    newTodo.id = data.name;

    state.todoArr.unshift(newTodo);

    createLI(newTodo);

    snackbar("Todo Created successfully!", "success");

    todoForm.reset();
  } catch (err) {
    snackbar(err.message, "error");
  } finally {
    showSpinner();
  }
}

// CreatLI

function createLI(newTodo) {
  let li = document.createElement("li");

  li.id = newTodo.id;

  li.className = `list-group-item`;

  li.innerHTML = `
                                    <div class="d-flex justify-content-between" onclick="toggleDescription(this)">
                                    <div>
                                    ${newTodo.isCompleted ? `<input type="checkbox" onclick="event.stopPropagation(); onCheck(this)" checked>` : `<input type="checkbox" onclick="event.stopPropagation(); onCheck(this)">`}
                                        <strong>${newTodo.todoItem}</strong>
                                    </div>

                                    <div>
                                        <button onclick="event.stopPropagation(); onTodoEdit(this)"
                                            class="btn btn-sm btn-primary">Edit</button>
                                        <button onclick="event.stopPropagation(); onTodoRemove(this)"
                                            class="btn btn-sm btn-danger deleteBtn">Remove</button>
                                    </div>
                                </div>

                                <div class="collapse">
                                    <div class="card-body">
                                        ${newTodo.description}
                                    </div>
                                </div>
    `;

  todoContainer.prepend(li);
}

// read

async function onShowOnUI() {
  try {
    showSpinner(true);
    let res = await fetch(TODO_URL, {
      method: "GET",
      body: null,
      headers: {
        "Content-Type": "application/json",
        Authorization: "JWT TOKEN",
      },
    });

    let data = await res.json();
    objToArr(data);
    rendering(state.todoArr);
  } catch (err) {
    snackbar(err.message, "error");
  } finally {
    showSpinner();
  }
}

onShowOnUI();

// rendering

function rendering(arr) {
  let result = "";

  arr.forEach((ele) => {
    result += `
                            <li class="list-group-item" id="${ele.id}">

                                <div class="d-flex justify-content-between" onclick="toggleDescription(this)">
                                    <div>
                                        ${ele.isCompleted ? `<input type="checkbox" onclick="event.stopPropagation(); onCheck(this)" checked>` : `<input type="checkbox" onclick="event.stopPropagation(); onCheck(this)">`}
                                        <strong>${ele.todoItem}</strong>
                                    </div>

                                    <div>
                                        <button onclick="event.stopPropagation(); onTodoEdit(this)"
                                            class="btn btn-sm btn-primary">Edit</button>
                                        <button onclick="event.stopPropagation(); onTodoRemove(this)"
                                            class="btn btn-sm btn-danger deleteBtn">Remove</button>
                                    </div>
                                </div>

                                <div class="collapse">
                                    <div class="card-body">
                                        ${ele.description}
                                    </div>
                                </div>

                            </li>
`;
  });

  todoContainer.innerHTML = result;
}

// Edit

function onTodoEdit(ele) {
  let editId = ele.closest("li").id;
  state.editId = editId;

  let allDeleteBtn = document.querySelectorAll("#todoContainer .deleteBtn");
  allDeleteBtn.forEach((ele) => (ele.disabled = false));

  let deleteBtn = (ele.closest("li").querySelector(".deleteBtn").disabled =
    true);

  let findObj = state.todoArr.find((ele) => ele.id === editId);

  todoName.value = findObj.todoItem;
  description.value = findObj.description;
  isCompleted.value = findObj.isCompleted ? "yes" : "no";

  addTodoBtn.classList.add("d-none");
  updateTodoBtn.classList.remove("d-none");
}

// update

async function onTodoUpdate() {
  try {
    let updateId = state.editId;

    let deleteBtn = (document
      .getElementById(updateId)
      .querySelector(".deleteBtn").disabled = false);

    let updatedObj = {
      id: updateId,
      todoItem: todoName.value.trim(),
      description: description.value.trim(),
      isCompleted: isCompleted.value === "yes" ? true : false,
    };

    let UPDTAED_URL = `${BASE_URL}/todo3/${updateId}.json`;

    showSpinner(true);
    let res = await fetch(UPDTAED_URL, {
      method: "PATCH",
      body: JSON.stringify(updatedObj),
      headers: {
        "Content-Type": "Applicaton/json",
        Authorization: "JWT TOKEN",
      },
    });

    let data = await res.json();

    let getIndex = state.todoArr.findIndex((ele) => ele.id === updateId);

    state.todoArr[getIndex] = updatedObj;

    updateUI(data);

    snackbar("Todo Updated successfully!", "success");

    todoForm.reset();

    updateTodoBtn.classList.add("d-none");
    addTodoBtn.classList.remove("d-none");
    state.editId = null;
  } catch (err) {
    snackbar(err.message, "error");
  } finally {
    showSpinner();
  }
}

// updateUI

function updateUI(data) {
  let li = document.getElementById(data.id);

  li.innerHTML = `
                                  <div class="d-flex justify-content-between" onclick="toggleDescription(this)">
                                    <div>
                                        ${data.isCompleted ? `<input type="checkbox" onclick="event.stopPropagation(); onCheck(this)" checked>` : `<input type="checkbox" onclick="event.stopPropagation(); onCheck(this)">`}
                                        <strong>${data.todoItem}</strong>
                                    </div>

                                    <div>
                                        <button onclick="event.stopPropagation(); onTodoEdit(this)"
                                            class="btn btn-sm btn-primary">Edit</button>
                                        <button onclick="event.stopPropagation(); onTodoRemove(this)"
                                            class="btn btn-sm btn-danger deleteBtn">Remove</button>
                                    </div>
                                </div>

                                <div class="collapse">
                                    <div class="card-body">
                                        ${data.description}
                                    </div>
                                </div>
  `;
}

// Remove

async function onTodoRemove(ele) {
  let confirm = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  });
  if (confirm.isConfirmed) {
    try {
      let removeId = ele.closest("li").id;

      let REMOVE_URL = `${BASE_URL}/todo3/${removeId}.json`;

      showSpinner(true);

      let res = await fetch(REMOVE_URL, {
        method: "DELETE",
        body: null,
        headers: {
          "Content-Type": "Applicaton/json",
          Authorization: "JWT TOKEN",
        },
      });

      let data = await res.json();
      let getIndex = state.todoArr.findIndex((ele) => ele.id === removeId);
      state.todoArr.splice(getIndex, 1);

      ele.closest("li").remove();
      snackbar("Todo Deleted successfully!", "success");
    } catch (err) {
      snackbar(err.message, "error");
    } finally {
      showSpinner();
    }
  }
}

// toggleDescription

function toggleDescription(ele) {
  let description = ele.nextElementSibling;

  description.classList.toggle("show");
}

// onCheck

async function onCheck(ele) {
  try {
    let todoId = ele.closest("li").id;

    let updatedObj = {
      isCompleted: ele.checked,
    };
    let UPDATE_URL = `${BASE_URL}/todo3/${todoId}.json`;

    showSpinner(true);

    let res = await fetch(UPDATE_URL, {
      method: "PATCH",
      body: JSON.stringify(updatedObj),
      headers: {
        "Content-Type": "Applicaton/json",
        Authorization: "JWT TOKEN",
      },
    });

    let data = await res.json();
    let getIndex = state.todoArr.findIndex((ele) => ele.id === todoId);
    state.todoArr[getIndex].isCompleted = ele.checked;
    snackbar("Todo status updated successfully!", "success");
  } catch (err) {
    snackbar(err.message, "error");
  } finally {
    showSpinner();
  }
}

todoForm.addEventListener("submit", onTodoAdd);
updateTodoBtn.addEventListener("click", onTodoUpdate);
