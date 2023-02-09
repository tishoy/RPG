import ResourceHandler from './resourceHandler'
import Decrypter from './decrypter'
import MiniGame from '../18ext/MiniGame';

/**
 * create by 18tech
 */
export default class Audio {

    constructor(url) {


        this.clear();

        this._context = MiniGame.createAudioContext();
        this._context.src = url;
        this._url = url;
    }

    _masterVolume = 1;
    _context = null;
    _masterGainNode = null;
    _initialized = false;
    _unlocked = false;
    _canPlayOgg = true;
    _canPlayM4a = true;

    /**
     * Initializes the audio system.
     *
     * @static
     * @method initialize
     * @param {Boolean} noAudio Flag for the no-audio mode
     * @return {Boolean} True if the audio system is available
     */
    initialize(url) {

        Audio._createContext();
        Audio._setupEventHandlers();
        this._initialized = true;
        return !!this._context;
    }

    /**
     * Sets the master volume of the all audio.
     *
     * @static
     * @method setMasterVolume
     * @param {Number} value Master volume (min: 0, max: 1)
     */
    static setMasterVolume(value) {
        this._masterVolume = value;
        if (this._context) {
            this._context.volume = value;
        }
    }

    /**
     * @static
     * @method _createContext
     * @private
     */
    static _createContext() {
        try {
            this._context = MiniGame.createAudioContext();
            this._context.src = url;
        } catch (e) {
            this._context = null;
        }
    }


    /**
     * @static
     * @method _setupEventHandlers
     * @private
     */
    static _setupEventHandlers() {
        var resumeHandler = () => {
            var context = this._context;
            if (context && context.state === "suspended" && typeof context.resume === "function") {
                context.resume().then(function () {
                    this._onTouchStart();
                })
            } else {
                this._onTouchStart();
            }
        }
        document.addEventListener("keydown", resumeHandler);
        document.addEventListener("mousedown", resumeHandler);
        document.addEventListener("touchend", resumeHandler);
        document.addEventListener('touchstart', this._onTouchStart);
        document.addEventListener('visibilitychange', this._onVisibilityChange.bind(this));
    }

    /**
     * @static
     * @method _onTouchStart
     * @private
     */
    static _onTouchStart() {

    }

    /**
     * @static
     * @method _onVisibilityChange
     * @private
     */
    static _onVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            this._onHide();
        } else {
            this._onShow();
        }
    }

    /**
     * @static
     * @method _onHide
     * @private
     */
    static _onHide() {
        if (this._shouldMuteOnHide()) {
            if (this._context) {
                this._context.pause();
            }
        }
    }

    /**
     * @static
     * @method _onShow
     * @private
     */
    static _onShow() {
        if (this._shouldMuteOnHide()) {
            if (this._context) {
                this._context.play();
            }
        }
    }

    /**
     * @static
     * @method _shouldMuteOnHide
     * @private
     */
    static _shouldMuteOnHide() {
        return Utils.isMobileDevice();
    }


    /**
     * Clears the audio data.
     *
     * @method clear
     */
    clear() {
        this.stop();
        this._totalTime = 0;
        this._sampleRate = 0;
        this._startTime = 0;
        this._volume = 1;
        this._endTimer = null;
        this._hasError = false;
        this._autoPlay = false;
    }

    /**
     * [read-only] The url of the audio file.
     *
     * @property url
     * @type String
     */
    get url() {
        return this._url;
    }

    /**
     * The volume of the audio.
     *
     * @property volume
     * @type Number
     */
    get volume() {
        return this._volume;
    }

    set volume(value) {
        this._volume = value;
        if (this._context) {
            this._context.volume = this._volume;
            //.gain.setValueAtTime(this._volume, this._context.currentTime);
        }
    }





    /**
     * Checks whether a loading error has occurred.
     *
     * @method isError
     * @return {Boolean} True if a loading error has occurred
     */
    isError() {
        return this._hasError;
    }

    /**
     * Checks whether the audio is playing.
     *
     * @method isPlaying
     * @return {Boolean} True if the audio is playing
     */
    isPlaying() {
        return !!this._sourceNode;
    }

    /**
     * Plays the audio.
     *
     * @method play
     * @param {Boolean} loop Whether the audio data play in a loop
     * @param {Number} offset The start position to play in seconds
     */
    play(loop, offset) {
        this._context.play();
        this._context.autoplay = true
        this._context.seek(offset);
        this._context.loop = loop
        return;
        if (this.isReady()) {
            offset = offset || 0;
            this._startPlaying(loop, offset);
        } else if (this._context) {
            this._autoPlay = true;
            this.addLoadListener(function () {
                if (this._autoPlay) {
                    this.play(loop, offset);
                }
            }.bind(this));
        }
    }

    /**
     * Stops the audio.
     *
     * @method stop
     */
    stop() {
        this._autoPlay = false;
        if (this._context) {
            this._context.stop();
        }
    }

    /**
     * Gets the seek position of the audio.
     *
     * @method seek
     */
    seek() {
        if (this._context) {
            var pos = (this._context.currentTime - this._startTime) * this._pitch;
            if (this._loopLength > 0) {
                while (pos >= this._loopStart + this._loopLength) {
                    pos -= this._loopLength;
                }
            }
            return pos;
        } else {
            return 0;
        }
    }

    pause() {
        this._context.pause();
    }

    /**
     * Add a callback function that will be called when the audio data is loaded.
     *
     * @method addLoadListener
     * @param {Function} listner The callback function
     */
    addLoadListener(listner) {
        this._loadListeners.push(listner);
    }

    /**
     * Add a callback function that will be called when the playback is stopped.
     *
     * @method addStopListener
     * @param {Function} listner The callback function
     */
    addStopListener(listner) {
        this._stopListeners.push(listner);
    }

    /**
     * @method _startPlaying
     * @param {Boolean} loop
     * @param {Number} offset
     * @private
     */
    _startPlaying(loop, offset) {
        if (this._loopLength > 0) {
            while (offset >= this._loopStart + this._loopLength) {
                offset -= this._loopLength;
            }
        }

        this._sourceNode.loop = loop;
        this._sourceNode.start(0, offset);
        this._startTime = this._context.currentTime - offset / this._pitch;
        this._createEndTimer();
    }

    _createEndTimer() {
        if (Audio._context && !Audio._context.loop) {
            var endTime = this._startTime + this._totalTime / this._pitch;
            var delay = endTime - Audio._context.currentTime;
            this._endTimer = setTimeout(function () {
                this.stop();
            }.bind(this), delay * 1000);
        }
    };
}