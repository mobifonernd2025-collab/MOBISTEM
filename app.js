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
            showTextPrompt({
                title: message || 'Đặt tên',
                message: 'Nhập tên ngắn gọn, dễ nhớ để dùng trong chương trình.',
                value: defaultValue || '',
                inputLabel: 'Tên',
                confirmText: 'Lưu tên'
            }).then(callback);
            return;
        }

        pendingCallback = callback;
        try {
            dialog.showModal();
        } catch (error) {
            pendingCallback = null;
            console.warn('Không mở được hộp thoại Blockly:', error);
            showTextPrompt({
                title: message || 'Đặt tên',
                message: 'Nhập tên ngắn gọn, dễ nhớ để dùng trong chương trình.',
                value: defaultValue || '',
                inputLabel: 'Tên',
                confirmText: 'Lưu tên'
            }).then(callback);
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
let projectDirty = false;
let baseDocumentTitle = document.title || 'MobiSTEM';
let lastConnectionText = 'Chưa kết nối';
let lastConnectionState = 'offline';
let recoveryDraftCache = null;
let recoveryDraftTimer = null;
let commandPaletteActiveIndex = 0;
let mobiDialogResolve = null;
let mobiDialogHasCancel = false;
let mobiDialogInputEnabled = false;
let mobiToastCounter = 0;

const RECOVERY_DRAFT_KEY = 'mobistemRecoveryDraftV1';
const RECOVERY_DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// SmartHome device-presence state. MQTT broker connectivity alone is not
// considered proof that the physical SmartHome is online.
let verificationTarget = null;
let pendingPingRequestId = null;
let pendingPingTimer = null;
let heartbeatWatchTimer = null;
let lastHeartbeatAt = 0;

const DEVICE_PING_TIMEOUT_MS = 5000;
const DEVICE_HEARTBEAT_STALE_MS = 13000;
const DEVICE_HEARTBEAT_CHECK_MS = 2000;

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

const MOBI_DIALOG_TONES = {
    info: {
        icon: 'fa-solid fa-circle-info',
        eyebrow: 'MOBISTEM',
        confirmText: 'Đã hiểu'
    },
    success: {
        icon: 'fa-solid fa-circle-check',
        eyebrow: 'HOÀN TẤT',
        confirmText: 'Đóng'
    },
    warning: {
        icon: 'fa-solid fa-triangle-exclamation',
        eyebrow: 'CẦN XÁC NHẬN',
        confirmText: 'Tiếp tục'
    },
    error: {
        icon: 'fa-solid fa-circle-exclamation',
        eyebrow: 'CÓ LỖI',
        confirmText: 'Đã hiểu'
    },
    question: {
        icon: 'fa-solid fa-circle-question',
        eyebrow: 'XÁC NHẬN',
        confirmText: 'Đồng ý'
    }
};

function openMobiDialog(options = {}) {
    const overlay = document.getElementById('mobiDialogOverlay');
    const card = document.getElementById('mobiDialogForm');
    const icon = document.getElementById('mobiDialogIcon');
    const eyebrow = document.getElementById('mobiDialogEyebrow');
    const title = document.getElementById('mobiDialogTitle');
    const message = document.getElementById('mobiDialogMessage');
    const details = document.getElementById('mobiDialogDetails');
    const inputWrap = document.getElementById('mobiDialogInputWrap');
    const inputLabel = document.getElementById('mobiDialogInputLabel');
    const input = document.getElementById('mobiDialogInput');
    const cancel = document.getElementById('mobiDialogCancel');
    const confirm = document.getElementById('mobiDialogConfirm');
    const close = document.getElementById('mobiDialogClose');

    if (!overlay || !card) {
        return Promise.resolve({ confirmed: false, value: null });
    }

    closeCommandPalette();
    closeFileMenu();

    if (mobiDialogResolve) {
        const previousResolve = mobiDialogResolve;
        mobiDialogResolve = null;
        previousResolve({ confirmed: false, value: null });
    }

    const tone = options.tone || 'info';
    const toneConfig = MOBI_DIALOG_TONES[tone] || MOBI_DIALOG_TONES.info;

    card.dataset.tone = tone;
    icon.className = options.icon || toneConfig.icon;
    eyebrow.textContent = options.eyebrow || toneConfig.eyebrow;
    title.textContent = options.title || 'Thông báo';
    message.textContent = options.message || '';

    if (options.details) {
        details.textContent = options.details;
        details.hidden = false;
    } else {
        details.textContent = '';
        details.hidden = true;
    }

    mobiDialogInputEnabled = Object.prototype.hasOwnProperty.call(options, 'inputValue');
    inputWrap.hidden = !mobiDialogInputEnabled;
    if (mobiDialogInputEnabled) {
        inputLabel.textContent = options.inputLabel || 'Nhập nội dung';
        input.value = options.inputValue || '';
        input.placeholder = options.inputPlaceholder || '';
    }

    mobiDialogHasCancel = !!options.cancelText;
    cancel.hidden = !mobiDialogHasCancel;
    close.hidden = options.hideClose === true;
    cancel.textContent = options.cancelText || 'Quay lại';
    confirm.textContent = options.confirmText || toneConfig.confirmText;

    overlay.classList.add('open');
    document.body.classList.add('mobi-modal-open');

    setTimeout(() => {
        if (mobiDialogInputEnabled) {
            input.focus();
            input.select();
        } else {
            confirm.focus();
        }
    }, 30);

    return new Promise(resolve => {
        mobiDialogResolve = resolve;
    });
}

function closeMobiDialog(confirmed = false) {
    const overlay = document.getElementById('mobiDialogOverlay');
    if (!overlay || !overlay.classList.contains('open')) return;

    const input = document.getElementById('mobiDialogInput');
    const value = mobiDialogInputEnabled ? input.value : null;
    const resolve = mobiDialogResolve;

    mobiDialogResolve = null;
    mobiDialogInputEnabled = false;
    mobiDialogHasCancel = false;
    overlay.classList.remove('open');
    document.body.classList.remove('mobi-modal-open');

    if (resolve) {
        resolve({ confirmed: !!confirmed, value });
    }
}

function submitMobiDialog(event) {
    event.preventDefault();
    closeMobiDialog(true);
}

function mobiDialogBackdropClick(event) {
    if (event.target?.id === 'mobiDialogOverlay' && mobiDialogHasCancel) {
        closeMobiDialog(false);
    }
}

async function showConfirmDialog(options = {}) {
    const result = await openMobiDialog({
        tone: options.tone || 'warning',
        title: options.title || 'Xác nhận thao tác',
        message: options.message || '',
        details: options.details || '',
        eyebrow: options.eyebrow,
        icon: options.icon,
        confirmText: options.confirmText || 'Tiếp tục',
        cancelText: options.cancelText || 'Quay lại'
    });
    return result.confirmed;
}

async function showMessageDialog(options = {}) {
    await openMobiDialog({
        tone: options.tone || 'info',
        title: options.title || 'Thông báo',
        message: options.message || '',
        details: options.details || '',
        eyebrow: options.eyebrow,
        icon: options.icon,
        confirmText: options.confirmText || 'Đã hiểu',
        hideClose: false
    });
}

async function showTextPrompt(options = {}) {
    const result = await openMobiDialog({
        tone: options.tone || 'info',
        title: options.title || 'Nhập nội dung',
        message: options.message || '',
        eyebrow: options.eyebrow || 'DỰ ÁN MOBISTEM',
        icon: options.icon || 'fa-regular fa-file-code',
        confirmText: options.confirmText || 'Xác nhận',
        cancelText: options.cancelText || 'Hủy',
        inputValue: options.value || '',
        inputLabel: options.inputLabel || 'Tên',
        inputPlaceholder: options.placeholder || ''
    });

    if (!result.confirmed) return null;
    return String(result.value || '');
}

const MOBI_TOAST_ICONS = {
    success: 'fa-solid fa-circle-check',
    warning: 'fa-solid fa-triangle-exclamation',
    error: 'fa-solid fa-circle-exclamation',
    info: 'fa-solid fa-circle-info',
    device: 'fa-solid fa-microchip'
};

function dismissToast(toast) {
    if (!toast || toast.classList.contains('leaving')) return;
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 220);
}

