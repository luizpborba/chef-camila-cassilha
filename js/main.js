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
    `Convidados: ${f.convidados.value}`,
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
