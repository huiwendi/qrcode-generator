// DOM元素
const qrContent = document.getElementById('qr-content');
const qrSize = document.getElementById('qr-size');
const sizeValue = document.getElementById('size-value');
const qrColor = document.getElementById('qr-color');
const qrBgColor = document.getElementById('qr-bg-color');
const qrErrorLevel = document.getElementById('qr-error-level');
const generateBtn = document.getElementById('generate-btn');
const resetBtn = document.getElementById('reset-btn');
const qrcodeDiv = document.getElementById('qrcode');
const qrPlaceholder = document.getElementById('qr-placeholder');
const downloadPng = document.getElementById('download-png');
const downloadSvg = document.getElementById('download-svg');
const downloadJpg = document.getElementById('download-jpg');
const exampleButtons = document.querySelectorAll('.example-btn');

// 当前二维码数据
let currentQRCode = null;
let currentCanvas = null;

// 初始化
function init() {
    // 更新尺寸显示
    updateSizeValue();

    // 事件监听器
    qrSize.addEventListener('input', updateSizeValue);
    generateBtn.addEventListener('click', generateQRCode);
    resetBtn.addEventListener('click', resetForm);
    downloadPng.addEventListener('click', () => downloadQRCode('png'));
    downloadSvg.addEventListener('click', () => downloadQRCode('svg'));
    downloadJpg.addEventListener('click', () => downloadQRCode('jpg'));

    // 示例按钮事件
    exampleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.getAttribute('data-text');
            qrContent.value = text;
            generateQRCode();

            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // 初始生成一个二维码
    generateQRCode();
}

// 更新尺寸显示
function updateSizeValue() {
    sizeValue.textContent = `${qrSize.value}px`;
}

// 生成二维码
function generateQRCode() {
    const content = qrContent.value.trim();

    if (!content) {
        alert('请输入要生成二维码的内容！');
        return;
    }

    // 清除旧的二维码
    qrcodeDiv.innerHTML = '';

    // 显示加载状态
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中...';
    generateBtn.disabled = true;

    try {
        // 设置二维码选项
        const options = {
            text: content,
            width: parseInt(qrSize.value),
            height: parseInt(qrSize.value),
            colorDark: qrColor.value,
            colorLight: qrBgColor.value,
            correctLevel: QRCode.CorrectLevel[qrErrorLevel.value]
        };

        // 生成二维码
        currentQRCode = new QRCode(qrcodeDiv, options);

        // 等待二维码渲染完成
        setTimeout(() => {
            // 获取canvas元素
            currentCanvas = qrcodeDiv.querySelector('canvas');

            // 显示二维码，隐藏占位符
            qrcodeDiv.style.display = 'block';
            qrPlaceholder.style.display = 'none';

            // 启用下载按钮
            downloadPng.disabled = false;
            downloadSvg.disabled = false;
            downloadJpg.disabled = false;

            // 恢复生成按钮
            generateBtn.innerHTML = '<i class="fas fa-bolt"></i> 生成二维码';
            generateBtn.disabled = false;

            // 显示成功消息
            showNotification('二维码生成成功！', 'success');
        }, 100);

    } catch (error) {
        console.error('生成二维码时出错:', error);
        alert('生成二维码时出错，请检查输入内容！');

        // 恢复生成按钮
        generateBtn.innerHTML = '<i class="fas fa-bolt"></i> 生成二维码';
        generateBtn.disabled = false;
    }
}

// 重置表单
function resetForm() {
    qrContent.value = '';
    qrSize.value = 200;
    qrColor.value = '#000000';
    qrBgColor.value = '#ffffff';
    qrErrorLevel.value = 'M';

    updateSizeValue();

    // 清除二维码显示
    qrcodeDiv.innerHTML = '';
    qrcodeDiv.style.display = 'none';
    qrPlaceholder.style.display = 'block';

    // 禁用下载按钮
    downloadPng.disabled = true;
    downloadSvg.disabled = true;
    downloadJpg.disabled = true;

    // 显示通知
    showNotification('表单已重置！', 'info');
}

// 下载二维码
function downloadQRCode(format) {
    if (!currentCanvas) {
        alert('请先生成二维码！');
        return;
    }

    try {
        let fileName = `qrcode_${Date.now()}`;
        let mimeType, dataUrl;

        switch (format) {
            case 'png':
                fileName += '.png';
                mimeType = 'image/png';
                dataUrl = currentCanvas.toDataURL(mimeType);
                break;

            case 'jpg':
                fileName += '.jpg';
                mimeType = 'image/jpeg';
                // 创建临时canvas以添加白色背景（用于JPG）
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = currentCanvas.width;
                tempCanvas.height = currentCanvas.height;

                // 填充白色背景
                tempCtx.fillStyle = qrBgColor.value;
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

                // 绘制二维码
                tempCtx.drawImage(currentCanvas, 0, 0);

                dataUrl = tempCanvas.toDataURL(mimeType, 0.9);
                break;

            case 'svg':
                fileName += '.svg';
                // 简单实现SVG下载 - 实际应用中可能需要更复杂的实现
                alert('SVG下载功能正在开发中，目前建议使用PNG格式下载。');
                return;

            default:
                alert('不支持的格式！');
                return;
        }

        // 创建下载链接
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 显示通知
        showNotification(`二维码已下载为${format.toUpperCase()}格式！`, 'success');

    } catch (error) {
        console.error('下载二维码时出错:', error);
        alert('下载二维码时出错！');
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    // 移除现有的通知
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;

    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 350px;
    `;

    // 添加关闭按钮事件
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });

    // 自动消失
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);

    // 添加到页面
    document.body.appendChild(notification);

    // 添加动画关键帧
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 0;
                margin-left: 10px;
                opacity: 0.8;
                transition: opacity 0.2s;
            }
            .notification-close:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }
}

// 添加键盘快捷键
document.addEventListener('keydown', (e) => {
    // Ctrl+Enter 生成二维码
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        generateQRCode();
    }

    // Esc 重置表单
    if (e.key === 'Escape') {
        resetForm();
    }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// 添加PWA功能（渐进式Web应用）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // 在实际部署时启用Service Worker
        // navigator.serviceWorker.register('/service-worker.js');
    });
}

// 添加离线检测
window.addEventListener('online', () => {
    showNotification('网络已恢复连接！', 'success');
});

window.addEventListener('offline', () => {
    showNotification('网络连接已断开，部分功能可能受限', 'error');
});