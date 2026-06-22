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

                // Give it a human-readable subtext based on height
                let humanSub = "Plano o muy pequeño";
                if (wh > 0.6 && wh < 1.2) humanSub = "Por la rodilla/cintura";
                if (wh >= 1.2 && wh < 1.8) humanSub = "Por la cintura/pecho";
                if (wh >= 1.8 && wh < 2.5) humanSub = "Overhead (Por encima de la cabeza)";
                if (wh >= 2.5) humanSub = "Doble Overhead+";
                elSubHeight.textContent = humanSub;

                // Dynamic Rating Banner
                const ratingEl = document.getElementById('api-surf-rating');
                if (ratingEl) {
                    const baseClasses = "font-medium tracking-wide";
                    if (wh < 1.2) {
                        ratingEl.textContent = "🟢 PERFECTO PARA APRENDER";
                        ratingEl.className = `${baseClasses} text-green-400`;
                    } else if (wh >= 1.2 && wh < 1.9) {
                        ratingEl.textContent = "🟡 DIVERSIÓN / INTERMEDIO";
                        ratingEl.className = `${baseClasses} text-yellow-400`;
                    } else {
                        ratingEl.textContent = "🔴 SOLO EXPERTOS";
                        ratingEl.className = `${baseClasses} text-red-400`;
                    }
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

    } catch (e) {
        console.error("Error fetching Dashboard data:", e);
    }
}

// Call on load
document.addEventListener('DOMContentLoaded', updateSurfConditions);
