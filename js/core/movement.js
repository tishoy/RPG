export default class Movement {
    constructor() {
        throw new Error('This is a static class');
    }

    static grid = 1;
    static tileSize = 48;
    static offGrid = true;
    static smartMove = 2;
    static midPass = false;
    static moveOnClick = true;
    static diagonal = true;
    static collision = '#FF0000'; // will be changable in a separate addon
    static water1 = '#00FF00'; // will be changable in a separate addon
    static water2 = '#0000FF'; // will be changable in a separate addon
    static water1Tag = 1; // will be changable in a separate addon
    static water2Tag = 2; // will be changable in a separate addon
    static playerCollider = Movement.convertColliderStruct({ Type: "box", Width: 36, Height: 24, 'Offset X': 6, 'Offset Y': 24 });
    static eventCollider = Movement.convertColliderStruct({ Type: "box", Width: 36, Height: 24, 'Offset X': 6, 'Offset Y': 24 });
    static presets = [];
    static showColliders = false;
    static tileBoxes = {
        1537: [48, 6, 0, 42],
        1538: [6, 48],
        1539: [[48, 6, 0, 42], [6, 48]],
        1540: [6, 48, 42],
        1541: [[48, 6, 0, 42], [6, 48, 42]],
        1542: [[6, 48], [6, 48, 42]],
        1543: [[48, 6, 0, 42], [6, 48], [6, 48, 42]],
        1544: [48, 6],
        1545: [[48, 6], [48, 6, 0, 42]],
        1546: [[48, 6], [6, 48]],
        1547: [[48, 6], [48, 6, 0, 42], [6, 48]],
        1548: [[48, 6], [6, 48, 42]],
        1549: [[48, 6], [48, 6, 0, 42], [6, 48, 42]],
        1550: [[48, 6], [6, 48], [6, 48, 42]],
        1551: [48, 48], // Impassable A5, B
        2063: [48, 48], // Impassable A1
        2575: [48, 48],
        3586: [6, 48],
        3588: [6, 48, 42],
        3590: [[6, 48], [6, 48, 42]],
        3592: [48, 6],
        3594: [[48, 6], [6, 48]],
        3596: [[48, 6], [6, 48, 42]],
        3598: [[48, 6], [6, 48], [6, 48, 42]],
        3599: [48, 48],  // Impassable A2, A3, A4
        3727: [48, 48]
    };


    init(Presets) {
        Presets.forEach(function (preset) {
            Movement.presets[preset.ID] = Movement.convertColliderStruct(preset);
        });

        var rs = Movement.tileSize / 48;
        for (var key in Movement.tileBoxes) {
            if (Movement.tileBoxes.hasOwnProperty(key)) {
                for (var i = 0; i < Movement.tileBoxes[key].length; i++) {
                    if (Movement.tileBoxes[key][i].constructor === Array) {
                        for (var j = 0; j < Movement.tileBoxes[key][i].length; j++) {
                            Movement.tileBoxes[key][i][j] *= rs;
                        }
                    } else {
                        Movement.tileBoxes[key][i] *= rs;
                    }
                }
            }
        }
    }
    // following will be changable in a separate addon
    static regionColliders = {};
    static colliderMap = {};

    static convertColliderStruct(struct) {
        return [
            struct.Type,
            struct.Width,
            struct.Height,
            struct['Offset X'],
            struct['Offset Y']
        ]
    }
}