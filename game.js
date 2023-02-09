import './js/libs/weapp-adapter'
require('./js/libs/typeEx.js');
import MiniGame from './js/18ext/MiniGame'
GameGlobal.webgl = true;
GameGlobal.localRes = true;
GameGlobal.loadData = true;

import * as PIXI from './js/libs/pixi'
require('./js/libs/pixi-tilemap')
require('./js/libs/pixi-picture')

PIXI.glCore.VertexArrayObject.FORCE_NATIVE = true;
PIXI.settings.GC_MODE = PIXI.GC_MODES.AUTO;
PIXI.tilemap.TileRenderer.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.tilemap.TileRenderer.DO_CLEAR = true;


// DataBase
GameGlobal.$dataActors = null;
GameGlobal.$dataClasses = null;
GameGlobal.$dataSkills = null;
GameGlobal.$dataItems = null;
GameGlobal.$dataWeapons = null;
GameGlobal.$dataArmors = null;
GameGlobal.$dataEnemies = null;
GameGlobal.$dataTroops = null;
GameGlobal.$dataStates = null;
GameGlobal.$dataAnimations = null;
GameGlobal.$dataTilesets = null;
GameGlobal.$dataCommonEvents = null;
GameGlobal.$dataSystem = null;
GameGlobal.$dataMapInfos = null;
GameGlobal.$dataMap = null;
GameGlobal.$gameTemp = null;
GameGlobal.$gameSystem = null;
GameGlobal.$gameScreen = null;
GameGlobal.$gameTimer = null;
GameGlobal.$gameMessage = null;
GameGlobal.$gameSwitches = null;
GameGlobal.$gameVariables = null;
GameGlobal.$gameSelfSwitches = null;
GameGlobal.$gameActors = null;
GameGlobal.$gameParty = null;
GameGlobal.$gameTroop = null;
GameGlobal.$gameMap = null;
GameGlobal.$gamePlayer = null;

GameGlobal.$qSprite = null;

import SceneManager from './js/managers/SceneManager.js'
import Scene_Boot from './js/scenes/Scene_Boot.js'
import ColliderManager from './js/managers/ColliderManager';
ColliderManager.init();
SceneManager.run(Scene_Boot);