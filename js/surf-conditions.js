/* -------------------- 
   Dashboard Surf Conditions
   -------------------- */
async function updateSurfConditions() {
    const elHeight = document.getElementById('api-surf-height');
    const elSubHeight = document.getElementById('api-surf-sub');
    const elSwellHeight = document.getElementById('api-swell-height');
    const elSwellPeriod = document.getElementById('api-swell-period');
    const elSwellDir = document.getElementById('api-swell-dir');
    const elWind = document.getElementById('api-wind');
    const elWater = document.getElementById('api-temp-water');
    const elAir = document.getElementById('api-temp-air');

    // Return if not on dashboard page
    if (!elHeight) return;

    // Helper: degree to compass Rose direction
    const getCompassDir = (deg) => {
        const val = Math.floor((deg / 22.5) + 0.5);
        const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
        return arr[(val % 16)];
    };

    try {
        // Fetch Marine Data (Waves)
        const marineRes = await fetch('https://marine-api.open-meteo.com/v1/marine?latitude=-4.45&longitude=-81.28&current=wave_height,wave_period,wave_direction');
        if (marineRes.ok) {
            const marineData = await marineRes.json();
            if (marineData && marineData.current) {
                const wh = marineData.current.wave_height;
                const wp = marineData.current.wave_period;
                const wd = marineData.current.wave_direction;

                // Card 1: Height
                const minH = Math.max(0, (wh - 0.2)).toFixed(1);
                const maxH = (wh + 0.2).toFixed(1);
                elHeight.textContent = `${minH} - ${maxH}m`;

                // Detectar idioma actual del documento
                const currentLang = document.documentElement.lang || 'es';

                // 1. Textos dinámicos para el tamaño de olas
                let subEs = "Plano o muy pequeño";
                let subEn = "Flat or very small";
                let subPt = "Plano ou muito pequeno";

                if (wh > 0.6 && wh < 1.2) {
                    subEs = "Por la rodilla/cintura"; subEn = "Knee/Waist high"; subPt = "Pelo joelho/cintura";
                } else if (wh >= 1.2 && wh < 1.8) {
                    subEs = "Por la cintura/pecho"; subEn = "Waist/Chest high"; subPt = "Pela cintura/peito";
                } else if (wh >= 1.8 && wh < 2.5) {
                    subEs = "Por encima de la cabeza"; subEn = "Overhead"; subPt = "Acima da cabeça";
                } else if (wh >= 2.5) {
                    subEs = "Doble Overhead+"; subEn = "Double Overhead+"; subPt = "Duplo Overhead+";
                }

                // Inyectar atributos para futuros clicks del traductor
                elSubHeight.setAttribute('data-es', subEs);
                elSubHeight.setAttribute('data-en', subEn);
                elSubHeight.setAttribute('data-pt', subPt);

                // Renderizar inmediatamente en el idioma actual
                elSubHeight.textContent = currentLang === 'en' ? subEn : (currentLang === 'pt' ? subPt : subEs);

                // 2. Textos dinámicos para el estado del mar
                const ratingEl = document.getElementById('api-surf-rating');
                if (ratingEl) {
                    let icon = "";
                    let rateEs = "", rateEn = "", ratePt = "";
                    let colorClass = "";

                    if (wh < 1.2) {
                        icon = "🟢"; colorClass = "text-green-400";
                        rateEs = "PERFECTO PARA APRENDER"; rateEn = "PERFECT FOR BEGINNERS"; ratePt = "PERFEITO PARA APRENDER";
                    } else if (wh >= 1.2 && wh < 1.9) {
                        icon = "🟡"; colorClass = "text-yellow-400";
                        rateEs = "DIVERSIÓN / INTERMEDIO"; rateEn = "FUN / INTERMEDIATE"; ratePt = "DIVERSÃO / INTERMEDIÁRIO";
                    } else {
                        icon = "🔴"; colorClass = "text-red-400";
                        rateEs = "SOLO EXPERTOS"; rateEn = "EXPERTS ONLY"; ratePt = "SÓ EXPERIENTES";
                    }

                    // Actualizar clases visuales
                    ratingEl.className = `text-sm md:text-base font-bold tracking-wider flex items-center gap-2 ${colorClass}`;

                    // Inyectar atributos combinando icono + texto
                    ratingEl.setAttribute('data-es', `${icon} ${rateEs}`);
                    ratingEl.setAttribute('data-en', `${icon} ${rateEn}`);
                    ratingEl.setAttribute('data-pt', `${icon} ${ratePt}`);

                    // Renderizar inmediatamente
                    ratingEl.textContent = currentLang === 'en' ? `${icon} ${rateEn}` : (currentLang === 'pt' ? `${icon} ${ratePt}` : `${icon} ${rateEs}`);
                }

                // Card 2: Swell
                if (elSwellHeight && elSwellPeriod && elSwellDir) {
                    elSwellHeight.textContent = `${wh}m`;
                    elSwellPeriod.textContent = `${wp}s`;
                    
                    const dirStr = getCompassDir(wd);
                    const arrowSvg = `<svg class="w-5 h-5 text-gray-400" style="transform: rotate(${Math.round(wd)}deg);" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>`;
                    elSwellDir.innerHTML = `${arrowSvg} ${dirStr} ${Math.round(wd)}°`;
                }
            }
        }

        // Fetch Weather Data (Wind & Temp)
        const weatherRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-4.45&longitude=-81.28&current=temperature_2m,wind_speed_10m,wind_direction_10m');
        if (weatherRes.ok) {
            const weatherData = await weatherRes.json();
            if (weatherData && weatherData.current) {
                const ws = weatherData.current.wind_speed_10m;
                const wdir = weatherData.current.wind_direction_10m;
                const temp = weatherData.current.temperature_2m;

                // Card 3: Wind
                const wDirStr = getCompassDir(wdir);
                const wArrowSvg = `<svg class="w-7 h-7 text-gray-400 mr-2" style="transform: rotate(${Math.round(wdir)}deg);" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>`;
                elWind.innerHTML = `${wArrowSvg} ${Math.round(ws)} kph ${wDirStr}`;

                // Card 4: Temperature
                const tAir = Math.round(temp);
                const tWater = Math.max(16, tAir - 2); // Roughly air - 2 degrees, minimum ~16C for Peru
                elAir.textContent = `${tAir}°C`;
                elWater.textContent = `${tWater}°C`;
            }
        }

        // Ejecutar traducción inmediatamente después de inyectar datos
        translateSurfWidget();

    } catch (e) {
        console.error("Error fetching Dashboard data:", e);
    }
}

// Call on load
document.addEventListener('DOMContentLoaded', updateSurfConditions);

// ==========================================
// AUTOTRADUCTOR REACTIVO DEL WIDGET DE SURF
// ==========================================
function translateSurfWidget() {
    // Obtenemos el idioma actual de la etiqueta <html> (ej. 'es', 'en', 'pt')
    const currentLang = document.documentElement.lang || 'es';
    const widget = document.getElementById('condiciones');
    
    if (!widget) return;

    // Seleccionamos todo elemento dentro del widget que tenga opciones de idioma
    const translatableElements = widget.querySelectorAll('[data-es], [data-en], [data-pt]');
    
    translatableElements.forEach(el => {
        const translation = el.getAttribute(`data-${currentLang}`);
        if (translation) {
            // Usamos innerHTML para soportar los iconos/spans inyectados en el DOM
            el.innerHTML = translation;
        }
    });
}

// 1. Configurar MutationObserver para detectar clics en el selector de idiomas global
const langObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        // Si el script global cambia el 'lang' del HTML, forzamos la traducción aquí
        if (mutation.attributeName === 'lang') {
            translateSurfWidget();
        }
    });
});

// Iniciar la observación en el elemento raíz
langObserver.observe(document.documentElement, { attributes: true });
