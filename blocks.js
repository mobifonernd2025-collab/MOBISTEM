// ==========================================
// 1. ĐỊNH NGHĨA HÌNH DÁNG KHỐI (BLOCKLY DEFINITIONS)
// ==========================================
const paletteIcon = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23fff" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>';
const btnOptions = [["CROSS (X)", "CROSS"], ["CIRCLE (O)", "CIRCLE"], ["SQUARE (Vuông)", "SQUARE"], ["TRIANGLE (Tam giác)", "TRIANGLE"], ["UP (Lên)", "UP"], ["DOWN (Xuống)", "DOWN"], ["LEFT (Trái)", "LEFT"], ["RIGHT (Phải)", "RIGHT"], ["L1", "L1"], ["R1", "R1"], ["L2", "L2"], ["R2", "R2"], ["SELECT", "SELECT"], ["START", "START"]];

Blockly.Blocks['main_loop'] = { init: function () { this.appendDummyInput().appendField("🔄 Vòng lặp chính"); this.appendStatementInput("DO").setCheck(null); this.setColour("#FFAB19"); } };
Blockly.Blocks['time_delay'] = { init: function () { this.appendValueInput("TIME").setCheck("Number").appendField("⏳ Chờ (giây)"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#FFAB19"); } };
Blockly.Blocks['gamepad_init'] = { init: function () { this.appendDummyInput().appendField("🎮 Khởi tạo tay cầm PS2/PS4"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#4C97FF"); } };
Blockly.Blocks['gamepad_pressed'] = { init: function () { this.appendDummyInput().appendField("Nút").appendField(new Blockly.FieldDropdown(btnOptions), "BTN").appendField("được nhấn nhả?"); this.setOutput(true, "Boolean"); this.setColour("#4C97FF"); } };
Blockly.Blocks['gamepad_held'] = { init: function () { this.appendDummyInput().appendField("Nút").appendField(new Blockly.FieldDropdown(btnOptions), "BTN").appendField("đang được nhấn giữ?"); this.setOutput(true, "Boolean"); this.setColour("#4C97FF"); } };
Blockly.Blocks['gamepad_analog'] = { init: function () { this.appendDummyInput().appendField("Giá trị cần gạt").appendField(new Blockly.FieldDropdown([["Trái X (LX)", "LX"], ["Trái Y (LY)", "LY"], ["Phải X (RX)", "RX"], ["Phải Y (RY)", "RY"]]), "AXIS"); this.setOutput(true, "Number"); this.setColour("#4C97FF"); } };

Blockly.Blocks['motor_gamepad'] = { init: function () { this.appendDummyInput().appendField("🚗 Lái robot tự động bằng tay cầm"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#0FBD8C"); } };
Blockly.Blocks['motor_straight'] = { init: function () { this.appendDummyInput().appendField("🚗 Di chuyển").appendField(new Blockly.FieldDropdown([["Tiến", "move_straight"], ["Sang ngang", "move_sideway"]]), "TYPE"); this.appendValueInput("DIST").setCheck("Number").appendField("khoảng cách (cm)"); this.appendValueInput("SPEED").setCheck("Number").appendField("tốc độ"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#0FBD8C"); } };
Blockly.Blocks['motor_basic'] = { init: function () { this.appendDummyInput().appendField("🚗 Chạy liên tục").appendField(new Blockly.FieldDropdown([["Tiến thẳng", "go_forward"], ["Lùi lại", "go_backward"], ["Đi ngang trái", "strafe_left"], ["Đi ngang phải", "strafe_right"], ["Xoay trái", "turn_left"], ["Xoay phải", "turn_right"]]), "ACTION"); this.appendValueInput("SPEED").setCheck("Number").appendField("tốc độ"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#0FBD8C"); } };
Blockly.Blocks['motor_stop'] = { init: function () { this.appendDummyInput().appendField("🛑 Dừng tất cả động cơ"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#0FBD8C"); } };

Blockly.Blocks['servo_move'] = { init: function () { this.appendDummyInput().appendField("🦾 Nhích tay gắp").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"]]), "ID"); this.appendValueInput("STEP").setCheck("Number").appendField("thêm (độ)"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#FF6680"); } };
Blockly.Blocks['servo_set'] = { init: function () { this.appendDummyInput().appendField("🦾 Cài góc tay gắp").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"]]), "ID"); this.appendValueInput("ANGLE").setCheck("Number").appendField("ở (độ)"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#FF6680"); } };
Blockly.Blocks['servo_cleanup'] = { init: function () { this.appendDummyInput().appendField("🦾 Thả trôi tay gắp (cleanup)"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#FF6680"); } };

Blockly.Blocks['matrix_icon_custom'] = {
    init: function () {
        this.appendDummyInput().appendField("🔠 Matrix vẽ Icon")
            .appendField(new Blockly.FieldImage(paletteIcon, 22, 22, "🎨 Vẽ", function (field) { openMatrixEditor(field.getSourceBlock()); }))
            .appendField(new Blockly.FieldTextInput("[0x00,0x66,0xFF,0xFF,0x7E,0x3C,0x18,0x00]"), "HEX_ARRAY");
        this.appendValueInput("X").setCheck("Number").appendField("tại X");
        this.appendValueInput("Y").setCheck("Number").appendField("Y");
        this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#9966FF");
    }
};
Blockly.Blocks['led7_show'] = { init: function () { this.appendValueInput("NUM").setCheck("Number").appendField("💡 LED 7 hiện số"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#9966FF"); } };
Blockly.Blocks['matrix_scroll'] = { init: function () { this.appendValueInput("TEXT").setCheck(null).appendField("🔠 Matrix chạy chữ"); this.appendValueInput("SPEED").setCheck("Number").appendField("tốc độ"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#9966FF"); } };
Blockly.Blocks['led_cleanup'] = { init: function () { this.appendDummyInput().appendField("💡 Xóa toàn bộ LED (cleanup)"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#9966FF"); } };

Blockly.Blocks['sound_play'] = { init: function () { this.appendValueInput("TRACK").setCheck("Number").appendField("🎵 Phát bài hát số"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#D65CD6"); } };
Blockly.Blocks['sound_vol'] = { init: function () { this.appendValueInput("VOL").setCheck("Number").appendField("🎵 Đặt âm lượng (0-30)"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#D65CD6"); } };
Blockly.Blocks['sound_stop'] = { init: function () { this.appendDummyInput().appendField("🔇 Tắt nhạc"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#D65CD6"); } };

Blockly.Blocks['sensor_dist'] = { init: function () { this.appendDummyInput().appendField("📡 Khoảng cách siêu âm (cm)"); this.setOutput(true, "Number"); this.setColour("#5CB1D6"); } };
Blockly.Blocks['sensor_line'] = { init: function () { this.appendDummyInput().appendField("📡 Đọc mắt dò Line").appendField(new Blockly.FieldDropdown([["Mắt 0", "0"], ["Mắt 1", "1"], ["Mắt 2", "2"], ["Mắt 3", "3"]]), "IDX"); this.setOutput(true, "Number"); this.setColour("#5CB1D6"); } };
Blockly.Blocks['convert_tostring'] = {
    init: function () {
        this.appendValueInput("VAL").appendField("🔤 Chuyển thành Chữ");
        this.setOutput(true, "String");
        this.setColour("#5CA68D"); // Trùng màu với mục Văn bản
    }
};
Blockly.Blocks['convert_tonumber'] = {
    init: function () {
        this.appendValueInput("VAL").appendField("🔢 Chuyển thành Số");
        this.setOutput(true, "Number");
        this.setColour("#5C68A6"); // Trùng màu với mục Toán học
    }
};
Blockly.Blocks['get_time_internet'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🕒 Lấy thời gian thực")
            .appendField(new Blockly.FieldDropdown([
                ["Giờ (0-23)", "HOUR"],
                ["Phút (0-59)", "MINUTE"],
                ["Giây (0-59)", "SECOND"]
            ]), "TIME_TYPE");
        this.setOutput(true, "Number"); // Trả về dạng Số để dễ so sánh Toán học
        this.setColour("#5CB1D6"); // Đặt cùng màu với mục Cảm Biến
    }
};

// ==========================================
// 2. DỊCH MÃ PYTHON (PYTHON GENERATORS)
// ==========================================
const pyGen = python.pythonGenerator;

function clampCode(valCode, minVal, maxVal) {
    let clean = valCode.trim();
    if (clean.startsWith('(') && clean.endsWith(')')) clean = clean.substring(1, clean.length - 1);
    if (/^-?\d+(\.\d+)?$/.test(clean)) {
        let v = parseFloat(clean);
        if (v < minVal) return minVal.toString();
        if (v > maxVal) return maxVal.toString();
        return clean;
    }
    return `max(${minVal}, min(${maxVal}, ${valCode}))`;
}

pyGen.forBlock['main_loop'] = function (block, generator) {
    let branch = generator.statementToCode(block, 'DO'); let indent = generator.INDENT || "  ";
    let hasGamepad = false; let hasSensor = false;
    let blocks = block.workspace.getAllBlocks(false);
    for (let i = 0; i < blocks.length; i++) {
        let type = blocks[i].type;
        if (type.startsWith('gamepad_') || type === 'motor_gamepad') hasGamepad = true;
        if (type === 'sensor_dist' || type === 'sensor_line') hasSensor = true;
    }
    let code = 'while True:\n';
    if (hasGamepad) code += indent + 'game.update()\n';
    if (branch) code += branch; else if (!hasGamepad) code += indent + 'pass\n';
    if (hasGamepad) code += indent + 'time.sleep(0.05)\n'; else if (hasSensor) code += indent + 'time.sleep(0.1)\n';
    return code;
};

pyGen.forBlock['gamepad_init'] = function () { return '# Đã bật tính năng quét tay cầm\n'; };
pyGen.forBlock['time_delay'] = function (block, generator) { let time = generator.valueToCode(block, 'TIME', pyGen.ORDER_ATOMIC) || '1'; return `time.sleep(${time})\n`; };

pyGen.forBlock['gamepad_pressed'] = function (block) { return [`game.is_pressed('${block.getFieldValue('BTN')}')`, pyGen.ORDER_ATOMIC]; };
pyGen.forBlock['gamepad_held'] = function (block) { return [`game.${block.getFieldValue('BTN')}`, pyGen.ORDER_ATOMIC]; };
pyGen.forBlock['gamepad_analog'] = function (block) { return [`game.${block.getFieldValue('AXIS')}`, pyGen.ORDER_ATOMIC]; };

pyGen.forBlock['motor_straight'] = function (block, generator) {
    let type = block.getFieldValue('TYPE');
    let dist = generator.valueToCode(block, 'DIST', pyGen.ORDER_ATOMIC) || '0';
    let speedSafe = clampCode(generator.valueToCode(block, 'SPEED', pyGen.ORDER_ATOMIC) || '0', 0, 1);
    return `robot.${type}(${dist}, ${speedSafe})\n`;
};
pyGen.forBlock['motor_basic'] = function (block, generator) {
    let action = block.getFieldValue('ACTION');
    let speedSafe = clampCode(generator.valueToCode(block, 'SPEED', pyGen.ORDER_ATOMIC) || '0', 0, 1);
    return `robot.${action}(${speedSafe})\n`;
};
pyGen.forBlock['motor_gamepad'] = function () { return 'robot.move(game.LX, game.LY, game.RX)\n'; };
pyGen.forBlock['motor_stop'] = function () { return 'robot.stop_all()\n'; };

pyGen.forBlock['servo_move'] = function (block, generator) { let id = block.getFieldValue('ID'); let step = generator.valueToCode(block, 'STEP', pyGen.ORDER_ATOMIC) || '0'; return `servo.move(${id}, ${step})\n`; };
pyGen.forBlock['servo_set'] = function (block, generator) {
    let id = block.getFieldValue('ID');
    let angleSafe = clampCode(generator.valueToCode(block, 'ANGLE', pyGen.ORDER_ATOMIC) || '0', 0, 180);
    return `servo.set_angle(${id}, ${angleSafe})\n`;
};
pyGen.forBlock['servo_cleanup'] = function () { return 'servo.cleanup()\n'; };

pyGen.forBlock['matrix_icon_custom'] = function (block, generator) {
    let hexArr = block.getFieldValue('HEX_ARRAY');
    let xSafe = clampCode(generator.valueToCode(block, 'X', pyGen.ORDER_ATOMIC) || '0', 0, 16);
    let ySafe = clampCode(generator.valueToCode(block, 'Y', pyGen.ORDER_ATOMIC) || '0', 0, 8);
    return `icon = ${hexArr}\ndisplay_map(${xSafe}, ${ySafe}, icon)\n`;
};
pyGen.forBlock['led7_show'] = function (block, generator) { let num = generator.valueToCode(block, 'NUM', pyGen.ORDER_ATOMIC) || '0'; return `display_digits(${num})\n`; };
pyGen.forBlock['matrix_scroll'] = function (block, generator) {
    // Lấy giá trị đầu vào, ORDER_NONE giúp lấy được cả biểu thức dài
    let text = generator.valueToCode(block, 'TEXT', pyGen.ORDER_NONE) || '""';
    let speed = generator.valueToCode(block, 'SPEED', pyGen.ORDER_ATOMIC) || '0.02';

    // Tự động bọc str() bên ngoài để Python không bao giờ bị lỗi kiểu dữ liệu
    return `scroll_text(str(${text}), speed=${speed})\n`;
};
pyGen.forBlock['led_cleanup'] = function () { return 'cleanup()\n'; };

pyGen.forBlock['sound_play'] = function (block, generator) { let track = generator.valueToCode(block, 'TRACK', pyGen.ORDER_ATOMIC) || '1'; return `sound.play_track(${track})\n`; };
pyGen.forBlock['sound_vol'] = function (block, generator) {
    let volSafe = clampCode(generator.valueToCode(block, 'VOL', pyGen.ORDER_ATOMIC) || '10', 0, 30);
    return `sound.set_volume(${volSafe})\n`;
};
pyGen.forBlock['sound_stop'] = function () { return 'sound.stop_music()\n'; };

pyGen.forBlock['sensor_dist'] = function () { return ['sensor.distance()', pyGen.ORDER_ATOMIC]; };
pyGen.forBlock['sensor_line'] = function (block) { let idx = block.getFieldValue('IDX'); return [`sensor.line_data()[${idx}]`, pyGen.ORDER_ATOMIC]; };
pyGen.forBlock['convert_tostring'] = function (block, generator) {
    let val = generator.valueToCode(block, 'VAL', pyGen.ORDER_NONE) || '0';
    return [`str(${val})`, pyGen.ORDER_FUNCTION_CALL];
};
pyGen.forBlock['convert_tonumber'] = function (block, generator) {
    let val = generator.valueToCode(block, 'VAL', pyGen.ORDER_NONE) || '""';
    return [`float(${val})`, pyGen.ORDER_FUNCTION_CALL]; // Dùng float để hỗ trợ cả số thập phân
};
pyGen.forBlock['get_time_internet'] = function (block) {
    let type = block.getFieldValue('TIME_TYPE');
    let code = '';

    // Dùng thư viện time của Python để trích xuất giờ/phút/giây
    if (type === 'HOUR') {
        code = 'time.localtime().tm_hour';
    } else if (type === 'MINUTE') {
        code = 'time.localtime().tm_min';
    } else if (type === 'SECOND') {
        code = 'time.localtime().tm_sec';
    }

    return [code, pyGen.ORDER_ATOMIC];
};

// ==========================================
// 3. ĐỊNH NGHĨA KHỐI SMART HOME
// ==========================================

// --- CẢM BIẾN (Màu Xanh dương nhạt) ---
Blockly.Blocks['sh_sensor_adc_val'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("📡 Đọc giá trị (%)")
            .appendField(new Blockly.FieldDropdown([
                ["Cảm biến Lửa", "fire"],
                ["Cảm biến Ánh sáng", "light"],
                ["Cảm biến Khí Gas", "gas"],
                ["Độ ẩm đất", "moisture"]
            ]), "TYPE");
        this.setOutput(true, "Number");
        this.setColour("#5CB1D6");
    }
};


Blockly.Blocks['sh_sensor_adc_state'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("📡 Trạng thái (1/0)")
            .appendField(new Blockly.FieldDropdown([
                ["Có Lửa không?", "fire"],
                ["Trời Sáng không?", "light"],
                ["Có Khí Gas không?", "gas"],
                ["Đất Ướt không?", "moisture"]
            ]), "TYPE");
        this.setOutput(true, "Number");
        this.setColour("#5CB1D6");
    }
};

Blockly.Blocks['sh_dht_sensor'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🌡️ Đọc DHT")
            .appendField(new Blockly.FieldDropdown([["Nhiệt độ (°C)", "temp"], ["Độ ẩm (%)", "humi"]]), "TYPE");
        this.setOutput(true, "Number");
        this.setColour("#5CB1D6");
    }
};

Blockly.Blocks['sh_pir_sensor'] = {
    init: function () {
        this.appendDummyInput().appendField("🏃 Trạng thái chuyển động (PIR)");
        this.setOutput(true, "Number");
        this.setColour("#5CB1D6");
    }
};

Blockly.Blocks['sh_rfid_read'] = {
    init: function () {
        this.appendDummyInput().appendField("💳 Đọc mã thẻ RFID (UID)");
        this.setOutput(true, "String");
        this.setColour("#5CB1D6");
    }
};

Blockly.Blocks['sh_rfid_check'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("💳 Thẻ RFID có mã")
        .appendField(new Blockly.FieldTextInput("Nhập mã thẻ vào đây..."), "UID_CODE")
        .appendField("được quét?");
    this.setOutput(true, "Boolean"); // Trả về Đúng/Sai để nhét vào khối NẾU
    this.setColour("#5CB1D6");
  }
};

Blockly.Blocks['sh_lidar_dist'] = {
    init: function () {
        this.appendDummyInput().appendField("📏 Đọc khoảng cách Lidar");
        this.setOutput(true, "Number");
        this.setColour("#5CB1D6");
    }
};

// --- THIẾT BỊ ĐẦU RA (Màu Cam / Tím / Đỏ) ---
Blockly.Blocks['sh_buzzer_beep'] = {
    init: function () {
        this.appendValueInput("TIME").setCheck("Number").appendField("🚨 Còi báo động kêu (giây)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#D65CD6");
    }
};

Blockly.Blocks['sh_buzzer_tone'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🎵 Còi phát nốt")
            .appendField(new Blockly.FieldDropdown([
                ["Đồ (C4)", "C4"], ["Rê (D4)", "D4"], ["Mi (E4)", "E4"],
                ["Fa (F4)", "F4"], ["Son (G4)", "G4"], ["La (A4)", "A4"],
                ["Si (B4)", "B4"], ["Đố (C5)", "C5"], ["Lặng (REST)", "REST"]
            ]), "NOTE");
        this.appendValueInput("TIME").setCheck("Number").appendField("trong (giây)");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#D65CD6");
    }
};

Blockly.Blocks['sh_fan_speed'] = {
    init: function () {
        this.appendValueInput("SPEED").setCheck("Number").appendField("❄️ Bật quạt tốc độ (0-100%)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0FBD8C");
    }
};

Blockly.Blocks['sh_led_rgb'] = {
    init: function () {
        this.appendDummyInput().appendField("💡 Đổi màu LED RGB");
        this.appendValueInput("R").setCheck("Number").appendField("Đỏ (R)");
        this.appendValueInput("G").setCheck("Number").appendField("Xanh lá (G)");
        this.appendValueInput("B").setCheck("Number").appendField("Xanh biển (B)");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#F5B041");
    }
};

Blockly.Blocks['sh_relay_control'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🔌 Chuyển mạch Relay")
            .appendField(new Blockly.FieldDropdown([["BẬT (on)", "on"], ["TẮT (off)", "off"]]), "STATE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#E74C3C");
    }
};

Blockly.Blocks['sh_door_action'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🚪 Điều khiển cửa")
            .appendField(new Blockly.FieldDropdown([["MỞ (open)", "open"], ["ĐÓNG (close)", "close"]]), "ACTION");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#A569BD");
    }
};

Blockly.Blocks['sh_door_angle'] = {
    init: function () {
        this.appendValueInput("ANGLE").setCheck("Number").appendField("🚪 Mở cửa theo góc");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#A569BD");
    }
};

// --- MÀN HÌNH LCD (Màu Xanh tím) ---
Blockly.Blocks['sh_lcd_clear'] = {
    init: function () {
        this.appendDummyInput().appendField("📺 Xóa màn hình LCD");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#9966FF");
    }
};

Blockly.Blocks['sh_lcd_backlight'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("📺 Đèn nền LCD")
            .appendField(new Blockly.FieldDropdown([["BẬT", "True"], ["TẮT", "False"]]), "STATE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#9966FF");
    }
};

Blockly.Blocks['sh_lcd_display'] = {
    init: function () {
        this.appendValueInput("X").setCheck("Number").appendField("📺 LCD in tại cột X (0-15)");
        this.appendValueInput("Y").setCheck("Number").appendField("hàng Y (0-1)");
        this.appendValueInput("TEXT").setCheck("String").appendField("nội dung");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#9966FF");
    }
};

Blockly.Blocks['sh_lcd_scroll'] = {
    init: function () {
        this.appendValueInput("LINE").setCheck("Number").appendField("📺 LCD chạy chữ hàng (0-1)");
        this.appendValueInput("TEXT").setCheck("String").appendField("nội dung");
        this.appendValueInput("SPEED").setCheck("Number").appendField("tốc độ");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#9966FF");
    }
};

// ==========================================
// 4. DỊCH MÃ PYTHON CHO SMART HOME
// ==========================================

pyGen.forBlock['sh_sensor_adc_val'] = function (block) {
    let type = block.getFieldValue('TYPE');
    return [`adc.${type}_val`, pyGen.ORDER_ATOMIC];
};
pyGen.forBlock['sh_sensor_adc_state'] = function (block) {
    let type = block.getFieldValue('TYPE');
    return [`adc.${type}_state`, pyGen.ORDER_ATOMIC];
};
pyGen.forBlock['sh_dht_sensor'] = function (block) {
    return [`dht.${block.getFieldValue('TYPE')}`, pyGen.ORDER_ATOMIC];
};
pyGen.forBlock['sh_pir_sensor'] = function () {
    return [`pir.motion_state`, pyGen.ORDER_ATOMIC];
};
pyGen.forBlock['sh_rfid_read'] = function () {
    return [`rfid_reader.get_uid()`, pyGen.ORDER_FUNCTION_CALL];
};
pyGen.forBlock['sh_rfid_check'] = function(block) {
  let uid = block.getFieldValue('UID_CODE');
  return [`(rfid_reader.get_uid() == "${uid}")`, pyGen.ORDER_ATOMIC];
};
pyGen.forBlock['sh_lidar_dist'] = function () {
    return [`lidar.get_distance()`, pyGen.ORDER_FUNCTION_CALL];
};

pyGen.forBlock['sh_buzzer_beep'] = function (block, generator) {
    let time = generator.valueToCode(block, 'TIME', pyGen.ORDER_ATOMIC) || '1';
    return `Bz.alarm_beep(${time})\n`;
};
pyGen.forBlock['sh_buzzer_tone'] = function (block, generator) {
    let note = block.getFieldValue('NOTE');
    let time = generator.valueToCode(block, 'TIME', pyGen.ORDER_ATOMIC) || '1';
    return `Bz.play_tone('${note}', ${time})\n`;
};
pyGen.forBlock['sh_fan_speed'] = function (block, generator) {
    let speed = clampCode(generator.valueToCode(block, 'SPEED', pyGen.ORDER_ATOMIC) || '0', 0, 100);
    return `fan.set_speed(${speed})\n`;
};
pyGen.forBlock['sh_led_rgb'] = function (block, generator) {
    let r = clampCode(generator.valueToCode(block, 'R', pyGen.ORDER_ATOMIC) || '0', 0, 255);
    let g = clampCode(generator.valueToCode(block, 'G', pyGen.ORDER_ATOMIC) || '0', 0, 255);
    let b = clampCode(generator.valueToCode(block, 'B', pyGen.ORDER_ATOMIC) || '0', 0, 255);
    return `leds.set_color(${r}, ${g}, ${b})\n`;
};
pyGen.forBlock['sh_relay_control'] = function (block) {
    return `relay.control("${block.getFieldValue('STATE')}")\n`;
};
pyGen.forBlock['sh_door_action'] = function (block) {
    return `my_servo.move("${block.getFieldValue('ACTION')}")\n`;
};
pyGen.forBlock['sh_door_angle'] = function (block, generator) {
    let angle = generator.valueToCode(block, 'ANGLE', pyGen.ORDER_ATOMIC) || '0';
    return `my_servo.move(${angle})\n`;
};

pyGen.forBlock['sh_lcd_clear'] = function () { return `lcd.clear()\n`; };
pyGen.forBlock['sh_lcd_backlight'] = function (block) { return `lcd.backlight(${block.getFieldValue('STATE')})\n`; };
pyGen.forBlock['sh_lcd_display'] = function (block, generator) {
    let x = generator.valueToCode(block, 'X', pyGen.ORDER_ATOMIC) || '0';
    let y = generator.valueToCode(block, 'Y', pyGen.ORDER_ATOMIC) || '0';
    let text = generator.valueToCode(block, 'TEXT', pyGen.ORDER_NONE) || '""';
    return `lcd.display(${x}, ${y}, str(${text}))\n`;
};
pyGen.forBlock['sh_lcd_scroll'] = function (block, generator) {
    let line = generator.valueToCode(block, 'LINE', pyGen.ORDER_ATOMIC) || '0';
    let text = generator.valueToCode(block, 'TEXT', pyGen.ORDER_NONE) || '""';
    let speed = generator.valueToCode(block, 'SPEED', pyGen.ORDER_ATOMIC) || '0.5';
    return `lcd.scroll_text(${line}, str(${text}), speed=${speed})\n`;
};
