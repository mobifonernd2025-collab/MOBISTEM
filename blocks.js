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
Blockly.Blocks['matrix_scroll'] = { init: function () { this.appendValueInput("TEXT").setCheck("String").appendField("🔠 Matrix chạy chữ"); this.appendValueInput("SPEED").setCheck("Number").appendField("tốc độ"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#9966FF"); } };
Blockly.Blocks['led_cleanup'] = { init: function () { this.appendDummyInput().appendField("💡 Xóa toàn bộ LED (cleanup)"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#9966FF"); } };

Blockly.Blocks['sound_play'] = { init: function () { this.appendValueInput("TRACK").setCheck("Number").appendField("🎵 Phát bài hát số"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#D65CD6"); } };
Blockly.Blocks['sound_vol'] = { init: function () { this.appendValueInput("VOL").setCheck("Number").appendField("🎵 Đặt âm lượng (0-30)"); this.setInputsInline(true); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#D65CD6"); } };
Blockly.Blocks['sound_stop'] = { init: function () { this.appendDummyInput().appendField("🔇 Tắt nhạc"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#D65CD6"); } };

Blockly.Blocks['sensor_dist'] = { init: function () { this.appendDummyInput().appendField("📡 Khoảng cách siêu âm (cm)"); this.setOutput(true, "Number"); this.setColour("#5CB1D6"); } };
Blockly.Blocks['sensor_line'] = { init: function () { this.appendDummyInput().appendField("📡 Đọc mắt dò Line").appendField(new Blockly.FieldDropdown([["Mắt 0", "0"], ["Mắt 1", "1"], ["Mắt 2", "2"], ["Mắt 3", "3"]]), "IDX"); this.setOutput(true, "Number"); this.setColour("#5CB1D6"); } };


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
pyGen.forBlock['matrix_scroll'] = function (block, generator) { let text = generator.valueToCode(block, 'TEXT', pyGen.ORDER_ATOMIC) || '""'; let speed = generator.valueToCode(block, 'SPEED', pyGen.ORDER_ATOMIC) || '0.02'; return `scroll_text(${text}, speed=${speed})\n`; };
pyGen.forBlock['led_cleanup'] = function () { return 'cleanup()\n'; };

pyGen.forBlock['sound_play'] = function (block, generator) { let track = generator.valueToCode(block, 'TRACK', pyGen.ORDER_ATOMIC) || '1'; return `sound.play_track(${track})\n`; };
pyGen.forBlock['sound_vol'] = function (block, generator) {
    let volSafe = clampCode(generator.valueToCode(block, 'VOL', pyGen.ORDER_ATOMIC) || '10', 0, 30);
    return `sound.set_volume(${volSafe})\n`;
};
pyGen.forBlock['sound_stop'] = function () { return 'sound.stop_music()\n'; };

pyGen.forBlock['sensor_dist'] = function () { return ['sensor.distance()', pyGen.ORDER_ATOMIC]; };
pyGen.forBlock['sensor_line'] = function (block) { let idx = block.getFieldValue('IDX'); return [`sensor.line_data()[${idx}]`, pyGen.ORDER_ATOMIC]; };