function showToast(type, title, message, duration = 3600) {
    const stack = document.getElementById('mobiToastStack');
    if (!stack) return null;

    const toast = document.createElement('article');
    const toastId = 'mobiToast_' + (++mobiToastCounter);
    toast.id = toastId;
    toast.className = 'mobi-toast ' + (type || 'info');

    const iconWrap = document.createElement('span');
    iconWrap.className = 'mobi-toast-icon';
    const icon = document.createElement('i');
    icon.className = MOBI_TOAST_ICONS[type] || MOBI_TOAST_ICONS.info;
    iconWrap.appendChild(icon);

    const copy = document.createElement('div');
    copy.className = 'mobi-toast-copy';
    const strong = document.createElement('strong');
    strong.textContent = title || 'MobiSTEM';
    const small = document.createElement('small');
    small.textContent = message || '';
    copy.appendChild(strong);
    copy.appendChild(small);

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'mobi-toast-close';
    close.setAttribute('aria-label', 'Đóng thông báo');
    close.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    close.addEventListener('click', () => dismissToast(toast));

    const progress = document.createElement('span');
    progress.className = 'mobi-toast-progress';
    progress.style.animationDuration = Math.max(1200, duration) + 'ms';

    toast.appendChild(iconWrap);
    toast.appendChild(copy);
    toast.appendChild(close);
    toast.appendChild(progress);
    stack.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('visible'));

    if (duration > 0) {
        setTimeout(() => dismissToast(toast), duration);
    }

    return toast;
}

function projectDisplayName() {
    return currentProjectName || 'Dự án mới';
}

function updateProjectUi() {
    const label = document.getElementById('fileMenuLabel');
    if (label) label.textContent = projectDirty ? 'Tệp tin *' : 'Tệp tin';

    const button = document.getElementById('fileMenuButton');
    if (button) {
        button.title = projectDisplayName() + (projectDirty ? ' · Chưa lưu' : '');
    }

    document.title = (projectDirty ? '* ' : '') + baseDocumentTitle;
    updateIdeStatusBar();
}

function setProjectDirty(dirty) {
    projectDirty = !!dirty;
    updateProjectUi();
}

