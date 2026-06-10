/**
 * APLICATIVO CLIENT-SIDE - HIPER MATE
 * Gerencia a navegação SPA, animações de scroll, depoimentos, formulários e carrinho de compras.
 */

// ─── ESTADO GLOBAL DO CARRINHO ─────────────────────────────────────────────
let cart = []; // Array de objetos: { id, name, price, img, qty }
let currentUser = null; // Usuário logado: { name, email, phone, cep, address, orders: [] }

document.addEventListener('DOMContentLoaded', () => {
  // Inicialização Segura de Componentes para Evitar que Erros de Módulos Quebrem a SPA
  const safeInit = (name, fn) => {
    try {
      fn();
    } catch (error) {
      console.error(`Erro ao inicializar ${name}:`, error);
    }
  };

  safeInit('SpaRouter', initSpaRouter);
  safeInit('MobileMenu', initMobileMenu);
  safeInit('HeaderScroll', initHeaderScroll);
  safeInit('TestimonialsCarousel', initTestimonialsCarousel);
  safeInit('ScrollAnimations', initScrollAnimations);
  safeInit('ContactForm', initContactForm);
  safeInit('Cart', initCart);
  safeInit('ProductFilters', initProductFilters);
  safeInit('UserSystem', initUserSystem);
});

/**
 * 1. ROTEADOR SPA (SINGLE PAGE APPLICATION)
 * Alterna a visualização entre as seções baseando-se no hash do link
 */
function initSpaRouter() {
  const sections = document.querySelectorAll('.page-section');

  function navigateTo(targetId) {
    const cleanId = targetId.replace('#', '');
    const activeSection = document.getElementById(cleanId);

    if (!activeSection) return;

    // Remove classe active de todas as seções e links
    sections.forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));

    // Adiciona active na seção correspondente
    activeSection.classList.add('active');

    // Se for um link do menu, destaca ele
    const matchingLink = document.querySelector(`.nav-links a[href="#${cleanId}"]`);
    if (matchingLink) {
      matchingLink.classList.add('active');
    }

    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fecha menu mobile se estiver aberto
    const mobileMenu = document.querySelector('.nav-links');
    if (mobileMenu && mobileMenu.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      const menuBtn = document.querySelector('.mobile-menu-btn');
      if (menuBtn) menuBtn.innerHTML = iconMenu();
    }

    // Atualiza o hash da URL
    history.pushState(null, null, `#${cleanId}`);
  }

  // Usa delegação de eventos no document inteiro para capturar cliques em .spa-btn
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a.spa-btn, a.nav-cta, a.logo, .nav-links a, button.spa-btn');
    if (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        navigateTo(href);
      }
    }
  });

  // Monitora navegação pelo botão "Voltar/Avançar" do navegador
  window.addEventListener('popstate', () => {
    const hash = window.location.hash || '#home';
    navigateTo(hash);
  });

  // Carrega rota inicial
  const initialHash = window.location.hash || '#home';
  navigateTo(initialHash);
}

/**
 * 2. MENU MOBILE
 * Abre/Fecha o menu em telas pequenas
 */
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuBtn.innerHTML = isOpen ? iconClose() : iconMenu();
  });
}

/**
 * 3. ANIMAÇÃO DO HEADER AO ROLAR A PÁGINA
 * Adiciona uma sombra e reduz o padding do header ao rolar mais de 50px
 */
function initHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });
}

/**
 * 4. CARROSSEL DE DEPOIMENTOS
 * Gerencia o movimento automático e manual do carrossel
 */
function initTestimonialsCarousel() {
  const track = document.querySelector('.carousel-track');
  const dotsContainer = document.querySelector('.carousel-dots');
  
  if (!track || !dotsContainer) return;

  const cards = Array.from(track.children);
  let currentIndex = 0;
  let autoplayInterval;

  cards.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.classList.add('carousel-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => { moveToSlide(index); resetAutoplay(); });
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);

  function moveToSlide(index) {
    if (index < 0) index = cards.length - 1;
    if (index >= cards.length) index = 0;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots[currentIndex].classList.remove('active');
    dots[index].classList.add('active');
    currentIndex = index;
  }

  function startAutoplay() {
    autoplayInterval = setInterval(() => moveToSlide(currentIndex + 1), 5000);
  }

  function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
  }

  startAutoplay();
}

