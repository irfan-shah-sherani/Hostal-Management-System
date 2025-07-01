let burger = document.querySelector('.main-nav .page-name i');
let sidebar = document.querySelector('.sidebar');
let cross = document.querySelector('.cross-icon i');
burger.addEventListener('click', () => {
        sidebar.style.display = 'block';    
});
cross.addEventListener('click', () => {
        sidebar.style.display = 'none';    
});