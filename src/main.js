import gsap from 'gsap'

// ── Cursor-following profile photo ───────────────
const trigger = document.getElementById('name-trigger')
const profileImg = document.getElementById('profile-hover')

trigger.addEventListener('mouseenter', () => {
  gsap.to(profileImg, { opacity: 1, duration: 0.2 })
})

trigger.addEventListener('mouseleave', () => {
  gsap.to(profileImg, { opacity: 0, duration: 0.2 })
})

trigger.addEventListener('mousemove', (e) => {
  gsap.set(profileImg, { left: e.clientX, top: e.clientY })
})

// ── Theme toggle ──────────────────────────────────
const themeToggles = document.querySelectorAll('.theme-toggle-trigger')
const html = document.documentElement

function applyTheme(theme) {
  if (theme === 'light') {
    html.classList.add('light')
  } else {
    html.classList.remove('light')
  }
}

const saved = localStorage.getItem('theme')
applyTheme(saved || 'light')

themeToggles.forEach((toggle) => {
  toggle.addEventListener('click', (e) => {
    e.preventDefault()
    const isLight = html.classList.contains('light')
    const next = isLight ? 'dark' : 'light'
    applyTheme(next)
    localStorage.setItem('theme', next)
  })
})

// ── Entrance animations ───────────────────────────
const items = gsap.utils.toArray('.experience-item')

// Pre-hide everything before animating
gsap.set(['.site-logo', '.intro-name', '.intro-subtitle', ...items, 'footer'], {
  opacity: 0,
  y: 20,
})

const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

tl.to('.site-logo', { opacity: 1, y: 0, duration: 0.5 })
  .to('.intro-name', { opacity: 1, y: 0, duration: 0.7 }, '-=0.2')
  .to('.intro-subtitle', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
  .to(items, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, clearProps: 'transform' }, '-=0.3')
  .to('footer', { opacity: 1, y: 0, duration: 0.5, clearProps: 'transform' }, '-=0.2')

// ── Section nav: scroll-spy active state ──────────
const navLinks = document.querySelectorAll('.tab-btn')
const sections = ['experience', 'stack', 'works']
  .map((id) => document.getElementById(id))
  .filter(Boolean)

// The Experience nav covers both the experience list and the stack section
const navForSection = { experience: 'experience', stack: 'experience', works: 'works' }

function updateActiveNav() {
  const threshold = 120 // px below the sticky nav
  let currentId = sections[0].id
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= threshold) currentId = section.id
  }
  // Snap to the last section once scrolled to the very bottom
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
    currentId = sections[sections.length - 1].id
  }
  const activeTarget = navForSection[currentId]
  navLinks.forEach((link) =>
    link.classList.toggle('is-active', link.dataset.target === activeTarget)
  )
}

window.addEventListener('scroll', updateActiveNav, { passive: true })
updateActiveNav()

// ── Lazy-load work images as they approach the viewport ──
const lazyImages = document.querySelectorAll('img[data-src]')
const imageObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      const img = entry.target
      img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true })
      img.src = img.dataset.src
      img.removeAttribute('data-src')
      observer.unobserve(img)
    })
  },
  { rootMargin: '200px 0px' }
)
lazyImages.forEach((img) => imageObserver.observe(img))

// ── Sticky tabs: reveal mini logo once pinned ─────
const listHeader = document.querySelector('.list-header')

function updateStuck() {
  const stuck = listHeader.getBoundingClientRect().top <= 0
  listHeader.classList.toggle('is-stuck', stuck)
}

window.addEventListener('scroll', updateStuck, { passive: true })
updateStuck()

// ── Footer auto-hide on scroll ────────────────────
const footer = document.querySelector('footer')
let scrollTimer = null

window.addEventListener('scroll', () => {
  footer.classList.add('is-hidden')
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    footer.classList.remove('is-hidden')
  }, 400)
}, { passive: true })

// Animate profile pic separately — only if visible (mobile)
const profileMobile = document.querySelector('.profile-mobile')
if (profileMobile && getComputedStyle(profileMobile).display !== 'none') {
  gsap.fromTo(profileMobile,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
  )
}
