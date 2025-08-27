// Simple XHR Injector
(function () {
    'use strict';

    console.log('🚀 XHR Injector: Starting...');

    // Store original XHR
    const OriginalXHR = window.XMLHttpRequest;
    const interceptedRequests = [];

    // Target patterns
    const targetPatterns = ['/get_pc', '/rcmd_items'];

    // Enhanced logging function
    function logMatchedResponse(requestData, responseData, rawText, type = 'XHR') {
        console.log('%c🎯 ===== MATCHED ' + type + ' RESPONSE =====', 'background: #000; color: #00ff00; font-size: 14px; font-weight: bold; padding: 5px;');
        console.log('%c📍 URL:', 'color: #ffff00; font-weight: bold;', requestData.url);
        console.log('%c🔧 Method:', 'color: #00ffff; font-weight: bold;', requestData.method);
        console.log('%c📊 Status:', 'color: #ff8800; font-weight: bold;', requestData.status);
        console.log('%c⏰ Timestamp:', 'color: #ff00ff; font-weight: bold;', requestData.timestamp);
        console.log('%c📋 Headers:', 'color: #00ff88; font-weight: bold;', requestData.headers);
        console.log('%c📤 Request Body:', 'color: #8888ff; font-weight: bold;', requestData.body);
        console.log('%c📥 Response Data:', 'color: #ff0088; font-weight: bold;', responseData);
        console.log('%c📄 Raw Response Text:', 'color: #88ff00; font-weight: bold;', rawText);
        console.log('%c🎯 ===== END ' + type + ' RESPONSE =====', 'background: #000; color: #00ff00; font-size: 14px; font-weight: bold; padding: 5px;');

        // Also log as table for better readability
        console.table({
            URL: requestData.url,
            Method: requestData.method,
            Status: requestData.status,
            Timestamp: requestData.timestamp,
            Type: type
        });
    }

    // Create UI
    function createUI() {
        // Remove existing UI if any
        const existingUI = document.getElementById('xhr-injector-ui');
        if (existingUI) {
            existingUI.remove();
        }

        // Create UI container
        const ui = document.createElement('div');
        ui.id = 'xhr-injector-ui';
        ui.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 600px !important;
            max-height: 80vh !important;
            background: #000 !important;
            color: #fff !important;
            border: 2px solid #333 !important;
            border-radius: 10px !important;
            z-index: 2147483647 !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            box-shadow: 0 0 20px rgba(0,0,0,0.8) !important;
            display: none !important;
            pointer-events: auto !important;
        `;

        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            background: #333 !important;
            padding: 15px !important;
            border-radius: 8px 8px 0 0 !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
        `;
        header.innerHTML = `
            <h3 style="margin: 0; color: #00ff00;">🔍 XHR Injector</h3>
            <button id="xhr-ui-close" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">✕</button>
        `;

        // Create content
        const content = document.createElement('div');
        content.style.cssText = `
            padding: 15px !important;
            max-height: 60vh !important;
            overflow-y: auto !important;
        `;

        // Create stats section
        const stats = document.createElement('div');
        stats.style.cssText = `
            background: #222 !important;
            padding: 10px !important;
            border-radius: 5px !important;
            margin-bottom: 15px !important;
        `;
        stats.innerHTML = `
            <div style="color: #00ff00; font-weight: bold;">📊 Statistics</div>
            <div>Intercepted Requests: <span id="xhr-ui-count" style="color: #ffff00;">0</span></div>
            <div>Target Patterns: <span style="color: #00ffff;">${targetPatterns.join(', ')}</span></div>
        `;

        // Create requests list
        const requestsList = document.createElement('div');
        requestsList.id = 'xhr-ui-requests';
        requestsList.style.cssText = `
            background: #222 !important;
            padding: 10px !important;
            border-radius: 5px !important;
            max-height: 40vh !important;
            overflow-y: auto !important;
        `;
        requestsList.innerHTML = '<div style="color: #00ff00; font-weight: bold;">📋 Recent Requests</div>';

        // Create controls
        const controls = document.createElement('div');
        controls.style.cssText = `
            background: #333 !important;
            padding: 15px !important;
            border-radius: 0 0 8px 8px !important;
            display: flex !important;
            gap: 10px !important;
        `;
        controls.innerHTML = `
            <button id="xhr-ui-clear" style="background: #ff8800; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Clear All</button>
            <button id="xhr-ui-download" style="background: #0088ff; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Download All</button>
            <button id="xhr-ui-toggle" style="background: #00ff00; color: black; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Hide UI</button>
        `;

        // Assemble UI
        content.appendChild(stats);
        content.appendChild(requestsList);
        ui.appendChild(header);
        ui.appendChild(content);
        ui.appendChild(controls);

        // Add to page immediately
        if (document.body) {
            document.body.appendChild(ui);
        } else {
            // If body doesn't exist yet, wait for it
            const observer = new MutationObserver(function (mutations) {
                if (document.body) {
                    document.body.appendChild(ui);
                    observer.disconnect();
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        }

        // Add event listeners
        setTimeout(() => {
            const closeBtn = document.getElementById('xhr-ui-close');
            const clearBtn = document.getElementById('xhr-ui-clear');
            const downloadBtn = document.getElementById('xhr-ui-download');
            const toggleBtn = document.getElementById('xhr-ui-toggle');

            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    ui.style.display = 'none';
                });
            }

            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    interceptedRequests.length = 0;
                    updateUI();
                });
            }

            // if (downloadBtn) {
            //     downloadBtn.addEventListener('click', () => {
            //         chrome.runtime.sendMessage({ action: 'downloadAll' });
            //     });
            // }

            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    if (ui.style.display === 'none') {
                        ui.style.display = 'block';
                        toggleBtn.textContent = 'Hide UI';
                    } else {
                        ui.style.display = 'none';
                        toggleBtn.textContent = 'Show UI';
                    }
                });
            }
        }, 100);

        return ui;
    }

    // Create toggle button
    function createToggleButton() {
        // Remove existing toggle if any
        const existingToggle = document.getElementById('xhr-injector-toggle');
        if (existingToggle) {
            existingToggle.remove();
        }

        const toggleBtn = document.createElement('div');
        toggleBtn.id = 'xhr-injector-toggle';
        toggleBtn.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            background: #000 !important;
            color: #00ff00 !important;
            border: 2px solid #00ff00 !important;
            border-radius: 50% !important;
            width: 50px !important;
            height: 50px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            z-index: 2147483646 !important;
            font-size: 20px !important;
            font-weight: bold !important;
            box-shadow: 0 0 10px rgba(0,255,0,0.3) !important;
            transition: all 0.3s ease !important;
            pointer-events: auto !important;
        `;
        toggleBtn.textContent = '🔍';
        toggleBtn.title = 'XHR Injector';

        toggleBtn.addEventListener('click', () => {
            const ui = document.getElementById('xhr-injector-ui');
            if (ui) {
                if (ui.style.display === 'none') {
                    ui.style.display = 'block';
                    updateUI();
                } else {
                    ui.style.display = 'none';
                }
            }
        });

        toggleBtn.addEventListener('mouseenter', () => {
            toggleBtn.style.background = '#00ff00';
            toggleBtn.style.color = '#000';
        });

        toggleBtn.addEventListener('mouseleave', () => {
            toggleBtn.style.background = '#000';
            toggleBtn.style.color = '#00ff00';
        });

        // Add to page immediately
        if (document.body) {
            document.body.appendChild(toggleBtn);
        } else {
            // If body doesn't exist yet, wait for it
            const observer = new MutationObserver(function (mutations) {
                if (document.body) {
                    document.body.appendChild(toggleBtn);
                    observer.disconnect();
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        }
    }

    // Update UI
    function updateUI() {
        const countElement = document.getElementById('xhr-ui-count');
        const requestsElement = document.getElementById('xhr-ui-requests');

        if (countElement) {
            countElement.textContent = interceptedRequests.length;
        }

        if (requestsElement) {
            const requestsList = interceptedRequests.slice(-10).reverse().map((req, index) => {
                const timestamp = new Date(req.timestamp).toLocaleTimeString();
                const status = req.status || 'pending';
                const statusColor = status >= 200 && status < 300 ? '#00ff00' : '#ff4444';

                return `
                    <div style="background: #111; padding: 8px; margin: 5px 0; border-radius: 3px; border-left: 3px solid ${statusColor};">
                        <div style="color: #ffff00; font-weight: bold;">${req.method} ${req.url}</div>
                        <div style="color: #888; font-size: 12px;">Time: ${timestamp} | Status: <span style="color: ${statusColor};">${status}</span></div>
                        <div style="color: #00ffff; font-size: 11px;">Type: ${req.type || 'xhr'}</div>
                    </div>
                `;
            }).join('');

            requestsElement.innerHTML = `
                <div style="color: #00ff00; font-weight: bold;">📋 Recent Requests (${interceptedRequests.length})</div>
                ${requestsList || '<div style="color: #888; font-style: italic;">No requests intercepted yet...</div>'}
            `;
        }
    }

    // Check if URL contains target patterns
    function shouldIntercept(url) {
        if (!url) return false;
        return targetPatterns.some(pattern => url.includes(pattern));
    }

    // Create custom XHR constructor
    function CustomXHR() {
        const xhr = new OriginalXHR();

        // Store original methods
        const originalOpen = xhr.open.bind(xhr);
        const originalSend = xhr.send.bind(xhr);
        const originalSetRequestHeader = xhr.setRequestHeader.bind(xhr);

        // Request data
        let requestData = {
            url: '',
            method: '',
            headers: {},
            body: null,
            response: null,
            status: 0,
            timestamp: new Date().toISOString()
        };

        // Override open
        xhr.open = function (method, url, async, user, password) {
            console.log(`🔧 XHR.open: ${method} ${url}`);
            requestData.method = method;
            requestData.url = url;
            requestData.timestamp = new Date().toISOString();

            if (shouldIntercept(url)) {
                console.log('🎯 Intercepting:', url);
            }

            return originalOpen(method, url, async, user, password);
        };

        // Override setRequestHeader
        xhr.setRequestHeader = function (header, value) {
            requestData.headers[header] = value;
            return originalSetRequestHeader(header, value);
        };

        // Override send
        xhr.send = function (data) {
            requestData.body = data;

            if (shouldIntercept(requestData.url)) {
                console.log('📤 Sending intercepted request:', requestData);

                // Add response listeners
                xhr.addEventListener('load', function () {
                    try {
                        requestData.status = xhr.status;

                        // Parse response
                        let responseData;
                        try {
                            responseData = JSON.parse(xhr.responseText);
                        } catch (e) {
                            responseData = xhr.responseText;
                        }
                        requestData.response = responseData;

                        console.log('📥 Response received:', requestData);

                        // Enhanced console logging for matched requests
                        logMatchedResponse(requestData, responseData, xhr.responseText, 'XHR');

                        // Store request
                        interceptedRequests.push(requestData);

                        // Update UI
                        updateUI();

                        // Send to background
                        // chrome.runtime.sendMessage({
                        //     action: 'saveResponse',
                        //     data: requestData
                        // });

                    } catch (error) {
                        console.error('❌ Error processing response:', error);
                    }
                });

                xhr.addEventListener('error', function () {
                    console.error('❌ Request failed:', requestData.url);
                    requestData.status = 0;
                    interceptedRequests.push(requestData);
                    updateUI();
                });
            }

            return originalSend(data);
        };

        return xhr;
    }

    // Copy prototype and static properties
    CustomXHR.prototype = OriginalXHR.prototype;
    CustomXHR.UNSENT = OriginalXHR.UNSENT;
    CustomXHR.OPENED = OriginalXHR.OPENED;
    CustomXHR.HEADERS_RECEIVED = OriginalXHR.HEADERS_RECEIVED;
    CustomXHR.LOADING = OriginalXHR.LOADING;
    CustomXHR.DONE = OriginalXHR.DONE;

    // Override fetch too
    const OriginalFetch = window.fetch;
    window.fetch = function (input, init) {
        const url = typeof input === 'string' ? input : input.url;

        if (shouldIntercept(url)) {
            console.log('🔧 Fetch intercepting:', url);

            const requestData = {
                url: url,
                method: (init && init.method) || 'GET',
                headers: (init && init.headers) || {},
                body: (init && init.body) || null,
                response: null,
                status: 0,
                timestamp: new Date().toISOString(),
                type: 'fetch'
            };

            return OriginalFetch.apply(this, arguments)
                .then(response => {
                    requestData.status = response.status;

                    const responseClone = response.clone();
                    return responseClone.text().then(text => {
                        try {
                            requestData.response = JSON.parse(text);
                        } catch (e) {
                            requestData.response = text;
                        }

                        console.log('📥 Fetch response:', requestData);

                        // Enhanced console logging for matched fetch requests
                        logMatchedResponse(requestData, requestData.response, text, 'FETCH');

                        interceptedRequests.push(requestData);

                        // Update UI
                        updateUI();

                        // chrome.runtime.sendMessage({
                        //     action: 'saveResponse',
                        //     data: requestData
                        // });

                        return response;
                    });
                });
        }

        return OriginalFetch.apply(this, arguments);
    };

    // Replace XMLHttpRequest
    window.XMLHttpRequest = CustomXHR;

    // Expose for debugging
    window.xhrInjector = {
        getRequests: () => interceptedRequests,
        getPatterns: () => targetPatterns,
        addPattern: (pattern) => targetPatterns.push(pattern),
        clearRequests: () => {
            interceptedRequests.length = 0;
            updateUI();
        },
        showUI: () => {
            const ui = document.getElementById('xhr-injector-ui');
            if (ui) {
                ui.style.display = 'block';
                updateUI();
            }
        },
        hideUI: () => {
            const ui = document.getElementById('xhr-injector-ui');
            if (ui) {
                ui.style.display = 'none';
            }
        },
        // Copy latest response to clipboard
        copyLatestResponse: () => {
            if (interceptedRequests.length > 0) {
                const latest = interceptedRequests[interceptedRequests.length - 1];
                const responseText = JSON.stringify(latest.response, null, 2);
                navigator.clipboard.writeText(responseText).then(() => {
                    console.log('✅ Response copied to clipboard!');
                }).catch(err => {
                    console.error('❌ Failed to copy to clipboard:', err);
                });
                return latest;
            } else {
                console.log('❌ No requests intercepted yet');
                return null;
            }
        },
        // Get latest response
        getLatestResponse: () => {
            if (interceptedRequests.length > 0) {
                return interceptedRequests[interceptedRequests.length - 1];
            }
            return null;
        },
        // Log all responses
        logAllResponses: () => {
            console.log('📋 All intercepted responses:', interceptedRequests);
            interceptedRequests.forEach((req, index) => {
                console.log(`📄 Response ${index + 1}:`, req);
            });
        }
    };

    // Initialize UI immediately
    function initUI() {
        createUI();
        createToggleButton();
        console.log('✅ XHR Injector UI created');
    }

    // Start initialization immediately
    initUI();

    // Also try to initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUI);
    }

    console.log('✅ XHR Injector: Ready!');
    console.log('🎯 Target patterns:', targetPatterns);

    // Notify background
    // chrome.runtime.sendMessage({ action: 'injectorReady' });

})();