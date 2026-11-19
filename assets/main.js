// Renders the workshop page from data/workshop.json.
// Edit the JSON to change dates, speakers, links, deadlines and the programme.
(function () {
  'use strict';

  var TBA = 'To be announced';

  function get(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function filled(v) { return typeof v === 'string' ? v.trim() !== '' : v != null; }

  function initials(name) {
    var parts = name.replace(/^(Prof\.|Dr\.)\s*/i, '').trim().split(/\s+/);
    var first = parts[0] ? parts[0][0] : '';
    var last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  // Simple text bindings: data-bind="event.title"
  function bindText(data) {
    document.querySelectorAll('[data-bind]').forEach(function (node) {
      var value = get(data, node.getAttribute('data-bind'));
      if (filled(value)) {
        node.textContent = value;
        node.hidden = false;
      } else if (node.hasAttribute('data-hide-empty')) {
        node.hidden = true;
      }
    });
  }

  // Buttons whose href comes from data.links; disabled with a note when empty.
  function bindLinks(data) {
    document.querySelectorAll('[data-link]').forEach(function (node) {
      var url = get(data, 'links.' + node.getAttribute('data-link'));
      var label = node.getAttribute('data-label') || node.textContent;
      if (filled(url)) {
        node.href = url;
        node.textContent = label;
        node.removeAttribute('aria-disabled');
        if (/^https?:/i.test(url)) { node.target = '_blank'; node.rel = 'noopener'; }
      } else if (node.closest('.hero')) {
        node.href = '#call'; // hero button scrolls to the call section until a link exists
      } else {
        node.removeAttribute('href');
        node.setAttribute('aria-disabled', 'true');
        node.textContent = label + ' (opens soon)';
      }
    });
  }

  function bindDeadlines(data) {
    document.querySelectorAll('[data-deadline]').forEach(function (node) {
      var value = get(data, 'deadlines.' + node.getAttribute('data-deadline'));
      node.textContent = filled(value) ? value : TBA;
    });
  }

  function bindEmail(data) {
    document.querySelectorAll('[data-email]').forEach(function (node) {
      var email = get(data, node.getAttribute('data-email'));
      if (filled(email)) {
        node.href = 'mailto:' + email;
        node.textContent = email;
        node.hidden = false;
      }
    });
  }

  var lists = {
    about: function (item) {
      var card = el('article', 'card');
      card.append(el('h3', null, item.title), el('p', null, item.text));
      return card;
    },
    callSessions: function (item) { return lists.about(item); },
    stats: function (item) {
      var box = el('div', 'stat');
      box.append(el('strong', null, item.value), el('p', null, item.text));
      return box;
    },
    outputs: function (item) {
      var li = el('li');
      li.append(el('strong', null, item.title), el('span', null, item.text));
      return li;
    },
    speakers: function (item) {
      var li = el('li', 'speaker');
      var avatar = el('span', 'avatar');
      avatar.setAttribute('aria-hidden', 'true');
      if (filled(item.photo)) {
        var img = el('img');
        img.src = item.photo;
        img.alt = '';
        img.loading = 'lazy';
        avatar.append(img);
      } else {
        avatar.textContent = initials(item.name);
      }
      var info = el('div');
      info.append(el('span', 'speaker-name', item.name));
      if (filled(item.affiliation)) info.append(el('span', 'speaker-org', item.affiliation));
      if (filled(item.role)) info.append(el('span', 'speaker-role', item.role));
      li.append(avatar, info);
      return li;
    }
  };

  function renderLists(data) {
    var sources = {
      about: data.about,
      stats: data.stats,
      outputs: data.outputs,
      speakers: data.speakers,
      callSessions: get(data, 'callForTalks.sessions')
    };
    document.querySelectorAll('[data-list]').forEach(function (node) {
      var key = node.getAttribute('data-list');
      var items = sources[key] || [];
      node.replaceChildren.apply(node, items.map(lists[key]));
    });
  }

  function renderSlot(s) {
    var li = el('li', s.type === 'break' ? 'slot slot-break' : 'slot');
    var time = el('time', null, s.time);
    li.append(time);
    if (s.type === 'break') {
      li.append(el('span', null, s.title));
      return li;
    }
    var main = el('div', 'slot-main');
    main.append(el('span', 'slot-title', s.title));
    if (filled(s.who)) main.append(el('span', 'slot-who', s.who));
    li.append(main);
    if (filled(s.tag)) li.append(el('span', 'tag', s.tag));
    return li;
  }

  function renderProgramme(data) {
    var days = data.programme || [];
    var tabs = document.querySelector('[data-tabs]');
    var panels = document.querySelector('[data-panels]');
    if (!tabs || !panels) return;
    tabs.replaceChildren();
    panels.replaceChildren();

    var buttons = days.map(function (day, i) {
      var id = 'day-' + (i + 1);
      var btn = el('button', 'tab', day.label);
      btn.type = 'button';
      btn.id = id + '-tab';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-controls', id);

      var panel = el('div');
      panel.id = id;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', btn.id);
      var title = el('h3', 'day-title', day.label + ': ' + day.title + ' ');
      if (filled(day.date)) title.append(el('span', null, '· ' + day.date));
      var ol = el('ol', 'schedule');
      ol.replaceChildren.apply(ol, (day.sessions || []).map(renderSlot));
      panel.append(title, ol);

      tabs.append(btn);
      panels.append(panel);
      return { btn: btn, panel: panel };
    });

    function select(index, focus) {
      buttons.forEach(function (b, i) {
        var on = i === index;
        b.btn.setAttribute('aria-selected', on ? 'true' : 'false');
        b.btn.tabIndex = on ? 0 : -1;
        b.panel.hidden = !on;
        if (on && focus) b.btn.focus();
      });
    }

    buttons.forEach(function (b, i) {
      b.btn.addEventListener('click', function () { select(i, false); });
      b.btn.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') select((i + 1) % buttons.length, true);
        if (e.key === 'ArrowLeft') select((i - 1 + buttons.length) % buttons.length, true);
      });
    });

    // Open on the current day during the workshop, otherwise Day 1.
    var today = new Date().toISOString().slice(0, 10);
    var start = 0;
    if (data.event && data.event.endDate === today) start = Math.min(1, buttons.length - 1);
    if (buttons.length) select(start, false);
  }

  function render(data) {
    var title = get(data, 'event.title');
    if (filled(title)) document.title = title;
    bindText(data);
    bindLinks(data);
    bindDeadlines(data);
    bindEmail(data);
    renderLists(data);
    renderProgramme(data);
  }

  fetch('data/workshop.json', { cache: 'no-cache' })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(render)
    .catch(function (err) {
      var msg = el('p', 'load-error',
        'Workshop details could not be loaded (' + err.message + '). ' +
        'If you opened this file directly, serve the folder instead, for example with "python3 -m http.server".');
      document.body.prepend(msg);
    });
})();
