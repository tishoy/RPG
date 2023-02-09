import * as PIXI from '../libs/pixi'
import LightManager from '../managers/LightManager'
import Bitmap from '../core/bitmap';
import Sprite from '../core/sprite'
import Graphics from '../core/graphics'

export default class Lightmask extends PIXI.Container {
	constructor() {
		super();
		this.initialize();
	}

	initialize() {
		this._width = Graphics.width;
		this._height = Graphics.height;
		this._sprites = [];
		this._createBitmap();
	}

	update() {
		this._updateMask();
	};

	//@method _createBitmaps

	_createBitmap() {
		this._maskBitmap = new Bitmap(LightManager.maxX + 20, LightManager.maxY);   // one big bitmap to fill the intire screen with black
		var canvas = this._maskBitmap.canvas;             // a bit larger then setting to take care of screenshakes

	};

	StartTiming() {
		// Timing function for debugging
		var datenow = new Date();
		LightManager.debugtimer = datenow.getTime();
	}

	StopTiming() {
		// speedtest function
		if (LightManager.speeddebug == true) {
			var datenow = new Date();
			var debugtimer2 = datenow.getTime();
			averagetime[averagetimecount] = debugtimer2 - debugtimer;
			averagetimecount++;
			var totalcount = 0;
			for (var y = 0; y < averagetime.length; y++) {
				totalcount = totalcount + averagetime[y];
			}
			if (averagetimecount > 500) {
				averagetimecount = 0;
				Graphics.Debug('Speedtest', totalcount / 500);
			}
		}
	}

