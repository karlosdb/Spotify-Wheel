let currentUrl = window.location.href

let arr = currentUrl.split('/')
arr = arr.slice(0, -1)

console.log(arr)

currentUrl = arr.join('/')


document.getElementById('submit-button').addEventListener('click', async () => {
  const response = await fetch(`${currentUrl}/api/save_comment`);
  const data = await response.json();
  console.log(data);
})