function updateIdeStatusBar() {
    const project = document.getElementById('ideStatusProject');
    const dirty = document.getElementById('ideStatusDirty');
    const device = document.getElementById('ideStatusDevice');
    const connection = document.getElementById('ideStatusConnection');
    const connectionDot = document.getElementById('ideStatusConnectionDot');

    if (project) project.textContent = projectDisplayName();
    if (dirty) dirty.hidden = !projectDirty;

    if (device) {
        const selected = getDeviceDefinition();
        const id = document.getElementById('deviceIdInput')?.value.trim();
        device.textContent = selected.name + (id ? ' · ' + id : '');
    }

    if (connection) connection.textContent = lastConnectionText;
    if (connectionDot) connectionDot.className = 'ide-mini-dot ' + lastConnectionState;
}

function updateWorkspaceStats(code = null) {
    const blockCount = workspace ? workspace.getAllBlocks(false).length : 0;
    const generated = code === null ? (codeEditor?.getValue() || '') : code;
    const lineCount = generated.trim() ? generated.split(/\r?\n/).length : 0;

    const blocks = document.getElementById('ideStatusBlocks');
    const lines = document.getElementById('ideStatusLines');
    if (blocks) blocks.textContent = blockCount + ' khối';
    if (lines) lines.textContent = lineCount + ' dòng';
}

function undoWorkspace() {
    try {
        workspace.undo(false);
    } catch (error) {
        console.warn('Undo không khả dụng:', error);
    }
}

function redoWorkspace() {
    try {
        workspace.undo(true);
    } catch (error) {
        console.warn('Redo không khả dụng:', error);
    }
}

function fitWorkspace() {
    try {
        workspace.zoomToFit();
        Blockly.svgResize(workspace);
    } catch (error) {
        console.warn('Không thể vừa khung workspace:', error);
    }
}

async function confirmDiscardUnsavedChanges(actionText = 'Thao tác này') {
    if (!projectDirty) return true;

    return showConfirmDialog({
        tone: 'warning',
        eyebrow: 'DỰ ÁN CHƯA LƯU',
        icon: 'fa-solid fa-triangle-exclamation',
        title: 'Bạn có thay đổi chưa được lưu',
        message: 'Dự án "' + projectDisplayName() + '" vẫn còn thay đổi mới.',
        details: actionText + ' sẽ bỏ phần chưa lưu. Hãy lưu trước nếu bạn muốn giữ lại công việc hiện tại.',
        confirmText: 'Bỏ thay đổi & tiếp tục',
        cancelText: 'Quay lại'
    });
}

function saveRecoveryDraftNow() {
    if (!projectDirty) return;

    try {
        const xmlText = getProjectXmlText();
        const draft = {
            version: 1,
            timestamp: Date.now(),
            deviceKey: currentDeviceKey,
            projectName: currentProjectName || '',
            xmlText
        };
        localStorage.setItem(RECOVERY_DRAFT_KEY, JSON.stringify(draft));
        recoveryDraftCache = draft;
    } catch (error) {
        console.warn('Không lưu được bản nháp khôi phục:', error);
    }
}

function scheduleRecoveryDraft() {
    if (recoveryDraftTimer) clearTimeout(recoveryDraftTimer);
    recoveryDraftTimer = setTimeout(() => {
        recoveryDraftTimer = null;
        saveRecoveryDraftNow();
    }, 700);
}

function clearRecoveryDraft() {
    if (recoveryDraftTimer) {
        clearTimeout(recoveryDraftTimer);
        recoveryDraftTimer = null;
    }

    recoveryDraftCache = null;
    try {
        localStorage.removeItem(RECOVERY_DRAFT_KEY);
    } catch (error) {
        console.warn('Không xóa được bản nháp:', error);
    }

    const bar = document.getElementById('draftRecoveryBar');
    if (bar) bar.hidden = true;
}

function readRecoveryDraft() {
    try {
        const raw = localStorage.getItem(RECOVERY_DRAFT_KEY);
        if (!raw) return null;

        const draft = JSON.parse(raw);
        if (!draft || !draft.xmlText || !draft.timestamp) return null;

        if (Date.now() - Number(draft.timestamp) > RECOVERY_DRAFT_MAX_AGE_MS) {
            localStorage.removeItem(RECOVERY_DRAFT_KEY);
            return null;
        }

        return draft;
    } catch (error) {
        console.warn('Không đọc được bản nháp khôi phục:', error);
        return null;
    }
}

function showRecoveryDraftIfAvailable() {
    const draft = readRecoveryDraft();
    if (!draft) return;

    recoveryDraftCache = draft;
    const bar = document.getElementById('draftRecoveryBar');
    const text = document.getElementById('draftRecoveryText');
    if (!bar || !text) return;

    const when = new Date(Number(draft.timestamp));
    const device = getDeviceDefinition(draft.deviceKey);
    text.textContent =
        (draft.projectName || 'Dự án chưa đặt tên') + ' · ' +
        device.name + ' · ' + when.toLocaleString('vi-VN');
    bar.hidden = false;
}

