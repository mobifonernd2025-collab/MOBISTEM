// =========================================================
// MOBISTEM - DEVICE WORKSPACE + MQTT CONNECTION
// =========================================================

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '12345678';

const DEFAULT_BROKER_SETTINGS = {
    host: '098ab8ccb8b94044944a7052721958b2.s1.eu.hivemq.cloud',
    port: 8884,
    user: 'MobiSTEM',
    pass: 'Stem@123',
    jsonKey: 'main'
};

// Danh mục thiết bị. Muốn thêm model mới về sau chỉ cần thêm item tại đây.
// toolboxMode quyết định bộ block/code được hiển thị cho thiết bị đó.
const DEVICE_CATALOG = [
    {
        key: 'robot',
        group: 'Robot',
        name: 'Robot',
        description: 'Robot STEM lập trình chuyển động, cảm biến, servo và hiển thị.',
        icon: 'fa-solid fa-robot',
        toolboxMode: 'robot'
    },
    {
        key: 'smarthome',
        group: 'Nhà thông minh',
        name: 'Nhà thông minh',
        description: 'Thiết bị Smart Home cho cảm biến, LCD, đèn, quạt và relay.',
        icon: 'fa-solid fa-house-signal',
        toolboxMode: 'smarthome'
    }
];

// Nút tác vụ trong khay Blockly (như "Tạo biến...") cần đủ khoảng thở.
if (Blockly.FlyoutButton) {
    Blockly.FlyoutButton.TEXT_MARGIN_X = 16;
    Blockly.FlyoutButton.TEXT_MARGIN_Y = 8;
    Blockly.FlyoutButton.BORDER_RADIUS = 9;
}

const mobiStemTheme = Blockly.Theme.defineTheme('mobiStemTheme', {
    base: Blockly.Themes.Classic,
    // Giữ bảng màu của MobiSTEM, đồng bộ màu khối có sẵn với danh mục.
    blockStyles: {
        logic_blocks: { colourPrimary: '#5C81A6', colourSecondary: '#88A4BE', colourTertiary: '#426483' },
        loop_blocks: { colourPrimary: '#FFAB19', colourSecondary: '#FFD071', colourTertiary: '#D78B12' },
        math_blocks: { colourPrimary: '#5C68A6', colourSecondary: '#8993C2', colourTertiary: '#434F88' },
        text_blocks: { colourPrimary: '#388068', colourSecondary: '#8AC4B0', colourTertiary: '#2D6653' },
        variable_blocks: { colourPrimary: '#A65C81', colourSecondary: '#C48BA7', colourTertiary: '#824364' },
        procedure_blocks: { colourPrimary: '#9A5CA6', colourSecondary: '#BA8AC3', colourTertiary: '#784483' }
    },
    fontStyle: {
        family: 'Inter, Arial, sans-serif',
        weight: '700',
        size: 13
    },
    componentStyles: {
        workspaceBackgroundColour: '#ffffff',
        toolboxBackgroundColour: '#f8fafc',
        toolboxForegroundColour: '#334155',
        flyoutBackgroundColour: '#ffffff',
        flyoutForegroundColour: '#1e293b',
        flyoutOpacity: 1,
        scrollbarColour: '#cbd5e1',
        scrollbarOpacity: 0.8
    }
});

function buildToolbox(deviceId) {
    const common = document.getElementById('common_blocks').innerHTML;
    const specific = document.getElementById('toolbox_' + deviceId).innerHTML;
    return '<xml>' + common + '<sep gap="30" css-container="mobi-toolbox-separator"></sep>' + specific + '</xml>';
}

const workspace = Blockly.inject('blocklyDiv', {
    toolbox: buildToolbox('robot'),
    renderer: 'zelos',
    theme: mobiStemTheme,
    grid: { spacing: 20, length: 3, colour: '#e2e8f0', snap: true },
    trashcan: true,
    zoom: {
        controls: true,
        wheel: true,
        startScale: 1.18,
        maxScale: 2.5,
        minScale: 0.7,
        scaleSpeed: 1.1,
        pinch: true
    }
});

