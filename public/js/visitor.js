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

// Add Room form toggle
const addVisitorBtn = document.getElementById("addVisitorBtn");
const addNewVisitor = document.querySelector(".add-new-visitor");
const cancelVisitorBtn = document.querySelector(".cancel-visitor-btn");
const submitVisitorBtn = document.querySelector(".submit-visitor-btn");

addVisitorBtn?.addEventListener("click", () => {
  addNewVisitor.style.display = "block";
});

cancelVisitorBtn?.addEventListener("click", () => {
  addNewVisitor.style.display = "none";
});

submitVisitorBtn?.addEventListener("click", () => {
  addNewVisitor.style.display = "none";
});

// Confirm delete
document.querySelectorAll(".delete-form").forEach((form) => {
  form.addEventListener("submit", function (e) {
    if (!confirm("Are you sure you want to delete this visitor?")) {
      e.preventDefault();
    }
  });
});
