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
const btn = document.getElementById('theme-toggle')
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

btn.addEventListener('click', () => {
  const isLight = html.classList.contains('light')
  const next = isLight ? 'dark' : 'light'
  applyTheme(next)
  localStorage.setItem('theme', next)
})

// ── Entrance animations ───────────────────────────
const items = gsap.utils.toArray('.experience-item')

// Pre-hide everything before animating
gsap.set(['.site-logo', '#theme-toggle', '.intro-name', '.intro-subtitle', ...items, 'footer'], {
  opacity: 0,
  y: 20,
})

const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

tl.to('.site-logo', { opacity: 1, y: 0, duration: 0.5 })
  .to('#theme-toggle', { opacity: 1, y: 0, duration: 0.5 }, '<')
  .to('.intro-name', { opacity: 1, y: 0, duration: 0.7 }, '-=0.2')
  .to('.intro-subtitle', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
  .to(items, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, clearProps: 'transform' }, '-=0.3')
  .to('footer', { opacity: 1, y: 0, duration: 0.5, clearProps: 'transform' }, '-=0.2')

// ── List tabs (Experience ↔ Works) ────────────────
const tabButtons = document.querySelectorAll('.tab-btn')
const experienceList = document.getElementById('experience-list')
const worksList = document.getElementById('works-list')

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabButtons.forEach((b) => b.classList.remove('is-active'))
    btn.classList.add('is-active')

    const tab = btn.dataset.tab
    experienceList.hidden = tab !== 'experience'
    worksList.hidden = tab !== 'works'
  })
})

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