async function restoreRecoveryDraft() {
    const draft = recoveryDraftCache || readRecoveryDraft();
    if (!draft) return;

    try {
        if (draft.deviceKey && DEVICE_CATALOG.some(item => item.key === draft.deviceKey)) {
            await selectDeviceCatalogItem(draft.deviceKey, { skipUnsavedCheck: true, silent: true });
        }

        currentProjectHandle = null;
        currentProjectName = draft.projectName || null;
        await applyProjectXmlText(draft.xmlText, currentProjectName || '');
        setProjectDirty(true);

        const bar = document.getElementById('draftRecoveryBar');
        if (bar) bar.hidden = true;
        scheduleRecoveryDraft();
        showToast('success', 'Đã khôi phục bản nháp', 'Bạn có thể tiếp tục lập trình từ phiên trước.', 3200);
    } catch (error) {
        await showMessageDialog({
            tone: 'error',
            title: 'Không thể khôi phục bản nháp',
            message: 'MobiSTEM không đọc được dữ liệu của phiên làm việc trước.',
            details: String(error)
        });
    }
}

function discardRecoveryDraft() {
    clearRecoveryDraft();
}

function paletteNormalize(text) {
    return String(text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function getIdeCommands() {
    const connected = isMqttConnected() && !!connectedTarget;

    return [
        { id: 'new', category: 'Tệp', label: 'Dự án mới', hint: 'Tạo workspace trắng', shortcut: 'Ctrl+N', icon: 'fa-regular fa-file', run: () => newProject() },
        { id: 'open', category: 'Tệp', label: 'Mở dự án', hint: 'Mở tệp .mobistem', shortcut: 'Ctrl+O', icon: 'fa-regular fa-folder-open', run: () => openProject() },
        { id: 'save', category: 'Tệp', label: 'Lưu dự án', hint: 'Lưu vào tệp hiện tại', shortcut: 'Ctrl+S', icon: 'fa-regular fa-floppy-disk', run: () => saveProject() },
        { id: 'saveas', category: 'Tệp', label: 'Lưu dưới dạng', hint: 'Tạo tệp dự án mới', shortcut: 'Ctrl+Shift+S', icon: 'fa-solid fa-file-export', run: () => saveProjectAs() },
        { id: 'undo', category: 'Sửa', label: 'Hoàn tác', hint: 'Undo thay đổi Blockly', shortcut: '', icon: 'fa-solid fa-rotate-left', run: () => undoWorkspace() },
        { id: 'redo', category: 'Sửa', label: 'Làm lại', hint: 'Redo thay đổi Blockly', shortcut: '', icon: 'fa-solid fa-rotate-right', run: () => redoWorkspace() },
        { id: 'fit', category: 'Hiển thị', label: 'Vừa khung Blockly', hint: 'Hiển thị toàn bộ chương trình', shortcut: '', icon: 'fa-solid fa-maximize', run: () => fitWorkspace() },
        { id: 'code', category: 'Hiển thị', label: 'Ẩn / hiện mã Python', hint: 'Chuyển chế độ xem Code', shortcut: '', icon: 'fa-solid fa-code', run: () => toggleCodePanel() },
        { id: 'robot', category: 'Thiết bị', label: 'Chọn Robot', hint: 'Chuyển sang workspace Robot', shortcut: '', icon: 'fa-solid fa-robot', run: () => selectDeviceCatalogItem('robot') },
        { id: 'smarthome', category: 'Thiết bị', label: 'Chọn Nhà thông minh', hint: 'Chuyển sang workspace SmartHome', shortcut: '', icon: 'fa-solid fa-house-signal', run: () => selectDeviceCatalogItem('smarthome') },
        { id: 'connect', category: 'Thiết bị', label: connected ? 'Ngắt kết nối thiết bị' : 'Kết nối thiết bị', hint: connected && connectedTarget ? connectedTarget.id : 'Kết nối theo ID đang nhập', shortcut: '', icon: connected ? 'fa-solid fa-link-slash' : 'fa-solid fa-link', run: () => connectSelectedDevice() },
        { id: 'upload', category: 'Chạy', label: 'Nạp code xuống thiết bị', hint: 'Gửi chương trình hiện tại', shortcut: '', icon: 'fa-solid fa-play', run: () => sendData() },
        { id: 'stop', category: 'Chạy', label: 'Dừng chương trình', hint: 'Dừng code đang chạy', shortcut: '', icon: 'fa-solid fa-stop', run: () => sendStopCommand() },
        { id: 'settings', category: 'Cấu hình', label: 'Cài đặt MQTT', hint: 'Máy chủ, cổng và tài khoản', shortcut: '', icon: 'fa-solid fa-gear', run: () => openAdminLogin() }
    ];
}

function commandPaletteCommands(query = '') {
    const normalized = paletteNormalize(query);
    if (!normalized) return getIdeCommands();

    return getIdeCommands().filter(command => {
        const haystack = paletteNormalize(
            command.category + ' ' + command.label + ' ' + command.hint
        );
        return haystack.includes(normalized);
    });
}

function renderCommandPalette(query = '') {
    const list = document.getElementById('commandPaletteList');
    if (!list) return;

    const commands = commandPaletteCommands(query);
    commandPaletteActiveIndex = Math.max(
        0,
        Math.min(commandPaletteActiveIndex, Math.max(0, commands.length - 1))
    );

    if (!commands.length) {
        list.innerHTML = '<div class="command-palette-empty">Không tìm thấy lệnh phù hợp</div>';
        return;
    }

    list.innerHTML = commands.map((command, index) => {
        const active = index === commandPaletteActiveIndex ? ' active' : '';
        const shortcut = command.shortcut
            ? '<kbd>' + command.shortcut + '</kbd>'
            : '';

        return '<button type="button" class="command-palette-item' + active + '"' +
            ' data-command-id="' + command.id + '"' +
            ' onmouseenter="commandPaletteActiveIndex=' + index +
            '; renderCommandPalette(document.getElementById(\'commandPaletteInput\').value)"' +
            ' onclick="runCommandPaletteItem(\'' + command.id + '\')">' +
            '<span class="command-palette-icon"><i class="' + command.icon + '"></i></span>' +
            '<span class="command-palette-copy">' +
            '<strong>' + command.label + '</strong>' +
            '<small>' + command.category + ' · ' + command.hint + '</small>' +
            '</span>' + shortcut + '</button>';
    }).join('');
}

function openCommandPalette() {
    const overlay = document.getElementById('commandPaletteOverlay');
    const input = document.getElementById('commandPaletteInput');
    if (!overlay || !input) return;

    closeFileMenu();
    commandPaletteActiveIndex = 0;
    overlay.classList.add('open');
    input.value = '';
    renderCommandPalette('');
    setTimeout(() => input.focus(), 20);
}

function closeCommandPalette() {
    document.getElementById('commandPaletteOverlay')?.classList.remove('open');
}

function commandPaletteBackdropClick(event) {
    if (event.target?.id === 'commandPaletteOverlay') {
        closeCommandPalette();
    }
}

function runCommandPaletteItem(id) {
    const command = getIdeCommands().find(item => item.id === id);
    if (!command) return;

    closeCommandPalette();
    command.run();
}

function commandPaletteKeydown(event) {
    const commands = commandPaletteCommands(event.currentTarget.value);

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        commandPaletteActiveIndex = Math.min(
            commandPaletteActiveIndex + 1,
            Math.max(0, commands.length - 1)
        );
        renderCommandPalette(event.currentTarget.value);
        return;
    }

    if (event.key === 'ArrowUp') {
        event.preventDefault();
        commandPaletteActiveIndex = Math.max(0, commandPaletteActiveIndex - 1);
        renderCommandPalette(event.currentTarget.value);
        return;
    }

    if (event.key === 'Enter') {
        event.preventDefault();
        const command = commands[commandPaletteActiveIndex];
        if (command) runCommandPaletteItem(command.id);
        return;
    }

    if (event.key === 'Escape') {
        event.preventDefault();
        closeCommandPalette();
    }
}

function clearWorkspaceForNewSession() {
    suppressWorkspaceEvents = true;
    try {
        workspace.clear();
        workspace.updateToolbox(buildToolbox(currentDeviceMode));
    } finally {
        suppressWorkspaceEvents = false;
    }
    workspaceSnapshots[currentDeviceKey] = '';
    refreshGeneratedCode();
    setTimeout(() => Blockly.svgResize(workspace), 50);
}

function resetProjectState() {
    currentProjectHandle = null;
    currentProjectName = null;
    setProjectDirty(false);
}

async function newProject() {
    closeFileMenu();
    if (!await confirmDiscardUnsavedChanges('Tạo dự án mới')) return false;

    clearRecoveryDraft();
    resetProjectState();
    clearWorkspaceForNewSession();
    showToast('success', 'Dự án mới', 'Workspace đã sẵn sàng cho chương trình mới.', 2600);
    return true;
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
    updateWorkspaceStats(code);
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

async function selectDeviceCatalogItem(deviceKey, options = {}) {
    const nextDevice = getDeviceDefinition(deviceKey);
    const input = document.getElementById('deviceIdInput');
    const switchingDevice = deviceKey !== currentDeviceKey;

    if (switchingDevice && !options.skipUnsavedCheck &&
        !await confirmDiscardUnsavedChanges('Đổi loại thiết bị')) {
        renderDeviceCatalog();
        return false;
    }

    if (switchingDevice) {
        // A device switch is a fresh user session. Never carry MQTT, project,
        // workspace or device-ID state across Robot <-> SmartHome.
        disconnectCurrentDevice();
        currentDeviceKey = deviceKey;
        currentDeviceMode = nextDevice.toolboxMode;

        Object.keys(deviceIds).forEach(key => delete deviceIds[key]);
        Object.keys(workspaceSnapshots).forEach(key => delete workspaceSnapshots[key]);
        input.value = '';

        clearRecoveryDraft();
        resetProjectState();
        clearWorkspaceForNewSession();

        document.getElementById('tab-blockly')?.classList.remove('show-code');
        closeFileMenu();
        closeAdminLogin();
        closeMqttSettings();
    }

    document.getElementById('devicePickerLabel').textContent = nextDevice.name;
    document.getElementById('devicePickerIcon').innerHTML = '<i class="' + nextDevice.icon + '"></i>';
    document.getElementById('workspaceTitle').textContent = 'Lập trình ' + nextDevice.name;
    document.getElementById('workspaceSubtitle').textContent = 'Kéo thả khối lệnh dành riêng cho ' + nextDevice.name;
    document.getElementById('workspaceBadgeText').textContent = nextDevice.name + ' Workspace';
    document.getElementById('selectedDeviceIcon').className = nextDevice.icon;

    updateSelectedDeviceStatus();
    closeDevicePicker();
    refreshConnectionDisplay();
    updateProjectUi();

    if (switchingDevice && !options.silent) {
        showToast(
            'device',
            'Đã chuyển workspace',
            nextDevice.name + ' đã sẵn sàng. Nhập ID thiết bị để kết nối.',
            3000
        );
    }
    return true;
}

function updateSelectedDeviceStatus() {
    const id = document.getElementById('deviceIdInput').value.trim();
    deviceIds[currentDeviceKey] = id;
    const device = getDeviceDefinition();
    document.getElementById('selectedDeviceText').textContent =
        id ? device.name + ' · ' + id : device.name + ' · Chưa nhập ID';
    updateIdeStatusBar();
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
    lastConnectionText = text;
    lastConnectionState = state;
    updateConnectButtonState(state);
    updateIdeStatusBar();
}

function clearDevicePresenceState(clearTarget = true) {
    if (pendingPingTimer) {
        clearTimeout(pendingPingTimer);
        pendingPingTimer = null;
    }
    pendingPingRequestId = null;
    if (heartbeatWatchTimer) {
        clearInterval(heartbeatWatchTimer);
        heartbeatWatchTimer = null;
    }
    lastHeartbeatAt = 0;
    if (clearTarget) verificationTarget = null;
}

function disconnectCurrentDevice(showFeedback = false) {
    const oldTarget = connectedTarget || verificationTarget;
    clearDevicePresenceState(true);

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
        if (showFeedback) {
            showToast('info', 'Đã ngắt kết nối', 'Thiết bị ' + oldTarget.id + ' đã được ngắt khỏi Web.', 2600);
        }
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

    if (isMqttConnected() && verificationTarget) {
        setConnectionStatus(
            'Đang xác nhận ' + verificationTarget.id + '...',
            'connecting'
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
        disconnectCurrentDevice(true);
        return;
    }

    const id = document.getElementById('deviceIdInput').value.trim();
    const error = validateDeviceId(id);
    if (error) {
        showToast('warning', 'Kiểm tra ID thiết bị', error, 3400);
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

function makeRequestId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
    }
    return 'ping_' + Date.now().toString(36) + '_' + Math.random().toString(16).slice(2);
}

function devicePresenceTopic(id, suffix) {
    return id + '/' + suffix;
}

function activateConnectedTarget(deviceId, targetOverride = null) {
    const target = targetOverride || {
        deviceKey: currentDeviceKey,
        toolboxMode: currentDeviceMode,
        id: deviceId
    };
    const device = getDeviceDefinition(target.deviceKey);
    const wasAlreadyOnline = !!(
        connectedTarget &&
        connectedTarget.id === target.id &&
        connectedTarget.deviceKey === target.deviceKey
    );

    connectedTarget = { ...target };
    setConnectionStatus(device.name + ' · ' + deviceId, 'online');

    if (!wasAlreadyOnline) {
        showToast(
            'device',
            'Thiết bị đã sẵn sàng',
            device.name + ' · ' + deviceId + ' đã phản hồi và có thể nhận chương trình.',
            3600
        );
    }
}

function devicePresenceLabel(target) {
    if (!target) return 'Thiết bị';
    return getDeviceDefinition(target.deviceKey).name + ' · ' + target.id;
}

function markDeviceOffline(message) {
    if (connectedTarget && verificationTarget &&
        connectedTarget.id === verificationTarget.id &&
        connectedTarget.deviceKey === verificationTarget.deviceKey) {
        connectedTarget = null;
    }
    if (verificationTarget) {
        setConnectionStatus(message || (devicePresenceLabel(verificationTarget) + ' offline'), 'error');
    }
}

function startDeviceHeartbeatWatch() {
    if (heartbeatWatchTimer) clearInterval(heartbeatWatchTimer);
    heartbeatWatchTimer = setInterval(() => {
        if (!verificationTarget || !isMqttConnected() || !connectedTarget) return;
        if (!lastHeartbeatAt) return;
        if (Date.now() - lastHeartbeatAt <= DEVICE_HEARTBEAT_STALE_MS) return;

        // Heartbeat is stale. Ask the actual Pi once before declaring it offline.
        connectedTarget = null;
        setConnectionStatus(
            devicePresenceLabel(verificationTarget) + ' đang kiểm tra...',
            'connecting'
        );
        sendDevicePing(verificationTarget);
    }, DEVICE_HEARTBEAT_CHECK_MS);
}

function sendDevicePing(target) {
    if (!client || !client.isConnected() || !target) return;
    if (pendingPingRequestId) return;

    const requestId = makeRequestId();
    pendingPingRequestId = requestId;
    setConnectionStatus('Đang xác nhận ' + devicePresenceLabel(target) + '...', 'connecting');

    const payload = {
        action: 'ping',
        request_id: requestId,
        sent_at: Date.now()
    };
    const message = new Paho.MQTT.Message(JSON.stringify(payload));
    message.destinationName = devicePresenceTopic(target.id, 'system');
    message.qos = 1;

    try {
        client.send(message);
    } catch (error) {
        pendingPingRequestId = null;
        markDeviceOffline('Không gửi được yêu cầu xác nhận thiết bị');
        return;
    }

    pendingPingTimer = setTimeout(() => {
        if (pendingPingRequestId !== requestId) return;
        pendingPingRequestId = null;
        pendingPingTimer = null;
        markDeviceOffline(devicePresenceLabel(target) + ' không phản hồi');
    }, DEVICE_PING_TIMEOUT_MS);
}

function handleDeviceMessage(message) {
    const target = verificationTarget;
    if (!target) return;

    if (message.destinationName === devicePresenceTopic(target.id, 'pong')) {
        try {
            const data = JSON.parse(message.payloadString || '{}');
            if (data.action !== 'pong' || data.id !== target.id) return;
            if (!pendingPingRequestId || data.request_id !== pendingPingRequestId) return;

            if (pendingPingTimer) clearTimeout(pendingPingTimer);
            pendingPingTimer = null;
            pendingPingRequestId = null;
            lastHeartbeatAt = Date.now();
            activateConnectedTarget(target.id, target);
            startDeviceHeartbeatWatch();
        } catch (error) {
            console.warn('PONG thiết bị không hợp lệ:', error);
        }
        return;
    }

    if (message.destinationName === devicePresenceTopic(target.id, 'presence')) {
        try {
            const data = JSON.parse(message.payloadString || '{}');
            if (data.id !== target.id) return;

            if (data.state === 'offline') {
                lastHeartbeatAt = 0;
                if (pendingPingTimer) clearTimeout(pendingPingTimer);
                pendingPingTimer = null;
                pendingPingRequestId = null;
                markDeviceOffline(devicePresenceLabel(target) + ' offline');
                return;
            }

            if (data.state === 'online') {
                lastHeartbeatAt = Date.now();
                // If the Pi comes back after an outage, verify it again automatically.
                if (!connectedTarget && !pendingPingRequestId) {
                    sendDevicePing(target);
                }
            }
        } catch (error) {
            console.warn('Presence thiết bị không hợp lệ:', error);
        }
    }
}

function beginDeviceVerification(target) {
    clearDevicePresenceState(false);
    verificationTarget = { ...target };
    setConnectionStatus('Đã nối máy chủ · đang xác nhận thiết bị...', 'connecting');

    const fail = () => {
        markDeviceOffline('Không đăng ký được kênh trạng thái thiết bị');
    };

    client.subscribe(devicePresenceTopic(target.id, 'presence'), {
        qos: 1,
        onSuccess: () => {
            client.subscribe(devicePresenceTopic(target.id, 'pong'), {
                qos: 1,
                onSuccess: () => sendDevicePing(target),
                onFailure: fail
            });
        },
        onFailure: fail
    });
}

function connectBroker(deviceId) {
    const target = {
        deviceKey: currentDeviceKey,
        toolboxMode: currentDeviceMode,
        id: deviceId
    };

    clearDevicePresenceState(true);

    try {
        client = new Paho.MQTT.Client(
            brokerSettings.host,
            Number(brokerSettings.port),
            'MobiSTEM_' + Math.random().toString(16).slice(2, 10)
        );
    } catch (e) {
        setConnectionStatus('Lỗi cấu hình máy chủ', 'error');
        showToast('error', 'Không thể kết nối máy chủ', e.message || 'Cấu hình MQTT không hợp lệ.', 4800);
        return;
    }

    client.onMessageArrived = handleDeviceMessage;
    client.onConnectionLost = () => {
        connectedTarget = null;
        clearDevicePresenceState(true);
        setConnectionStatus('Mất kết nối máy chủ', 'error');
        showToast('error', 'Mất kết nối', 'Web vừa mất kết nối tới máy chủ MQTT.', 4200);
    };

    client.connect({
        timeout: 6,
        useSSL: true,
        userName: brokerSettings.user,
        password: brokerSettings.pass,
        cleanSession: true,
        onSuccess: () => {
            beginDeviceVerification(target);
        },
        onFailure: response => {
            connectedTarget = null;
            clearDevicePresenceState(true);
            setConnectionStatus('Kết nối máy chủ thất bại', 'error');
            const detail = response?.errorMessage || 'Không thể kết nối tới máy chủ MQTT.';
            showToast('error', 'Kết nối thất bại', detail, 4800);
        }
    });
}

function ensureActiveTarget() {
    const id = document.getElementById('deviceIdInput').value.trim();
    if (!client || !client.isConnected()) {
        showToast(
            'warning',
            'Thiết bị chưa được kết nối',
            'Hãy nhập ID và bấm "Kết nối thiết bị" trước khi nạp hoặc dừng chương trình.',
            4300
        );
        return false;
    }

    if (!connectedTarget ||
        connectedTarget.deviceKey !== currentDeviceKey ||
        connectedTarget.id !== id) {
        showToast(
            'warning',
            'Cần kết nối lại thiết bị',
            'ID hoặc loại thiết bị đã thay đổi. Hãy kết nối lại trước khi tiếp tục.',
            4300
        );
        return false;
    }
    return true;
}

function sendData() {
    if (!ensureActiveTarget()) return;

    const code = codeEditor.getValue();
    if (!code.trim()) {
        showToast('warning', 'Workspace đang trống', 'Hãy kéo một vài khối lệnh vào vùng lập trình trước.', 3400);
        return;
    }

    const payload = {};
    payload[brokerSettings.jsonKey || 'main'] = code;

    try {
        const msg = new Paho.MQTT.Message(JSON.stringify(payload));
        msg.destinationName = connectedTarget.id;
        client.send(msg);
        showToast(
            'success',
            'Đã gửi chương trình',
            'Code đã được nạp tới ' + connectedTarget.id + '.',
            3200
        );
    } catch (e) {
        showToast('error', 'Không gửi được chương trình', e.message || 'Lỗi MQTT không xác định.', 4600);
    }
}

function sendStopCommand() {
    if (!ensureActiveTarget()) return;

    const payload = { action: 'stop' };

    try {
        const msg = new Paho.MQTT.Message(JSON.stringify(payload));
        msg.destinationName = connectedTarget.id;
        msg.qos = 1;
        client.send(msg);
        showToast('info', 'Đã gửi lệnh dừng', 'Thiết bị ' + connectedTarget.id + ' đang dừng chương trình.', 2800);
    } catch (e) {
        showToast('error', 'Không gửi được lệnh dừng', e.message || 'Lỗi MQTT không xác định.', 4600);
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
        const editedId = idInput.value.trim();
        const activeTarget = connectedTarget || verificationTarget;

        // Never keep a live MQTT session associated with a different ID.
        if (activeTarget && editedId !== activeTarget.id) {
            disconnectCurrentDevice();
            setConnectionStatus('ID đã thay đổi · Hãy kết nối lại', 'offline');
        }

        updateSelectedDeviceStatus();
        refreshConnectionDisplay();
    });

    idInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') connectSelectedDevice();
    });

    workspace.addChangeListener(function (e) {
        if (suppressWorkspaceEvents || e.isUiEvent) return;
        refreshGeneratedCode();
        setProjectDirty(true);
        scheduleRecoveryDraft();
    });

    refreshGeneratedCode();
    updateProjectUi();
    updateIdeStatusBar();
    showRecoveryDraftIfAvailable();
};