function setupBlocklyPrompt() {
    const dialog = document.getElementById('blocklyPromptDialog');
    const form = document.getElementById('blocklyPromptForm');
    const title = document.getElementById('blocklyPromptTitle');
    const input = document.getElementById('blocklyPromptInput');
    const cancel = document.getElementById('blocklyPromptCancel');
    let pendingCallback = null;
    let returnEphemeralFocus = null;

    function finish(value) {
        const callback = pendingCallback;
        pendingCallback = null;
        if (dialog.open) dialog.close();
        const releaseFocus = returnEphemeralFocus;
        returnEphemeralFocus = null;
        if (releaseFocus) {
            try { releaseFocus(); }
            catch (error) { console.warn('Không trả lại focus cho Blockly:', error); }
        }
        if (callback) callback(value);
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        finish(input.value);
    });
    cancel.addEventListener('click', () => finish(null));
    dialog.addEventListener('cancel', event => {
        event.preventDefault();
        finish(null);
    });

    Blockly.dialog.setPrompt((message, defaultValue, callback) => {
        if (pendingCallback) finish(null);
        title.textContent = message || 'Đặt tên';
        input.value = defaultValue || '';

        if (typeof dialog.showModal !== 'function') {
            callback(window.prompt(message, defaultValue || ''));
            return;
        }

        pendingCallback = callback;
        try {
            dialog.showModal();
        } catch (error) {
            pendingCallback = null;
            console.warn('Không mở được hộp thoại Blockly:', error);
            callback(window.prompt(message, defaultValue || ''));
            return;
        }

        try {
            const focusManager = Blockly.FocusManager?.getFocusManager?.();
            if (focusManager?.takeEphemeralFocus && !focusManager.ephemeralFocusTaken?.()) {
                returnEphemeralFocus = focusManager.takeEphemeralFocus(input);
            }
        } catch (error) {
            console.warn('Không đồng bộ được focus với Blockly:', error);
        }
        input.focus();
        input.select();
    });
}

setupBlocklyPrompt();

let client = null;
let codeEditor = null;
let currentDeviceKey = 'robot';
let currentDeviceMode = 'robot';
let connectedTarget = null;
let settingsUnlocked = false;
let suppressWorkspaceEvents = false;
let currentProjectHandle = null;
let currentProjectName = null;

const deviceIds = {};
const workspaceSnapshots = {};

let brokerSettings = loadBrokerSettings();

function loadBrokerSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem('mobistemBrokerSettings') || 'null');
        if (saved && saved.host && saved.port && saved.user && saved.jsonKey) {
            return { ...DEFAULT_BROKER_SETTINGS, ...saved };
        }
    } catch (e) {
        console.warn('Không đọc được cấu hình MQTT đã lưu:', e);
    }
    return { ...DEFAULT_BROKER_SETTINGS };
}

function applyBrokerSettingsToForm() {
    document.getElementById('host').value = brokerSettings.host;
    document.getElementById('port').value = brokerSettings.port;
    document.getElementById('user').value = brokerSettings.user;
    document.getElementById('pass').value = brokerSettings.pass;
    document.getElementById('jsonKey').value = brokerSettings.jsonKey;
}

function getDeviceDefinition(key = currentDeviceKey) {
    return DEVICE_CATALOG.find(item => item.key === key) || DEVICE_CATALOG[0];
}

function snapshotCurrentWorkspace() {
    try {
        const xml = Blockly.Xml.workspaceToDom(workspace);
        workspaceSnapshots[currentDeviceKey] = Blockly.Xml.domToText(xml);
    } catch (e) {
        console.warn('Không lưu được workspace tạm:', e);
    }
}

function restoreWorkspace(deviceKey) {
    const device = getDeviceDefinition(deviceKey);
    suppressWorkspaceEvents = true;
    try {
        workspace.clear();
        workspace.updateToolbox(buildToolbox(device.toolboxMode));

        const snapshot = workspaceSnapshots[deviceKey];
        if (snapshot) {
            const xml = Blockly.utils.xml.textToDom(snapshot);
            Blockly.Xml.domToWorkspace(xml, workspace);
        }
    } finally {
        suppressWorkspaceEvents = false;
    }

    refreshGeneratedCode();
    setTimeout(() => {
        Blockly.svgResize(workspace);
    }, 60);
}

