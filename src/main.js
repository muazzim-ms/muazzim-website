import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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

// ── Copy email to clipboard ───────────────────────
const emailCopy = document.querySelector('.email-copy')
if (emailCopy) {
  const feedback = document.querySelector('.copy-feedback')
  let feedbackTimer = null

  emailCopy.addEventListener('click', async () => {
    const email = document.querySelector('.email-address').textContent.trim()
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = email
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    if (feedback) {
      feedback.textContent = 'Copied'
      feedback.classList.add('show')
      clearTimeout(feedbackTimer)
      feedbackTimer = setTimeout(() => feedback.classList.remove('show'), 1600)
    }
  })
}

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

// ── FigJam-style cursors on the Works CTA tile ────
const ctaTile = document.querySelector('.work-item-cta')

if (ctaTile) {
  const cursors = gsap.utils.toArray('.wc-cursor', ctaTile)
  const nameTag = ctaTile.querySelector('.wc-name')
  const bubble = ctaTile.querySelector('.wc-bubble')
  const typedEl = ctaTile.querySelector('.wc-typed')
  const message = 'Love this!'
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduceMotion) {
    // No travel, no typing — just the end state.
    gsap.set(cursors, { opacity: 1, x: 0, y: 0 })
    gsap.set(nameTag, { opacity: 0 })
    gsap.set(bubble, { opacity: 1 })
    typedEl.textContent = message
  } else {
    gsap.set(bubble, { opacity: 0 })

    // Muazzim starts typing: the name chip gives way to a chat bubble. Plays
    // once the cursors have all landed, so it is not scrubbed with them.
    const typing = { n: 0 }
    const chatTl = gsap.timeline({ paused: true })
    chatTl
      .to(nameTag, { opacity: 0, duration: 0.2, ease: 'power2.in' })
      .to(bubble, { opacity: 1, duration: 0.25, ease: 'back.out(2)' }, '<')
      .to(typing, {
        n: message.length,
        duration: 0.8,
        ease: 'none',
        onUpdate: () => {
          typedEl.textContent = message.slice(0, Math.round(typing.n))
        },
      }, '<0.1')

    let chatting = false
    function setChatting(on) {
      if (on === chatting) return
      chatting = on
      if (on) chatTl.play()
      else chatTl.reverse()
    }

    // Scrubbed to scroll position: the cursors travel in as the tile rises
    // into view and travel back out as it leaves, rather than firing once.
    // The entry spans the whole range, so it lands exactly as the tile
    // reaches full view — then the chat bubble follows.
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: ctaTile,
        start: 'top bottom',
        end: 'bottom 90%',
        scrub: 0.5,
        // onUpdate covers stopping right at full view; onLeave covers
        // scrolling straight past it, where onUpdate no longer fires.
        onUpdate: (self) => setChatting(self.progress > 0.995),
        onLeave: () => setChatting(true),
        onEnterBack: () => setChatting(false),
      },
    })

    cursors.forEach((cursor, i) => {
      tl.fromTo(
        cursor,
        { opacity: 0, x: Number(cursor.dataset.fromX), y: Number(cursor.dataset.fromY) },
        { opacity: 1, x: 0, y: 0, duration: 1 },
        i * 0.35
      )
    })
  }
}

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
