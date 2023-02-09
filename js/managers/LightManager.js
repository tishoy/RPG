import Graphics from '../core/graphics'
import MiniGame from '../18ext/MiniGame'

/**
 * 光管理
 * 
 */
export default class LightManager {

    static _data = [];

    static Terrax_tint_speed = 60;
    static Terrax_tint_target = '#000000';

    static Terrax_ABS_skill_x = [];
    static Terrax_ABS_skill_y = [];
    static Terrax_ABS_skill = [];

    static Terrax_ABS_blast_x = [];
    static Terrax_ABS_blast_y = [];
    static Terrax_ABS_blast = [];
    static Terrax_ABS_blast_duration = [];
    static Terrax_ABS_blast_fade = [];
    static Terrax_ABS_blast_grow = [];
    static Terrax_ABS_blast_mapid = [];



    static colorcycle_count = [1000];
    static colorcycle_timer = [1000];

    static event_note = [];
    static event_id = [];
    static event_x = [];
    static event_y = [];
    static event_dir = [];
    static event_moving = [];
    static event_stacknumber = [];
    static event_eventcount = 0;

    static tile_lights = [];
    static tile_blocks = [];


    //settings
    static player_radius = 300;
    static reset_each_map = true;
    static daynightsavehours = 10;
    static daynightsavemin = 11;
    static daynightsavesec = 12;
    static flashlightoffset = 0;
    static killswitch = 'No';

    // 下边是设置中选项
    static add_to_options = true;
    static optiontext = 'Lighting effects';
    static options_lighting_on = true;

    static maxX = MiniGame.screenWidth;
    static maxY = MiniGame.screenHeight;

    // global timing staticiables
    static tint_oldseconds = 0;
    static tint_timer = 0;
    static moghunter_phase = -1;
    static oldmap = 0;
    static oldseconds = 0;
    static oldseconds2 = 0;
    static daynightdebug = false;
    static speeddebug = false;
    static gamedebug = false;
    static debugtimer = 0;
    static event_reload_counter = 0;
    static mogdebug = false;
    static terrax_tint_speed_old = 60;
    static terrax_tint_target_old = '#000000'
    static tileglow = 0;
    static glow_oldseconds = 0;
    static glow_dir = 1;
    static cyclecolor_counter = 0;
    static darkcount = 0;
    static daynightset = false;
    static averagetime = [];
    static averagetimecount = 0;

    constructor() {

    }

    static GetFirstRun() {
        if (typeof this._Terrax_Lighting_FirstRun == 'undefined') {
            this._Terrax_Lighting_FirstRun = true;
        }
        return this._Terrax_Lighting_FirstRun;
    };
    static SetFirstRun(value) {
        this._Terrax_Lighting_FirstRun = value;
    };
    static GetScriptActive() {
        if (typeof this._Terrax_Lighting_ScriptActive == 'undefined') {
            this._Terrax_Lighting_ScriptActive = true;
        }
        return this._Terrax_Lighting_ScriptActive;
    };
    static SetScriptActive(value) {
        this._Terrax_Lighting_ScriptActive = value;
    };
    static GetStopScript() {
        if (typeof this._Terrax_Lighting_StopScript == 'undefined') {
            this._Terrax_Lighting_StopScript = false;
        }
        return this._Terrax_Lighting_StopScript;
    };
    static SetStopScript(value) {
        this._Terrax_Lighting_StopScript = value;
    };

    static SetMog(value) {
        this._Terrax_Lighting_Mog = value;
    };
    static GetMog() {
        return this._Terrax_Lighting_Mog || true;
    };
    static SetMogTintArray(value) {
        this._Terrax_Lighting_MogTintArray = value;
    };
    static GetMogTintArray() {
        var default_MT = ['#555555', '#FFEFD5', '#FFFFFF', '#EEE8AA', '#555555', '#111111'];
        return this._Terrax_Lighting_MogTintArray || default_MT;
    };

