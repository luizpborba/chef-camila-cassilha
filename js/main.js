const ZAP = "5548984584749";

document.documentElement.classList.add("js");

// borda do topo ao rolar
const topo = document.getElementById("topo");
const aoRolar = () => topo.classList.toggle("rolou", scrollY > 8);
addEventListener("scroll", aoRolar, { passive: true });
aoRolar();

// menu do celular
const nav = document.getElementById("nav");
const burger = document.getElementById("burger");
const fecharMenu = () => {
  nav.classList.remove("aberta");
  document.body.classList.remove("menu-aberto");
  burger.setAttribute("aria-expanded", "false");
  burger.setAttribute("aria-label", "Abrir menu");
};
burger.addEventListener("click", () => {
  const aberto = nav.classList.toggle("aberta");
  document.body.classList.toggle("menu-aberto", aberto);
  burger.setAttribute("aria-expanded", String(aberto));
  burger.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", fecharMenu));
addEventListener("keydown", e => { if (e.key === "Escape") fecharMenu(); });
document.addEventListener("click", e => {
  if (nav.classList.contains("aberta") && !nav.contains(e.target) && !burger.contains(e.target)) fecharMenu();
});
matchMedia("(min-width: 961px)").addEventListener("change", e => { if (e.matches) fecharMenu(); });

// animação de entrada
const observador = new IntersectionObserver(entradas => {
  entradas.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("visivel");
      observador.unobserve(e.target);
    }
  });
}, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".revela").forEach(el => observador.observe(el));

const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;

