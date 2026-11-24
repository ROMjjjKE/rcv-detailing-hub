/* RCV: меню, оценка автомобиля, форма */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var drawer = $('#drawer'), burger = $('#burger'), closeBtn = $('#drawerClose'), lastFocus = null;
  function openDrawer() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    var f = drawer.querySelector('a, button'); if (f) f.focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (lastFocus) lastFocus.focus();
  }
  if (burger) burger.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (drawer) {
    drawer.addEventListener('click', function (e) { if (e.target === drawer) closeDrawer(); });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', closeDrawer); });
    document.addEventListener('keydown', function (e) {
      if (!drawer.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeDrawer(); return; }
      if (e.key === 'Tab') {
        var items = $$('a, button', drawer).filter(function (el) { return el.offsetParent !== null; });
        if (!items.length) return;
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  window.addEventListener('resize', function () { if (window.innerWidth > 1099) closeDrawer(); });

  /* оценка автомобиля */
  var est = $('[data-est]');
  if (est) {
    var TERM = {
      'Легковой': [3, 6], 'Кроссовер': [3, 6], 'Микроавтобус': [4, 8],
      'Фургон': [4, 8], 'Коммерческий до 3,5 т': [5, 10], 'Свыше 3,5 т': [6, 12]
    };
    var AGE = { 'До 3 лет': 0.8, '3–7 лет': 1, '7–12 лет': 1.25, 'Старше 12 лет': 1.5 };
    var GOAL = {
      'Продать быстрее': { k: 0.7, d: 'Стратегия: цена под рынок и быстрый выход на покупателей.', shows: [5, 10] },
      'Продать дороже': { k: 1, d: 'Стратегия: аккуратная цена и работа с вдумчивыми покупателями.', shows: [8, 15] },
      'Не тратить своё время': { k: 0.9, d: 'Стратегия: берём общение на себя, вы только на показы и сделку.', shows: [6, 12] }
    };
    var BASE = ['Фотосъёмка и подготовка объявления', 'Размещение и продвижение на площадках', 'Обработка обращений и звонков', 'Организация показов', 'Переговоры о цене', 'Документы и оформление в ГАИ'];
    var state = { type: 'Кроссовер', age: '3–7 лет', goal: 'Продать дороже' };

    function render() {
      var t = TERM[state.type] || [3, 6];
      var k = (AGE[state.age] || 1) * ((GOAL[state.goal] || GOAL['Продать дороже']).k);
      var lo = Math.max(2, Math.round(t[0] * k)), hi = Math.max(lo + 1, Math.round(t[1] * k));
      var g = GOAL[state.goal] || GOAL['Продать дороже'];
      var title = state.type + ', ' + state.age.toLowerCase();
      $('[data-e-title]', est).textContent = title;
      $('[data-e-desc]', est).textContent = g.d;
      $('[data-e-term]', est).textContent = lo + '–' + hi + ' нед.';
      $('[data-e-shows]', est).textContent = g.shows[0] + '–' + g.shows[1];
      var list = BASE.slice();
      if (state.goal === 'Продать быстрее') list.splice(1, 0, 'Цена по нижней границе рынка');
      if (state.type.indexOf('Коммерческий') === 0 || state.type === 'Свыше 3,5 т') list.push('Отдельная площадка для коммерческого транспорта');
      $('[data-e-list]', est).innerHTML = list.map(function (x) { return '<li>' + x + '</li>'; }).join('');
      var txt = 'Здравствуйте! Хочу продать автомобиль: ' + state.type + ', возраст ' + state.age.toLowerCase() +
        ', задача — ' + state.goal.toLowerCase() + '. Ориентир по сроку: ' + lo + '–' + hi + ' недель. Что нужно от меня?';
      $('[data-e-wa]', est).href = 'https://wa.me/375291720147?text=' + encodeURIComponent(txt);
    }
    $$('.ef__opts', est).forEach(function (group) {
      var key = group.getAttribute('data-q');
      $$('button', group).forEach(function (b) {
        b.addEventListener('click', function () {
          $$('button', group).forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
          b.setAttribute('aria-pressed', 'true');
          state[key] = b.getAttribute('data-v');
          render();
        });
      });
    });
    render();
  }

  /* форма → WhatsApp */
  $$('form.form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (n) { var el = f.elements[n]; return el ? (el.value || '').trim() : ''; };
      var name = g('name'), phone = g('phone');
      if (!phone) { f.elements['phone'].focus(); return; }
      var lines = ['Заявка с сайта RCV'];
      if (name) lines.push('Имя: ' + name);
      lines.push('Телефон: ' + phone);
      var task = g('task'); if (task) lines.push('Задача: ' + task);
      var msg = g('msg'); if (msg) lines.push('Детали: ' + msg);
      window.open('https://wa.me/375291720147?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  });
})();
