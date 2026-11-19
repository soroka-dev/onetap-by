const header = document.querySelector("[data-header]");
const leadForm = document.querySelector("[data-form]");
const formStatus = document.querySelector("[data-status]");
const leadEndpoint = document.querySelector("meta[name='lead-endpoint']")?.content || "/api/lead";

let lastScrollY = window.scrollY;
let scrollFrame = 0;

function updateHeader() {
  scrollFrame = 0;
  const scrollY = Math.max(0, window.scrollY);
  const movement = scrollY - lastScrollY;

  if (scrollY < 100) {
    header?.classList.remove("is-hidden");
  } else if (movement > 8) {
    header?.classList.add("is-hidden");
  } else if (movement < -8) {
    header?.classList.remove("is-hidden");
  }

  if (Math.abs(movement) > 8 || scrollY < 100) lastScrollY = scrollY;
}

window.addEventListener("scroll", () => {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateHeader);
}, { passive: true });
window.addEventListener("resize", updateHeader);
header?.addEventListener("focusin", () => header.classList.remove("is-hidden"));

leadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!leadForm.reportValidity()) return;

  const submitButton = leadForm.querySelector("button[type='submit']");
  const submitLabel = submitButton.querySelector("[data-submit-label]");
  const formData = new FormData(leadForm);
  const payload = Object.fromEntries(formData.entries());

  submitButton.disabled = true;
  submitLabel.textContent = "Отправляем…";
  showStatus("", "");

  try {
    const response = await fetch(leadEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "Не удалось отправить заявку");

    leadForm.reset();
    showStatus("Заявка отправлена. Скоро свяжемся с вами", "success");
  } catch (error) {
    showStatus(error.message || "Не удалось отправить заявку. Попробуйте ещё раз", "error");
  } finally {
    submitButton.disabled = false;
    submitLabel.textContent = "Отправить заявку";
  }
});

function showStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`.trim();
}
