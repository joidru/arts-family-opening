const form = document.querySelector('#lead-form');
const submitButton = form.querySelector('.submit');
const formStatus = form.querySelector('.form-status');
const requiredFields = Array.from(form.querySelectorAll('[required]'));

const setFormStatus = (message = '', type = '') => {
  formStatus.textContent = message;
  formStatus.className = 'form-status';

  if (message) {
    formStatus.classList.add('is-visible');
  }

  if (type) {
    formStatus.classList.add(`is-${type}`);
  }
};

const validateForm = () => {
  let firstInvalidField = null;

  requiredFields.forEach((field) => {
    const isInvalid = !field.value.trim();
    field.classList.toggle('is-invalid', isInvalid);
    field.setAttribute('aria-invalid', String(isInvalid));

    if (isInvalid && !firstInvalidField) {
      firstInvalidField = field;
    }
  });

  return firstInvalidField;
};

requiredFields.forEach((field) => {
  field.addEventListener('input', () => {
    if (field.value.trim()) {
      field.classList.remove('is-invalid');
      field.setAttribute('aria-invalid', 'false');
    }

    if (formStatus.classList.contains('is-error')) {
      setFormStatus();
    }
  });
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const firstInvalidField = validateForm();

  if (firstInvalidField) {
    setFormStatus('Заполните, пожалуйста, все поля.', 'error');
    firstInvalidField.focus({ preventScroll: true });
    return;
  }

  submitButton.disabled = true;
  form.setAttribute('aria-busy', 'true');
  setFormStatus('Отправляем заявку…');

  try {
    const formData = new FormData(form);
    formData.set('landing_url', window.location.href);

    await fetch(form.action, {
      method: 'POST',
      body: formData,
      mode: 'no-cors',
      credentials: 'omit',
    });

    form.reset();
    requiredFields.forEach((field) => {
      field.classList.remove('is-invalid');
      field.setAttribute('aria-invalid', 'false');
    });
    setFormStatus('Спасибо! Заявка успешно отправлена.', 'success');
  } catch (error) {
    setFormStatus('Не удалось отправить заявку. Попробуйте ещё раз.', 'error');
  } finally {
    submitButton.disabled = false;
    form.removeAttribute('aria-busy');
  }
});

const videoCard = document.querySelector('.video-card');
const video = videoCard.querySelector('.opening-video');
const playButton = videoCard.querySelector('.play');
const soundButton = videoCard.querySelector('.sound-toggle');
const soundLabel = soundButton.querySelector('.sound-label');

const updateSoundButton = () => {
  const soundIsOn = !video.muted && video.volume > 0;
  soundButton.classList.toggle('is-on', soundIsOn);
  soundButton.setAttribute('aria-pressed', String(soundIsOn));
  soundButton.setAttribute(
    'aria-label',
    soundIsOn ? 'Выключить звук' : 'Включить звук',
  );
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
