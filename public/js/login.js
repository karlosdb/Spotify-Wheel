

document.getElementById('submit-login').addEventListener('click', (event) => {
  window.location.href = 'dashboard';
});

document.getElementById("show-password").addEventListener('click', (event) => {
  const passwordField = document.getElementById("password");
  passwordField.type = (passwordField.type == "password") ? "text": "password";
  document.getElementById("show-password").classList.toggle('bi-eye');
});