// carrossel 3D de sabores
(() => {
  const raiz = document.getElementById("carrossel");
  if (!raiz) return;
  const palco = raiz.querySelector(".carrossel-palco");
  const slides = [...raiz.querySelectorAll(".slide")];
  const nome = document.getElementById("car-nome");
  const desc = document.getElementById("car-desc");
  const num = document.getElementById("car-num");
  const pontos = document.getElementById("car-pontos");
  const total = slides.length;
  let atual = 0;
  let timer = null;

  const botoes = slides.map((s, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", s.dataset.nome);
    b.addEventListener("click", () => { ir(i); reiniciar(); });
    pontos.appendChild(b);
    return b;
  });

  // distância circular entre o slide e o atual (-2..3 para 6 itens)
  const dist = i => {
    let d = i - atual;
    if (d > total / 2) d -= total;
    if (d < -total / 2) d += total;
    return d;
  };

  function desenhar(arraste = 0) {
    slides.forEach((s, i) => {
      const d = dist(i) + arraste;
      const a = Math.abs(d);
      s.style.transform =
        `translateX(-50%) translateX(${d * 64}%) translateZ(${-a * 200}px) rotateY(${-d * 22}deg)`;
      s.style.opacity = a > 2.2 ? 0 : String(1 - a * 0.22);
      s.style.filter = `brightness(${1 - Math.min(a, 2) * 0.08})`;
      s.style.zIndex = String(10 - Math.round(a));
      s.classList.toggle("ativo", Math.round(dist(i)) === 0);
      s.setAttribute("aria-hidden", dist(i) === 0 ? "false" : "true");
    });
  }

  function ir(i) {
    atual = (i + total) % total;
    desenhar();
    const s = slides[atual];
    nome.textContent = s.dataset.nome;
    desc.textContent = s.dataset.desc;
    num.textContent = `${String(atual + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    [nome, desc].forEach(el => { el.classList.remove("troca"); void el.offsetWidth; el.classList.add("troca"); });
    botoes.forEach((b, k) => b.setAttribute("aria-selected", String(k === atual)));
  }

  const parar = () => { clearInterval(timer); timer = null; };
  const iniciar = () => { if (!semMovimento && !timer) timer = setInterval(() => ir(atual + 1), 4500); };
  const reiniciar = () => { parar(); iniciar(); };

  document.getElementById("car-ant").addEventListener("click", () => { ir(atual - 1); reiniciar(); });
  document.getElementById("car-prox").addEventListener("click", () => { ir(atual + 1); reiniciar(); });
  slides.forEach((s, i) => s.addEventListener("click", () => { if (!movido && i !== atual) { ir(i); reiniciar(); } }));
  raiz.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") { ir(atual - 1); reiniciar(); }
    if (e.key === "ArrowRight") { ir(atual + 1); reiniciar(); }
  });
  raiz.addEventListener("mouseenter", parar);
  raiz.addEventListener("mouseleave", iniciar);

  // arrastar com dedo ou mouse
  let inicioX = null, movido = false;
  palco.addEventListener("pointerdown", e => {
    inicioX = e.clientX; movido = false;
    palco.setPointerCapture(e.pointerId);
    parar();
  });
  palco.addEventListener("pointermove", e => {
    if (inicioX === null) return;
    const dx = e.clientX - inicioX;
    if (Math.abs(dx) > 6) { movido = true; palco.classList.add("arrastando"); }
    if (movido) desenhar(dx / (slides[0].offsetWidth * 0.64));
  });
  const soltar = e => {
    if (inicioX === null) return;
    const dx = e.clientX - inicioX;
    inicioX = null;
    palco.classList.remove("arrastando");
    if (movido && Math.abs(dx) > 40) ir(atual + (dx < 0 ? 1 : -1));
    else desenhar();
    iniciar();
  };
  palco.addEventListener("pointerup", soltar);
  palco.addEventListener("pointercancel", soltar);

  // só gira quando o carrossel está na tela
  new IntersectionObserver(([e]) => (e.isIntersecting ? iniciar() : parar()), { threshold: .3 }).observe(raiz);

  ir(0);
})();

// cardápio completo: cartões deslizáveis no celular
(() => {
  const trilho = document.getElementById("menu-trilho");
  if (!trilho) return;
  const cards = [...trilho.querySelectorAll(".menu-card")];
  const pontos = [...document.querySelectorAll("#menu-pontos i")];
  const ant = document.getElementById("menu-ant");
  const prox = document.getElementById("menu-prox");
  const indice = () => {
    const base = trilho.getBoundingClientRect().left + parseFloat(getComputedStyle(trilho).scrollPaddingLeft || 0);
    let melhor = 0, menor = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.getBoundingClientRect().left - base);
      if (d < menor) { menor = d; melhor = i; }
    });
    return melhor;
  };
  const atualizar = () => {
    const i = indice();
    const fim = trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 4;
    pontos.forEach((p, k) => p.classList.toggle("ativo", k === i));
    ant.disabled = trilho.scrollLeft <= 4;
    prox.disabled = fim;
  };
  const ir = i => {
    const c = cards[Math.max(0, Math.min(cards.length - 1, i))];
    trilho.scrollTo({ left: c.offsetLeft - trilho.firstElementChild.offsetLeft, behavior: semMovimento ? "auto" : "smooth" });
  };
  ant.addEventListener("click", () => ir(indice() - 1));
  prox.addEventListener("click", () => ir(indice() + 1));
  trilho.addEventListener("scroll", atualizar, { passive: true });
  addEventListener("resize", atualizar);
  atualizar();
})();

// sobre: leve parallax na foto
(() => {
  const moldura = document.getElementById("sobre-moldura");
  if (!moldura || semMovimento) return;
  const img = moldura.querySelector("img");
  const mover = () => {
    const r = moldura.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    const y = Math.max(-13, Math.min(0, -6.5 + p * 10));
    img.style.transform = `translateY(${y.toFixed(2)}%)`;
  };
  addEventListener("scroll", mover, { passive: true });
  mover();
})();

// formulário: monta a mensagem e abre o WhatsApp
document.getElementById("form-orc").addEventListener("submit", ev => {
  ev.preventDefault();
  const f = ev.target;
  const nome = f.nome.value.trim();
  if (!nome) {
    f.nome.classList.add("erro");
    f.nome.focus();
    return;
  }
  f.nome.classList.remove("erro");

  let data = "a definir";
  if (f.data.value) {
    const [a, m, d] = f.data.value.split("-");
    data = `${d}/${m}/${a}`;
  }
  const linhas = [
    "Olá, Chefs Jackson e Camila! Quero um orçamento de risoto.",
    `Nome: ${nome}`,
    `Data: ${data}`,
    `Convidados: ${parseInt(f.convidados.value, 10) > 0 ? parseInt(f.convidados.value, 10) : "a definir"}`,
    `Cidade: ${f.local.value.trim() || "a definir"}`
  ];
  window.open(`https://wa.me/${ZAP}?text=${encodeURIComponent(linhas.join("\n"))}`, "_blank", "noopener");
});
document.querySelector("#form-orc [name=nome]").addEventListener("input", e => e.target.classList.remove("erro"));

// gancho para Pixel da Meta e Google Analytics
document.querySelectorAll("[data-evento]").forEach(el => el.addEventListener("click", () => {
  if (window.fbq) fbq("track", "Contact", { origem: el.dataset.evento });
  if (window.gtag) gtag("event", "contato_whatsapp", { origem: el.dataset.evento });
}));

document.getElementById("ano").textContent = new Date().getFullYear();
