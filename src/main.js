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
const ctaTile = document.getElementById('works-cta')

if (ctaTile) {
  const cursors = gsap.utils.toArray('.wc-cursor', ctaTile)
  const nameTag = ctaTile.querySelector('.wc-name')
  const bubble = ctaTile.querySelector('.wc-bubble')
  const typedEl = ctaTile.querySelector('.wc-typed')
  const message = 'Love this!'
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
      // Reduced motion still gets the message, just not letter by letter.
      duration: reduceMotion ? 0 : 0.8,
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

  // The cursors travel in as the tile rises into view and back out as it
  // leaves. Held paused and driven by hand below.
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })

  cursors.forEach((cursor, i) => {
    const at = i * 0.35
    // Fade in over the first stretch so the travel that follows is visible
    // rather than reading as one long cross-fade.
    tl.fromTo(cursor, { opacity: 0 }, { opacity: 1, duration: 0.3 }, at)

    // Reduced motion keeps the scroll-linked reveal but drops the travel,
    // so the tile still responds to scrolling instead of arriving finished.
    if (!reduceMotion) {
      tl.fromTo(
        cursor,
        { x: Number(cursor.dataset.fromX), y: Number(cursor.dataset.fromY) },
        { x: 0, y: 0, duration: 1 },
        at
      )
    }
  })

  // Progress comes from where #works-cta actually is, read fresh every frame.
  // Nothing about the page's scroll geometry is cached, so late-loading
  // images or a collapsing URL bar cannot leave the animation measuring
  // against a layout that no longer exists.
  function ctaProgress() {
    const r = ctaTile.getBoundingClientRect()
    const vh = window.innerHeight
    const from = vh // 0% — tile top level with the bottom of the screen
    const to = vh * 0.9 - r.height // 100% — tile bottom just clear of the footer
    const span = from - to
    if (span <= 0) return r.top < vh ? 1 : 0 // viewport too short to fit the tile
    return gsap.utils.clamp(0, 1, (from - r.top) / span)
  }

  let shown = 0
  let running = false
  let inView = false

  function frame() {
    const target = ctaProgress()
    // Ease toward the target rather than snapping, for the same trailing
    // feel a scrub gives.
    shown += (target - shown) * 0.18
    if (Math.abs(target - shown) < 0.001) shown = target
    tl.progress(shown)
    setChatting(target > 0.995)

    if (inView || shown !== target) requestAnimationFrame(frame)
    else running = false
  }

  // The observer only gates the loop — it never decides how far along the
  // animation is, so its threshold cannot desynchronise from the visuals.
  const ctaObserver = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting
      if (inView && !running) {
        running = true
        requestAnimationFrame(frame)
      }
    },
    { rootMargin: '150px 0px' }
  )
  ctaObserver.observe(ctaTile)
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