/**
 * 5. ANIMAÇÕES AO ROLAR A PÁGINA (SCROLL REVEAL)
 * Usa Intersection Observer para revelar elementos suavemente
 */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => observer.observe(el));
}

/**
 * 6. FORMULÁRIO DE CONTATO
 * Trata validação de formulário e simula o envio correto
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name    = document.getElementById('form-name').value.trim();
    const email   = document.getElementById('form-email').value.trim();
    const message = document.getElementById('form-message').value.trim();

    if (!name || !email || !message) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    const submitBtn = form.querySelector('.form-submit-btn');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Enviando...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '✅ Mensagem Enviada!';
      submitBtn.style.backgroundColor = '#25D366';
      form.reset();
      alert(`Olá ${name}! Obrigado pelo contato. Retornaremos em breve no e-mail: ${email}`);
      setTimeout(() => {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.style.backgroundColor = '';
      }, 3000);
    }, 1500);
  });
}

// =============================================================================
// 7. SISTEMA DE CARRINHO DE COMPRAS
// =============================================================================

function initCart() {
  // Delegação de eventos para botões "Adicionar ao Carrinho"
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-add-to-cart');
    if (btn) {
      const product = {
        id:    btn.dataset.id,
        name:  btn.dataset.name,
        price: parseFloat(btn.dataset.price),
        img:   btn.dataset.img,
      };
      addToCart(product, btn);
    }
  });

  // Delegação de eventos para ações dentro do carrinho (aumentar, diminuir, remover)
  document.addEventListener('click', (e) => {
    if (e.target.closest('.qty-btn-plus')) {
      const id = e.target.closest('.qty-btn-plus').dataset.id;
      changeQty(id, 1);
    }
    if (e.target.closest('.qty-btn-minus')) {
      const id = e.target.closest('.qty-btn-minus').dataset.id;
      changeQty(id, -1);
    }
    if (e.target.closest('.cart-item-remove')) {
      const id = e.target.closest('.cart-item-remove').dataset.id;
      removeFromCart(id);
    }
  });

  // Formulário de checkout
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      finalizeCheckout();
    });
  }

  renderCart();
}

/** Adiciona produto ao carrinho ou incrementa a quantidade */
function addToCart(product, btn) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  // Feedback visual no botão
  const original = btn.innerHTML;
  btn.innerHTML = '✅ Adicionado!';
  btn.disabled = true;
  btn.style.backgroundColor = '#25D366';
  setTimeout(() => {
    btn.innerHTML = original;
    btn.disabled = false;
    btn.style.backgroundColor = '';
  }, 1500);

  renderCart();
  updateCartBadge();
}

/** Altera a quantidade de um item (+1 ou -1) */
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  renderCart();
  updateCartBadge();
}

/** Remove um item do carrinho */
function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
  updateCartBadge();
}

/** Atualiza o badge (contador) do ícone do carrinho no menu */
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const total = cart.reduce((acc, i) => acc + i.qty, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? 'flex' : 'none';
}