window.addEventListener('beforeunload', () => {
    if (projectDirty) saveRecoveryDraftNow();
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden && projectDirty) saveRecoveryDraftNow();
});

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
        await selectDeviceCatalogItem(projectDeviceKey, { skipUnsavedCheck: true, silent: true });
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
    setProjectDirty(false);
    clearRecoveryDraft();
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
    if (!await confirmDiscardUnsavedChanges('Mở dự án khác')) return;

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
            setProjectDirty(false);
            clearRecoveryDraft();
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
            setProjectDirty(false);
            clearRecoveryDraft();
            return;
        } catch (e) {
            if (e.name === 'AbortError') return;
            console.warn('File System Access API không lưu được file:', e);
        }
    }

    let projectName = await showTextPrompt({
        tone: 'info',
        eyebrow: 'LƯU DỰ ÁN',
        icon: 'fa-regular fa-floppy-disk',
        title: 'Đặt tên cho dự án',
        message: 'Tên này sẽ được dùng cho tệp .mobistem mới.',
        value: suggestedName.replace(/\.mobistem$/i, ''),
        inputLabel: 'Tên dự án',
        placeholder: 'Ví dụ: Robot_Tranh_Vat_Can',
        confirmText: 'Lưu dự án',
        cancelText: 'Hủy'
    });
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
    setProjectDirty(false);
    clearRecoveryDraft();
}