function refreshGeneratedCode() {
    const code = pyGen.workspaceToCode(workspace);
    if (codeEditor) codeEditor.setValue(code);
}

function renderDeviceCatalog() {
    const container = document.getElementById('deviceCatalogList');
    if (!container) return;

    const groups = [...new Set(DEVICE_CATALOG.map(item => item.group))];
    container.innerHTML = groups.map(group => {
        const items = DEVICE_CATALOG.filter(item => item.group === group);
        return `
            <section class="device-catalog-group">
                <h4>${group}</h4>
                <div class="device-catalog-grid">
                    ${items.map(item => `
                        <button type="button"
                            class="device-catalog-card ${item.key === currentDeviceKey ? 'selected' : ''}"
                            onclick="selectDeviceCatalogItem('${item.key}')">
                            <span class="device-catalog-card-icon"><i class="${item.icon}"></i></span>
                            <span class="device-catalog-card-copy">
                                <strong>${item.name}</strong>
                                <small>${item.description}</small>
                            </span>
                            <span class="device-catalog-check"><i class="fa-solid fa-check"></i></span>
                        </button>
                    `).join('')}
                </div>
            </section>
        `;
    }).join('');
}

function openDevicePicker() {
    renderDeviceCatalog();
    document.getElementById('devicePickerOverlay').classList.add('open');
}

function closeDevicePicker() {
    document.getElementById('devicePickerOverlay').classList.remove('open');
}

function selectDeviceCatalogItem(deviceKey) {
    const nextDevice = getDeviceDefinition(deviceKey);
    const input = document.getElementById('deviceIdInput');

    deviceIds[currentDeviceKey] = input.value.trim();

    if (deviceKey !== currentDeviceKey) {
        snapshotCurrentWorkspace();
        currentDeviceKey = deviceKey;
        currentDeviceMode = nextDevice.toolboxMode;
        restoreWorkspace(deviceKey);
        currentProjectHandle = null;
        currentProjectName = null;
    }

    input.value = deviceIds[deviceKey] || '';

    document.getElementById('devicePickerLabel').textContent = nextDevice.name;
    document.getElementById('devicePickerIcon').innerHTML = '<i class="' + nextDevice.icon + '"></i>';
    document.getElementById('workspaceTitle').textContent = 'Lập trình ' + nextDevice.name;
    document.getElementById('workspaceSubtitle').textContent = 'Kéo thả khối lệnh dành riêng cho ' + nextDevice.name;
    document.getElementById('workspaceBadgeText').textContent = nextDevice.name + ' Workspace';
    document.getElementById('selectedDeviceIcon').className = nextDevice.icon;

    updateSelectedDeviceStatus();
    closeDevicePicker();

    refreshConnectionDisplay();
}

function updateSelectedDeviceStatus() {
    const id = document.getElementById('deviceIdInput').value.trim();
    deviceIds[currentDeviceKey] = id;
    const device = getDeviceDefinition();
    document.getElementById('selectedDeviceText').textContent =
        id ? device.name + ' · ' + id : device.name + ' · Chưa nhập ID';
}

function isMqttConnected() {
    return !!(
        client &&
        typeof client.isConnected === 'function' &&
        client.isConnected()
    );
}

function updateConnectButtonState(state = null) {
    const button = document.getElementById('deviceConnectBtn');
    const icon = document.getElementById('deviceConnectBtnIcon');
    const text = document.getElementById('deviceConnectBtnText');
    if (!button || !icon || !text) return;

    button.classList.remove('connecting', 'connected');

    if (isMqttConnected() && connectedTarget) {
        button.classList.add('connected');
        icon.className = 'fa-solid fa-link-slash';
        text.textContent = 'Ngắt kết nối';
        button.title = 'Ngắt kết nối thiết bị hiện tại';
        return;
    }

    if (state === 'connecting') {
        button.classList.add('connecting');
        icon.className = 'fa-solid fa-spinner fa-spin';
        text.textContent = 'Đang kết nối...';
        button.title = 'Đang kết nối tới thiết bị';
        return;
    }

    icon.className = 'fa-solid fa-link';
    text.textContent = 'Kết nối thiết bị';
    button.title = 'Kết nối tới ID thiết bị';
}

