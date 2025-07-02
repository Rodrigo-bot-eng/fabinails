// contato.js - Envio automático via WhatsApp
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('feedback');
  const seuNumero = '5562994639038'; // Coloque aqui seu número com DDD e sem espaços

  form.addEventListener('submit', e => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const mensagem = document.getElementById('mensagem').value.trim();

    if (!nome || !telefone || !mensagem) {
      feedback.textContent = 'Preencha todos os campos!';
      feedback.style.color = '#c0392b';
      return;
    }

    // Monta a mensagem do WhatsApp
    const texto = `Olá! Meu nome é ${nome}.
Meu telefone é ${telefone}.
Mensagem: ${mensagem}`;

    const url = `https://wa.me/${seuNumero}?text=${encodeURIComponent(texto)}`;

    feedback.textContent = 'Redirecionando para o WhatsApp...';
    feedback.style.color = '#27ae60';

    setTimeout(() => {
      window.open(url, '_blank');
      form.reset();
      feedback.textContent = '';
    }, 1000);
  });
});