async function loadProject(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const xmlText = await file.text();
        await applyProjectXmlText(xmlText, file.name);
        currentProjectHandle = null;
        currentProjectName = file.name;
        setProjectDirty(false);
    } catch (err) {
        await showMessageDialog({
            tone: 'error',
            eyebrow: 'KHÔNG MỞ ĐƯỢC DỰ ÁN',
            title: 'Tệp không đúng định dạng MobiSTEM',
            message: 'Hãy chọn tệp .mobistem hoặc .xml được tạo từ MobiSTEM.',
            details: String(err)
        });
    } finally {
        document.getElementById('fileInput').value = '';
    }
}

document.addEventListener('click', event => {
    if (!event.target.closest('.file-menu-wrap')) closeFileMenu();
});

document.addEventListener('keydown', event => {
    const ctrl = event.ctrlKey || event.metaKey;
    const customDialogOpen = document.getElementById('mobiDialogOverlay')?.classList.contains('open');

    if (customDialogOpen) {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeMobiDialog(false);
        }
        return;
    }

    if ((ctrl && event.shiftKey && event.key.toLowerCase() === 'p') || event.key === 'F1') {
        event.preventDefault();
        openCommandPalette();
        return;
    }

    if (ctrl && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        newProject();
        return;
    }

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
    closeCommandPalette();
    closeFileMenu();
    closeDevicePicker();
    closeAdminLogin();
    closeMqttSettings();
});