function setConnectionStatus(text, state = 'offline') {
    document.getElementById('connectionStatusText').textContent = text;
    const dot = document.getElementById('connectionStatusDot');
    dot.className = 'connection-status-dot ' + state;
    updateConnectButtonState(state);
}

function disconnectCurrentDevice() {
    const oldTarget = connectedTarget;

    try {
        if (isMqttConnected()) {
            client.disconnect();
        }
    } catch (e) {
        console.warn('Không thể ngắt kết nối MQTT:', e);
    }

    client = null;
    connectedTarget = null;
    setConnectionStatus('Chưa kết nối', 'offline');

    if (oldTarget) {
        console.info('Đã ngắt kết nối thiết bị:', oldTarget.id);
    }
}

function refreshConnectionDisplay() {
    if (isMqttConnected() && connectedTarget) {
        const connectedDevice = getDeviceDefinition(connectedTarget.deviceKey);
        setConnectionStatus(
            connectedDevice.name + ' · ' + connectedTarget.id,
            'online'
        );
        return;
    }

    setConnectionStatus('Chưa kết nối', 'offline');
}

function validateDeviceId(id) {
    if (!id) return 'Vui lòng nhập ID thiết bị.';
    if (id.length > 64) return 'ID thiết bị quá dài.';
    if (/[+#]/.test(id)) return 'ID thiết bị không được chứa ký tự + hoặc #.';
    if (/\s/.test(id)) return 'ID thiết bị không được chứa khoảng trắng.';
    return null;
}

function connectSelectedDevice() {
    // Nút hoạt động như switch: nếu đang kết nối thì bấm để ngắt.
    if (isMqttConnected() && connectedTarget) {
        disconnectCurrentDevice();
        return;
    }

    const id = document.getElementById('deviceIdInput').value.trim();
    const error = validateDeviceId(id);
    if (error) {
        alert(error);
        document.getElementById('deviceIdInput').focus();
        return;
    }

    // Dọn phiên MQTT còn sót nếu có trước khi tạo kết nối mới.
    if (isMqttConnected()) {
        try {
            client.disconnect();
        } catch (e) {
            console.warn('Không thể đóng phiên MQTT cũ:', e);
        }
        client = null;
    }

    deviceIds[currentDeviceKey] = id;
    updateSelectedDeviceStatus();
    setConnectionStatus('Đang kết nối...', 'connecting');
    connectBroker(id);
}

function connectBroker(deviceId) {
    try {
        client = new Paho.MQTT.Client(
            brokerSettings.host,
            Number(brokerSettings.port),
            'MobiSTEM_' + Math.random().toString(16).slice(2, 10)
        );
    } catch (e) {
        setConnectionStatus('Lỗi cấu hình máy chủ', 'error');
        alert('Không thể tạo kết nối MQTT: ' + e.message);
        return;
    }

    client.onConnectionLost = () => {
        connectedTarget = null;
        setConnectionStatus('Mất kết nối', 'error');
    };

    client.connect({
        timeout: 6,
        useSSL: true,
        userName: brokerSettings.user,
        password: brokerSettings.pass,
        cleanSession: true,
        onSuccess: () => activateConnectedTarget(deviceId),
        onFailure: () => {
            connectedTarget = null;
            setConnectionStatus('Kết nối thất bại', 'error');
        }
    });
}

function activateConnectedTarget(deviceId) {
    const device = getDeviceDefinition();
    connectedTarget = {
        deviceKey: currentDeviceKey,
        toolboxMode: currentDeviceMode,
        id: deviceId
    };

    setConnectionStatus(device.name + ' · ' + deviceId, 'online');
}

function ensureActiveTarget() {
    const id = document.getElementById('deviceIdInput').value.trim();
    if (!client || !client.isConnected()) {
        alert('⚠️ Thiết bị chưa được kết nối. Hãy bấm "Kết nối thiết bị" trước.');
        return false;
    }

    if (!connectedTarget ||
        connectedTarget.deviceKey !== currentDeviceKey ||
        connectedTarget.id !== id) {
        alert('⚠️ ID hoặc loại thiết bị đã thay đổi. Hãy bấm "Kết nối thiết bị" lại.');
        return false;
    }
    return true;
}

function sendData() {
    if (!ensureActiveTarget()) return;

    const code = codeEditor.getValue();
    if (!code.trim()) {
        alert('Không có code để nạp!');
        return;
    }

    const payload = {};
    payload[brokerSettings.jsonKey || 'main'] = code;

    try {
        const msg = new Paho.MQTT.Message(JSON.stringify(payload));
        msg.destinationName = connectedTarget.id;
        client.send(msg);
        alert('🚀 Đã nạp code tới ' + connectedTarget.id + ' thành công!');
    } catch (e) {
        alert('Lỗi gửi: ' + e.message);
    }
}

function sendStopCommand() {
    if (!ensureActiveTarget()) return;

    const payload = { action: 'stop' };

    try {
        const msg = new Paho.MQTT.Message(JSON.stringify(payload));
        msg.destinationName = connectedTarget.id;
        client.send(msg);
        alert('🛑 Đã gửi lệnh dừng tới ' + connectedTarget.id + '.');
    } catch (e) {
        alert('Lỗi gửi: ' + e.message);
    }
}

window.onload = function () {
    codeEditor = CodeMirror.fromTextArea(document.getElementById('pythonCode'), {
        mode: 'python',
        theme: 'default',
        lineNumbers: true,
        indentUnit: 4
    });

    applyBrokerSettingsToForm();
    renderDeviceCatalog();
    selectDeviceCatalogItem('robot');

    const idInput = document.getElementById('deviceIdInput');
    idInput.addEventListener('input', () => {
        updateSelectedDeviceStatus();
        // Việc sửa ID không tự ngắt phiên hiện tại. Nút vẫn hiện
        // "Ngắt kết nối" cho tới khi người dùng chủ động ngắt.
        refreshConnectionDisplay();
    });

    idInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') connectSelectedDevice();
    });

    workspace.addChangeListener(function (e) {
        if (suppressWorkspaceEvents || e.isUiEvent) return;
        refreshGeneratedCode();
    });

    refreshGeneratedCode();
};

