import Utils from "../core/utils"
import LZString from '../18ext/lz-string.js'

/**
 * create by 18tech
 * 存档管理
 */

export default class StorageManager {
    constructor() {
        throw new Error('This is a static class');
    }


    static save = function(savefileId, json) {
        if (this.isLocalMode()) {
            this.saveToLocalFile(savefileId, json);
        } else {
            this.saveToWebStorage(savefileId, json);
        }
    }
    
    static load = function(savefileId) {
        if (this.isLocalMode()) {
            return this.loadFromLocalFile(savefileId);
        } else {
            return this.loadFromWebStorage(savefileId);
        }
    }
    
    static exists = function(savefileId) {
        if (this.isLocalMode()) {
            return this.localFileExists(savefileId);
        } else {
            return this.webStorageExists(savefileId);
        }
    }
    
    static remove = function(savefileId) {
        if (this.isLocalMode()) {
            this.removeLocalFile(savefileId);
        } else {
            this.removeWebStorage(savefileId);
        }
    }
    
    static backup = function(savefileId) {
        if (this.exists(savefileId)) {
            if (this.isLocalMode()) {
                var data = this.loadFromLocalFile(savefileId);
                var compressed = LZString.compressToBase64(data);
                var fs = require('fs');
                var dirPath = this.localFileDirectoryPath();
                var filePath = this.localFilePath(savefileId) + ".bak";
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath);
                }
                fs.writeFileSync(filePath, compressed);
            } else {
                var data = this.loadFromWebStorage(savefileId);
                var compressed = LZString.compressToBase64(data);
                var key = this.webStorageKey(savefileId) + "bak";
                localStorage.setItem(key, compressed);
            }
        }
    }
    
    static backupExists = function(savefileId) {
        if (this.isLocalMode()) {
            return this.localFileBackupExists(savefileId);
        } else {
            return this.webStorageBackupExists(savefileId);
        }
    }
    
    static cleanBackup = function(savefileId) {
        if (this.backupExists(savefileId)) {
            if (this.isLocalMode()) {
                var fs = require('fs');
                var dirPath = this.localFileDirectoryPath();
                var filePath = this.localFilePath(savefileId);
                fs.unlinkSync(filePath + ".bak");
            } else {
                var key = this.webStorageKey(savefileId);
                localStorage.removeItem(key + "bak");
            }
        }
    }
    
    static restoreBackup = function(savefileId) {
        if (this.backupExists(savefileId)) {
            if (this.isLocalMode()) {
                var data = this.loadFromLocalBackupFile(savefileId);
                var compressed = LZString.compressToBase64(data);
                var fs = require('fs');
                var dirPath = this.localFileDirectoryPath();
                var filePath = this.localFilePath(savefileId);
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath);
                }
                fs.writeFileSync(filePath, compressed);
                fs.unlinkSync(filePath + ".bak");
            } else {
                var data = this.loadFromWebStorageBackup(savefileId);
                var compressed = LZString.compressToBase64(data);
                var key = this.webStorageKey(savefileId);
                localStorage.setItem(key, compressed);
                localStorage.removeItem(key + "bak");
            }
        }
    }
    
    static isLocalMode = function() {
        return Utils.isNwjs();
    }
    
    static saveToLocalFile = function(savefileId, json) {
        var data = LZString.compressToBase64(json);
        var fs = require('fs');
        var dirPath = this.localFileDirectoryPath();
        var filePath = this.localFilePath(savefileId);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
        fs.writeFileSync(filePath, data);
    }
    
    static loadFromLocalFile = function(savefileId) {
        var data = null;
        var fs = require('fs');
        var filePath = this.localFilePath(savefileId);
        if (fs.existsSync(filePath)) {
            data = fs.readFileSync(filePath, { encoding: 'utf8' });
        }
        return LZString.decompressFromBase64(data);
    }
    
    static loadFromLocalBackupFile = function(savefileId) {
        var data = null;
        var fs = require('fs');
        var filePath = this.localFilePath(savefileId) + ".bak";
        if (fs.existsSync(filePath)) {
            data = fs.readFileSync(filePath, { encoding: 'utf8' });
        }
        return LZString.decompressFromBase64(data);
    }
    
    static localFileBackupExists = function(savefileId) {
        var fs = require('fs');
        return fs.existsSync(this.localFilePath(savefileId) + ".bak");
    }
    
    static localFileExists = function(savefileId) {
        var fs = require('fs');
        return fs.existsSync(this.localFilePath(savefileId));
    }
    
    static removeLocalFile = function(savefileId) {
        var fs = require('fs');
        var filePath = this.localFilePath(savefileId);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
    
    static saveToWebStorage = function(savefileId, json) {
        var key = this.webStorageKey(savefileId);
        var data = LZString.compressToBase64(json);
        localStorage.setItem(key, data);
    }
    
    static loadFromWebStorage = function(savefileId) {
        var key = this.webStorageKey(savefileId);
        var data = localStorage.getItem(key);
        return LZString.decompressFromBase64(data);
    }
    
    static loadFromWebStorageBackup = function(savefileId) {
        var key = this.webStorageKey(savefileId) + "bak";
        var data = localStorage.getItem(key);
        return LZString.decompressFromBase64(data);
    }
    
    static webStorageBackupExists = function(savefileId) {
        var key = this.webStorageKey(savefileId) + "bak";
        return !!localStorage.getItem(key);
    }
    
    static webStorageExists = function(savefileId) {
        var key = this.webStorageKey(savefileId);
        return !!localStorage.getItem(key);
    }
    
    static removeWebStorage = function(savefileId) {
        var key = this.webStorageKey(savefileId);
        localStorage.removeItem(key);
    }
    
    static localFileDirectoryPath = function() {
        var path = require('path');
    
        var base = path.dirname(process.mainModule.filename);
        return path.join(base, 'save/');
    }
    
    static localFilePath = function(savefileId) {
        var name;
        if (savefileId < 0) {
            name = 'config.rpgsave';
        } else if (savefileId === 0) {
            name = 'global.rpgsave';
        } else {
            name = 'file%1.rpgsave'.format(savefileId);
        }
        return this.localFileDirectoryPath() + name;
    }
    
    static webStorageKey = function(savefileId) {
        if (savefileId < 0) {
            return 'RPG Config';
        } else if (savefileId === 0) {
            return 'RPG Global';
        } else {
            return 'RPG File%1'.format(savefileId);
        }
    }
}