    static SetTint(value) {
        LightManager._Terrax_Tint_Value = value;
    };
    static GetTint() {
        return LightManager._Terrax_Tint_Value || '#000000';
    };
    static SetTintTarget(value) {
        this._Terrax_TintTarget_Value = value;
    };
    static GetTintTarget() {
        return this._Terrax_TintTarget_Value || '#000000';
    };
    static SetTintSpeed(value) {
        this._Terrax_TintSpeed_Value = value;
    };
    static GetTintSpeed() {
        return this._Terrax_TintSpeed_Value || 60;
    };

    static SetFlashlight(value) {
        this._Terrax_Lighting_Flashlight = value;
    };
    static GetFlashlight() {
        return this._Terrax_Lighting_Flashlight || false;
    };
    static SetFlashlightDensity(value) {
        this._Terrax_Lighting_FlashlightDensity = value;
    };
    static GetFlashlightDensity() {
        return this._Terrax_Lighting_FlashlightDensity || 3;
    };
    static SetFlashlightLength(value) {
        this._Terrax_Lighting_FlashlightLength = value;
    };
    static GetFlashlightLength() {
        return this._Terrax_Lighting_FlashlightLength || 8;
    };
    static SetFlashlightWidth(value) {
        this._Terrax_Lighting_FlashlightWidth = value;
    };
    static GetFlashlightWidth() {
        return this._Terrax_Lighting_FlashlightWidth || 12;
    };

    static SetPlayerColor(value) {
        this._Terrax_Lighting_PlayerColor = value;
    };
    static GetPlayerColor() {
        return this._Terrax_Lighting_PlayerColor || '#FFFFFF';
    };
    static SetPlayerBrightness(value) {
        this._Terrax_Lighting_PlayerBrightness = value;
    };
    static GetPlayerBrightness(value) {
        this._Terrax_Lighting_PlayerBrightness = value || 0.0;
    };
    static SetRadius(value) {
        this._Terrax_Lighting_Radius = value;
    };
    static GetRadius() {
        //return this._Terrax_Lighting_Radius || 150;
        if (this._Terrax_Lighting_Radius === undefined) {
            return 150;
        } else {
            return this._Terrax_Lighting_Radius;
        }
    };
    static SetRadiusTarget(value) {
        this._Terrax_Lighting_RadiusTarget = value;
    };
    static GetRadiusTarget() {
        //return this._Terrax_Lighting_RadiusTarget || 150;
        if (this._Terrax_Lighting_RadiusTarget === undefined) {
            return 150;
        } else {
            return this._Terrax_Lighting_RadiusTarget;
        }
    };
    static SetRadiusSpeed(value) {
        this._Terrax_Lighting_RadiusSpeed = value;
    };
    static GetRadiusSpeed() {
        return this._Terrax_Lighting_RadiusSpeed || 0;
    };

    static SetDaynightColorArray(value) {
        this._Terrax_Lighting_DayNightColorArray = value;
    };
    static GetDaynightColorArray() {
        var default_color = ['#000000', '#000000', '#000000', '#000000',
            '#000000', '#000000', '#666666', '#AAAAAA',
            '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF',
            '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF',
            '#FFFFFF', '#FFFFFF', '#AAAAAA', '#666666',
            '#000000', '#000000', '#000000', '#000000'];
        return this._Terrax_Lighting_DayNightColorArray || default_color;
    };
    static SetDaynightSpeed(value) {
        this._Terrax_Lighting_DaynightSpeed = value;
    };
    static GetDaynightSpeed() {
        return this._Terrax_Lighting_DaynightSpeed || 10;
    };
    static SetDaynightCycle(value) {
        this._Terrax_Lighting_DaynightCycle = value;
    };
    static GetDaynightCycle() {
        return this._Terrax_Lighting_DaynightCycle || 0;
    };
    static SetDaynightTimer(value) {
        this._Terrax_Lighting_DaynightTimer = value;
    };
    static GetDaynightTimer() {
        return this._Terrax_Lighting_DaynightTimer || 0;
    };
    static SetDaynightHoursinDay(value) {
        this._Terrax_Lighting_DaynightHoursinDay = value;
    };
    static GetDaynightHoursinDay() {
        return this._Terrax_Lighting_DaynightHoursinDay || 24;
    };