    /**
	 * @method _updateAllSprites
	 * @private
	 */
	_updateMask() {

		this.StartTiming();
		// ****** DETECT MAP CHANGES ********
		var map_id = GameGlobal.$gameMap.mapId();
		if (map_id != LightManager.oldmap) {
			LightManager.oldmap = map_id;

			// set mog-tints on map change
			if (LightManager.GetMog() == true) {
				var searchdaynight = "";
				if (typeof GameGlobal.$dataMap.note != 'undefined') {
					searchdaynight = GameGlobal.$dataMap.note.toLowerCase();
				}
				if (searchdaynight.search('mogtime') >= 0) {
					var new_phase = 0;
					if (GameGlobal.$gameSwitches.value(21)) { new_phase = 0; }
					if (GameGlobal.$gameSwitches.value(22)) { new_phase = 1; }
					if (GameGlobal.$gameSwitches.value(23)) { new_phase = 2; }
					if (GameGlobal.$gameSwitches.value(24)) { new_phase = 3; }
					if (GameGlobal.$gameSwitches.value(25)) { new_phase = 4; }
					if (GameGlobal.$gameSwitches.value(26)) { new_phase = 5; }
					moghunter_phase = new_phase;
					var newtint = '#000000';
					var mogtint = LightManager.GetMogTintArray();
					if (new_phase == 0) { newtint = mogtint[0]; }
					if (new_phase == 1) { newtint = mogtint[1]; }
					if (new_phase == 2) { newtint = mogtint[2]; }
					if (new_phase == 3) { newtint = mogtint[3]; }
					if (new_phase == 4) { newtint = mogtint[4]; }
					if (new_phase == 5) { newtint = mogtint[5]; }
					LightManager.SetTintTarget(newtint);
					LightManager.SetTint(newtint);
				} else {
					LightManager.SetTintTarget('#000000');
					LightManager.SetTint('#000000');
				}
			}


			// recalc tile and region tags.
			LightManager.ReloadTagArea();

			//clear color cycle arrays
			for (var i = 0; i < 1000; i++) {
				LightManager.colorcycle_count[i] = 0;
				LightManager.colorcycle_timer[i] = 0;
			}

			LightManager.ReloadMapEvents();  // reload map events on map chance

			if (LightManager.reset_each_map == true) {
				// reset switches to false

				var lightarray_id = LightManager.GetLightArrayId();
				var lightarray_state = LightManager.GetLightArrayState();
				var lightarray_color = LightManager.GetLightArrayColor();

				for (var i = 0; i < GameGlobal.$gameMap.events().length; i++) {
					if (GameGlobal.$gameMap.events()[i]) {
						for (var j = 0; j < lightarray_id.length; j++) {
							if (lightarray_id[j] == lightid) {
								var mapid = GameGlobal.$gameMap.mapId();
								var eventid = GameGlobal.$gameMap.events()[i]._eventId;
								var key = [mapid, eventid, 'D'];
								GameGlobal.$gameSelfSwitches.setValue(key, false);
							}
						}
					}
				}
				lightarray_id = [];
				lightarray_state = [];
				lightarray_color = [];
				LightManager.SetLightArrayId(lightarray_id);
				LightManager.SetLightArrayState(lightarray_state);
				LightManager.SetLightArrayColor(lightarray_color);
			}
		}

		// reload mapevents if event_data has chanced (deleted or spawned events/saves)
		if (LightManager.event_eventcount != GameGlobal.$gameMap.events().length) {
			LightManager.ReloadMapEvents();
			//Graphics.Debug('EventSpawn', GameGlobal.$gameMap.events().length);
		}

		// remove old sprites
		for (var i = 0; i < this._sprites.length; i++) {	  // remove all old sprites
			this._removeSprite();
		}

		if (LightManager.options_lighting_on == true) {

			if (LightManager.GetStopScript() == false) {

				if (LightManager.GetScriptActive() == true && GameGlobal.$gameMap.mapId() >= 0) {
					// moghunter timesystem compatibility

					var searchdaynight = "";
					if (typeof GameGlobal.$dataMap.note != 'undefined') {
						searchdaynight = GameGlobal.$dataMap.note.toLowerCase();
					}


					if (LightManager.GetMog() == true) {

						if (searchdaynight.search('mogtime') >= 0) {

							var debugline = "";
							var new_phase = 0;
							if (GameGlobal.$gameSwitches.value(21)) {
								new_phase = 0;
								debugline = debugline + " SW21:DAWN "
							} //Dawn
							if (GameGlobal.$gameSwitches.value(22)) {
								new_phase = 1;
								debugline = debugline + " SW22:RISE "
							} //Rise
							if (GameGlobal.$gameSwitches.value(23)) {
								new_phase = 2;
								debugline = debugline + " SW23:DAY "
							} //Day
							if (GameGlobal.$gameSwitches.value(24)) {
								new_phase = 3;
								debugline = debugline + " SW24:SUNSET "
							} //Set
							if (GameGlobal.$gameSwitches.value(25)) {
								new_phase = 4;
								debugline = debugline + " SW25:DUSK "
							} //Dusk
							if (GameGlobal.$gameSwitches.value(26)) {
								new_phase = 5;
								debugline = debugline + " SW26:NIGHT "
							} //Night

							if (debugline == "") {
								debugline = "No switches (21-26) active, Mog is probably not loaded"
							}

							if (new_phase != moghunter_phase) {
								moghunter_phase = new_phase;
								var newtint = '#000000';
								var mogtint = LightManager.GetMogTintArray();
								if (new_phase == 0) {
									newtint = mogtint[0];
								}
								if (new_phase == 1) {
									newtint = mogtint[1];
								}
								if (new_phase == 2) {
									newtint = mogtint[2];
								}
								if (new_phase == 3) {
									newtint = mogtint[3];
								}
								if (new_phase == 4) {
									newtint = mogtint[4];
								}
								if (new_phase == 5) {
									newtint = mogtint[5];
								}

								//Terrax_tint_target = newtint;
								//Terrax_tint_speed = 10;
								//LightManager.setTintValue(Terrax_tint_target);
								LightManager.SetTintTarget(newtint);
								LightManager.SetTintSpeed(10);

							}

							if (mogdebug) {
								var tinttarget = LightManager.GetTintTarget();
								debugline = debugline + " Tintcolor: " + tinttarget;
								Graphics.Debug('MogTimeSystem Debug', debugline);
							}
						}
					}

					LightManager.event_reload_counter++;  // reload map events every 200 cycles just in case.
					if (LightManager.event_reload_counter > 200) {
						LightManager.event_reload_counter = 0;
						LightManager.ReloadMapEvents()
					}



					// are there lightsources on this map?
					var darkenscreen = false;

					// if (true) {
					if (searchdaynight.search('daynight') >= 0) {
						this._addSprite(-20, 0, this._maskBitmap); // daynight tag? yes.. then turn off the lights
						darkenscreen = true;
					} else {
						for (var i = 0; i < LightManager.event_note.length; i++) {
							//if (GameGlobal.$gameMap.events()[i]) {
							var note = LightManager.event_note[i];
							var note_args = note.split(" ");
							var note_command = note_args.shift().toLowerCase();
							note_command = "light";
							if (note_command == "light" || note_command == "fire" || note_command == "daynight" || note_command == "flashlight") {
								this._addSprite(-20, 0, this._maskBitmap); // light event? yes.. then turn off the lights
								darkenscreen = true;
								break;
							}
							//}
						}
					}


					if (darkenscreen == true) {


						// ******** GROW OR SHRINK GLOBE PLAYER *********

						var firstrun = LightManager.GetFirstRun();
						if (firstrun === true) {
							LightManager.Terrax_tint_speed = 60;
							LightManager.Terrax_tint_target = '#000000';
							LightManager.terrax_tint_speed_old = 60;
							LightManager.terrax_tint_target_old = '#000000';
							LightManager.SetFirstRun(false);
							LightManager.SetRadius(LightManager.player_radius);
							//Graphics.Debug('FIRSTRUN',player_radius);
						} else {
							LightManager.player_radius = LightManager.GetRadius();
						}
						var lightgrow_value = LightManager.player_radius;
						var lightgrow_target = LightManager.GetRadiusTarget();
						var lightgrow_speed = LightManager.GetRadiusSpeed();

						//Graphics.Debug('RADIUS',player_radius+' '+lightgrow_value+' '+lightgrow_target+' '+lightgrow_speed);

						if (lightgrow_value < lightgrow_target) {
							lightgrow_value = lightgrow_value + lightgrow_speed;
							if (lightgrow_value > lightgrow_target) {
								//other wise it can keep fliping back and forth between > and <
								lightgrow_value = lightgrow_target;
							}
							LightManager.player_radius = lightgrow_value;
						}
						if (lightgrow_value > lightgrow_target) {
							lightgrow_value = lightgrow_value - lightgrow_speed;
							if (lightgrow_value < lightgrow_target) {
								//other wise it can keep fliping back and forth between > and <
								lightgrow_value = lightgrow_target;
							}
							LightManager.player_radius = lightgrow_value;
						}

						LightManager.SetRadius(LightManager.player_radius);
						LightManager.SetRadiusTarget(lightgrow_target);

						// ****** PLAYER LIGHTGLOBE ********

						var canvas = this._maskBitmap.canvas;
						var ctx = canvas.getContext("2d");
						this._maskBitmap.fillRect(0, 0, LightManager.maxX + 20, LightManager.maxY, '#000000');


						ctx.globalCompositeOperation = 'lighter';
						//Graphics.Debug('Lighter',player_radius';
						//	ctx.globalCompositeOperation = 'screen';
						//	Graphics.Debug('Screen',player_radius);

						var pw = GameGlobal.$gameMap.tileWidth();
						var ph = GameGlobal.$gameMap.tileHeight();
						var dx = GameGlobal.$gameMap.displayX();
						var dy = GameGlobal.$gameMap.displayY();
						var px = GameGlobal.$gamePlayer._realX;
						var py = GameGlobal.$gamePlayer._realY;
						var pd = GameGlobal.$gamePlayer._direction;

						//Graphics.Debug('Screen',pw+" "+ph+" "+dx+" "+dy+" "+px+" "+py);


						var x1 = (pw / 2) + ((px - dx) * pw);
						var y1 = (ph / 2) + ((py - dy) * ph);
						var paralax = false;
						// paralax does something weird with coordinates.. recalc needed
						if (dx > GameGlobal.$gamePlayer.x) {
							var xjump = GameGlobal.$gameMap.width() - Math.floor(dx - px);
							x1 = (pw / 2) + (xjump * pw);
						}
						if (dy > GameGlobal.$gamePlayer.y) {
							var yjump = GameGlobal.$gameMap.height() - Math.floor(dy - py);
							y1 = (ph / 2) + (yjump * ph);
						}

						var playerflashlight = LightManager.GetFlashlight();
						var playercolor = LightManager.GetPlayerColor();
						var flashlightlength = LightManager.GetFlashlightLength();
						var flashlightwidth = LightManager.GetFlashlightWidth();
						var playerflicker = LightManager.GetFire();
						var playerbrightness = LightManager.GetPlayerBrightness();


						var iplayer_radius = Math.floor(LightManager.player_radius);

						if (iplayer_radius > 0) {
							if (playerflashlight == true) {
								this._maskBitmap.radialgradientFillRect2(x1, y1, 20, iplayer_radius, playercolor, '#000000', pd, flashlightlength, flashlightwidth);
							}
							y1 = y1 - LightManager.flashlightoffset;
							if (iplayer_radius < 100) {
								// dim the light a bit at lower lightradius for a less focused effect.
								var r = hexToRgb(playercolor).r;
								var g = hexToRgb(playercolor).g;
								var b = hexToRgb(playercolor).b;
								g = g - 50;
								r = r - 50;
								b = b - 50;
								if (g < 0) {
									g = 0;
								}
								if (r < 0) {
									r = 0;
								}
								if (b < 0) {
									b = 0;
								}
								var newcolor = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

								this._maskBitmap.radialgradientFillRect(x1, y1, 0, iplayer_radius, newcolor, '#000000', playerflicker, playerbrightness);
							} else {
								this._maskBitmap.radialgradientFillRect(x1, y1, 20, iplayer_radius, playercolor, '#000000', playerflicker, playerbrightness);
							}

						}


						// *********************************** DAY NIGHT CYCLE TIMER **************************

						var daynightspeed = LightManager.GetDaynightSpeed();

						if (daynightspeed > 0 && daynightspeed < 5000) {

							var datenow = new Date();
							var seconds = Math.floor(datenow.getTime() / 10);
							if (seconds > LightManager.oldseconds) {

								var daynighttimer = LightManager.GetDaynightTimer();     // timer = minutes * speed
								var daynightcycle = LightManager.GetDaynightCycle();     // cycle = hours
								var daynighthoursinday = LightManager.GetDaynightHoursinDay();   // 24

								LightManager.oldseconds = seconds;
								daynighttimer = daynighttimer + 1;
								var daynightminutes = Math.floor(daynighttimer / daynightspeed);
								var daynighttimeover = daynighttimer - (daynightspeed * daynightminutes);
								var daynightseconds = Math.floor(daynighttimeover / daynightspeed * 60);
								if (LightManager.daynightdebug == true) {
									var daynightseconds2 = daynightseconds;
									if (daynightseconds < 10) {
										daynightseconds2 = '0' + daynightseconds;
									}
									var hourvalue = '-';
									var hourset = 'Not set';
									if (LightManager.daynightsavehours > 0) {
										hourvalue = LightManager.value(LightManager.daynightsavehours);
										hourset = LightManager.daynightsavehours
									}
									var minutevalue = '-';
									var minuteset = 'Not set';
									if (LightManager.daynightsavemin > 0) {
										minutevalue = LightManager.value(daynightsavemin);
										minuteset = LightManager.daynightsavemin
									}
									var secondvalue = '-';
									var secondset = 'Not set';
									if (daynightsavesec > 0) {
										secondvalue = LightManager.value(daynightsavesec);
										secondset = daynightsavesec
									}

									var minutecounter = LightManager.value(daynightsavemin);
									var secondcounter = LightManager.value(daynightsavesec);
									Graphics.Debug('Debug Daynight system', daynightcycle + ' ' + daynightminutes + ' ' + daynightseconds2 +
										'<br>' + 'Hours  -> Variable: ' + hourset + '  Value: ' + hourvalue +
										'<br>' + 'Minutes-> Variable: ' + minuteset + '  Value: ' + minutevalue +
										'<br>' + 'Seconds-> Variable: ' + secondset + '  Value: ' + secondvalue);

								}
								if (LightManager.daynightsavemin > 0) {
									LightManager.setValue(LightManager.daynightsavemin, daynightminutes);
								}
								if (LightManager.daynightsavesec > 0) {
									LightManager.setValue(LightManager.daynightsavesec, daynightseconds);
								}

								if (daynighttimer >= (daynightspeed * 60)) {

									daynightcycle = daynightcycle + 1;
									if (daynightcycle >= daynighthoursinday) {
										daynightcycle = 0;
									}
									if (LightManager.daynightsavehours > 0) {
										LightManager.setValue(LightManager.daynightsavehours, daynightcycle);
									}
									daynighttimer = 0;
								}
								LightManager.SetDaynightTimer(daynighttimer);     // timer = minutes * speed
								LightManager.SetDaynightCycle(daynightcycle);     // cycle = hours
							}
						}

						// EFFECTS AND QUASI ABS SUPPORT


						// SKILLS/MISSLES (effects without duration)

						for (var i = 0; i < LightManager.Terrax_ABS_skill_x.length; i++) {
							var settings = LightManager.Terrax_ABS_skill[i];
							if (settings) {
								if (settings != 'undefined') {
									var setstring = settings.toString();
									var lightset = setstring.split(",");
									//Graphics.Debug('Test',setstring+" "+lightset[0]+" "+lightset[1]);

									var px = LightManager.Terrax_ABS_skill_x[i];
									var py = LightManager.Terrax_ABS_skill_y[i];
									var x1 = px - (dx * pw);
									var y1 = py - (dy * ph);

									this._maskBitmap.radialgradientFillRect(x1, y1, 0, lightset[0], lightset[1], '#000000', false);
								}
							}
						}

						// clear arrays after draw
						LightManager.Terrax_ABS_skill_x = [];
						LightManager.Terrax_ABS_skill_y = [];
						LightManager.Terrax_ABS_skill = [];

						// BLASTS (effect with duration)



						for (var i = 0; i < LightManager.Terrax_ABS_blast_x.length; i++) {
							var settings = LightManager.Terrax_ABS_blast[i];
							if (settings) {
								if (settings != 'undefined') {
									var setstring = settings.toString();

									// Settings : Lightset[]
									// 0. Radius
									// 1. Color
									// 2. Time in Frames
									// 3. Keyword (optional)   FADEIN FADEOUT FADEBOTH GROW SHRINK GROWSHRINK BIO
									// 4. Fade/Grow Speed in frames

									var lightset = setstring.split(",");

									if (Number(lightset[2]) > 0 && LightManager.Terrax_ABS_blast_duration[i] == -1) {
										LightManager.Terrax_ABS_blast_duration[i] = lightset[2]
									}

									var fcolor = lightset[1];
									var fradius = lightset[0];

									if (setstring.length > 2) {  // SPECIALS  FADE/GROW ETC.

										if (lightset[3] == 'FADEIN' || lightset[3] == 'FADEINOUT' || lightset[3] == 'BIO') {

											var fadelength = Number(lightset[4]);   // number of frames to fade in

											if (LightManager.Terrax_ABS_blast_fade[i] == -1) {
												LightManager.Terrax_ABS_blast_fade[i] = 0;
											}
											if (LightManager.Terrax_ABS_blast_fade[i] < fadelength) {
												LightManager.Terrax_ABS_blast_fade[i] = LightManager.Terrax_ABS_blast_fade[i] + 1;

												var startcolor = "#000000";
												var targetcolor = lightset[1];
												var fadecount = Terrax_ABS_blast_fade[i];

												var r = hexToRgb(startcolor).r;
												var g = hexToRgb(startcolor).g;
												var b = hexToRgb(startcolor).b;

												var r2 = hexToRgb(targetcolor).r;
												var g2 = hexToRgb(targetcolor).g;
												var b2 = hexToRgb(targetcolor).b;

												var stepR = (r2 - r) / (fadelength);
												var stepG = (g2 - g) / (fadelength);
												var stepB = (b2 - b) / (fadelength);

												var r3 = Math.floor(r + (stepR * fadecount));
												var g3 = Math.floor(g + (stepG * fadecount));
												var b3 = Math.floor(b + (stepB * fadecount));
												if (r3 < 0) {
													r3 = 0
												}
												if (g3 < 0) {
													g3 = 0
												}
												if (b3 < 0) {
													b3 = 0
												}
												if (r3 > 255) {
													r3 = 255
												}
												if (g3 > 255) {
													g3 = 255
												}
												if (b3 > 255) {
													b3 = 255
												}
												fcolor = "#" + ((1 << 24) + (r3 << 16) + (g3 << 8) + b3).toString(16).slice(1);
												//Graphics.Debug('FADEIN COLOR', fcolor + " " + r + " " + r2 + " " + stepR + " " + r3);

												if (Terrax_ABS_blast_fade[i] == fadelength) {
													Terrax_ABS_blast_fade[i] = 100000;  // for fadeinout
												}
											}
										}

										if (lightset[3] == 'FADEOUT') {

											var fadelength = Number(lightset[4]);   // number of frames to fade out
											if (Terrax_ABS_blast_fade[i] == -1 && Terrax_ABS_blast_duration[i] < fadelength) {
												// start fading when blastduration equals fadelength
												Terrax_ABS_blast_fade[i] = 0;
											}
											if (Terrax_ABS_blast_fade[i] < fadelength && Terrax_ABS_blast_fade[i] >= 0) {
												Terrax_ABS_blast_fade[i] = Terrax_ABS_blast_fade[i] + 1;
												//Graphics.Debug('FADEOUT',Terrax_ABS_blast_fade[i]);
												var startcolor = lightset[1];
												var targetcolor = "#000000";
												var fadecount = Terrax_ABS_blast_fade[i];

												var r = hexToRgb(startcolor).r;
												var g = hexToRgb(startcolor).g;
												var b = hexToRgb(startcolor).b;

												var r2 = hexToRgb(targetcolor).r;
												var g2 = hexToRgb(targetcolor).g;
												var b2 = hexToRgb(targetcolor).b;

												var stepR = (r2 - r) / (fadelength);
												var stepG = (g2 - g) / (fadelength);
												var stepB = (b2 - b) / (fadelength);

												var r3 = Math.floor(r + (stepR * fadecount));
												var g3 = Math.floor(g + (stepG * fadecount));
												var b3 = Math.floor(b + (stepB * fadecount));
												if (r3 < 0) {
													r3 = 0
												}
												if (g3 < 0) {
													g3 = 0
												}
												if (b3 < 0) {
													b3 = 0
												}
												if (r3 > 255) {
													r3 = 255
												}
												if (g3 > 255) {
													g3 = 255
												}
												if (b3 > 255) {
													b3 = 255
												}
												fcolor = "#" + ((1 << 24) + (r3 << 16) + (g3 << 8) + b3).toString(16).slice(1);
												//Graphics.Debug('FADEIN COLOR', fcolor + " " + r + " " + r2 + " " + stepR + " " + r3);
											}
										}

										if (lightset[3] == 'FADEINOUT' || lightset[3] == 'BIO') {
											// fadeout only, fadein is handled by fadein
											var fadelength = Number(lightset[4]);   // number of frames to fade out
											if (Terrax_ABS_blast_fade[i] == 100000 && Terrax_ABS_blast_duration[i] < fadelength) {
												// start fading when blastduration equals fadelength
												Terrax_ABS_blast_fade[i] = 100001;
											}
											if (Terrax_ABS_blast_fade[i] - 100000 < fadelength && Terrax_ABS_blast_fade[i] > 100000) {
												Terrax_ABS_blast_fade[i] = Terrax_ABS_blast_fade[i] + 1;
												//Graphics.Debug('FADEOUT',Terrax_ABS_blast_fade[i]);
												var startcolor = lightset[1];
												var targetcolor = "#000000";
												var fadecount = Terrax_ABS_blast_fade[i] - 100000;

												var r = hexToRgb(startcolor).r;
												var g = hexToRgb(startcolor).g;
												var b = hexToRgb(startcolor).b;

												var r2 = hexToRgb(targetcolor).r;
												var g2 = hexToRgb(targetcolor).g;
												var b2 = hexToRgb(targetcolor).b;

												var stepR = (r2 - r) / (fadelength);
												var stepG = (g2 - g) / (fadelength);
												var stepB = (b2 - b) / (fadelength);

												var r3 = Math.floor(r + (stepR * fadecount));
												var g3 = Math.floor(g + (stepG * fadecount));
												var b3 = Math.floor(b + (stepB * fadecount));
												if (r3 < 0) {
													r3 = 0
												}
												if (g3 < 0) {
													g3 = 0
												}
												if (b3 < 0) {
													b3 = 0
												}
												if (r3 > 255) {
													r3 = 255
												}
												if (g3 > 255) {
													g3 = 255
												}
												if (b3 > 255) {
													b3 = 255
												}
												fcolor = "#" + ((1 << 24) + (r3 << 16) + (g3 << 8) + b3).toString(16).slice(1);
												//Graphics.Debug('FADEIN COLOR', fcolor + " " + r + " " + r2 + " " + stepR + " " + r3);
											}

										}

										if (lightset[3] == 'GROW' || lightset[3] == 'GROWSHRINK' || lightset[3] == 'BIO') {

											var growlength = Number(lightset[4]);   // number of frames to grow

											if (Terrax_ABS_blast_grow[i] == -1) {
												Terrax_ABS_blast_grow[i] = 0;
											}
											if (Terrax_ABS_blast_grow[i] < growlength) {

												if (lightset[3] == 'BIO') {
													Terrax_ABS_blast_grow[i] = Terrax_ABS_blast_grow[i] + 0.5;
												} else {
													Terrax_ABS_blast_grow[i] = Terrax_ABS_blast_grow[i] + 1;
												}

												var startradius = 0;
												var targetradius = lightset[0];
												var radiuscount = Terrax_ABS_blast_grow[i];

												var step = (targetradius - startradius) / (growlength);

												fradius = Math.floor(step * radiuscount);

											}
											if (Terrax_ABS_blast_grow[i] == growlength) {
												Terrax_ABS_blast_grow[i] = 100000;
											}
										}

										if (lightset[3] == 'SHRINK') {

											var shrinklength = Number(lightset[4]);   // number of frames to shrink

											if (Terrax_ABS_blast_grow[i] == -1 && Terrax_ABS_blast_duration[i] < shrinklength) {
												Terrax_ABS_blast_grow[i] = 0;
											}
											if (Terrax_ABS_blast_grow[i] < shrinklength && Terrax_ABS_blast_grow[i] >= 0) {
												Terrax_ABS_blast_grow[i] = Terrax_ABS_blast_grow[i] + 1;

												var startradius = lightset[0];
												var targetradius = 0;
												var radiuscount = Terrax_ABS_blast_grow[i];

												var step = (startradius - targetradius) / (shrinklength);
												fradius = Number(lightset[0]) - Math.floor(step * radiuscount);

											}

										}

										if (lightset[3] == 'GROWSHRINK') {
											// GROW is handled in grow
											var shrinklength = Number(lightset[4]);   // number of frames to shrink

											//Graphics.Debug('GROWSHRINK',Terrax_ABS_blast_grow[i]);

											if (Terrax_ABS_blast_grow[i] == 100000 && Terrax_ABS_blast_duration[i] < shrinklength) {
												Terrax_ABS_blast_grow[i] = 100001;
											}
											if (Terrax_ABS_blast_grow[i] - 100000 < shrinklength && Terrax_ABS_blast_grow[i] > 100000) {
												Terrax_ABS_blast_grow[i] = Terrax_ABS_blast_grow[i] + 1;

												var startradius = lightset[0];
												var targetradius = 0;
												var radiuscount = Terrax_ABS_blast_grow[i] - 100000;

												var step = (startradius - targetradius) / (shrinklength);
												fradius = Number(lightset[0]) - Math.floor(step * radiuscount);

											}
										}

									}


									if (LightManager.Terrax_ABS_blast_duration[i] > 0) {
										LightManager.Terrax_ABS_blast_duration[i]--;
										//Graphics.Debug('Test',i+" "+lightset[0]+" "+lightset[1]+" "+Terrax_ABS_blast_duration[i]);
										if (LightManager.Terrax_ABS_blast_mapid[i] == GameGlobal.$gameMap.mapId()) {
											var px = LightManager.Terrax_ABS_blast_x[i];
											var py = LightManager.Terrax_ABS_blast_y[i];

											var x1 = px - (dx * pw);
											var y1 = py - (dy * ph);

											// paralaxloop does something weird with coordinates.. recalc needed

											if (GameGlobal.$dataMap.scrollType === 2 || GameGlobal.$dataMap.scrollType === 3) {
												if (dx - 10 > px / pw) {
													var lxjump = GameGlobal.$gameMap.width() - (dx - px / pw);
													x1 = (lxjump * pw);
												}
											}
											if (GameGlobal.$dataMap.scrollType === 1 || GameGlobal.$dataMap.scrollType === 3) {
												if (dy - 10 > py / ph) {
													var lyjump = GameGlobal.$gameMap.height() - (dy - py / ph);
													y1 = (lyjump * ph);
												}
											}
											x1 = x1 + (pw / 2);
											y1 = y1 + (ph / 2);

											//Graphics.Debug('Test',dy+" "+py+" "+y1+" "+GameGlobal.$gameMap.height()+" "+lyjump);
											this._maskBitmap.radialgradientFillRect(x1, y1, 0, fradius, fcolor, '#000000', false);
										}
									} else {
										LightManager.Terrax_ABS_blast[i] = "DELETE";
									}
								}
							}
						}

						// remove all expired items (not done in previous loop because it cases flickering)
						for (var i = 0; i < LightManager.Terrax_ABS_blast_x.length; i++) {
							var settings = LightManager.Terrax_ABS_blast[i];
							if (settings) {
								if (settings != 'undefined') {
									var setstring = settings.toString();
									if (setstring == "DELETE") {
										LightManager.Terrax_ABS_blast_x.splice(i, 1);
										LightManager.Terrax_ABS_blast_y.splice(i, 1);
										LightManager.Terrax_ABS_blast.splice(i, 1);
										LightManager.Terrax_ABS_blast_duration.splice(i, 1);
										LightManager.Terrax_ABS_blast_mapid.splice(i, 1);
										LightManager.Terrax_ABS_blast_fade.splice(i, 1);
										LightManager.Terrax_ABS_blast_grow.splice(i, 1);
									}
								}
							}
						}


						// ********** OTHER LIGHTSOURCES **************

						for (var i = 0; i < LightManager.event_note.length; i++) {
							//if (GameGlobal.$gameMap.events()[i]) {

							//var note = GameGlobal.$gameMap.events()[i].event().note;
							//var evid = GameGlobal.$gameMap.events()[i]._eventId;
							var note = LightManager.event_note[i];
							var evid = LightManager.event_id[i];

							var note_args = note.split(" ");
							var note_command = note_args.shift().toLowerCase();


							if (note_command == "light" || note_command == "fire" || note_command == "flashlight") {

								var objectflicker = false;
								if (note_command == "fire") {
									objectflicker = true;
								}

								var light_radius = 1;
								var flashlength = 8;
								var flashwidth = 12;
								if (note_command == "flashlight") {
									flashlength = Number(note_args.shift());
									flashwidth = Number(note_args.shift());
									if (flashlength == 0) {
										flashlightlength = 8
									}
									if (flashwidth == 0) {
										flashlightlength = 12
									}
								} else {
									light_radius = note_args.shift();
								}
								// light radius
								if (light_radius >= 0) {

									// light color
									var colorvalue = note_args.shift();

									// Cycle colors


									if (colorvalue == 'cycle' && evid < 1000) {

										var cyclecolor0 = note_args.shift();
										var cyclecount0 = Number(note_args.shift());
										var cyclecolor1 = note_args.shift();
										var cyclecount1 = Number(note_args.shift());
										var cyclecolor2 = '#000000';
										var cyclecount2 = 0;
										var cyclecolor3 = '#000000';
										var cyclecount3 = 0;

										var morecycle = note_args.shift();
										if (typeof morecycle != 'undefined') {
											if (morecycle.substring(0, 1) == "#") {
												cyclecolor2 = morecycle;
												cyclecount2 = Number(note_args.shift());
												morecycle = note_args.shift();
												if (typeof morecycle != 'undefined') {
													if (morecycle.substring(0, 1) == "#") {
														cyclecolor3 = morecycle;
														cyclecount3 = Number(note_args.shift());

													} else {
														note_args.unshift(morecycle);
													}
												}
											} else {
												note_args.unshift(morecycle);
											}
										}

										var switch0 = '0';
										var switch1 = '0';
										var switch2 = '0';
										var switch3 = '0';

										var switches = note_args.shift();
										if (typeof switches != 'undefined') {
											if (switches.length == 7) {
												if (switches.substring(0, 3) == "SS:") {
													switch0 = switches.substring(3, 4);
													switch1 = switches.substring(4, 5);
													switch2 = switches.substring(5, 6);
													switch3 = switches.substring(6, 7);
												} else {
													note_args.unshift(switches);
												}
											} else {
												note_args.unshift(switches);
											}
										}

										// set cycle color
										switch (LightManager.colorcycle_count[evid]) {
											case 0:
												colorvalue = cyclecolor0;
												break;
											case 1:
												colorvalue = cyclecolor1;
												break;
											case 2:
												colorvalue = cyclecolor2;
												break;
											case 3:
												colorvalue = cyclecolor3;
												break;
											default:
												colorvalue = '#FFFFFF';
										}

										// cycle timing
										//var datenow = new Date();
										//var seconds = Math.floor(datenow.getTime() / 100);
										cyclecolor_counter = cyclecolor_counter + 1;

										if (cyclecolor_counter > 10) {
											cyclecolor_counter = 0;

											//reset all switches
											if (switch0 != '0') {
												key = [map_id, evid, switch0];
												GameGlobal.$gameSelfSwitches.setValue(key, false);
											}
											if (switch1 != '0') {
												key = [map_id, evid, switch1];
												GameGlobal.$gameSelfSwitches.setValue(key, false);
											}
											if (switch2 != '0') {
												key = [map_id, evid, switch2];
												GameGlobal.$gameSelfSwitches.setValue(key, false);
											}
											if (switch3 != '0') {
												key = [map_id, evid, switch3];
												GameGlobal.$gameSelfSwitches.setValue(key, false);
											}


											if (LightManager.colorcycle_count[evid] == 0) {
												LightManager.colorcycle_timer[evid]++;

												if (LightManager.colorcycle_timer[evid] > cyclecount0) {
													LightManager.colorcycle_count[evid] = 1;
													LightManager.colorcycle_timer[evid] = 0;
													if (switch1 != '0') {
														key = [map_id, evid, switch1];
														GameGlobal.$gameSelfSwitches.setValue(key, true);
													}
												} else {
													if (switch0 != '0') {
														key = [map_id, evid, switch0];
														GameGlobal.$gameSelfSwitches.setValue(key, true);
													}
												}

											}
											if (LightManager.colorcycle_count[evid] == 1) {
												LightManager.colorcycle_timer[evid]++;
												if (LightManager.colorcycle_timer[evid] > cyclecount1) {
													LightManager.colorcycle_count[evid] = 2;
													LightManager.colorcycle_timer[evid] = 0;
													if (switch2 != '0') {
														key = [map_id, evid, switch2];
														GameGlobal.$gameSelfSwitches.setValue(key, true);
													}
												} else {
													if (switch1 != '0') {
														key = [map_id, evid, switch1];
														GameGlobal.$gameSelfSwitches.setValue(key, true);
													}
												}
											}
											if (LightManager.colorcycle_count[evid] == 2) {
												LightManager.colorcycle_timer[evid]++;
												if (LightManager.colorcycle_timer[evid] > cyclecount2) {
													LightManager.colorcycle_count[evid] = 3;
													LightManager.colorcycle_timer[evid] = 0;
													if (switch3 != '0') {
														key = [map_id, evid, switch3];
														GameGlobal.$gameSelfSwitches.setValue(key, true);
													}
												} else {
													if (switch2 != '0') {
														key = [map_id, evid, switch2];
														GameGlobal.$gameSelfSwitches.setValue(key, true);
													}
												}
											}
											if (LightManager.colorcycle_count[evid] == 3) {
												LightManager.colorcycle_timer[evid]++;
												if (LightManager.colorcycle_timer[evid] > cyclecount3) {
													LightManager.colorcycle_count[evid] = 0;
													LightManager.colorcycle_timer[evid] = 0;
													if (switch0 != '0') {
														key = [map_id, evid, switch0];
														GameGlobal.$gameSelfSwitches.setValue(key, true);
													}
												} else {
													if (switch3 != '0') {
														key = [map_id, evid, switch3];
														GameGlobal.$gameSelfSwitches.setValue(key, true);
													}
												}
											}
											//Graphics.Debug('cycleswitch',switch0 + " "+ switch1+ " "+ switch2+ " "+ switch3);

										}

									} else {
										var isValidColor = /(^#[0-9A-F]{6}GameGlobal.$)|(^#[0-9A-F]{3}GameGlobal.$)/i.test(colorvalue);
										if (!isValidColor) {
											colorvalue = '#FFFFFF'
										}
									}

									// brightness and direction

									var brightness = 0.0;
									var direction = 0;
									var next_arg = note_args.shift();

									if (typeof next_arg != 'undefined') {
										var key = next_arg.substring(0, 1);
										if (key == 'b' || key == 'B') {
											brightness = Number(next_arg.substring(1)) / 100;
											next_arg = note_args.shift();
											if (typeof next_arg != 'undefined') {
												key = next_arg.substring(0, 1);
											}
										}
										if (key == 'd' || key == 'D') {
											direction = next_arg.substring(1);
											next_arg = note_args.shift();
										}
									}

									// conditional lighting
									var lightid = 0;
									if (typeof next_arg != 'undefined') {
										lightid = next_arg;
									}

									var state = true;
									if (lightid > 0) {
										state = false;

										var lightarray_id = LightManager.GetLightArrayId();
										var lightarray_state = LightManager.GetLightArrayState();
										var lightarray_color = LightManager.GetLightArrayColor();

										for (var j = 0; j < lightarray_id.length; j++) {
											if (lightarray_id[j] == lightid) {
												// idfound = true;
												state = lightarray_state[j];

												var newcolor = lightarray_color[j];

												if (newcolor != 'defaultcolor') {
													colorvalue = newcolor;
												}

												//Graphics.Debug("lightarrays",lightarray_id.length+' '+lightarray_state.length+' '+lightarray_color.length )

												//var mapid = GameGlobal.$gameMap.mapId();
												//var eventid = GameGlobal.$gameMap.events()[i]._eventId;

												//Graphics.printError('test',mapid+' '+eventid);
												key = [map_id, evid, 'D'];
												if (state == true) {
													GameGlobal.$gameSelfSwitches.setValue(key, true);
												} else {
													GameGlobal.$gameSelfSwitches.setValue(key, false);
												}
											}
										}
									}

									// kill switch
									if (LightManager.killswitch == 'A' || LightManager.killswitch == 'B' || LightManager.killswitch == 'C' || LightManager.killswitch == 'D') {
										key = [map_id, evid, killswitch];
										if (GameGlobal.$gameSelfSwitches.value(key) == true) {
											state = false;
											//Graphics.Debug('Deathswitch',killswitch);
										}
									}



									// show light
									if (state == true) {

										var lpx = 0;
										var lpy = 0;
										var ldir = 0;
										if (event_moving[i] > 0) {
											lpx = GameGlobal.$gameMap.events()[event_stacknumber[i]]._realX;
											lpy = GameGlobal.$gameMap.events()[event_stacknumber[i]]._realY;
											ldir = GameGlobal.$gameMap.events()[event_stacknumber[i]]._direction;

											//	lpx = event_x[i];
											//	lpy = event_y[i];
											//	ldir = event_dir[i];

										} else {
											lpx = event_x[i];
											lpy = event_y[i];
											ldir = event_dir[i];
										}

										//var lpx = GameGlobal.$gameMap.events()[i]._realX;
										//var lpy = GameGlobal.$gameMap.events()[i]._realY;
										//var ldir = GameGlobal.$gameMap.events()[i]._direction;

										// moving lightsources
										var flashlight = false;
										if (note_command == "flashlight") {
											flashlight = true;

											var walking = event_moving[i];
											if (walking == false) {
												var tldir = Number(note_args.shift());
												if (!isNaN(tldir)) {
													if (tldir < 0 || ldir >= 5) {
														ldir = 4
													}
													if (tldir == 1) {
														ldir = 8
													}
													if (tldir == 2) {
														ldir = 6
													}
													if (tldir == 3) {
														ldir = 2
													}
													if (tldir == 4) {
														ldir = 4
													}
												}
											}


										}

										//Graphics.Debug('ldir',ldir);

										var lx1 = (pw / 2) + ((lpx - dx) * pw);
										var ly1 = (ph / 2) + ((lpy - dy) * ph);
										// paralaxloop does something weird with coordinates.. recalc needed

										if (GameGlobal.$dataMap.scrollType === 2 || GameGlobal.$dataMap.scrollType === 3) {
											if (dx - 10 > lpx) {
												var lxjump = GameGlobal.$gameMap.width() - (dx - lpx);
												lx1 = (pw / 2) + (lxjump * pw);
											}
										}
										if (GameGlobal.$dataMap.scrollType === 1 || GameGlobal.$dataMap.scrollType === 3) {
											if (dy - 10 > lpy) {
												var lyjump = GameGlobal.$gameMap.height() - (dy - lpy);
												ly1 = (ph / 2) + (lyjump * ph);
											}
										}

										if (flashlight == true) {
											this._maskBitmap.radialgradientFillRect2(lx1, ly1, 0, light_radius, colorvalue, '#000000', ldir, flashlength, flashwidth);
										} else {
											this._maskBitmap.radialgradientFillRect(lx1, ly1, 0, light_radius, colorvalue, '#000000', objectflicker, brightness, direction);
										}

									}



								}
							}



							//}
						}



						// *************************** TILE TAG *********************
						//

						//var tilearray = LightManager.GetTileArray();

						//glow/colorfade
						var glowdatenow = new Date();
						var glowseconds = Math.floor(glowdatenow.getTime() / 100);

						if (glowseconds > LightManager.glow_oldseconds) {
							//Graphics.Debug('GLOW',tileglow);
							LightManager.glow_oldseconds = glowseconds;
							LightManager.tileglow = LightManager.tileglow + LightManager.glow_dir;

							if (LightManager.tileglow > 120) {
								LightManager.glow_dir = -1;
							}
							if (LightManager.tileglow < 1) {
								LightManager.glow_dir = 1;
							}
						}

						LightManager.tile_lights = LightManager.GetLightTags();
						LightManager.tile_blocks = LightManager.GetBlockTags();

						//Graphics.Debug('tile length',tile_lights.length);
						for (var i = 0; i < LightManager.tile_lights.length; i++) {
							var tilestr = LightManager.tile_lights[i];

							var tileargs = tilestr.split(";");
							var x = tileargs[0];
							var y = tileargs[1];
							var tile_type = tileargs[2];
							var tile_radius = tileargs[3];
							var tile_color = tileargs[4];
							var brightness = tileargs[5];

							//Graphics.Debug('tile',x+" "+y+" "+tile_type+" "+tile_radius+" "+tile_color+" "+brightness);

							var x1 = (pw / 2) + (x - dx) * pw;
							var y1 = (ph / 2) + (y - dy) * ph;

							if (GameGlobal.$dataMap.scrollType === 2 || GameGlobal.$dataMap.scrollType === 3) {
								if (dx - 5 > x) {
									var lxjump = GameGlobal.$gameMap.width() - (dx - x);
									x1 = (pw / 2) + (lxjump * pw);
								}
							}
							if (GameGlobal.$dataMap.scrollType === 1 || GameGlobal.$dataMap.scrollType === 3) {
								if (dy - 5 > y) {
									var lyjump = GameGlobal.$gameMap.height() - (dy - y);
									y1 = (ph / 2) + (lyjump * ph);
								}
							}

							if (tile_type == 3 || tile_type == 4) {
								this._maskBitmap.radialgradientFillRect(x1, y1, 0, tile_radius, tile_color, '#000000', false, brightness); // Light
							} else if (tile_type == 5 || tile_type == 6) {
								this._maskBitmap.radialgradientFillRect(x1, y1, 0, tile_radius, tile_color, '#000000', true, brightness);  // Fire
							} else {

								//Graphics.Debug('Tiletype',tile_type);
								var r = hexToRgb(tile_color).r;
								var g = hexToRgb(tile_color).g;
								var b = hexToRgb(tile_color).b;


								r = Math.floor(r + (60 - tileglow));
								g = Math.floor(g + (60 - tileglow));
								b = Math.floor(b + (60 - tileglow));
								//Graphics.Debug('Tiletype',tileglow+' '+r+' '+g+' '+b);
								if (r < 0) {
									r = 0;
								}
								if (g < 0) {
									g = 0;
								}
								if (b < 0) {
									b = 0;
								}
								if (r > 255) {
									r = 255;
								}
								if (g > 255) {
									g = 255;
								}
								if (b > 255) {
									b = 255;
								}

								var newtile_color = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
								//Graphics.Debug('Tiletype',tileglow+' '+r+' '+g+' '+b+' '+newtile_color);
								this._maskBitmap.radialgradientFillRect(x1, y1, 0, tile_radius, newtile_color, '#000000', false, brightness);
							}


						}



						ctx.globalCompositeOperation = "multiply";
						for (var i = 0; i < LightManager.tile_blocks.length; i++) {
							var tilestr = LightManager.tile_blocks[i];
							var tileargs = tilestr.split(";");

							var x = tileargs[0];
							var y = tileargs[1];
							var shape = tileargs[2];
							var xo1 = tileargs[3];
							var yo1 = tileargs[4];
							var xo2 = tileargs[5];
							var yo2 = tileargs[6];
							var tile_color = tileargs[7];


							var x1 = (x - dx) * pw;
							var y1 = (y - dy) * ph;

							if (GameGlobal.$dataMap.scrollType === 2 || GameGlobal.$dataMap.scrollType === 3) {
								if (dx - 5 > x) {
									var lxjump = GameGlobal.$gameMap.width() - (dx - x);
									x1 = (lxjump * pw);
								}
							}
							if (GameGlobal.$dataMap.scrollType === 1 || GameGlobal.$dataMap.scrollType === 3) {
								if (dy - 5 > y) {
									var lyjump = GameGlobal.$gameMap.height() - (dy - y);
									y1 = (lyjump * ph);
								}
							}
							if (shape == 0) {
								this._maskBitmap.FillRect(x1, y1, pw, ph, tile_color);
							}
							if (shape == 1) {
								x1 = x1 + Number(xo1);
								y1 = y1 + Number(yo1);
								this._maskBitmap.FillRect(x1, y1, Number(xo2), Number(yo2), tile_color);
							}
							if (shape == 2) {
								x1 = x1 + Number(xo1);
								y1 = y1 + Number(yo1);
								//this._maskBitmap.FillRect(x1,y1,pw,ph,tile_color);
								this._maskBitmap.FillCircle(x1, y1, Number(xo2), Number(yo2), tile_color);
							}
						}
						ctx.globalCompositeOperation = 'lighter';


						// *********************************** DAY NIGHT CYCLE FILTER **************************

						if (LightManager.daynightset == true) {

							var daynighttimer = LightManager.GetDaynightTimer();     // timer = minutes * speed
							var daynightcycle = LightManager.GetDaynightCycle();     // cycle = hours
							var daynighthoursinday = LightManager.GetDaynightHoursinDay();   // 24
							var daynightcolors = LightManager.GetDaynightColorArray();

							var color1 = daynightcolors[daynightcycle];

							if (daynightspeed > 0 && daynightspeed < 5000) {
								var nextcolor = daynightcycle + 1;
								if (nextcolor >= daynighthoursinday) {
									nextcolor = 0;
								}
								var color2 = daynightcolors[nextcolor];

								var r = hexToRgb(color1).r;
								var g = hexToRgb(color1).g;
								var b = hexToRgb(color1).b;

								var r2 = hexToRgb(color2).r;
								var g2 = hexToRgb(color2).g;
								var b2 = hexToRgb(color2).b;

								var stepR = (r2 - r) / (60 * daynightspeed);
								var stepG = (g2 - g) / (60 * daynightspeed);
								var stepB = (b2 - b) / (60 * daynightspeed);

								r = Math.floor(r + (stepR * daynighttimer));
								g = Math.floor(g + (stepG * daynighttimer));
								b = Math.floor(b + (stepB * daynighttimer));

							}
							color1 = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

							this._maskBitmap.FillRect(0, 0, LightManager.maxX + 20, LightManager.maxY, color1);
						}

						// *********************************** TINT **************************


						if (LightManager.daynightset == false) {
							var tint_value = LightManager.GetTint();
							var tint_target = LightManager.GetTintTarget();
							var tint_speed = LightManager.GetTintSpeed();


							if (LightManager.Terrax_tint_target != LightManager.terrax_tint_target_old) {
								LightManager.terrax_tint_target_old = LightManager.Terrax_tint_target;
								tint_target = LightManager.Terrax_tint_target;
								LightManager.SetTintTarget(tint_target);
							}
							if (LightManager.Terrax_tint_speed != LightManager.terrax_tint_speed_old) {
								LightManager.terrax_tint_speed_old = LightManager.Terrax_tint_speed;
								tint_speed = LightManager.Terrax_tint_speed;
								LightManager.SetTintSpeed(tint_speed);
							}

							//Graphics.Debug('TINT',tint_value+' '+tint_target+' '+tint_speed);

							var tcolor = tint_value;
							if (tint_value != tint_target) {

								var tintdatenow = new Date();
								var tintseconds = Math.floor(tintdatenow.getTime() / 10);
								if (tintseconds > LightManager.tint_oldseconds) {
									LightManager.tint_oldseconds = tintseconds;
									LightManager.tint_timer++;
								}

								var r = hexToRgb(tint_value).r;
								var g = hexToRgb(tint_value).g;
								var b = hexToRgb(tint_value).b;

								var r2 = hexToRgb(tint_target).r;
								var g2 = hexToRgb(tint_target).g;
								var b2 = hexToRgb(tint_target).b;

								var stepR = (r2 - r) / (60 * tint_speed);
								var stepG = (g2 - g) / (60 * tint_speed);
								var stepB = (b2 - b) / (60 * tint_speed);

								var r3 = Math.floor(r + (stepR * LightManager.tint_timer));
								var g3 = Math.floor(g + (stepG * LightManager.tint_timer));
								var b3 = Math.floor(b + (stepB * LightManager.tint_timer));
								if (r3 < 0) {
									r3 = 0
								}
								if (g3 < 0) {
									g3 = 0
								}
								if (b3 < 0) {
									b3 = 0
								}
								if (r3 > 255) {
									r3 = 255
								}
								if (g3 > 255) {
									g3 = 255
								}
								if (b3 > 255) {
									b3 = 255
								}
								var reddone = false;
								var greendone = false;
								var bluedone = false;
								if (stepR >= 0 && r3 >= r2) {
									reddone = true;
								}
								if (stepR <= 0 && r3 <= r2) {
									reddone = true;
								}
								if (stepG >= 0 && g3 >= g2) {
									greendone = true;
								}
								if (stepG <= 0 && g3 <= g2) {
									greendone = true;
								}
								if (stepB >= 0 && b3 >= b2) {
									bluedone = true;
								}
								if (stepB <= 0 && b3 <= b2) {
									bluedone = true;
								}
								if (reddone == true && bluedone == true && greendone == true) {
									LightManager.SetTint(tint_target);
								}
								tcolor = "#" + ((1 << 24) + (r3 << 16) + (g3 << 8) + b3).toString(16).slice(1);
							} else {
								LightManager.tint_timer = 0;
							}

							//Graphics.Debug('TINT',tint_value+' '+tint_target+' '+tint_speed+' '+tcolor);

							this._maskBitmap.FillRect(-20, 0, LightManager.maxX + 20, LightManager.maxY, tcolor);
						}

						// reset drawmode to normal
						ctx.globalCompositeOperation = 'source-over';

					}
				}
			}
		}
		this.StopTiming();
	};

	/**
	 * @method _addSprite
	 * @private
	 */
	_addSprite(x1, y1, selectedbitmap) {

		var sprite = new Sprite(this.viewport);
		sprite.bitmap = selectedbitmap;
		sprite.opacity = 255;
		sprite.blendMode = 2;
		sprite.x = x1;
		sprite.y = y1;
		this._sprites.push(sprite);
		this.addChild(sprite);
		sprite.rotation = 0;
		sprite.ax = 0;
		sprite.ay = 0;
		sprite.opacity = 255;
	};

	/**
	 * @method _removeSprite
	 * @private
	 */
	_removeSprite() {
		this.removeChild(this._sprites.pop());
	};
}