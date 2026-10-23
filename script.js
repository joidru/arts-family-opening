const form = document.querySelector('#lead-form');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  form.querySelector('.success').style.display = 'block';
  form.reset();
});

const videoCard = document.querySelector('.video-card');
const video = videoCard.querySelector('.opening-video');
const playButton = videoCard.querySelector('.play');
const soundButton = videoCard.querySelector('.sound-toggle');
const soundIcon = soundButton.querySelector('.sound-icon');
const soundLabel = soundButton.querySelector('.sound-label');

const updateSoundButton = () => {
  const soundIsOn = !video.muted && video.volume > 0;
  soundButton.classList.toggle('is-on', soundIsOn);
  soundButton.setAttribute('aria-pressed', String(soundIsOn));
  soundButton.setAttribute(
    'aria-label',
    soundIsOn ? 'Выключить звук' : 'Включить звук',
  );
  soundIcon.textContent = soundIsOn ? '🔊' : '🔇';
  soundLabel.textContent = soundIsOn ? 'Выключить звук' : 'Включить звук';
};

playButton.addEventListener('click', async () => {
  try {
    await video.play();
  } catch {
    video.controls = false;
  }
});

soundButton.addEventListener('click', async () => {
  video.muted = !video.muted;

  if (video.paused) {
    try {
      await video.play();
    } catch {
      video.controls = false;
    }
  }

  updateSoundButton();
});

video.addEventListener('volumechange', updateSoundButton);
updateSoundButton();

video.addEventListener('play', () => {
  videoCard.classList.add('is-playing');
  video.controls = false;
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
