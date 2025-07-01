// Sidebar toggle (can be reused across all pages)
const burger = document.querySelector(".main-nav .page-name i");
const sidebar = document.querySelector(".sidebar");
const cross = document.querySelector(".cross-icon i");

burger?.addEventListener("click", () => {
  sidebar.style.display = "block";
});
cross?.addEventListener("click", () => {
  sidebar.style.display = "none";
});

// Add Payment form toggle
const addPaymentBtn = document.getElementById("addPaymentBtn");
const addNewPayment = document.querySelector(".add-new-payment");
const cancelPaymentBtn = document.querySelector(".cancel-payment-btn");
const submitPaymentBtn = document.querySelector(".submit-payment-btn");

addPaymentBtn?.addEventListener("click", () => {
  addNewPayment.style.display = "block";
});

cancelPaymentBtn?.addEventListener("click", () => {
  addNewPayment.style.display = "none";
});

submitPaymentBtn?.addEventListener("click", () => {
  addNewPayment.style.display = "none";
});

// Confirm delete
document.querySelectorAll(".delete-form").forEach((form) => {
  form.addEventListener("submit", function (e) {
    if (!confirm("Are you sure you want to delete this room?")) {
      e.preventDefault();
    }
  });
});
