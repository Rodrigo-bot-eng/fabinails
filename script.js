// script.js - Fabinails site - Versão avançada com envio WhatsApp automático
// Autor: ChatGPT
// Funcionalidades: menu responsivo, slider, modal agendamento, glitter, validação, scroll suave, envio WhatsApp

document.addEventListener('DOMContentLoaded', () => {

  // ================= MENU RESPONSIVO =================
  const menuBtn = document.getElementById('menu-btn');
  const navLinks = document.getElementById('primary-navigation');

  menuBtn.addEventListener('click', () => {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', !expanded);
    navLinks.classList.toggle('nav-active');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('nav-active')) {
        navLinks.classList.remove('nav-active');
        menuBtn.setAttribute('aria-expanded', false);
      }
    });
  });

  // ================= SLIDER ==========================
  const slides = document.querySelectorAll('.banner-slider .slide');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const indicators = document.querySelectorAll('.indicator-dot');

  let currentSlide = 0;
  let slideInterval;

  function showSlide(n) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === n);
      indicators[i].classList.toggle('active', i === n);
      indicators[i].setAttribute('aria-selected', i === n);
      indicators[i].setAttribute('tabindex', i === n ? '0' : '-1');
    });
    currentSlide = n;
  }

  function nextSlide() {
    showSlide((currentSlide + 1) % slides.length);
  }

  function prevSlideFunc() {
    showSlide((currentSlide - 1 + slides.length) % slides.length);
  }

  nextBtn.addEventListener('click', () => {
    nextSlide();
    resetInterval();
  });

  prevBtn.addEventListener('click', () => {
    prevSlideFunc();
    resetInterval();
  });

  indicators.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      resetInterval();
    });

    dot.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showSlide(i);
        resetInterval();
      }
    });
  });

  function startInterval() {
    slideInterval = setInterval(nextSlide, 6000);
  }

  function resetInterval() {
    clearInterval(slideInterval);
    startInterval();
  }

  showSlide(0);
  startInterval();

  // ================= MODAL AGENDAMENTO =================
  const modal = document.getElementById('agendamento-modal');
  const openModalBtns = document.querySelectorAll('#cta-button, #cta-button-2');
  const closeModalBtn = document.getElementById('btn-close-modal');
  const form = document.getElementById('agendamento-form');
  const formMessage = document.getElementById('form-message');

  // Número WhatsApp para contato (coloque seu número completo com DDD, sem espaços, só números)
  const whatsappNumber = '5562994639038';

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.showModal();
      btn.setAttribute('aria-expanded', 'true');
      clearFormMessage();
    });
  });

  closeModalBtn.addEventListener('click', () => {
    modal.close();
    openModalBtns.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    clearFormMessage();
  });

  modal.addEventListener('cancel', () => {
    openModalBtns.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    clearFormMessage();
  });

  function showFormMessage(msg, type = 'info') {
    formMessage.textContent = msg;
    formMessage.style.color = type === 'error' ? '#c33' : type === 'success' ? '#3a7' : '#000';
    formMessage.setAttribute('role', 'alert');
  }

  function clearFormMessage() {
    formMessage.textContent = '';
    formMessage.removeAttribute('role');
  }

  // Formatação da mensagem para WhatsApp, escapando caracteres especiais
  function formatWhatsAppMessage(data) {
    return encodeURIComponent(
      `Olá! Gostaria de agendar um horário para unhas de gel.\n\n` +
      `Nome: ${data.nome}\n` +
      `Telefone: ${data.telefone}\n` +
      `Data do Agendamento: ${data.data}\n` +
      `Serviço Escolhido: ${data.servico}\n\n` +
      `Por favor, me confirme a disponibilidade e os próximos passos. Obrigada!`
    );
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    const nome = form.nome.value.trim();
    const telefone = form.telefone.value.trim();
    const dataAgendamento = form.data.value;
    const servico = form.servico.value;

    clearFormMessage();

    // Validações detalhadas
    if (!nome) {
      showFormMessage('Por favor, informe seu nome completo.', 'error');
      form.nome.focus();
      return;
    }

    if (!telefone) {
      showFormMessage('Por favor, informe seu telefone.', 'error');
      form.telefone.focus();
      return;
    }

    // Regex para telefone brasileiro (com DDD)
    const telRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/;
    if (!telRegex.test(telefone)) {
      showFormMessage('Telefone inválido. Use o formato: (99) 99999-9999', 'error');
      form.telefone.focus();
      return;
    }

    if (!dataAgendamento) {
      showFormMessage('Por favor, escolha uma data para o agendamento.', 'error');
      form.data.focus();
      return;
    }

    const hoje = new Date();
    const dataSelecionada = new Date(dataAgendamento + 'T00:00:00');

    if (dataSelecionada < hoje) {
      showFormMessage('Selecione uma data futura para o agendamento.', 'error');
      form.data.focus();
      return;
    }

    if (!servico) {
      showFormMessage('Por favor, selecione um serviço.', 'error');
      form.servico.focus();
      return;
    }

    // Salvar agendamento localmente para controle
    const agendamento = {
      nome,
      telefone,
      data: dataAgendamento,
      servico,
      criadoEm: new Date().toISOString()
    };

    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    agendamentos.push(agendamento);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

    showFormMessage('Agendamento realizado com sucesso! Redirecionando para WhatsApp...', 'success');

    form.reset();

    // Montar URL WhatsApp e abrir em nova aba/janela
    const msg = formatWhatsAppMessage(agendamento);
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${msg}`;

    setTimeout(() => {
      modal.close();
      openModalBtns.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
      clearFormMessage();

      // Abrir WhatsApp
      window.open(whatsappURL, '_blank');
    }, 2500);
  });

  // ================= GLITTER ANIMADO ===================
  const canvas = document.getElementById('glitter-canvas');
  const ctx = canvas.getContext('2d');

  let glitterParticles = [];
  const glitterCount = 120;

  function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.45;
  }

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  class Glitter {
    constructor() {
      this.x = randomRange(0, canvas.width);
      this.y = randomRange(0, canvas.height);
      this.size = randomRange(1.5, 3.5);
      this.speedY = randomRange(0.3, 1);
      this.alpha = randomRange(0.3, 1);
      this.alphaDir = Math.random() > 0.5 ? 1 : -1;
    }

    update() {
      this.y -= this.speedY;
      this.alpha += 0.015 * this.alphaDir;
      if (this.alpha <= 0.3 || this.alpha >= 1) this.alphaDir *= -1;
      if (this.y < 0) this.y = canvas.height;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
      ctx.shadowColor = 'rgba(255, 215, 0, 1)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function initGlitter() {
    glitterParticles = [];
    for (let i = 0; i < glitterCount; i++) {
      glitterParticles.push(new Glitter());
    }
  }

  function animateGlitter() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    glitterParticles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateGlitter);
  }

  window.addEventListener('resize', () => {
    setupCanvas();
    initGlitter();
  });

  setupCanvas();
  initGlitter();
  animateGlitter();

  // ================= SCROLL SUAVE ======================
  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ================= MICROINTERAÇÕES NOS BOTÕES ===========
  const buttons = document.querySelectorAll('button');

  buttons.forEach(button => {
    button.addEventListener('focus', () => {
      button.classList.add('btn-focus');
    });
    button.addEventListener('blur', () => {
      button.classList.remove('btn-focus');
    });
    button.addEventListener('mousedown', () => {
      button.classList.add('btn-active');
    });
    button.addEventListener('mouseup', () => {
      button.classList.remove('btn-active');
    });
  });

  // ================= TECLADO E FECHAR MODAL COM ESC ========
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.open) {
      modal.close();
      openModalBtns.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
      clearFormMessage();
    }
  });

  // ================= FUNÇÃO EXTRA - EXIBIR AGENDAMENTOS SALVOS (CONSOLE) ========
  // Útil para desenvolvimento e futuras funcionalidades backend
  function listarAgendamentos() {
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    console.log('Agendamentos atuais:', agendamentos);
  }

  listarAgendamentos();

  // ================= FUNÇÃO EXTRA - DEBOUNCE PARA OTIMIZAÇÃO DE EVENTOS ========
  function debounce(func, wait = 200) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Pode ser usado futuramente em filtros ou buscas

  // ================= TUDO PRONTO ========================
});




