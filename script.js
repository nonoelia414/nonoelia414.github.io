/* ===================================================================
   NAVBAR — ombre au scroll + burger menu mobile
=================================================================== */
const navbar = document.querySelector('.navbar');
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ===================================================================
   SCROLL REVEAL — apparition des sections/cartes (Intersection Observer)
=================================================================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal, .skill-group').forEach(el => revealObserver.observe(el));

/* ===================================================================
   NAV ACTIVE LINK — surlignage + pill glissante selon la section visible
=================================================================== */
const sections = document.querySelectorAll('.section[id]');
const navAnchors = document.querySelectorAll('.nav-link');
const navPill = document.getElementById('navPill');

function moveNavPill() {
  const active = document.querySelector('.nav-link.active');
  if (!active) { navPill.style.opacity = '0'; return; }
  const linkRect = active.getBoundingClientRect();
  const listRect = active.closest('.nav-links').getBoundingClientRect();
  navPill.style.opacity = '1';
  navPill.style.left = `${linkRect.left - listRect.left - 14}px`;
  navPill.style.width = `${linkRect.width + 28}px`;
}

const scrollDotEls = document.querySelectorAll('.scroll-dots .dot');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = `#${entry.target.id}`;
      navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
      scrollDotEls.forEach(d => d.classList.toggle('active', d.getAttribute('href') === id));
      moveNavPill();
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

sections.forEach(section => navObserver.observe(section));
window.addEventListener('resize', moveNavPill);
window.addEventListener('load', moveNavPill);

/* ===================================================================
   SCROLL — ombre navbar + parallax léger des blobs + barre de progression
   (throttled via rAF)
=================================================================== */
const blobs = document.querySelectorAll('.blob-wrap');
const scrollProgress = document.getElementById('scrollProgress');
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 20);

  blobs.forEach((blob, i) => {
    const speed = 0.06 + (i % 3) * 0.03;
    blob.style.transform = `translateY(${y * speed * 0.15}px)`;
  });

  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = `${docHeight > 0 ? (y / docHeight) * 100 : 0}%`;

  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });

/* ===================================================================
   TILT 3D — cartes projets suivent le curseur (transform direct, pas de
   transition pendant le mouvement pour un suivi instantané ; une
   transition n'est ajoutée qu'au relâchement pour un retour en douceur)
=================================================================== */
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transition = 'transform 0s';
    card.style.transform = `perspective(1000px) rotateX(${-py * 8}deg) rotateY(${px * 8}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform .5s ease';
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
  });
});

/* ===================================================================
   PARALLAX PHOTO HERO — le halo suit légèrement le curseur (profondeur)
=================================================================== */
const heroPhoto = document.querySelector('.hero-photo');
const photoHaloWrap = document.querySelector('.photo-halo-wrap');
if (heroPhoto && photoHaloWrap) {
  heroPhoto.addEventListener('mousemove', (e) => {
    const rect = heroPhoto.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    photoHaloWrap.style.transform = `translate(${px * 16}px, ${py * 16}px)`;
  });
  heroPhoto.addEventListener('mouseleave', () => {
    photoHaloWrap.style.transform = 'translate(0, 0)';
  });
}

/* ===================================================================
   CURSEUR PERSONNALISÉ — point qui suit la souris directement, anneau qui
   traîne derrière (lerp via rAF), grossit sur les éléments cliquables.
   Désactivé sur tactile/pointeur imprécis pour ne pas casser le scroll.
=================================================================== */
if (window.matchMedia('(pointer: fine)').matches) {
  document.documentElement.classList.add('cursor-active');

  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .pill, [data-tilt]')) cursorRing.classList.add('hovered');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, .pill, [data-tilt]')) cursorRing.classList.remove('hovered');
  });

  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = '0';
    cursorRing.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursorDot.style.opacity = '1';
    cursorRing.style.opacity = '1';
  });
}
