// Simple Background Script
let interceptedData = [];


console.log('🚀 XHR Injector Background: Started');

// Inject content script
async function injectScript(tabId) {
    try {
        console.log(`🔄 Injecting into tab ${tabId}`);
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });
        console.log(`✅ Successfully injected into tab ${tabId}`);
    } catch (error) {
        console.log(`⚠️ Failed to inject into tab ${tabId}:`, error.message);
    }
}

// Inject into all tabs
async function injectIntoAllTabs() {
    try {
        const tabs = await chrome.tabs.query({});
        console.log(`🔄 Found ${tabs.length} tabs, injecting...`);

        for (const tab of tabs) {
            if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
                await injectScript(tab.id);
            }
        }
        console.log('✅ Injection into all tabs completed');
    } catch (error) {
        console.error('❌ Error injecting into all tabs:', error);
    }
}

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Message:', message.action);

    if (message.action === 'saveResponse') {
        console.log('💾 Saving response:', message.data.url);
        interceptedData.push(message.data);
        saveToFile(message.data);
        sendResponse({ success: true });
    }

    if (message.action === 'injectorReady') {
        console.log('✅ Injector ready in tab:', sender.tab.id);
        sendResponse({ success: true });
    }

    if (message.action === 'getData') {
        sendResponse({ data: interceptedData });
    }

    if (message.action === 'clearData') {
        interceptedData = [];
        sendResponse({ success: true });
    }

    if (message.action === 'downloadAll') {
        downloadAllData();
        sendResponse({ success: true });
    }

    if (message.action === 'injectAll') {
        injectIntoAllTabs();
        sendResponse({ success: true });
    }

    return true;
});

// Tab events
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url &&
        (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
        console.log(`🔄 Tab ${tabId} updated, injecting...`);
        injectScript(tabId);
    }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
            console.log(`🔄 Tab ${activeInfo.tabId} activated, injecting...`);
            injectScript(activeInfo.tabId);
        }
    } catch (error) {
        console.log('⚠️ Error getting tab info:', error);
    }
});

// Tab created
chrome.tabs.onCreated.addListener((tab) => {
    if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
        console.log(`🔄 New tab ${tab.id} created, injecting...`);
        // Wait a bit for the tab to fully load
        setTimeout(() => injectScript(tab.id), 1000);
    }
});

// Extension events
chrome.runtime.onInstalled.addListener(() => {
    console.log('🚀 Extension installed');
    // Inject into all existing tabs
    setTimeout(() => injectIntoAllTabs(), 1000);
});

chrome.runtime.onStartup.addListener(() => {
    console.log('🚀 Extension started');
    // Inject into all existing tabs
    setTimeout(() => injectIntoAllTabs(), 1000);
});

// Save single file
function saveToFile(data) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const url = new URL(data.url);
    const endpoint = url.pathname.split('/').pop() || 'unknown';
    const filename = `xhr_${endpoint}_${timestamp}.json`;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

    chrome.downloads.download({
        url: URL.createObjectURL(blob),
        filename: filename,
        saveAs: false
    }, (downloadId) => {
        if (chrome.runtime.lastError) {
            console.error('❌ Download failed:', chrome.runtime.lastError);
        } else {
            console.log('✅ File saved:', filename);
        }
    });
}

// Download all data
function downloadAllData() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `all_xhr_data_${timestamp}.json`;

    const data = {
        total: interceptedData.length,
        timestamp: new Date().toISOString(),
        requests: interceptedData
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

    chrome.downloads.download({
        url: URL.createObjectURL(blob),
        filename: filename,
        saveAs: true
    }, (downloadId) => {
        if (chrome.runtime.lastError) {
            console.error('❌ Download failed:', chrome.runtime.lastError);
        } else {
            console.log('✅ All data saved:', filename);
        }
    });
} 