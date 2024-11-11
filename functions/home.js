let toastBox = document.getElementById('toastBox');

function showToast(msg) {
    const toastBox = document.getElementById('toastBox');
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerHTML = msg;
    toastBox.appendChild(toast);
    
    // Auto-remove the toast after 6 seconds
    setTimeout(() => {
        toast.remove();
    }, 6000);
}

window.onload = function(){
    showToast('<i class="fa-solid fa-circle-check"></i> Successfully logged in!');
}

