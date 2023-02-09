import ImageManager from '../managers/ImageManager'
import PluginManager from '../managers/PluginManager'
import MultiLayerSprite from './MultiLayerSprite';
import MultiLayerTilingSprite from './MultiLayerTilingSprite'
export default class MultiLayer {
    static assign = Object.assign || function (target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var key in source) {
                target[key] = source[key];
            }
        }
        return target;
    };

    static RE = /<ulds>([^]*?)<\/ulds>/ig;
    static DEFAULT_SETTINGS = {
        // z: parseFloat(MultiLayer.parameters['Default Z']),
        // path: MultiLayer.parameters['Default Path'],
        z: 0.5,
        path: "parallaxes",
        smooth: true
    };

    static bmps = [];

    constructor(settings) {
        settings = MultiLayer.assign({}, MultiLayer.DEFAULT_SETTINGS, settings);
        var sprite, spriteTiling;
        var bitmap = ImageManager.loadBitmap('img/' + settings.path + '/',
            settings.name, settings.hue, settings.smooth);
        if (settings.loop) {
            spriteTiling = new MultiLayerTilingSprite(bitmap);
            delete settings.path;
            delete settings.name;
            delete settings.loop;
            delete settings.hue;
            delete settings.smooth;
            spriteTiling.assignSettings(settings);
            return spriteTiling;
        } else {
            sprite = new MultiLayerSprite(bitmap)
            delete settings.path;
            delete settings.name;
            delete settings.loop;
            delete settings.hue;
            delete settings.smooth;
            sprite.assignSettings(settings);
            return sprite;
        }


    }
}