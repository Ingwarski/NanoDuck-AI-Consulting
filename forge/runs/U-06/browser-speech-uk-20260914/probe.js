const $ = selector => document.querySelector(selector);
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const diagnostics = {
  browser: navigator.userAgent,
  secureContext: window.isSecureContext,
  api: window.SpeechRecognition ? 'SpeechRecognition' : window.webkitSpeechRecognition ? 'webkitSpeechRecognition' : 'unavailable',
  requestedLanguage: 'uk-UA',
  liveRecognition: 'not_run',
  events: [],
};
let current = null;
function renderDiagnostics() { $('#diagnostics').textContent = JSON.stringify(diagnostics, null, 2); }
function event(name) { diagnostics.events.push(name); renderDiagnostics(); }
function buttons(active) {
  $('#start').disabled = active || !Recognition || !window.isSecureContext;
  $('#stop').disabled = !active;
  $('#cancel').disabled = !active;
  $('#transcript').readOnly = active;
}
function finish(run) {
  clearTimeout(run.timer);
  clearTimeout(run.watchdog);
  if (current !== run) return;
  current = null;
  buttons(false);
  $('#interim').textContent = '';
  if (run.error) return;
  diagnostics.liveRecognition = run.finalText.trim() ? 'transcript_received_needs_human_review' : 'no_final_transcript';
  $('#status').textContent = run.finalText.trim() ? 'Розпізнавання завершено. Перевірте український текст.' : 'Завершено без підтвердженого тексту. Спробуйте ще раз.';
  renderDiagnostics();
}
function cancel(reason) {
  const run = current;
  if (!run) return;
  current = null;
  clearTimeout(run.timer);
  clearTimeout(run.watchdog);
  try { run.recognition.abort(); } catch { /* Recognition may already have ended. */ }
  $('#transcript').value = run.previous;
  $('#interim').textContent = '';
  $('#status').textContent = 'Запис скасовано. Попередній текст збережено.';
  diagnostics.liveRecognition = reason;
  event(reason);
  buttons(false);
}
function stop() {
  const run = current;
  if (!run) return;
  $('#stop').disabled = true;
  $('#status').textContent = 'Завершуємо розпізнавання…';
  clearTimeout(run.timer);
  try { run.recognition.stop(); } catch { finish(run); return; }
  run.watchdog = setTimeout(() => {
    if (current !== run) return;
    run.error = true;
    try { run.recognition.abort(); } catch { /* No active recognition. */ }
    diagnostics.liveRecognition = 'end_timeout';
    $('#status').textContent = 'Браузер не завершив розпізнавання вчасно. Підтверджений текст збережено.';
    finish(run);
    event('end_timeout');
  }, 5000);
}
$('#capability').textContent = Recognition && window.isSecureContext
  ? 'API розпізнавання доступний. Українське диктування потрібно перевірити голосом.'
  : 'У цьому браузері або контексті API розпізнавання недоступний.';
buttons(false);
renderDiagnostics();
$('#start').addEventListener('click', () => {
  if (current || !Recognition) return;
  const recognition = new Recognition();
  recognition.lang = 'uk-UA';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  const run = { recognition, previous: $('#transcript').value, finalText: '', error: false };
  current = run;
  diagnostics.events = [];
  diagnostics.configuredLanguage = recognition.lang;
  diagnostics.liveRecognition = 'starting';
  buttons(true);
  $('#status').textContent = 'Очікуємо запуску й дозволу на мікрофон…';
  recognition.onstart = () => {
    if (current !== run) return;
    diagnostics.liveRecognition = 'listening';
    $('#status').textContent = 'Слухаю українською…';
    event('start');
  };
  recognition.onresult = result => {
    if (current !== run) return;
    let finalText = '', interimText = '';
    for (let i = 0; i < result.results.length; i++) {
      if (result.results[i].isFinal) finalText += `${result.results[i][0].transcript} `;
      else interimText += `${result.results[i][0].transcript} `;
    }
    run.finalText = finalText;
    $('#transcript').value = [run.previous, finalText.trim()].filter(Boolean).join('\n\n');
    $('#interim').textContent = interimText;
    event(finalText ? 'final_result' : 'interim_result');
  };
  recognition.onerror = error => {
    if (current !== run) return;
    run.error = true;
    diagnostics.liveRecognition = `error:${error.error}`;
    const messages = {
      'language-not-supported': 'Браузер відхилив українську мову.',
      'not-allowed': 'Доступ до мікрофона або розпізнавання не дозволено.',
      'service-not-allowed': 'Служба розпізнавання недоступна. У Safari перевірте, чи ввімкнено Siri та диктування.',
      'network': 'Не вдалося зв’язатися зі службою розпізнавання.',
      'no-speech': 'Браузер не виявив мовлення.',
      'audio-capture': 'Браузер не отримав звук із мікрофона.',
    };
    $('#status').textContent = messages[error.error] || `Розпізнавання перервано: ${error.error}`;
    event(`error:${error.error}`);
    try { recognition.abort(); } catch { /* No active recognition. */ }
    finish(run);
  };
  recognition.onend = () => { if (current === run) { event('end'); finish(run); } };
  run.timer = setTimeout(stop, 30000);
  try { recognition.start(); } catch (error) {
    run.error = true;
    diagnostics.liveRecognition = `exception:${error.name}`;
    $('#status').textContent = `Не вдалося почати: ${error.name}`;
    event(`exception:${error.name}`);
    finish(run);
  }
});
$('#stop').addEventListener('click', stop);
$('#cancel').addEventListener('click', () => cancel('cancelled'));
document.addEventListener('visibilitychange', () => { if (document.hidden) cancel('background_cancelled'); });
window.addEventListener('pagehide', () => cancel('page_closed'));
