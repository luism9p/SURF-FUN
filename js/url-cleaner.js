/**
 * url-cleaner.js
 * Limpieza visual de URLs mediante History API.
 * Elimina la extensión .html de la barra de direcciones sin recargar la página.
 */
(function () {
  'use strict';

  var path = window.location.pathname;

  // Quitar .html si termina en él (ej. /catalogo.html → /catalogo)
  if (path.endsWith('.html')) {
    var newPath = path.replace('.html', '');
    // Preservamos search params y hash si los hubiera
    window.history.replaceState(null, '', newPath + window.location.search + window.location.hash);
  }

  // Intercepta clics en enlaces internos con extensión .html
  // y los convierte en navegación limpia sin recarga de página
  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('a[href]');
    if (!anchor) return;

    var href = anchor.getAttribute('href');

    // Solo procesamos rutas relativas o absolutas del mismo origen que terminen en .html
    if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto') || href.startsWith('tel')) return;

    if (href.endsWith('.html')) {
      e.preventDefault();
      var cleanHref = href.replace('.html', '');
      // Navegar normalmente pero con URL limpia
      window.location.href = cleanHref;
    }
  });
})();
