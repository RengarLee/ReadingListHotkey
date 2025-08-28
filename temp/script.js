// 获取DOM元素
const notification = document.getElementById('my-notification');
const closeBtn = document.getElementById('close-btn-x');
const showNotificationBtn = document.getElementById('show-notification');

// 显示通知的函数
function showNotification() {
    notification.style.display = 'flex';
    // 强制重绘，然后添加show类来触发动画
    notification.offsetHeight;
    notification.classList.add('show');
}

// 隐藏通知的函数
function hideNotification() {
    notification.classList.add('hide');
    notification.classList.remove('show');
    
    // 等待动画完成后隐藏元素
    setTimeout(() => {
        notification.style.display = 'none';
        notification.classList.remove('hide');
    }, 300); // 与CSS transition时间一致
}

// 点击按钮显示通知
showNotificationBtn.addEventListener('click', () => {
    showNotification();
    
    // 5秒后自动隐藏
    setTimeout(() => {
        hideNotification();
    }, 5000);
});

// 隐藏通知栏
closeBtn.addEventListener('click', () => {
    hideNotification();
});

// 按钮点击事件
document.getElementById('open-btn').addEventListener('click', () => {
    alert('你点击了"打开"按钮！');
    hideNotification();
});
