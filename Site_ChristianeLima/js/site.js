const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu-links');
function closeMenu() {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
}
toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-nav')) closeMenu();
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) { closeMenu(); toggle.focus(); }
});

const form = document.querySelector('#agendamento-form');
if (form) {
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const data = new FormData(form);
        const value = (name) => String(data.get(name) || '').trim();
        const message = [
            `Olá, me chamo ${value('Nome')}, estou entrando em contato através do seu site na plataforma e tenho interesse em saber mais das sessões de terapia.`,
            '', 'Informações:',
            `Nome completo: ${value('Nome')}`,
            `Estado civil: ${value('Estado_Civil')}`,
            `Telefone: ${value('Telefone')}`,
            `Email: ${value('Email')}`,
            `Como tenho estado: ${value('Relato_Paciente')}`,
            `Plano pretendido: ${value('Plano')}`
        ].join('\n');
        // Reutiliza o mesmo número do botão de dúvidas.
        const contact = document.querySelector('.btn-whatsapp');
        const url = new URL(contact.href);
        url.search = '';
        url.searchParams.set('text', message);
        window.location.assign(url.href);
    });
}

const track = document.querySelector('.carousel-track');
if (track) {
    const slides = [...track.querySelectorAll('.carousel-slide')];
    const dialog = document.querySelector('.photo-dialog');
    const expanded = dialog.querySelector('img');
    let index = 0;
    let drag = null;
    let dragged = false;
    function goTo(next) {
        index = Math.max(0, Math.min(slides.length - 1, next));
        track.scrollTo({ left: slides[index].offsetLeft - slides[0].offsetLeft, behavior: 'smooth' });
    }
    track.addEventListener('scroll', () => {
        index = Math.round(track.scrollLeft / track.clientWidth);
        document.querySelector('.carousel-status').textContent = `${index + 1} de ${slides.length}`;
        document.querySelector('.carousel-prev').disabled = index === 0;
        document.querySelector('.carousel-next').disabled = index === slides.length - 1;
    });
    document.querySelector('.carousel-prev').disabled = true;
    document.querySelector('.carousel-prev').addEventListener('click', () => goTo(index - 1));
    document.querySelector('.carousel-next').addEventListener('click', () => goTo(index + 1));
    track.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault(); goTo(index + (event.key === 'ArrowRight' ? 1 : -1));
        }
    });
    // O toque usa a rolagem nativa; o mouse usa arraste com captura do ponteiro.
    track.addEventListener('pointerdown', (event) => {
        dragged = false;
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        drag = { x: event.clientX, scroll: track.scrollLeft, index };
    });
    track.addEventListener('pointermove', (event) => {
        if (!drag) return;
        const delta = event.clientX - drag.x;
        if (Math.abs(delta) > 8) {
            dragged = true;
            track.setPointerCapture(event.pointerId);
            track.classList.add('is-dragging');
            track.scrollLeft = drag.scroll - delta;
        }
    });
    function finishDrag(event) {
        if (!drag) return;
        const delta = event.clientX - drag.x;
        const next = drag.index + (Math.abs(delta) > 40 ? (delta < 0 ? 1 : -1) : 0);
        drag = null;
        track.classList.remove('is-dragging');
        if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
        if (dragged) goTo(next);
    }
    track.addEventListener('pointerup', finishDrag);
    track.addEventListener('pointercancel', () => {
        drag = null; track.classList.remove('is-dragging'); goTo(index);
    });
    track.addEventListener('pointerleave', (event) => { if (!dragged) drag = null; });
    track.addEventListener('click', (event) => {
        if (dragged) { dragged = false; return; }
        const slide = event.target.closest('.carousel-slide');
        if (!slide) return;
        const image = slide.querySelector('img');
        expanded.src = image.src;
        expanded.alt = image.alt;
        dialog.showModal();
        document.body.classList.add('photo-open');
    });
    dialog.querySelector('.photo-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => document.body.classList.remove('photo-open'));
}
