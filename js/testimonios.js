/* -------------------------------------------------
   Sección de Testimonios (Google Maps, curados manualmente)
   ------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('testimonios');
  if (!section) return;

  const desktopTrack = document.getElementById('testimonios-track-desktop');
  const mobileTrack = document.getElementById('testimonios-track-mobile');

  const avatarClasses = ['testimonio-avatar-a', 'testimonio-avatar-b', 'testimonio-avatar-c'];

  const googleIconSVG = `<svg class="testimonio-google-icon" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>`;

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function starsHTML(rating) {
    let out = '';
    for (let i = 0; i < 5; i++) out += i < rating ? '★' : '☆';
    return out;
  }

  function cardHTML(t, idx) {
    const avatarClass = avatarClasses[idx % avatarClasses.length];
    return `
      <div class="testimonio-card">
        <div class="flex items-start justify-between gap-2 mb-3">
          <div class="flex items-center gap-3">
            <div class="testimonio-avatar ${avatarClass}">${escapeHTML(t.avatarInicial)}</div>
            <div>
              <p class="font-bold text-sm" style="color:#0f172a;">${escapeHTML(t.nombre)}</p>
              <p class="text-xs" style="color:#94a3b8;">${escapeHTML(t.fecha)}</p>
            </div>
          </div>
          ${googleIconSVG}
        </div>
        <div class="testimonio-stars mb-3" aria-label="${t.rating} de 5 estrellas">${starsHTML(t.rating)}</div>
        <p class="testimonio-texto line-clamp-4">${escapeHTML(t.texto)}</p>
        <button type="button" class="testimonio-leer-mas hidden" data-i18n="testimonio_leer_mas">Leer más</button>
      </div>
    `;
  }

  function render(list, targetEl, duplicate) {
    if (!targetEl) return;
    const items = duplicate ? list.concat(list) : list;
    targetEl.innerHTML = items.map(cardHTML).join('');
  }

  function initLeerMas() {
    section.querySelectorAll('.testimonio-texto').forEach((p) => {
      if (p.scrollHeight > p.clientHeight + 2) {
        const btn = p.nextElementSibling;
        if (btn && btn.classList.contains('testimonio-leer-mas')) {
          btn.classList.remove('hidden');
        }
      }
    });
  }

  fetch('data/testimonios.json')
    .then((res) => res.json())
    .then((data) => {
      const ratingEl = document.getElementById('testimonios-rating');
      const totalEl = document.getElementById('testimonios-total');
      if (ratingEl && typeof data.ratingPromedio === 'number') {
        ratingEl.textContent = data.ratingPromedio.toFixed(1);
      }
      if (totalEl && typeof data.totalResenas === 'number') {
        totalEl.textContent = data.totalResenas;
      }

      render(data.testimonios, desktopTrack, true);
      render(data.testimonios, mobileTrack, false);

      // Espera a que las fuentes web terminen de cargar (afecta la altura real
      // del texto) antes de medir qué tarjetas necesitan "Leer más".
      const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      ready.then(() => requestAnimationFrame(initLeerMas));
      // Red de seguridad por si el layout cambia después (p. ej. resize).
      setTimeout(initLeerMas, 600);
    })
    .catch((err) => {
      console.error('No se pudieron cargar los testimonios:', err);
    });

  // "Leer más" — expande el texto completo in-place, sin modal
  section.addEventListener('click', (e) => {
    if (e.target.classList.contains('testimonio-leer-mas')) {
      const p = e.target.previousElementSibling;
      if (p) p.classList.remove('line-clamp-4');
      e.target.remove();
    }
  });
});
