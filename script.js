const form = document.querySelector('#lead-form');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  form.querySelector('.success').style.display = 'block';
  form.reset();
});

document.querySelector('.play').addEventListener('click', (event) => {
  event.currentTarget.textContent = '✓';
  event.currentTarget.setAttribute('aria-label', 'Видео будет добавлено позже');
});
