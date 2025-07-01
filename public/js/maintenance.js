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
const addMaintenanceBtn = document.getElementById("addMaintenanceBtn");
const addNewMaintenance = document.querySelector(".add-new-maintenance");
const cancelMaintenanceBtn = document.querySelector(".cancel-maintenance-btn");
const submitMaintenanceBtn = document.querySelector(".submit-maintenance-btn");

addMaintenanceBtn?.addEventListener("click", () => {
  addNewMaintenance.style.display = "block";
});

cancelMaintenanceBtn?.addEventListener("click", () => {
  addNewMaintenance.style.display = "none";
});

submitMaintenanceBtn?.addEventListener("click", () => {
  addNewMaintenance.style.display = "none";
});

// Confirm delete
document.querySelectorAll(".delete-form").forEach((form) => {
  form.addEventListener("submit", function (e) {
    if (!confirm("Are you sure you want to delete this maintenance?")) {
      e.preventDefault();
    }
  });
});
