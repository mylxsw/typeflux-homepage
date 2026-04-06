/* ============================================
   Typeflux Homepage — JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // --- Mobile menu toggle ---
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link, .mobile-cta');

  menuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // --- Header scroll effect ---
  const header = document.getElementById('site-header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // --- Scroll animations (Intersection Observer) ---
  const animatedEls = document.querySelectorAll('[data-animate]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    animatedEls.forEach(el => observer.observe(el));
  } else {
    animatedEls.forEach(el => el.classList.add('animated'));
  }

  // --- Typing demo animation ---
  const typedTextEl = document.getElementById('demo-typed-text');
  const voiceIndicator = document.getElementById('demo-voice-indicator');

  const demoTexts = [
    '今天下午三点有一个产品评审会议，请帮我准备一下会议议程。',
    'Typeflux 让语音输入变得如此简单，按下 Fn 键就能开始说话。',
    '这份报告的数据部分需要更新，请把第三季度的销售数据加进去。',
    '给团队发一封邮件，告诉他们项目进展顺利，预计下周完成。'
  ];

  let textIndex = 0;
  let charIndex = 0;
  let isTyping = false;
  let currentTimeout = null;

  function startTyping() {
    if (isTyping) return;
    isTyping = true;
    charIndex = 0;
    typedTextEl.textContent = '';
    voiceIndicator.classList.add('active');
    typeNextChar();
  }

  function typeNextChar() {
    const currentText = demoTexts[textIndex];
    if (charIndex < currentText.length) {
      typedTextEl.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
      const speed = 40 + Math.random() * 40;
      currentTimeout = setTimeout(typeNextChar, speed);
    } else {
      voiceIndicator.classList.remove('active');
      isTyping = false;
      currentTimeout = setTimeout(() => {
        textIndex = (textIndex + 1) % demoTexts.length;
        typedTextEl.textContent = '';
        currentTimeout = setTimeout(startTyping, 800);
      }, 2500);
    }
  }

  // Start typing demo after a short delay
  setTimeout(startTyping, 1200);

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });
});
