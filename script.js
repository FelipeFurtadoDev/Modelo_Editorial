/* ==========================================================
   CONFIGURAÇÃO DO WHATSAPP
   Deixe vazio ("") enquanto for demonstração.
   Para ativar: só números, com país e DDD. Ex. fictício: "5511999999999"
   ========================================================== */
const WHATSAPP_NUMBER = "";
const WHATSAPP_MESSAGE = "Olá! Encontrei seu site e gostaria de informações sobre orçamento ou agendamento.";

document.documentElement.classList.add("js");
const menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Menu móvel (índice em tela cheia) ---------- */
const botaoMenu = document.querySelector(".menu-btn");
const menu = document.getElementById("indice-menu");

function abrirMenu(abrir) {
  menu.classList.toggle("aberto", abrir);
  botaoMenu.setAttribute("aria-expanded", String(abrir));
  document.body.classList.toggle("menu-aberto", abrir);
  document.body.style.overflow = abrir ? "hidden" : "";
}
botaoMenu.addEventListener("click", () => abrirMenu(botaoMenu.getAttribute("aria-expanded") !== "true"));
menu.addEventListener("click", (e) => { if (e.target.closest("a")) abrirMenu(false); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && botaoMenu.getAttribute("aria-expanded") === "true") {
    abrirMenu(false);
    botaoMenu.focus();
  }
});

/* ---------- Tipografia cinética: divide o texto em palavras ---------- */
let indice = 0;
function dividir(no) {
  [...no.childNodes].forEach((n) => {
    if (n.nodeType === 3) {                                  // nó de texto
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((parte) => {
        if (!parte.trim()) { frag.append(parte); return; }   // espaços ficam como estão
        const w = document.createElement("span"); w.className = "w";
        const s = document.createElement("span"); s.textContent = parte;
        s.style.setProperty("--i", indice++);
        w.append(s); frag.append(w);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1) dividir(n);                 // elemento: entra nele
  });
}
if (!menosMovimento) {
  document.querySelectorAll("[data-split]").forEach((el) => {
    indice = 0; dividir(el); el.setAttribute("data-reveal", "");
  });
}

/* ---------- Revelar ao rolar (texto e imagens) ---------- */
const itens = document.querySelectorAll("[data-reveal]");
if (menosMovimento || !("IntersectionObserver" in window)) {
  itens.forEach((el) => el.classList.add("on"));
} else {
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("on"); obs.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  itens.forEach((el) => obs.observe(el));
}

/* ---------- Carrossel: botões + arraste com o mouse ---------- */
const trilho = document.querySelector(".trilho");
if (trilho) {
  const passo = () => trilho.querySelector("li").offsetWidth + 24;
  const rolar = (dir) => trilho.scrollBy({ left: dir * passo(), behavior: menosMovimento ? "auto" : "smooth" });
  document.querySelector("[data-prox]").addEventListener("click", () => rolar(1));
  document.querySelector("[data-ant]").addEventListener("click", () => rolar(-1));

  let arrastando = false, x0 = 0, s0 = 0;
  trilho.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;                   // no toque, a rolagem nativa já funciona
    arrastando = true; x0 = e.clientX; s0 = trilho.scrollLeft;
    trilho.classList.add("arrastando");
  });
  window.addEventListener("pointermove", (e) => { if (arrastando) trilho.scrollLeft = s0 - (e.clientX - x0); });
  window.addEventListener("pointerup", () => { arrastando = false; trilho.classList.remove("arrastando"); });
}

/* ---------- Lightbox da galeria (usa <dialog>: Esc e foco já vêm prontos) ---------- */
const lightbox = document.getElementById("lightbox");
const fotos = [...document.querySelectorAll(".g-item")];
let atual = 0;

function mostrar(i) {
  atual = (i + fotos.length) % fotos.length;
  const original = fotos[atual].querySelector(".ph, img");
  document.getElementById("lb-img").replaceChildren(original.cloneNode(true));
  document.getElementById("lb-leg").textContent = fotos[atual].dataset.legenda;
}
fotos.forEach((f, i) => f.addEventListener("click", () => { mostrar(i); lightbox.showModal(); }));
lightbox.querySelector("[data-fechar]").addEventListener("click", () => lightbox.close());
lightbox.querySelector("[data-lb-prox]").addEventListener("click", () => mostrar(atual + 1));
lightbox.querySelector("[data-lb-ant]").addEventListener("click", () => mostrar(atual - 1));
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.close(); });   // clique fora fecha
lightbox.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") mostrar(atual + 1);
  if (e.key === "ArrowLeft") mostrar(atual - 1);
});

/* ---------- Botões de WhatsApp ---------- */
const numeroValido = /^\d{10,15}$/.test(WHATSAPP_NUMBER);
const aviso = document.getElementById("aviso");
let temporizador;

function mostrarAviso(texto) {
  aviso.textContent = texto;
  aviso.classList.add("visivel");
  clearTimeout(temporizador);
  temporizador = setTimeout(() => aviso.classList.remove("visivel"), 8000);
}
document.querySelectorAll("[data-whatsapp]").forEach((botao) => {
  if (numeroValido) {
    botao.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(WHATSAPP_MESSAGE);
    botao.target = "_blank";
    botao.rel = "noopener noreferrer";
  } else {
    botao.addEventListener("click", (e) => {
      e.preventDefault();
      mostrarAviso("Contato demonstrativo: nenhum número foi configurado. Em um site real, este botão abriria o WhatsApp do negócio.");
    });
  }
});