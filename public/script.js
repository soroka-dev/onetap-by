const menuButton = document.querySelector("[data-menu]");
const navigation = document.querySelector("[data-nav]");
const leadForm = document.querySelector("[data-form]");
const formStatus = document.querySelector("[data-status]");
const leadEndpoint = document.querySelector("meta[name='lead-endpoint']")?.content || "/api/lead";

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenuState(!isOpen);
});

navigation?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setMenuState(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuState(false);
});

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

function setMenuState(isOpen) {
  const menuLabel = menuButton?.querySelector(".sr-only");
  menuButton?.setAttribute("aria-expanded", String(isOpen));
  navigation?.classList.toggle("open", isOpen);
  if (menuLabel) menuLabel.textContent = isOpen ? "Закрыть меню" : "Открыть меню";
}
