document.addEventListener('DOMContentLoaded', () => {
    // Referencias al DOM
    const modal = document.getElementById('booking-modal');
    const closeBtn = document.getElementById('booking-close');
    const backdrop = document.getElementById('booking-backdrop');
    const stepText = document.getElementById('booking-step-text');

    if (!modal) return; // Salida segura si el modal no existe

    // Estado de la reserva
    let bookingData = { pack: '', date: '', time: '', name: '' };

    // ──────────────────────────────────────────
    // Funciones de utilidad: abrir / cerrar
    // ──────────────────────────────────────────
    const openModal = (e) => {
        if (e) e.preventDefault();
        // Pausa Lenis si está activo para evitar scroll en el fondo
        if (typeof lenis !== 'undefined') lenis.stop();
        document.body.style.overflow = 'hidden';

        modal.classList.remove('hidden');
        // Espera un frame para que la transición CSS se dispare
        requestAnimationFrame(() => {
            requestAnimationFrame(() => modal.classList.remove('opacity-0'));
        });
        showStep(1);
        resetData();
    };

    const closeModal = () => {
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            if (typeof lenis !== 'undefined') lenis.start();
        }, 300);
    };

    // ──────────────────────────────────────────
    // Vincular botones de apertura del modal
    // Detecta cualquier botón/enlace con texto relacionado a "Reserva"
    // ──────────────────────────────────────────
    // Vincular botones de apertura (Navbar y Hero y Precios)
    document.querySelectorAll('a, button').forEach(el => {
        const text = el.textContent.toLowerCase();
        if(text.includes('reserva tu clase') || text.includes('book your class') || text.includes('reserve sua aula') || 
           text.includes('agenda tu clase') || text.includes('agende sua aula') || text.includes('reservar mi clase')) {
            el.addEventListener('click', openModal);
        }
    });

    // Cierre con botón X y clic en backdrop
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    // Cierre con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });

    // ──────────────────────────────────────────
    // Navegación entre pasos
    // ──────────────────────────────────────────
    const showStep = (step) => {
        document.querySelectorAll('.booking-step').forEach(el => el.classList.add('hidden'));
        document.getElementById(`step-${step}`).classList.remove('hidden');
        stepText.textContent = `Paso ${step} de 3`;

        // Actualizar los puntos de progreso
        const dots = document.querySelectorAll('.step-dot');
        dots.forEach((dot, i) => {
            if (i < step) {
                dot.classList.remove('bg-white/20');
                dot.classList.add('bg-[#00E5FF]');
                dot.style.transform = i === step - 1 ? 'scale(1.4)' : 'scale(1)';
            } else {
                dot.classList.remove('bg-[#00E5FF]');
                dot.classList.add('bg-white/20');
                dot.style.transform = 'scale(1)';
            }
        });

        // Actualizar badge de paquete en paso 2
        const packBadge = document.getElementById('step2-pack-badge');
        if (step === 2 && packBadge && bookingData.pack) {
            packBadge.textContent = bookingData.pack;
        }
    };

    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            showStep(parseInt(e.currentTarget.dataset.target));
        });
    });

    // ──────────────────────────────────────────
    // PASO 1: Selección de Paquete
    // ──────────────────────────────────────────
    document.querySelectorAll('.package-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Resetear estilos de todos los botones de paquete
            document.querySelectorAll('.package-btn').forEach(b => {
                b.classList.remove('border-[#00E5FF]', 'ring-2', 'ring-[#00E5FF]/50', 'scale-[1.02]');
                b.classList.add('border-white/10');
            });

            // Resaltar el seleccionado
            const current = e.currentTarget;
            current.classList.add('border-[#00E5FF]', 'ring-2', 'ring-[#00E5FF]/50', 'scale-[1.02]');
            current.classList.remove('border-white/10');

            bookingData.pack = current.dataset.name;

            // Pequeña pausa visual antes de pasar al paso 2
            setTimeout(() => showStep(2), 220);
        });
    });

    const timeBtns = document.querySelectorAll('.time-btn');
    const btnNext3 = document.getElementById('btn-next-3');

    const checkStep2Valid = () => {
        if (bookingData.date && bookingData.time) {
            btnNext3.disabled = false;
            btnNext3.classList.remove('bg-gray-600', 'text-white', 'opacity-50', 'cursor-not-allowed');
            btnNext3.classList.add('bg-[#00E5FF]', 'text-[#07131D]');
        }
    };

    // ──────────────────────────────────────────
    // CALENDARIO PERSONALIZADO
    // ──────────────────────────────────────────
    const monthYearDisplay = document.getElementById('cal-month-year');
    const calendarDays = document.getElementById('cal-days');
    const prevMonthBtn = document.getElementById('cal-prev');
    const nextMonthBtn = document.getElementById('cal-next');

    let currentDate = new Date();

    function renderCalendar(date) {
        calendarDays.innerHTML = '';
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Espacios vacíos antes del primer día
        for (let i = 0; i < firstDay; i++) {
            calendarDays.appendChild(document.createElement('div'));
        }

        // Días del mes
        for (let i = 1; i <= daysInMonth; i++) {
            const dayBtn = document.createElement('button');
            dayBtn.type = 'button';
            dayBtn.textContent = i;

            const iterDate = new Date(year, month, i);
            // Almacenamos directamente en formato DD/MM/YYYY
            const dateString = `${String(i).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;

            dayBtn.className = 'w-7 h-7 md:w-8 md:h-8 mx-auto rounded-full flex items-center justify-center transition-colors duration-200';

            if (iterDate < today) {
                dayBtn.classList.add('text-gray-600', 'cursor-not-allowed', 'opacity-40');
                dayBtn.disabled = true;
            } else {
                dayBtn.classList.add('text-white', 'hover:bg-white/10', 'cursor-pointer');

                // Resaltar si ya estaba seleccionada
                if (bookingData.date === dateString) {
                    dayBtn.classList.remove('text-white', 'hover:bg-white/10');
                    dayBtn.classList.add('bg-[#00E5FF]', 'text-[#07131D]', 'font-bold');
                }

                dayBtn.addEventListener('click', (e) => {
                    // Limpiar selección previa
                    calendarDays.querySelectorAll('button:not(:disabled)').forEach(b => {
                        b.classList.remove('bg-[#00E5FF]', 'text-[#07131D]', 'font-bold');
                        b.classList.add('text-white', 'hover:bg-white/10');
                    });
                    // Activar día seleccionado
                    e.currentTarget.classList.remove('text-white', 'hover:bg-white/10');
                    e.currentTarget.classList.add('bg-[#00E5FF]', 'text-[#07131D]', 'font-bold');

                    bookingData.date = dateString;
                    checkStep2Valid();
                });
            }
            calendarDays.appendChild(dayBtn);
        }
    }

    // Bloquear navegación a meses anteriores al actual
    prevMonthBtn.addEventListener('click', () => {
        const now = new Date();
        const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        if (prev >= new Date(now.getFullYear(), now.getMonth(), 1)) {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate);
        }
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    // Inicializar calendario
    renderCalendar(currentDate);

    timeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Resetear todos los botones de hora
            timeBtns.forEach(b => {
                b.classList.remove('bg-[#00E5FF]', 'text-[#07131D]', 'border-[#00E5FF]', 'font-bold');
                b.classList.add('text-white', 'border-white/10');
            });
            // Resaltar el seleccionado
            const current = e.currentTarget;
            current.classList.add('bg-[#00E5FF]', 'text-[#07131D]', 'border-[#00E5FF]', 'font-bold');
            current.classList.remove('text-white', 'border-white/10');
            bookingData.time = current.dataset.time;
            checkStep2Valid();
        });
    });

    btnNext3.addEventListener('click', () => {
        if (!bookingData.date || !bookingData.time) return;
        // bookingData.date ya está en DD/MM/YYYY desde el calendario
        document.getElementById('summary-pack').textContent = bookingData.pack;
        document.getElementById('summary-date').textContent = bookingData.date;
        document.getElementById('summary-time').textContent = bookingData.time;
        showStep(3);
    });

    // ──────────────────────────────────────────
    // PASO 3: Confirmación → WhatsApp
    // ──────────────────────────────────────────
    document.getElementById('btn-confirm').addEventListener('click', () => {
        const nameInput = document.getElementById('booking-name');
        const name = nameInput.value.trim();

        if (!name) {
            nameInput.classList.add('border-red-400');
            nameInput.setAttribute('placeholder', 'Por favor, ingresa tu nombre.');
            nameInput.focus();
            setTimeout(() => {
                nameInput.classList.remove('border-red-400');
                nameInput.setAttribute('placeholder', 'Tu nombre completo');
            }, 2500);
            return;
        }

        // bookingData.date ya viene en formato DD/MM/YYYY desde el calendario
        const readableDate = bookingData.date;

        // Número de WhatsApp (formato internacional sin +)
        const phone = "51991372918";
        const message =
            `Hola Surf Fun! Vengo de la web. Quiero reservar:\n\n` +
            `*Paquete:* ${bookingData.pack}\n` +
            `*Fecha:* ${readableDate}\n` +
            `*Hora:* ${bookingData.time}\n` +
            `*Mi nombre es:* ${name}`;

        const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        closeModal();
    });

    // ──────────────────────────────────────────
    // Reset completo del modal
    // ──────────────────────────────────────────
    const resetData = () => {
        bookingData = { pack: '', date: '', time: '', name: '' };

        // Reset paquetes
        document.querySelectorAll('.package-btn').forEach(b => {
            b.classList.remove('border-[#00E5FF]', 'ring-2', 'ring-[#00E5FF]/50', 'scale-[1.02]');
            b.classList.add('border-white/10');
        });

        // Reset horarios
        timeBtns.forEach(b => {
            b.classList.remove('bg-[#00E5FF]', 'text-[#07131D]', 'border-[#00E5FF]', 'font-bold');
            b.classList.add('text-white', 'border-white/10');
        });

        // Reset calendario al mes actual
        currentDate = new Date();
        renderCalendar(currentDate);

        // Reset nombre
        document.getElementById('booking-name').value = '';

        // Reset botón continuar
        btnNext3.disabled = true;
        btnNext3.className = 'w-full bg-gray-600 text-white font-bold py-3 rounded-full mt-8 opacity-50 cursor-not-allowed transition-all duration-300';
    };
});
