(function () {
  'use strict';

  var LANG = 'es';

  function texto(campo) {
    if (!campo) return '';
    return campo[LANG] || campo.es || '';
  }

  function formatearPrecio(valor, simbolo) {
    if (String(valor).toUpperCase() === 'CONSULTAR') return 'Consultar';
    var n = Number(valor);
    var f = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);
    return (simbolo || '$') + ' ' + f + '.-';
  }

  function el(tag, cls, texto) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (texto !== undefined) e.textContent = texto;
    return e;
  }

  function render(data) {
    var app = document.getElementById('app');
    var nav = document.getElementById('nav');
    var foot = document.getElementById('foot');
    app.innerHTML = '';
    nav.innerHTML = '';

    var simbolo = texto(data.config && data.config.simbolo) || '$';
    var tagsMap = data.tags || {};

    if (!data.secciones || !data.secciones.length) {
      app.appendChild(el('p', 'error', 'La carta no tiene secciones publicadas todavía.'));
      return;
    }

    data.secciones.forEach(function (sec) {
      var navLink = el('a', null, texto(sec.nombre));
      navLink.href = '#' + sec.id;
      nav.appendChild(navLink);

      var section = el('section', 'section');
      section.id = sec.id;

      var head = el('div', 'section-head');
      head.appendChild(el('h2', 'section-title', texto(sec.nombre)));
      head.appendChild(el('div', 'section-rule'));
      section.appendChild(head);

      if (texto(sec.nota)) {
        section.appendChild(el('p', 'section-note', texto(sec.nota)));
      }

      sec.items.forEach(function (item) {
        var row = el('article', 'item');

        var top = el('div', 'item-row');
        top.appendChild(el('h3', 'item-name', texto(item.nombre)));
        top.appendChild(el('span', 'item-leader'));
        top.appendChild(el('span', 'item-price', formatearPrecio(item.precio, simbolo)));
        row.appendChild(top);

        if (texto(item.descripcion)) {
          row.appendChild(el('p', 'item-desc', texto(item.descripcion)));
        }

        (item.tags || []).forEach(function (tagId) {
          var label = texto(tagsMap[tagId]);
          if (label) row.appendChild(el('span', 'item-tag', label));
        });

        section.appendChild(row);
      });

      app.appendChild(section);
    });

    foot.innerHTML = '';
    if (texto(data.carta && data.carta.pie)) {
      foot.appendChild(el('p', null, texto(data.carta.pie)));
    }
    if (data.carta && data.carta.actualizado) {
      var d = new Date(data.carta.actualizado);
      var f = isNaN(d) ? '' : d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
      if (f) foot.appendChild(el('span', 'updated', 'Actualizado el ' + f));
    }
  }

  function cargar() {
    fetch('./data/spa.json', { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(render)
      .catch(function () {
        var app = document.getElementById('app');
        app.innerHTML = '';
        app.appendChild(el('p', 'error', 'No pudimos cargar la carta. Actualizá la página en unos minutos.'));
      });
  }

  document.addEventListener('DOMContentLoaded', cargar);
})();
