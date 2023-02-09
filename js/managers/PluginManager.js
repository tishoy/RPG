
/**
 * create by 18tech
 * 
 */
/**
 * 18tech TODO
 * 修改为在Game中引用
 */
export default class PluginManager {
    constructor() {
        throw new Error('This is a static class');
    }

    static _path = 'js/plugins/';
    static _scripts = [];
    static _errorUrls = [];
    static _parameters = {}

    static setup = function (plugins) {
        plugins.forEach(function (plugin) {
            if (plugin.status && !this._scripts.contains(plugin.name)) {
                this.setParameters(plugin.name, plugin.parameters);
                this.loadScript(plugin.name + '.js');
                this._scripts.push(plugin.name);
            }
        }, this);
    }

    static checkErrors = function () {
        var url = this._errorUrls.shift();
        if (url) {
            throw new Error('Failed to load: ' + url);
        }
    }

    static parameters = function (name) {
        return this._parameters[name.toLowerCase()] || {}
    }

    static setParameters = function (name, parameters) {
        this._parameters[name.toLowerCase()] = parameters;
    }

    static loadScript = function (name) {

        var url = this._path + name;
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.async = false;
        script.onerror = this.onError.bind(this);
        script._url = url;
        document.body.appendChild(script);
    }

    static onError = function (e) {
        this._errorUrls.push(e.target._url);
    }

}