    static SetFireRadius(value) {
        this._Terrax_Lighting_FireRadius = value;
    };
    static GetFireRadius() {
        return this._Terrax_Lighting_FireRadius || 7;
    };
    static SetFireColorshift(value) {
        this._Terrax_Lighting_FireColorshift = value;
    };
    static GetFireColorshift() {
        return this._Terrax_Lighting_FireColorshift || 10;
    };
    static SetFire(value) {
        this._Terrax_Lighting_Fire = value;
    };
    static GetFire() {
        return this._Terrax_Lighting_Fire || false;
    };

    static SetLightArrayId(value) {
        this._Terrax_Lighting_LightArrayId = value;
    };
    static GetLightArrayId() {
        var default_LAI = [];
        return this._Terrax_Lighting_LightArrayId || default_LAI;
    };
    static SetLightArrayState(value) {
        this._Terrax_Lighting_LightArrayState = value;
    };
    static GetLightArrayState() {
        var default_LAS = [];
        return this._Terrax_Lighting_LightArrayState || default_LAS;
    };
    static SetLightArrayColor(value) {
        this._Terrax_Lighting_LightArrayColor = value;
    };
    static GetLightArrayColor() {
        var default_LAS = [];
        return this._Terrax_Lighting_LightArrayColor || default_LAS;
    };

    static SetTileArray(value) {
        this._Terrax_Lighting_TileArray = value;
    };
    static GetTileArray() {
        var default_TA = [];
        return this._Terrax_Lighting_TileArray || default_TA;
    };
    static SetLightTags(value) {
        this._Terrax_Lighting_LightTags = value;
    };
    static GetLightTags() {
        var default_TA = [];
        return this._Terrax_Lighting_LightTags || default_TA;
    };
    static SetBlockTags(value) {
        this._Terrax_Lighting_BlockTags = value;
    };
    static GetBlockTags() {
        var default_TA = [];
        return this._Terrax_Lighting_BlockTags || default_TA;
    };


    static hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static ReloadMapEvents() {
        //**********************fill up new map-array *************************
        this.event_note = [];
        this.event_id = [];
        this.event_x = [];
        this.event_y = [];
        this.event_dir = [];
        this.event_moving = [];
        this.event_stacknumber = [];
        this.event_eventcount = GameGlobal.$gameMap.events().length;

        //Graphics.Debug('Reload','Reload map events ' + event_eventcount);

        for (var i = 0; i < this.event_eventcount; i++) {
            if (GameGlobal.$gameMap.events()[i]) {
                if (GameGlobal.$gameMap.events()[i].event()) {
                    var note = GameGlobal.$gameMap.events()[i].event().note;

                    var note_args = note.split(" ");
                    var note_command = note_args.shift().toLowerCase();
                    note_command = "light";
                    if (note_command == "light" || note_command == "fire" || note_command == "flashlight" || note_command == "daynight") {

                        this.event_note.push(note);
                        this.event_id.push($gameMap.events()[i]._eventId);
                        this.event_x.push($gameMap.events()[i]._realX);
                        this.event_y.push($gameMap.events()[i]._realY);
                        this.event_dir.push($gameMap.events()[i]._direction);
                        this.event_moving.push($gameMap.events()[i]._moveType || GameGlobal.$gameMap.events()[i]._moveRouteForcing);
                        this.event_stacknumber.push(i);
                    }
                    //Graphics.Debug('Reload movetype',$gameMap.events()[i]._moveRouteForcing)
                    // *********************************** DAY NIGHT Setting **************************
                    this.daynightset = false;
                    var mapnote = $dataMap.note.toLowerCase();
                    var searchnote = mapnote.search("daynight");
                    if (searchnote >= 0 || note_command == "daynight") {
                        daynightset = true;
                    }
                }
            }
        }
    }

