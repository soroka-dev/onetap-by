const menuButton = document.querySelector("[data-menu]");
const navigation = document.querySelector("[data-nav]");
const leadForm = document.querySelector("[data-form]");
const formStatus = document.querySelector("[data-status]");

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  navigation.classList.toggle("open", !isOpen);
});

navigation?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuButton?.setAttribute("aria-expanded", "false");
    navigation.classList.remove("open");
  }
});

leadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!leadForm.reportValidity()) return;

  const submitButton = leadForm.querySelector("button[type='submit']");
  const formData = new FormData(leadForm);
  const payload = Object.fromEntries(formData.entries());

  submitButton.disabled = true;
  submitButton.firstChild.textContent = "Отправляем… ";
  showStatus("", "");

  try {
    const response = await fetch("/api/lead", {
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
    submitButton.firstChild.textContent = "Отправить заявку ";
  }
});

function showStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`.trim();
}
