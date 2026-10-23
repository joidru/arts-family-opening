const form = document.querySelector('#lead-form');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  form.querySelector('.success').style.display = 'block';
  form.reset();
});

const videoCard = document.querySelector('.video-card');
const video = videoCard.querySelector('.opening-video');
const playButton = videoCard.querySelector('.play');

playButton.addEventListener('click', async () => {
  try {
    await video.play();
  } catch {
    video.controls = true;
  }
});

video.addEventListener('play', () => {
  videoCard.classList.add('is-playing');
  video.controls = true;
});

video.addEventListener('pause', () => {
  if (!video.ended) {
    videoCard.classList.remove('is-playing');
  }
});

video.addEventListener('ended', () => {
  videoCard.classList.remove('is-playing');
  video.controls = false;
  video.currentTime = 0;
});

video.addEventListener('error', () => {
  playButton.setAttribute('aria-label', 'Не удалось загрузить видео');
});