    static ReloadTagArea() {
        // *************************** TILE TAG LIGHTSOURCES *********

        // clear arrays
        this.tile_lights = [];
        this.tile_blocks = [];

        // refill arrays

        var tilearray = this.GetTileArray();
        for (var i = 0; i < tilearray.length; i++) {

            var tilestr = tilearray[i];
            var tileargs = tilestr.split(";");
            var tile_type = tileargs[0];
            var tile_number = tileargs[1];
            var tile_on = tileargs[2];
            var tile_color = tileargs[3];
            var tile_radius = 0;
            var brightness = 0.0;
            var shape = 0;
            var xo1 = 0.0;
            var yo1 = 0.0;
            var xo2 = 0.0;
            var yo2 = 0.0;

            if (tile_type == 1 || tile_type == 2) {

                var b_arg = tileargs[4];
                if (typeof b_arg != 'undefined') {
                    shape = b_arg;
                }
                b_arg = tileargs[5];
                if (typeof b_arg != 'undefined') {
                    xo1 = b_arg;
                }
                b_arg = tileargs[6];
                if (typeof b_arg != 'undefined') {
                    yo1 = b_arg;
                }
                b_arg = tileargs[7];
                if (typeof b_arg != 'undefined') {
                    xo2 = b_arg;
                }
                b_arg = tileargs[8];
                if (typeof b_arg != 'undefined') {
                    yo2 = b_arg;
                }


            } else {
                tile_radius = tileargs[4];
                var b_arg = tileargs[5];
                if (typeof b_arg != 'undefined') {
                    var key = b_arg.substring(0, 1);
                    if (key == 'b' || key == 'B') {
                        brightness = Number(b_arg.substring(1)) / 100;
                    }
                }
            }

            if (tile_on == 1) {

                if (tile_type >= 3) {
                    // *************************** TILE TAG LIGHTSOURCES *********
                    for (var y = 0; y < $dataMap.height; y++) {
                        for (var x = 0; x < $dataMap.width; x++) {
                            var tag = 0;
                            if (tile_type == 3 || tile_type == 5 || tile_type == 7) {
                                tag = GameGlobal.$gameMap.terrainTag(x, y);
                            }          // tile light
                            if (tile_type == 4 || tile_type == 6 || tile_type == 8) {
                                tag = $dataMap.data[(5 * $dataMap.height + y) * $dataMap.width + x];
                            }  // region light
                            if (tag == tile_number) {
                                var tilecode = x + ";" + y + ";" + tile_type + ";" + tile_radius + ";" + tile_color + ";" + brightness;
                                this.tile_lights.push(tilecode);
                                //Graphics.Debug('Tilecode',tilecode+" "+this.tile_lights.length);
                                //Graphics.Debug('tile length',this.tile_lights.length);
                            }
                        }
                    }
                }


                // *************************** REDRAW MAPTILES FOR ROOFS ETC *********
                if (tile_type == 1 || tile_type == 2) {
                    for (var y = 0; y < $dataMap.height; y++) {
                        for (var x = 0; x < $dataMap.width; x++) {
                            //var tag = GameGlobal.$gameMap.terrainTag(x,y);
                            var tag = 0;
                            if (tile_type == 1) {
                                tag = GameGlobal.$gameMap.terrainTag(x, y);
                            }                  // tile block
                            if (tile_type == 2) {
                                tag = $dataMap.data[(5 * $dataMap.height + y) * $dataMap.width + x];
                            }  // region block
                            if (tag == tile_number) {
                                var tilecode = x + ";" + y + ";" + shape + ";" + xo1 + ";" + yo1 + ";" + xo2 + ";" + yo2 + ";" + tile_color;
                                this.tile_blocks.push(tilecode);
                                //Graphics.Debug('Tilecode', tilecode + " " +this.tile_blocks.length);

                            }
                        }
                    }
                }
            }

        }
        this.SetLightTags(this.tile_lights);
        this.SetBlockTags(this.tile_blocks);

    }