// =========================================================
// GIAO DIỆN
// =========================================================

function toggleCodePanel() {
    document.getElementById('tab-blockly').classList.toggle('show-code');
    setTimeout(() => {
        Blockly.svgResize(workspace);
        if (codeEditor) codeEditor.refresh();
    }, 300);
}

function togglePassword() {
    const passInput = document.getElementById('pass');
    const toggleBtn = document.querySelector('.settings-show-pass');
    if (!passInput || !toggleBtn) return;

    const showing = passInput.type === 'text';
    passInput.type = showing ? 'password' : 'text';
    toggleBtn.textContent = showing ? 'HIỆN' : 'ẨN';
}

// =========================================================
// CÀI ĐẶT QUẢN TRỊ
// =========================================================

function openAdminLogin() {
    if (settingsUnlocked) {
        openMqttSettings();
        return;
    }

    document.getElementById('adminLoginError').hidden = true;
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminAuthOverlay').classList.add('open');
    setTimeout(() => document.getElementById('adminUsername').focus(), 50);
}

function closeAdminLogin() {
    document.getElementById('adminAuthOverlay').classList.remove('open');
}

function submitAdminLogin(event) {
    event.preventDefault();

    const user = document.getElementById('adminUsername').value;
    const pass = document.getElementById('adminPassword').value;

    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
        settingsUnlocked = true;
        closeAdminLogin();
        openMqttSettings();
        return;
    }

    document.getElementById('adminLoginError').hidden = false;
    document.getElementById('adminPassword').select();
}

function openMqttSettings() {
    applyBrokerSettingsToForm();
    document.getElementById('settingsSaveStatus').textContent = '';
    document.getElementById('mqttSettingsOverlay').classList.add('open');
}

function closeMqttSettings() {
    document.getElementById('mqttSettingsOverlay').classList.remove('open');
}