/** Renderiza a lista de itens e os totais na seção #carrinho */
function renderCart() {
  const emptyEl    = document.getElementById('cart-empty');
  const contentEl  = document.getElementById('cart-content');
  const checkoutEl = document.getElementById('cart-checkout-section');
  const listEl     = document.getElementById('cart-list-items');

  if (!emptyEl || !contentEl || !checkoutEl || !listEl) return;

  if (cart.length === 0) {
    emptyEl.style.display    = 'block';
    contentEl.style.display  = 'none';
    checkoutEl.style.display = 'none';
    return;
  }

  emptyEl.style.display    = 'none';
  contentEl.style.display  = 'block';
  checkoutEl.style.display = 'flex';
  prefillCheckoutForm();

  // Monta o HTML dos itens
  listEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.img}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">R$ ${formatPrice(item.price)}</div>
        <div class="cart-item-quantity">
          <button class="qty-btn qty-btn-minus" data-id="${item.id}" aria-label="Diminuir">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn qty-btn-plus" data-id="${item.id}" aria-label="Aumentar">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" aria-label="Remover item">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </div>
  `).join('');

  // Calcula e exibe os totais
  const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  document.getElementById('cart-subtotal').textContent = `R$ ${formatPrice(subtotal)}`;
  document.getElementById('cart-total').textContent    = `R$ ${formatPrice(subtotal)}`;
}

/** Finaliza o pedido e abre o WhatsApp com o resumo formatado */
function finalizeCheckout() {
  if (cart.length === 0) {
    alert('Seu carrinho está vazio. Adicione pelo menos um kit antes de finalizar.');
    return;
  }

  const name    = document.getElementById('checkout-name').value.trim();
  const phone   = document.getElementById('checkout-phone').value.trim();
  const cep     = document.getElementById('checkout-cep').value.trim();
  const address = document.getElementById('checkout-address').value.trim();
  const payment = document.getElementById('checkout-payment').value;

  if (!name || !phone || !cep || !address || !payment) {
    alert('Por favor, preencha todos os campos de entrega e pagamento.');
    return;
  }

  // Monta o resumo dos itens
  const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);

  // Salva no histórico de compras se o usuário estiver logado
  if (currentUser) {
    const orderId = `HM-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const newOrder = {
      id: orderId,
      date: formattedDate,
      items: cart.map(item => ({ name: item.name, qty: item.qty, price: item.price })),
      total: subtotal,
      payment: payment,
      status: 'Enviado'
    };
    
    saveOrderToUserHistory(newOrder);
  }

  const itemsText = cart.map(i =>
    `▪ ${i.name} x${i.qty} — R$ ${formatPrice(i.price * i.qty)}`
  ).join('\n');

  const msg = `
🧉 *Novo Pedido - HIPER MATE* 🧉

👤 *Cliente:* ${name}
📞 *WhatsApp:* ${phone}
📍 *Endereço:* ${address} | CEP: ${cep}
💳 *Pagamento:* ${payment}

─────────────────
🛒 *Itens do Pedido:*
${itemsText}

─────────────────
💰 *Total: R$ ${formatPrice(subtotal)}*
🚚 *Frete:* Grátis (RS)

Olá! Gostaria de finalizar esse pedido. 😊
  `.trim();

  const whatsappUrl = `https://wa.me/5541999039473?text=${encodeURIComponent(msg)}`;

  // Feedback visual
  const btn = document.getElementById('btn-finalize-checkout');
  btn.disabled = true;
  btn.innerHTML = '⏳ Abrindo WhatsApp...';

  setTimeout(() => {
    window.open(whatsappUrl, '_blank');
    btn.disabled = false;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg> Finalizar Pedido via WhatsApp`;
    // Limpa o carrinho após abrir o WhatsApp
    cart = [];
    renderCart();
    updateCartBadge();
    document.getElementById('checkout-form').reset();
    alert('✅ Pedido enviado! Continue a conversa no WhatsApp para confirmar a entrega. Obrigado!');
  }, 800);
}

// =============================================================================
// 8. FILTRO DE PRODUTOS POR CATEGORIA
// =============================================================================
function initProductFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  const products = document.querySelectorAll('.product-card');

  if (!tabs.length || !products.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;

      products.forEach(product => {
        const category = product.dataset.category;
        if (filter === 'all' || category === filter) {
          product.classList.remove('hidden');
        } else {
          product.classList.add('hidden');
        }
      });
    });
  });
}

// =============================================================================
// 9. SISTEMA DE CONTAS E HISTÓRICO DE COMPRAS (USER SYSTEM)
// =============================================================================

function initUserSystem() {
  // Configuração dos botões das abas da tela de autenticação
  const tabLogin = document.getElementById('auth-tab-login');
  const tabRegister = document.getElementById('auth-tab-register');
  const formLogin = document.getElementById('login-form');
  const formRegister = document.getElementById('register-form');

  if (tabLogin && tabRegister && formLogin && formRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.classList.add('active');
      formRegister.classList.remove('active');
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.classList.add('active');
      formLogin.classList.remove('active');
    });
  }

  // Submit dos formulários
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loginUser();
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      registerUser();
    });
  }

  const profileEditForm = document.getElementById('profile-edit-form');
  if (profileEditForm) {
    profileEditForm.addEventListener('submit', (e) => {
      e.preventDefault();
      updateUserProfile();
    });
  }

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
  }

  // Delegação de evento para o botão de reordenar
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-reorder');
    if (btn) {
      const orderId = btn.dataset.orderId;
      reorderItems(orderId);
    }
  });

  // Carrega a sessão ativa
  loadUserSession();
}

/** Carrega sessão do usuário e atualiza UI */
function loadUserSession() {
  let session = null;
  try {
    const rawSession = localStorage.getItem('hipermate_current_user');
    session = rawSession ? JSON.parse(rawSession) : null;
  } catch (e) {
    console.error("Erro ao ler sessão do localStorage:", e);
  }

  const authForms = document.getElementById('auth-forms-container');
  const profilePanel = document.getElementById('profile-panel-container');
  const sectionTitle = document.getElementById('auth-section-title');
  const sectionDesc = document.getElementById('auth-section-desc');

  if (!authForms || !profilePanel) return;

  if (session) {
    currentUser = session;
    renderProfileDashboard();
    updateNavbarUser();
    prefillCheckoutForm(); // Garante sincronização imediata no formulário de entrega do carrinho
    
    // Mostra o painel do usuário e esconde formulários
    authForms.style.display = 'none';
    profilePanel.style.display = 'block';

    // Atualiza cabeçalhos da seção
    if (sectionTitle) sectionTitle.textContent = 'Seu Painel Exclusivo';
    if (sectionDesc) sectionDesc.textContent = 'Bem-vindo de volta! Aqui você gerencia seus dados e acompanha suas compras.';
  } else {
    currentUser = null;
    updateNavbarUser();
    prefillCheckoutForm(); // Limpa os dados de entrega no carrinho ao deslogar
    authForms.style.display = 'flex';
    profilePanel.style.display = 'none';

    if (sectionTitle) sectionTitle.textContent = 'Acesse sua Área Exclusiva';
    if (sectionDesc) sectionDesc.textContent = 'Gerencie seus dados e acompanhe o histórico dos seus chimarrões.';
  }
}

/** Cadastra um novo usuário */
function registerUser() {
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim().toLowerCase();
  const password = document.getElementById('register-password').value;
  const phone = document.getElementById('register-phone').value.trim();
  const cep = document.getElementById('register-cep').value.trim();
  const address = document.getElementById('register-address').value.trim();

  if (!name || !email || !password) {
    alert('Por favor, preencha os campos obrigatórios (*).');
    return;
  }

  // Carrega banco de dados com tratamento defensivo
  let users = [];
  try {
    const rawUsers = localStorage.getItem('hipermate_users');
    users = rawUsers ? JSON.parse(rawUsers) : [];
    if (!Array.isArray(users)) users = [];
  } catch (e) {
    users = [];
  }

  // Verifica se o e-mail já existe
  if (users.some(user => user.email === email)) {
    alert('Este e-mail já está cadastrado. Tente entrar na sua conta.');
    return;
  }

  const newUser = {
    name,
    email,
    password,
    phone,
    cep,
    address,
    orders: []
  };

  users.push(newUser);
  
  try {
    localStorage.setItem('hipermate_users', JSON.stringify(users));
    // Inicia sessão automática
    localStorage.setItem('hipermate_current_user', JSON.stringify(newUser));
  } catch (e) {
    console.error("Erro ao salvar dados no localStorage:", e);
  }

  alert('Conta criada com sucesso! Seja bem-vindo à Hiper Mate.');
  
  // Limpa campos do formulário
  document.getElementById('register-form').reset();
  
  loadUserSession();
}

/** Efetua login do usuário */
function loginUser() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    alert('Por favor, preencha o e-mail e a senha.');
    return;
  }

  let users = [];
  try {
    const rawUsers = localStorage.getItem('hipermate_users');
    users = rawUsers ? JSON.parse(rawUsers) : [];
    if (!Array.isArray(users)) users = [];
  } catch (e) {
    users = [];
  }

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert('E-mail ou senha inválidos. Por favor, tente novamente.');
    return;
  }

  try {
    localStorage.setItem('hipermate_current_user', JSON.stringify(user));
  } catch (e) {
    console.error("Erro ao salvar sessão no localStorage:", e);
  }

  alert(`Olá, ${user.name}! Login realizado com sucesso.`);
  
  document.getElementById('login-form').reset();
  
  loadUserSession();
}

/** Efetua logout */
function logoutUser() {
  localStorage.removeItem('hipermate_current_user');
  currentUser = null;
  alert('Você saiu da sua conta.');
  loadUserSession();
  
  // Redireciona para home por segurança
  window.location.hash = '#home';
}

/** Atualiza dados do usuário */
function updateUserProfile() {
  if (!currentUser) return;

  const phone = document.getElementById('edit-phone').value.trim();
  const cep = document.getElementById('edit-cep').value.trim();
  const address = document.getElementById('edit-address').value.trim();

  currentUser.phone = phone;
  currentUser.cep = cep;
  currentUser.address = address;

  // Atualiza banco de dados
  let users = JSON.parse(localStorage.getItem('hipermate_users') || '[]');
  const index = users.findIndex(u => u.email === currentUser.email);
  if (index !== -1) {
    users[index].phone = phone;
    users[index].cep = cep;
    users[index].address = address;
    localStorage.setItem('hipermate_users', JSON.stringify(users));
  }

  // Atualiza sessão
  localStorage.setItem('hipermate_current_user', JSON.stringify(currentUser));
  alert('Dados de entrega atualizados com sucesso!');
  
  renderProfileDashboard();
}

/** Atualiza o texto do botão na navbar */
function updateNavbarUser() {
  const label = document.getElementById('user-name-label');
  if (!label) return;

  if (currentUser && currentUser.name) {
    const firstName = currentUser.name.trim().split(' ')[0];
    label.textContent = `Olá, ${firstName}`;
  } else {
    label.textContent = 'Entrar';
  }
}

/** Renderiza os dados no painel de perfil */
function renderProfileDashboard() {
  if (!currentUser) return;

  // Atualiza dados na barra lateral
  const displayName = document.getElementById('profile-display-name');
  const displayEmail = document.getElementById('profile-display-email');
  const editPhone = document.getElementById('edit-phone');
  const editCep = document.getElementById('edit-cep');
  const editAddress = document.getElementById('edit-address');

  if (displayName) displayName.textContent = currentUser.name;
  if (displayEmail) displayEmail.textContent = currentUser.email;

  // Preenche o formulário de edição
  if (editPhone) editPhone.value = currentUser.phone || '';
  if (editCep) editCep.value = currentUser.cep || '';
  if (editAddress) editAddress.value = currentUser.address || '';

  // Renderiza histórico de pedidos
  renderOrderHistory();
}

/** Renderiza o histórico de pedidos na tela */
function renderOrderHistory() {
  const container = document.getElementById('orders-list-container');
  const noOrdersMsg = document.getElementById('no-orders-message');
  if (!container || !noOrdersMsg) return;

  const orders = currentUser.orders || [];

  if (orders.length === 0) {
    container.innerHTML = '';
    container.appendChild(noOrdersMsg);
    noOrdersMsg.style.display = 'block';
    return;
  }

  noOrdersMsg.style.display = 'none';

  container.innerHTML = orders.map(order => {
    const itemsHtml = order.items.map(item => `
      <div class="order-item-row">
        <span><span class="order-item-qty">${item.qty}x</span> ${item.name}</span>
        <span>R$ ${formatPrice(item.price * item.qty)}</span>
      </div>
    `).join('');

    return `
      <div class="order-card">
        <div class="order-header">
          <div>
            <span class="order-id">Pedido ${order.id}</span>
            <div class="order-date">${order.date}</div>
          </div>
          <span class="status-badge sent">${order.status}</span>
        </div>
        <div class="order-body">
          <div class="order-items">
            ${itemsHtml}
          </div>
        </div>
        <div class="order-footer">
          <div>
            <span class="order-total-label">Total: </span>
            <span class="order-total-value">R$ ${formatPrice(order.total)}</span>
          </div>
          <button class="btn-reorder" data-order-id="${order.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            Refazer Compra
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/** Salva novo pedido no histórico do usuário */
function saveOrderToUserHistory(order) {
  if (!currentUser) return;

  if (!currentUser.orders) {
    currentUser.orders = [];
  }
  currentUser.orders.unshift(order); // Adiciona no início

  // Atualiza no banco de dados geral
  let users = JSON.parse(localStorage.getItem('hipermate_users') || '[]');
  const index = users.findIndex(u => u.email === currentUser.email);
  if (index !== -1) {
    users[index].orders = currentUser.orders;
    localStorage.setItem('hipermate_users', JSON.stringify(users));
  }

  // Atualiza sessão ativa
  localStorage.setItem('hipermate_current_user', JSON.stringify(currentUser));
  
  renderProfileDashboard();
}

/** Preenche automaticamente o checkout com as informações do usuário ativo */
function prefillCheckoutForm() {
  const checkoutName = document.getElementById('checkout-name');
  const checkoutPhone = document.getElementById('checkout-phone');
  const checkoutCep = document.getElementById('checkout-cep');
  const checkoutAddress = document.getElementById('checkout-address');

  if (!checkoutName || !checkoutPhone || !checkoutCep || !checkoutAddress) return;

  if (currentUser) {
    checkoutName.value = currentUser.name || '';
    checkoutPhone.value = currentUser.phone || '';
    checkoutCep.value = currentUser.cep || '';
    checkoutAddress.value = currentUser.address || '';
  } else {
    checkoutName.value = '';
    checkoutPhone.value = '';
    checkoutCep.value = '';
    checkoutAddress.value = '';
  }
}

/** Copia os itens de um pedido antigo para o carrinho atual e redireciona */
function reorderItems(orderId) {
  if (!currentUser || !currentUser.orders) return;
  const order = currentUser.orders.find(o => o.id === orderId);
  if (!order) return;

  const products = document.querySelectorAll('.product-card button.btn-add-to-cart');
  
  order.items.forEach(orderItem => {
    let id = '';
    let img = 'assets/img/lifestyle.png';
    let price = orderItem.price;

    for (let btn of products) {
      if (btn.dataset.name === orderItem.name || btn.dataset.name.startsWith(orderItem.name.substring(0, 10))) {
        id = btn.dataset.id;
        img = btn.dataset.img;
        price = parseFloat(btn.dataset.price);
        break;
      }
    }

    if (!id) {
      id = orderItem.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }

    const cartProduct = { id, name: orderItem.name, price, img };
    
    const existing = cart.find(item => item.id === cartProduct.id);
    if (existing) {
      existing.qty += orderItem.qty;
    } else {
      cart.push({ ...cartProduct, qty: orderItem.qty });
    }
  });

  renderCart();
  updateCartBadge();
  alert('Itens do pedido adicionados ao carrinho!');
  
  window.location.hash = '#carrinho';
}

// =============================================================================
// UTILITÁRIOS
// =============================================================================

/** Formata número para padrão de preço brasileiro */
function formatPrice(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** SVG do ícone de menu hambúrguer */
function iconMenu() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
  </svg>`;
}

/** SVG do ícone de X (fechar menu) */
function iconClose() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>`;
}
