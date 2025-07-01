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
const addRoomBtn = document.getElementById("addRoomBtn");
const addNewRoom = document.querySelector(".add-new-room");
const cancelRoomBtn = document.querySelector(".cancel-room-btn");
const submitRoomBtn = document.querySelector(".submit-room-btn");

addRoomBtn?.addEventListener("click", () => {
  addNewRoom.style.display = "block";
});

cancelRoomBtn?.addEventListener("click", () => {
  addNewRoom.style.display = "none";
});

submitRoomBtn?.addEventListener("click", () => {
  addNewRoom.style.display = "none";
});

// Confirm delete
document.querySelectorAll(".delete-form").forEach((form) => {
  form.addEventListener("submit", function (e) {
    if (!confirm("Are you sure you want to delete this room?")) {
      e.preventDefault();
    }
  });
});
