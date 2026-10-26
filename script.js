const form = document.querySelector('#lead-form');
const submitButton = form.querySelector('.submit');
const submitLabel = submitButton.querySelector('.submit-label');
const requiredFields = Array.from(form.querySelectorAll('[required]'));
let submitResetTimer;

const submitLabels = {
  default: 'Оставить заявку',
  loading: 'Отправляем…',
  success: 'Отправлено',
  error: 'Ошибка',
};

const setSubmitState = (state = 'default', label = '') => {
  window.clearTimeout(submitResetTimer);
  submitButton.classList.remove('is-loading', 'is-success', 'is-error');

  if (state !== 'default') {
    submitButton.classList.add(`is-${state}`);
  }

  submitLabel.textContent = label || submitLabels[state];
  submitButton.disabled = state === 'loading' || state === 'success';
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

    if (submitButton.classList.contains('is-error')) {
      setSubmitState();
    }
  });
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const firstInvalidField = validateForm();

  if (firstInvalidField) {
    setSubmitState('error', 'Заполните поля');
    firstInvalidField.focus({ preventScroll: true });
    return;
  }

  setSubmitState('loading');
  form.setAttribute('aria-busy', 'true');
  const requestStartedAt = performance.now();

  try {
    const formData = new FormData(form);
    formData.set('landing_url', window.location.href);

    await fetch(form.action, {
      method: 'POST',
      body: formData,
      mode: 'no-cors',
      credentials: 'omit',
    });

    const spinnerDelay = Math.max(0, 650 - (performance.now() - requestStartedAt));
    if (spinnerDelay) {
      await new Promise((resolve) => window.setTimeout(resolve, spinnerDelay));
    }

    form.reset();
    requiredFields.forEach((field) => {
      field.classList.remove('is-invalid');
      field.setAttribute('aria-invalid', 'false');
    });
    setSubmitState('success');
    submitResetTimer = window.setTimeout(() => {
      setSubmitState();
    }, 3000);
  } catch {
    setSubmitState('error');
  } finally {
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