function saveBrokerSettings() {
    const next = {
        host: document.getElementById('host').value.trim(),
        port: Number(document.getElementById('port').value),
        user: document.getElementById('user').value.trim(),
        pass: document.getElementById('pass').value,
        jsonKey: document.getElementById('jsonKey').value.trim() || 'main'
    };

    if (!next.host || !next.port || next.port < 1 || next.port > 65535 || !next.user) {
        document.getElementById('settingsSaveStatus').textContent = 'Kiểm tra lại Host, Port và Username.';
        return;
    }

    brokerSettings = next;
    localStorage.setItem('mobistemBrokerSettings', JSON.stringify(brokerSettings));

    if (client && client.isConnected()) {
        try { client.disconnect(); } catch (e) { }
    }
    client = null;
    connectedTarget = null;
    setConnectionStatus('Chưa kết nối', 'offline');

    const status = document.getElementById('settingsSaveStatus');
    status.textContent = 'Đã lưu cấu hình.';
    setTimeout(closeMqttSettings, 650);
}

// =========================================================
// MATRIX 8x8
// =========================================================

let currentEditingBlock = null;
const gridDiv = document.getElementById('ledGrid');

for (let i = 0; i < 64; i++) {
    const cell = document.createElement('div');
    cell.className = 'led-cell';
    cell.onclick = function () {
        this.classList.toggle('on');
        updateHexPreview();
    };
    gridDiv.appendChild(cell);
}

function openMatrixEditor(block) {
    currentEditingBlock = block;
    parseHexToGrid(block.getFieldValue('HEX_ARRAY'));
    document.getElementById('matrixOverlay').style.display = 'flex';
}

function closeMatrixEditor() {
    document.getElementById('matrixOverlay').style.display = 'none';
    currentEditingBlock = null;
}

function clearMatrix() {
    document.querySelectorAll('.led-cell').forEach(c => c.classList.remove('on'));
    updateHexPreview();
}

function updateHexPreview() {
    const cells = document.querySelectorAll('.led-cell');
    const hexArr = [];

    for (let r = 0; r < 8; r++) {
        let byte = 0;
        for (let c = 0; c < 8; c++) {
            if (cells[r * 8 + c].classList.contains('on')) {
                byte |= (1 << (7 - c));
            }
        }
        hexArr.push('0x' + byte.toString(16).padStart(2, '0').toUpperCase());
    }

    const hexStr = '[' + hexArr.join(',') + ']';
    document.getElementById('matrixHexPreview').innerText = hexStr;
    return hexStr;
}

function saveMatrixEditor() {
    if (currentEditingBlock) {
        currentEditingBlock.setFieldValue(updateHexPreview(), 'HEX_ARRAY');
    }
    closeMatrixEditor();
}

function parseHexToGrid(hexStr) {
    clearMatrix();
    try {
        const cleanStr = hexStr.replace(/[\[\]]/g, '');
        const bytes = cleanStr.split(',').map(s => parseInt(s.trim(), 16));
        const cells = document.querySelectorAll('.led-cell');

        for (let r = 0; r < 8; r++) {
            const byte = isNaN(bytes[r]) ? 0 : bytes[r];
            for (let c = 0; c < 8; c++) {
                if ((byte & (1 << (7 - c))) !== 0) {
                    cells[r * 8 + c].classList.add('on');
                }
            }
        }
        updateHexPreview();
    } catch (e) { }
}

// =========================================================
// MENU TỆP TIN + LƯU / MỞ DỰ ÁN
// =========================================================

function toggleFileMenu(event) {
    event?.stopPropagation();
    const menu = document.getElementById('fileMenu');
    const button = document.getElementById('fileMenuButton');
    const open = !menu.classList.contains('open');

    closeFileMenu();
    if (open) {
        menu.classList.add('open');
        button.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
    }
}

function closeFileMenu() {
    const menu = document.getElementById('fileMenu');
    const button = document.getElementById('fileMenuButton');
    menu?.classList.remove('open');
    button?.classList.remove('active');
    button?.setAttribute('aria-expanded', 'false');
}

function getProjectXmlText() {
    const xml = Blockly.Xml.workspaceToDom(workspace);
    xml.setAttribute('data-mobistem-version', '2');
    xml.setAttribute('data-device-key', currentDeviceKey);
    xml.setAttribute('data-toolbox-mode', currentDeviceMode);

    const xmlText = Blockly.Xml.domToText(xml);
    workspaceSnapshots[currentDeviceKey] = xmlText;
    return xmlText;
}

