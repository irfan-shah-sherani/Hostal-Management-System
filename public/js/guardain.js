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


// Confirm delete
document.querySelectorAll(".delete-form").forEach((form) => {
  form.addEventListener("submit", function (e) {
    if (!confirm("Are you sure you want to delete this maintenance?")) {
      e.preventDefault();
    }
  });
});

// Confirm delete
document.querySelectorAll(".delete-form").forEach((form) => {
  form.addEventListener("submit", function (e) {
    if (!confirm("Are you sure you want to delete this guardian?")) {
      e.preventDefault();
    }
  });
});
