
export default class MiniMap {
    static passageCacheCountMax = 5;
    static regex = {
        wallEvent: /<(?:ミニマップ|MINIMAP)\s*[:\s]\s*(?:壁|障害物|WALL)>/i,
        moveEvent: /<(?:ミニマップ|MINIMAP)\s*[:\s]\s*(?:移動|MOVE)>/i,
        person: /<(?:ミニマップ|MINIMAP)\s*[:\s]\s*(?:人物|PERSON)\s*(\d+)>/i,
        object: /<(?:ミニマップ|MINIMAP)\s*[:\s]\s*OBJ(?:ECT)?\s*(\d+)>/i
    };
    static keysRequireNumber = ['person', 'object'];
    static dirFlags = { down: 0x01, left: 0x02, right: 0x04, up: 0x08 };
    static maskStyles = { none: 0, ellipse: 1, roundedRect: 2, hex1: 3, hex2: 4 };

}