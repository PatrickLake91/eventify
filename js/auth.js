function isLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "true";
}

function login() {
  localStorage.setItem("isLoggedIn", "true");
  window.location.href = "index.html";
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "index.html";
}

function protectPage() {
  if (!isLoggedIn()) {
    window.location.href = "index.html";
  }
}

function updateNav() {
  const navAuth = document.getElementById("navAuth");

  if (!navAuth) return;

  if (isLoggedIn()) {
    navAuth.innerHTML = `
      <button class="btn btn-sm btn-outline-light ms-2" onclick="logout()">
        Logout
      </button>
    `;
  } else {
    navAuth.innerHTML = `
      <a href="login.html" class="btn btn-sm btn-light ms-2">
        Login
      </a>
    `;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updateNav();
});