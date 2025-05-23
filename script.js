const loginScreen = document.getElementById("login-screen");
const usersScreen = document.getElementById("users-screen");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const usersContainer = document.getElementById("users-container");
const nameFilter = document.getElementById("name-filter");
const countryFilter = document.getElementById("country-filter");
const logoutBtn = document.getElementById("logout-btn");

const VALID_CREDENTIALS = {
  username: "thiagogagliari",
  password: "thi123",
};

let users = [];
let selectedUsers = new Set();

function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (isLoggedIn) {
    loginScreen.classList.add("hidden");
    usersScreen.classList.remove("hidden");
    loadSavedData();
  }
}

function loadSavedData() {
  const savedUsers = localStorage.getItem("users");
  if (savedUsers) {
    users = JSON.parse(savedUsers);
  }

  const savedSelectedUsers = localStorage.getItem("selectedUsers");
  if (savedSelectedUsers) {
    selectedUsers = new Set(JSON.parse(savedSelectedUsers));
  }

  if (users.length > 0) {
    renderUsers();
  } else {
    fetchUsers();
  }
}

function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (
    username === VALID_CREDENTIALS.username &&
    password === VALID_CREDENTIALS.password
  ) {
    localStorage.setItem("isLoggedIn", "true");
    loginScreen.classList.add("hidden");
    usersScreen.classList.remove("hidden");
    loginError.textContent = "";
    loadSavedData();
  } else {
    loginError.textContent = "Usuário ou senha inválidos";
  }
}

function handleLogout() {
  localStorage.removeItem("isLoggedIn");
  loginScreen.classList.remove("hidden");
  usersScreen.classList.add("hidden");
  users = [];
  selectedUsers = new Set();
}

async function fetchUsers() {
  try {
    const response = await fetch("https://randomuser.me/api/?results=12");
    const data = await response.json();
    users = data.results;
    localStorage.setItem("users", JSON.stringify(users));
    renderUsers();
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
  }
}

function renderUsers() {
  const nameFilterValue = nameFilter.value.toLowerCase();
  const countryFilterValue = countryFilter.value.toLowerCase();

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
    const country = user.location.country.toLowerCase();
    return (
      fullName.includes(nameFilterValue) && country.includes(countryFilterValue)
    );
  });

  usersContainer.innerHTML = filteredUsers
    .map(
      (user) => `
        <div class="user-card ${
          selectedUsers.has(user.login.uuid) ? "selected" : ""
        }" 
             data-id="${user.login.uuid}">
            <img src="${user.picture.large}" alt="${user.name.first} ${
        user.name.last
      }">
            <h3>${user.name.first} ${user.name.last}</h3>
            <p>País: ${user.location.country}</p>
            <p>Email: ${user.email}</p>
            <p>Telefone: ${user.phone}</p>
        </div>
    `
    )
    .join("");

  document.querySelectorAll(".user-card").forEach((card) => {
    card.addEventListener("click", () => {
      const userId = card.dataset.id;
      if (selectedUsers.has(userId)) {
        selectedUsers.delete(userId);
      } else {
        selectedUsers.add(userId);
      }
      card.classList.toggle("selected");
      localStorage.setItem("selectedUsers", JSON.stringify([...selectedUsers]));
    });
  });
}

loginForm.addEventListener("submit", handleLogin);
logoutBtn.addEventListener("click", handleLogout);
nameFilter.addEventListener("input", renderUsers);
countryFilter.addEventListener("input", renderUsers);

document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();
});
