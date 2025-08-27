// Popup script for XHR Injector
document.addEventListener('DOMContentLoaded', function () {
    // Get elements
    const injectAllBtn = document.getElementById('injectAll');
    const downloadAllBtn = document.getElementById('downloadAll');
    const clearDataBtn = document.getElementById('clearData');
    const openConsoleBtn = document.getElementById('openConsole');
    const requestCountSpan = document.getElementById('requestCount');
    const statusDiv = document.getElementById('status');

    // Update stats when popup opens
    updateStats();

    // Inject into all tabs button
    injectAllBtn.addEventListener('click', function () {
        chrome.runtime.sendMessage({ action: 'injectAll' }, function (response) {
            if (response && response.success) {
                showMessage('✅ Đã inject vào tất cả tabs!');
            } else {
                showMessage('❌ Lỗi khi inject!');
            }
        });
    });

    // Download all data button
    downloadAllBtn.addEventListener('click', function () {
        chrome.runtime.sendMessage({ action: 'downloadAll' }, function (response) {
            if (response && response.success) {
                showMessage('✅ Đã tải tất cả dữ liệu!');
            } else {
                showMessage('❌ Lỗi khi tải dữ liệu!');
            }
        });
    });

    // Clear data button
    clearDataBtn.addEventListener('click', function () {
        if (confirm('Bạn có chắc muốn xóa tất cả dữ liệu đã intercept?')) {
            chrome.runtime.sendMessage({ action: 'clearData' }, function (response) {
                if (response && response.success) {
                    showMessage('🗑️ Đã xóa dữ liệu!');
                    updateStats();
                } else {
                    showMessage('❌ Lỗi khi xóa dữ liệu!');
                }
            });
        }
    });

    // Open console button
    openConsoleBtn.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'openConsole' });
        });
    });

    // Update statistics
    function updateStats() {
        chrome.runtime.sendMessage({ action: 'getData' }, function (response) {
            if (response && response.data) {
                const count = response.data.length;
                requestCountSpan.textContent = count;

                if (count > 0) {
                    statusDiv.innerHTML = `✅ Đã intercept ${count} requests`;
                    statusDiv.className = 'status active';
                } else {
                    statusDiv.innerHTML = '⏳ Đang chờ requests...';
                    statusDiv.className = 'status';
                }
            }
        });
    }

    // Show temporary message
    function showMessage(message) {
        const originalText = statusDiv.innerHTML;
        statusDiv.innerHTML = message;
        statusDiv.style.background = 'rgba(255, 193, 7, 0.3)';
        statusDiv.style.border = '1px solid rgba(255, 193, 7, 0.5)';

        setTimeout(() => {
            statusDiv.innerHTML = originalText;
            statusDiv.style.background = '';
            statusDiv.style.border = '';
            updateStats();
        }, 2000);
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'updateStats') {
            updateStats();
        }
    });
}); 