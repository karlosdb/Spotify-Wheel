

document.getElementById('submit-login').addEventListener('click', (event) => {
  window.location.href = 'dashboard';
});

document.getElementById("show-password").addEventListener('click', (event) => {
  const passwordField = document.getElementById("password");
  passwordField.type = (passwordField.type === "password") ? "text": "password";
  document.getElementById("show-password").classList.toggle('bi-eye');
});

document.getElementById("is-registering").addEventListener('click', (event) => {
  document.getElementById("confirm-password").classList.toggle("hidden");
  const passwordField = document.getElementById("password");
  const submitLogin = document.getElementById("submit-login");
  submitLogin.value = (submitLogin.value === "Log In") ? "Register": "Log In";
  passwordField.autocomplete = (passwordField.autocomplete == "current-password") ? "new-password": "current-password";
});