async function applyProjectXmlText(xmlText, fileName = '') {
    const xml = Blockly.utils.xml.textToDom(xmlText);
    const projectDeviceKey = xml.getAttribute('data-device-key');

    if (projectDeviceKey && DEVICE_CATALOG.some(item => item.key === projectDeviceKey)) {
        selectDeviceCatalogItem(projectDeviceKey);
    }

    suppressWorkspaceEvents = true;
    try {
        workspace.clear();
        Blockly.Xml.domToWorkspace(xml, workspace);
    } finally {
        suppressWorkspaceEvents = false;
    }

    workspaceSnapshots[currentDeviceKey] = xmlText;
    currentProjectName = fileName || currentProjectName;
    refreshGeneratedCode();
    setTimeout(() => {
        Blockly.svgResize(workspace);
    }, 50);
}

function defaultProjectFileName() {
    const device = getDeviceDefinition();
    const safeName = device.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Za-z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'MobiSTEM';
    return 'Du_An_' + safeName + '.mobistem';
}

async function openProject() {
    closeFileMenu();

    if (window.showOpenFilePicker) {
        try {
            const [handle] = await window.showOpenFilePicker({
                multiple: false,
                types: [{
                    description: 'MobiSTEM Project',
                    accept: {
                        'application/xml': ['.mobistem', '.xml']
                    }
                }]
            });

            const file = await handle.getFile();
            const xmlText = await file.text();
            await applyProjectXmlText(xmlText, file.name);
            currentProjectHandle = handle;
            currentProjectName = file.name;
            return;
        } catch (e) {
            if (e.name === 'AbortError') return;
            console.warn('File System Access API không mở được file:', e);
        }
    }

    document.getElementById('fileInput').click();
}

async function writeProjectToHandle(handle, xmlText) {
    const writable = await handle.createWritable();
    await writable.write(xmlText);
    await writable.close();
}

async function saveProject() {
    closeFileMenu();
    const xmlText = getProjectXmlText();

    if (currentProjectHandle && currentProjectHandle.createWritable) {
        try {
            await writeProjectToHandle(currentProjectHandle, xmlText);
            currentProjectName = currentProjectHandle.name || currentProjectName;
            return;
        } catch (e) {
            console.warn('Không thể ghi vào file hiện tại:', e);
        }
    }

    await saveProjectAs();
}

async function saveProjectAs() {
    closeFileMenu();
    const xmlText = getProjectXmlText();
    const suggestedName = currentProjectName || defaultProjectFileName();

    if (window.showSaveFilePicker) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName,
                types: [{
                    description: 'MobiSTEM Project',
                    accept: {
                        'application/xml': ['.mobistem']
                    }
                }]
            });

            await writeProjectToHandle(handle, xmlText);
            currentProjectHandle = handle;
            currentProjectName = handle.name || suggestedName;
            return;
        } catch (e) {
            if (e.name === 'AbortError') return;
            console.warn('File System Access API không lưu được file:', e);
        }
    }

    let projectName = prompt(
        'Nhập tên dự án:',
        suggestedName.replace(/\.mobistem$/i, '')
    );
    if (projectName === null) return;

    projectName = projectName.trim() || 'Du_An_Khong_Ten';
    projectName = projectName.replace(/\.mobistem$/i, '');
    const fileName = projectName + '.mobistem';

    const blob = new Blob([xmlText], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    currentProjectHandle = null;
    currentProjectName = fileName;
}

async function loadProject(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const xmlText = await file.text();
        await applyProjectXmlText(xmlText, file.name);
        currentProjectHandle = null;
        currentProjectName = file.name;
    } catch (err) {
        alert('⚠️ File không đúng định dạng MobiSTEM!\n' + err);
    } finally {
        document.getElementById('fileInput').value = '';
    }
}

document.addEventListener('click', event => {
    if (!event.target.closest('.file-menu-wrap')) closeFileMenu();
});

document.addEventListener('keydown', event => {
    const ctrl = event.ctrlKey || event.metaKey;

    if (ctrl && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        openProject();
        return;
    }

    if (ctrl && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (event.shiftKey) saveProjectAs();
        else saveProject();
        return;
    }

    if (event.key !== 'Escape') return;
    closeFileMenu();
    closeDevicePicker();
    closeAdminLogin();
    closeMqttSettings();
});