    // command
    static Tint(type, color) {



        if (type === 'set') {
            //var tint_value = args[1];
            this.SetTint(color);
            this.SetTintTarget(color);
        }
        if (type === 'fade') {
            //var Tint_target = args[1];
            //var Tint_speed = args[2];
            this.SetTintTarget(color);
            this.SetTintSpeed(color);
        }

        //Graphics.Debug('TINT',args[1]+' '+args[1]+' '+args[2]);
    }

    static fire() {
        this.light();
    }

    /**
     * 
     * @param {*} radius, radiusgrow, on, off, color, switch
     */
    static light(args) {

        //******************* Light radius 100 #FFFFFF ************************
        if (args[0] == 'radius') {
            var newradius = Number(args[1]);
            if (newradius >= 0) {
                this.SetRadius(newradius);
                this.SetRadiusTarget(newradius);

            }
            if (args.length > 2) {
                playercolor = args[2];
                var isValidPlayerColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(playercolor);
                if (!isValidPlayerColor) {
                    playercolor = '#FFFFFF'
                }
                this.SetPlayerColor(playercolor);
            }
            // player brightness
            if (args.length > 3) {
                var brightness = 0.0;
                var b_arg = args[3];
                if (typeof b_arg != 'undefined') {
                    var key = b_arg.substring(0, 1);
                    if (key == 'b' || key == 'B') {
                        var brightness = Number(b_arg.substring(1)) / 100;
                        this.SetPlayerBrightness(brightness);
                    }
                }
            }
        }

        //******************* Light radiusgrow 100 #FFFFFF ************************
        if (args[0] === 'radiusgrow') {
            var evid = this._eventId;
            //Graphics.printError('test',evid);
            var newradius = Number(args[1]);
            if (newradius >= 0) {

                var lightgrow_value = $gameVariables.GetRadius();
                var lightgrow_target = newradius;
                var lightgrow_speed = 0.0;
                if (args.length >= 4) {
                    if (player_radius > newradius) {
                        //shrinking
                        lightgrow_speed = (player_radius * 0.012) / Number(args[4]);
                    } else {
                        //growing
                        lightgrow_speed = (newradius * 0.012) / Number(args[4]);
                    }
                } else {
                    lightgrow_speed = (Math.abs(newradius - player_radius)) / 500;
                }

                //Graphics.Debug('RADIUS GROW',player_radius+' '+lightgrow_value+' '+lightgrow_target+' '+lightgrow_speed);


                $gameVariables.SetRadius(lightgrow_value);
                $gameVariables.SetRadiusTarget(lightgrow_target);
                $gameVariables.SetRadiusSpeed(lightgrow_speed);
            }
            // player color
            if (args.length > 2) {
                playercolor = args[2];
                var isValidPlayerColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(playercolor);
                if (!isValidPlayerColor) {
                    playercolor = '#FFFFFF'
                }
                $gameVariables.SetPlayerColor(playercolor);
            }
            // player brightness
            if (args.length > 3) {
                var brightness = 0.0;
                var b_arg = args[3];
                if (typeof b_arg != 'undefined') {
                    var key = b_arg.substring(0, 1);
                    if (key == 'b' || key == 'B') {
                        brightness = Number(b_arg.substring(1)) / 100;
                        $gameVariables.SetPlayerBrightness(brightness);
                    }
                }
            }

        }

        // *********************** TURN SPECIFIC LIGHT ON *********************
        if (args[0] === 'on') {

            var lightarray_id = $gameVariables.GetLightArrayId();
            var lightarray_state = $gameVariables.GetLightArrayState();
            var lightarray_color = $gameVariables.GetLightArrayColor();

            var lightid = Number(args[1]);
            var idfound = false;
            for (var i = 0; i < lightarray_id.length; i++) {
                if (lightarray_id[i] == lightid) {
                    idfound = true;
                    lightarray_state[i] = true;
                    //Graphics.Debug('state id',i);
                }
            }
            if (idfound == false) {
                lightarray_id.push(lightid);
                lightarray_state.push(true);
                lightarray_color.push('defaultcolor');
                //Graphics.Debug('new state id',i);
            }

            //Graphics.Debug("lightarrays",lightarray_id.length+' '+lightarray_state.length+' '+lightarray_color.length )

            $gameVariables.SetLightArrayId(lightarray_id);
            $gameVariables.SetLightArrayState(lightarray_state);
            $gameVariables.SetLightArrayColor(lightarray_color);
        }

        // *********************** TURN SPECIFIC LIGHT OFF *********************
        if (args[0] === 'off') {

            var lightarray_id = $gameVariables.GetLightArrayId();
            var lightarray_state = $gameVariables.GetLightArrayState();
            var lightarray_color = $gameVariables.GetLightArrayColor();

            var lightid = Number(args[1]);
            var idfound = false;
            for (var i = 0; i < lightarray_id.length; i++) {
                if (lightarray_id[i] == lightid) {
                    idfound = true;
                    lightarray_state[i] = false;
                }
            }
            if (idfound == false) {
                lightarray_id.push(lightid);
                lightarray_state.push(false);
                lightarray_color.push('defaultcolor');
            }
            $gameVariables.SetLightArrayId(lightarray_id);
            $gameVariables.SetLightArrayState(lightarray_state);
            $gameVariables.SetLightArrayColor(lightarray_color);
        }

        // *********************** SET COLOR *********************

        if (args[0] === 'color') {

            var newcolor = args[2];

            var lightarray_id = $gameVariables.GetLightArrayId();
            var lightarray_state = $gameVariables.GetLightArrayState();
            var lightarray_color = $gameVariables.GetLightArrayColor();

            var lightid = Number(args[1]);
            var idfound = false;
            for (var i = 0; i < lightarray_id.length; i++) {
                if (lightarray_id[i] == lightid) {
                    idfound = true;
                    //lightarray_state[i] = true;
                    lightarray_color[i] = newcolor;
                }
            }

            $gameVariables.SetLightArrayId(lightarray_id);
            $gameVariables.SetLightArrayState(lightarray_state);
            $gameVariables.SetLightArrayColor(lightarray_color);
        }


        // **************************** RESET ALL SWITCHES ***********************
        if (args[0] === 'switch' && args[1] === 'reset') {

            var lightarray_id = $gameVariables.GetLightArrayId();
            var lightarray_state = $gameVariables.GetLightArrayState();
            // reset switches to false
            for (var i = 0; i < $gameMap.events().length; i++) {
                if ($gameMap.events()[i]) {
                    for (var j = 0; j < lightarray_id.length; j++) {
                        if (lightarray_id[j] == lightid) {
                            var mapid = $gameMap.mapId();
                            var eventid = $gameMap.events()[i]._eventId;
                            var key = [mapid, eventid, 'D'];
                            $gameSelfSwitches.setValue(key, false);
                        }
                    }
                }
            }
            lightarray_id = [];
            lightarray_state = [];
            lightarray_color = [];
            $gameVariables.SetLightArrayId(lightarray_id);
            $gameVariables.SetLightArrayState(lightarray_state);
            $gameVariables.SetLightArrayColor(lightarray_color);
        }
    }



    // 变量
    static setValue(variableId, value) {
        if (variableId > 0 && variableId < GameGlobal.$dataSystem.variables.length) {
            if (typeof value === 'number') {
                value = Math.floor(value);
            }
            this._data[variableId] = value;
            this.onChange();
        }
    }

    static onChange() {
        GameGlobal.$gameMap.requestRefresh();
    }

    static onHitNPC(target, item) {
        // TX ADDED OnHitNPC
        this.Terrax_ABS_blast_x.push(target.cx() - GameGlobal.$gameMap.tileWidth() / 2);
        this.Terrax_ABS_blast_y.push(target.cy() - GameGlobal.$gameMap.tileHeight() / 2);
        this.Terrax_ABS_blast.push(item.settings.tx_onhitNPC);
        this.Terrax_ABS_blast_duration.push(-1);
        this.Terrax_ABS_blast_fade.push(-1);
        this.Terrax_ABS_blast_grow.push(-1);
        this.Terrax_ABS_blast_mapid.push(GameGlobal.$gameMap.mapId());
    }
}