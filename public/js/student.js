let burger = document.querySelector(".main-nav .page-name i");
let sidebar = document.querySelector(".sidebar");
let cross = document.querySelector(".cross-icon i");
let addStudent = document.querySelector(".button button");
let addNewStudent = document.querySelector(".add-new-student");
let cencelBtn = document.querySelector(".cancel-btn");
let submitBtn = document.querySelector(".submit-btn");

burger.addEventListener("click", () => {
  sidebar.style.display = "block";
});
cross.addEventListener("click", () => {
  sidebar.style.display = "none";
});
addStudent.addEventListener("click", () => {
  addNewStudent.style.display = "block";
});
cencelBtn.addEventListener("click", () => {
  addNewStudent.style.display = "none";
});
submitBtn.addEventListener("click", () => {
  addNewStudent.style.display = "none";
});

document.querySelectorAll(".delete-form").forEach((form) => {
  form.addEventListener("submit", function (e) {
    if (!confirm("Are you sure you want to delete this student?")) {
      e.preventDefault();
    }
  });
});