const form = document.querySelector('#lead-form');
const submitButton = form.querySelector('.submit');
const submitLabel = submitButton.querySelector('.submit-label');
const phoneField = form.querySelector('#phone');
const phonePattern = /^\\+7 \\d{3} \\d{3}-\\d{2}-\\d{2}$/;
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

const formatPhone = (value) => {
  const rawValue = value.trim();
  let digits = rawValue.replace(/\\D/g, '');

  if (!digits) {
    return rawValue === '+' ? '+' : '';
  }

  if (digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  } else if (!digits.startsWith('7')) {
    digits = `7${digits}`;
  }

  digits = digits.slice(0, 11);

  let formatted = '+7';
  if (digits.length > 1) formatted += ` ${digits.slice(1, 4)}`;
  if (digits.length > 4) formatted += ` ${digits.slice(4, 7)}`;
  if (digits.length > 7) formatted += `-${digits.slice(7, 9)}`;
  if (digits.length > 9) formatted += `-${digits.slice(9, 11)}`;

  return formatted;
};

const isFieldValid = (field) => {
  if (field === phoneField) {
    return phonePattern.test(field.value);
  }

  return Boolean(field.value.trim());
};

phoneField.addEventListener('beforeinput', (event) => {
  if (event.inputType.startsWith('delete')) return;

  if (event.data && /[^+\\d]/.test(event.data)) {
    event.preventDefault();
  }
});

phoneField.addEventListener('input', () => {
  phoneField.value = formatPhone(phoneField.value);
});

const validateForm = () => {
  let firstInvalidField = null;

  requiredFields.forEach((field) => {
    const isInvalid = !isFieldValid(field);
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
    if (isFieldValid(field)) {
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

    const response = await fetch(form.action, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    });

    const result = await response.json();
    const spinnerDelay = Math.max(0, 650 - (performance.now() - requestStartedAt));

    if (spinnerDelay) {
      await new Promise((resolve) => window.setTimeout(resolve, spinnerDelay));
    }

    if (!response.ok || !result.success) {
      throw new Error(
        result.data?.message || 'Не удалось отправить заявку.',
      );
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
    setSubmitState('error', 'Ошибка отправки');
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
