/*! p5.sound.js v0.3.11 2019-03-14 */
/**
 *  p5.sound se extiende p5 con <a href="http://caniuse.com/audio-api"
 *  target="_blank">Web Audio</a> funcionalidad que incluye
 *  reproducción, análisis y síntesis de entrada de audio.
 *  <br/><br/>
 *  <a href="#/p5.SoundFile"><b>p5.SoundFile</b></a>: Cargar y reproducir archivos de sonido.<br/>
 *  <a href="#/p5.Amplitude"><b>p5.Amplitude</b></a>: Obtener el volumen actual de un sonido.<br/>
 *  <a href="#/p5.AudioIn"><b>p5.AudioIn</b></a>: Obtén sonido de una fuente de entrada, normalmente
 *    un micrófono de computadora.<br/>
 *  <a href="#/p5.FFT"><b>p5.FFT</b></a>: Analiza la frecuencia del sonido. Devuelve
 *    resultados del espectro de frecuencias o del dominio del tiempo (forma de onda).<br/>
 *  <a href="#/p5.Oscillator"><b>p5.Oscillator</b></a>: Generar seno,
 *    Formas de onda Triangulares, Cuadradas y de Diente de sierra. Clase base de
 *    <a href="#/p5.Noise">p5.Noise</a> and <a href="#/p5.Pulse">p5.Pulse</a>.
 *    <br/>
 *  <a href="#/p5.Envelope"><b>p5.Envelope</b></a>: Un sobre es una serie
 *    de desvanecimientos con el tiempo. A menudo se usa para controlar el
 *    nivel de ganancia de salida de un objeto como "ADSR Envelope" (Attack, Decay,
 *    Sustain, Release). También puede modular otros parámetros. <br/>
 *  <a href="#/p5.Delay"><b>p5.Delay</b></a>: Un efecto de retardo con
 *    parámetros para la retroalimentación. k, delayTime, y filtro lowpass.<br/>
 *  <a href="#/p5.Filter"><b>p5.Filter</b></a>: Filtrar el rango de frecuencia de un
 *    sonido.
 *  <br/>
 *  <a href="#/p5.Reverb"><b>p5.Reverb</b></a>: Agregue reverberación a un sonido especificando
 *   la duración y el decaimiento. <br/>
 *  <b><a href="#/p5.Convolver">p5.Convolver</a>:</b> Se extiende
 *  <a href="#/p5.Reverb">p5.Reverb</a> para simular el sonido
 *    de espacios físicos reales mediante convolución.<br/>
 *  <b><a href="#/p5.SoundRecorder">p5.SoundRecorder</a></b>: Grabar sonido para reproducir
 *    / guarda el .wav file.
 *  <b><a href="#/p5.Phrase">p5.Phrase</a></b>, <b><a href="#/p5.Part">p5.Part</a></b> and
 *  <b><a href="#/p5.Score">p5.Score</a></b>: Componga secuencias musicales.
 *  <br/><br/>
 *  p5.sound esta encendido <a href="https://github.com/therewasaguy/p5.sound/">GitHub</a>.
 *  Descargue la última versión
 *  <a href="https://github.com/therewasaguy/p5.sound/blob/master/lib/p5.sound.js">here</a>.
 *
 *  @module p5.sound
 *  @submodule p5.sound
 *  @for p5.sound
 *  @main
 */

/**
 *  p5.sound 
 *  https://p5js.org/reference/#/libraries/p5.sound
 *
 *  De la Fundación de Procesamiento y contribuyentes
 *  https://github.com/processing/p5.js-sound/graphs/contributors
 *
 *  Licencia MIT (MIT)
 *  https://github.com/processing/p5.js-sound/blob/master/LICENSE
 *
 *  Algunas de las muchas bibliotecas de audio y recursos que inspiran p5.sound:
 *   - TONE.js (c) Yotam Mann. Licenciado bajo la licencia MIT (MIT). https://github.com/TONEnoTONE/Tone.js
 *   - buzz.js (c) Jay Salvat. Licenciado bajo la licencia MIT (MIT). http://buzz.jaysalvat.com/
 *   - Boris Smus Web Audio API book, 2013. Licenciado bajo la licencia Apache http://www.apache.org/licenses/LICENSE-2.0
 *   - wavesurfer.js https://github.com/katspaugh/wavesurfer.js
 *   - Componentes de audio web de Jordan Santell https://github.com/web-audio-components
 *   - Biblioteca de sonido de Wilm Thoben para procesamiento https://github.com/processing/processing/tree/master/java/libraries/sound
 *
 *   Web Audio API: http://w3.org/TR/webaudio/
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd)
    define('p5.sound', ['p5'], function (p5) { (factory(p5));});
  else if (typeof exports === 'object')
    factory(require('../p5'));
  else
    factory(root['p5']);
}(this, function (p5) {
  
var shims;
'use strict';  /**
                * Este módulo tiene bibliotecas
                */
shims = function () {
  /* AudioContext Monkeypatch
     Derechos de autor 2013 Chris Wilson
     Licenciado bajo la licencia Apache, Version 2.0 (the "License");
     no puede utilizar este archivo excepto de conformidad con la Licencia.
     Puede obtener una copia de la licencia en
         http://www.apache.org/licenses/LICENSE-2.0
     A menos que lo exija la ley aplicable o se acuerde por escrito, software
     distribuido bajo la Licencia se distribuye "TAL CUAL",
     SIN GARANTÍAS NI CONDICIONES DE NINGÚN TIPO, ya sea expresas o implícitas.
     Consulte la Licencia para conocer el lenguaje específico que rige los permisos y
     las limitaciones de la Licencia.
  */
  (function () {
    function fixSetTarget(param) {
      if (!param)
        // si NYI, solo regresa
        return;
      if (!param.setTargetAtTime)
        param.setTargetAtTime = param.setTargetValueAtTime;
    }
    if (window.hasOwnProperty('webkitAudioContext') && !window.hasOwnProperty('AudioContext')) {
      window.AudioContext = window.webkitAudioContext;
      if (typeof AudioContext.prototype.createGain !== 'function')
        AudioContext.prototype.createGain = AudioContext.prototype.createGainNode;
      if (typeof AudioContext.prototype.createDelay !== 'function')
        AudioContext.prototype.createDelay = AudioContext.prototype.createDelayNode;
      if (typeof AudioContext.prototype.createScriptProcessor !== 'function')
        AudioContext.prototype.createScriptProcessor = AudioContext.prototype.createJavaScriptNode;
      if (typeof AudioContext.prototype.createPeriodicWave !== 'function')
        AudioContext.prototype.createPeriodicWave = AudioContext.prototype.createWaveTable;
      AudioContext.prototype.internal_createGain = AudioContext.prototype.createGain;
      AudioContext.prototype.createGain = function () {
        var node = this.internal_createGain();
        fixSetTarget(node.gain);
        return node;
      };
      AudioContext.prototype.internal_createDelay = AudioContext.prototype.createDelay;
      AudioContext.prototype.createDelay = function (maxDelayTime) {
        var node = maxDelayTime ? this.internal_createDelay(maxDelayTime) : this.internal_createDelay();
        fixSetTarget(node.delayTime);
        return node;
      };
      AudioContext.prototype.internal_createBufferSource = AudioContext.prototype.createBufferSource;
      AudioContext.prototype.createBufferSource = function () {
        var node = this.internal_createBufferSource();
        if (!node.start) {
          node.start = function (when, offset, duration) {
            if (offset || duration)
              this.noteGrainOn(when || 0, offset, duration);
            else
              this.noteOn(when || 0);
          };
        } else {
          node.internal_start = node.start;
          node.start = function (when, offset, duration) {
            if (typeof duration !== 'undefined')
              node.internal_start(when || 0, offset, duration);
            else
              node.internal_start(when || 0, offset || 0);
          };
        }
        if (!node.stop) {
          node.stop = function (when) {
            this.noteOff(when || 0);
          };
        } else {
          node.internal_stop = node.stop;
          node.stop = function (when) {
            node.internal_stop(when || 0);
          };
        }
        fixSetTarget(node.playbackRate);
        return node;
      };
      AudioContext.prototype.internal_createDynamicsCompressor = AudioContext.prototype.createDynamicsCompressor;
      AudioContext.prototype.createDynamicsCompressor = function () {
        var node = this.internal_createDynamicsCompressor();
        fixSetTarget(node.threshold);
        fixSetTarget(node.knee);
        fixSetTarget(node.ratio);
        fixSetTarget(node.reduction);
        fixSetTarget(node.attack);
        fixSetTarget(node.release);
        return node;
      };
      AudioContext.prototype.internal_createBiquadFilter = AudioContext.prototype.createBiquadFilter;
      AudioContext.prototype.createBiquadFilter = function () {
        var node = this.internal_createBiquadFilter();
        fixSetTarget(node.frequency);
        fixSetTarget(node.detune);
        fixSetTarget(node.Q);
        fixSetTarget(node.gain);
        return node;
      };
      if (typeof AudioContext.prototype.createOscillator !== 'function') {
        AudioContext.prototype.internal_createOscillator = AudioContext.prototype.createOscillator;
        AudioContext.prototype.createOscillator = function () {
          var node = this.internal_createOscillator();
          if (!node.start) {
            node.start = function (when) {
              this.noteOn(when || 0);
            };
          } else {
            node.internal_start = node.start;
            node.start = function (when) {
              node.internal_start(when || 0);
            };
          }
          if (!node.stop) {
            node.stop = function (when) {
              this.noteOff(when || 0);
            };
          } else {
            node.internal_stop = node.stop;
            node.stop = function (when) {
              node.internal_stop(when || 0);
            };
          }
          if (!node.setPeriodicWave)
            node.setPeriodicWave = node.setWaveTable;
          fixSetTarget(node.frequency);
          fixSetTarget(node.detune);
          return node;
        };
      }
    }
    if (window.hasOwnProperty('webkitOfflineAudioContext') && !window.hasOwnProperty('OfflineAudioContext')) {
      window.OfflineAudioContext = window.webkitOfflineAudioContext;
    }
  }(window));
  // <-- finaliza MonkeyPatch.
  // Polyfill para AudioIn, también manejado por p5.dom createCapture
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  /**
   * Determine qué tipos de archivo son compatibles (inspirado en buzz.js)
   * El elemento de audio (el) solo se utilizará para probar la compatibilidad del navegador con varios formatos de audio
   */
  var el = document.createElement('audio');
  p5.prototype.isSupported = function () {
    return !!el.canPlayType;
  };
  var isOGGSupported = function () {
    return !!el.canPlayType && el.canPlayType('audio/ogg; codecs="vorbis"');
  };
  var isMP3Supported = function () {
    return !!el.canPlayType && el.canPlayType('audio/mpeg;');
  };
  var isWAVSupported = function () {
    return !!el.canPlayType && el.canPlayType('audio/wav; codecs="1"');
  };
  var isAACSupported = function () {
    return !!el.canPlayType && (el.canPlayType('audio/x-m4a;') || el.canPlayType('audio/aac;'));
  };
  var isAIFSupported = function () {
    return !!el.canPlayType && el.canPlayType('audio/x-aiff;');
  };
  p5.prototype.isFileSupported = function (extension) {
    switch (extension.toLowerCase()) {
    case 'mp3':
      return isMP3Supported();
    case 'wav':
      return isWAVSupported();
    case 'ogg':
      return isOGGSupported();
    case 'aac':
    case 'm4a':
    case 'mp4':
      return isAACSupported();
    case 'aif':
    case 'aiff':
      return isAIFSupported();
    default:
      return false;
    }
  };
}();
var StartAudioContext;
(function (root, factory) {
  if (true) {
    StartAudioContext = function () {
      return factory();
    }();
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.StartAudioContext = factory();
  }
}(this, function () {
  var TapListener = function (element, context) {
    this._dragged = false;
    this._element = element;
    this._bindedMove = this._moved.bind(this);
    this._bindedEnd = this._ended.bind(this, context);
    element.addEventListener('touchstart', this._bindedEnd);
    element.addEventListener('touchmove', this._bindedMove);
    element.addEventListener('touchend', this._bindedEnd);
    element.addEventListener('mouseup', this._bindedEnd);
  };
  TapListener.prototype._moved = function (e) {
    this._dragged = true;
  };
  TapListener.prototype._ended = function (context) {
    if (!this._dragged) {
      startContext(context);
    }
    this._dragged = false;
  };
  TapListener.prototype.dispose = function () {
    this._element.removeEventListener('touchstart', this._bindedEnd);
    this._element.removeEventListener('touchmove', this._bindedMove);
    this._element.removeEventListener('touchend', this._bindedEnd);
    this._element.removeEventListener('mouseup', this._bindedEnd);
    this._bindedMove = null;
    this._bindedEnd = null;
    this._element = null;
  };
  function startContext(context) {
    var buffer = context.createBuffer(1, 1, context.sampleRate);
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
    if (context.resume) {
      context.resume();
    }
  }
  function isStarted(context) {
    return context.state === 'running';
  }
  function onStarted(context, callback) {
    function checkLoop() {
      if (isStarted(context)) {
        callback();
      } else {
        requestAnimationFrame(checkLoop);
        if (context.resume) {
          context.resume();
        }
      }
    }
    if (isStarted(context)) {
      callback();
    } else {
      checkLoop();
    }
  }
  function bindTapListener(element, tapListeners, context) {
    if (Array.isArray(element) || NodeList && element instanceof NodeList) {
      for (var i = 0; i < element.length; i++) {
        bindTapListener(element[i], tapListeners, context);
      }
    } else if (typeof element === 'string') {
      bindTapListener(document.querySelectorAll(element), tapListeners, context);
    } else if (element.jquery && typeof element.toArray === 'function') {
      bindTapListener(element.toArray(), tapListeners, context);
    } else if (Element && element instanceof Element) {
      var tap = new TapListener(element, context);
      tapListeners.push(tap);
    }
  }
  function StartAudioContext(context, elements, callback) {
    var promise = new Promise(function (success) {
      onStarted(context, success);
    });
    var tapListeners = [];
    if (!elements) {
      elements = document.body;
    }
    bindTapListener(elements, tapListeners, context);
    promise.then(function () {
      for (var i = 0; i < tapListeners.length; i++) {
        tapListeners[i].dispose();
      }
      tapListeners = null;
      if (callback) {
        callback();
      }
    });
    return promise;
  }
  return StartAudioContext;
}));
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_core_Tone;
Tone_core_Tone = function () {
  'use strict';
  var Tone = function (inputs, outputs) {
    if (this.isUndef(inputs) || inputs === 1) {
      this.input = this.context.createGain();
    } else if (inputs > 1) {
      this.input = new Array(inputs);
    }
    if (this.isUndef(outputs) || outputs === 1) {
      this.output = this.context.createGain();
    } else if (outputs > 1) {
      this.output = new Array(inputs);
    }
  };
  Tone.prototype.set = function (params, value, rampTime) {
    if (this.isObject(params)) {
      rampTime = value;
    } else if (this.isString(params)) {
      var tmpObj = {};
      tmpObj[params] = value;
      params = tmpObj;
    }
    paramLoop:
      for (var attr in params) {
        value = params[attr];
        var parent = this;
        if (attr.indexOf('.') !== -1) {
          var attrSplit = attr.split('.');
          for (var i = 0; i < attrSplit.length - 1; i++) {
            parent = parent[attrSplit[i]];
            if (parent instanceof Tone) {
              attrSplit.splice(0, i + 1);
              var innerParam = attrSplit.join('.');
              parent.set(innerParam, value);
              continue paramLoop;
            }
          }
          attr = attrSplit[attrSplit.length - 1];
        }
        var param = parent[attr];
        if (this.isUndef(param)) {
          continue;
        }
        if (Tone.Signal && param instanceof Tone.Signal || Tone.Param && param instanceof Tone.Param) {
          if (param.value !== value) {
            if (this.isUndef(rampTime)) {
              param.value = value;
            } else {
              param.rampTo(value, rampTime);
            }
          }
        } else if (param instanceof AudioParam) {
          if (param.value !== value) {
            param.value = value;
          }
        } else if (param instanceof Tone) {
          param.set(value);
        } else if (param !== value) {
          parent[attr] = value;
        }
      }
    return this;
  };
  Tone.prototype.get = function (params) {
    if (this.isUndef(params)) {
      params = this._collectDefaults(this.constructor);
    } else if (this.isString(params)) {
      params = [params];
    }
    var ret = {};
    for (var i = 0; i < params.length; i++) {
      var attr = params[i];
      var parent = this;
      var subRet = ret;
      if (attr.indexOf('.') !== -1) {
        var attrSplit = attr.split('.');
        for (var j = 0; j < attrSplit.length - 1; j++) {
          var subAttr = attrSplit[j];
          subRet[subAttr] = subRet[subAttr] || {};
          subRet = subRet[subAttr];
          parent = parent[subAttr];
        }
        attr = attrSplit[attrSplit.length - 1];
      }
      var param = parent[attr];
      if (this.isObject(params[attr])) {
        subRet[attr] = param.get();
      } else if (Tone.Signal && param instanceof Tone.Signal) {
        subRet[attr] = param.value;
      } else if (Tone.Param && param instanceof Tone.Param) {
        subRet[attr] = param.value;
      } else if (param instanceof AudioParam) {
        subRet[attr] = param.value;
      } else if (param instanceof Tone) {
        subRet[attr] = param.get();
      } else if (!this.isFunction(param) && !this.isUndef(param)) {
        subRet[attr] = param;
      }
    }
    return ret;
  };
  Tone.prototype._collectDefaults = function (constr) {
    var ret = [];
    if (!this.isUndef(constr.defaults)) {
      ret = Object.keys(constr.defaults);
    }
    if (!this.isUndef(constr._super)) {
      var superDefs = this._collectDefaults(constr._super);
      for (var i = 0; i < superDefs.length; i++) {
        if (ret.indexOf(superDefs[i]) === -1) {
          ret.push(superDefs[i]);
        }
      }
    }
    return ret;
  };
  Tone.prototype.toString = function () {
    for (var className in Tone) {
      var isLetter = className[0].match(/^[A-Z]$/);
      var sameConstructor = Tone[className] === this.constructor;
      if (this.isFunction(Tone[className]) && isLetter && sameConstructor) {
        return className;
      }
    }
    return 'Tone';
  };
  Object.defineProperty(Tone.prototype, 'numberOfInputs', {
    get: function () {
      if (this.input) {
        if (this.isArray(this.input)) {
          return this.input.length;
        } else {
          return 1;
        }
      } else {
        return 0;
      }
    }
  });
  Object.defineProperty(Tone.prototype, 'numberOfOutputs', {
    get: function () {
      if (this.output) {
        if (this.isArray(this.output)) {
          return this.output.length;
        } else {
          return 1;
        }
      } else {
        return 0;
      }
    }
  });
  Tone.prototype.dispose = function () {
    if (!this.isUndef(this.input)) {
      if (this.input instanceof AudioNode) {
        this.input.disconnect();
      }
      this.input = null;
    }
    if (!this.isUndef(this.output)) {
      if (this.output instanceof AudioNode) {
        this.output.disconnect();
      }
      this.output = null;
    }
    return this;
  };
  Tone.prototype.connect = function (unit, outputNum, inputNum) {
    if (Array.isArray(this.output)) {
      outputNum = this.defaultArg(outputNum, 0);
      this.output[outputNum].connect(unit, 0, inputNum);
    } else {
      this.output.connect(unit, outputNum, inputNum);
    }
    return this;
  };
  Tone.prototype.disconnect = function (destination, outputNum, inputNum) {
    if (this.isArray(this.output)) {
      if (this.isNumber(destination)) {
        this.output[destination].disconnect();
      } else {
        outputNum = this.defaultArg(outputNum, 0);
        this.output[outputNum].disconnect(destination, 0, inputNum);
      }
    } else {
      this.output.disconnect.apply(this.output, arguments);
    }
  };
  Tone.prototype.connectSeries = function () {
    if (arguments.length > 1) {
      var currentUnit = arguments[0];
      for (var i = 1; i < arguments.length; i++) {
        var toUnit = arguments[i];
        currentUnit.connect(toUnit);
        currentUnit = toUnit;
      }
    }
    return this;
  };
  Tone.prototype.chain = function () {
    if (arguments.length > 0) {
      var currentUnit = this;
      for (var i = 0; i < arguments.length; i++) {
        var toUnit = arguments[i];
        currentUnit.connect(toUnit);
        currentUnit = toUnit;
      }
    }
    return this;
  };
  Tone.prototype.fan = function () {
    if (arguments.length > 0) {
      for (var i = 0; i < arguments.length; i++) {
        this.connect(arguments[i]);
      }
    }
    return this;
  };
  AudioNode.prototype.chain = Tone.prototype.chain;
  AudioNode.prototype.fan = Tone.prototype.fan;
  Tone.prototype.defaultArg = function (given, fallback) {
    if (this.isObject(given) && this.isObject(fallback)) {
      var ret = {};
      for (var givenProp in given) {
        ret[givenProp] = this.defaultArg(fallback[givenProp], given[givenProp]);
      }
      for (var fallbackProp in fallback) {
        ret[fallbackProp] = this.defaultArg(given[fallbackProp], fallback[fallbackProp]);
      }
      return ret;
    } else {
      return this.isUndef(given) ? fallback : given;
    }
  };
  Tone.prototype.optionsObject = function (values, keys, defaults) {
    var options = {};
    if (values.length === 1 && this.isObject(values[0])) {
      options = values[0];
    } else {
      for (var i = 0; i < keys.length; i++) {
        options[keys[i]] = values[i];
      }
    }
    if (!this.isUndef(defaults)) {
      return this.defaultArg(options, defaults);
    } else {
      return options;
    }
  };
  Tone.prototype.isUndef = function (val) {
    return typeof val === 'undefined';
  };
  Tone.prototype.isFunction = function (val) {
    return typeof val === 'function';
  };
  Tone.prototype.isNumber = function (arg) {
    return typeof arg === 'number';
  };
  Tone.prototype.isObject = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Object]' && arg.constructor === Object;
  };
  Tone.prototype.isBoolean = function (arg) {
    return typeof arg === 'boolean';
  };
  Tone.prototype.isArray = function (arg) {
    return Array.isArray(arg);
  };
  Tone.prototype.isString = function (arg) {
    return typeof arg === 'string';
  };
  Tone.noOp = function () {
  };
  Tone.prototype._readOnly = function (property) {
    if (Array.isArray(property)) {
      for (var i = 0; i < property.length; i++) {
        this._readOnly(property[i]);
      }
    } else {
      Object.defineProperty(this, property, {
        writable: false,
        enumerable: true
      });
    }
  };
  Tone.prototype._writable = function (property) {
    if (Array.isArray(property)) {
      for (var i = 0; i < property.length; i++) {
        this._writable(property[i]);
      }
    } else {
      Object.defineProperty(this, property, { writable: true });
    }
  };
  Tone.State = {
    Started: 'started',
    Stopped: 'stopped',
    Paused: 'paused'
  };
  Tone.prototype.equalPowerScale = function (percent) {
    var piFactor = 0.5 * Math.PI;
    return Math.sin(percent * piFactor);
  };
  Tone.prototype.dbToGain = function (db) {
    return Math.pow(2, db / 6);
  };
  Tone.prototype.gainToDb = function (gain) {
    return 20 * (Math.log(gain) / Math.LN10);
  };
  Tone.prototype.intervalToFrequencyRatio = function (interval) {
    return Math.pow(2, interval / 12);
  };
  Tone.prototype.now = function () {
    return Tone.context.now();
  };
  Tone.now = function () {
    return Tone.context.now();
  };
  Tone.extend = function (child, parent) {
    if (Tone.prototype.isUndef(parent)) {
      parent = Tone;
    }
    function TempConstructor() {
    }
    TempConstructor.prototype = parent.prototype;
    child.prototype = new TempConstructor();
    child.prototype.constructor = child;
    child._super = parent;
  };
  var audioContext;
  Object.defineProperty(Tone, 'context', {
    get: function () {
      return audioContext;
    },
    set: function (context) {
      if (Tone.Context && context instanceof Tone.Context) {
        audioContext = context;
      } else {
        audioContext = new Tone.Context(context);
      }
      if (Tone.Context) {
        Tone.Context.emit('init', audioContext);
      }
    }
  });
  Object.defineProperty(Tone.prototype, 'context', {
    get: function () {
      return Tone.context;
    }
  });
  Tone.setContext = function (ctx) {
    Tone.context = ctx;
  };
  Object.defineProperty(Tone.prototype, 'blockTime', {
    get: function () {
      return 128 / this.context.sampleRate;
    }
  });
  Object.defineProperty(Tone.prototype, 'sampleTime', {
    get: function () {
      return 1 / this.context.sampleRate;
    }
  });
  Object.defineProperty(Tone, 'supported', {
    get: function () {
      var hasAudioContext = window.hasOwnProperty('AudioContext') || window.hasOwnProperty('webkitAudioContext');
      var hasPromises = window.hasOwnProperty('Promise');
      var hasWorkers = window.hasOwnProperty('Worker');
      return hasAudioContext && hasPromises && hasWorkers;
    }
  });
  Tone.version = 'r10';
  if (!window.TONE_SILENCE_VERSION_LOGGING) {
  }
  return Tone;
}();
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_core_Emitter;
Tone_core_Emitter = function (Tone) {
  'use strict';
  Tone.Emitter = function () {
    this._events = {};
  };
  Tone.extend(Tone.Emitter);
  Tone.Emitter.prototype.on = function (event, callback) {
    var events = event.split(/\W+/);
    for (var i = 0; i < events.length; i++) {
      var eventName = events[i];
      if (!this._events.hasOwnProperty(eventName)) {
        this._events[eventName] = [];
      }
      this._events[eventName].push(callback);
    }
    return this;
  };
  Tone.Emitter.prototype.off = function (event, callback) {
    var events = event.split(/\W+/);
    for (var ev = 0; ev < events.length; ev++) {
      event = events[ev];
      if (this._events.hasOwnProperty(event)) {
        if (Tone.prototype.isUndef(callback)) {
          this._events[event] = [];
        } else {
          var eventList = this._events[event];
          for (var i = 0; i < eventList.length; i++) {
            if (eventList[i] === callback) {
              eventList.splice(i, 1);
            }
          }
        }
      }
    }
    return this;
  };
  Tone.Emitter.prototype.emit = function (event) {
    if (this._events) {
      var args = Array.apply(null, arguments).slice(1);
      if (this._events.hasOwnProperty(event)) {
        var eventList = this._events[event];
        for (var i = 0, len = eventList.length; i < len; i++) {
          eventList[i].apply(this, args);
        }
      }
    }
    return this;
  };
  Tone.Emitter.mixin = function (object) {
    var functions = [
      'on',
      'off',
      'emit'
    ];
    object._events = {};
    for (var i = 0; i < functions.length; i++) {
      var func = functions[i];
      var emitterFunc = Tone.Emitter.prototype[func];
      object[func] = emitterFunc;
    }
  };
  Tone.Emitter.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._events = null;
    return this;
  };
  return Tone.Emitter;
}(Tone_core_Tone);
/** Tone.js module por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_core_Context;
Tone_core_Context = function (Tone) {
  if (!window.hasOwnProperty('AudioContext') && window.hasOwnProperty('webkitAudioContext')) {
    window.AudioContext = window.webkitAudioContext;
  }
  Tone.Context = function (context) {
    Tone.Emitter.call(this);
    if (!context) {
      context = new window.AudioContext();
    }
    this._context = context;
    for (var prop in this._context) {
      this._defineProperty(this._context, prop);
    }
    this._latencyHint = 'interactive';
    this._lookAhead = 0.1;
    this._updateInterval = this._lookAhead / 3;
    this._computedUpdateInterval = 0;
    this._worker = this._createWorker();
    this._constants = {};
  };
  Tone.extend(Tone.Context, Tone.Emitter);
  Tone.Emitter.mixin(Tone.Context);
  Tone.Context.prototype._defineProperty = function (context, prop) {
    if (this.isUndef(this[prop])) {
      Object.defineProperty(this, prop, {
        get: function () {
          if (typeof context[prop] === 'function') {
            return context[prop].bind(context);
          } else {
            return context[prop];
          }
        },
        set: function (val) {
          context[prop] = val;
        }
      });
    }
  };
  Tone.Context.prototype.now = function () {
    return this._context.currentTime;
  };
  Tone.Context.prototype._createWorker = function () {
    window.URL = window.URL || window.webkitURL;
    var blob = new Blob(['var timeoutTime = ' + (this._updateInterval * 1000).toFixed(1) + ';' + 'self.onmessage = function(msg){' + '\ttimeoutTime = parseInt(msg.data);' + '};' + 'function tick(){' + '\tsetTimeout(tick, timeoutTime);' + '\tself.postMessage(\'tick\');' + '}' + 'tick();']);
    var blobUrl = URL.createObjectURL(blob);
    var worker = new Worker(blobUrl);
    worker.addEventListener('message', function () {
      this.emit('tick');
    }.bind(this));
    worker.addEventListener('message', function () {
      var now = this.now();
      if (this.isNumber(this._lastUpdate)) {
        var diff = now - this._lastUpdates;
        this._computedUpdateInterval = Math.max(diff, this._computedUpdateInterval * 0.97);
      }
      this._lastUpdate = now;
    }.bind(this));
    return worker;
  };
  Tone.Context.prototype.getConstant = function (val) {
    if (this._constants[val]) {
      return this._constants[val];
    } else {
      var buffer = this._context.createBuffer(1, 128, this._context.sampleRate);
      var arr = buffer.getChannelData(0);
      for (var i = 0; i < arr.length; i++) {
        arr[i] = val;
      }
      var constant = this._context.createBufferSource();
      constant.channelCount = 1;
      constant.channelCountMode = 'explicit';
      constant.buffer = buffer;
      constant.loop = true;
      constant.start(0);
      this._constants[val] = constant;
      return constant;
    }
  };
  Object.defineProperty(Tone.Context.prototype, 'lag', {
    get: function () {
      var diff = this._computedUpdateInterval - this._updateInterval;
      diff = Math.max(diff, 0);
      return diff;
    }
  });
  Object.defineProperty(Tone.Context.prototype, 'lookAhead', {
    get: function () {
      return this._lookAhead;
    },
    set: function (lA) {
      this._lookAhead = lA;
    }
  });
  Object.defineProperty(Tone.Context.prototype, 'updateInterval', {
    get: function () {
      return this._updateInterval;
    },
    set: function (interval) {
      this._updateInterval = Math.max(interval, Tone.prototype.blockTime);
      this._worker.postMessage(Math.max(interval * 1000, 1));
    }
  });
  Object.defineProperty(Tone.Context.prototype, 'latencyHint', {
    get: function () {
      return this._latencyHint;
    },
    set: function (hint) {
      var lookAhead = hint;
      this._latencyHint = hint;
      if (this.isString(hint)) {
        switch (hint) {
        case 'interactive':
          lookAhead = 0.1;
          this._context.latencyHint = hint;
          break;
        case 'playback':
          lookAhead = 0.8;
          this._context.latencyHint = hint;
          break;
        case 'balanced':
          lookAhead = 0.25;
          this._context.latencyHint = hint;
          break;
        case 'fastest':
          lookAhead = 0.01;
          break;
        }
      }
      this.lookAhead = lookAhead;
      this.updateInterval = lookAhead / 3;
    }
  });
  function shimConnect() {
    var nativeConnect = AudioNode.prototype.connect;
    var nativeDisconnect = AudioNode.prototype.disconnect;
    function toneConnect(B, outNum, inNum) {
      if (B.input) {
        if (Array.isArray(B.input)) {
          if (Tone.prototype.isUndef(inNum)) {
            inNum = 0;
          }
          this.connect(B.input[inNum]);
        } else {
          this.connect(B.input, outNum, inNum);
        }
      } else {
        try {
          if (B instanceof AudioNode) {
            nativeConnect.call(this, B, outNum, inNum);
          } else {
            nativeConnect.call(this, B, outNum);
          }
        } catch (e) {
          throw new Error('error connecting to node: ' + B + '\n' + e);
        }
      }
    }
    function toneDisconnect(B, outNum, inNum) {
      if (B && B.input && Array.isArray(B.input)) {
        if (Tone.prototype.isUndef(inNum)) {
          inNum = 0;
        }
        this.disconnect(B.input[inNum], outNum, inNum);
      } else if (B && B.input) {
        this.disconnect(B.input, outNum, inNum);
      } else {
        try {
          nativeDisconnect.apply(this, arguments);
        } catch (e) {
          throw new Error('error disconnecting node: ' + B + '\n' + e);
        }
      }
    }
    if (AudioNode.prototype.connect !== toneConnect) {
      AudioNode.prototype.connect = toneConnect;
      AudioNode.prototype.disconnect = toneDisconnect;
    }
  }
  if (Tone.supported) {
    shimConnect();
    Tone.context = new Tone.Context();
  } else {
    console.warn('This browser does not support Tone.js');
  }
  return Tone.Context;
}(Tone_core_Tone);
var audiocontext;
'use strict';
audiocontext = function (StartAudioContext, Context, Tone) {
  // Crear el contexto del audio
  const audiocontext = new window.AudioContext();
  Tone.context.dispose();
  Tone.setContext(audiocontext);
  /**
   * <p>Devuelve el contexto de audio para este boceto. Útil para
   * usuarios que deseen profundizar en el <a target='_blank' href=
   * 'http://webaudio.github.io/web-audio-api/'>Web Audio API
   * </a>.</p>
   *
   * <p>Algunos navegadores requieren que los usuarios startAudioContext
   * con un gesto de usuario, como touchStarted en el siguiente ejemplo.</p>
   *
   * @method getAudioContext
   * @return {Object}    AudioContext para este boceto
   * @example
   * <div><code>
   *  function draw() {
   *    background(255);
   *    textAlign(CENTER);
   *
   *    if (getAudioContext().state !== 'running') {
   *      text('click to start audio', width/2, height/2);
   *    } else {
   *      text('audio is enabled', width/2, height/2);
   *    }
   *  }
   *
   *  function touchStarted() {
   *    if (getAudioContext().state !== 'running') {
   *      getAudioContext().resume();
   *    }
   *    let synth = new p5.MonoSynth();
   *    synth.play('A4', 0.5, 0, 0.2);
   *  }
   *
   * </div></code>
   */
  p5.prototype.getAudioContext = function () {
    return audiocontext;
  };
  /**
   *  <p>Es una buena práctica dar a los usuarios el control sobre el inicio de la reproducción de audio.
   *  Esta práctica es impuesta por la política de reproducción automática de Google Chrome a partir de la r70.
   *  (<a href="https://goo.gl/7K7WLu">info</a>), iOS Safari, y otros navegadores.
   *  </p>
   *
   *  <p>
   *  userStartAudio() comienza el <a href="https://developer.mozilla.org/en-US/docs/Web/API/AudioContext"
   *  target="_blank" title="Audio Context @ MDN">Audio Context</a> en un gesto de usuario. Utiliza
   *  el <a href="https://github.com/tambien/StartAudioContext">StartAudioContext</a> biblioteca por
   *  Yotam Mann (Licencia MIT, 2016). Lea mas en https://github.com/tambien/StartAudioContext.
   *  </p>
   *
   *  <p>Iniciar el contexto de audio en un gesto de usuario puede ser tan simple como <code>userStartAudio()</code>.
   *  Los parámetros opcionales le permiten decidir sobre un elemento específico que iniciará el contexto de audio
   *  y / o llamar a una función una vez que se inicie el contexto del audio.</p>
   *  @param  {Element|Array}   [element(s)] Este argumento puede ser un Elemento,
   *                                Cadena de selección, NodeList, p5.Elemento,
   *                                jQuery Elemento,o una Matriz de cualquiera de esos.
   *  @param  {Function} [callback] llame de vuelta para invocar cuando AudioContext ha empezado
   *  @return {Promise}            Devuelve un Promise que se resuelve cuando
   *                                       el AudioContext esté en estado 'running'
   * @method userStartAudio
   *  @example
   *  <div><code>
   *  function setup() {
   *    let myDiv = createDiv('click to start audio');
   *    myDiv.position(0, 0);
   *
   *    let mySynth = new p5.MonoSynth();
   *
   *    // Esto no se reproducirá hasta que el contexto haya comenzado.
   *    mySynth.play('A6');
   *
   *    // Inicie el contexto de audio en un evento de clic / toque
   *    userStartAudio().then(function() {
   *       myDiv.remove();
   *     });
   *  }
   *  </code></div>
   */
  p5.prototype.userStartAudio = function (elements, callback) {
    var elt = elements;
    if (elements instanceof p5.Element) {
      elt = elements.elt;
    } else if (elements instanceof Array && elements[0] instanceof p5.Element) {
      elt = elements.map(function (e) {
        return e.elt;
      });
    }
    return StartAudioContext(audiocontext, elt, callback);
  };
  return audiocontext;
}(StartAudioContext, Tone_core_Context, Tone_core_Tone);
var master;
'use strict';
master = function (audiocontext) {
  /**
   * Master contiene AudioContext y la salida de sonido master.
   */
  var Master = function () {
    this.input = audiocontext.createGain();
    this.output = audiocontext.createGain();
    //poner un limitador duro en la salida
    this.limiter = audiocontext.createDynamicsCompressor();
    this.limiter.threshold.value = -3;
    this.limiter.ratio.value = 20;
    this.limiter.knee.value = 1;
    this.audiocontext = audiocontext;
    this.output.disconnect();
    // conectar la entrada al limitador
    this.input.connect(this.limiter);
    // conecte el limitador a la salida
    this.limiter.connect(this.output);
    // El medidor es solo para análisis global de amplitud / FFT
    this.meter = audiocontext.createGain();
    this.fftMeter = audiocontext.createGain();
    this.output.connect(this.meter);
    this.output.connect(this.fftMeter);
    // conectar la salida al destino
    this.output.connect(this.audiocontext.destination);
    // una matriz de todos los sonidos en el boceto
    this.soundArray = [];
    // una matriz de todas las partes musicales en el boceto
    this.parts = [];
    // extensiones de archivo para buscar
    this.extensions = [];
  };
  // crear una única instancia de la salida p5Sound / master para usar dentro de este boceto
  var p5sound = new Master();
  /**
   * Devuelve un número que representa la amplitud master (volumen) del sonido.
   * en este boceto.
   *
   * @method getMasterVolume
   * @return {Number} Amplitud Master (volumen) para el sonido en este boceto.
   *                  Debe estar entre 0.0 (silencio) y 1.0.
   */
  p5.prototype.getMasterVolume = function () {
    return p5sound.output.gain.value;
  };
  /**
   *  <p>Escale la salida de todo el sonido en este boceto</p>
   *  Escalado entre 0.0 (silencio) y 1.0 (volumen completo).
   * 1.0 es la amplitud máxima de un sonido digital, por lo que multiplicarlo
   *  por más de 1.0 puede causar distorsión digital. Para
   *  atenuar, proporcione un parámetro <code> rampTime </code>. Para
   *  disminuciones más complejas, consulte la clase Envelope.
   *
   *  Alternativamente, puede pasar por una fuente de señal como en un
   *  oscilador para modular la amplitud con una señal de audio.
   *
   *  <p><b>Cómo funciona esto</b>: Cuando cargas el p5.sound módulo, crea
   *  una única instancia de p5sound. Todos los objetos de sonido en este
   *  módulo salen a p5sound antes de llegar a la salida de su computadora.
   *  Entonces, si cambia la amplitud de p5sound, afectará a todo el
   *  sonido en este módulo.</p>
   *
   *  <p>Si no se proporciona ningún valor, devuelve un nodo de ganancia de API de audio web</p>
   *
   *  @method  masterVolume
   *  @param {Number|Object} volume  Volume (amplitude) between 0.0
   *                                     and 1.0 or modulating signal/oscillator
   *  @param {Number} [rampTime]  Se desvanecen durante t segundos
   *  @param {Number} [timeFromNow]  Programe este evento para que suceda en
   *                                 t segundos en el futuro
   */
  p5.prototype.masterVolume = function (vol, rampTime, tFromNow) {
    if (typeof vol === 'number') {
      var rampTime = rampTime || 0;
      var tFromNow = tFromNow || 0;
      var now = p5sound.audiocontext.currentTime;
      var currentVol = p5sound.output.gain.value;
      p5sound.output.gain.cancelScheduledValues(now + tFromNow);
      p5sound.output.gain.linearRampToValueAtTime(currentVol, now + tFromNow);
      p5sound.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime);
    } else if (vol) {
      vol.connect(p5sound.output.gain);
    } else {
      // devolver la ganancia del Nodo
      return p5sound.output.gain;
    }
  };
  /**
   * `p5.soundOut` es la salida maestra de p5.sound. Envía la salida al
   *  destino del contexto de audio web de esta ventana. Contiene
   *  nodos de API de audio web que incluyen a dyanmicsCompressor (<code>.limiter</code>),
   *  y nodos de ganancia para <code>.input</code> y <code>.output</code>.
   *
   *  @property {Object} soundOut
   */
  p5.prototype.soundOut = p5.soundOut = p5sound;
  /**
   *  una conexión silenciosa con el DesinationNode
   *  que asegurará que todo lo que esté conectado a él
   *  no será basura recogida.
   *
   *  @private
   */
  p5.soundOut._silentNode = p5sound.audiocontext.createGain();
  p5.soundOut._silentNode.gain.value = 0;
  p5.soundOut._silentNode.connect(p5sound.audiocontext.destination);
  return p5sound;
}(audiocontext);
var helpers;
'use strict';
helpers = function () {
  var p5sound = master;
  /**
   * @for p5
   */
  /**
   * Devuelve un número que representa la frecuencia de muestreo, en muestras por segundo,
   * de todos los objetos de sonido en este contexto de audio. Está determinada por la
   * frecuencia de muestreo de la tarjeta de sonido de su sistema operativo y
   * y actualmente no es posible cambiarla.
   * A menudo es 44100, o el doble del rango de audición humana.
   *
   * @method sampleRate
   * @return {Number} samplerate muestras por segundo
   */
  p5.prototype.sampleRate = function () {
    return p5sound.audiocontext.sampleRate;
  };
  /**
   *  Devuelve el valor de nota MIDI más cercano para
   *  una frecuencia determinada.
   *
   *  @method freqToMidi
   *  @param  {Number} frecuencia A frecuencia, por ejemplo, el  "A"
   *                              por encima de la C media es 440Hz
   *  @return {Number}    valor de nota MIDI
   */
  p5.prototype.freqToMidi = function (f) {
    var mathlog2 = Math.log(f / 440) / Math.log(2);
    var m = Math.round(12 * mathlog2) + 69;
    return m;
  };
  /**
   *  Devuelve el valor de frecuencia de un valor de nota MIDI.
   *  El MIDI general trata las notas como enteros donde el C medio
   *  es 60, C # es 61, D es 62, etc. Útil para generar
   *  frecuencias musicales con osciladores.
   *
   *  @method  midiToFreq
   *  @param  {Number} midiNote El número de una nota MIDI
   *  @return {Number} Valor de frecuencia de la nota MIDI dada
   *  @example
   *  <div><code>
   *  let notes = [60, 64, 67, 72];
   *  let i = 0;
   *
   *  function setup() {
   *    osc = new p5.Oscillator('Triangle');
   *    osc.start();
   *    frameRate(1);
   *  }
   *
   *  function draw() {
   *    let freq = midiToFreq(notes[i]);
   *    osc.freq(freq);
   *    i++;
   *    if (i >= notes.length){
   *      i = 0;
   *    }
   *  }
   *  </code></div>
   */
  var midiToFreq = p5.prototype.midiToFreq = function (m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  };
  // Este método convierte las notas ANSI especificadas como una cadena "C4", "Eb3" en una frecuencia
  var noteToFreq = function (note) {
    if (typeof note !== 'string') {
      return note;
    }
    var wholeNotes = {
      A: 21,
      B: 23,
      C: 24,
      D: 26,
      E: 28,
      F: 29,
      G: 31
    };
    var value = wholeNotes[note[0].toUpperCase()];
    var octave = ~~note.slice(-1);
    value += 12 * (octave - 1);
    switch (note[1]) {
    case '#':
      value += 1;
      break;
    case 'b':
      value -= 1;
      break;
    default:
      break;
    }
    return midiToFreq(value);
  };
  /**
   *  Enliste los formatos SoundFile que incluirá. LoadSound
   *  buscará estas extensiones en su directorio y seleccionará
   *  un formato que sea compatible con el navegador web del cliente.
   *  <a href="http://media.io/">Here</a> es un conversor de archivos en 
   *  línea gratuito.
   *
   *  @method soundFormats
   *  @param {String} [...formats] i.e. 'mp3', 'wav', 'ogg'
   *  @example
   *  <div><code>
   *  function preload() {
   *    // establecer los formatos de sonido globales
   *    soundFormats('mp3', 'ogg');
   *
   *    // cargar beatbox.mp3 o .ogg, según el navegador
   *    mySound = loadSound('assets/beatbox.mp3');
   *  }
   *
   *  function setup() {
   *    mySound.play();
   *  }
   *  </code></div>
   */
  p5.prototype.soundFormats = function () {
    // restablecer la matriz de extensiones
    p5sound.extensions = [];
    // agregar extensiones
    for (var i = 0; i < arguments.length; i++) {
      arguments[i] = arguments[i].toLowerCase();
      if ([
          'mp3',
          'wav',
          'ogg',
          'm4a',
          'aac'
        ].indexOf(arguments[i]) > -1) {
        p5sound.extensions.push(arguments[i]);
      } else {
        throw arguments[i] + ' is not a valid sound format!';
      }
    }
  };
  p5.prototype.disposeSound = function () {
    for (var i = 0; i < p5sound.soundArray.length; i++) {
      p5sound.soundArray[i].dispose();
    }
  };
  // registrar removeSound para disponer de p5sound SoundFiles, Convolvers,
  // Osciladores etc cuando termina el boceto
  p5.prototype.registerMethod('remove', p5.prototype.disposeSound);
  p5.prototype._checkFileFormats = function (paths) {
    var path;
    // si la ruta es una sola cadena, verifique si se proporciona la extensión
    if (typeof paths === 'string') {
      path = paths;
      // ver si se proporciona una extensión
      var extTest = path.split('.').pop();
      // si se proporciona una extensión ...
      if ([
          'mp3',
          'wav',
          'ogg',
          'm4a',
          'aac'
        ].indexOf(extTest) > -1) {
        if (p5.prototype.isFileSupported(extTest)) {
          path = path;
        } else {
          var pathSplit = path.split('.');
          var pathCore = pathSplit[pathSplit.length - 1];
          for (var i = 0; i < p5sound.extensions.length; i++) {
            var extension = p5sound.extensions[i];
            var supported = p5.prototype.isFileSupported(extension);
            if (supported) {
              pathCore = '';
              if (pathSplit.length === 2) {
                pathCore += pathSplit[0];
              }
              for (var i = 1; i <= pathSplit.length - 2; i++) {
                var p = pathSplit[i];
                pathCore += '.' + p;
              }
              path = pathCore += '.';
              path = path += extension;
              break;
            }
          }
        }
      } else {
        for (var i = 0; i < p5sound.extensions.length; i++) {
          var extension = p5sound.extensions[i];
          var supported = p5.prototype.isFileSupported(extension);
          if (supported) {
            path = path + '.' + extension;
            break;
          }
        }
      }
    } else if (typeof paths === 'object') {
      for (var i = 0; i < paths.length; i++) {
        var extension = paths[i].split('.').pop();
        var supported = p5.prototype.isFileSupported(extension);
        if (supported) {
          // console.log('.'+extension + ' is ' + supported +
          //  ' supported by your browser.');
          path = paths[i];
          break;
        }
      }
    }
    return path;
  };
  /**
   *  Utilizado por Osc y Envelope para encadenar las matemáticas de señal
   */
  p5.prototype._mathChain = function (o, math, thisChain, nextChain, type) {
    // si este tipo de matemáticas ya existe en la cadena, reemplácelo
    for (var i in o.mathOps) {
      if (o.mathOps[i] instanceof type) {
        o.mathOps[i].dispose();
        thisChain = i;
        if (thisChain < o.mathOps.length - 1) {
          nextChain = o.mathOps[i + 1];
        }
      }
    }
    o.mathOps[thisChain - 1].disconnect();
    o.mathOps[thisChain - 1].connect(math);
    math.connect(nextChain);
    o.mathOps[thisChain] = math;
    return o;
  };
  // métodos auxiliares para convertir archivos de audio como .wav format,
  // se utilizará como archivo saving .wav y guardar el objeto blob.
  // Gracias a Matt Diamond's RecorderJS (Licencia MIT)
  // https://github.com/mattdiamond/Recorderjs
  function convertToWav(audioBuffer) {
    var leftChannel, rightChannel;
    leftChannel = audioBuffer.getChannelData(0);
    // manejar archivos mono
    if (audioBuffer.numberOfChannels > 1) {
      rightChannel = audioBuffer.getChannelData(1);
    } else {
      rightChannel = leftChannel;
    }
    var interleaved = interleave(leftChannel, rightChannel);
    // crear el búfer y la vista para crear el archivo .WAV 
    var buffer = new window.ArrayBuffer(44 + interleaved.length * 2);
    var view = new window.DataView(buffer);
    // escribir el contenedor WAV,
    // check spec at: https://web.archive.org/web/20171215131933/http://tiny.systems/software/soundProgrammer/WavFormatDocs.pdf
    // Descriptor de fragmento RIFF
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 36 + interleaved.length * 2, true);
    writeUTFBytes(view, 8, 'WAVE');
    // FMT sub-fragmento
    writeUTFBytes(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    // estéreo (2 canales)
    view.setUint16(22, 2, true);
    view.setUint32(24, p5sound.audiocontext.sampleRate, true);
    view.setUint32(28, p5sound.audiocontext.sampleRate * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    // sub-fragmento de datos
    writeUTFBytes(view, 36, 'data');
    view.setUint32(40, interleaved.length * 2, true);
    // escribir las muestras PCM
    var lng = interleaved.length;
    var index = 44;
    var volume = 1;
    for (var i = 0; i < lng; i++) {
      view.setInt16(index, interleaved[i] * (32767 * volume), true);
      index += 2;
    }
    return view;
  }
  // métodos de ayuda para guardar ondas
  function interleave(leftChannel, rightChannel) {
    var length = leftChannel.length + rightChannel.length;
    var result = new Float32Array(length);
    var inputIndex = 0;
    for (var index = 0; index < length;) {
      result[index++] = leftChannel[inputIndex];
      result[index++] = rightChannel[inputIndex];
      inputIndex++;
    }
    return result;
  }
  function writeUTFBytes(view, offset, string) {
    var lng = string.length;
    for (var i = 0; i < lng; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
  return {
    convertToWav: convertToWav,
    midiToFreq: midiToFreq,
    noteToFreq: noteToFreq
  };
}(master);
var errorHandler;
'use strict';
errorHandler = function () {
  /*
      Función auxiliar para generar un error
      con un trazo de pila personalizado que apunta al boceto
      y elimina otras partes del rastro de pila.
  
      @private
      @class customError
      @constructor
      @param  {String} name - nombre     custom  error name - error de nombre personalizado
      @param  {String} errorTrace   custom error trace - seguimiento de error personalizado
      @param  {String} failedPath    ruta al archivo que no se pudo cargar
      @property {String} name error de nombre personalizado
      @property {String} message mensaje de error personalizado
      @property {String} stack rastrear el error hasta una línea en el boceto del usuario.
                               Nota: esto edita el seguimiento de la pila dentro de p5.js y p5.sound.
      @property {String} originalStack unedited, seguimiento de pila original
      @property {String} failedPath ruta al archivo que no se pudo cargar
      @return {Error}     devuelve un objeto de error personalizado
     */
  var CustomError = function (name, errorTrace, failedPath) {
    var err = new Error();
    var tempStack, splitStack;
    err.name = name;
    err.originalStack = err.stack + errorTrace;
    tempStack = err.stack + errorTrace;
    err.failedPath = failedPath;
    // imprima solo la parte del seguimiento de la pila que se refiere al código de usuario:
    var splitStack = tempStack.split('\n');
    splitStack = splitStack.filter(function (ln) {
      return !ln.match(/(p5.|native code|globalInit)/g);
    });
    err.stack = splitStack.join('\n');
    return err;
  };
  return CustomError;
}();
var panner;
'use strict';
panner = function () {
  var p5sound = master;
  var ac = p5sound.audiocontext;
  // Panner estéreo
  // si hay un nodo stereo panner úselo
  if (typeof ac.createStereoPanner !== 'undefined') {
    p5.Panner = function (input, output) {
      this.stereoPanner = this.input = ac.createStereoPanner();
      input.connect(this.stereoPanner);
      this.stereoPanner.connect(output);
    };
    p5.Panner.prototype.pan = function (val, tFromNow) {
      var time = tFromNow || 0;
      var t = ac.currentTime + time;
      this.stereoPanner.pan.linearRampToValueAtTime(val, t);
    };
    //no implementado porque stereopanner
    //nodo no requiere esto y automáticamente
    //conviertará un solo canal o multicanal a estéreo.
    //probado con single y stereo, no con (>2) multichannel
    p5.Panner.prototype.inputChannels = function () {
    };
    p5.Panner.prototype.connect = function (obj) {
      this.stereoPanner.connect(obj);
    };
    p5.Panner.prototype.disconnect = function () {
      if (this.stereoPanner) {
        this.stereoPanner.disconnect();
      }
    };
  } else {
    // si no hay un objeto createStereoPanner
    // como en safari 7.1.7 en el momento de escribir este
    // usa este método para crear el efecto
    p5.Panner = function (input, output, numInputChannels) {
      this.input = ac.createGain();
      input.connect(this.input);
      this.left = ac.createGain();
      this.right = ac.createGain();
      this.left.channelInterpretation = 'discrete';
      this.right.channelInterpretation = 'discrete';
      // si la entrada es estéreo
      if (numInputChannels > 1) {
        this.splitter = ac.createChannelSplitter(2);
        this.input.connect(this.splitter);
        this.splitter.connect(this.left, 1);
        this.splitter.connect(this.right, 0);
      } else {
        this.input.connect(this.left);
        this.input.connect(this.right);
      }
      this.output = ac.createChannelMerger(2);
      this.left.connect(this.output, 0, 1);
      this.right.connect(this.output, 0, 0);
      this.output.connect(output);
    };
    // -1 es a la izquierda, +1 es a la derecha
    p5.Panner.prototype.pan = function (val, tFromNow) {
      var time = tFromNow || 0;
      var t = ac.currentTime + time;
      var v = (val + 1) / 2;
      var rightVal = Math.cos(v * Math.PI / 2);
      var leftVal = Math.sin(v * Math.PI / 2);
      this.left.gain.linearRampToValueAtTime(leftVal, t);
      this.right.gain.linearRampToValueAtTime(rightVal, t);
    };
    p5.Panner.prototype.inputChannels = function (numChannels) {
      if (numChannels === 1) {
        this.input.disconnect();
        this.input.connect(this.left);
        this.input.connect(this.right);
      } else if (numChannels === 2) {
        if (typeof (this.splitter === 'undefined')) {
          this.splitter = ac.createChannelSplitter(2);
        }
        this.input.disconnect();
        this.input.connect(this.splitter);
        this.splitter.connect(this.left, 1);
        this.splitter.connect(this.right, 0);
      }
    };
    p5.Panner.prototype.connect = function (obj) {
      this.output.connect(obj);
    };
    p5.Panner.prototype.disconnect = function () {
      if (this.output) {
        this.output.disconnect();
      }
    };
  }
}(master);
var soundfile;
'use strict';
soundfile = function () {
  var CustomError = errorHandler;
  var p5sound = master;
  var ac = p5sound.audiocontext;
  var midiToFreq = helpers.midiToFreq;
  var convertToWav = helpers.convertToWav;
  /**
   *  <p>SoundFile objeto con una ruta a un archivo.</p>
   *
   *  <p>Es posible que p5.SoundFile no esté disponible de inmediato porque
   *  carga la información del archivo de forma asincrónica.</p>
   *
   *  <p>Para hacer algo con el sonido tan pronto como se cargue,
   *  pase el nombre de una función como segundo parámetro.</p>
   *
   *  <p>Solo se requiere una ruta de archivo. Sin embargo, los formatos de archivo de audio
   *  (i.e. mp3, ogg, wav y m4a/aac) no son compatibles con todos
   *  los navegadores web. Si desea garantizar la compatibilidad, en lugar de una única
   *  ruta de archivo, puede incluir una matriz de filepaths de archivo y el navegador
   *  elegirá un formato que funcione.</p>
   *
   *  @class p5.SoundFile
   *  @constructor - constructor
   *  @param {String|Array} path - ruta  ruta a un archivo de sonido (String). Opcionalmente,
   *                                     puede incluir varios formatos de archivo
   *                                     en una matriz. Alternativamente, acepta un objeto
   *                                     de la API de archivos HTML5 o un archivo p5.File.
   *  @param {Function} [successCallback] Nombre de una función para llamar una vez que se carga el archivo
   *  @param {Function} [errorCallback]   Nombre de una función para llamar si el archivo falla
   *                                      al cargar. Esta función recibirá un error o un
   *                                      objeto XMLHttpRequest con información
   *                                      sobre lo que salió mal.
   *  @param {Function} [whileLoadingCallback]   Nombre de una función para llamar mientras se
   *                                             carga el archivo. Esa función recibirá
   *                                             el progreso de la solicitud para
   *                                             cargar el archivo de
   *                                             sonido (entre 0 y 1) como su primer
   *                                             parámetro. Este progreso
   *                                             no tiene en cuenta el tiempo adicional
   *                                             necesario para decodificar los datos de audio.
   *
   *  @example - ejemplo
   *  <div><code>
   *
   *  function preload() {
   *    soundFormats('mp3', 'ogg');
   *    mySound = loadSound('assets/doorbell.mp3');
   *  }
   *
   *  function setup() {
   *    mySound.setVolume(0.1);
   *    mySound.play();
   *  }
   *
   * </code></div>
   */
  p5.SoundFile = function (paths, onload, onerror, whileLoading) {
    if (typeof paths !== 'undefined') {
      if (typeof paths === 'string' || typeof paths[0] === 'string') {
        var path = p5.prototype._checkFileFormats(paths);
        this.url = path;
      } else if (typeof paths === 'object') {
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
          // El archivo API no es compatile con este nanegador
          lanzando 'No se puede cargar el archivo porque el archivo API no es compatible';
        }
      }
      // si el tipo es un p5.File...obtener el archivo real
      if (paths.file) {
        paths = paths.file;
      }
      this.file = paths;
    }
    // private _onended llamar de vuelta, establecido por el método: onended(callback)
    this._onended = function () {
    };
    this._looping = false;
    this._playing = false;
    this._paused = false;
    this._pauseTime = 0;
    // pistas para programar eventos con addCue() removeCue()
    this._cues = [];
    this._cueIDCounter = 0;
    //  posición de la muestra reproducida más recientemente
    this._lastPos = 0;
    this._counterNode = null;
    this._scopeNode = null;
    // matriz de fuentes para que todas puedan ser detenidas!
    this.bufferSourceNodes = [];
    // fuente actual
    this.bufferSourceNode = null;
    this.buffer = null;
    this.playbackRate = 1;
    this.input = p5sound.audiocontext.createGain();
    this.output = p5sound.audiocontext.createGain();
    this.reversed = false;
    // inicio y final de la reproducción / bucle
    this.startTime = 0;
    this.endTime = null;
    this.pauseTime = 0;
    // "reiniciar" detendría la reproducción antes de volver a redisparar
    this.mode = 'sustain';
    // momento en que se inició la reproducción, en milisegundos
    this.startMillis = null;
    // stereo panning
    this.panPosition = 0;
    this.panner = new p5.Panner(this.output, p5sound.input, 2);
    // es posible crear una instancia de un soundfile sin ruta
    if (this.url || this.file) {
      this.load(onload, onerror);
    }
    // agregue este p5.SoundFile al soundArray
    p5sound.soundArray.push(this);
    if (typeof whileLoading === 'function') {
      this._whileLoading = whileLoading;
    } else {
      this._whileLoading = function () {
      };
    }
    this._onAudioProcess = _onAudioProcess.bind(this);
    this._clearOnEnd = _clearOnEnd.bind(this);
  };
  // registrar el manejo de precarga de loadSound
  p5.prototype.registerPreloadMethod('loadSound', p5.prototype);
  /**
   *  loadSound() Devuelve un nuevo p5.SoundFile de una especificada
   *  ruta. Si se llama durante la precarga(), el p5.SoundFile estará listo
   *  para reproducir() y extraer(). ISi se llama fuera de la 
   *  precarga, p5.SoundFile no estará listo de inmediato, por lo que
   *  loadSound acepta una rellamada como segundo parámetro. Utilizar
   *  <a href="https://github.com/processing/p5.js/wiki/Local-server">
   *  local server</a> como recomendación para cargar archivos externos.
   *
   *  @method loadSound
   *  @param  {String|Array}   path - ruta     Ruta al archivo de sonido, o una matriz con
   *                                           rutas a soundfiles en múltiples formatos
   *                                           es decir ['sound.ogg', 'sound.mp3'].
   *                                           Alternativamente, acepta un objeto: ya sea
   *                                           de HTML5 File API, o de p5.File.
   *  @param {Function} [successCallback]  Nombre de una función para llamar una vez que se carga el archivo
   *  @param {Function} [errorCallback]   Nombre de una función para llamar si hay
   *                                      un error al cargar el archivo.
   *  @param {Function} [whileLoading] Nombre de una función para llamar mientras se carga el archivo.
   *                                 Esta función recibirá el porcentaje cargado
   *                                 hasta el momento, de 0.0 a 1.0.
   *  @return {SoundFile}            Devuelve unp5.SoundFile
   *  @example - ejemplo
   *  <div><code>
   *  function preload() {
   *   mySound = loadSound('assets/doorbell.mp3');
   *  }
   *
   *  function setup() {
   *    mySound.setVolume(0.1);
   *    mySound.play();
   *  }
   *  </code></div>
   */
  p5.prototype.loadSound = function (path, callback, onerror, whileLoading) {
    // si se carga localmente sin un servidor
    if (window.location.origin.indexOf('file://') > -1 && window.cordova === 'undefined') {
      window.alert('This sketch may require a server to load external files. Please see http://bit.ly/1qcInwS');
    }
    var self = this;
    var s = new p5.SoundFile(path, function () {
      if (typeof callback === 'function') {
        callback.apply(self, arguments);
      }
      if (typeof self._decrementPreload === 'function') {
        self._decrementPreload();
      }
    }, onerror, whileLoading);
    return s;
  };
  /**
   * Esta es una función auxiliar que p5.SoundFile llama para
   * cargarse a si mismo. Acepta una rellamada (el nombre de otra función)
   * como parámetro opcional.
   *
   * @private
   * @param {Function} [successCallback]   Nombre de una función para llamar una vez que se carga el archivo
   * @param {Function} [errorCallback]     Nombre de una función para llamar si hay un error
   */
  p5.SoundFile.prototype.load = function (callback, errorCallback) {
    var self = this;
    var errorTrace = new Error().stack;
    if (this.url !== undefined && this.url !== '') {
      var request = new XMLHttpRequest();
      request.addEventListener('progress', function (evt) {
        self._updateProgress(evt);
      }, false);
      request.open('GET', this.url, true);
      request.responseType = 'arraybuffer';
      request.onload = function () {
        if (request.status === 200) {
          // al cargar el archivo con éxito:
          if (!self.panner)
            return;
          ac.decodeAudioData(request.response, // success decoding buffer:
          function (buff) {
            if (!self.panner)
              return;
            self.buffer = buff;
            self.panner.inputChannels(buff.numberOfChannels);
            if (callback) {
              callback(self);
            }
          }, // búfer de decodificación de errores. "e" no está definido en Chrome 22/11/2015
          function () {
            if (!self.panner)
              return;
            var err = new CustomError('decodeAudioData', errorTrace, self.url);
            var msg = 'AudioContext error at decodeAudioData for ' + self.url;
            if (errorCallback) {
              err.msg = msg;
              errorCallback(err);
            } else {
              console.error(msg + '\n The error stack trace includes: \n' + err.stack);
            }
          });
        } else {
          if (!self.panner)
            return;
          var err = new CustomError('loadSound', errorTrace, self.url);
          var msg = 'Unable to load ' + self.url + '. The request status was: ' + request.status + ' (' + request.statusText + ')';
          if (errorCallback) {
            err.message = msg;
            errorCallback(err);
          } else {
            console.error(msg + '\n The error stack trace includes: \n' + err.stack);
          }
        }
      };
      // si hay otro error, aparte del 404 ...
      request.onerror = function () {
        var err = new CustomError('loadSound', errorTrace, self.url);
        var msg = 'There was no response from the server at ' + self.url + '. Check the url and internet connectivity.';
        if (errorCallback) {
          err.message = msg;
          errorCallback(err);
        } else {
          console.error(msg + '\n The error stack trace includes: \n' + err.stack);
        }
      };
      request.send();
    } else if (this.file !== undefined) {
      var reader = new FileReader();
      reader.onload = function () {
        if (!self.panner)
          return;
        ac.decodeAudioData(reader.result, function (buff) {
          if (!self.panner)
            return;
          self.buffer = buff;
          self.panner.inputChannels(buff.numberOfChannels);
          if (callback) {
            callback(self);
          }
        });
      };
      reader.onerror = function (e) {
        if (!self.panner)
          return;
        if (onerror) {
          onerror(e);
        }
      };
      reader.readAsArrayBuffer(this.file);
    }
  };
  // TO DO: use este método para crear una barra de carga que muestre el progreso durante la carga / decodificación del archivo.
  p5.SoundFile.prototype._updateProgress = function (evt) {
    if (evt.lengthComputable) {
      var percentComplete = evt.loaded / evt.total * 0.99;
      this._whileLoading(percentComplete, evt);
    } else {
      // No se puede calcular la información de progreso porque se desconoce el tamaño total
      this._whileLoading('size unknown');
    }
  };
  /**
   *  Devuelve verdadero si el archivo de sonido terminó de cargarse correctamente.
   *
   *  @method  isLoaded
   *  @return {Boolean}
   */
  p5.SoundFile.prototype.isLoaded = function () {
    if (this.buffer) {
      return true;
    } else {
      return false;
    }
  };
  /**
   * Play the p5.SoundFile
   *
   * @method play - reproducir
   * @param {Number} [startTime]            (optional) programar la reproducción para que comience (en segundos a partir de ahora).
   * @param {Number} [rate]             (optional) tasa de reproducción
   * @param {Number} [amp]              (optional) amplitud (volumen)
   *                                     de reproducción
   * @param {Number} [cueStart]        (optional) tiempo de inicio de la señal en segundos
   * @param {Number} [duration]          (optional) duración de la reproducción en segundos
   */
  p5.SoundFile.prototype.play = function (startTime, rate, amp, _cueStart, duration) {
    if (!this.output) {
      console.warn('SoundFile.play() called after dispose');
      return;
    }
    var self = this;
    var now = p5sound.audiocontext.currentTime;
    var cueStart, cueEnd;
    var time = startTime || 0;
    if (time < 0) {
      time = 0;
    }
    time = time + now;
    if (typeof rate !== 'undefined') {
      this.rate(rate);
    }
    if (typeof amp !== 'undefined') {
      this.setVolume(amp);
    }
    // TO DO: si ya está reproduciendo, cree una matriz de búferes para detener fácilmente ()
    if (this.buffer) {
      // restablecer el tiempo de pausa (si estaba en pausa)
      this._pauseTime = 0;
      // manejar reiniciar modo de reproducción
      if (this.mode === 'restart' && this.buffer && this.bufferSourceNode) {
        this.bufferSourceNode.stop(time);
        this._counterNode.stop(time);
      }
      //no crees otra instancia si ya esta reproduciendo.
      if (this.mode === 'untildone' && this.isPlaying()) {
        return;
      }
      // haz una nueva fuente y un contador. Se les asigna automáticamente playbackRate y bufér.
      this.bufferSourceNode = this._initSourceNode();
      // basura recolectada counterNode y crear un nuevo
      borrar this._counterNode;
      this._counterNode = this._initCounterNode();
      if (_cueStart) {
        if (_cueStart >= 0 && _cueStart < this.buffer.duration) {
          // this.startTime = cueStart;
          cueStart = _cueStart;
        } else {
          throw 'start time out of range';
        }
      } else {
        cueStart = 0;
      }
      if (duration) {
        // si la duración es mayor que buffer.duration, simplemente reproduzca el archivo completo de todos modos en lugar de lanzar un error
        duration = duration <= this.buffer.duration - cueStart ? duration : this.buffer.duration;
      }
      // si estaba en pausa, reproducir en la posición de pausa
      if (this._paused) {
        this.bufferSourceNode.start(time, this.pauseTime, duration);
        this._counterNode.start(time, this.pauseTime, duration);
      } else {
        this.bufferSourceNode.start(time, cueStart, duration);
        this._counterNode.start(time, cueStart, duration);
      }
      this._playing = true;
      this._paused = false;
      // agregar fuente a la matriz de fuentes, que se usa en stopAll ()
      this.bufferSourceNodes.push(this.bufferSourceNode);
      this.bufferSourceNode._arrayIndex = this.bufferSourceNodes.length - 1;
      this.bufferSourceNode.addEventListener('ended', this._clearOnEnd);
    } else {
      throw 'not ready to play file, buffer has yet to load. Try preload()';
    }
    // si está en bucle, se reiniciará en el momento original
    this.bufferSourceNode.loop = this._looping;
    this._counterNode.loop = this._looping;
    if (this._looping === true) {
      cueEnd = duration ? duration : cueStart - 1e-15;
      this.bufferSourceNode.loopStart = cueStart;
      this.bufferSourceNode.loopEnd = cueEnd;
      this._counterNode.loopStart = cueStart;
      this._counterNode.loopEnd = cueEnd;
    }
  };
  /**
   *  p5.SoundFile tiene dos modos de reproducción: <code>restart</code> y
   *  <code>sustain</code>. PEl modo de reproducción determina lo que le sucede
   *  a un p5.SoundFile si se activa durante la reproducción.
   *  En el modo sostenido, la reproducción continuará simultáneamente con la
   *  nueva reproducción. En el modo de reinicio, play () detendrá la reproducción
   *  y comenzará de nuevo. Con untilDone, se reproducirá un sonido solo si
   *  aún no se está reproduciendo. Sustain es el modo predeterminado.
   *
   *  @method  playMode
   *  @param  {String} str 'restart' o 'sustain' o 'untilDone'
   *  @example
   *  <div><code>
   *  let mySound;
   *  function preload(){
   *    mySound = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *  function mouseClicked() {
   *    mySound.playMode('sustain');
   *    mySound.play();
   *  }
   *  function keyPressed() {
   *    mySound.playMode('restart');
   *    mySound.play();
   *  }
   *
   * </code></div>
   */
  p5.SoundFile.prototype.playMode = function (str) {
    var s = str.toLowerCase();
    // si reinicia, detiene la reproducción de todos los demás sonidos
    if (s === 'restart' && this.buffer && this.bufferSourceNode) {
      for (var i = 0; i < this.bufferSourceNodes.length - 1; i++) {
        var now = p5sound.audiocontext.currentTime;
        this.bufferSourceNodes[i].stop(now);
      }
    }
    // establecer el modo de reproducción para efectuar la reproducción futura
    if (s === 'restart' || s === 'sustain' || s === 'untildone') {
      this.mode = s;
    } else {
      throw 'Invalid play mode. Must be either "restart" or "sustain"';
    }
  };
  /**
   *  Pausa un archivo que se está reproduciendo actualmente. Si el archivo no esta
   *  reproduciendo, nada sucederá.
   *
   *  Después de pausar, .play () se reanudará desde la posición
   *  de pausa.
   *  Si p5.SoundFile se ha configurado para que se repita antes de pausarlo,
   *  continuará repitiendo después de que se reanude con .play ().
   *
   *  @method pause - pausar
   *  @param {Number} [startTime] (optional) programar evento para que ocurra
   *                               segundos a partir de ahora
   *  @example
   *  <div><code>
   *  let soundFile;
   *
   *  function preload() {
   *    soundFormats('ogg', 'mp3');
   *    soundFile = loadSound('assets/Damscray_-_Dancing_Tiger_02.mp3');
   *  }
   *  function setup() {
   *    background(0, 255, 0);
   *    soundFile.setVolume(0.1);
   *    soundFile.loop();
   *  }
   *  function keyTyped() {
   *    if (key == 'p') {
   *      soundFile.pause();
   *      background(255, 0, 0);
   *    }
   *  }
   *
   *  function keyReleased() {
   *    if (key == 'p') {
   *      soundFile.play();
   *      background(0, 255, 0);
   *    }
   *  }
   *  </code>
   *  </div>
   */
  p5.SoundFile.prototype.pause = function (startTime) {
    var now = p5sound.audiocontext.currentTime;
    var time = startTime || 0;
    var pTime = time + now;
    if (this.isPlaying() && this.buffer && this.bufferSourceNode) {
      this.pauseTime = this.currentTime();
      this.bufferSourceNode.stop(pTime);
      this._counterNode.stop(pTime);
      this._paused = true;
      this._playing = false;
      this._pauseTime = this.currentTime();
    } else {
      this._pauseTime = 0;
    }
  };
  /**
   * Ejecute el bucle p5.SoundFile. Acepta parámetros opcionales para
   * establecer la velocidad de reproducción, el volumen de reproducción, loopStart, loopEnd.
   *
   * @method loop - bucle
   * @param {Number} [startTime] (optional) programar evento para que ocurra
   *                             segundos a partir de ahora
   * @param {Number} [rate]        (optional) tasa de reproducción
   * @param {Number} [amp]         (optional) volumen de reproducción
   * @param {Number} [cueLoopStart] (optional) startTime en segundos
   * @param {Number} [duration]  (optional) loop duration en segundos
   */
  p5.SoundFile.prototype.loop = function (startTime, rate, amp, loopStart, duration) {
    this._looping = true;
    this.play(startTime, rate, amp, loopStart, duration);
  };
  /**
   * Establezca el indicador de bucle de un p5.SoundFile en verdadero o falso. Si el sonido
   * se está reproduciendo actualmente, este cambio tendrá
   * efecto cuando llegue al final de la reproducción actual.
   *
   * @method setLoop
   * @param {Boolean} Boolean - Booleano  Establezca el bucle en verdadero o falso
   */
  p5.SoundFile.prototype.setLoop = function (bool) {
    if (bool === true) {
      this._looping = true;
    } else if (bool === false) {
      this._looping = false;
    } else {
      throw 'Error: setLoop accepts either true or false';
    }
    if (this.bufferSourceNode) {
      this.bufferSourceNode.loop = this._looping;
      this._counterNode.loop = this._looping;
    }
  };
  /**
   * Devuelve 'verdadero' si un p5.SoundFile está actualmente en bucle y se reproduce, 'falso' si no.
   *
   * @method isLooping
   * @return {Boolean}
   */
  p5.SoundFile.prototype.isLooping = function () {
    if (!this.bufferSourceNode) {
      return false;
    }
    if (this._looping === true && this.isPlaying() === true) {
      return true;
    }
    return false;
  };
  /**
   *  Devuelve verdadero si se está reproduciendo un p5.SoundFile, falso si no (es decir,
   *  en pausa o detenido).
   *
   *  @method isPlaying
   *  @return {Boolean}
   */
  p5.SoundFile.prototype.isPlaying = function () {
    return this._playing;
  };
  /**
   *  Devuelve verdadero si un p5.SoundFile está en pausa, falso si no (es decir,
   *  reproduciéndose o detenido).
   *
   *  @method  isPaused
   *  @return {Boolean}
   */
  p5.SoundFile.prototype.isPaused = function () {
    return this._paused;
  };
  /**
   * Detener la reproducción de soundfile
   *
   * @method stop - detener
   * @param {Number} [startTime] (optional) programar el evento para que ocurra
   *                             en segundos a partir de ahora
   */
  p5.SoundFile.prototype.stop = function (timeFromNow) {
    var time = timeFromNow || 0;
    if (this.mode === 'sustain' || this.mode === 'untildone') {
      this.stopAll(time);
      this._playing = false;
      this.pauseTime = 0;
      this._paused = false;
    } else if (this.buffer && this.bufferSourceNode) {
      var now = p5sound.audiocontext.currentTime;
      var t = time || 0;
      this.pauseTime = 0;
      this.bufferSourceNode.stop(now + t);
      this._counterNode.stop(now + t);
      this._playing = false;
      this._paused = false;
    }
  };
  /**
   *  Detenga la reproducción en todas las fuentes de soundfile's.
   *  @private
   */
  p5.SoundFile.prototype.stopAll = function (_time) {
    var now = p5sound.audiocontext.currentTime;
    var time = _time || 0;
    if (this.buffer && this.bufferSourceNode) {
      for (var i in this.bufferSourceNodes) {
        const bufferSourceNode = this.bufferSourceNodes[i];
        if (!!bufferSourceNode) {
          try {
            bufferSourceNode.stop(now + time);
          } catch (e) {
          }
        }
      }
      this._counterNode.stop(now + time);
      this._onended(this);
    }
  };
  /**
   *  Multiplique el volumen de salida (amplitud) de un archivo de sonido
   *  entre 0.0 (silencio) y 1.0 (volumen completo).
   *  1.0 es la amplitud máxima de un sonido digital, por lo
   *  que multiplicarlo por más de 1.0 puede causar distorsión digital. Para
   *  atenuar, proporcione un parámetro <code> rampTime </code>. Para
   *  disminuciones más complejas, consulte la clase Envelope.
   *
   *  Alternativamente, puede pasar una fuente de señal como un
   *  oscilador para modular la amplitud con una señal de audio.
   *
   *  @method  setVolume
   *  @param {Number|Object} volume  Volume (amplitude) between 0.0
   *                                     and 1.0 or modulating signal/oscillator
   *  @param {Number} [rampTime]  Se desvanecen durante t segundos
   *  @param {Number} [timeFromNow]  Programe este evento para que suceda en
   *                                 t segundos en el futuro
   */
  p5.SoundFile.prototype.setVolume = function (vol, _rampTime, _tFromNow) {
    if (typeof vol === 'number') {
      var rampTime = _rampTime || 0;
      var tFromNow = _tFromNow || 0;
      var now = p5sound.audiocontext.currentTime;
      var currentVol = this.output.gain.value;
      this.output.gain.cancelScheduledValues(now + tFromNow);
      this.output.gain.linearRampToValueAtTime(currentVol, now + tFromNow);
      this.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime);
    } else if (vol) {
      vol.connect(this.output.gain);
    } else {
      // devolver el nodo de ganancia
      return this.output.gain;
    }
  };
  // Lo mismo que setVolume, para que coincida con el sonido de procesamiento.
  p5.SoundFile.prototype.amp = p5.SoundFile.prototype.setVolume;
  // estas son lo mismo
  p5.SoundFile.prototype.fade = p5.SoundFile.prototype.setVolume;
  p5.SoundFile.prototype.getVolume = function () {
    return this.output.gain.value;
  };
  /**
   * Establezca la panorámica estéreo de un objeto p5.sound  
   * en un número de punto flotante entre -1.0 (izquierda) y 1.0 (derecha).
   * Default is 0.0 (center).
   *
   * @method pan
   * @param {Number} [panValue]     Configurar el panoramizador estéreo
   * @param {Number} [timeFromNow]  programar este evento para que suceda
   *                                 segundos a partir de ahora
   * @example
   * <div><code>
   *
   *  let ball = {};
   *  let soundFile;
   *
   *  function preload() {
   *    soundFormats('ogg', 'mp3');
   *    soundFile = loadSound('assets/beatbox.mp3');
   *  }
   *
   *  function draw() {
   *    background(0);
   *    ball.x = constrain(mouseX, 0, width);
   *    ellipse(ball.x, height/2, 20, 20)
   *  }
   *
   *  function mousePressed(){
   *    // mapear la ubicación x de la bola a un grado panorámico
   *    // entre -1.0 (izquierda) y 1.0 (derecha)
   *    let panning = map(ball.x, 0., width,-1.0, 1.0);
   *    soundFile.pan(panning);
   *    soundFile.play();
   *  }
   *  </div></code>
   */
  p5.SoundFile.prototype.pan = function (pval, tFromNow) {
    this.panPosition = pval;
    this.panner.pan(pval, tFromNow);
  };
  /**
   * Devuelve la posición de panorama estéreo actual (-1.0 a 1.0)
   *
   * @method getPan
   * @return {Number} Devuelve el ajuste de panorama estéreo del oscilador
   *                          como un número entre -1.0 (izquierda) y 1.0 (derecha).
   *                         0.0 es central y predeterminado.
   */
  p5.SoundFile.prototype.getPan = function () {
    return this.panPosition;
  };
  /**
   *  Establece la velocidad de reproducción de un archivo de sonido. Cambiará la velocidad y el tono.
   *  Los valores inferiores a cero invertirán el búfer de audio.
   *
   *  @method rate - velocidad
   *  @param {Number} [playbackRate]     Establece la velocidad de reproducción. 1.0 es normal,
   *                                     .5 es la mitad de la velocidad, 2.0 es el doble de rápido.
   *                                     Los valores inferiores a cero se reproducen al revés.
   *  @example
   *  <div><code>
   *  let song;
   *
   *  function preload() {
   *    song = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *
   *  function setup() {
   *    song.loop();
   *  }
   *
   *  function draw() {
   *    background(200);
   *
   *    // Establezca la tasa en un rango entre 0,1 y 4
   *    // Cambiar la velocidad también altera el tono
   *    let speed = map(mouseY, 0.1, height, 0, 2);
   *    speed = constrain(speed, 0.01, 4);
   *    song.rate(speed);
   *
   *    // Dibuja un círculo para mostrar lo que está pasando.
   *    stroke(0);
   *    fill(51, 100);
   *    ellipse(mouseX, 100, 48, 48);
   *  }
   *
   * </code>
   * </div>
   *
   */
  p5.SoundFile.prototype.rate = function (playbackRate) {
    var reverse = false;
    if (typeof playbackRate === 'undefined') {
      return this.playbackRate;
    }
    this.playbackRate = playbackRate;
    if (playbackRate === 0) {
      playbackRate = 1e-13;
    } else if (playbackRate < 0 && !this.reversed) {
      playbackRate = Math.abs(playbackRate);
      reverse = true;
    } else if (playbackRate > 0 && this.reversed) {
      reverse = true;
    }
    if (this.bufferSourceNode) {
      var now = p5sound.audiocontext.currentTime;
      this.bufferSourceNode.playbackRate.cancelScheduledValues(now);
      this.bufferSourceNode.playbackRate.linearRampToValueAtTime(Math.abs(playbackRate), now);
      this._counterNode.playbackRate.cancelScheduledValues(now);
      this._counterNode.playbackRate.linearRampToValueAtTime(Math.abs(playbackRate), now);
    }
    if (reverse) {
      this.reverseBuffer();
    }
    return this.playbackRate;
  };
  // TO DO: documenta esto
  p5.SoundFile.prototype.setPitch = function (num) {
    var newPlaybackRate = midiToFreq(num) / midiToFreq(60);
    this.rate(newPlaybackRate);
  };
  p5.SoundFile.prototype.getPlaybackRate = function () {
    return this.playbackRate;
  };
  /**
   * Devuelve la duración de un archivo de sonido en segundos.
   *
   * @method duration - duración
   * @return {Number} La duración de un soundFile en segundos.
   */
  p5.SoundFile.prototype.duration = function () {
    // Duración de la devolución
    if (this.buffer) {
      return this.buffer.duration;
    } else {
      return 0;
    }
  };
  /**
   * Devuelve la posición actual del cabezal de reproducción p5.SoundFile, en segundos.
   * El tiempo es relativo a la dirección normal del búfer, por lo que si se ha llamado `reverseBuffer`,
   * currentTime contará hacia atrás.
   *
   * @method currentTime
   * @return {Number}   currentTime del soundFile en segundos.
   */
  p5.SoundFile.prototype.currentTime = function () {
    return this.reversed ? Math.abs(this._lastPos - this.buffer.length) / ac.sampleRate : this._lastPos / ac.sampleRate;
  };
  /**
   * Mueva el cabezal de reproducción de la canción a una posición, en segundos. Inicie el cronometraje
   * y la duración de la reproducción. Si no se proporciona ninguno, el archivo se reiniciará
   * para que se reproduzca durante toda la duración de principio a fin.
   *
   * @method jump - saltar
   * @param {Number} cueTime    cueTime del soundFile en segundos.
   * @param {Number} duration    duración en segundos.
   */
  p5.SoundFile.prototype.jump = function (cueTime, duration) {
    if (cueTime < 0 || cueTime > this.buffer.duration) {
      throw 'jump time out of range';
    }
    if (duration > this.buffer.duration - cueTime) {
      throw 'end time out of range';
    }
    var cTime = cueTime || 0;
    var dur = duration || undefined;
    if (this.isPlaying()) {
      this.stop(0);
    }
    this.play(0, this.playbackRate, this.output.gain.value, cTime, dur);
  };
  /**
  * Devuelve el número de canales en un archivo de sonido.
  * Por ejemplo, Mono = 1, Stereo = 2.
  *
  * @method channels - canales
  * @return {Number} [channels]
  */
  p5.SoundFile.prototype.channels = function () {
    return this.buffer.numberOfChannels;
  };
  /**
  * Devuelve la frecuencia de muestreo del archivo de sonido.
  *
  * @method sampleRate
  * @return {Number} [sampleRate]
  */
  p5.SoundFile.prototype.sampleRate = function () {
    return this.buffer.sampleRate;
  };
  /**
  * Devuelve el número de muestras en un archivo de sonido.
  * Igual a sampleRate * duración.
  *
  * @method frames - marcos
  * @return {Number} [sampleCount]
  */
  p5.SoundFile.prototype.frames = function () {
    return this.buffer.length;
  };
  /**
   * Devuelve una matriz de picos de amplitud en un p5.SoundFile que se
   * puede usar para dibujar una forma de onda estática. Explora el búfer de audio del p5.SoundFile
   * para encontrar las mayores amplitudes. Acepta un
   * parámetro, 'longitud', que determina el tamaño de la matriz.
   * Los arreglos más grandes dan como resultado visualizaciones de formas de onda más precisas.
   *
   * Inspired by Wavesurfer.js.
   *
   * @method  getPeaks
   * @params {Number} [length] length es el tamaño de la matriz devuelta.
   *                          Una mayor longitud da como resultado una mayor precisión.
   *                          El valor predeterminado es 5 * de ancho de la ventana del navegador.
   * @returns {Float32Array} Array of peaks.- Matriz de picos.
   */ 
  p5.SoundFile.prototype.getPeaks = function (length) {
    if (this.buffer) {
      // establecer la longitud al ancho de la ventana si no se proporciona longitud
      if (!length) {
        length = window.width * 5;
      }
      if (this.buffer) {
        var buffer = this.buffer;
        var sampleSize = buffer.length / length;
        var sampleStep = ~~(sampleSize / 10) || 1;
        var channels = buffer.numberOfChannels;
        var peaks = new Float32Array(Math.round(length));
        for (var c = 0; c < channels; c++) {
          var chan = buffer.getChannelData(c);
          for (var i = 0; i < length; i++) {
            var start = ~~(i * sampleSize);
            var end = ~~(start + sampleSize);
            var max = 0;
            for (var j = start; j < end; j += sampleStep) {
              var value = chan[j];
              if (value > max) {
                max = value;
              } else if (-value > max) {
                max = value;
              }
            }
            if (c === 0 || Math.abs(max) > peaks[i]) {
              peaks[i] = max;
            }
          }
        }
        return peaks;
      }
    } else {
      throw 'Cannot load peaks yet, buffer is not loaded';
    }
  };
  /**
   *  Invierte la fuente de búfer de p5.SoundFile.
   *  La reproducción debe manejarse por separado (ver ejemplo).
   *
   *  @method  reverseBuffer
   *  @example
   *  <div><code>
   *  let drum;
   *
   *  function preload() {
   *    drum = loadSound('assets/drum.mp3');
   *  }
   *
   *  function setup() {
   *    drum.reverseBuffer();
   *    drum.play();
   *  }
   *
   * </code>
   * </div>
   */
  p5.SoundFile.prototype.reverseBuffer = function () {
    if (this.buffer) {
      var currentPos = this._lastPos / ac.sampleRate;
      var curVol = this.getVolume();
      this.setVolume(0, 0.001);
      const numChannels = this.buffer.numberOfChannels;
      for (var i = 0; i < numChannels; i++) {
        this.buffer.getChannelData(i).reverse();
      }
      // establecer marcaa invertida
      this.reversed = !this.reversed;
      if (currentPos) {
        this.jump(this.duration() - currentPos);
      }
      this.setVolume(curVol, 0.001);
    } else {
      throw 'SoundFile is not done loading';
    }
  };
  /**
   *  Programe un evento para que se llame cuando el soundfile
   *  llegue al final de un búfer. Si el soundfile se
   *  reproduce una vez, se llamará cuando finalice.
   *  Si está en bucle, se llamará cuando se
   *  llame un alto. 
   *
   *  @method  onended
   *  @param  {Function} callback function llamar cuando el
   *                              soundfile ha terminado.
   */
  p5.SoundFile.prototype.onended = function (callback) {
    this._onended = callback;
    return this;
  };
  p5.SoundFile.prototype.add = function () {
  };
  p5.SoundFile.prototype.dispose = function () {
    var now = p5sound.audiocontext.currentTime;
    // eliminar la referencia a soundfile
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    this.stop(now);
    if (this.buffer && this.bufferSourceNode) {
      for (var i = 0; i < this.bufferSourceNodes.length - 1; i++) {
        if (this.bufferSourceNodes[i] !== null) {
          this.bufferSourceNodes[i].disconnect();
          try {
            this.bufferSourceNodes[i].stop(now);
          } catch (e) {
            console.warning('no buffer source node to dispose');
          }
          this.bufferSourceNodes[i] = null;
        }
      }
      if (this.isPlaying()) {
        try {
          this._counterNode.stop(now);
        } catch (e) {
          console.log(e);
        }
        this._counterNode = null;
      }
    }
    if (this.output) {
      this.output.disconnect();
      this.output = null;
    }
    if (this.panner) {
      this.panner.disconnect();
      this.panner = null;
    }
  };
  /**
   * Conecta la salida de un objeto p5sound a la entrada de otro
   * objeto p5.sound. Por ejemplo, puede conectar un p5.SoundFile a
   * una FFT o un efecto. Si no se proporciona ningún parámetro,
   * se conectará a la salida maestra. La mayoría de los objetos p5sound se conectan
   * a la salida maestra cuando se crean.
   *
   * @method connect
   * @param {Object} [object] Objeto de audio que acepta una entrada
   */
  p5.SoundFile.prototype.connect = function (unit) {
    if (!unit) {
      this.panner.connect(p5sound.input);
    } else {
      if (unit.hasOwnProperty('input')) {
        this.panner.connect(unit.input);
      } else {
        this.panner.connect(unit);
      }
    }
  };
  /**
   * Desconecta la salida de este objeto p5sound.
   *
   * @method disconnect - desconectar
   */
  p5.SoundFile.prototype.disconnect = function () {
    if (this.panner) {
      this.panner.disconnect();
    }
  };
  /**
   */
  p5.SoundFile.prototype.getLevel = function () {
    console.warn('p5.SoundFile.getLevel has been removed from the library. Use p5.Amplitude instead');
  };
  /**
   *  Restablezca la fuente de este SoundFile
   *  a una nueva ruta (URL).
   *
   *  @method  setPath
   *  @param {String}   path     ruta al archivo de audio
   *  @param {Function} callback Callback
   */
  p5.SoundFile.prototype.setPath = function (p, callback) {
    var path = p5.prototype._checkFileFormats(p);
    this.url = path;
    this.load(callback);
  };
  /**
   *  Reemplace el búfer de audio actual con un búfer nuevo.
   *
   *  @method setBuffer
   *  @param {Array} buf Matriz de matrices Float32. 2 Float32 Las matrices
   *                     crearán una fuente estéreo. 1 creará una 
   *                     fuente mono.
   */
  p5.SoundFile.prototype.setBuffer = function (buf) {
    var numChannels = buf.length;
    var size = buf[0].length;
    var newBuffer = ac.createBuffer(numChannels, size, ac.sampleRate);
    if (!(buf[0] instanceof Float32Array)) {
      buf[0] = new Float32Array(buf[0]);
    }
    for (var channelNum = 0; channelNum < numChannels; channelNum++) {
      var channel = newBuffer.getChannelData(channelNum);
      channel.set(buf[channelNum]);
    }
    this.buffer = newBuffer;
    // establecer el número de canales en la entrada al panoramizador
    this.panner.inputChannels(numChannels);
  };
  //////////////////////////////////////////////////
  // nodo del procesador de secuencias de comandos con un búfer vacío para ayudar
  // mantener una posición precisa de muestra en el búfer de reproducción.
  // Inspirado por Chinmay Pendharkar's técnica para Sonoport --> http://bit.ly/1HwdCsV
  // Derechos de autor [2015] [Sonoport (Asia) Pte. Ltd.],
  // Licenciado bajo la licencia Apache http://apache.org/licenses/LICENSE-2.0
  ////////////////////////////////////////////////////////////////////////////////////
  var _createCounterBuffer = function (buffer) {
    const len = buffer.length;
    const audioBuf = ac.createBuffer(1, buffer.length, ac.sampleRate);
    const arrayBuffer = audioBuf.getChannelData(0);
    for (var index = 0; index < len; index++) {
      arrayBuffer[index] = index;
    }
    return audioBuf;
  };
  // inicializar counterNode, establecer su búfer inicial y playbackRate
  p5.SoundFile.prototype._initCounterNode = function () {
    var self = this;
    var now = ac.currentTime;
    var cNode = ac.createBufferSource();
    // deshacerse del nodo de alcance si ya existe
    if (self._scopeNode) {
      self._scopeNode.disconnect();
      self._scopeNode.removeEventListener('audioprocess', self._onAudioProcess);
      delete self._scopeNode;
    }
    self._scopeNode = ac.createScriptProcessor(256, 1, 1);
    // crear búfer de contador de la misma longitud que self.buffer
    cNode.buffer = _createCounterBuffer(self.buffer);
    cNode.playbackRate.setValueAtTime(self.playbackRate, now);
    cNode.connect(self._scopeNode);
    self._scopeNode.connect(p5.soundOut._silentNode);
    self._scopeNode.addEventListener('audioprocess', self._onAudioProcess);
    return cNode;
  };
  // inicializar sourceNode, establecer su búfer inicial y playbackRate
  p5.SoundFile.prototype._initSourceNode = function () {
    var bufferSourceNode = ac.createBufferSource();
    bufferSourceNode.buffer = this.buffer;
    bufferSourceNode.playbackRate.value = this.playbackRate;
    bufferSourceNode.connect(this.output);
    return bufferSourceNode;
  };
  /**
   *  processPeaks devuelve una matriz de timestamps donde cree que hay un ritmo.
   *
   * Esta es una función asincrónica que procesa el soundfile en un contexto de audio fuera de línea,
   *  y envía los resultados a tu función de rellamada.
   *
   *  El proceso implica ejecutar el soundfile a través de un filtro de paso bajo y encontrar todos los
   *  picos por encima del umbral inicial. Si el número total de picos está por debajo del número mínimo de picos,
   *  disminuye el umbral y vuelve a ejecutar el análisis hasta que se alcanzan minPeaks o minThreshold.
   *
   *  @method  processPeaks
   *  @param  {Function} callback       una función para llamar una vez que se devuelven estos datos
   *  @param  {Number}   [initThreshold] el umbral inicial predeterminado es 0.9
   *  @param  {Number}   [minThreshold]   el umbral mínimo se establece por defecto en 0,22
   *  @param  {Number}   [minPeaks]       número mínimo de picos predeterminado en 200
   *  @return {Array}                  Array of timestamped peaks
   */
  p5.SoundFile.prototype.processPeaks = function (callback, _initThreshold, _minThreshold, _minPeaks) {
    var bufLen = this.buffer.length;
    var sampleRate = this.buffer.sampleRate;
    var buffer = this.buffer;
    var allPeaks = [];
    var initialThreshold = _initThreshold || 0.9, threshold = initialThreshold, minThreshold = _minThreshold || 0.22, minPeaks = _minPeaks || 200;
    // Create offline context
    var offlineContext = new window.OfflineAudioContext(1, bufLen, sampleRate);
    // crear fuente de búfer
    var source = offlineContext.createBufferSource();
    source.buffer = buffer;
    // Crear filtro. TO DO: permitir la configuración personalizada del filtro
    var filter = offlineContext.createBiquadFilter();
    filter.type = 'lowpass';
    source.connect(filter);
    filter.connect(offlineContext.destination);
    // empezar a reproducir en el tiempo: 0
    source.start(0);
    offlineContext.startRendering();
    // Renderizar la canción
    // actuar sobre el resultado
    offlineContext.oncomplete = function (e) {
      if (!self.panner)
        return;
      var filteredBuffer = e.renderedBuffer;
      var bufferData = filteredBuffer.getChannelData(0);
      // paso 1:
      // crear instancias Peak, agregarlas a la matriz, con fuerza y sampleIndex 
      do {
        allPeaks = getPeaksAtThreshold(bufferData, threshold);
        threshold -= 0.005;
      } while (Object.keys(allPeaks).length < minPeaks && threshold >= minThreshold);
      // paso 2:
      // encuentre intervalos para cada pico en el sampleIndex, agregue la matriz de tempos
      var intervalCounts = countIntervalsBetweenNearbyPeaks(allPeaks);
      // step 3: find top tempos
      var groups = groupNeighborsByTempo(intervalCounts, filteredBuffer.sampleRate);
      // ordenar intervalos superiores
      var topTempos = groups.sort(function (intA, intB) {
        return intB.count - intA.count;
      }).splice(0, 5);
      // establecer el tempo de este SoundFile en el tempo superior??
      this.tempo = topTempos[0].tempo;
      // paso 4:
      // nueva matriz de picos en el tempo superior dentro de un bpmVariance
      var bpmVariance = 5;
      var tempoPeaks = getPeaksAtTopTempo(allPeaks, topTempos[0].tempo, filteredBuffer.sampleRate, bpmVariance);
      callback(tempoPeaks);
    };
  };
  // picos de proceso
  var Peak = function (amp, i) {
    this.sampleIndex = i;
    this.amplitude = amp;
    this.tempos = [];
    this.intervals = [];
  };
  // 1. para processPeaks () Función para identificar picos por encima de un umbral
  // devuelve una matriz de índices máximos como fotogramas (muestras) del original soundfile
  function getPeaksAtThreshold(data, threshold) {
    var peaksObj = {};
    var length = data.length;
    for (var i = 0; i < length; i++) {
      if (data[i] > threshold) {
        var amp = data[i];
        var peak = new Peak(amp, i);
        peaksObj[i] = peak;
        // Skip forward ~ 1/8s to get past this peak.
        i += 6000;
      }
      i++;
    }
    return peaksObj;
  }
  // 2. for processPeaks()
  function countIntervalsBetweenNearbyPeaks(peaksObj) {
    var intervalCounts = [];
    var peaksArray = Object.keys(peaksObj).sort();
    for (var index = 0; index < peaksArray.length; index++) {
      // encontrar intervalos en comparación con picos cercanos
      for (var i = 0; i < 10; i++) {
        var startPeak = peaksObj[peaksArray[index]];
        var endPeak = peaksObj[peaksArray[index + i]];
        if (startPeak && endPeak) {
          var startPos = startPeak.sampleIndex;
          var endPos = endPeak.sampleIndex;
          var interval = endPos - startPos;
          // agregue un intervalo de muestra al startPeak en la matriz allPeaks
          if (interval > 0) {
            startPeak.intervals.push(interval);
          }
          // contar los intervalos y los recuentos de intervalos de retorno
          var foundInterval = intervalCounts.some(function (intervalCount) {
            if (intervalCount.interval === interval) {
              intervalCount.count++;
              return intervalCount;
            }
          });
          // almacenar con formato JSON
          if (!foundInterval) {
            intervalCounts.push({
              interval: interval,
              count: 1
            });
          }
        }
      }
    }
    return intervalCounts;
  }
  // 3. para processPeaks --> encontrar tempo
  function groupNeighborsByTempo(intervalCounts, sampleRate) {
    var tempoCounts = [];
    intervalCounts.forEach(function (intervalCount) {
      try {
        // Convertir un intervalo a tempo
        var theoreticalTempo = Math.abs(60 / (intervalCount.interval / sampleRate));
        theoreticalTempo = mapTempo(theoreticalTempo);
        var foundTempo = tempoCounts.some(function (tempoCount) {
          if (tempoCount.tempo === theoreticalTempo)
            return tempoCount.count += intervalCount.count;
        });
        if (!foundTempo) {
          if (isNaN(theoreticalTempo)) {
            return;
          }
          tempoCounts.push({
            tempo: Math.round(theoreticalTempo),
            count: intervalCount.count
          });
        }
      } catch (e) {
        throw e;
      }
    });
    return tempoCounts;
  }
  // 4. para processPeaks - obtener picos al máximo tempo
  function getPeaksAtTopTempo(peaksObj, tempo, sampleRate, bpmVariance) {
    var peaksAtTopTempo = [];
    var peaksArray = Object.keys(peaksObj).sort();
    // TO DO: filtra los picos que tienen el tempo y regresan
    for (var i = 0; i < peaksArray.length; i++) {
      var key = peaksArray[i];
      var peak = peaksObj[key];
      for (var j = 0; j < peak.intervals.length; j++) {
        var intervalBPM = Math.round(Math.abs(60 / (peak.intervals[j] / sampleRate)));
        intervalBPM = mapTempo(intervalBPM);
        if (Math.abs(intervalBPM - tempo) < bpmVariance) {
          // convertir sampleIndex en segundos
          peaksAtTopTempo.push(peak.sampleIndex / sampleRate);
        }
      }
    }
    // filtrar picos que están muy cerca unos de otros
    peaksAtTopTempo = peaksAtTopTempo.filter(function (peakTime, index, arr) {
      var dif = arr[index + 1] - peakTime;
      if (dif > 0.01) {
        return true;
      }
    });
    return peaksAtTopTempo;
  }
  // función auxiliar para processPeaks
  function mapTempo(theoreticalTempo) {
    // estos escenarios crean un bucle while infinito
    if (!isFinite(theoreticalTempo) || theoreticalTempo === 0) {
      return;
    }
    // Ajuste el tempo para que se ajuste dentro del rango de 90-180 BPM
    while (theoreticalTempo < 90)
      theoreticalTempo *= 2;
    while (theoreticalTempo > 180 && theoreticalTempo > 90)
      theoreticalTempo /= 2;
    return theoreticalTempo;
  }
  /*** SCHEDULE EVENTS ***/
  // Cue inspirado en JavaScript setTimeout, y el
  // Tone.js Transportar Timeline Evento, Licencia MIT Yotam Mann 2015 tonejs.org
  var Cue = function (callback, time, id, val) {
    this.callback = callback;
    this.time = time;
    this.id = id;
    this.val = val;
  };
  /**
   *  Programe eventos para que se activen cada vez que un MediaElement
   *  (audio / video) alcance un punto de referencia de reproducción.
   *
   *  Acepta una función de devolución de llamada, un tiempo (en segundos) en el que se activa
   *  la rellamada y un parámetro opcional para la rellamada.
   *
   *  El tiempo se pasará como primer parámetro a la función de rellamada
   *  y param será el segundo parámetro.
   *
   *
   *  @method  addCue
   *  @param {Number}   time     Tiempo en segundos, relativo a la reproducción de
   *                             este elemento multimedia. Por ejemplo, para activar un
   *                             evento cada vez que la reproducción alcanza
   *                             los dos segundos, pase el número 2. Esto se pasará
   *                             como primer parámetro a la función de
   *                             rellamada.
   *  @param {Function} callback Nombre de una función a la que se
   *                             llamará en un momento determinado. La devolución de llamada recibirá
   *                             time y (opcionalmente) param como sus
   *                             dos parámetros.
   *  @param {Object} [value]    Un objeto que se pasará como
   *                             segundo parámetro a la función de
   *                             devolución de llamada.
   *  @return {Number} id ID of this cue,
   *                      useful for removeCue(id)
   *  @example
   *  <div><code>
   *  let mySound;
   *  function preload() {
   *    mySound = loadSound('assets/beat.mp3');
   *  }
   *
   *  function setup() {
   *    background(0);
   *    noStroke();
   *    fill(255);
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *
   *    // schedule calls to changeText
   *    mySound.addCue(0.50, changeText, "hello" );
   *    mySound.addCue(1.00, changeText, "p5" );
   *    mySound.addCue(1.50, changeText, "what" );
   *    mySound.addCue(2.00, changeText, "do" );
   *    mySound.addCue(2.50, changeText, "you" );
   *    mySound.addCue(3.00, changeText, "want" );
   *    mySound.addCue(4.00, changeText, "to" );
   *    mySound.addCue(5.00, changeText, "make" );
   *    mySound.addCue(6.00, changeText, "?" );
   *  }
   *
   *  function changeText(val) {
   *    background(0);
   *    text(val, width/2, height/2);
   *  }
   *
   *  function mouseClicked() {
   *    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
   *      if (mySound.isPlaying() ) {
   *        mySound.stop();
   *      } else {
   *        mySound.play();
   *      }
   *    }
   *  }
   *  </code></div>
   */
  p5.SoundFile.prototype.addCue = function (time, callback, val) {
    var id = this._cueIDCounter++;
    var cue = new Cue(callback, time, id, val);
    this._cues.push(cue);
    // if (!this.elt.ontimeupdate) {
    //   this.elt.ontimeupdate = this._onTimeUpdate.bind(this);
    // }
    return id;
  };
  /**
   *  Elimina una devolución de llamada en función de su ID. El ID es devuelto por el
   *  método addCue.
   *
   *  @method removeCue
   *  @param  {Number} id ID de la señal, regresada por addCue
   */
  p5.SoundFile.prototype.removeCue = function (id) {
    var cueLength = this._cues.length;
    for (var i = 0; i < cueLength; i++) {
      var cue = this._cues[i];
      if (cue.id === id) {
        this._cues.splice(i, 1);
        break;
      }
    }
    if (this._cues.length === 0) {
    }
  };
  /**
   *  Eliminar todas las devoluciones de llamada que se habían programado originalmente
   *  a través del método addCue.
   *
   *  @method  clearCues
   */
  p5.SoundFile.prototype.clearCues = function () {
    this._cues = [];
  };
  // método privado que comprueba si se disparan señales si los eventos
  // se han programado utilizando addCue (devolución de llamada, tiempo).
  p5.SoundFile.prototype._onTimeUpdate = function (position) {
    var playbackTime = position / this.buffer.sampleRate;
    var cueLength = this._cues.length;
    for (var i = 0; i < cueLength; i++) {
      var cue = this._cues[i];
      var callbackTime = cue.time;
      var val = cue.val;
      if (this._prevTime < callbackTime && callbackTime <= playbackTime) {
        // pasar el callbackTime programado como parámetro a la devolución de llamada
        cue.callback(val);
      }
    }
    this._prevTime = playbackTime;
  };
  /**
   * Guarda un p5.SoundFile como un .wav file. El navegador le pedirá al usuario que
   * descargue el archivo en su dispositivo. Para cargar un archivo en un servidor, consulte
   * <a href="/docs/reference/#/p5.SoundFile/getBlob">getBlob</a>
   *
   * @method save - guardar
   * @param  {String} [fileName]      Nombre del resultante .wav file.
   * @example
   *  <div><code>
   *  let inp, button, mySound;
   *  let fileName = 'cool';
   *  function preload() {
   *    mySound = loadSound('assets/doorbell.mp3');
   *  }
   *  function setup() {
   *    btn = createButton('click to save file');
   *    btn.position(0, 0);
   *    btn.mouseClicked(handleMouseClick);
   *  }
   *
   *  function handleMouseClick() {
   *    mySound.save(fileName);
   *  }
   * </code></div>
   */
  p5.SoundFile.prototype.save = function (fileName) {
    const dataView = convertToWav(this.buffer);
    p5.prototype.saveSound([dataView], fileName, 'wav');
  };
  /**
   * Este método es útil para enviar un SoundFile a un servidor. Devuelve los 
   * .wav-encoded datos de audio como "<a target="_blank" title="Blob reference at
   * MDN" href="https://developer.mozilla.org/en-US/docs/Web/API/Blob">Blob</a>".
   * Un Blob es un objeto de datos similar a un archivo que se puede cargar en un servidor
   * con uns solicitud <a href="/docs/reference/#/p5/httpDo">http</a>. Usaremos
   * el objeto de opciones `httpDo` para enviar una solicitud POST con algunas opciones específicas:
   * codificamos la solicitud como` multipart / form-data`, y adjuntamos 
   * el blob como uno de los valores del formulario usando `FormData`.
   * 
   *
   * @method getBlob
   * @returns {Blob} Un objeto de datos similar a un archivo
   * @example
   *  <div><code>
   *
   *  function preload() {
   *    mySound = loadSound('assets/doorbell.mp3');
   *  }
   *
   *  function setup() {
   *    noCanvas();
   *    let soundBlob = mySound.getBlob();
   *
   *    // Ahora podemos enviar el BLOB a un servidor ...
   *    let serverUrl = 'https://jsonplaceholder.typicode.com/posts';
   *    let httpRequestOptions = {
   *      method: 'POST',
   *      body: new FormData().append('soundBlob', soundBlob),
   *      headers: new Headers({
   *        'Content-Type': 'multipart/form-data'
   *      })
   *    };
   *    httpDo(serverUrl, httpRequestOptions);
   *
   *    // También podemos crear un `ObjectURL` apuntando al Blob
   *    let blobUrl = URL.createObjectURL(soundBlob);
   *
   *    // El elemento `<Audio>` acepta URL de objeto
   *    let htmlAudioElt = createAudio(blobUrl).showControls();
   *
   *    createDiv();
   *
   *    // ObjectURL existe mientras esta pestaña esté abierta
   *    let input = createInput(blobUrl);
   *    input.attribute('readonly', true);
   *    input.mouseClicked(function() { input.elt.select() });
   *  }
   *
   * </code></div>
   */
  p5.SoundFile.prototype.getBlob = function () {
    const dataView = convertToWav(this.buffer);
    return new Blob([dataView], { type: 'audio/wav' });
  };
  // controlador de eventos para realizar un seguimiento de la posición actual
  function _onAudioProcess(processEvent) {
    var inputBuffer = processEvent.inputBuffer.getChannelData(0);
    this._lastPos = inputBuffer[inputBuffer.length - 1] || 0;
    // hacer cualquier rellamada que haya sido programada
    this._onTimeUpdate(self._lastPos);
  }
  // controlador de eventos para eliminar las referencias al bufferSourceNode cuando termine la reproducción
  function _clearOnEnd(e) {
    const thisBufferSourceNode = e.target;
    const soundFile = this;
    // elimine this.bufferSourceNode de la matriz de fuentes cuando termine de reproducir:
    thisBufferSourceNode._playing = false;
    thisBufferSourceNode.removeEventListener('ended', soundFile._clearOnEnd);
    // llamar a la rellamada pendiente
    soundFile._onended(soundFile);
    soundFile.bufferSourceNodes.forEach(function (n, i) {
      if (n._playing === false) {
        soundFile.bufferSourceNodes.splice(i);
      }
    });
    if (soundFile.bufferSourceNodes.length === 0) {
      soundFile._playing = false;
    }
  }
}(errorHandler, master, helpers, helpers);
var amplitude;
'use strict';
amplitude = function () {
  var p5sound = master;
  /**
   *  La amplitud mide el volumen entre 0.0 y 1.0.
   *  Escucha todos los sonidos p5 de forma predeterminada, o usa setInput ()
   *  para escuchar una fuente de sonido específica. Acepta un valor de suavizado opcional,
   *  cuyo valor predeterminado es 0.
   *
   *  @class p5.Amplitude
   *  @constructor
   *  @param {Number} [smoothing] between 0.0 and .999 to smooth
   *                             amplitude readings (defaults to 0)
   *  @example
   *  <div><code>
   *  let sound, amplitude, cnv;
   *
   *  function preload(){
   *    sound = loadSound('assets/beat.mp3');
   *  }
   *  function setup() {
   *    cnv = createCanvas(100,100);
   *    amplitude = new p5.Amplitude();
   *
   *    // iniciar / detener el sonido cuando se hace clic en el lienzo
   *    cnv.mouseClicked(function() {
   *      if (sound.isPlaying() ){
   *        sound.stop();
   *      } else {
   *        sound.play();
   *      }
   *    });
   *  }
   *  function draw() {
   *    background(0);
   *    fill(255);
   *    let level = amplitude.getLevel();
   *    let size = map(level, 0, 1, 0, 200);
   *    ellipse(width/2, height/2, size, size);
   *  }
   *
   *  </code></div>
   */
  p5.Amplitude = function (smoothing) {
    // Establecido en 2048 por ahora. En futuras iteraciones, esto debería heredarse o analizarse de la configuración predeterminada de p5sound
    this.bufferSize = 2048;
    // establecer contexto de audio
    this.audiocontext = p5sound.audiocontext;
    this.processor = this.audiocontext.createScriptProcessor(this.bufferSize, 2, 1);
    // para conexiones
    this.input = this.processor;
    this.output = this.audiocontext.createGain();
    // el suavizado tiene un valor predeterminado de 0
    this.smoothing = smoothing || 0;
    // las variables para regresar
    this.volume = 0;
    this.average = 0;
    this.stereoVol = [
      0,
      0
    ];
    this.stereoAvg = [
      0,
      0
    ];
    this.stereoVolNorm = [
      0,
      0
    ];
    this.volMax = 0.001;
    this.normalize = false;
    this.processor.onaudioprocess = this._audioProcess.bind(this);
    this.processor.connect(this.output);
    this.output.gain.value = 0;
    // esto solo puede ser necesario debido a un error de Chrome
    this.output.connect(this.audiocontext.destination);
    // conectarse a la salida maestra de p5sound de forma predeterminada, a menos que lo establezca la entrada ()
    p5sound.meter.connect(this.processor);
    // agregue este p5.SoundFile al soundArray
    p5sound.soundArray.push(this);
  };
  /**
   *  Se conecta a la instancia p5sound (salida maestra) de forma predeterminada.
   *  Opcionalmente, puede pasar una fuente específica (es decir, un archivo de sonido).
   *
   *  @method setInput
   *  @param {soundObject|undefined} [snd] establecer la fuente de sonido
   *                                       (opcional, por defecto es la
   *                                       salida maestra)
   *  @param {Number|undefined} [smoothing] un rango entre 0.0 y 1.0 para
   *                                        suavizar las lecturas de amplitud
   *  @example
   *  <div><code>
   *  function preload(){
   *    sound1 = loadSound('assets/beat.mp3');
   *    sound2 = loadSound('assets/drum.mp3');
   *  }
   *  function setup(){
   *    amplitude = new p5.Amplitude();
   *    sound1.play();
   *    sound2.play();
   *    amplitude.setInput(sound2);
   *  }
   *  function draw() {
   *    background(0);
   *    fill(255);
   *    let level = amplitude.getLevel();
   *    let size = map(level, 0, 1, 0, 200);
   *    ellipse(width/2, height/2, size, size);
   *  }
   *  function mouseClicked(){
   *    sound1.stop();
   *    sound2.stop();
   *  }
   *  </code></div>
   */
  p5.Amplitude.prototype.setInput = function (source, smoothing) {
    p5sound.meter.disconnect();
    if (smoothing) {
      this.smoothing = smoothing;
    }
    // conéctese a la salida maestra de la instancia p5s si no y se proporciona
    if (source == null) {
      console.log('Amplitude input source is not ready! Connecting to master output instead');
      p5sound.meter.connect(this.processor);
    } else if (source instanceof p5.Signal) {
      source.output.connect(this.processor);
    } else if (source) {
      source.connect(this.processor);
      this.processor.disconnect();
      this.processor.connect(this.output);
    } else {
      p5sound.meter.connect(this.processor);
    }
  };
  p5.Amplitude.prototype.connect = function (unit) {
    if (unit) {
      if (unit.hasOwnProperty('input')) {
        this.output.connect(unit.input);
      } else {
        this.output.connect(unit);
      }
    } else {
      this.output.connect(this.panner.connect(p5sound.input));
    }
  };
  p5.Amplitude.prototype.disconnect = function () {
    if (this.output) {
      this.output.disconnect();
    }
  };
  // PARA HACER hacer que este estéreo / dependa del número de canales de audio
  p5.Amplitude.prototype._audioProcess = function (event) {
    for (var channel = 0; channel < event.inputBuffer.numberOfChannels; channel++) {
      var inputBuffer = event.inputBuffer.getChannelData(channel);
      var bufLength = inputBuffer.length;
      var total = 0;
      var sum = 0;
      var x;
      for (var i = 0; i < bufLength; i++) {
        x = inputBuffer[i];
        if (this.normalize) {
          total += Math.max(Math.min(x / this.volMax, 1), -1);
          sum += Math.max(Math.min(x / this.volMax, 1), -1) * Math.max(Math.min(x / this.volMax, 1), -1);
        } else {
          total += x;
          sum += x * x;
        }
      }
      var average = total / bufLength;
      // ... luego saca la raíz cuadrada de la suma.
      var rms = Math.sqrt(sum / bufLength);
      this.stereoVol[channel] = Math.max(rms, this.stereoVol[channel] * this.smoothing);
      this.stereoAvg[channel] = Math.max(average, this.stereoVol[channel] * this.smoothing);
      this.volMax = Math.max(this.stereoVol[channel], this.volMax);
    }
    // agregar volumen de todos los canales juntos
    var self = this;
    var volSum = this.stereoVol.reduce(function (previousValue, currentValue, index) {
      self.stereoVolNorm[index - 1] = Math.max(Math.min(self.stereoVol[index - 1] / self.volMax, 1), 0);
      self.stereoVolNorm[index] = Math.max(Math.min(self.stereoVol[index] / self.volMax, 1), 0);
      return previousValue + currentValue;
    });
    // el volumen es el promedio de los canales
    this.volume = volSum / this.stereoVol.length;
    // normalized value
    this.volNorm = Math.max(Math.min(this.volume / this.volMax, 1), 0);
  };
  /**
   *  Devuelve una única lectura de amplitud en el momento en que se llama.
   *  Para lecturas continuas, ejecute el ciclo de extracción.	
   *
   *  @method getLevel
   *  @param {Number} [channel] Opcionalmente, devuelva solo el canal 0 (izquierda) o 1 (derecha)
   *  @return {Number}       Amplitud como un número entre 0.0 y 1.0
   *  @example
   *  <div><code>
   *  function preload(){
   *    sound = loadSound('assets/beat.mp3');
   *  }
   *  function setup() {
   *    amplitude = new p5.Amplitude();
   *    sound.play();
   *  }
   *  function draw() {
   *    background(0);
   *    fill(255);
   *    let level = amplitude.getLevel();
   *    let size = map(level, 0, 1, 0, 200);
   *    ellipse(width/2, height/2, size, size);
   *  }
   *  function mouseClicked(){
   *    sound.stop();
   *  }
   *  </code></div>
   */
  p5.Amplitude.prototype.getLevel = function (channel) {
    if (typeof channel !== 'undefined') {
      if (this.normalize) {
        return this.stereoVolNorm[channel];
      } else {
        return this.stereoVol[channel];
      }
    } else if (this.normalize) {
      return this.volNorm;
    } else {
      return this.volume;
    }
  };
  /**
   * Determina si los resultados de Amplitude.process () se
   * normalizarán. Para normalizar, Amplitude encuentra la diferencia
   * entre la lectura más alta que ha procesado y la amplitud máxima de
   * 1.0. Amplitude agrega esta diferencia a todos los valores para producir
   * resultados que se asignarán de manera confiable entre 0.0 y 1.0. Sin embargo,
   * si ocurre un momento más fuerte, la cantidad que Normalize
   * agrega a todos los valores cambiará.Acepta un parámetro booleano opcional
   * (Verdadero o falso). La normalización está desactivada de forma predeterminada.
   *
   * @method toggleNormalize
   * @param {boolean} [boolean] Establezca normalizar en verdadero (1) o falso (0)
   */
  p5.Amplitude.prototype.toggleNormalize = function (bool) {
    if (typeof bool === 'boolean') {
      this.normalize = bool;
    } else {
      this.normalize = !this.normalize;
    }
  };
  /**
   *  Análisis de amplitud suave promediando con el último cuadro
   *  de análisis. Desactivado por defecto.
   *
   *  @method smooth - suave
   *  @param {Number} set smoothing from 0.0 <= 1
   */
  p5.Amplitude.prototype.smooth = function (s) {
    if (s >= 0 && s < 1) {
      this.smoothing = s;
    } else {
      console.log('Error: smoothing must be between 0 and 1');
    }
  };
  p5.Amplitude.prototype.dispose = function () {
    // eliminar la referencia de soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    if (this.input) {
      this.input.disconnect();
      delete this.input;
    }
    if (this.output) {
      this.output.disconnect();
      delete this.output;
    }
    delete this.processor;
  };
}(master);
var fft;
'use strict';
fft = function () {
  var p5sound = master;
  /**
   *  <p>FFT (Transformada rápida de Fourier) es un algoritmo de análisis
   *  que aísla
   *  <a href="https://en.wikipedia.org/wiki/Audio_frequency">
   *  audio frequencies</a> within a waveform.</p>
   *
   *  <p>Una vez instanciado, un objeto p5.FFT puede devolver una matriz basada en
   *  dos tipos de análisis: <br> • <code>FFT.waveform()</code> calcula
   *  valores de amplitud a lo largo del dominio del tiempo. Los índices de matriz corresponden
   *  a muestras a lo largo de un breve momento en el tiempo. Cada valor representa
   *  la amplitud de la forma de onda en esa muestra de tiempo.<br>
   *  • <code>FFT.analyze() </code> ccalcula los valores de amplitud a lo largo
   *  del dominio de la frecuencia. Los índices de la matriz corresponden a frecuencias (es
   *  decir, tonos), de la más baja a la más alta que los humanos pueden escuchar. Cada
   *  valor representa la amplitud en ese segmento del espectro de frecuencias.
   *  Úselo con <code> getEnergy () </code> para medir la amplitud en frecuencias específicas
   *  o dentro de un rango de frecuencias. </p>
   *
   *  <p>FFT analiza una instantánea muy breve de sonido llamada búfer de 
   *  muestra. Devuelve una matriz de medidas de amplitud,
   *  denominadas <code> bins </code>. La matriz tiene 1024 contenedores de longitud por defecto.
   *  Puede cambiar la longitud de la matriz de contenedores, pero debe ser una potencia de 2
   *  entre 16 y 1024 para que el algoritmo FFT funcione
   *  correctamente. El tamaño real del búfer FFT es el doble del
   *  número de bins, por lo que dada una frecuencia de muestreo estándar, el búfer
   *  tiene una duración de 2048/44100 segundos.</p>
   *
   *
   *  @class p5.FFT
   *  @constructor
   *  @param {Number} [smoothing]   Resultados suaves de Freq Spectrum.
   *                                0.0 <suavizado <1.0.
   *                                El valor predeterminado es 0.8.
   *  @param {Number} [bins]    Longitud de la matriz resultante.
   *                            Debe ser una potencia de dos
   *                            entre 16 y 1024. El valor predeterminado es 1024.
   *  @example
   *  <div><code>
   *  function preload(){
   *    sound = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *
   *  function setup(){
   *    let cnv = createCanvas(100,100);
   *    cnv.mouseClicked(togglePlay);
   *    fft = new p5.FFT();
   *    sound.amp(0.2);
   *  }
   *
   *  function draw(){
   *    background(0);
   *
   *    let spectrum = fft.analyze();
   *    noStroke();
   *    fill(0,255,0); // spectrum is green
   *    for (var i = 0; i< spectrum.length; i++){
   *      let x = map(i, 0, spectrum.length, 0, width);
   *      let h = -height + map(spectrum[i], 0, 255, height, 0);
   *      rect(x, height, width / spectrum.length, h )
   *    }
   *
   *    let waveform = fft.waveform();
   *    noFill();
   *    beginShape();
   *    stroke(255,0,0); // waveform is red
   *    strokeWeight(1);
   *    for (var i = 0; i< waveform.length; i++){
   *      let x = map(i, 0, waveform.length, 0, width);
   *      let y = map( waveform[i], -1, 1, 0, height);
   *      vertex(x,y);
   *    }
   *    endShape();
   *
   *    text('click to play/pause', 4, 10);
   *  }
   *
   *  // atenuar el sonido si el ratón está sobre el lienzo
   *  function togglePlay() {
   *    if (sound.isPlaying()) {
   *      sound.pause();
   *    } else {
   *      sound.loop();
   *    }
   *  }
   *  </code></div>
   */
  p5.FFT = function (smoothing, bins) {
    this.input = this.analyser = p5sound.audiocontext.createAnalyser();
    Object.defineProperties(this, {
      bins: {
        get: function () {
          return this.analyser.fftSize / 2;
        },
        set: function (b) {
          this.analyser.fftSize = b * 2;
        },
        configurable: true,
        enumerable: true
      },
      smoothing: {
        get: function () {
          return this.analyser.smoothingTimeConstant;
        },
        set: function (s) {
          this.analyser.smoothingTimeConstant = s;
        },
        configurable: true,
        enumerable: true
      }
    });
    // establecer el suavizado y los contenedores predeterminados
    this.smooth(smoothing);
    this.bins = bins || 1024;
    // conexiones predeterminadas a p5sound fftMeter
    p5sound.fftMeter.connect(this.analyser);
    this.freqDomain = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeDomain = new Uint8Array(this.analyser.frequencyBinCount);
    // rangos de frecuencia predefinidos, estos serán modificables
    this.bass = [
      20,
      140
    ];
    this.lowMid = [
      140,
      400
    ];
    this.mid = [
      400,
      2600
    ];
    this.highMid = [
      2600,
      5200
    ];
    this.treble = [
      5200,
      14000
    ];
    // agregue este p5.SoundFile al soundArray
    p5sound.soundArray.push(this);
  };
  /**
   *  Configure la fuente de entrada para el análisis FFT. Si no se proporciona una fuente,
   *  FFT analizará todo el sonido en el boceto.
   *
   *  @method  setInput
   *  @param {Object} [source] objeto p5.sound  (o nodo fuente de la API de audio web)
   */
  p5.FFT.prototype.setInput = function (source) {
    if (!source) {
      p5sound.fftMeter.connect(this.analyser);
    } else {
      if (source.output) {
        source.output.connect(this.analyser);
      } else if (source.connect) {
        source.connect(this.analyser);
      }
      p5sound.fftMeter.disconnect();
    }
  };
  /**
   *  Devuelve una matriz de valores de amplitud (entre -1,0 y +1,0) que
   *  representan una instante de las lecturas de amplitud en un solo búfer. 
   *  igual a bins (predeterminado en 1024). Puede usarse para extraer la forma de onda
   *  de un sonido.
   *
   *  @method waveform
   *  @param {Number} [bins]    Debe ser una potencia de dos entre
   *                            16 y 1024. El valor predeterminado es 1024.
   *  @param {String} [precision] Si se proporciona algún valor, devolverá resultados
   *                              en una matriz Float32 que es más precisa
   *                              que una matriz normal.
   *  @return {Array}  Array    Matriz de valores de amplitud (-1 a 1)
   *                            a lo largo del tiempo. Longitud de la matriz = contenedores.
   *
   */
  p5.FFT.prototype.waveform = function () {
    var bins, mode, normalArray;
    for (var i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] === 'number') {
        bins = arguments[i];
        this.analyser.fftSize = bins * 2;
      }
      if (typeof arguments[i] === 'string') {
        mode = arguments[i];
      }
    }
    // getFloatFrequencyData no funciona en Safari a partir del 5/2015
    if (mode && !p5.prototype._isSafari()) {
      timeToFloat(this, this.timeDomain);
      this.analyser.getFloatTimeDomainData(this.timeDomain);
      return this.timeDomain;
    } else {
      timeToInt(this, this.timeDomain);
      this.analyser.getByteTimeDomainData(this.timeDomain);
      var normalArray = new Array();
      for (var j = 0; j < this.timeDomain.length; j++) {
        var scaled = p5.prototype.map(this.timeDomain[j], 0, 255, -1, 1);
        normalArray.push(scaled);
      }
      return normalArray;
    }
  };
  /**
   *  Devuelve una matriz de valores de amplitud (entre 0 y 255)
   *  en todo el espectro de frecuencias. La longitud es igual a los contenedores FFT
   *  ((1024 por defecto). Los índices de la matriz corresponden a frecuencias
   *  (es decir, tonos), de la más baja a la más alta que los humanos pueden
   *  escuchar. Cada valor representa la amplitud en ese segmento del
   *  espectro de frecuencias. Debe llamarse antes de usar
   *  <code>getEnergy()</code>.
   *
   *  @method analyze
   *  @param {Number} [bins]     Debe ser una potencia de dos entre
   *                             16 y 1024. El valor predeterminado es 1024.
   *  @param {Number} [scale]    Si "dB," ddevuelve las medidas de
   *                             flotación de decibelios entre
   *                             -140 y 0 (max).
   *                             De lo contrario, devuelve enteros de 0 a 255.
   *  @return {Array} spectrum    Matriz de valores de energía (amplitud / volumen)
   *                              en todo el espectro de frecuencias.
   *                              Energía más baja (silencio) = 0, la más alta
   *                              posible es 255.
   *  @example
   *  <div><code>
   *  let osc;
   *  let fft;
   *
   *  function setup(){
   *    createCanvas(100,100);
   *    osc = new p5.Oscillator();
   *    osc.amp(0);
   *    osc.start();
   *    fft = new p5.FFT();
   *  }
   *
   *  function draw(){
   *    background(0);
   *
   *    let freq = map(mouseX, 0, 800, 20, 15000);
   *    freq = constrain(freq, 1, 20000);
   *    osc.freq(freq);
   *
   *    let spectrum = fft.analyze();
   *    noStroke();
   *    fill(0,255,0); // spectrum is green
   *    for (var i = 0; i< spectrum.length; i++){
   *      let x = map(i, 0, spectrum.length, 0, width);
   *      let h = -height + map(spectrum[i], 0, 255, height, 0);
   *      rect(x, height, width / spectrum.length, h );
   *    }
   *
   *    stroke(255);
   *    text('Freq: ' + round(freq)+'Hz', 10, 10);
   *
   *    isMouseOverCanvas();
   *  }
   *
   *  // solo reproduce sonido cuando el ratón está sobre el lienzo
   *  function isMouseOverCanvas() {
   *    let mX = mouseX, mY = mouseY;
   *    if (mX > 0 && mX < width && mY < height && mY > 0) {
   *      osc.amp(0.5, 0.2);
   *    } else {
   *      osc.amp(0, 0.2);
   *    }
   *  }
   *  </code></div>
   *
   *
   */
  p5.FFT.prototype.analyze = function () {
    var mode;
    for (var i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] === 'number') {
        this.bins = arguments[i];
        this.analyser.fftSize = this.bins * 2;
      }
      if (typeof arguments[i] === 'string') {
        mode = arguments[i];
      }
    }
    if (mode && mode.toLowerCase() === 'db') {
      freqToFloat(this);
      this.analyser.getFloatFrequencyData(this.freqDomain);
      return this.freqDomain;
    } else {
      freqToInt(this, this.freqDomain);
      this.analyser.getByteFrequencyData(this.freqDomain);
      var normalArray = Array.apply([], this.freqDomain);
      normalArray.length === this.analyser.fftSize;
      normalArray.constructor === Array;
      return normalArray;
    }
  };
  /**
   *  Devuelve la cantidad de energía (volumen) a una cantidad específica
   *  <a href="https://en.wikipedia.org/wiki/Audio_frequency" target="_blank">
   *  frequency</a>, o promedio de energía entre dos
   *  frecuencias. Acepta números correspondientes a
   *  la frecuencia (en Hz), o una cadena correspondiente a
   *  rangos de frecuencia predefinidos ("bass", "lowMid", "mid", "highMid", "treble").
   *  Devuelve un rango entre 0 (sin energía / volumen en esa frecuencia) y
   *  255 (máxima energía).
   *  <em>NOTE: Se debe llamar a analyse () antes de getEnergy (). Analyze()
   *  le dice a la FFT que analice los datos de frecuencia, y getEnergy () usa los
   *  resultados para determinar el valor en una frecuencia o
   *  rango de frecuencias específico.</em></p>
   *
   *  @method  getEnergy
   *  @param  {Number|String} frequency1   Devolverá un valor que representa
   *                                energía a esta frecuencia. Alternativamente,
   *                                las cuerdas "bass", "lowMid" "mid",
   *                                "highMid", y "treble" devolverán rangos
   *                                de frecuencia predefinidos.
   *  @param  {Number} [frequency2] Si se da una segunda frecuencia,
   *                                devolverá la cantidad promedio de
   *                                energía que existe entre las dos
   *                                frecuencias.
   *  @return {Number}   Energy   Energía (volumen / amplitud) de
   *                              0 y 255.
   *
   */
  p5.FFT.prototype.getEnergy = function (frequency1, frequency2) {
    var nyquist = p5sound.audiocontext.sampleRate / 2;
    if (frequency1 === 'bass') {
      frequency1 = this.bass[0];
      frequency2 = this.bass[1];
    } else if (frequency1 === 'lowMid') {
      frequency1 = this.lowMid[0];
      frequency2 = this.lowMid[1];
    } else if (frequency1 === 'mid') {
      frequency1 = this.mid[0];
      frequency2 = this.mid[1];
    } else if (frequency1 === 'highMid') {
      frequency1 = this.highMid[0];
      frequency2 = this.highMid[1];
    } else if (frequency1 === 'treble') {
      frequency1 = this.treble[0];
      frequency2 = this.treble[1];
    }
    if (typeof frequency1 !== 'number') {
      throw 'invalid input for getEnergy()';
    } else if (!frequency2) {
      // si solo un parámetro:
      var index = Math.round(frequency1 / nyquist * this.freqDomain.length);
      return this.freqDomain[index];
    } else if (frequency1 && frequency2) {
      // si dos parámetros:
      // si el segundo es mayor que el primero
      if (frequency1 > frequency2) {
        var swap = frequency2;
        frequency2 = frequency1;
        frequency1 = swap;
      }
      var lowIndex = Math.round(frequency1 / nyquist * this.freqDomain.length);
      var highIndex = Math.round(frequency2 / nyquist * this.freqDomain.length);
      var total = 0;
      var numFrequencies = 0;
      // sume todos los valores de las frecuencias
      for (var i = lowIndex; i <= highIndex; i++) {
        total += this.freqDomain[i];
        numFrequencies += 1;
      }
      // dividir por el número total de frecuencias
      var toReturn = total / numFrequencies;
      return toReturn;
    } else {
      throw 'invalid input for getEnergy()';
    }
  };
  // compatability with v.012, changed to getEnergy in v.0121. Will be deprecated...
  p5.FFT.prototype.getFreq = function (freq1, freq2) {
    console.log('getFreq() is deprecated. Please use getEnergy() instead.');
    var x = this.getEnergy(freq1, freq2);
    return x;
  };
  /**
     *  Devuelve el
     *  <a href="http://en.wikipedia.org/wiki/Spectral_centroid" target="_blank">
     *  spectral centroid</a> of the input signal.
     *  <em>NOTE: analyze() Debe ser llamado antes de getCentroid(). Analyze()
     *  le dice a la FFT que analice los datos de frecuencia, y getCentroid () usa
     *  los resultados para determinar el centroide espectral.</em></p>
     *
     *  @method  getCentroid
     *  @return {Number}   Frecuencia del centroide espectral -   Frecuencia del centroide espectral en Hz.
     *
     *
     * @example
     *  <div><code>
     *
     *
     *function setup(){
     *  cnv = createCanvas(100,100);
     *  sound = new p5.AudioIn();
     *  sound.start();
     *  fft = new p5.FFT();
     *  sound.connect(fft);
     *}
     *
     *
     *function draw(){
     *
     *  var centroidplot = 0.0;
     *  var spectralCentroid = 0;
     *
     *
     *  background(0);
     *  stroke(0,255,0);
     *  var spectrum = fft.analyze();
     *  fill(0,255,0); // spectrum is green
     *
     *  //extraer el espectro
     *  for (var i = 0; i< spectrum.length; i++){
     *    var x = map(log(i), 0, log(spectrum.length), 0, width);
     *    var h = map(spectrum[i], 0, 255, 0, height);
     *    var rectangle_width = (log(i+1)-log(i))*(width/log(spectrum.length));
     *    rect(x, height, rectangle_width, -h )
     *  }
  
     *  var nyquist = 22050;
     *
     *  // obtener el centroide
     *  spectralCentroid = fft.getCentroid();
     *
     *  // el cálculo mean_freq_index es para la pantalla.
     *  var mean_freq_index = spectralCentroid/(nyquist/spectrum.length);
     *
     *  centroidplot = map(log(mean_freq_index), 0, log(spectrum.length), 0, width);
     *
     *
     *  stroke(255,0,0); // la línea que muestra dónde está el centroide será roja
     *
     *  rect(centroidplot, 0, width / spectrum.length, height)
     *  noStroke();
     *  fill(255,255,255);  // el texto es blanco
     *  text("centroid: ", 10, 20);
     *  text(round(spectralCentroid)+" Hz", 10, 40);
     *}
     * </code></div>
     */
  p5.FFT.prototype.getCentroid = function () {
    var nyquist = p5sound.audiocontext.sampleRate / 2;
    var cumulative_sum = 0;
    var centroid_normalization = 0;
    for (var i = 0; i < this.freqDomain.length; i++) {
      cumulative_sum += i * this.freqDomain[i];
      centroid_normalization += this.freqDomain[i];
    }
    var mean_freq_index = 0;
    if (centroid_normalization !== 0) {
      mean_freq_index = cumulative_sum / centroid_normalization;
    }
    var spec_centroid_freq = mean_freq_index * (nyquist / this.freqDomain.length);
    return spec_centroid_freq;
  };
  /**
   *  Smooth FFT analysis by averaging with the last analysis frame.
   *
   *  @method smooth - suave
   *  @param {Number} smoothing    0.0 < smoothing < 1.0.
   *                               Defaults to 0.8.
   */
  p5.FFT.prototype.smooth = function (s) {
    if (typeof s !== 'undefined') {
      this.smoothing = s;
    }
    return this.smoothing;
  };
  p5.FFT.prototype.dispose = function () {
    // eliminar la referencia de soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    if (this.analyser) {
      this.analyser.disconnect();
      delete this.analyser;
    }
  };
  /**
   *  Devuelve una matriz de valores de amplitud promedio para un número determinado
   *  de bandas de frecuencia divididas en partes iguales. N tiene un valor predeterminado de 16.
   *  <em>NOTE: analyze() Debe ser llamado antes de linAverages(). Analyze()
   *  le dice a la FFT que analice los datos de frecuencia, y linAverage () usa los
   *  resultados para agruparlos en un conjunto más pequeño de promedios.</em></p>
   *
   *  @method  linAverages
   *  @param  {Number}  N                Número de grupos de frecuencia devueltos
   *  @return {Array}   linearAverages   Matriz de valores de amplitud promedio para cada grupo
   */
  p5.FFT.prototype.linAverages = function (N) {
    var N = N || 16;
    // Esto evita valores indefinidos, nulos o 0 de N
    var spectrum = this.freqDomain;
    var spectrumLength = spectrum.length;
    var spectrumStep = Math.floor(spectrumLength / N);
    var linearAverages = new Array(N);
    // Mantenga un segundo índice para el grupo promedio actual y coloque los valores en consecuencia
    // con un solo bucle en los datos del espectro
    var groupIndex = 0;
    for (var specIndex = 0; specIndex < spectrumLength; specIndex++) {
      linearAverages[groupIndex] = linearAverages[groupIndex] !== undefined ? (linearAverages[groupIndex] + spectrum[specIndex]) / 2 : spectrum[specIndex];
      // Aumentar el índice de grupo cuando se procesa el último elemento del grupo.
      if (specIndex % spectrumStep === spectrumStep - 1) {
        groupIndex++;
      }
    }
    return linearAverages;
  };
  /**
   *  Devuelve una matriz de valores de amplitud promedio del espectro,
   *  para un conjunto dado de <a href="https://en.wikipedia.org/wiki/Octave_band" target="_blank">
   *  Octave Bands</a>
   *  <em>NOTE: analyze() Debe ser llamado antes de logAverages(). Analyze()
   *  le dice a la FFT que analice los datos de frecuencia, y logAverage () usa
   *  los resultados para agruparlos en un conjunto más pequeño de promedios.</em></p>
   *
   *  @method  logAverages
   *  @param  {Array}   octaveBands    Matriz de objetos de bandas de octava para agrupar
   *  @return {Array}   logAverages    Matriz de valores de amplitud promedio para cada grupo
   */
  p5.FFT.prototype.logAverages = function (octaveBands) {
    var nyquist = p5sound.audiocontext.sampleRate / 2;
    var spectrum = this.freqDomain;
    var spectrumLength = spectrum.length;
    var logAverages = new Array(octaveBands.length);
    // Mantenga un segundo índice para el grupo promedio actual y coloque los valores en consecuencia
    // Con solo un bucle en los datos del espectro
    var octaveIndex = 0;
    for (var specIndex = 0; specIndex < spectrumLength; specIndex++) {
      var specIndexFrequency = Math.round(specIndex * nyquist / this.freqDomain.length);
      // Aumentar el índice de grupo si la frecuencia actual excede los límites de la banda
      if (specIndexFrequency > octaveBands[octaveIndex].hi) {
        octaveIndex++;
      }
      logAverages[octaveIndex] = logAverages[octaveIndex] !== undefined ? (logAverages[octaveIndex] + spectrum[specIndex]) / 2 : spectrum[specIndex];
    }
    return logAverages;
  };
  /**
   *  Calcula y devuelve el 1 / N
   *  <a href="https://en.wikipedia.org/wiki/Octave_band" target="_blank">Octave Bands</a>
   *  N tiene un valor predeterminado de 3 y la frecuencia central mínima de 15.625 Hz.
   *  (1/3 Octave Bands ~= 31 Frequency Bands)
   *  Establecer fCtr0 en un valor central de una octava más alta ignorará las bandas más bajas y producirá menos grupos de frecuencia.
   *  y producirá menos grupos de frecuencia.
   *
   *  @method   getOctaveBands
   *  @param  {Number}  N             Especifica el tipo 1 / N de bandas de octava generadas
   *  @param  {Number}  fCtr0         Frecuencia central mínima para la banda más baja
   *  @return {Array}   octaveBands   Matriz de objetos de banda de octava con sus límites
   */
  p5.FFT.prototype.getOctaveBands = function (N, fCtr0) {
    var N = N || 3;
    // Predeterminado a bandas de 1/3 de octava
    var fCtr0 = fCtr0 || 15.625;
    // Frecuencia central mínima, predeterminada a 15.625 Hz
    var octaveBands = [];
    var lastFrequencyBand = {
      lo: fCtr0 / Math.pow(2, 1 / (2 * N)),
      ctr: fCtr0,
      hi: fCtr0 * Math.pow(2, 1 / (2 * N))
    };
    octaveBands.push(lastFrequencyBand);
    var nyquist = p5sound.audiocontext.sampleRate / 2;
    while (lastFrequencyBand.hi < nyquist) {
      var newFrequencyBand = {};
      newFrequencyBand.lo = lastFrequencyBand.hi;
      newFrequencyBand.ctr = lastFrequencyBand.ctr * Math.pow(2, 1 / N);
      newFrequencyBand.hi = newFrequencyBand.ctr * Math.pow(2, 1 / (2 * N));
      octaveBands.push(newFrequencyBand);
      lastFrequencyBand = newFrequencyBand;
    }
    return octaveBands;
  };
  // métodos auxiliares para convertir el tipo de flotante (dB) a int (0-255)
  var freqToFloat = function (fft) {
    if (fft.freqDomain instanceof Float32Array === false) {
      fft.freqDomain = new Float32Array(fft.analyser.frequencyBinCount);
    }
  };
  var freqToInt = function (fft) {
    if (fft.freqDomain instanceof Uint8Array === false) {
      fft.freqDomain = new Uint8Array(fft.analyser.frequencyBinCount);
    }
  };
  var timeToFloat = function (fft) {
    if (fft.timeDomain instanceof Float32Array === false) {
      fft.timeDomain = new Float32Array(fft.analyser.frequencyBinCount);
    }
  };
  var timeToInt = function (fft) {
    if (fft.timeDomain instanceof Uint8Array === false) {
      fft.timeDomain = new Uint8Array(fft.analyser.frequencyBinCount);
    }
  };
}(master);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_SignalBase;
Tone_signal_SignalBase = function (Tone) {
  'use strict';
  Tone.SignalBase = function () {
  };
  Tone.extend(Tone.SignalBase);
  Tone.SignalBase.prototype.connect = function (node, outputNumber, inputNumber) {
    if (Tone.Signal && Tone.Signal === node.constructor || Tone.Param && Tone.Param === node.constructor || Tone.TimelineSignal && Tone.TimelineSignal === node.constructor) {
      node._param.cancelScheduledValues(0);
      node._param.value = 0;
      node.overridden = true;
    } else if (node instanceof AudioParam) {
      node.cancelScheduledValues(0);
      node.value = 0;
    }
    Tone.prototype.connect.call(this, node, outputNumber, inputNumber);
    return this;
  };
  return Tone.SignalBase;
}(Tone_core_Tone);
/** Tone.js módulo por Yotam Mann, Licencia MIT  2016  http://opensource.org/licenses/MIT **/
var Tone_signal_WaveShaper;
Tone_signal_WaveShaper = function (Tone) {
  'use strict';
  Tone.WaveShaper = function (mapping, bufferLen) {
    this._shaper = this.input = this.output = this.context.createWaveShaper();
    this._curve = null;
    if (Array.isArray(mapping)) {
      this.curve = mapping;
    } else if (isFinite(mapping) || this.isUndef(mapping)) {
      this._curve = new Float32Array(this.defaultArg(mapping, 1024));
    } else if (this.isFunction(mapping)) {
      this._curve = new Float32Array(this.defaultArg(bufferLen, 1024));
      this.setMap(mapping);
    }
  };
  Tone.extend(Tone.WaveShaper, Tone.SignalBase);
  Tone.WaveShaper.prototype.setMap = function (mapping) {
    for (var i = 0, len = this._curve.length; i < len; i++) {
      var normalized = i / (len - 1) * 2 - 1;
      this._curve[i] = mapping(normalized, i);
    }
    this._shaper.curve = this._curve;
    return this;
  };
  Object.defineProperty(Tone.WaveShaper.prototype, 'curve', {
    get: function () {
      return this._shaper.curve;
    },
    set: function (mapping) {
      this._curve = new Float32Array(mapping);
      this._shaper.curve = this._curve;
    }
  });
  Object.defineProperty(Tone.WaveShaper.prototype, 'oversample', {
    get: function () {
      return this._shaper.oversample;
    },
    set: function (oversampling) {
      if ([
          'none',
          '2x',
          '4x'
        ].indexOf(oversampling) !== -1) {
        this._shaper.oversample = oversampling;
      } else {
        throw new RangeError('Tone.WaveShaper: oversampling must be either \'none\', \'2x\', or \'4x\'');
      }
    }
  });
  Tone.WaveShaper.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._shaper.disconnect();
    this._shaper = null;
    this._curve = null;
    return this;
  };
  return Tone.WaveShaper;
}(Tone_core_Tone);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_type_TimeBase;
Tone_type_TimeBase = function (Tone) {
  Tone.TimeBase = function (val, units) {
    if (this instanceof Tone.TimeBase) {
      this._expr = this._noOp;
      if (val instanceof Tone.TimeBase) {
        this.copy(val);
      } else if (!this.isUndef(units) || this.isNumber(val)) {
        units = this.defaultArg(units, this._defaultUnits);
        var method = this._primaryExpressions[units].method;
        this._expr = method.bind(this, val);
      } else if (this.isString(val)) {
        this.set(val);
      } else if (this.isUndef(val)) {
        this._expr = this._defaultExpr();
      }
    } else {
      return new Tone.TimeBase(val, units);
    }
  };
  Tone.extend(Tone.TimeBase);
  Tone.TimeBase.prototype.set = function (exprString) {
    this._expr = this._parseExprString(exprString);
    return this;
  };
  Tone.TimeBase.prototype.clone = function () {
    var instance = new this.constructor();
    instance.copy(this);
    return instance;
  };
  Tone.TimeBase.prototype.copy = function (time) {
    var val = time._expr();
    return this.set(val);
  };
  Tone.TimeBase.prototype._primaryExpressions = {
    'n': {
      regexp: /^(\d+)n/i,
      method: function (value) {
        value = parseInt(value);
        if (value === 1) {
          return this._beatsToUnits(this._timeSignature());
        } else {
          return this._beatsToUnits(4 / value);
        }
      }
    },
    't': {
      regexp: /^(\d+)t/i,
      method: function (value) {
        value = parseInt(value);
        return this._beatsToUnits(8 / (parseInt(value) * 3));
      }
    },
    'm': {
      regexp: /^(\d+)m/i,
      method: function (value) {
        return this._beatsToUnits(parseInt(value) * this._timeSignature());
      }
    },
    'i': {
      regexp: /^(\d+)i/i,
      method: function (value) {
        return this._ticksToUnits(parseInt(value));
      }
    },
    'hz': {
      regexp: /^(\d+(?:\.\d+)?)hz/i,
      method: function (value) {
        return this._frequencyToUnits(parseFloat(value));
      }
    },
    'tr': {
      regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?/,
      method: function (m, q, s) {
        var total = 0;
        if (m && m !== '0') {
          total += this._beatsToUnits(this._timeSignature() * parseFloat(m));
        }
        if (q && q !== '0') {
          total += this._beatsToUnits(parseFloat(q));
        }
        if (s && s !== '0') {
          total += this._beatsToUnits(parseFloat(s) / 4);
        }
        return total;
      }
    },
    's': {
      regexp: /^(\d+(?:\.\d+)?s)/,
      method: function (value) {
        return this._secondsToUnits(parseFloat(value));
      }
    },
    'samples': {
      regexp: /^(\d+)samples/,
      method: function (value) {
        return parseInt(value) / this.context.sampleRate;
      }
    },
    'default': {
      regexp: /^(\d+(?:\.\d+)?)/,
      method: function (value) {
        return this._primaryExpressions[this._defaultUnits].method.call(this, value);
      }
    }
  };
  Tone.TimeBase.prototype._binaryExpressions = {
    '+': {
      regexp: /^\+/,
      precedence: 2,
      method: function (lh, rh) {
        return lh() + rh();
      }
    },
    '-': {
      regexp: /^\-/,
      precedence: 2,
      method: function (lh, rh) {
        return lh() - rh();
      }
    },
    '*': {
      regexp: /^\*/,
      precedence: 1,
      method: function (lh, rh) {
        return lh() * rh();
      }
    },
    '/': {
      regexp: /^\//,
      precedence: 1,
      method: function (lh, rh) {
        return lh() / rh();
      }
    }
  };
  Tone.TimeBase.prototype._unaryExpressions = {
    'neg': {
      regexp: /^\-/,
      method: function (lh) {
        return -lh();
      }
    }
  };
  Tone.TimeBase.prototype._syntaxGlue = {
    '(': { regexp: /^\(/ },
    ')': { regexp: /^\)/ }
  };
  Tone.TimeBase.prototype._tokenize = function (expr) {
    var position = -1;
    var tokens = [];
    while (expr.length > 0) {
      expr = expr.trim();
      var token = getNextToken(expr, this);
      tokens.push(token);
      expr = expr.substr(token.value.length);
    }
    function getNextToken(expr, context) {
      var expressions = [
        '_binaryExpressions',
        '_unaryExpressions',
        '_primaryExpressions',
        '_syntaxGlue'
      ];
      for (var i = 0; i < expressions.length; i++) {
        var group = context[expressions[i]];
        for (var opName in group) {
          var op = group[opName];
          var reg = op.regexp;
          var match = expr.match(reg);
          if (match !== null) {
            return {
              method: op.method,
              precedence: op.precedence,
              regexp: op.regexp,
              value: match[0]
            };
          }
        }
      }
      throw new SyntaxError('Tone.TimeBase: token inesperado ' + expr);
    }
    return {
      next: function () {
        return tokens[++position];
      },
      peek: function () {
        return tokens[position + 1];
      }
    };
  };
  Tone.TimeBase.prototype._matchGroup = function (token, group, prec) {
    var ret = false;
    if (!this.isUndef(token)) {
      for (var opName in group) {
        var op = group[opName];
        if (op.regexp.test(token.value)) {
          if (!this.isUndef(prec)) {
            if (op.precedence === prec) {
              return op;
            }
          } else {
            return op;
          }
        }
      }
    }
    return ret;
  };
  Tone.TimeBase.prototype._parseBinary = function (lexer, precedence) {
    if (this.isUndef(precedence)) {
      precedence = 2;
    }
    var expr;
    if (precedence < 0) {
      expr = this._parseUnary(lexer);
    } else {
      expr = this._parseBinary(lexer, precedence - 1);
    }
    var token = lexer.peek();
    while (token && this._matchGroup(token, this._binaryExpressions, precedence)) {
      token = lexer.next();
      expr = token.method.bind(this, expr, this._parseBinary(lexer, precedence - 1));
      token = lexer.peek();
    }
    return expr;
  };
  Tone.TimeBase.prototype._parseUnary = function (lexer) {
    var token, expr;
    token = lexer.peek();
    var op = this._matchGroup(token, this._unaryExpressions);
    if (op) {
      token = lexer.next();
      expr = this._parseUnary(lexer);
      return op.method.bind(this, expr);
    }
    return this._parsePrimary(lexer);
  };
  Tone.TimeBase.prototype._parsePrimary = function (lexer) {
    var token, expr;
    token = lexer.peek();
    if (this.isUndef(token)) {
      throw new SyntaxError('Tone.TimeBase: Fin de expresión inesperado');
    }
    if (this._matchGroup(token, this._primaryExpressions)) {
      token = lexer.next();
      var matching = token.value.match(token.regexp);
      return token.method.bind(this, matching[1], matching[2], matching[3]);
    }
    if (token && token.value === '(') {
      lexer.next();
      expr = this._parseBinary(lexer);
      token = lexer.next();
      if (!(token && token.value === ')')) {
        throw new SyntaxError('Expected )');
      }
      return expr;
    }
    throw new SyntaxError('Tone.TimeBase: No se puede procesar el token' + token.value);
  };
  Tone.TimeBase.prototype._parseExprString = function (exprString) {
    if (!this.isString(exprString)) {
      exprString = exprString.toString();
    }
    var lexer = this._tokenize(exprString);
    var tree = this._parseBinary(lexer);
    return tree;
  };
  Tone.TimeBase.prototype._noOp = function () {
    return 0;
  };
  Tone.TimeBase.prototype._defaultExpr = function () {
    return this._noOp;
  };
  Tone.TimeBase.prototype._defaultUnits = 's';
  Tone.TimeBase.prototype._frequencyToUnits = function (freq) {
    return 1 / freq;
  };
  Tone.TimeBase.prototype._beatsToUnits = function (beats) {
    return 60 / Tone.Transport.bpm.value * beats;
  };
  Tone.TimeBase.prototype._secondsToUnits = function (seconds) {
    return seconds;
  };
  Tone.TimeBase.prototype._ticksToUnits = function (ticks) {
    return ticks * (this._beatsToUnits(1) / Tone.Transport.PPQ);
  };
  Tone.TimeBase.prototype._timeSignature = function () {
    return Tone.Transport.timeSignature;
  };
  Tone.TimeBase.prototype._pushExpr = function (val, name, units) {
    if (!(val instanceof Tone.TimeBase)) {
      val = new this.constructor(val, units);
    }
    this._expr = this._binaryExpressions[name].method.bind(this, this._expr, val._expr);
    return this;
  };
  Tone.TimeBase.prototype.add = function (val, units) {
    return this._pushExpr(val, '+', units);
  };
  Tone.TimeBase.prototype.sub = function (val, units) {
    return this._pushExpr(val, '-', units);
  };
  Tone.TimeBase.prototype.mult = function (val, units) {
    return this._pushExpr(val, '*', units);
  };
  Tone.TimeBase.prototype.div = function (val, units) {
    return this._pushExpr(val, '/', units);
  };
  Tone.TimeBase.prototype.valueOf = function () {
    return this._expr();
  };
  Tone.TimeBase.prototype.dispose = function () {
    this._expr = null;
  };
  return Tone.TimeBase;
}(Tone_core_Tone);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_type_Time;
Tone_type_Time = function (Tone) {
  Tone.Time = function (val, units) {
    if (this instanceof Tone.Time) {
      this._plusNow = false;
      Tone.TimeBase.call(this, val, units);
    } else {
      return new Tone.Time(val, units);
    }
  };
  Tone.extend(Tone.Time, Tone.TimeBase);
  Tone.Time.prototype._unaryExpressions = Object.create(Tone.TimeBase.prototype._unaryExpressions);
  Tone.Time.prototype._unaryExpressions.quantize = {
    regexp: /^@/,
    method: function (rh) {
      return Tone.Transport.nextSubdivision(rh());
    }
  };
  Tone.Time.prototype._unaryExpressions.now = {
    regexp: /^\+/,
    method: function (lh) {
      this._plusNow = true;
      return lh();
    }
  };
  Tone.Time.prototype.quantize = function (subdiv, percent) {
    percent = this.defaultArg(percent, 1);
    this._expr = function (expr, subdivision, percent) {
      expr = expr();
      subdivision = subdivision.toSeconds();
      var multiple = Math.round(expr / subdivision);
      var ideal = multiple * subdivision;
      var diff = ideal - expr;
      return expr + diff * percent;
    }.bind(this, this._expr, new this.constructor(subdiv), percent);
    return this;
  };
  Tone.Time.prototype.addNow = function () {
    this._plusNow = true;
    return this;
  };
  Tone.Time.prototype._defaultExpr = function () {
    this._plusNow = true;
    return this._noOp;
  };
  Tone.Time.prototype.copy = function (time) {
    Tone.TimeBase.prototype.copy.call(this, time);
    this._plusNow = time._plusNow;
    return this;
  };
  Tone.Time.prototype.toNotation = function () {
    var time = this.toSeconds();
    var testNotations = [
      '1m',
      '2n',
      '4n',
      '8n',
      '16n',
      '32n',
      '64n',
      '128n'
    ];
    var retNotation = this._toNotationHelper(time, testNotations);
    var testTripletNotations = [
      '1m',
      '2n',
      '2t',
      '4n',
      '4t',
      '8n',
      '8t',
      '16n',
      '16t',
      '32n',
      '32t',
      '64n',
      '64t',
      '128n'
    ];
    var retTripletNotation = this._toNotationHelper(time, testTripletNotations);
    if (retTripletNotation.split('+').length < retNotation.split('+').length) {
      return retTripletNotation;
    } else {
      return retNotation;
    }
  };
  Tone.Time.prototype._toNotationHelper = function (units, testNotations) {
    var threshold = this._notationToUnits(testNotations[testNotations.length - 1]);
    var retNotation = '';
    for (var i = 0; i < testNotations.length; i++) {
      var notationTime = this._notationToUnits(testNotations[i]);
      var multiple = units / notationTime;
      var floatingPointError = 0.000001;
      if (1 - multiple % 1 < floatingPointError) {
        multiple += floatingPointError;
      }
      multiple = Math.floor(multiple);
      if (multiple > 0) {
        if (multiple === 1) {
          retNotation += testNotations[i];
        } else {
          retNotation += multiple.toString() + '*' + testNotations[i];
        }
        units -= multiple * notationTime;
        if (units < threshold) {
          break;
        } else {
          retNotation += ' + ';
        }
      }
    }
    if (retNotation === '') {
      retNotation = '0';
    }
    return retNotation;
  };
  Tone.Time.prototype._notationToUnits = function (notation) {
    var primaryExprs = this._primaryExpressions;
    var notationExprs = [
      primaryExprs.n,
      primaryExprs.t,
      primaryExprs.m
    ];
    for (var i = 0; i < notationExprs.length; i++) {
      var expr = notationExprs[i];
      var match = notation.match(expr.regexp);
      if (match) {
        return expr.method.call(this, match[1]);
      }
    }
  };
  Tone.Time.prototype.toBarsBeatsSixteenths = function () {
    var quarterTime = this._beatsToUnits(1);
    var quarters = this.toSeconds() / quarterTime;
    var measures = Math.floor(quarters / this._timeSignature());
    var sixteenths = quarters % 1 * 4;
    quarters = Math.floor(quarters) % this._timeSignature();
    sixteenths = sixteenths.toString();
    if (sixteenths.length > 3) {
      sixteenths = parseFloat(sixteenths).toFixed(3);
    }
    var progress = [
      measures,
      quarters,
      sixteenths
    ];
    return progress.join(':');
  };
  Tone.Time.prototype.toTicks = function () {
    var quarterTime = this._beatsToUnits(1);
    var quarters = this.valueOf() / quarterTime;
    return Math.floor(quarters * Tone.Transport.PPQ);
  };
  Tone.Time.prototype.toSamples = function () {
    return this.toSeconds() * this.context.sampleRate;
  };
  Tone.Time.prototype.toFrequency = function () {
    return 1 / this.toSeconds();
  };
  Tone.Time.prototype.toSeconds = function () {
    return this.valueOf();
  };
  Tone.Time.prototype.toMilliseconds = function () {
    return this.toSeconds() * 1000;
  };
  Tone.Time.prototype.valueOf = function () {
    var val = this._expr();
    return val + (this._plusNow ? this.now() : 0);
  };
  return Tone.Time;
}(Tone_core_Tone);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_type_Frequency;
Tone_type_Frequency = function (Tone) {
  Tone.Frequency = function (val, units) {
    if (this instanceof Tone.Frequency) {
      Tone.TimeBase.call(this, val, units);
    } else {
      return new Tone.Frequency(val, units);
    }
  };
  Tone.extend(Tone.Frequency, Tone.TimeBase);
  Tone.Frequency.prototype._primaryExpressions = Object.create(Tone.TimeBase.prototype._primaryExpressions);
  Tone.Frequency.prototype._primaryExpressions.midi = {
    regexp: /^(\d+(?:\.\d+)?midi)/,
    method: function (value) {
      return this.midiToFrequency(value);
    }
  };
  Tone.Frequency.prototype._primaryExpressions.note = {
    regexp: /^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i,
    method: function (pitch, octave) {
      var index = noteToScaleIndex[pitch.toLowerCase()];
      var noteNumber = index + (parseInt(octave) + 1) * 12;
      return this.midiToFrequency(noteNumber);
    }
  };
  Tone.Frequency.prototype._primaryExpressions.tr = {
    regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?/,
    method: function (m, q, s) {
      var total = 1;
      if (m && m !== '0') {
        total *= this._beatsToUnits(this._timeSignature() * parseFloat(m));
      }
      if (q && q !== '0') {
        total *= this._beatsToUnits(parseFloat(q));
      }
      if (s && s !== '0') {
        total *= this._beatsToUnits(parseFloat(s) / 4);
      }
      return total;
    }
  };
  Tone.Frequency.prototype.transpose = function (interval) {
    this._expr = function (expr, interval) {
      var val = expr();
      return val * this.intervalToFrequencyRatio(interval);
    }.bind(this, this._expr, interval);
    return this;
  };
  Tone.Frequency.prototype.harmonize = function (intervals) {
    this._expr = function (expr, intervals) {
      var val = expr();
      var ret = [];
      for (var i = 0; i < intervals.length; i++) {
        ret[i] = val * this.intervalToFrequencyRatio(intervals[i]);
      }
      return ret;
    }.bind(this, this._expr, intervals);
    return this;
  };
  Tone.Frequency.prototype.toMidi = function () {
    return this.frequencyToMidi(this.valueOf());
  };
  Tone.Frequency.prototype.toNote = function () {
    var freq = this.valueOf();
    var log = Math.log(freq / Tone.Frequency.A4) / Math.LN2;
    var noteNumber = Math.round(12 * log) + 57;
    var octave = Math.floor(noteNumber / 12);
    if (octave < 0) {
      noteNumber += -12 * octave;
    }
    var noteName = scaleIndexToNote[noteNumber % 12];
    return noteName + octave.toString();
  };
  Tone.Frequency.prototype.toSeconds = function () {
    return 1 / this.valueOf();
  };
  Tone.Frequency.prototype.toFrequency = function () {
    return this.valueOf();
  };
  Tone.Frequency.prototype.toTicks = function () {
    var quarterTime = this._beatsToUnits(1);
    var quarters = this.valueOf() / quarterTime;
    return Math.floor(quarters * Tone.Transport.PPQ);
  };
  Tone.Frequency.prototype._frequencyToUnits = function (freq) {
    return freq;
  };
  Tone.Frequency.prototype._ticksToUnits = function (ticks) {
    return 1 / (ticks * 60 / (Tone.Transport.bpm.value * Tone.Transport.PPQ));
  };
  Tone.Frequency.prototype._beatsToUnits = function (beats) {
    return 1 / Tone.TimeBase.prototype._beatsToUnits.call(this, beats);
  };
  Tone.Frequency.prototype._secondsToUnits = function (seconds) {
    return 1 / seconds;
  };
  Tone.Frequency.prototype._defaultUnits = 'hz';
  var noteToScaleIndex = {
    'cbb': -2,
    'cb': -1,
    'c': 0,
    'c#': 1,
    'cx': 2,
    'dbb': 0,
    'db': 1,
    'd': 2,
    'd#': 3,
    'dx': 4,
    'ebb': 2,
    'eb': 3,
    'e': 4,
    'e#': 5,
    'ex': 6,
    'fbb': 3,
    'fb': 4,
    'f': 5,
    'f#': 6,
    'fx': 7,
    'gbb': 5,
    'gb': 6,
    'g': 7,
    'g#': 8,
    'gx': 9,
    'abb': 7,
    'ab': 8,
    'a': 9,
    'a#': 10,
    'ax': 11,
    'bbb': 9,
    'bb': 10,
    'b': 11,
    'b#': 12,
    'bx': 13
  };
  var scaleIndexToNote = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B'
  ];
  Tone.Frequency.A4 = 440;
  Tone.Frequency.prototype.midiToFrequency = function (midi) {
    return Tone.Frequency.A4 * Math.pow(2, (midi - 69) / 12);
  };
  Tone.Frequency.prototype.frequencyToMidi = function (frequency) {
    return 69 + 12 * Math.log(frequency / Tone.Frequency.A4) / Math.LN2;
  };
  return Tone.Frequency;
}(Tone_core_Tone);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_type_TransportTime;
Tone_type_TransportTime = function (Tone) {
  Tone.TransportTime = function (val, units) {
    if (this instanceof Tone.TransportTime) {
      Tone.Time.call(this, val, units);
    } else {
      return new Tone.TransportTime(val, units);
    }
  };
  Tone.extend(Tone.TransportTime, Tone.Time);
  Tone.TransportTime.prototype._unaryExpressions = Object.create(Tone.Time.prototype._unaryExpressions);
  Tone.TransportTime.prototype._unaryExpressions.quantize = {
    regexp: /^@/,
    method: function (rh) {
      var subdivision = this._secondsToTicks(rh());
      var multiple = Math.ceil(Tone.Transport.ticks / subdivision);
      return this._ticksToUnits(multiple * subdivision);
    }
  };
  Tone.TransportTime.prototype._secondsToTicks = function (seconds) {
    var quarterTime = this._beatsToUnits(1);
    var quarters = seconds / quarterTime;
    return Math.round(quarters * Tone.Transport.PPQ);
  };
  Tone.TransportTime.prototype.valueOf = function () {
    var val = this._secondsToTicks(this._expr());
    return val + (this._plusNow ? Tone.Transport.ticks : 0);
  };
  Tone.TransportTime.prototype.toTicks = function () {
    return this.valueOf();
  };
  Tone.TransportTime.prototype.toSeconds = function () {
    var val = this._expr();
    return val + (this._plusNow ? Tone.Transport.seconds : 0);
  };
  Tone.TransportTime.prototype.toFrequency = function () {
    return 1 / this.toSeconds();
  };
  return Tone.TransportTime;
}(Tone_core_Tone);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_type_Type;
Tone_type_Type = function (Tone) {
  Tone.Type = {
    Default: 'number',
    Time: 'time',
    Frequency: 'frequency',
    TransportTime: 'transportTime',
    Ticks: 'ticks',
    NormalRange: 'normalRange',
    AudioRange: 'audioRange',
    Decibels: 'db',
    Interval: 'interval',
    BPM: 'bpm',
    Positive: 'positive',
    Cents: 'cents',
    Degrees: 'degrees',
    MIDI: 'midi',
    BarsBeatsSixteenths: 'barsBeatsSixteenths',
    Samples: 'samples',
    Hertz: 'hertz',
    Note: 'note',
    Milliseconds: 'milliseconds',
    Seconds: 'seconds',
    Notation: 'notation'
  };
  Tone.prototype.toSeconds = function (time) {
    if (this.isNumber(time)) {
      return time;
    } else if (this.isUndef(time)) {
      return this.now();
    } else if (this.isString(time)) {
      return new Tone.Time(time).toSeconds();
    } else if (time instanceof Tone.TimeBase) {
      return time.toSeconds();
    }
  };
  Tone.prototype.toFrequency = function (freq) {
    if (this.isNumber(freq)) {
      return freq;
    } else if (this.isString(freq) || this.isUndef(freq)) {
      return new Tone.Frequency(freq).valueOf();
    } else if (freq instanceof Tone.TimeBase) {
      return freq.toFrequency();
    }
  };
  Tone.prototype.toTicks = function (time) {
    if (this.isNumber(time) || this.isString(time)) {
      return new Tone.TransportTime(time).toTicks();
    } else if (this.isUndef(time)) {
      return Tone.Transport.ticks;
    } else if (time instanceof Tone.TimeBase) {
      return time.toTicks();
    }
  };
  return Tone;
}(Tone_core_Tone, Tone_type_Time, Tone_type_Frequency, Tone_type_TransportTime);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_core_Param;
Tone_core_Param = function (Tone) {
  'use strict';
  Tone.Param = function () {
    var options = this.optionsObject(arguments, [
      'param',
      'units',
      'convert'
    ], Tone.Param.defaults);
    this._param = this.input = options.param;
    this.units = options.units;
    this.convert = options.convert;
    this.overridden = false;
    this._lfo = null;
    if (this.isObject(options.lfo)) {
      this.value = options.lfo;
    } else if (!this.isUndef(options.value)) {
      this.value = options.value;
    }
  };
  Tone.extend(Tone.Param);
  Tone.Param.defaults = {
    'units': Tone.Type.Default,
    'convert': true,
    'param': undefined
  };
  Object.defineProperty(Tone.Param.prototype, 'value', {
    get: function () {
      return this._toUnits(this._param.value);
    },
    set: function (value) {
      if (this.isObject(value)) {
        if (this.isUndef(Tone.LFO)) {
          throw new Error('Include \'Tone.LFO\' to use an LFO as a Param value.');
        }
        if (this._lfo) {
          this._lfo.dispose();
        }
        this._lfo = new Tone.LFO(value).start();
        this._lfo.connect(this.input);
      } else {
        var convertedVal = this._fromUnits(value);
        this._param.cancelScheduledValues(0);
        this._param.value = convertedVal;
      }
    }
  });
  Tone.Param.prototype._fromUnits = function (val) {
    if (this.convert || this.isUndef(this.convert)) {
      switch (this.units) {
      case Tone.Type.Time:
        return this.toSeconds(val);
      case Tone.Type.Frequency:
        return this.toFrequency(val);
      case Tone.Type.Decibels:
        return this.dbToGain(val);
      case Tone.Type.NormalRange:
        return Math.min(Math.max(val, 0), 1);
      case Tone.Type.AudioRange:
        return Math.min(Math.max(val, -1), 1);
      case Tone.Type.Positive:
        return Math.max(val, 0);
      default:
        return val;
      }
    } else {
      return val;
    }
  };
  Tone.Param.prototype._toUnits = function (val) {
    if (this.convert || this.isUndef(this.convert)) {
      switch (this.units) {
      case Tone.Type.Decibels:
        return this.gainToDb(val);
      default:
        return val;
      }
    } else {
      return val;
    }
  };
  Tone.Param.prototype._minOutput = 0.00001;
  Tone.Param.prototype.setValueAtTime = function (value, time) {
    value = this._fromUnits(value);
    time = this.toSeconds(time);
    if (time <= this.now() + this.blockTime) {
      this._param.value = value;
    } else {
      this._param.setValueAtTime(value, time);
    }
    return this;
  };
  Tone.Param.prototype.setRampPoint = function (now) {
    now = this.defaultArg(now, this.now());
    var currentVal = this._param.value;
    if (currentVal === 0) {
      currentVal = this._minOutput;
    }
    this._param.setValueAtTime(currentVal, now);
    return this;
  };
  Tone.Param.prototype.linearRampToValueAtTime = function (value, endTime) {
    value = this._fromUnits(value);
    this._param.linearRampToValueAtTime(value, this.toSeconds(endTime));
    return this;
  };
  Tone.Param.prototype.exponentialRampToValueAtTime = function (value, endTime) {
    value = this._fromUnits(value);
    value = Math.max(this._minOutput, value);
    this._param.exponentialRampToValueAtTime(value, this.toSeconds(endTime));
    return this;
  };
  Tone.Param.prototype.exponentialRampToValue = function (value, rampTime, startTime) {
    startTime = this.toSeconds(startTime);
    this.setRampPoint(startTime);
    this.exponentialRampToValueAtTime(value, startTime + this.toSeconds(rampTime));
    return this;
  };
  Tone.Param.prototype.linearRampToValue = function (value, rampTime, startTime) {
    startTime = this.toSeconds(startTime);
    this.setRampPoint(startTime);
    this.linearRampToValueAtTime(value, startTime + this.toSeconds(rampTime));
    return this;
  };
  Tone.Param.prototype.setTargetAtTime = function (value, startTime, timeConstant) {
    value = this._fromUnits(value);
    value = Math.max(this._minOutput, value);
    timeConstant = Math.max(this._minOutput, timeConstant);
    this._param.setTargetAtTime(value, this.toSeconds(startTime), timeConstant);
    return this;
  };
  Tone.Param.prototype.setValueCurveAtTime = function (values, startTime, duration) {
    for (var i = 0; i < values.length; i++) {
      values[i] = this._fromUnits(values[i]);
    }
    this._param.setValueCurveAtTime(values, this.toSeconds(startTime), this.toSeconds(duration));
    return this;
  };
  Tone.Param.prototype.cancelScheduledValues = function (startTime) {
    this._param.cancelScheduledValues(this.toSeconds(startTime));
    return this;
  };
  Tone.Param.prototype.rampTo = function (value, rampTime, startTime) {
    rampTime = this.defaultArg(rampTime, 0);
    if (this.units === Tone.Type.Frequency || this.units === Tone.Type.BPM || this.units === Tone.Type.Decibels) {
      this.exponentialRampToValue(value, rampTime, startTime);
    } else {
      this.linearRampToValue(value, rampTime, startTime);
    }
    return this;
  };
  Object.defineProperty(Tone.Param.prototype, 'lfo', {
    get: function () {
      return this._lfo;
    }
  });
  Tone.Param.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._param = null;
    if (this._lfo) {
      this._lfo.dispose();
      this._lfo = null;
    }
    return this;
  };
  return Tone.Param;
}(Tone_core_Tone);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_core_Gain;
Tone_core_Gain = function (Tone) {
  'use strict';
  if (window.GainNode && !AudioContext.prototype.createGain) {
    AudioContext.prototype.createGain = AudioContext.prototype.createGainNode;
  }
  Tone.Gain = function () {
    var options = this.optionsObject(arguments, [
      'gain',
      'units'
    ], Tone.Gain.defaults);
    this.input = this.output = this._gainNode = this.context.createGain();
    this.gain = new Tone.Param({
      'param': this._gainNode.gain,
      'units': options.units,
      'value': options.gain,
      'convert': options.convert
    });
    this._readOnly('gain');
  };
  Tone.extend(Tone.Gain);
  Tone.Gain.defaults = {
    'gain': 1,
    'convert': true
  };
  Tone.Gain.prototype.dispose = function () {
    Tone.Param.prototype.dispose.call(this);
    this._gainNode.disconnect();
    this._gainNode = null;
    this._writable('gain');
    this.gain.dispose();
    this.gain = null;
  };
  Tone.prototype.createInsOuts = function (inputs, outputs) {
    if (inputs === 1) {
      this.input = new Tone.Gain();
    } else if (inputs > 1) {
      this.input = new Array(inputs);
    }
    if (outputs === 1) {
      this.output = new Tone.Gain();
    } else if (outputs > 1) {
      this.output = new Array(inputs);
    }
  };
  return Tone.Gain;
}(Tone_core_Tone, Tone_core_Param);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Signal;
Tone_signal_Signal = function (Tone) {
  'use strict';
  Tone.Signal = function () {
    var options = this.optionsObject(arguments, [
      'value',
      'units'
    ], Tone.Signal.defaults);
    this.output = this._gain = this.context.createGain();
    options.param = this._gain.gain;
    Tone.Param.call(this, options);
    this.input = this._param = this._gain.gain;
    this.context.getConstant(1).chain(this._gain);
  };
  Tone.extend(Tone.Signal, Tone.Param);
  Tone.Signal.defaults = {
    'value': 0,
    'units': Tone.Type.Default,
    'convert': true
  };
  Tone.Signal.prototype.connect = Tone.SignalBase.prototype.connect;
  Tone.Signal.prototype.dispose = function () {
    Tone.Param.prototype.dispose.call(this);
    this._param = null;
    this._gain.disconnect();
    this._gain = null;
    return this;
  };
  return Tone.Signal;
}(Tone_core_Tone, Tone_signal_WaveShaper, Tone_type_Type, Tone_core_Param);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Add;
Tone_signal_Add = function (Tone) {
  'use strict';
  Tone.Add = function (value) {
    this.createInsOuts(2, 0);
    this._sum = this.input[0] = this.input[1] = this.output = new Tone.Gain();
    this._param = this.input[1] = new Tone.Signal(value);
    this._param.connect(this._sum);
  };
  Tone.extend(Tone.Add, Tone.Signal);
  Tone.Add.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._sum.dispose();
    this._sum = null;
    this._param.dispose();
    this._param = null;
    return this;
  };
  return Tone.Add;
}(Tone_core_Tone, Tone_signal_Signal);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Multiply;
Tone_signal_Multiply = function (Tone) {
  'use strict';
  Tone.Multiply = function (value) {
    this.createInsOuts(2, 0);
    this._mult = this.input[0] = this.output = new Tone.Gain();
    this._param = this.input[1] = this.output.gain;
    this._param.value = this.defaultArg(value, 0);
  };
  Tone.extend(Tone.Multiply, Tone.Signal);
  Tone.Multiply.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._mult.dispose();
    this._mult = null;
    this._param = null;
    return this;
  };
  return Tone.Multiply;
}(Tone_core_Tone, Tone_signal_Signal);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Scale;
Tone_signal_Scale = function (Tone) {
  'use strict';
  Tone.Scale = function (outputMin, outputMax) {
    this._outputMin = this.defaultArg(outputMin, 0);
    this._outputMax = this.defaultArg(outputMax, 1);
    this._scale = this.input = new Tone.Multiply(1);
    this._add = this.output = new Tone.Add(0);
    this._scale.connect(this._add);
    this._setRange();
  };
  Tone.extend(Tone.Scale, Tone.SignalBase);
  Object.defineProperty(Tone.Scale.prototype, 'min', {
    get: function () {
      return this._outputMin;
    },
    set: function (min) {
      this._outputMin = min;
      this._setRange();
    }
  });
  Object.defineProperty(Tone.Scale.prototype, 'max', {
    get: function () {
      return this._outputMax;
    },
    set: function (max) {
      this._outputMax = max;
      this._setRange();
    }
  });
  Tone.Scale.prototype._setRange = function () {
    this._add.value = this._outputMin;
    this._scale.value = this._outputMax - this._outputMin;
  };
  Tone.Scale.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._add.dispose();
    this._add = null;
    this._scale.dispose();
    this._scale = null;
    return this;
  };
  return Tone.Scale;
}(Tone_core_Tone, Tone_signal_Add, Tone_signal_Multiply);
var signal;
'use strict';
signal = function () {
  // La señal está construida con la señal Tone.js por Yotam Mann
  // https://github.com/TONEnoTONE/Tone.js/
  var Signal = Tone_signal_Signal;
  var Add = Tone_signal_Add;
  var Mult = Tone_signal_Multiply;
  var Scale = Tone_signal_Scale;
  /**
   *  <p>p5.La señal es una señal de velocidad de audio constante utilizada por p5.Oscillator
   *  y p5.Envelope para matemáticas de modulación.</p>
   *
   *  <p>Esto es necesario porque Web Audio se procesa en un reloj separado.
   *  Por ejemplo, el ciclo de dibujo p5 se ejecuta aproximadamente 60 veces por segundo. But
   *  Pero el reloj de audio debe procesar muestras 44100 veces por segundo. Si queremos
   *  agregar un valor a cada una de esas muestras, no podemos hacerlo en el bucle de dibujo, pero podemos hacerlo
   *  agregando una señal de audio de tasa constante.</p.
   *
   *  <p>Esta clase funciona principalmente entre bastidores en p5.sound y devuelve
   *  un Tone.Signal de la biblioteca Tone.js de Yotam Mann.
   *  Si desea trabajar directamente con señales de audio para
   *  síntesis modular, consulte
   *  <a href='http://bit.ly/1oIoEng' target=_'blank'>tone.js.</a></p>
   *
   *  @class  p5.Signal
   *  @constructor
   *  @return {Tone.Signal} A Signal object from the Tone.js library
   *  @example
   *  <div><code>
   *  function setup() {
   *    carrier = new p5.Oscillator('sine');
   *    carrier.amp(1); // establecer amplitud
   *    carrier.freq(220); // establecer frecuencia
   *    carrier.start(); // empezar a oscilar
   *
   *    modulator = new p5.Oscillator('sawtooth');
   *    modulator.disconnect();
   *    modulator.amp(1);
   *    modulator.freq(4);
   *    modulator.start();
   *
   *    // El rango de amplitud predeterminado del modulador es de -1 a 1.
   *    // Multiplíquelo por -200, por lo que el rango es de -200 a 200
   *    // luego agregue 220 para que el rango sea de 20 a 420
   *    carrier.freq( modulator.mult(-200).add(220) );
   *  }
   *  </code></div>
   */
  p5.Signal = function (value) {
    var s = new Signal(value);
    // p5sound.soundArray.push(s);
    return s;
  };
  /**
   *  Desvanecer el valor, para transiciones suaves
   *
   *  @method  fade - desvanecimiento
   *  @param  {Number} value - valor       Valor para configurar esta señal
   *  @param  {Number} [secondsFromNow] Duración del desvanecimiento, en segundos a partir de ahora
   */
  Signal.prototype.fade = Signal.prototype.linearRampToValueAtTime;
  Mult.prototype.fade = Signal.prototype.fade;
  Add.prototype.fade = Signal.prototype.fade;
  Scale.prototype.fade = Signal.prototype.fade;
  /**
   *  Conecte un objeto p5.sound o un nodo Web Audio a este
   *  p5.Signal para poder escalar sus valores de amplitud.
   *
   *  @method setInput
   *  @param {Object} input - entrada
   */
  Signal.prototype.setInput = function (_input) {
    _input.connect(this);
  };
  Mult.prototype.setInput = Signal.prototype.setInput;
  Add.prototype.setInput = Signal.prototype.setInput;
  Scale.prototype.setInput = Signal.prototype.setInput;
  // signals can add / mult / scale themselves
  /**
   *  Agregue un valor constante a esta señal de audio,
   *  y devuelva la señal de audio resultante. No cambia el valor
   *  de la señal original, sino que devuelve
   *  un nuevo p5.SignalAdd.
   *
   *  @method  add - agregar
   *  @param {Number} number - número
   *  @return {p5.Signal} object - objeto
   */
  Signal.prototype.add = function (num) {
    var add = new Add(num);
    // add.setInput(this);
    this.connect(add);
    return add;
  };
  Mult.prototype.add = Signal.prototype.add;
  Add.prototype.add = Signal.prototype.add;
  Scale.prototype.add = Signal.prototype.add;
  /**
   *  Multiplica esta señal por un valor constante,
   *  y devuelva la señal de audio resultante. No cambia
   *  el valor de la señal original, sino que devuelve
   *  un nuevo p5.SignalMult.
   *
   *  @method  mult
   *  @param {Number} number to multiply - número para multiplicar
   *  @return {p5.Signal} object - objeto
   */
  Signal.prototype.mult = function (num) {
    var mult = new Mult(num);
    // mult.setInput(this);
    this.connect(mult);
    return mult;
  };
  Mult.prototype.mult = Signal.prototype.mult;
  Add.prototype.mult = Signal.prototype.mult;
  Scale.prototype.mult = Signal.prototype.mult;
  /**
   *  Escale este valor de señal a un rango dado
   *  y devuelva el resultado como una señal de audio. No cambia
   *  el valor de la señal original, sino que devuelve
   *  un nuevo p5.SignalScale.
   *
   *  @method  scale - escala
   *  @param {Number} number to multiply - número para multiplicar
   *  @param  {Number} inMin  input range minumum
   *  @param  {Number} inMax  input range maximum
   *  @param  {Number} outMin input range minumum
   *  @param  {Number} outMax input range maximum
   *  @return {p5.Signal} object - objeto
   */
  Signal.prototype.scale = function (inMin, inMax, outMin, outMax) {
    var mapOutMin, mapOutMax;
    if (arguments.length === 4) {
      mapOutMin = p5.prototype.map(outMin, inMin, inMax, 0, 1) - 0.5;
      mapOutMax = p5.prototype.map(outMax, inMin, inMax, 0, 1) - 0.5;
    } else {
      mapOutMin = arguments[0];
      mapOutMax = arguments[1];
    }
    var scale = new Scale(mapOutMin, mapOutMax);
    this.connect(scale);
    return scale;
  };
  Mult.prototype.scale = Signal.prototype.scale;
  Add.prototype.scale = Signal.prototype.scale;
  Scale.prototype.scale = Signal.prototype.scale;
}(Tone_signal_Signal, Tone_signal_Add, Tone_signal_Multiply, Tone_signal_Scale);
var oscillator;
'use strict';
oscillator = function () {
  var p5sound = master;
  var Add = Tone_signal_Add;
  var Mult = Tone_signal_Multiply;
  var Scale = Tone_signal_Scale;
  /**
   *  <p>Crea una señal que oscila entre -1.0 y 1.0.
   *  Por defecto, la oscilación toma la forma de
   *  una forma sinusoidal ('seno'). Los tipos adicionales incluyen 'triángulo',
   *  'diente de sierra' y 'cuadrado'. La frecuencia predeterminada es
   *  de 440 oscilaciones por segundo (440 Hz, igual al tono de
   *  una nota 'A').</p>
   *
   *  <p>Establezca el tipo de oscilación con setType (), o instanciando
   *  un oscilador específico: <a href="/reference/#/p5.SinOsc">p5.SinOsc</a>, <a
   *  href="/reference/#/p5.TriOsc">p5.TriOsc</a>, <a
   *  href="/reference/#/p5.SqrOsc">p5.SqrOsc</a>, or <a
   *  href="/reference/#/p5.SawOsc">p5.SawOsc</a>.
   *  </p>
   *
   *  @class p5.Oscillator
   *  @constructor
   *  @param {Number} [freq] la frecuencia predeterminada es 440Hz
   *  @param {String} [type] tipo de oscilador. Options:
   *                         'sine' (default), 'triangle',
   *                         'sawtooth', 'square'
   *  @example - ejemplo
   *  <div><code>
   *  let osc;
   *  let playing = false;
   *
   *  function setup() {
   *    backgroundColor = color(255,0,255);
   *    textAlign(CENTER);
   *
   *    osc = new p5.Oscillator();
   *    osc.setType('sine');
   *    osc.freq(240);
   *    osc.amp(0);
   *    osc.start();
   *  }
   *
   *  function draw() {
   *    background(backgroundColor)
   *    text('click to play', width/2, height/2);
   *  }
   *
   *  function mouseClicked() {
   *    if (mouseX > 0 && mouseX < width && mouseY < height && mouseY > 0) {
   *      if (!playing) {
   *        // amplitud de rampa a 0,5 en 0,05 segundos
   *        osc.amp(0.5, 0.05);
   *        playing = true;
   *        backgroundColor = color(0,255,255);
   *      } else {
   *        // amplitud de rampa a 0 durante 0,5 segundos
   *        osc.amp(0, 0.5);
   *        playing = false;
   *        backgroundColor = color(255,0,255);
   *      }
   *    }
   *  }
   *  </code> </div>
   */
  p5.Oscillator = function (freq, type) {
    if (typeof freq === 'string') {
      var f = type;
      type = freq;
      freq = f;
    }
    if (typeof type === 'number') {
      var f = type;
      type = freq;
      freq = f;
    }
    this.started = false;
    // componentes
    this.phaseAmount = undefined;
    this.oscillator = p5sound.audiocontext.createOscillator();
    this.f = freq || 440;
    // frecuencia
    this.oscillator.type = type || 'sine';
    this.oscillator.frequency.setValueAtTime(this.f, p5sound.audiocontext.currentTime);
    // conexiones
    this.output = p5sound.audiocontext.createGain();
    this._freqMods = [];
    // moduladores conectados a la frecuencia de este oscilador
    // establecer la ganancia de salida predeterminada en 0.5
    this.output.gain.value = 0.5;
    this.output.gain.setValueAtTime(0.5, p5sound.audiocontext.currentTime);
    this.oscillator.connect(this.output);
    // panorama estéreo
    this.panPosition = 0;
    this.connection = p5sound.input;
    //conectarse a p5sound por defecto
    this.panner = new p5.Panner(this.output, this.connection, 1);
    //matriz de encadenamiento de señales de operación matemática
    this.mathOps = [this.output];
    // agregar al soundArray para que podamos deshacernos del osc más tarde
    p5sound.soundArray.push(this);
  };
  /**
   *  Enciende un oscilador. Acepta un parámetro opcional para
   *  determinar cuánto tiempo (en segundos a partir de ahora)
   *  hasta que se inicie el oscilador.
   *
   *  @method  start - iniciar
   *  @param  {Number} [time] startTime en segundos a partir de ahora.
   *  @param  {Number} [frequency] frecuencia en Hz.
   */
  p5.Oscillator.prototype.start = function (time, f) {
    if (this.started) {
      var now = p5sound.audiocontext.currentTime;
      this.stop(now);
    }
    if (!this.started) {
      var freq = f || this.f;
      var type = this.oscillator.type;
      // liberar el viejo osc para que sea recolectado como basura (memoria)
      if (this.oscillator) {
        this.oscillator.disconnect();
        delete this.oscillator;
      }
      // var detune = this.oscillator.frequency.value;
      this.oscillator = p5sound.audiocontext.createOscillator();
      this.oscillator.frequency.value = Math.abs(freq);
      this.oscillator.type = type;
      // this.oscillator.detune.value = detune;
      this.oscillator.connect(this.output);
      time = time || 0;
      this.oscillator.start(time + p5sound.audiocontext.currentTime);
      this.freqNode = this.oscillator.frequency;
      // si otros osciladores ya están conectados a la frecuencia de este osc
      para (var i in this._freqMods) {
        if (typeof this._freqMods[i].connect !== 'undefined') {
          this._freqMods[i].connect(this.oscillator.frequency);
        }
      }
      this.started = true;
    }
  };
  /**
   *  Detener un oscilador. Acepta un parámetro opcional para determinar
   *  cuánto tiempo (en segundos a partir de ahora)
   *  hasta que se detenga el oscilador.
   *
   *  @method  stop - detener
   *  @param  {Number} secondsFromNow Time, en segundos a partir de ahora.
   */
  p5.Oscillator.prototype.stop = function (time) {
    if (this.started) {
      var t = time || 0;
      var now = p5sound.audiocontext.currentTime;
      this.oscillator.stop(t + now);
      this.started = false;
    }
  };
  /**
   *  Establezca la amplitud entre 0 y 1,0. O bien, pase un objeto como un 
   *  oscilador para modular la amplitud con una señal de audio.
   *
   *  @method  amp
   *  @param  {Number|Object} vol entre 0 y 1.0
   *                              o una señal moduladora / oscilador
   *  @param {Number} [rampTime] crea un desvanecimiento que dura rampTime
   *  @param {Number} [timeFromNow] programar este evento para que suceda
   *                                segundos a partir de ahora
   *  @return  {AudioParam} gain  Si no se proporciona ningún valor,
   *                              devuelve la API de Web
   *                              AudioParam que controla la
   *                              ganancia / amplitud / volumen
   *                              de este oscilador)
   */
  p5.Oscillator.prototype.amp = function (vol, rampTime, tFromNow) {
    var self = this;
    if (typeof vol === 'number') {
      var rampTime = rampTime || 0;
      var tFromNow = tFromNow || 0;
      var now = p5sound.audiocontext.currentTime;
      this.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime);
    } else if (vol) {
      vol.connect(self.output.gain);
    } else {
      // devolver el nodo de ganancia
      return this.output.gain;
    }
  };
  // estos ahora son lo mismo
  p5.Oscillator.prototype.fade = p5.Oscillator.prototype.amp;
  p5.Oscillator.prototype.getAmp = function () {
    return this.output.gain.value;
  };
  /**
   *  Establece la frecuencia de un oscilador en un valor. O bien, pase un objeto
   *  como un oscilador para modular la frecuencia con una señal de audio.
   *
   *  @method  freq
   *  @param  {Number|Object} Frequency Frecuencia en Hz
   *                                        o modulando señal / oscilador
   *  @param  {Number} [rampTime] Tiempo de rampa (en segundos)
   *  @param  {Number} [timeFromNow] Programe este evento para que suceda
   *                                   en x segundos a partir de ahora
   *  @return  {AudioParam} Frequency Si no se proporciona ningún valor,
   *                                  devuelve el AudioParam de la API 
   *                                  de audio web que controla la frecuencia
   *                                  de este oscilador
   *  @example
   *  <div><code>
   *  let osc = new p5.Oscillator(300);
   *  osc.start();
   *  osc.freq(40, 10);
   *  </code></div>
   */
  p5.Oscillator.prototype.freq = function (val, rampTime, tFromNow) {
    if (typeof val === 'number' && !isNaN(val)) {
      this.f = val;
      var now = p5sound.audiocontext.currentTime;
      var rampTime = rampTime || 0;
      var tFromNow = tFromNow || 0;
      var t = now + tFromNow + rampTime;
      // var currentFreq = this.oscillator.frequency.value;
      // this.oscillator.frequency.cancelScheduledValues(now);
      if (rampTime === 0) {
        this.oscillator.frequency.setValueAtTime(val, tFromNow + now);
      } else {
        if (val > 0) {
          this.oscillator.frequency.exponentialRampToValueAtTime(val, tFromNow + rampTime + now);
        } else {
          this.oscillator.frequency.linearRampToValueAtTime(val, tFromNow + rampTime + now);
        }
      }
      // reiniciar la fase si el oscilador tiene una fase
      if (this.phaseAmount) {
        this.phase(this.phaseAmount);
      }
    } else if (val) {
      if (val.output) {
        val = val.output;
      }
      val.connect(this.oscillator.frequency);
      // realizar un seguimiento de lo que está modulando este parámetro
      // para que pueda volver a conectarse si
      this._freqMods.push(val);
    } else {
      // devolver el nodo de frecuencia
      return this.oscillator.frequency;
    }
  };
  p5.Oscillator.prototype.getFreq = function () {
    return this.oscillator.frequency.value;
  };
  /**
   *  Establezca el tipo en 'seno', 'triángulo', 'diente de sierra' o 'cuadrado'.
   *
   *  @method  setType
   *  @param {String} establezca 'seno', 'triángulo', 'diente de sierra' o 'cuadrado'.
   */
  p5.Oscillator.prototype.setType = function (type) {
    this.oscillator.type = type;
  };
  p5.Oscillator.prototype.getType = function () {
    return this.oscillator.type;
  };
  /**
   *  Conéctese a un objeto p5.sound / Web Audio.
   *
   *  @method  connect - conectar
   *  @param  {Object} unidad A p5. sonido u objeto Web Audio
   */
  p5.Oscillator.prototype.connect = function (unit) {
    if (!unit) {
      this.panner.connect(p5sound.input);
    } else if (unit.hasOwnProperty('input')) {
      this.panner.connect(unit.input);
      this.connection = unit.input;
    } else {
      this.panner.connect(unit);
      this.connection = unit;
    }
  };
  /**
   *  Desconecta todas las salidas
   *
   *  @method  disconnect - desconectar
   */
  p5.Oscillator.prototype.disconnect = function () {
    if (this.output) {
      this.output.disconnect();
    }
    if (this.panner) {
      this.panner.disconnect();
      if (this.output) {
        this.output.connect(this.panner);
      }
    }
    this.oscMods = [];
  };
  /**
   *  Panorámica entre izquierda (-1) y derecha (1)
   *
   *  @method  pan
   *  @param  {Number} panning Número entre -1 y 1
   *  @param  {Number} timeFromNow programar este evento para que suceda
   *                                segundos a partir de ahora
   */
  p5.Oscillator.prototype.pan = function (pval, tFromNow) {
    this.panPosition = pval;
    this.panner.pan(pval, tFromNow);
  };
  p5.Oscillator.prototype.getPan = function () {
    return this.panPosition;
  };
  // deshacerse del oscilador
  p5.Oscillator.prototype.dispose = function () {
    // eliminar la referencia de soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    if (this.oscillator) {
      var now = p5sound.audiocontext.currentTime;
      this.stop(now);
      this.disconnect();
      this.panner = null;
      this.oscillator = null;
    }
    // si es un pulso
    if (this.osc2) {
      this.osc2.dispose();
    }
  };
  /**
   *  Establezca la fase de un oscilador entre 0.0 y 1.0.
   *  En esta implementación, la fase es un retardo en el tiempo
   *  basado en la frecuencia actual del oscilador.
   *
   *  @method  phase - fase
   *  @param  {Number} flotación de fase entre 0.0 y 1.0
   */
  p5.Oscillator.prototype.phase = function (p) {
    var delayAmt = p5.prototype.map(p, 0, 1, 0, 1 / this.f);
    var now = p5sound.audiocontext.currentTime;
    this.phaseAmount = p;
    if (!this.dNode) {
      // crear un nodo de retraso
      this.dNode = p5sound.audiocontext.createDelay();
      // poner el nodo de retardo entre la salida y el panorámico
      this.oscillator.disconnect();
      this.oscillator.connect(this.dNode);
      this.dNode.connect(this.output);
    }
    // establecer el tiempo de retardo para que coincida con la fase:
    this.dNode.delayTime.setValueAtTime(delayAmt, now);
  };
  // ========================== //
  // SEÑAL MATEMÁTICA PARA MODULACIÓN //
  // ========================== //
  // return sigChain(this, scale, thisChain, nextChain, Scale);
  var sigChain = function (o, mathObj, thisChain, nextChain, type) {
    var chainSource = o.oscillator;
    // si este tipo de matemáticas ya existe en la cadena, reemplácelo
    por (var i in o.mathOps) {
      if (o.mathOps[i] instanceof type) {
        chainSource.disconnect();
        o.mathOps[i].dispose();
        thisChain = i;
        // suponga que nextChain es un nodo de ganancia de salida a menos que ...
        if (thisChain < o.mathOps.length - 2) {
          nextChain = o.mathOps[i + 1];
        }
      }
    }
    if (thisChain === o.mathOps.length - 1) {
      o.mathOps.push(nextChain);
    }
    // suponga que la fuente es el oscilador a menos que i> 0
    if (i > 0) {
      chainSource = o.mathOps[i - 1];
    }
    chainSource.disconnect();
    chainSource.connect(mathObj);
    mathObj.connect(nextChain);
    o.mathOps[thisChain] = mathObj;
    return o;
  };
  /**
   *  Agregue un valor a la amplitud de salida al p5.Oscillator
   *  devuelva el oscilador. Llamar a este método nuevamente
   *  anulará el add () inicial con un nuevo valor.
   *
   *  @method  add - agregar
   *  @param {Number} number Número constante para sumar
   *  @return {p5.Oscillator} Oscillator Devuelve este oscilador
   *                                     con salida escalada
   *
   */
  p5.Oscillator.prototype.add = function (num) {
    var add = new Add(num);
    var thisChain = this.mathOps.length - 1;
    var nextChain = this.output;
    return sigChain(this, add, thisChain, nextChain, Add);
  };
  /**
   *  Multiplica la amplitud de salida de p5.Oscillator
   *  por un valor fijo (es decir, ¡suéltelo!). Llamar a este método
   *  nuevamente anulará el mult () inicial con un nuevo valor.
   *
   *  @method  mult
   *  @param {Number} number Número constante para multiplicar
   *  @return {p5.Oscillator} Oscillator Devuelve este oscilador con
   *                                     salida multiplicada
   */
  p5.Oscillator.prototype.mult = function (num) {
    var mult = new Mult(num);
    var thisChain = this.mathOps.length - 1;
    var nextChain = this.output;
    return sigChain(this, mult, thisChain, nextChain, Mult);
  };
  /**
   *  Escale los valores de amplitud de este oscilador a un
   *  rango dado y devuelva el oscilador. Llamar a este método
   *  nuevamente anulará la scale() inicial con nuevos valores.
   *
   *  @method  scale - escala
   *  @param  {Number} inMin  rango de entrada mínimo
   *  @param  {Number} inMax  rango de entrada máximo
   *  @param  {Number} outMin rango de entrada mínimo
   *  @param  {Number} outMax rango de entrada máximo
   *  @return {p5.Oscillator} Oscillator Devuelve este oscilador
   *                                     con salida escalada
   */
  p5.Oscillator.prototype.scale = function (inMin, inMax, outMin, outMax) {
    var mapOutMin, mapOutMax;
    if (arguments.length === 4) {
      mapOutMin = p5.prototype.map(outMin, inMin, inMax, 0, 1) - 0.5;
      mapOutMax = p5.prototype.map(outMax, inMin, inMax, 0, 1) - 0.5;
    } else {
      mapOutMin = arguments[0];
      mapOutMax = arguments[1];
    }
    var scale = new Scale(mapOutMin, mapOutMax);
    var thisChain = this.mathOps.length - 1;
    var nextChain = this.output;
    return sigChain(this, scale, thisChain, nextChain, Scale);
  };
  // ============================== //
  // SinOsc, TriOsc, SqrOsc, SawOsc //
  // ============================== //
  /**
   *  Constructor: <code>new p5.SinOsc()</code>.
   *  Esto crea un oscilador de onda sinusoidal y es
   *  equivalente a <code> new p5.Oscillator ('sine')
   *  </code> o crear un p5.Oscillator y luego llamar
   *  a su método <code> setType ('sine') </code> .
   *  Ve p5.Oscillator para métodos.
   *
   *  @class  p5.SinOsc
   *  @constructor
   *  @extends p5.Oscillator
   *  @param {Number} [freq] Establecer la frecuencia  
   */
  p5.SinOsc = function (freq) {
    p5.Oscillator.call(this, freq, 'sine');
  };
  p5.SinOsc.prototype = Object.create(p5.Oscillator.prototype);
  /**
   *  Constructor: <code>new p5.TriOsc()</code>.
   *  Esto crea un oscilador de onda triangular y es
   *  equivalente a <code> new p5.Oscillator ('triangle')
   *  </code> o crear un p5.Oscillator y luego llamar
   *  al método <code>setType('triangle')</code>.
   *  Consulta la p5.Oscillator para conocer los métodos.
   *
   *  @class  p5.TriOsc
   *  @constructor
   *  @extends p5.Oscillator
   *  @param {Number} [freq] Establecer la frecuencia
   */
  p5.TriOsc = function (freq) {
    p5.Oscillator.call(this, freq, 'triangle');
  };
  p5.TriOsc.prototype = Object.create(p5.Oscillator.prototype);
  /**
   *  Constructor: <code>new p5.SawOsc()</code>.
   *  Esto crea un oscilador de onda diente de sierra y es
   *  equivalente a <code> new p5.Oscillator ('sawtooth')
   *  </code> o crear un p5.Oscillator y luego llamar
   *  al método <code>setType('sawtooth')</code>.
   *  Consulta la p5.Oscillator para conocer los métodos.
   *
   *  @class  p5.SawOsc
   *  @constructor - constructor
   *  @extends p5.Oscillator
   *  @param {Number} [freq] Establecer la frecuencia
   */
  p5.SawOsc = function (freq) {
    p5.Oscillator.call(this, freq, 'sawtooth');
  };
  p5.SawOsc.prototype = Object.create(p5.Oscillator.prototype);
  /**
   *  Constructor: <code>new p5.SqrOsc()</code>.
   *  Esto crea un oscilador de onda cuadrada y es
   *  equivalente a <code> new p5.Oscillator('square')
   *  </code> o crear un  p5.Oscillator y luego llamar
   *  al método <code>setType('square')</code>.
   *  Consulta la p5.Oscillator para conocer los métodos.
   *
   *  @class  p5.SqrOsc
   *  @constructor
   *  @extends p5.Oscillator
   *  @param {Number} [freq] Establecer la frecuencia
   */
  p5.SqrOsc = function (freq) {
    p5.Oscillator.call(this, freq, 'square');
  };
  p5.SqrOsc.prototype = Object.create(p5.Oscillator.prototype);
}(master, Tone_signal_Add, Tone_signal_Multiply, Tone_signal_Scale);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_core_Timeline;
Tone_core_Timeline = function (Tone) {
  'use strict';
  Tone.Timeline = function () {
    var options = this.optionsObject(arguments, ['memory'], Tone.Timeline.defaults);
    this._timeline = [];
    this._toRemove = [];
    this._iterating = false;
    this.memory = options.memory;
  };
  Tone.extend(Tone.Timeline);
  Tone.Timeline.defaults = { 'memory': Infinity };
  Object.defineProperty(Tone.Timeline.prototype, 'length', {
    get: function () {
      return this._timeline.length;
    }
  });
  Tone.Timeline.prototype.add = function (event) {
    if (this.isUndef(event.time)) {
      throw new Error('Tone.Timeline: events must have a time attribute');
    }
    if (this._timeline.length) {
      var index = this._search(event.time);
      this._timeline.splice(index + 1, 0, event);
    } else {
      this._timeline.push(event);
    }
    if (this.length > this.memory) {
      var diff = this.length - this.memory;
      this._timeline.splice(0, diff);
    }
    return this;
  };
  Tone.Timeline.prototype.remove = function (event) {
    if (this._iterating) {
      this._toRemove.push(event);
    } else {
      var index = this._timeline.indexOf(event);
      if (index !== -1) {
        this._timeline.splice(index, 1);
      }
    }
    return this;
  };
  Tone.Timeline.prototype.get = function (time) {
    var index = this._search(time);
    if (index !== -1) {
      return this._timeline[index];
    } else {
      return null;
    }
  };
  Tone.Timeline.prototype.peek = function () {
    return this._timeline[0];
  };
  Tone.Timeline.prototype.shift = function () {
    return this._timeline.shift();
  };
  Tone.Timeline.prototype.getAfter = function (time) {
    var index = this._search(time);
    if (index + 1 < this._timeline.length) {
      return this._timeline[index + 1];
    } else {
      return null;
    }
  };
  Tone.Timeline.prototype.getBefore = function (time) {
    var len = this._timeline.length;
    if (len > 0 && this._timeline[len - 1].time < time) {
      return this._timeline[len - 1];
    }
    var index = this._search(time);
    if (index - 1 >= 0) {
      return this._timeline[index - 1];
    } else {
      return null;
    }
  };
  Tone.Timeline.prototype.cancel = function (after) {
    if (this._timeline.length > 1) {
      var index = this._search(after);
      if (index >= 0) {
        if (this._timeline[index].time === after) {
          for (var i = index; i >= 0; i--) {
            if (this._timeline[i].time === after) {
              index = i;
            } else {
              break;
            }
          }
          this._timeline = this._timeline.slice(0, index);
        } else {
          this._timeline = this._timeline.slice(0, index + 1);
        }
      } else {
        this._timeline = [];
      }
    } else if (this._timeline.length === 1) {
      if (this._timeline[0].time >= after) {
        this._timeline = [];
      }
    }
    return this;
  };
  Tone.Timeline.prototype.cancelBefore = function (time) {
    if (this._timeline.length) {
      var index = this._search(time);
      if (index >= 0) {
        this._timeline = this._timeline.slice(index + 1);
      }
    }
    return this;
  };
  Tone.Timeline.prototype._search = function (time) {
    var beginning = 0;
    var len = this._timeline.length;
    var end = len;
    if (len > 0 && this._timeline[len - 1].time <= time) {
      return len - 1;
    }
    while (beginning < end) {
      var midPoint = Math.floor(beginning + (end - beginning) / 2);
      var event = this._timeline[midPoint];
      var nextEvent = this._timeline[midPoint + 1];
      if (event.time === time) {
        for (var i = midPoint; i < this._timeline.length; i++) {
          var testEvent = this._timeline[i];
          if (testEvent.time === time) {
            midPoint = i;
          }
        }
        return midPoint;
      } else if (event.time < time && nextEvent.time > time) {
        return midPoint;
      } else if (event.time > time) {
        end = midPoint;
      } else if (event.time < time) {
        beginning = midPoint + 1;
      }
    }
    return -1;
  };
  Tone.Timeline.prototype._iterate = function (callback, lowerBound, upperBound) {
    this._iterating = true;
    lowerBound = this.defaultArg(lowerBound, 0);
    upperBound = this.defaultArg(upperBound, this._timeline.length - 1);
    for (var i = lowerBound; i <= upperBound; i++) {
      callback(this._timeline[i]);
    }
    this._iterating = false;
    if (this._toRemove.length > 0) {
      for (var j = 0; j < this._toRemove.length; j++) {
        var index = this._timeline.indexOf(this._toRemove[j]);
        if (index !== -1) {
          this._timeline.splice(index, 1);
        }
      }
      this._toRemove = [];
    }
  };
  Tone.Timeline.prototype.forEach = function (callback) {
    this._iterate(callback);
    return this;
  };
  Tone.Timeline.prototype.forEachBefore = function (time, callback) {
    var upperBound = this._search(time);
    if (upperBound !== -1) {
      this._iterate(callback, 0, upperBound);
    }
    return this;
  };
  Tone.Timeline.prototype.forEachAfter = function (time, callback) {
    var lowerBound = this._search(time);
    this._iterate(callback, lowerBound + 1);
    return this;
  };
  Tone.Timeline.prototype.forEachFrom = function (time, callback) {
    var lowerBound = this._search(time);
    while (lowerBound >= 0 && this._timeline[lowerBound].time >= time) {
      lowerBound--;
    }
    this._iterate(callback, lowerBound + 1);
    return this;
  };
  Tone.Timeline.prototype.forEachAtTime = function (time, callback) {
    var upperBound = this._search(time);
    if (upperBound !== -1) {
      this._iterate(function (event) {
        if (event.time === time) {
          callback(event);
        }
      }, 0, upperBound);
    }
    return this;
  };
  Tone.Timeline.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._timeline = null;
    this._toRemove = null;
  };
  return Tone.Timeline;
}(Tone_core_Tone);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_TimelineSignal;
Tone_signal_TimelineSignal = function (Tone) {
  'use strict';
  Tone.TimelineSignal = function () {
    var options = this.optionsObject(arguments, [
      'value',
      'units'
    ], Tone.Signal.defaults);
    this._events = new Tone.Timeline(10);
    Tone.Signal.apply(this, options);
    options.param = this._param;
    Tone.Param.call(this, options);
    this._initial = this._fromUnits(this._param.value);
  };
  Tone.extend(Tone.TimelineSignal, Tone.Param);
  Tone.TimelineSignal.Type = {
    Linear: 'linear',
    Exponential: 'exponential',
    Target: 'target',
    Curve: 'curve',
    Set: 'set'
  };
  Object.defineProperty(Tone.TimelineSignal.prototype, 'value', {
    get: function () {
      var now = this.now();
      var val = this.getValueAtTime(now);
      return this._toUnits(val);
    },
    set: function (value) {
      var convertedVal = this._fromUnits(value);
      this._initial = convertedVal;
      this.cancelScheduledValues();
      this._param.value = convertedVal;
    }
  });
  Tone.TimelineSignal.prototype.setValueAtTime = function (value, startTime) {
    value = this._fromUnits(value);
    startTime = this.toSeconds(startTime);
    this._events.add({
      'type': Tone.TimelineSignal.Type.Set,
      'value': value,
      'time': startTime
    });
    this._param.setValueAtTime(value, startTime);
    return this;
  };
  Tone.TimelineSignal.prototype.linearRampToValueAtTime = function (value, endTime) {
    value = this._fromUnits(value);
    endTime = this.toSeconds(endTime);
    this._events.add({
      'type': Tone.TimelineSignal.Type.Linear,
      'value': value,
      'time': endTime
    });
    this._param.linearRampToValueAtTime(value, endTime);
    return this;
  };
  Tone.TimelineSignal.prototype.exponentialRampToValueAtTime = function (value, endTime) {
    endTime = this.toSeconds(endTime);
    var beforeEvent = this._searchBefore(endTime);
    if (beforeEvent && beforeEvent.value === 0) {
      this.setValueAtTime(this._minOutput, beforeEvent.time);
    }
    value = this._fromUnits(value);
    var setValue = Math.max(value, this._minOutput);
    this._events.add({
      'type': Tone.TimelineSignal.Type.Exponential,
      'value': setValue,
      'time': endTime
    });
    if (value < this._minOutput) {
      this._param.exponentialRampToValueAtTime(this._minOutput, endTime - this.sampleTime);
      this.setValueAtTime(0, endTime);
    } else {
      this._param.exponentialRampToValueAtTime(value, endTime);
    }
    return this;
  };
  Tone.TimelineSignal.prototype.setTargetAtTime = function (value, startTime, timeConstant) {
    value = this._fromUnits(value);
    value = Math.max(this._minOutput, value);
    timeConstant = Math.max(this._minOutput, timeConstant);
    startTime = this.toSeconds(startTime);
    this._events.add({
      'type': Tone.TimelineSignal.Type.Target,
      'value': value,
      'time': startTime,
      'constant': timeConstant
    });
    this._param.setTargetAtTime(value, startTime, timeConstant);
    return this;
  };
  Tone.TimelineSignal.prototype.setValueCurveAtTime = function (values, startTime, duration, scaling) {
    scaling = this.defaultArg(scaling, 1);
    var floats = new Array(values.length);
    for (var i = 0; i < floats.length; i++) {
      floats[i] = this._fromUnits(values[i]) * scaling;
    }
    startTime = this.toSeconds(startTime);
    duration = this.toSeconds(duration);
    this._events.add({
      'type': Tone.TimelineSignal.Type.Curve,
      'value': floats,
      'time': startTime,
      'duration': duration
    });
    this._param.setValueAtTime(floats[0], startTime);
    for (var j = 1; j < floats.length; j++) {
      var segmentTime = startTime + j / (floats.length - 1) * duration;
      this._param.linearRampToValueAtTime(floats[j], segmentTime);
    }
    return this;
  };
  Tone.TimelineSignal.prototype.cancelScheduledValues = function (after) {
    after = this.toSeconds(after);
    this._events.cancel(after);
    this._param.cancelScheduledValues(after);
    return this;
  };
  Tone.TimelineSignal.prototype.setRampPoint = function (time) {
    time = this.toSeconds(time);
    var val = this._toUnits(this.getValueAtTime(time));
    var before = this._searchBefore(time);
    if (before && before.time === time) {
      this.cancelScheduledValues(time + this.sampleTime);
    } else if (before && before.type === Tone.TimelineSignal.Type.Curve && before.time + before.duration > time) {
      this.cancelScheduledValues(time);
      this.linearRampToValueAtTime(val, time);
    } else {
      var after = this._searchAfter(time);
      if (after) {
        this.cancelScheduledValues(time);
        if (after.type === Tone.TimelineSignal.Type.Linear) {
          this.linearRampToValueAtTime(val, time);
        } else if (after.type === Tone.TimelineSignal.Type.Exponential) {
          this.exponentialRampToValueAtTime(val, time);
        }
      }
      this.setValueAtTime(val, time);
    }
    return this;
  };
  Tone.TimelineSignal.prototype.linearRampToValueBetween = function (value, start, finish) {
    this.setRampPoint(start);
    this.linearRampToValueAtTime(value, finish);
    return this;
  };
  Tone.TimelineSignal.prototype.exponentialRampToValueBetween = function (value, start, finish) {
    this.setRampPoint(start);
    this.exponentialRampToValueAtTime(value, finish);
    return this;
  };
  Tone.TimelineSignal.prototype._searchBefore = function (time) {
    return this._events.get(time);
  };
  Tone.TimelineSignal.prototype._searchAfter = function (time) {
    return this._events.getAfter(time);
  };
  Tone.TimelineSignal.prototype.getValueAtTime = function (time) {
    time = this.toSeconds(time);
    var after = this._searchAfter(time);
    var before = this._searchBefore(time);
    var value = this._initial;
    if (before === null) {
      value = this._initial;
    } else if (before.type === Tone.TimelineSignal.Type.Target) {
      var previous = this._events.getBefore(before.time);
      var previouVal;
      if (previous === null) {
        previouVal = this._initial;
      } else {
        previouVal = previous.value;
      }
      value = this._exponentialApproach(before.time, previouVal, before.value, before.constant, time);
    } else if (before.type === Tone.TimelineSignal.Type.Curve) {
      value = this._curveInterpolate(before.time, before.value, before.duration, time);
    } else if (after === null) {
      value = before.value;
    } else if (after.type === Tone.TimelineSignal.Type.Linear) {
      value = this._linearInterpolate(before.time, before.value, after.time, after.value, time);
    } else if (after.type === Tone.TimelineSignal.Type.Exponential) {
      value = this._exponentialInterpolate(before.time, before.value, after.time, after.value, time);
    } else {
      value = before.value;
    }
    return value;
  };
  Tone.TimelineSignal.prototype.connect = Tone.SignalBase.prototype.connect;
  Tone.TimelineSignal.prototype._exponentialApproach = function (t0, v0, v1, timeConstant, t) {
    return v1 + (v0 - v1) * Math.exp(-(t - t0) / timeConstant);
  };
  Tone.TimelineSignal.prototype._linearInterpolate = function (t0, v0, t1, v1, t) {
    return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
  };
  Tone.TimelineSignal.prototype._exponentialInterpolate = function (t0, v0, t1, v1, t) {
    v0 = Math.max(this._minOutput, v0);
    return v0 * Math.pow(v1 / v0, (t - t0) / (t1 - t0));
  };
  Tone.TimelineSignal.prototype._curveInterpolate = function (start, curve, duration, time) {
    var len = curve.length;
    if (time >= start + duration) {
      return curve[len - 1];
    } else if (time <= start) {
      return curve[0];
    } else {
      var progress = (time - start) / duration;
      var lowerIndex = Math.floor((len - 1) * progress);
      var upperIndex = Math.ceil((len - 1) * progress);
      var lowerVal = curve[lowerIndex];
      var upperVal = curve[upperIndex];
      if (upperIndex === lowerIndex) {
        return lowerVal;
      } else {
        return this._linearInterpolate(lowerIndex, lowerVal, upperIndex, upperVal, progress * (len - 1));
      }
    }
  };
  Tone.TimelineSignal.prototype.dispose = function () {
    Tone.Signal.prototype.dispose.call(this);
    Tone.Param.prototype.dispose.call(this);
    this._events.dispose();
    this._events = null;
  };
  return Tone.TimelineSignal;
}(Tone_core_Tone, Tone_signal_Signal);
var envelope;
'use strict';
envelope = function () {
  var p5sound = master;
  var Add = Tone_signal_Add;
  var Mult = Tone_signal_Multiply;
  var Scale = Tone_signal_Scale;
  var TimelineSignal = Tone_signal_TimelineSignal;
  /**
   *  <p>Las envolventes son una distribución de amplitud predefinida a lo largo del tiempo.
   *  Normalmente, las envolventes se utilizan para controlar el volumen de salida
   *  de un objeto, una serie de desvanecimientos denominados Attack, Decay, Sustain y Release.
   *  Sustain and Release (
   *  <a href="https://upload.wikimedia.org/wikipedia/commons/e/ea/ADSR_parameter.svg">ADSR</a>
   *  ). Las envolventes también pueden controlar otros parámetros de audio web, por ejemplo, un p5.Envelope puede
   *  controlar la frecuencia de un oscilador como este: <code>osc.freq(env)</code>.</p>
   *  <p>Utiliza <code><a href="#/p5.Envelope/setRange">setRange</a></code> para cambiar el nivel de ataque / liberación.
   *  Utiliza <code><a href="#/p5.Envelope/setADSR">setADSR</a></code> para cambiar attackTime, decayTime, sustainPercent y releaseTime.</p>
   *  <p>Utiliza el <code><a href="#/p5.Envelope/play">play</a></code> método para reproducir todo el envelope
   *  el <code><a href="#/p5.Envelope/ramp">ramp</a></code> método para un disparador pingable,
   *  o <code><a href="#/p5.Envelope/triggerAttack">triggerAttack</a></code>/
   *  <code><a href="#/p5.Envelope/triggerRelease">triggerRelease</a></code> para desencadenar noteOn/noteOff.</p>
   *
   *  @class p5.Envelope
   *  @constructor - constructor
   *  @example - ejemplo
   *  <div><code>
   *  let attackLevel = 1.0;
   *  let releaseLevel = 0;
   *
   *  let attackTime = 0.001;
   *  let decayTime = 0.2;
   *  let susPercent = 0.2;
   *  let releaseTime = 0.5;
   *
   *  let env, triOsc;
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *
   *    env = new p5.Envelope();
   *    env.setADSR(attackTime, decayTime, susPercent, releaseTime);
   *    env.setRange(attackLevel, releaseLevel);
   *
   *    triOsc = new p5.Oscillator('triangle');
   *    triOsc.amp(env);
   *    triOsc.start();
   *    triOsc.freq(220);
   *
   *    cnv.mousePressed(playEnv);
   *  }
   *
   *  function playEnv()  {
   *    env.play();
   *  }
   *  </code></div>
   */
  p5.Envelope = function (t1, l1, t2, l2, t3, l3) {
    /**
     * Tiempo hasta que envelope alcance attackLevel
     * @property attackTime
     */
    this.aTime = t1 || 0.1;
    /**
     * Nivel una vez que se completa el ataque.
     * @property attackLevel
     */
    this.aLevel = l1 || 1;
    /**
     * Tiempo hasta que envelope alcance decayLevel.
     * @property decayTime
     */
    this.dTime = t2 || 0.5;
    /**
     * Nivel después de la descomposición. Envelope se mantendrá aquí hasta que se libere.
     * @property decayLevel
     */
    this.dLevel = l2 || 0;
    /**
     * Duración de la porción de liberación de envelope.
     * @property releaseTime
     */
    this.rTime = t3 || 0;
    /**
     * Nivel al final del lanzamiento.
     * @property releaseLevel
     */
    this.rLevel = l3 || 0;
    this._rampHighPercentage = 0.98;
    this._rampLowPercentage = 0.02;
    this.output = p5sound.audiocontext.createGain();
    this.control = new TimelineSignal();
    this._init();
    // esto asegura que el envelope comience en cero
    this.control.connect(this.output);
    // conectar a la salida
    this.connection = null;
    // conexión del deposito
    //matriz de encadenamiento de señales de operación matemática
    this.mathOps = [this.control];
    //si envelope debe ser una curva lineal o exponencial
    this.isExponential = false;
    // oscilador o fuente de búfer para borrar en env completo
    // para ahorrar recursos si / cuando se vuelve a activar
    this.sourceToClear = null;
    // establecido en verdadero si se establece el ataque, luego falso en el lanzamiento
    this.wasTriggered = false;
    // agregar al soundArray para que podamos deshacernos del env más tarde
    p5sound.soundArray.push(this);
  };
  // esta función de inicio simplemente suaviza el valor inicial a cero y proporciona un punto de inicio para la línea de tiempo
  // - era necesario eliminar los fallos al principio.
  p5.Envelope.prototype._init = function () {
    var now = p5sound.audiocontext.currentTime;
    var t = now;
    this.control.setTargetAtTime(0.00001, t, 0.001);
    //también, calcule las constantes de tiempo correctas
    this._setRampAD(this.aTime, this.dTime);
  };
  /**
   *  Reinicie envelope con una serie de pares de tiempo / valor.
   *
   *  @method  set - establecer
   *  @param {Number} attackTime     Tiempo (en segundos) antes de que el nivel
   *                                 alcance attackLevel
   *  @param {Number} attackLevel    Normalmente una amplitud entre
   *                                 0.0 y 1.0
   *  @param {Number} decayTime      Time - Tiempo
   *  @param {Number} decayLevel   Amplitud (en una envelope ADSR estándar,
   *                                 decayLevel = sustainLevel)
   *  @param {Number} releaseTime   Tiempo de liberación (en segundos)
   *  @param {Number} releaseLevel  Amplitud
   *  @example
   *  <div><code>
   *  let t1 = 0.1; // tiempo de ataque en segundos
   *  let l1 = 0.7; // nivel de ataque 0.0 a 1.0
   *  let t2 = 0.3; // tiempo de decaimiento en segundos
   *  let l2 = 0.1; // nivel de decaimiento 0.0 a 1.0
   *  let t3 = 0.2; // sostener el tiempo en segundos
   *  let l3 = 0.5; // sostener nivel 0.0 a 1.0
   *  // el nivel de versión predeterminado es cero
   *
   *  let env;
   *  let triOsc;
   *
   *  function setup() {
   *    background(0);
   *    noStroke();
   *    fill(255);
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *
   *    env = new p5.Envelope(t1, l1, t2, l2, t3, l3);
   *    triOsc = new p5.Oscillator('triangle');
   *    triOsc.amp(env); // dar al env el control de la triOsc's amp
   *    triOsc.start();
   *  }
   *
   *  // mouseClick desencadena el sobre si está sobre lienzo
   *  function mouseClicked() {
   *    // is mouse over canvas?
   *    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
   *      env.play(triOsc);
   *    }
   *  }
   *  </code></div>
   *
   */
  p5.Envelope.prototype.set = function (t1, l1, t2, l2, t3, l3) {
    this.aTime = t1;
    this.aLevel = l1;
    this.dTime = t2 || 0;
    this.dLevel = l2 || 0;
    this.rTime = t3 || 0;
    this.rLevel = l3 || 0;
    // set time constants for ramp
    this._setRampAD(t1, t2);
  };
  /**
   *  Establecer valores como tradicional
   *  <a href="https://en.wikipedia.org/wiki/Synthesizer#/media/File:ADSR_parameter.svg">
   *  ADSR envelope
   *  </a>.
   *
   *  @method  setADSR
   *  @param {Number} attackTime    Timpo en segundos (antes de que el sobre
   *                                alcance un nivel de Attack
   *  @param {Number} [decayTime]    Tiempo (en segundos) antes de que
   *                                el sobre alcance el nivel de decaimiento / sostenido
   *  @param {Number} [susRatio]    Relación entre attackLevel y releaseLevel, en una escala de 0 a 1,
   *                                dónde 1.0 = attackLevel, 0.0 = releaseLevel.
   *                                El susRatio determina el decayLevel y el nivel al que 
   *                                parte del sobre sostendrá.
   *                                Por ejemplo, si attackLevel es 0.4, releaseLevel es 0,
   *                                y susAmt es 0.5, el decayLevel será 0.2. Si attackLevel 
   *                                incrementa a 1.0 (usando <code>setRange</code>),
   *                                entonces decayLevel aumentaría proporcionalmente, para convertirse en 0.5.
   *  @param {Number} [releaseTime]   Time in seconds from now (defaults to 0)
   *  @example
   *  <div><code>
   *  let attackLevel = 1.0;
   *  let releaseLevel = 0;
   *
   *  let attackTime = 0.001;
   *  let decayTime = 0.2;
   *  let susPercent = 0.2;
   *  let releaseTime = 0.5;
   *
   *  let env, triOsc;
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *
   *    env = new p5.Envelope();
   *    env.setADSR(attackTime, decayTime, susPercent, releaseTime);
   *    env.setRange(attackLevel, releaseLevel);
   *
   *    triOsc = new p5.Oscillator('triangle');
   *    triOsc.amp(env);
   *    triOsc.start();
   *    triOsc.freq(220);
   *
   *    cnv.mousePressed(playEnv);
   *  }
   *
   *  function playEnv()  {
   *    env.play();
   *  }
   *  </code></div>
   */
  p5.Envelope.prototype.setADSR = function (aTime, dTime, sPercent, rTime) {
    this.aTime = aTime;
    this.dTime = dTime || 0;
    // interpolación lineal
    this.sPercent = sPercent || 0;
    this.dLevel = typeof sPercent !== 'undefined' ? sPercent * (this.aLevel - this.rLevel) + this.rLevel : 0;
    this.rTime = rTime || 0;
    // también establece constantes de tiempo para rampa
    this._setRampAD(aTime, dTime);
  };
  /**
   *  Establezca max (attackLevel) y min (releaseLevel) del sobre.
   *
   *  @method  setRange
   *  @param {Number} aLevel attack level (predeterminado a 1)
   *  @param {Number} rLevel release level (predeterminado a 0)
   *  @example - ejemplo
   *  <div><code>
   *  let attackLevel = 1.0;
   *  let releaseLevel = 0;
   *
   *  let attackTime = 0.001;
   *  let decayTime = 0.2;
   *  let susPercent = 0.2;
   *  let releaseTime = 0.5;
   *
   *  let env, triOsc;
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *
   *    textAlign(CENTER);
   *    text('clic para ejecutar', width/2, height/2);
   *
   *    env = new p5.Envelope();
   *    env.setADSR(attackTime, decayTime, susPercent, releaseTime);
   *    env.setRange(attackLevel, releaseLevel);
   *
   *    triOsc = new p5.Oscillator('triangle');
   *    triOsc.amp(env);
   *    triOsc.start();
   *    triOsc.freq(220);
   *
   *    cnv.mousePressed(playEnv);
   *  }
   *
   *  function playEnv()  {
   *    env.play();
   *  }
   *  </code></div>
   */
  p5.Envelope.prototype.setRange = function (aLevel, rLevel) {
    this.aLevel = aLevel || 1;
    this.rLevel = rLevel || 0;
  };
  //  método privado (no documentado) llamado cuando ADSR está configurado para establecer constantes de tiempo para la rampa
  //
  //  Seleccione <a href="https://en.wikipedia.org/wiki/RC_time_constant">
  //  constantes de tiempo </a> para rampas exponenciales simples.
  //  Cuanto mayor sea el valor de la constante de tiempo,
  //  más lenta será la transición.
  //
  //  method  _setRampAD
  //  param {Number} attackTimeConstant  constante de tiempo de ataque
  //  param {Number} decayTimeConstant   constante de tiempo de decaimiento
  //
  p5.Envelope.prototype._setRampAD = function (t1, t2) {
    this._rampAttackTime = this.checkExpInput(t1);
    this._rampDecayTime = this.checkExpInput(t2);
    var TCDenominator = 1;
    /// Cálculo de Aatish Bhatia para la constante de tiempo para el aumento (para ajustar el cálculo de 1/1-e a cualquier porcentaje)
    TCDenominator = Math.log(1 / this.checkExpInput(1 - this._rampHighPercentage));
    this._rampAttackTC = t1 / this.checkExpInput(TCDenominator);
    TCDenominator = Math.log(1 / this._rampLowPercentage);
    this._rampDecayTC = t2 / this.checkExpInput(TCDenominator);
  };
  // método privado
  p5.Envelope.prototype.setRampPercentages = function (p1, p2) {
    //establecer los porcentajes a los que van las rampas exponenciales simples
    this._rampHighPercentage = this.checkExpInput(p1);
    this._rampLowPercentage = this.checkExpInput(p2);
    var TCDenominator = 1;
    //ahora vuelva a calcular las constantes de tiempo en función de esos porcentajes
    /// Cálculo de Aatish Bhatia para la constante de tiempo para el aumento (para ajustar el cálculo de 1/1-e a cualquier porcentaje)
    TCDenominator = Math.log(1 / this.checkExpInput(1 - this._rampHighPercentage));
    this._rampAttackTC = this._rampAttackTime / this.checkExpInput(TCDenominator);
    TCDenominator = Math.log(1 / this._rampLowPercentage);
    this._rampDecayTC = this._rampDecayTime / this.checkExpInput(TCDenominator);
  };
  /**
   *  Asigne un parámetro para que sea controlado por este sobre.
   *  Si se proporciona un objeto p5.Sound, entonces el p5.Envelope
   *  controlará su ganancia de salida. Si se proporcionan varias entradas, el sobre
   *  controlará todas.
   *
   *  @method  setInput
   *  @param  {Object} [...inputs]         Un objeto p5.sound
   *                                Web Audio Param.
   */
  p5.Envelope.prototype.setInput = function () {
    for (var i = 0; i < arguments.length; i++) {
      this.connect(arguments[i]);
    }
  };
  /**
   *  Establezca si la rampa del sobre es lineal (predeterminada) o exponencial.
   *  Las rampas exponenciales pueden ser útiles porque percibimos amplitud
   *  y la frecuencia de forma logarítmica.
   *
   *  @method  setExp
   *  @param {Boolean} isExp Verdadero es exponencial, falso es lineal
   */
  p5.Envelope.prototype.setExp = function (isExp) {
    this.isExponential = isExp;
  };
  //método auxiliar para proteger contra el envío de valores cero a funciones exponenciales
  p5.Envelope.prototype.checkExpInput = function (value) {
    if (value <= 0) {
      value = 1e-8;
    }
    return value;
  };
  /**
   *  Al momento de ejecutar se le dice al sobre que comience a actuar sobre una entrada determinada
   *  Si la entrada es un objeto p5.sound (i.e. AudioIn, Oscillator,
   *  SoundFile), entonces el sobre controlará su volumen de salida. 
   *  Los sobres también se pueden utilizar para controlar cualquier <a href="
   *  http://docs.webplatform.org/wiki/apis/webaudio/AudioParam">
   *  Web Audio Audio Param.</a>
   *
   *  @method  play - ejecutar
   *  @param  {Object} unit         Un objeto p5.sound o
   *                                Web Audio Param.
   *  @param  {Number} [startTime]  tiempo a partir de ahora (en segundos) en el que ejecuta
   *  @param  {Number} [sustainTime] tiempo para sostener antes de soltar el sobre
   *  @example - ejemplo
   *  <div><code>
   *  let attackLevel = 1.0;
   *  let releaseLevel = 0;
   *
   *  let attackTime = 0.001;
   *  let decayTime = 0.2;
   *  let susPercent = 0.2;
   *  let releaseTime = 0.5;
   *
   *  let env, triOsc;
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *
   *    textAlign(CENTER);
   *    text('clic para ejecutar', width/2, height/2);
   *
   *    env = new p5.Envelope();
   *    env.setADSR(attackTime, decayTime, susPercent, releaseTime);
   *    env.setRange(attackLevel, releaseLevel);
   *
   *    triOsc = new p5.Oscillator('triangle');
   *    triOsc.amp(env);
   *    triOsc.start();
   *    triOsc.freq(220);
   *
   *    cnv.mousePressed(playEnv);
   *  }
   *
   *  function playEnv()  {
   *    // activar env en triOsc, 0 segundos a partir de ahora
   *    // Después de deteriorarse, sostenga durante 0,2 segundos antes de soltar
   *    env.play(triOsc, 0, 0.2);
   *  }
   *  </code></div>
   */
  p5.Envelope.prototype.play = function (unit, secondsFromNow, susTime) {
    var tFromNow = secondsFromNow || 0;
    var susTime = susTime || 0;
    if (unit) {
      if (this.connection !== unit) {
        this.connect(unit);
      }
    }
    this.triggerAttack(unit, tFromNow);
    this.triggerRelease(unit, tFromNow + this.aTime + this.dTime + susTime);
  };
  /**
   *  Active la parte Attack y Decay del sobre.
   *  Similar a mantener presionada una tecla en un piano, pero
   *  mantendrá el nivel de sostenido hasta que la suelte. La entrada puede ser
   *  cualquier objeto p5.sound o un <a href="
   *  http://docs.webplatform.org/wiki/apis/webaudio/AudioParam">
   *  Web Audio Param</a>.
   *
   *  @method  triggerAttack
   *  @param  {Object} unit objeto p5.sound o parámetro Audio Web 
   *  @param  {Number} secondsFromNow tiempo a partir de ahora (en segundos)
   *  @example - ejemplo 
   *  <div><code>
   *
   *  let attackLevel = 1.0;
   *  let releaseLevel = 0;
   *
   *  let attackTime = 0.001;
   *  let decayTime = 0.3;
   *  let susPercent = 0.4;
   *  let releaseTime = 0.5;
   *
   *  let env, triOsc;
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    background(200);
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *
   *    env = new p5.Envelope();
   *    env.setADSR(attackTime, decayTime, susPercent, releaseTime);
   *    env.setRange(attackLevel, releaseLevel);
   *
   *    triOsc = new p5.Oscillator('triangle');
   *    triOsc.amp(env);
   *    triOsc.start();
   *    triOsc.freq(220);
   *
   *    cnv.mousePressed(envAttack);
   *  }
   *
   *  function envAttack()  {
   *    console.log('trigger attack');
   *    env.triggerAttack();
   *
   *    background(0,255,0);
   *    text('attack!', width/2, height/2);
   *  }
   *
   *  function mouseReleased() {
   *    env.triggerRelease();
   *
   *    background(200);
   *    text('click to play', width/2, height/2);
   *  }
   *  </code></div>
   */
  p5.Envelope.prototype.triggerAttack = function (unit, secondsFromNow) {
    var now = p5sound.audiocontext.currentTime;
    var tFromNow = secondsFromNow || 0;
    var t = now + tFromNow;
    this.lastAttack = t;
    this.wasTriggered = true;
    if (unit) {
      if (this.connection !== unit) {
        this.connect(unit);
      }
    }
    // obtener y establecer un valor (con rampa lineal) para anclar la automatización
    var valToSet = this.control.getValueAtTime(t);
    if (this.isExponential === true) {
      this.control.exponentialRampToValueAtTime(this.checkExpInput(valToSet), t);
    } else {
      this.control.linearRampToValueAtTime(valToSet, t);
    }
    // después de que se complete cada rampa, cancele los valores programados
    // (para que puedan anularse en caso de que env se haya vuelto a activar)
    // luego, establezca el valor actual (con linearRamp para evitar el clic)
    // luego, programe la siguiente automatización ...
    // attack
    t += this.aTime;
    if (this.isExponential === true) {
      this.control.exponentialRampToValueAtTime(this.checkExpInput(this.aLevel), t);
      valToSet = this.checkExpInput(this.control.getValueAtTime(t));
      this.control.cancelScheduledValues(t);
      this.control.exponentialRampToValueAtTime(valToSet, t);
    } else {
      this.control.linearRampToValueAtTime(this.aLevel, t);
      valToSet = this.control.getValueAtTime(t);
      this.control.cancelScheduledValues(t);
      this.control.linearRampToValueAtTime(valToSet, t);
    }
    // decaimiento a nivel de decaimiento (si usa ADSR, entonces nivel de decaimiento == nivel de sostenimiento)
    t += this.dTime;
    if (this.isExponential === true) {
      this.control.exponentialRampToValueAtTime(this.checkExpInput(this.dLevel), t);
      valToSet = this.checkExpInput(this.control.getValueAtTime(t));
      this.control.cancelScheduledValues(t);
      this.control.exponentialRampToValueAtTime(valToSet, t);
    } else {
      this.control.linearRampToValueAtTime(this.dLevel, t);
      valToSet = this.control.getValueAtTime(t);
      this.control.cancelScheduledValues(t);
      this.control.linearRampToValueAtTime(valToSet, t);
    }
  };
  /**
   *  Activar la liberación del sobre. Esto es similar a soltar la
   *  ecla de un piano y dejar que el sonido se desvanezca según el nivel
   *  de liberación y el tiempo de liberación.
   *
   *  @method  triggerRelease
   *  @param  {Object} unit objeto p5.sound o Web Audio Param
   *  @param  {Number} secondsFromNow es hora de desencadenar el lanzamiento
   *  @example - ejemplo 
   *  <div><code>
   *
   *  let attackLevel = 1.0;
   *  let releaseLevel = 0;
   *
   *  let attackTime = 0.001;
   *  let decayTime = 0.3;
   *  let susPercent = 0.4;
   *  let releaseTime = 0.5;
   *
   *  let env, triOsc;
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    background(200);
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *
   *    env = new p5.Envelope();
   *    env.setADSR(attackTime, decayTime, susPercent, releaseTime);
   *    env.setRange(attackLevel, releaseLevel);
   *
   *    triOsc = new p5.Oscillator('triangle');
   *    triOsc.amp(env);
   *    triOsc.start();
   *    triOsc.freq(220);
   *
   *    cnv.mousePressed(envAttack);
   *  }
   *
   *  function envAttack()  {
   *    console.log('trigger attack');
   *    env.triggerAttack();
   *
   *    background(0,255,0);
   *    text('attack!', width/2, height/2);
   *  }
   *
   *  function mouseReleased() {
   *    env.triggerRelease();
   *
   *    background(200);
   *    text('click to play', width/2, height/2);
   *  }
   *  </code></div>
   */
  p5.Envelope.prototype.triggerRelease = function (unit, secondsFromNow) {
    // solo desencadenar una liberación si se desencadenó un ataque
    if (!this.wasTriggered) {
      // esto actualmente causa un poco de problemas:
      // si se ha programado una versión posterior (a través de la función de reproducción)
      // una nueva versión anterior no la interrumpirá, porque
      // this.wasTriggered ya se ha establecido en falso.
      // Si queremos que se anulen las nuevas versiones anteriores, entonces debemos
      // realizar un seguimiento del tiempo de la última versión y, si la nueva
      // liberación es anterior, utilícela.
      return;
    }
    let now = p5sound.audiocontext.currentTime;
    var tFromNow = secondsFromNow || 0;
    var t = now + tFromNow;
    if (unit) {
      if (this.connection !== unit) {
        this.connect(unit);
      }
    }
    // obtener y establecer un valor (con rampa lineal o exponencial) para anclar la automatización
    var valToSet = this.control.getValueAtTime(t);
    if (this.isExponential === true) {
      this.control.exponentialRampToValueAtTime(this.checkExpInput(valToSet), t);
    } else {
      this.control.linearRampToValueAtTime(valToSet, t);
    }
    // lanzamiento
    t += this.rTime;
    if (this.isExponential === true) {
      this.control.exponentialRampToValueAtTime(this.checkExpInput(this.rLevel), t);
      valToSet = this.checkExpInput(this.control.getValueAtTime(t));
      this.control.cancelScheduledValues(t);
      this.control.exponentialRampToValueAtTime(valToSet, t);
    } else {
      this.control.linearRampToValueAtTime(this.rLevel, t);
      valToSet = this.control.getValueAtTime(t);
      this.control.cancelScheduledValues(t);
      this.control.linearRampToValueAtTime(valToSet, t);
    }
    this.wasTriggered = false;
  };
  /**
   *  Aumente exponencialmente a un valor utilizando los dos primeros
   *  valores de <code><a href="#/p5.Envelope/setADSR">setADSR(attackTime, decayTime)</a></code>
   *  como <a href="https://en.wikipedia.org/wiki/RC_time_constant">
   *  constantes de tiempo</a> para rampas exponenciales simples.
   *  Si el valor es mayor que el valor actual, usa attackTime, mientras que una disminución
   *  usa decayTime.
   *
   *  @method  ramp - rampa
   *  @param  {Object} unit           objeto p5.sound o Web Audio Param
   *  @param  {Number} secondsFromNow Cuándo activar la rampa
   *  @param  {Number} v              Valor objetivo
   *  @param  {Number} [v2]           Segundo valor objetivo (opcional)
   *  @example
   *  <div><code>
   *  let env, osc, amp, cnv;
   *
   *  let attackTime = 0.001;
   *  let decayTime = 0.2;
   *  let attackLevel = 1;
   *  let decayLevel = 0;
   *
   *  function setup() {
   *    cnv = createCanvas(100, 100);
   *    fill(0,255,0);
   *    noStroke();
   *
   *    env = new p5.Envelope();
   *    env.setADSR(attackTime, decayTime);
   *
   *    osc = new p5.Oscillator();
   *    osc.amp(env);
   *    osc.start();
   *
   *    amp = new p5.Amplitude();
   *
   *    cnv.mousePressed(triggerRamp);
   *  }
   *
   *  function triggerRamp() {
   *    env.ramp(osc, 0, attackLevel, decayLevel);
   *  }
   *
   *  function draw() {
   *    background(20,20,20);
   *    text('click me', 10, 20);
   *    let h = map(amp.getLevel(), 0, 0.4, 0, height);;
   *
   *    rect(0, height, width, -h);
   *  }
   *  </code></div>
   */
  p5.Envelope.prototype.ramp = function (unit, secondsFromNow, v1, v2) {
    var now = p5sound.audiocontext.currentTime;
    var tFromNow = secondsFromNow || 0;
    var t = now + tFromNow;
    var destination1 = this.checkExpInput(v1);
    var destination2 = typeof v2 !== 'undefined' ? this.checkExpInput(v2) : undefined;
    // conecte env a la unidad si aún no está conectado
    if (unit) {
      if (this.connection !== unit) {
        this.connect(unit);
      }
    }
    //obtener el valor actual
    var currentVal = this.checkExpInput(this.control.getValueAtTime(t));
    // this.control.cancelScheduledValues(t);
    //si esta subiendo
    if (destination1 > currentVal) {
      this.control.setTargetAtTime(destination1, t, this._rampAttackTC);
      t += this._rampAttackTime;
    } else if (destination1 < currentVal) {
      this.control.setTargetAtTime(destination1, t, this._rampDecayTC);
      t += this._rampDecayTime;
    }
    // Ahora comienza la segunda parte del sobre.
    if (destination2 === undefined)
      return;
    //si esta subiendo
    if (destination2 > destination1) {
      this.control.setTargetAtTime(destination2, t, this._rampAttackTC);
    } else if (destination2 < destination1) {
      this.control.setTargetAtTime(destination2, t, this._rampDecayTC);
    }
  };
  p5.Envelope.prototype.connect = function (unit) {
    this.connection = unit;
    // suponga que estamos hablando de ganancia de salida
    // a menos que se le proporcione un parámetro de audio diferente
    if (unit instanceof p5.Oscillator || unit instanceof p5.SoundFile || unit instanceof p5.AudioIn || unit instanceof p5.Reverb || unit instanceof p5.Noise || unit instanceof p5.Filter || unit instanceof p5.Delay) {
      unit = unit.output.gain;
    }
    if (unit instanceof AudioParam) {
      //establecer el valor inicial
      unit.setValueAtTime(0, p5sound.audiocontext.currentTime);
    }
    if (unit instanceof p5.Signal) {
      unit.setValue(0);
    }
    this.output.connect(unit);
  };
  p5.Envelope.prototype.disconnect = function () {
    if (this.output) {
      this.output.disconnect();
    }
  };
  // Señal Math
  /**
   *  Agregue un valor a la amplitud de salida del p5.Oscillator's 
   *  y devuelva el oscilador. Llamar a este método nuevamente anulará el
   *  add () inicial con nuevos valores.
   *
   *  @method  add  - agregar
   *  @param {Number} number Número constante para agregar
   *  @return {p5.Envelope} Envelope Devuelve este sobre con
   *                                     salida escalada
   */
  p5.Envelope.prototype.add = function (num) {
    var add = new Add(num);
    var thisChain = this.mathOps.length;
    var nextChain = this.output;
    return p5.prototype._mathChain(this, add, thisChain, nextChain, Add);
  };
  /**
   *  Multiplique la salida de amplitud de p5.Envelope's
   *  por un valor fijo. Llamar a este método nuevamente
   *  anulará el mult () inicial con nuevos valores.
   *
   *  @method  mult
   *  @param {Number} number Número constante para multiplicar
   *  @return {p5.Envelope} Envelope Devuelve este sobre con
   *                                     salida escalada
   */
  p5.Envelope.prototype.mult = function (num) {
    var mult = new Mult(num);
    var thisChain = this.mathOps.length;
    var nextChain = this.output;
    return p5.prototype._mathChain(this, mult, thisChain, nextChain, Mult);
  };
  /**
   *  Escale los valores de amplitud de este sobre a un rango
   *  dado y devuelva el sobre. Llamar a este método nuevamente
   *  anulará la escala inicial () con nuevos valores.
   *
   *  @method  scale - escala
   *  @param  {Number} inMin  rango de entrada mínimo
   *  @param  {Number} inMax  rango de entrada máximo
   *  @param  {Number} outMin rango de entrada mínimo
   *  @param  {Number} outMax rango de entrada máximo
   *  @return {p5.Envelope} Envelope Devuelve este sobre con
   *                                     salida escalada
   */
  p5.Envelope.prototype.scale = function (inMin, inMax, outMin, outMax) {
    var scale = new Scale(inMin, inMax, outMin, outMax);
    var thisChain = this.mathOps.length;
    var nextChain = this.output;
    return p5.prototype._mathChain(this, scale, thisChain, nextChain, Scale);
  };
  // deshacerse del oscilador
  p5.Envelope.prototype.dispose = function () {
    // eliminar la referencia de soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    this.disconnect();
    if (this.control) {
      this.control.dispose();
      this.control = null;
    }
    for (var i = 1; i < this.mathOps.length; i++) {
      this.mathOps[i].dispose();
    }
  };
  // Nombre diferente para compatibilidad con versiones anteriores, replica clase p5.Envelope 
  p5.Env = function (t1, l1, t2, l2, t3, l3) {
    console.warn('ADVERTENCIA: p5.Env ahora está en desuso y puede eliminarse en versiones futuras. ' + 'En su lugar, utilice el nuevo p5.Envelope.');
    p5.Envelope.call(this, t1, l1, t2, l2, t3, l3);
  };
  p5.Env.prototype = Object.create(p5.Envelope.prototype);
}(master, Tone_signal_Add, Tone_signal_Multiply, Tone_signal_Scale, Tone_signal_TimelineSignal);
var pulse;
'use strict';
pulse = function () {
  var p5sound = master;
  /**
   *  Crea un objeto Pulse, un oscilador que implementa
   *  la modulación de ancho de pulso.
   *  El pulso se crea con dos osciladores.
   *  Acepta un parámetro de frecuencia y para
   *  establecer el ancho entre los pulsos. Ve <a href="
   *  http://p5js.org/reference/#/p5.Oscillator">
   *  <code>p5.Oscillator</code> para obtener una lista completa de métodos.
   *
   *  @class p5.Pulse
   *  @extends p5.Oscillator
   *  @constructor - contructor
   *  @param {Number} [freq] Frecuencia en oscilaciones por segundo (Hz)
   *  @param {Number} [w]    Ancho entre pulsos (0 a 1.0,
   *                         predeterminado en 0)
   *  @example
   *  <div><code> - ejemplo
   *  let pulse;
   *  function setup() {
   *    background(0);
   *
   *    // Crea e inicia el oscilador de ondas de pulso
   *    pulse = new p5.Pulse();
   *    pulse.amp(0.5);
   *    pulse.freq(220);
   *    pulse.start();
   *  }
   *
   *  function draw() {
   *    let w = map(mouseX, 0, width, 0, 1);
   *    w = constrain(w, 0, 1);
   *    pulse.width(w)
   *  }
   *  </code></div>
   */
  p5.Pulse = function (freq, w) {
    p5.Oscillator.call(this, freq, 'sawtooth');
    // ancho de PWM, debe estar entre 0 y 1.0
    this.w = w || 0;
    // crea un segundo oscilador con frecuencia inversa
    this.osc2 = new p5.SawOsc(freq);
    // crear un nodo de retraso
    this.dNode = p5sound.audiocontext.createDelay();
    // dc offset
    this.dcOffset = createDCOffset();
    this.dcGain = p5sound.audiocontext.createGain();
    this.dcOffset.connect(this.dcGain);
    this.dcGain.connect(this.output);
    // establecer el tiempo de retardo basado en el ancho de PWM
    this.f = freq || 440;
    var mW = this.w / this.oscillator.frequency.value;
    this.dNode.delayTime.value = mW;
    this.dcGain.gain.value = 1.7 * (0.5 - this.w);
    // desconecte el osc2 y conéctelo al retardo, que está conectado a la salida
    this.osc2.disconnect();
    this.osc2.panner.disconnect();
    this.osc2.amp(-1);
    // amplitud invertida
    this.osc2.output.connect(this.dNode);
    this.dNode.connect(this.output);
    this.output.gain.value = 1;
    this.output.connect(this.panner);
  };
  p5.Pulse.prototype = Object.create(p5.Oscillator.prototype);
  /**
   *  Establezca el ancho de un objeto Pulse (un oscilador que implementa Modulación
   *  de ancho de pulso).
   *
   *  @method  width - ancho
   *  @param {Number} [width]    Ancho entre pulsos (0 a 1.0,
   *                         predeterminado a 0)
   */
  p5.Pulse.prototype.width = function (w) {
    if (typeof w === 'number') {
      if (w <= 1 && w >= 0) {
        this.w = w;
        // establecer el tiempo de retardo basado en el ancho de PWM
        // var mW = map(this.w, 0, 1.0, 0, 1/this.f);
        var mW = this.w / this.oscillator.frequency.value;
        this.dNode.delayTime.value = mW;
      }
      this.dcGain.gain.value = 1.7 * (0.5 - this.w);
    } else {
      w.connect(this.dNode.delayTime);
      var sig = new p5.SignalAdd(-0.5);
      sig.setInput(w);
      sig = sig.mult(-1);
      sig = sig.mult(1.7);
      sig.connect(this.dcGain.gain);
    }
  };
  p5.Pulse.prototype.start = function (f, time) {
    var now = p5sound.audiocontext.currentTime;
    var t = time || 0;
    if (!this.started) {
      var freq = f || this.f;
      var type = this.oscillator.type;
      this.oscillator = p5sound.audiocontext.createOscillator();
      this.oscillator.frequency.setValueAtTime(freq, now);
      this.oscillator.type = type;
      this.oscillator.connect(this.output);
      this.oscillator.start(t + now);
      // configurar osc2
      this.osc2.oscillator = p5sound.audiocontext.createOscillator();
      this.osc2.oscillator.frequency.setValueAtTime(freq, t + now);
      this.osc2.oscillator.type = type;
      this.osc2.oscillator.connect(this.osc2.output);
      this.osc2.start(t + now);
      this.freqNode = [
        this.oscillator.frequency,
        this.osc2.oscillator.frequency
      ];
      // también inicio de dcOffset
      this.dcOffset = createDCOffset();
      this.dcOffset.connect(this.dcGain);
      this.dcOffset.start(t + now);
      // si las conexiones LFO dependen de estos osciladores
      if (this.mods !== undefined && this.mods.frequency !== undefined) {
        this.mods.frequency.connect(this.freqNode[0]);
        this.mods.frequency.connect(this.freqNode[1]);
      }
      this.started = true;
      this.osc2.started = true;
    }
  };
  p5.Pulse.prototype.stop = function (time) {
    if (this.started) {
      var t = time || 0;
      var now = p5sound.audiocontext.currentTime;
      this.oscillator.stop(t + now);
      if (this.osc2.oscillator) {
        this.osc2.oscillator.stop(t + now);
      }
      this.dcOffset.stop(t + now);
      this.started = false;
      this.osc2.started = false;
    }
  };
  p5.Pulse.prototype.freq = function (val, rampTime, tFromNow) {
    if (typeof val === 'number') {
      this.f = val;
      var now = p5sound.audiocontext.currentTime;
      var rampTime = rampTime || 0;
      var tFromNow = tFromNow || 0;
      var currentFreq = this.oscillator.frequency.value;
      this.oscillator.frequency.cancelScheduledValues(now);
      this.oscillator.frequency.setValueAtTime(currentFreq, now + tFromNow);
      this.oscillator.frequency.exponentialRampToValueAtTime(val, tFromNow + rampTime + now);
      this.osc2.oscillator.frequency.cancelScheduledValues(now);
      this.osc2.oscillator.frequency.setValueAtTime(currentFreq, now + tFromNow);
      this.osc2.oscillator.frequency.exponentialRampToValueAtTime(val, tFromNow + rampTime + now);
      if (this.freqMod) {
        this.freqMod.output.disconnect();
        this.freqMod = null;
      }
    } else if (val.output) {
      val.output.disconnect();
      val.output.connect(this.oscillator.frequency);
      val.output.connect(this.osc2.oscillator.frequency);
      this.freqMod = val;
    }
  };
  // inspiración: http://webaudiodemos.appspot.com/oscilloscope/
  function createDCOffset() {
    var ac = p5sound.audiocontext;
    var buffer = ac.createBuffer(1, 2048, ac.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < 2048; i++)
      data[i] = 1;
    var bufferSource = ac.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.loop = true;
    return bufferSource;
  }
}(master, oscillator);
var noise;
'use strict';
noise = function () {
  var p5sound = master;
  /**
   *  El ruido es un tipo de oscilador que genera un búfer con valores aleatorios.
   *
   *  @class p5.Noise
   *  @extends p5.Oscillator
   *  @constructor - constructor
   *  @param {String} type El tipo de ruido puede ser 'blanco' (predeterminado),
   *                       'marrón' o 'rosa'.
   */
  p5.Noise = function (type) {
    var assignType;
    p5.Oscillator.call(this);
    delete this.f;
    delete this.freq;
    delete this.oscillator;
    if (type === 'brown') {
      assignType = _brownNoise;
    } else if (type === 'pink') {
      assignType = _pinkNoise;
    } else {
      assignType = _whiteNoise;
    }
    this.buffer = assignType;
  };
  p5.Noise.prototype = Object.create(p5.Oscillator.prototype);
  // generar amortiguadores de ruido
  var _whiteNoise = function () {
    var bufferSize = 2 * p5sound.audiocontext.sampleRate;
    var whiteBuffer = p5sound.audiocontext.createBuffer(1, bufferSize, p5sound.audiocontext.sampleRate);
    var noiseData = whiteBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    whiteBuffer.type = 'white';
    return whiteBuffer;
  }();
  var _pinkNoise = function () {
    var bufferSize = 2 * p5sound.audiocontext.sampleRate;
    var pinkBuffer = p5sound.audiocontext.createBuffer(1, bufferSize, p5sound.audiocontext.sampleRate);
    var noiseData = pinkBuffer.getChannelData(0);
    var b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      noiseData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      noiseData[i] *= 0.11;
      // (aproximadamente) compensar la ganancia
      b6 = white * 0.115926;
    }
    pinkBuffer.type = 'pink';
    return pinkBuffer;
  }();
  var _brownNoise = function () {
    var bufferSize = 2 * p5sound.audiocontext.sampleRate;
    var brownBuffer = p5sound.audiocontext.createBuffer(1, bufferSize, p5sound.audiocontext.sampleRate);
    var noiseData = brownBuffer.getChannelData(0);
    var lastOut = 0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      noiseData[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = noiseData[i];
      noiseData[i] *= 3.5;
    }
    brownBuffer.type = 'brown';
    return brownBuffer;
  }();
  /**
   *  Establezca el tipo de ruido en 'blanco', 'rosa' o 'marrón'.
   *  El blanco es el predeterminado.
   *
   *  @method setType
   *  @param {String} [type] 'blanco', 'rosa' o 'marrón'
   */
  p5.Noise.prototype.setType = function (type) {
    switch (type) {
    case 'white':
      this.buffer = _whiteNoise;
      break;
    case 'pink':
      this.buffer = _pinkNoise;
      break;
    case 'brown':
      this.buffer = _brownNoise;
      break;
    default:
      this.buffer = _whiteNoise;
    }
    if (this.started) {
      var now = p5sound.audiocontext.currentTime;
      this.stop(now);
      this.start(now + 0.01);
    }
  };
  p5.Noise.prototype.getType = function () {
    return this.buffer.type;
  };
  p5.Noise.prototype.start = function () {
    if (this.started) {
      this.stop();
    }
    this.noise = p5sound.audiocontext.createBufferSource();
    this.noise.buffer = this.buffer;
    this.noise.loop = true;
    this.noise.connect(this.output);
    var now = p5sound.audiocontext.currentTime;
    this.noise.start(now);
    this.started = true;
  };
  p5.Noise.prototype.stop = function () {
    var now = p5sound.audiocontext.currentTime;
    if (this.noise) {
      this.noise.stop(now);
      this.started = false;
    }
  };
  p5.Noise.prototype.dispose = function () {
    var now = p5sound.audiocontext.currentTime;
    // eliminar la referencia de soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    if (this.noise) {
      this.noise.disconnect();
      this.stop(now);
    }
    if (this.output) {
      this.output.disconnect();
    }
    if (this.panner) {
      this.panner.disconnect();
    }
    this.output = null;
    this.panner = null;
    this.buffer = null;
    this.noise = null;
  };
}(master);
var audioin;
'use strict';
audioin = function () {
  var p5sound = master;
  // una variedad de fuentes de entrada
  p5sound.inputSources = [];
  /**
   *  <p>Obtenga audio de una entrada, es decir, el micrófono de su computadora.</p>
   *
   *  <p>Encienda / apague el micrófono con los métodos start () y stop (). Cuando el micrófono
   *  está encendido, su volumen se puede medir con getLevel o conectando un
   *  objeto FFT.</p>
   *
   *  <p>Si desea escuchar AudioIn, use el método .connect ().
   *  AudioIn no se conecta a la salida de p5.sound de forma predeterminada para evitar la
   *  reacción.</p>
   *
   *  <p><em>Nota: Esto usa el <a href="http://caniuse.com/stream">getUserMedia/
   *  Stream</a> API, que no es compatible con ciertos navegadores. El acceso en el navegador Chrome
   *  está limitado a localhost y https, pero el acceso a través de http puede ser limitado.</em></p>
   *
   *  @class p5.AudioIn
   *  @constructor - constructor
   *  @param {Function} [errorCallback] Una función para llamar si hay un error al
   *                                    acceder a AudioIn. Por ejemplo, los dispositivos 
   *                                    Safari e iOS no permiten actualmente
   *                                    el acceso al micrófono.
   *  @example - ejemplo
   *  <div><code>
   *  let mic;
   *  function setup(){
   *    mic = new p5.AudioIn()
   *    mic.start();
   *  }
   *  function draw(){
   *    background(0);
   *    micLevel = mic.getLevel();
   *    ellipse(width/2, constrain(height-micLevel*height*5, 0, height), 10, 10);
   *  }
   *  </code></div>
   */
  p5.AudioIn = function (errorCallback) {
    // configurar entrada de audio
    /**
     * @property {GainNode} input - entrada
     */
    this.input = p5sound.audiocontext.createGain();
    /**
     * @property {GainNode} output - salida
     */
    this.output = p5sound.audiocontext.createGain();
    /**
     * @property {MediaStream|null} stream - canal de flujo
     */
    this.stream = null;
    /**
     * @property {MediaStreamAudioSourceNode|null} mediaStream
     */
    this.mediaStream = null;
    /**
     * @property {Number|null} currentSource
     */
    this.currentSource = null;
    /**
     *  El cliente debe permitir que el navegador acceda a su micrófono / fuente de entrada de audio.
     *  Predeterminado: falso. Se hará realidad cuando el cliente habilite el acceso.
     *
     *  @property {Boolean} enabled - activado
     */
    this.enabled = false;
    /**
     * Input amplitude, connect to it by default but not to master out
     *
     *  @property {p5.Amplitude} amplitude - amplitud
     */
    this.amplitude = new p5.Amplitude();
    this.output.connect(this.amplitude.input);
    if (!window.MediaStreamTrack || !window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia) {
      errorCallback ? errorCallback() : window.alert('This browser does not support MediaStreamTrack and mediaDevices');
    }
    // agregar a soundArray para que podamos disponer al cierre
    p5sound.soundArray.push(this);
  };
  /**
   *  Comience a procesar la entrada de audio. Esto permite el uso de otros métodos
   *  AudioIn como getLevel (). Tenga en cuenta que, de forma predeterminada,
   *  AudioIn no está conectado a la salida de p5.sound. Por lo tanto, no escuchará
   *  nada a menos que use el método connect ().<br/>
   *
   *  Algunos navegadores limitan el acceso al micrófono del usuario. Por ejemplo,
   *  Chrome solo permite el acceso desde localhost y a través de https. Por esta razón,
   *  es posible que desees incluir un errorCallback - una función que se llama en caso
   *  de que el navegador no proporcione acceso al micrófono.
   *
   *  @method start - inicio
   *  @param {Function} [successCallback] Nombre de una función para invocar el
   *                                    éxito.
   *  @param {Function} [errorCallback] Nombre de una función para llamar
   *                                    si hubo un error. Por ejemplo,
   *                                    algunos navegadores no admiten
   *                                    getUserMedia.
   */
  p5.AudioIn.prototype.start = function (successCallback, errorCallback) {
    var self = this;
    if (this.stream) {
      this.stop();
    }
    // configurar la fuente de audio
    var audioSource = p5sound.inputSources[self.currentSource];
    var constraints = {
      audio: {
        sampleRate: p5sound.audiocontext.sampleRate,
        echoCancellation: false
      }
    };
    // si los desarrolladores determinan qué fuente usar
    if (p5sound.inputSources[this.currentSource]) {
      constraints.audio.deviceId = audioSource.deviceId;
    }
    window.navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      self.stream = stream;
      self.enabled = true;
      // Envuelva un MediaStreamSourceNode alrededor de la entrada en vivo
      self.mediaStream = p5sound.audiocontext.createMediaStreamSource(stream);
      self.mediaStream.connect(self.output);
      // solo enviar al lector de amplitud, para que podamos verlo pero no escucharlo.
      self.amplitude.setInput(self.output);
      if (successCallback)
        successCallback();
    }).catch(function (err) {
      if (errorCallback)
        errorCallback(err);
      else
        console.error(err);
    });
  };
  /**
   *  Apague AudioIn. Si AudioIn está detenido, no puede getLevel ().
   *  Si reinicia, es posible que se le solicite al usuario permiso de acceso.
   *
   *  @method stop - detener
   */
  p5.AudioIn.prototype.stop = function () {
    if (this.stream) {
      this.stream.getTracks().forEach(function (track) {
        track.stop();
      });
      this.mediaStream.disconnect();
      delete this.mediaStream;
      delete this.stream;
    }
  };
  /**
   *  Conéctese a una unidad de audio. Si no se proporciona ningún parámetro,
   *  se conectará a la salida maestra (es decir, sus altavoces).<br/>
   *
   *  @method  connect - conectar
   *  @param  {Object} [unit] Un objeto que acepta entrada de audio,
   *                          como una FFT
   */
  p5.AudioIn.prototype.connect = function (unit) {
    if (unit) {
      if (unit.hasOwnProperty('input')) {
        this.output.connect(unit.input);
      } else if (unit.hasOwnProperty('analyser')) {
        this.output.connect(unit.analyser);
      } else {
        this.output.connect(unit);
      }
    } else {
      this.output.connect(p5sound.input);
    }
  };
  /**
   *  Desconecte AudioIn de todas las unidades de audio. Por ejemplo, si se
   *  ha llamado a connect(), disconnect() dejará de enviar señal a sus altavoces.
   *  señal a sus altavoces.<br/>
   *
   *  @method  disconnect - desconectar
   */
  p5.AudioIn.prototype.disconnect = function () {
    if (this.output) {
      this.output.disconnect();
      // Manténgase conectado a la amplitud incluso si no está emitiendo a p5
      this.output.connect(this.amplitude.input);
    }
  };
  /**
   *  Lea la amplitud (nivel de volumen) de un AudioIn. La clase AudioIn
   *  contiene su propia instancia de la clase Amplitude para facilitar
   *  la obtención del nivel de volumen de un micrófono. Accepts an
   *  Acepta un valor de suavizado opcional (0.0 <1.0). <em>NOTA: AudioIn debe
   *  .start() antes de usar .getLevel().</em><br/>
   *
   *  @method  getLevel
   *  @param  {Number} [smoothing] El suavizado es 0.0 por defecto.
   *                               Suaviza los valores basados en valores anteriores.
   *  @return {Number}           Nivel de volumen (entre 0.0 y 1.0)
   */
  p5.AudioIn.prototype.getLevel = function (smoothing) {
    if (smoothing) {
      this.amplitude.smoothing = smoothing;
    }
    return this.amplitude.getLevel();
  };
  /**
   *  Establezca la amplitud (volumen) de una entrada de micrófono entre 0 y 1.0. <br/>
   *
   *  @method  amp
   *  @param  {Number} vol entre 0 y 1.0
   *  @param {Number} [time] tiempo de rampa (opcional)
   */
  p5.AudioIn.prototype.amp = function (vol, t) {
    if (t) {
      var rampTime = t || 0;
      var currentVol = this.output.gain.value;
      this.output.gain.cancelScheduledValues(p5sound.audiocontext.currentTime);
      this.output.gain.setValueAtTime(currentVol, p5sound.audiocontext.currentTime);
      this.output.gain.linearRampToValueAtTime(vol, rampTime + p5sound.audiocontext.currentTime);
    } else {
      this.output.gain.cancelScheduledValues(p5sound.audiocontext.currentTime);
      this.output.gain.setValueAtTime(vol, p5sound.audiocontext.currentTime);
    }
  };
  /**
   * Devuelve una lista de fuentes de entrada disponibles. Este es un envoltorio
   * para <a title="MediaDevices.enumerateDevices() - Web APIs | MDN" target="_blank" href=
   *  "https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices"
   *  > y devuelve una Promise.
   *
   * @method  getSources
   * @param  {Function} [successCallback] Esta función de devolución maneja las 
   *                                      fuentes cuando se han enumerado. La función de devolución
   *                                      de llamada recibe la matriz deviceList como su único argumento
   * @param  {Function} [errorCallback] Esta devolución de llamada opcional recibe el mensaje 
   *                                    de error como argumento.
   * @returns {Promise} Devuelve una Promise que se puede usar en lugar de las devoluciones de llamada,
   *                            similar al método enumerateDevices () 	
   * @example - ejemplo 
   *  <div><code>
   *  let audiograb;
   *
   *  function setup(){
   *    //nuevo audioIn
   *    audioGrab = new p5.AudioIn();
   *
   *    audioGrab.getSources(function(deviceList) {
   *      //imprime el conjunto de fuentes disponibles
   *      console.log(deviceList);
   *      //establezca la fuente en el primer elemento de la matriz deviceList
   *      audioGrab.setSource(0);
   *    });
   *  }
   *  </code></div>
   */
  p5.AudioIn.prototype.getSources = function (onSuccess, onError) {
    return new Promise(function (resolve, reject) {
      window.navigator.mediaDevices.enumerateDevices().then(function (devices) {
        p5sound.inputSources = devices.filter(function (device) {
          return device.kind === 'audioinput';
        });
        resolve(p5sound.inputSources);
        if (onSuccess) {
          onSuccess(p5sound.inputSources);
        }
      }).catch(function (error) {
        reject(error);
        if (onError) {
          onError(error);
        } else {
          console.error('This browser does not support MediaStreamTrack.getSources()');
        }
      });
    });
  };
  /**
   *  Configure la fuente de entrada. Acepta un número que representa una
   *  posición en la matriz devuelta por getSources ().
   *  Esto solo está disponible en navegadores que admitan
   *  <a title="MediaDevices.enumerateDevices() - Web APIs | MDN" target="_blank" href=
   *  "https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices"
   *  >navigator.mediaDevices.enumerateDevices()</a>.<br/>
   *
   *  @method setSource
   *  @param {number} num posición de la fuente de entrada en la matriz
   */
  p5.AudioIn.prototype.setSource = function (num) {
    if (p5sound.inputSources.length > 0 && num < p5sound.inputSources.length) {
      // establecer la fuente actual
      this.currentSource = num;
      console.log('set source to ', p5sound.inputSources[this.currentSource]);
    } else {
      console.log('unable to set input source');
    }
    // reiniciar la transmisión si actualmente está activo
    if (this.stream && this.stream.active) {
      this.start();
    }
  };
  // método privado
  p5.AudioIn.prototype.dispose = function () {
    // eliminar la referencia de soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    this.stop();
    if (this.output) {
      this.output.disconnect();
    }
    if (this.amplitude) {
      this.amplitude.disconnect();
    }
    delete this.amplitude;
    delete this.output;
  };
}(master);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Negate;
Tone_signal_Negate = function (Tone) {
  'use strict';
  Tone.Negate = function () {
    this._multiply = this.input = this.output = new Tone.Multiply(-1);
  };
  Tone.extend(Tone.Negate, Tone.SignalBase);
  Tone.Negate.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._multiply.dispose();
    this._multiply = null;
    return this;
  };
  return Tone.Negate;
}(Tone_core_Tone, Tone_signal_Multiply);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Subtract;
Tone_signal_Subtract = function (Tone) {
  'use strict';
  Tone.Subtract = function (value) {
    this.createInsOuts(2, 0);
    this._sum = this.input[0] = this.output = new Tone.Gain();
    this._neg = new Tone.Negate();
    this._param = this.input[1] = new Tone.Signal(value);
    this._param.chain(this._neg, this._sum);
  };
  Tone.extend(Tone.Subtract, Tone.Signal);
  Tone.Subtract.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._neg.dispose();
    this._neg = null;
    this._sum.disconnect();
    this._sum = null;
    this._param.dispose();
    this._param = null;
    return this;
  };
  return Tone.Subtract;
}(Tone_core_Tone, Tone_signal_Add, Tone_signal_Negate, Tone_signal_Signal);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_GreaterThanZero;
Tone_signal_GreaterThanZero = function (Tone) {
  'use strict';
  Tone.GreaterThanZero = function () {
    this._thresh = this.output = new Tone.WaveShaper(function (val) {
      if (val <= 0) {
        return 0;
      } else {
        return 1;
      }
    }, 127);
    this._scale = this.input = new Tone.Multiply(10000);
    this._scale.connect(this._thresh);
  };
  Tone.extend(Tone.GreaterThanZero, Tone.SignalBase);
  Tone.GreaterThanZero.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._scale.dispose();
    this._scale = null;
    this._thresh.dispose();
    this._thresh = null;
    return this;
  };
  return Tone.GreaterThanZero;
}(Tone_core_Tone, Tone_signal_Signal, Tone_signal_Multiply);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_GreaterThan;
Tone_signal_GreaterThan = function (Tone) {
  'use strict';
  Tone.GreaterThan = function (value) {
    this.createInsOuts(2, 0);
    this._param = this.input[0] = new Tone.Subtract(value);
    this.input[1] = this._param.input[1];
    this._gtz = this.output = new Tone.GreaterThanZero();
    this._param.connect(this._gtz);
  };
  Tone.extend(Tone.GreaterThan, Tone.Signal);
  Tone.GreaterThan.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._param.dispose();
    this._param = null;
    this._gtz.dispose();
    this._gtz = null;
    return this;
  };
  return Tone.GreaterThan;
}(Tone_core_Tone, Tone_signal_GreaterThanZero, Tone_signal_Subtract);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Abs;
Tone_signal_Abs = function (Tone) {
  'use strict';
  Tone.Abs = function () {
    this._abs = this.input = this.output = new Tone.WaveShaper(function (val) {
      if (val === 0) {
        return 0;
      } else {
        return Math.abs(val);
      }
    }, 127);
  };
  Tone.extend(Tone.Abs, Tone.SignalBase);
  Tone.Abs.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._abs.dispose();
    this._abs = null;
    return this;
  };
  return Tone.Abs;
}(Tone_core_Tone, Tone_signal_WaveShaper);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Modulo;
Tone_signal_Modulo = function (Tone) {
  'use strict';
  Tone.Modulo = function (modulus) {
    this.createInsOuts(1, 0);
    this._shaper = new Tone.WaveShaper(Math.pow(2, 16));
    this._multiply = new Tone.Multiply();
    this._subtract = this.output = new Tone.Subtract();
    this._modSignal = new Tone.Signal(modulus);
    this.input.fan(this._shaper, this._subtract);
    this._modSignal.connect(this._multiply, 0, 0);
    this._shaper.connect(this._multiply, 0, 1);
    this._multiply.connect(this._subtract, 0, 1);
    this._setWaveShaper(modulus);
  };
  Tone.extend(Tone.Modulo, Tone.SignalBase);
  Tone.Modulo.prototype._setWaveShaper = function (mod) {
    this._shaper.setMap(function (val) {
      var multiple = Math.floor((val + 0.0001) / mod);
      return multiple;
    });
  };
  Object.defineProperty(Tone.Modulo.prototype, 'value', {
    get: function () {
      return this._modSignal.value;
    },
    set: function (mod) {
      this._modSignal.value = mod;
      this._setWaveShaper(mod);
    }
  });
  Tone.Modulo.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._shaper.dispose();
    this._shaper = null;
    this._multiply.dispose();
    this._multiply = null;
    this._subtract.dispose();
    this._subtract = null;
    this._modSignal.dispose();
    this._modSignal = null;
    return this;
  };
  return Tone.Modulo;
}(Tone_core_Tone, Tone_signal_WaveShaper, Tone_signal_Multiply);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Pow;
Tone_signal_Pow = function (Tone) {
  'use strict';
  Tone.Pow = function (exp) {
    this._exp = this.defaultArg(exp, 1);
    this._expScaler = this.input = this.output = new Tone.WaveShaper(this._expFunc(this._exp), 8192);
  };
  Tone.extend(Tone.Pow, Tone.SignalBase);
  Object.defineProperty(Tone.Pow.prototype, 'value', {
    get: function () {
      return this._exp;
    },
    set: function (exp) {
      this._exp = exp;
      this._expScaler.setMap(this._expFunc(this._exp));
    }
  });
  Tone.Pow.prototype._expFunc = function (exp) {
    return function (val) {
      return Math.pow(Math.abs(val), exp);
    };
  };
  Tone.Pow.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._expScaler.dispose();
    this._expScaler = null;
    return this;
  };
  return Tone.Pow;
}(Tone_core_Tone);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_AudioToGain;
Tone_signal_AudioToGain = function (Tone) {
  'use strict';
  Tone.AudioToGain = function () {
    this._norm = this.input = this.output = new Tone.WaveShaper(function (x) {
      return (x + 1) / 2;
    });
  };
  Tone.extend(Tone.AudioToGain, Tone.SignalBase);
  Tone.AudioToGain.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._norm.dispose();
    this._norm = null;
    return this;
  };
  return Tone.AudioToGain;
}(Tone_core_Tone, Tone_signal_WaveShaper);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Expr;
Tone_signal_Expr = function (Tone) {
  'use strict';
  Tone.Expr = function () {
    var expr = this._replacements(Array.prototype.slice.call(arguments));
    var inputCount = this._parseInputs(expr);
    this._nodes = [];
    this.input = new Array(inputCount);
    for (var i = 0; i < inputCount; i++) {
      this.input[i] = this.context.createGain();
    }
    var tree = this._parseTree(expr);
    var result;
    try {
      result = this._eval(tree);
    } catch (e) {
      this._disposeNodes();
      throw new Error('Tone.Expr: Podría evaluar la expresión: ' + expr);
    }
    this.output = result;
  };
  Tone.extend(Tone.Expr, Tone.SignalBase);
  function applyBinary(Constructor, args, self) {
    var op = new Constructor();
    self._eval(args[0]).connect(op, 0, 0);
    self._eval(args[1]).connect(op, 0, 1);
    return op;
  }
  function applyUnary(Constructor, args, self) {
    var op = new Constructor();
    self._eval(args[0]).connect(op, 0, 0);
    return op;
  }
  function getNumber(arg) {
    return arg ? parseFloat(arg) : undefined;
  }
  function literalNumber(arg) {
    return arg && arg.args ? parseFloat(arg.args) : undefined;
  }
  Tone.Expr._Expressions = {
    'value': {
      'signal': {
        regexp: /^\d+\.\d+|^\d+/,
        method: function (arg) {
          var sig = new Tone.Signal(getNumber(arg));
          return sig;
        }
      },
      'input': {
        regexp: /^\$\d/,
        method: function (arg, self) {
          return self.input[getNumber(arg.substr(1))];
        }
      }
    },
    'glue': {
      '(': { regexp: /^\(/ },
      ')': { regexp: /^\)/ },
      ',': { regexp: /^,/ }
    },
    'func': {
      'abs': {
        regexp: /^abs/,
        method: applyUnary.bind(this, Tone.Abs)
      },
      'mod': {
        regexp: /^mod/,
        method: function (args, self) {
          var modulus = literalNumber(args[1]);
          var op = new Tone.Modulo(modulus);
          self._eval(args[0]).connect(op);
          return op;
        }
      },
      'pow': {
        regexp: /^pow/,
        method: function (args, self) {
          var exp = literalNumber(args[1]);
          var op = new Tone.Pow(exp);
          self._eval(args[0]).connect(op);
          return op;
        }
      },
      'a2g': {
        regexp: /^a2g/,
        method: function (args, self) {
          var op = new Tone.AudioToGain();
          self._eval(args[0]).connect(op);
          return op;
        }
      }
    },
    'binary': {
      '+': {
        regexp: /^\+/,
        precedence: 1,
        method: applyBinary.bind(this, Tone.Add)
      },
      '-': {
        regexp: /^\-/,
        precedence: 1,
        method: function (args, self) {
          if (args.length === 1) {
            return applyUnary(Tone.Negate, args, self);
          } else {
            return applyBinary(Tone.Subtract, args, self);
          }
        }
      },
      '*': {
        regexp: /^\*/,
        precedence: 0,
        method: applyBinary.bind(this, Tone.Multiply)
      }
    },
    'unary': {
      '-': {
        regexp: /^\-/,
        method: applyUnary.bind(this, Tone.Negate)
      },
      '!': {
        regexp: /^\!/,
        method: applyUnary.bind(this, Tone.NOT)
      }
    }
  };
  Tone.Expr.prototype._parseInputs = function (expr) {
    var inputArray = expr.match(/\$\d/g);
    var inputMax = 0;
    if (inputArray !== null) {
      for (var i = 0; i < inputArray.length; i++) {
        var inputNum = parseInt(inputArray[i].substr(1)) + 1;
        inputMax = Math.max(inputMax, inputNum);
      }
    }
    return inputMax;
  };
  Tone.Expr.prototype._replacements = function (args) {
    var expr = args.shift();
    for (var i = 0; i < args.length; i++) {
      expr = expr.replace(/\%/i, args[i]);
    }
    return expr;
  };
  Tone.Expr.prototype._tokenize = function (expr) {
    var position = -1;
    var tokens = [];
    while (expr.length > 0) {
      expr = expr.trim();
      var token = getNextToken(expr);
      tokens.push(token);
      expr = expr.substr(token.value.length);
    }
    function getNextToken(expr) {
      for (var type in Tone.Expr._Expressions) {
        var group = Tone.Expr._Expressions[type];
        for (var opName in group) {
          var op = group[opName];
          var reg = op.regexp;
          var match = expr.match(reg);
          if (match !== null) {
            return {
              type: type,
              value: match[0],
              method: op.method
            };
          }
        }
      }
      throw new SyntaxError('Tone.Expr: Token inesperado ' + expr);
    }
    return {
      next: function () {
        return tokens[++position];
      },
      peek: function () {
        return tokens[position + 1];
      }
    };
  };
  Tone.Expr.prototype._parseTree = function (expr) {
    var lexer = this._tokenize(expr);
    var isUndef = this.isUndef.bind(this);
    function matchSyntax(token, syn) {
      return !isUndef(token) && token.type === 'glue' && token.value === syn;
    }
    function matchGroup(token, groupName, prec) {
      var ret = false;
      var group = Tone.Expr._Expressions[groupName];
      if (!isUndef(token)) {
        for (var opName in group) {
          var op = group[opName];
          if (op.regexp.test(token.value)) {
            if (!isUndef(prec)) {
              if (op.precedence === prec) {
                return true;
              }
            } else {
              return true;
            }
          }
        }
      }
      return ret;
    }
    function parseExpression(precedence) {
      if (isUndef(precedence)) {
        precedence = 5;
      }
      var expr;
      if (precedence < 0) {
        expr = parseUnary();
      } else {
        expr = parseExpression(precedence - 1);
      }
      var token = lexer.peek();
      while (matchGroup(token, 'binary', precedence)) {
        token = lexer.next();
        expr = {
          operator: token.value,
          method: token.method,
          args: [
            expr,
            parseExpression(precedence - 1)
          ]
        };
        token = lexer.peek();
      }
      return expr;
    }
    function parseUnary() {
      var token, expr;
      token = lexer.peek();
      if (matchGroup(token, 'unary')) {
        token = lexer.next();
        expr = parseUnary();
        return {
          operator: token.value,
          method: token.method,
          args: [expr]
        };
      }
      return parsePrimary();
    }
    function parsePrimary() {
      var token, expr;
      token = lexer.peek();
      if (isUndef(token)) {
        throw new SyntaxError('Tone.Expr: Terminación inesperada de expresión');
      }
      if (token.type === 'func') {
        token = lexer.next();
        return parseFunctionCall(token);
      }
      if (token.type === 'value') {
        token = lexer.next();
        return {
          method: token.method,
          args: token.value
        };
      }
      if (matchSyntax(token, '(')) {
        lexer.next();
        expr = parseExpression();
        token = lexer.next();
        if (!matchSyntax(token, ')')) {
          throw new SyntaxError('Esperado )');
        }
        return expr;
      }
      throw new SyntaxError('Tone.Expr: Error de análisis, no se puede procesar el token ' + token.value);
    }
    function parseFunctionCall(func) {
      var token, args = [];
      token = lexer.next();
      if (!matchSyntax(token, '(')) {
        throw new SyntaxError('Tone.Expr: Expected ( en una llamada de función "' + func.value + '"');
      }
      token = lexer.peek();
      if (!matchSyntax(token, ')')) {
        args = parseArgumentList();
      }
      token = lexer.next();
      if (!matchSyntax(token, ')')) {
        throw new SyntaxError('Tone.Expr: Expected ) en una llamada de función "' + func.value + '"');
      }
      return {
        method: func.method,
        args: args,
        name: name
      };
    }
    function parseArgumentList() {
      var token, expr, args = [];
      while (true) {
        expr = parseExpression();
        if (isUndef(expr)) {
          break;
        }
        args.push(expr);
        token = lexer.peek();
        if (!matchSyntax(token, ',')) {
          break;
        }
        lexer.next();
      }
      return args;
    }
    return parseExpression();
  };
  Tone.Expr.prototype._eval = function (tree) {
    if (!this.isUndef(tree)) {
      var node = tree.method(tree.args, this);
      this._nodes.push(node);
      return node;
    }
  };
  Tone.Expr.prototype._disposeNodes = function () {
    for (var i = 0; i < this._nodes.length; i++) {
      var node = this._nodes[i];
      if (this.isFunction(node.dispose)) {
        node.dispose();
      } else if (this.isFunction(node.disconnect)) {
        node.disconnect();
      }
      node = null;
      this._nodes[i] = null;
    }
    this._nodes = null;
  };
  Tone.Expr.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._disposeNodes();
  };
  return Tone.Expr;
}(Tone_core_Tone, Tone_signal_Add, Tone_signal_Subtract, Tone_signal_Multiply, Tone_signal_GreaterThan, Tone_signal_GreaterThanZero, Tone_signal_Abs, Tone_signal_Negate, Tone_signal_Modulo, Tone_signal_Pow);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_EqualPowerGain;
Tone_signal_EqualPowerGain = function (Tone) {
  'use strict';
  Tone.EqualPowerGain = function () {
    this._eqPower = this.input = this.output = new Tone.WaveShaper(function (val) {
      if (Math.abs(val) < 0.001) {
        return 0;
      } else {
        return this.equalPowerScale(val);
      }
    }.bind(this), 4096);
  };
  Tone.extend(Tone.EqualPowerGain, Tone.SignalBase);
  Tone.EqualPowerGain.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._eqPower.dispose();
    this._eqPower = null;
    return this;
  };
  return Tone.EqualPowerGain;
}(Tone_core_Tone);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_component_CrossFade;
Tone_component_CrossFade = function (Tone) {
  'use strict';
  Tone.CrossFade = function (initialFade) {
    this.createInsOuts(2, 1);
    this.a = this.input[0] = new Tone.Gain();
    this.b = this.input[1] = new Tone.Gain();
    this.fade = new Tone.Signal(this.defaultArg(initialFade, 0.5), Tone.Type.NormalRange);
    this._equalPowerA = new Tone.EqualPowerGain();
    this._equalPowerB = new Tone.EqualPowerGain();
    this._invert = new Tone.Expr('1 - $0');
    this.a.connect(this.output);
    this.b.connect(this.output);
    this.fade.chain(this._equalPowerB, this.b.gain);
    this.fade.chain(this._invert, this._equalPowerA, this.a.gain);
    this._readOnly('fade');
  };
  Tone.extend(Tone.CrossFade);
  Tone.CrossFade.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._writable('fade');
    this._equalPowerA.dispose();
    this._equalPowerA = null;
    this._equalPowerB.dispose();
    this._equalPowerB = null;
    this.fade.dispose();
    this.fade = null;
    this._invert.dispose();
    this._invert = null;
    this.a.dispose();
    this.a = null;
    this.b.dispose();
    this.b = null;
    return this;
  };
  return Tone.CrossFade;
}(Tone_core_Tone, Tone_signal_Signal, Tone_signal_Expr, Tone_signal_EqualPowerGain);
var effect;
'use strict';
effect = function () {
  var p5sound = master;
  var CrossFade = Tone_component_CrossFade;
  /**
   * Effect es una clase base para efectos de audio en p5. <br>
   * Este módulo maneja los nodos y métodos que son comunes y
   * útiles para efectos actuales y futuros.
   *
   *
   * Esta clase se extiende por <a href="/reference/#/p5.Distortion">p5.Distortion</a>, 
   * <a href="/reference/#/p5.Compressor">p5.Compressor</a>,
   * <a href="/reference/#/p5.Delay">p5.Delay</a>, 
   * <a href="/reference/#/p5.Filter">p5.Filter</a>, 
   * <a href="/reference/#/p5.Reverb">p5.Reverb</a>.
   *
   * @class  p5.Effect
   * @constructor
   * 
   * @param {Object} [ac]   Referencia al contexto de audio del objeto p5
   * @param {AudioNode} [input]  Efecto envolvente del nodo de ganancia
   * @param {AudioNode} [output] Efecto envolvente del nodo de ganancia
   * @param {Object} [_drywet]   Tone.JS CrossFade nodo (el valor predeterminado es: 1)
   * @param {AudioNode} [wet]  Los efectos que amplían esta clase deben conectarse a
   *                              la señal wet a este nodo de ganancia, de modo que
   *                              las señales dry y wet se mezclen correctamente.
   */
  p5.Effect = function () {
    this.ac = p5sound.audiocontext;
    this.input = this.ac.createGain();
    this.output = this.ac.createGain();
    /**
    *	La clase p5.Effect está construida
    * 	using Tone.js CrossFade
    * 	@private
    */
    this._drywet = new CrossFade(1);
    /**
     *	En clases que se extienden
     *	p5.Effect, conectar los nodos de efectos
     *	al parámetro wet
     */
    this.wet = this.ac.createGain();
    this.input.connect(this._drywet.a);
    this.wet.connect(this._drywet.b);
    this._drywet.connect(this.output);
    this.connect();
    //Agregar al soundArray
    p5sound.soundArray.push(this);
  };
  /**
   *  Configure el volumen de salida del filtro.
   *  
   *  @method  amp
   *  @param {Number} [vol] amplitud entre 0 y 1.0
   *  @param {Number} [rampTime] crea un desvanecimiento que dura hasta rampTime
   *  @param {Number} [tFromNow] programar este evento para que suceda en tFromNow segundos
   */
  p5.Effect.prototype.amp = function (vol, rampTime, tFromNow) {
    var rampTime = rampTime || 0;
    var tFromNow = tFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    var currentVol = this.output.gain.value;
    this.output.gain.cancelScheduledValues(now);
    this.output.gain.linearRampToValueAtTime(currentVol, now + tFromNow + 0.001);
    this.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime + 0.001);
  };
  /**
   *	Vincular efectos juntos en una cadena	
   *	Uso de ejemplo: filter.chain(reverb, delay, panner);
   *	Puede usarse con un número de argumentos abierto
   *
   *	@method chain - cadena
     *  @param {Object} [arguments]  Encadena varios objetos de sonido	
   */
  p5.Effect.prototype.chain = function () {
    if (arguments.length > 0) {
      this.connect(arguments[0]);
      for (var i = 1; i < arguments.length; i += 1) {
        arguments[i - 1].connect(arguments[i]);
      }
    }
    return this;
  };
  /**
   *	Ajusta el valor dry/wet.
   *	
   *	@method drywet
   *	@param {Number} [fade] El valor drywet deseado (0 - 1.0)
   */
  p5.Effect.prototype.drywet = function (fade) {
    if (typeof fade !== 'undefined') {
      this._drywet.fade.value = fade;
    }
    return this._drywet.fade.value;
  };
  /**
   *	Envíe la salida a un p5.js-sound, Web Audio Node, o use la señal para
   *	controlar un AudioParam	
   *	
   *	@method connect - conectar
   *	@param {Object} unit - unidad
   */
  p5.Effect.prototype.connect = function (unit) {
    var u = unit || p5.soundOut.input;
    this.output.connect(u.input ? u.input : u);
  };
  /**
   *	Desconecte todas las salidas.
   *	
   *	@method disconnect - desconectar
   */
  p5.Effect.prototype.disconnect = function () {
    if (this.output) {
      this.output.disconnect();
    }
  };
  p5.Effect.prototype.dispose = function () {
    // eliminar la referencia de soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    if (this.input) {
      this.input.disconnect();
      delete this.input;
    }
    if (this.output) {
      this.output.disconnect();
      delete this.output;
    }
    if (this._drywet) {
      this._drywet.disconnect();
      delete this._drywet;
    }
    if (this.wet) {
      this.wet.disconnect();
      delete this.wet;
    }
    this.ac = undefined;
  };
  return p5.Effect;
}(master, Tone_component_CrossFade);
var filter;
'use strict';
filter = function () {
  var p5sound = master;
  var Effect = effect;
  /**
   *  <p>p5.Filter utiliza Web Audio Biquad Filter para filtrar
   *  la respuesta de frecuencia de una fuente de entrada. Subclases
   *  incluidas:</p>
   *  * <a href="/reference/#/p5.LowPass"><code>p5.LowPass</code></a>:
   *  Permite que pasen las frecuencias por debajo de la, frecuencia
   *  de corte y atenúa las frecuencias por encima del corte.<br/>
   *  * <a href="/reference/#/p5.HighPass"><code>p5.HighPass</code></a>:
   *  Lo opuesto a un filtro lowpass. <br/>
   *  * <a href="/reference/#/p5.BandPass"><code>p5.BandPass</code></a>:
   *  Permite el paso de un rango de frecuencias y atenúa
   *  las frecuencias por debajo y por encima de este rango de frecuencias.<br/>
   *
   *  El método <code> .res () </code> controla el ancho del paso
   *  de banda o la resonancia de la frecuencia de corte de paso alto / bajo.
   *
   *  Esta clase se extiende <a href = "/reference/#/p5.Effect">p5.Effect</a>.  
   *  Métodos <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>, 
   *  <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, y
   *  <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> están disponibles.
   *
   *  @class p5.Filter
   *  @extends p5.Effect
   *  @constructor - constructor
   *  @param {String} [type] 'lowpass' (default), 'highpass', 'bandpass'
   *  @example - ejemplo 
   *  <div><code>
   *  let fft, noise, filter;
   *
   *  function setup() {
   *    fill(255, 40, 255);
   *
   *    filter = new p5.BandPass();
   *
   *    noise = new p5.Noise();
   *    // desconectar el ruido sin filtrar,
   *    // y conecte al filtro 
   *    noise.disconnect();
   *    noise.connect(filter);
   *    noise.start();
   *
   *    fft = new p5.FFT();
   *  }
   *
   *  function draw() {
   *    background(30);
   *
   *    // establecer la frecuencia BandPass basada en mouseX
   *    let freq = map(mouseX, 0, width, 20, 10000);
   *    filter.freq(freq);
   *    // dale al filtro una banda estrecha (lower res = wider bandpass)
   *    filter.res(50);
   *
   *    // extraer espectro filtrado
   *    let spectrum = fft.analyze();
   *    noStroke();
   *    for (let i = 0; i < spectrum.length; i++) {
   *      let x = map(i, 0, spectrum.length, 0, width);
   *      let h = -height + map(spectrum[i], 0, 255, height, 0);
   *      rect(x, height, width/spectrum.length, h);
   *    }
   *
   *    isMouseOverCanvas();
   *  }
   *
   *  function isMouseOverCanvas() {
   *    let mX = mouseX, mY = mouseY;
   *    if (mX > 0 && mX < width && mY < height && mY > 0) {
   *      noise.amp(0.5, 0.2);
   *    } else {
   *      noise.amp(0, 0.2);
   *    }
   *  }
   *  </code></div>
   */
  //constructor con herencia
  p5.Filter = function (type) {
    Effect.call(this);
    //agregar efecto de extensión agregando un filtro Biquad
    /**
        *  El p5.Filter está construido con un 
        *  <a href="http://www.w3.org/TR/webaudio/#BiquadFilterNode">
        *  Web Audio BiquadFilter Node</a>.
        *
        *  @property {DelayNode} biquadFilter
     */
    this.biquad = this.ac.createBiquadFilter();
    this.input.connect(this.biquad);
    this.biquad.connect(this.wet);
    if (type) {
      this.setType(type);
    }
    //Propiedades útiles para el método Toggle
    this._on = true;
    this._untoggledType = this.biquad.type;
  };
  p5.Filter.prototype = Object.create(Effect.prototype);
  /**
   *  Filtre una señal de audio de acuerdo con un
   *  conjunto de parámetros de filtro.
   *
   *  @method  process - proceso 
   *  @param  {Object} Signal  Un objeto que emite audio
   *  @param {Number} [freq] Frecuencia en Hz, de 10 a 22050
   *  @param {Number} [res] Resonancia / Ancho de la frecuencia del filtro
   *                        de 0,001 a 1000
   */
  p5.Filter.prototype.process = function (src, freq, res, time) {
    src.connect(this.input);
    this.set(freq, res, time);
  };
  /**
   *  Establezca la frecuencia y la resonancia del filtro.
   *
   *  @method  set - establecer
   *  @param {Number} [freq] Frecuencia en Hz, de 10 a 22050
   *  @param {Number} [res]  Resonancia (Q) de 0.001 a 1000
   *  @param {Number} [timeFromNow] programar este evento para que suceda
   *                                segundos a partir de ahora
   */
  p5.Filter.prototype.set = function (freq, res, time) {
    if (freq) {
      this.freq(freq, time);
    }
    if (res) {
      this.res(res, time);
    }
  };
  /**
   *  Configure la frecuencia del filtro, en Hz, de 10 a 22050 (el rango de
   *  audición humana, aunque en realidad la mayoría de la gente escucha en
   *   un rango más estrecho).
   *
   *  @method  freq
   *  @param  {Number} freq Filtro de la frecuencia
   *  @param {Number} [timeFromNow] programar este evento para que suceda
   *                                segundos a partir de ahora
   *  @return {Number} value - valor  Devuelve el valor de frecuencia actual
   */
  p5.Filter.prototype.freq = function (freq, time) {
    var t = time || 0;
    if (freq <= 0) {
      freq = 1;
    }
    if (typeof freq === 'number') {
      this.biquad.frequency.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.biquad.frequency.exponentialRampToValueAtTime(freq, this.ac.currentTime + 0.02 + t);
    } else if (freq) {
      freq.connect(this.biquad.frequency);
    }
    return this.biquad.frequency.value;
  };
  /**
   *  Controla el ancho de una frecuencia de paso de banda
   *  o la resonancia de una frecuencia de corte de paso alto / bajo.
   *
   *  @method  res
   *  @param {Number} res  Resonancia / Ancho del filtro de la frecuencia
   *                       de 0.001 a 1000
   *  @param {Number} [timeFromNow] programar este evento para que suceda
   *                                segundos a partir de ahora
   *  @return {Number} value - valor Devuelve el valor de res actual
   */
  p5.Filter.prototype.res = function (res, time) {
    var t = time || 0;
    if (typeof res === 'number') {
      this.biquad.Q.value = res;
      this.biquad.Q.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.biquad.Q.linearRampToValueAtTime(res, this.ac.currentTime + 0.02 + t);
    } else if (res) {
      res.connect(this.biquad.Q);
    }
    return this.biquad.Q.value;
  };
  /**
   * Controla el atributo de ganancia de un filtro Biquad.
   * Esto es claramente diferente de .amp () que se hereda de p5.Effect .amp ()
   * controla el volumen a través del nodo de ganancia de salida p5.Filter.gain () controla el
   * parámetro de ganancia de un nodo de filtro Biquad.
   *
   * @method gain - ganancia
   * @param  {Number} gain - gain 
   * @return {Number} Devuelve el valor de ganancia actual o actualizado
   */
  p5.Filter.prototype.gain = function (gain, time) {
    var t = time || 0;
    if (typeof gain === 'number') {
      this.biquad.gain.value = gain;
      this.biquad.gain.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.biquad.gain.linearRampToValueAtTime(gain, this.ac.currentTime + 0.02 + t);
    } else if (gain) {
      gain.connect(this.biquad.gain);
    }
    return this.biquad.gain.value;
  };
  /**
   * Función de alternancia. Cambia entre el tipo especificado y allpass
   *
   * @method toggle
   * @return {boolean} [Toggle value]
   */
  p5.Filter.prototype.toggle = function () {
    this._on = !this._on;
    if (this._on === true) {
      this.biquad.type = this._untoggledType;
    } else if (this._on === false) {
      this.biquad.type = 'allpass';
    }
    return this._on;
  };
  /**
   *  Set the type of a p5.Filter. Possible types include:
   *  "lowpass" (default), "highpass", "bandpass",
   *  "lowshelf", "highshelf", "peaking", "notch",
   *  "allpass".
   *
   *  @method  setType
   *  @param {String} t
   */
  p5.Filter.prototype.setType = function (t) {
    this.biquad.type = t;
    this._untoggledType = this.biquad.type;
  };
  p5.Filter.prototype.dispose = function () {
    // eliminar la referencia de soundArray
    Effect.prototype.dispose.apply(this);
    if (this.biquad) {
      this.biquad.disconnect();
      delete this.biquad;
    }
  };
  /**
   *  Constructor: <code>new p5.LowPass()</code> Filter.
   *  Esto es lo mismo que crear un p5.Filter y
   *  luego llamar a su método <code> setType ('lowpass') </code>.
   *  Ve p5.Filter para más métodos.
   *
   *  @class p5.LowPass
   *  @constructor - constructor
   *  @extends p5.Filter
   */
  p5.LowPass = function () {
    p5.Filter.call(this, 'lowpass');
  };
  p5.LowPass.prototype = Object.create(p5.Filter.prototype);
  /**
   *  Constructor: <code>new p5.HighPass()</code> Filter.
   *  Esto es lo mismo que crear un p5.Filter y luego
   *  llamar a su método <code> setType ('highpass') </code>.
   *  Ve p5.Filter para más métodos.
   *
   *  @class p5.HighPass
   *  @constructor - constructor
   *  @extends p5.Filter
   */
  p5.HighPass = function () {
    p5.Filter.call(this, 'highpass');
  };
  p5.HighPass.prototype = Object.create(p5.Filter.prototype);
  /**
   *  Constructor: <code>new p5.BandPass()</code> Filter.
   *  Esto es lo mismo que crear un p5.Filter y luego
   *  llamar a su método <code> setType ('bandpass') </code>.
   *  Ve p5.Filter para más métodos.
   *
   *  @class p5.BandPass
   *  @constructor - constructor
   *  @extends p5.Filter
   */
  p5.BandPass = function () {
    p5.Filter.call(this, 'bandpass');
  };
  p5.BandPass.prototype = Object.create(p5.Filter.prototype);
  return p5.Filter;
}(master, effect);
var src_eqFilter;
'use strict';
src_eqFilter = function () {
  var Filter = filter;
  var p5sound = master;
  /**
   *  EQFilter extiende p5.Filter con las restricciones
   *  necesarias para p5.EQ
   *
   *  @private - privado 
   */
  var EQFilter = function (freq, res) {
    Filter.call(this, 'peaking');
    this.disconnect();
    this.set(freq, res);
    this.biquad.gain.value = 0;
    delete this.input;
    delete this.output;
    delete this._drywet;
    delete this.wet;
  };
  EQFilter.prototype = Object.create(Filter.prototype);
  EQFilter.prototype.amp = function () {
    console.warn('`amp()` is not available for p5.EQ bands. Use `.gain()`');
  };
  EQFilter.prototype.drywet = function () {
    console.warn('`drywet()` is not available for p5.EQ bands.');
  };
  EQFilter.prototype.connect = function (unit) {
    var u = unit || p5.soundOut.input;
    if (this.biquad) {
      this.biquad.connect(u.input ? u.input : u);
    } else {
      this.output.connect(u.input ? u.input : u);
    }
  };
  EQFilter.prototype.disconnect = function () {
    if (this.biquad) {
      this.biquad.disconnect();
    }
  };
  EQFilter.prototype.dispose = function () {
    // eliminar la referencia de soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    this.disconnect();
    delete this.biquad;
  };
  return EQFilter;
}(filter, master);
var eq;
'use strict';
eq = function () {
  var Effect = effect;
  var EQFilter = src_eqFilter;
  /**
   * p5.EQ es un efecto de audio que realiza la función de un ecualizador
   * de audio multibanda. La ecualización se utiliza para ajustar el equilibrio de los
   * componentes de frecuencia de una señal de audio. Este proceso se usa comúnmente en la producción
   * y grabación de sonido para cambiar la forma de onda antes de que llegue a un dispositivo
   * de salida de sonido. El ecualizador también se puede utilizar como un efecto de audio para crear
   * distorsiones interesantes al filtrar partes del espectro. p5.EQ esta construida
   * usando una cadena de nodos de filtro Biquad de Web Audio y se puede
   * instanciar con 3 u 8 bandas. Las bandas se pueden agregar o eliminar del EQ modificando
   * directamente p5.EQ.bands (la matriz que almacena los filtros).
   *
   * Esta clase se extiende <a href = "/reference/#/p5.Effect">p5.Effect</a>.
   * Métodos <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>,
   * <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, y
   * <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> are available.
   *
   * @class p5.EQ
   * @constructor - constructor
   * @extends p5.Effect
   * @param {Number} [_eqsize] La constructora aceptará 3 u 8, el valor predeterminado es 3
   * @return {Object} p5.EQ object - objeto
   *
   * @example - ejemplo 
   * <div><code>
   * let eq;
   * let band_names;
   * let band_index;
   *
   * let soundFile, play;
   *
   * function preload() {
   *   soundFormats('mp3', 'ogg');
   *   soundFile = loadSound('assets/beat');
   * }
   *
   * function setup() {
   *   eq = new p5.EQ(3);
   *   soundFile.disconnect();
   *   eq.process(soundFile);
   *
   *   band_names = ['lows','mids','highs'];
   *   band_index = 0;
   *   play = false;
   *   textAlign(CENTER);
   * }
   *
   * function draw() {
   *   background(30);
   *   noStroke();
   *   fill(255);
   *   text('clic para destruir',50,25);
   *
   *   fill(255, 40, 255);
   *   textSize(26);
   *   text(band_names[band_index],50,55);
   *
   *   fill(255);
   *   textSize(9);
   *   text('espacio = reproducir/pausar',50,80);
   * }
   *
   * //Si el mouse está sobre el lienzo, pase a la siguiente banda y elimine la frecuencia
   * function mouseClicked() {
   *   for (let i = 0; i < eq.bands.length; i++) {
   *     eq.bands[i].gain(0);
   *   }
   *   eq.bands[band_index].gain(-40);
   *   if (mouseX > 0 && mouseX < width && mouseY < height && mouseY > 0) {
   *     band_index === 2 ? band_index = 0 : band_index++;
   *   }
   * }
   * 
   * //use la barra espaciadora para activar la reproducción / pausa
   * function keyPressed() {
   *   if (key===' ') {
   *     play = !play
   *     play ? soundFile.loop() : soundFile.pause();
   *   }
   * }
   * </code></div>
   */
  p5.EQ = function (_eqsize) {
    Effect.call(this);
    //p5.EQ can be of size (3) or (8), defaults to 3
    _eqsize = _eqsize === 3 || _eqsize === 8 ? _eqsize : 3;
    var factor;
    _eqsize === 3 ? factor = Math.pow(2, 3) : factor = 2;
    /**
      *  El p5.EQ está construido con objetos p5.Filter abstractos.
      *  Para modificar cualquier banda, utilice los métodos de <a 
      *  href="/reference/#/p5.Filter" title="p5.Filter reference">
      *  p5.Filter</a> API, especialmente 'ganancia' y 'frecuencia'.
      *  Las bandas se almacenan en una matriz, con índices de 0 a 3 o de 0 a 7.
      *  @property {Array}  bands - bandas
      *
    */
    this.bands = [];
    var freq, res;
    for (var i = 0; i < _eqsize; i++) {
      if (i === _eqsize - 1) {
        freq = 21000;
        res = 0.01;
      } else if (i === 0) {
        freq = 100;
        res = 0.1;
      } else if (i === 1) {
        freq = _eqsize === 3 ? 360 * factor : 360;
        res = 1;
      } else {
        freq = this.bands[i - 1].freq() * factor;
        res = 1;
      }
      this.bands[i] = this._newBand(freq, res);
      if (i > 0) {
        this.bands[i - 1].connect(this.bands[i].biquad);
      } else {
        this.input.connect(this.bands[i].biquad);
      }
    }
    this.bands[_eqsize - 1].connect(this.output);
  };
  p5.EQ.prototype = Object.create(Effect.prototype);
  /**
   * Procese una entrada conectándola al EQ
   * @method  process - proceso
   * @param  {Object} src Audio source - Fuente de audio
   */
  p5.EQ.prototype.process = function (src) {
    src.connect(this.input);
  };
  //  /**
  //   * Establezca la frecuencia y la ganancia de cada banda en el EQ. Este método debe llamarse con 3 u 8
  //   * pares de frecuencia y ganancia, dependiendo del tamaño del ecualizador.
  //   * ex. eq.set(freq0, gain0, freq1, gain1, freq2, gain2);
  //   *
  //   * @method  set - ajustar
  //   * @param {Number} [freq0] Valor de frecuencia para banda con índice 0
  //   * @param {Number} [gain0] Valor de ganancia para banda con índice 0
  //   * @param {Number} [freq1] Valor de frecuencia para banda con índice 1
  //   * @param {Number} [gain1] Valor de ganancia para la banda con índice 1
  //   * @param {Number} [freq2] Valor de frecuencia para banda con índice 2
  //   * @param {Number} [gain2] Valor de ganancia para la banda con índice 2
  //   * @param {Number} [freq3] Valor de frecuencia para banda con índice 3
  //   * @param {Number} [gain3] Valor de ganancia para la banda con índice 3
  //   * @param {Number} [freq4] Valor de frecuencia para banda con índice 4
  //   * @param {Number} [gain4] Valor de ganancia para la banda con índice 4
  //   * @param {Number} [freq5] Valor de frecuencia para banda con índice 5
  //   * @param {Number} [gain5] Valor de ganancia para banda con índice 5
  //   * @param {Number} [freq6] Valor de frecuencia para banda con índice 6
  //   * @param {Number} [gain6] Valor de ganancia para banda con índice 6
  //   * @param {Number} [freq7] Valor de frecuencia para banda con índice 7
  //   * @param {Number} [gain7] Valor de ganancia para la banda con índice 7
  //   */
  p5.EQ.prototype.set = function () {
    if (arguments.length === this.bands.length * 2) {
      for (var i = 0; i < arguments.length; i += 2) {
        this.bands[i / 2].freq(arguments[i]);
        this.bands[i / 2].gain(arguments[i + 1]);
      }
    } else {
      console.error('Argument mismatch. .set() should be called with ' + this.bands.length * 2 + ' arguments. (one frequency and gain value pair for each band of the eq)');
    }
  };
  /**
   * Agrega una nueva banda. Crea un p5.Filter y elimina todo menos el filtro biquad
   * sin procesar. Este método devuelve un p5.Filter abstraído,
   * que se puede agregar a p5.EQ.bands, para crear nuevas bandas de EQ.
   * @private - privado
   * @method  _newBand
   * @param  {Number} freq
   * @param  {Number} res
   * @return {Object}      Filtro abstraído
   */
  p5.EQ.prototype._newBand = function (freq, res) {
    return new EQFilter(freq, res);
  };
  p5.EQ.prototype.dispose = function () {
    Effect.prototype.dispose.apply(this);
    if (this.bands) {
      while (this.bands.length > 0) {
        delete this.bands.pop().dispose();
      }
      delete this.bands;
    }
  };
  return p5.EQ;
}(effect, src_eqFilter);
var panner3d;
'use strict';
panner3d = function () {
  var p5sound = master;
  var Effect = effect;
  /**
   * Panner3D se basa en el <a title="Web Audio Panner docs"  href=
   * "https://developer.mozilla.org/en-US/docs/Web/API/PannerNode">
   * Web Audio Spatial Panner Node</a>.
   * Este panoramizador es un nodo de procesamiento espacial que permite posicionar
   * y orientar el audio en el espacio 3D.
   *
   * La posición es relativa a un <a title="Web Audio Listener docs" href=
   * "https://developer.mozilla.org/en-US/docs/Web/API/AudioListener">
   * Audio Context Listener</a>, al cual se puede acceder
   * por <code>p5.soundOut.audiocontext.listener</code>
   *
   *
   * @class p5.Panner3D
   * @constructor - constructor
   */
  p5.Panner3D = function () {
    Effect.call(this);
    /**
     *  <a title="Web Audio Panner docs"  href=
     *  "https://developer.mozilla.org/en-US/docs/Web/API/PannerNode">
     *  Web Audio Spatial Panner Node</a>
     *
     *  Las propiedades incluyen
     *    -  <a title="w3 spec for Panning Model"
     *    href="https://www.w3.org/TR/webaudio/#idl-def-PanningModelType"
     *    >panningModel</a>: "equal power" or "HRTF"
     *    -  <a title="w3 spec for Distance Model"
     *    href="https://www.w3.org/TR/webaudio/#idl-def-DistanceModelType"
     *    >distanceModel</a>: "linear", "inverse", or "exponential"
     *
     *  @property {AudioNode} panner
     *
     */
    this.panner = this.ac.createPanner();
    this.panner.panningModel = 'HRTF';
    this.panner.distanceModel = 'linear';
    this.panner.connect(this.output);
    this.input.connect(this.panner);
  };
  p5.Panner3D.prototype = Object.create(Effect.prototype);
  /**
   * Conectar una fuente de audio
   *
   * @method  process - proceso
   * @param  {Object} src Fuente de entrada
   */
  p5.Panner3D.prototype.process = function (src) {
    src.connect(this.input);
  };
  /**
   * Establecer la posición X, Y, Z del panorámico
   * @method set - establecer
   * @param  {Number} xVal
   * @param  {Number} yVal
   * @param  {Number} zVal
   * @param  {Number} time - tiempo
   * @return {Array}      Se actualizaron los valores x, y, z como una matriz
   */
  p5.Panner3D.prototype.set = function (xVal, yVal, zVal, time) {
    this.positionX(xVal, time);
    this.positionY(yVal, time);
    this.positionZ(zVal, time);
    return [
      this.panner.positionX.value,
      this.panner.positionY.value,
      this.panner.positionZ.value
    ];
  };
  /**
   * Métodos getter y setter para coordenadas de posición
   * @method positionX
   * @return {Number}      valor de coordenadas actualizado
   */
  /**
   * Métodos getter y setter para coordenadas de posición
   * @method positionY
   * @return {Number}      valor de coordenadas actualizado
   */
  /**
   * Métodos getter y setter para coordenadas de posición
   * @method positionZ
   * @return {Number}      valor de coordenadas actualizado
   */
  p5.Panner3D.prototype.positionX = function (xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.panner.positionX.value = xVal;
      this.panner.positionX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.positionX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.panner.positionX);
    }
    return this.panner.positionX.value;
  };
  p5.Panner3D.prototype.positionY = function (yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.panner.positionY.value = yVal;
      this.panner.positionY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.positionY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connect(this.panner.positionY);
    }
    return this.panner.positionY.value;
  };
  p5.Panner3D.prototype.positionZ = function (zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.panner.positionZ.value = zVal;
      this.panner.positionZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.positionZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connect(this.panner.positionZ);
    }
    return this.panner.positionZ.value;
  };
  /**
   * Establecer la posición X, Y, Z del panorámico
   * @method  orient
   * @param  {Number} xVal
   * @param  {Number} yVal
   * @param  {Number} zVal
   * @param  {Number} time - tiempo
   * @return {Array}      Se actualizaron los valores x, y, z como una matriz
   */
  p5.Panner3D.prototype.orient = function (xVal, yVal, zVal, time) {
    this.orientX(xVal, time);
    this.orientY(yVal, time);
    this.orientZ(zVal, time);
    return [
      this.panner.orientationX.value,
      this.panner.orientationY.value,
      this.panner.orientationZ.value
    ];
  };
  /**
   * Métodos getter y setter para orientar coordenadas
   * @method orientX
   * @return {Number}      valor de coordenadas actualizado
   */
  /**
   * Métodos getter y setter para orientar coordenadas
   * @method orientY
   * @return {Number}      valor de coordenadas actualizado
   */
  /**
   * Métodos getter y setter para orientar coordenadas
   * @method orientZ
   * @return {Number}      valor de coordenadas actualizado
   */
  p5.Panner3D.prototype.orientX = function (xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.panner.orientationX.value = xVal;
      this.panner.orientationX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.orientationX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.panner.orientationX);
    }
    return this.panner.orientationX.value;
  };
  p5.Panner3D.prototype.orientY = function (yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.panner.orientationY.value = yVal;
      this.panner.orientationY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.orientationY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connect(this.panner.orientationY);
    }
    return this.panner.orientationY.value;
  };
  p5.Panner3D.prototype.orientZ = function (zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.panner.orientationZ.value = zVal;
      this.panner.orientationZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.orientationZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connect(this.panner.orientationZ);
    }
    return this.panner.orientationZ.value;
  };
  /**
   * Establecer el rolloff y la distancia máxima
   * @method  setFalloff
   * @param {Number} [maxDistance]
   * @param {Number} [rolloffFactor]
   */
  p5.Panner3D.prototype.setFalloff = function (maxDistance, rolloffFactor) {
    this.maxDist(maxDistance);
    this.rolloff(rolloffFactor);
  };
  /**
   * Distancia máxima entre la fuente y el oyente
   * @method  maxDist
   * @param  {Number} maxDistance
   * @return {Number} valor actualizado
   */
  p5.Panner3D.prototype.maxDist = function (maxDistance) {
    if (typeof maxDistance === 'number') {
      this.panner.maxDistance = maxDistance;
    }
    return this.panner.maxDistance;
  };
  /**
   * Qué tan rápido se reduce el volumen a medida que la fuente se aleja del oyente
   * @method  rollof
   * @param  {Number} rolloffFactor
   * @return {Number} valor actualizado
   */
  p5.Panner3D.prototype.rolloff = function (rolloffFactor) {
    if (typeof rolloffFactor === 'number') {
      this.panner.rolloffFactor = rolloffFactor;
    }
    return this.panner.rolloffFactor;
  };
  p5.Panner3D.dispose = function () {
    Effect.prototype.dispose.apply(this);
    if (this.panner) {
      this.panner.disconnect();
      delete this.panner;
    }
  };
  return p5.Panner3D;
}(master, effect);
var listener3d;
'use strict';
listener3d = function () {
  var p5sound = master;
  var Effect = effect;
  //  /**
  //   * listener es una clase que puede construir tanto un Spatial Panner 
  //   * como un Spatial Listener. El panner se basa en el
  //   * Web Audio Spatial Panner Node
  //   * https://www.w3.org/TR/webaudio/#the-listenernode-interface
  //   * Este panoramizador es un nodo de procesamiento espacial que permite posicionar
  //   * y orientar el audio en el espacio 3D.
  //   *
  //   * El oyente modifica las propiedades del Audiocontext Listener.
  //   * Ambos tipos de objetos utilizan los mismos métodos. El valor predeterminado es un panoramizador espacial.
  //   *
  //   * <code>p5.Panner3D</code> - Construye un panorámico espacial<br/>
  //   * <code>p5.Listener3D</code> - Construye un escucha espacial<br/>
  //   *
  //   * @class listener - oyente
  //   * @constructor - constructor
  //   * @return {Object} p5.Listener3D Object
  //   *
  //   * @param {Web Audio Node} listener Web Audio Spatial Panning Node
  //   * @param {AudioParam} listener.panningModel "equal power" o "HRTF"
  //   * @param {AudioParam} listener.distanceModel "linear", "inverse", or "exponential"
  //   * @param {String} [type] [Especificar la construcción de un panoramizador u oyente espacial]
  //   */
  p5.Listener3D = function (type) {
    this.ac = p5sound.audiocontext;
    this.listener = this.ac.listener;
  };
  //  /**
  //   * Conectar una fuente de audio
  //   * @param  {Object} src Fuente de entrada
  //   */
  p5.Listener3D.prototype.process = function (src) {
    src.connect(this.input);
  };
  //  /**
  //   * Establecer la posición X, Y, Z del panorámico
  //   * @param  {[Number]} xVal
  //   * @param  {[Number]} yVal
  //   * @param  {[Number]} zVal
  //   * @param  {[Number]} time
  //   * @return {[Array]}      [Se actualizaron los valores x, y, z como una matriz]
  //   */
  p5.Listener3D.prototype.position = function (xVal, yVal, zVal, time) {
    this.positionX(xVal, time);
    this.positionY(yVal, time);
    this.positionZ(zVal, time);
    return [
      this.listener.positionX.value,
      this.listener.positionY.value,
      this.listener.positionZ.value
    ];
  };
  //  /**
  //   * Métodos getter y setter para coordenadas de posición
  //   * @return {Number}      [valor de coordenadas actualizado]
  //   */
  p5.Listener3D.prototype.positionX = function (xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.listener.positionX.value = xVal;
      this.listener.positionX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.positionX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.listener.positionX);
    }
    return this.listener.positionX.value;
  };
  p5.Listener3D.prototype.positionY = function (yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.listener.positionY.value = yVal;
      this.listener.positionY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.positionY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connect(this.listener.positionY);
    }
    return this.listener.positionY.value;
  };
  p5.Listener3D.prototype.positionZ = function (zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.listener.positionZ.value = zVal;
      this.listener.positionZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.positionZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connect(this.listener.positionZ);
    }
    return this.listener.positionZ.value;
  };
  // no se puede definir el método cuando se comenta la definición de clase
  //  /**
  //   * Anula el método listener orient () porque Listener tiene parámetros
  //   * ligeramente diferentes. En términos humanos, los vectores de avance son la dirección en la que
  //   * apunta el ruido. Los vectores ascendentes son la dirección de la parte superior de la cabeza.
  //   *
  //   * @method orient - orientar
  //   * @param  {Number} xValF  Dirección X del vector hacia adelante
  //   * @param  {Number} yValF  Dirección Y del vector hacia adelante
  //   * @param  {Number} zValF  Dirección Z del vector hacia adelante
  //   * @param  {Number} xValU  Dirección X hacia arriba del vector
  //   * @param  {Number} yValU  Dirección Y del vector hacia arriba
  //   * @param  {Number} zValU  Dirección Z del vector hacia arriba
  //   * @param  {Number} time  - tiempo
  //   * @return {Array}       Todos los parámetros de orientación
  //   */
  p5.Listener3D.prototype.orient = function (xValF, yValF, zValF, xValU, yValU, zValU, time) {
    if (arguments.length === 3 || arguments.length === 4) {
      time = arguments[3];
      this.orientForward(xValF, yValF, zValF, time);
    } else if (arguments.length === 6 || arguments === 7) {
      this.orientForward(xValF, yValF, zValF);
      this.orientUp(xValU, yValU, zValU, time);
    }
    return [
      this.listener.forwardX.value,
      this.listener.forwardY.value,
      this.listener.forwardZ.value,
      this.listener.upX.value,
      this.listener.upY.value,
      this.listener.upZ.value
    ];
  };
  p5.Listener3D.prototype.orientForward = function (xValF, yValF, zValF, time) {
    this.forwardX(xValF, time);
    this.forwardY(yValF, time);
    this.forwardZ(zValF, time);
    return [
      this.listener.forwardX,
      this.listener.forwardY,
      this.listener.forwardZ
    ];
  };
  p5.Listener3D.prototype.orientUp = function (xValU, yValU, zValU, time) {
    this.upX(xValU, time);
    this.upY(yValU, time);
    this.upZ(zValU, time);
    return [
      this.listener.upX,
      this.listener.upY,
      this.listener.upZ
    ];
  };
  //  /**
  //   * Métodos getter y setter para orientar coordenadas
  //   * @return {Number}      [valor de coordenadas actualizado]
  //   */
  p5.Listener3D.prototype.forwardX = function (xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.listener.forwardX.value = xVal;
      this.listener.forwardX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.forwardX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.listener.forwardX);
    }
    return this.listener.forwardX.value;
  };
  p5.Listener3D.prototype.forwardY = function (yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.listener.forwardY.value = yVal;
      this.listener.forwardY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.forwardY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connect(this.listener.forwardY);
    }
    return this.listener.forwardY.value;
  };
  p5.Listener3D.prototype.forwardZ = function (zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.listener.forwardZ.value = zVal;
      this.listener.forwardZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.forwardZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connect(this.listener.forwardZ);
    }
    return this.listener.forwardZ.value;
  };
  p5.Listener3D.prototype.upX = function (xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.listener.upX.value = xVal;
      this.listener.upX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.upX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.listener.upX);
    }
    return this.listener.upX.value;
  };
  p5.Listener3D.prototype.upY = function (yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.listener.upY.value = yVal;
      this.listener.upY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.upY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connect(this.listener.upY);
    }
    return this.listener.upY.value;
  };
  p5.Listener3D.prototype.upZ = function (zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.listener.upZ.value = zVal;
      this.listener.upZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.upZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connect(this.listener.upZ);
    }
    return this.listener.upZ.value;
  };
  return p5.Listener3D;
}(master, effect);
var delay;
'use strict';
delay = function () {
  var Filter = filter;
  var Effect = effect;
  /**
   *  El retraso es un efecto de eco. Procesa una fuente de sonido existente y
   *  emite una versión retardada de ese sonido. El p5.Delay puede producir
   *  diferentes efectos según el delayTime, la retroalimentación,
   *  el filtro y el tipo. En el siguiente ejemplo, una retroalimentación de 0.5
   *  (el valor predeterminado) producirá un retardo de bucle que disminuye
   *  el volumen en un 50% cada repetición. Un filtro cortará las frecuencias altas para que
   *  el retardo no suene tan penetrante como la
   *  fuente original.
   *
   *
   *  Esta clase se extiende <a href = "/reference/#/p5.Effect">p5.Effect</a>.
   *  Métodos <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>,
   *  <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, y
   *  <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> están disponibles.
   *  @class p5.Delay
   *  @extends p5.Effect
   *  @constructor - constructor
   *  @example - ejemplo 
   *  <div><code>
   *  let noise, env, delay;
   *
   *  function setup() {
   *    background(0);
   *    noStroke();
   *    fill(255);
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *
   *    noise = new p5.Noise('brown');
   *    noise.amp(0);
   *    noise.start();
   *
   *    delay = new p5.Delay();
   *
   *    // delay.process() acepta 4 parámetros:
   *    // Fuente, delayTime, feedback, filtro de frecuencia
   *    // play with these numbers!!
   *    delay.process(noise, .12, .7, 2300);
   *
   *    // reproducir el ruido con un sobre
   *    // una serie de desvanecimientos (pares de tiempo / valor)
   *    env = new p5.Envelope(.01, 0.2, .2, .1);
   *  }
   *
   *  // mouseClick desencadena el sobre
   *  function mouseClicked() {
   *    // ¿Está el ratón sobre el lienzo?
   *    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
   *      env.play(noise);
   *    }
   *  }
   *  </code></div>
   */
  p5.Delay = function () {
    Effect.call(this);
    this._split = this.ac.createChannelSplitter(2);
    this._merge = this.ac.createChannelMerger(2);
    this._leftGain = this.ac.createGain();
    this._rightGain = this.ac.createGain();
    /**
     *  El p5.Delay está construido con dos
     *  <a href="http://www.w3.org/TR/webaudio/#DelayNode">
     *  Web Audio Delay Nodes</a>, uno para cada canal estéreo.
     *
     *  @property {DelayNode} leftDelay
     */
    this.leftDelay = this.ac.createDelay();
    /**
     *  El p5.Delay está construido con dos
     *  <a href="http://www.w3.org/TR/webaudio/#DelayNode">
     *  Web Audio Delay Nodes</a>, uno para cada canal estéreo.
     *
     *  @property {DelayNode} rightDelay
     */
    this.rightDelay = this.ac.createDelay();
    this._leftFilter = new Filter();
    this._rightFilter = new Filter();
    this._leftFilter.disconnect();
    this._rightFilter.disconnect();
    this._leftFilter.biquad.frequency.setValueAtTime(1200, this.ac.currentTime);
    this._rightFilter.biquad.frequency.setValueAtTime(1200, this.ac.currentTime);
    this._leftFilter.biquad.Q.setValueAtTime(0.3, this.ac.currentTime);
    this._rightFilter.biquad.Q.setValueAtTime(0.3, this.ac.currentTime);
    // graph routing
    this.input.connect(this._split);
    this.leftDelay.connect(this._leftGain);
    this.rightDelay.connect(this._rightGain);
    this._leftGain.connect(this._leftFilter.input);
    this._rightGain.connect(this._rightFilter.input);
    this._merge.connect(this.wet);
    this._leftFilter.biquad.gain.setValueAtTime(1, this.ac.currentTime);
    this._rightFilter.biquad.gain.setValueAtTime(1, this.ac.currentTime);
    // default routing
    this.setType(0);
    this._maxDelay = this.leftDelay.delayTime.maxValue;
    // set initial feedback to 0.5
    this.feedback(0.5);
  };
  p5.Delay.prototype = Object.create(Effect.prototype);
  /**
   *  Agregue retardo a una señal de audio de acuerdo
   *  con un conjunto de parámetros de retardo.
   *
   *  @method  process - proceso
   *  @param  {Object} Signal  Un objeto que emite audio
   *  @param  {Number} [delayTime] Tiempo (en segundos) del retraso / eco.
   *                               Algunos navegadores limitan delayTime a
   *                               1 segundo.
   *  @param  {Number} [feedback]  envía el retardo a través de sí mismo
   *                               en un bucle que disminuye de volumen
   *                               cada vez.
   *  @param  {Number} [lowPass]   frecuencia Cutoff. Solo las frecuencias
   *                               por debajo del LowPass serán parte del
   *                               retraso.
   */
  p5.Delay.prototype.process = function (src, _delayTime, _feedback, _filter) {
    var feedback = _feedback || 0;
    var delayTime = _delayTime || 0;
    if (feedback >= 1) {
      throw new Error('El valor de la retroalimentación forzará un ciclo de retroalimentación positiva.');
    }
    if (delayTime >= this._maxDelay) {
      throw new Error('El tiempo de retardo excede el tiempo de retardo máximo de ' + this._maxDelay + ' second.');
    }
    src.connect(this.input);
    this.leftDelay.delayTime.setValueAtTime(delayTime, this.ac.currentTime);
    this.rightDelay.delayTime.setValueAtTime(delayTime, this.ac.currentTime);
    this._leftGain.gain.value = feedback;
    this._rightGain.gain.value = feedback;
    if (_filter) {
      this._leftFilter.freq(_filter);
      this._rightFilter.freq(_filter);
    }
  };
  /**
   *  Configure el tiempo de retardo (eco), en segundos. Por lo general, este valor será
   *  un punto flotante entre 0.0 y 1.0.
   *
   *  @method  delayTime
   *  @param {Number} delayTime Tiempo (en segundos) de la demora
   */
  p5.Delay.prototype.delayTime = function (t) {
    // si t es un nodo de audio ...
    if (typeof t !== 'number') {
      t.connect(this.leftDelay.delayTime);
      t.connect(this.rightDelay.delayTime);
    } else {
      this.leftDelay.delayTime.cancelScheduledValues(this.ac.currentTime);
      this.rightDelay.delayTime.cancelScheduledValues(this.ac.currentTime);
      this.leftDelay.delayTime.linearRampToValueAtTime(t, this.ac.currentTime);
      this.rightDelay.delayTime.linearRampToValueAtTime(t, this.ac.currentTime);
    }
  };
  /**
   *  La retroalimentación ocurre cuando Delay envía su señal a través de su entrada
   *  en un bucle. La cantidad de retroalimentación determina cuánta señal enviar cada
   *  vez a través del bucle. Una retroalimentación superior a 1.0 no es deseable porque
   *  aumentará la salida general cada vez que pase por el bucle,
   *  creando un bucle de retroalimentación infinito. El valor predeterminado es 0.5
   *
   *  @method  feedback
   *  @param {Number|Object} retroalimentación de 0.0 a 1.0, o un objeto como un
   *                                  oscilador que se puede usar para
   *                                  modular este parámetro
   *  @returns {Number} Valor de retroalimentación
   *
   */
  p5.Delay.prototype.feedback = function (f) {
    // if f is an audio node...
    if (f && typeof f !== 'number') {
      f.connect(this._leftGain.gain);
      f.connect(this._rightGain.gain);
    } else if (f >= 1) {
      throw new Error('Feedback value will force a positive feedback loop.');
    } else if (typeof f === 'number') {
      this._leftGain.gain.value = f;
      this._rightGain.gain.value = f;
    }
    // valor de retorno de la retroalimentación
    return this._leftGain.gain.value;
  };
  /**
   *  Establezca un filtro de frecuencia lowpass para el retraso. Un filtro lowpass
   *  cortará cualquier frecuencia más alta que la frecuencia del filtro.
   *
   *  @method  filter - filtro
   *  @param {Number|Object} cutoffFreq  Un filtro lowpass cortará cualquier frecuencia 
   *                             más alta que la frecuencia del filtro.
   *  @param {Number|Object} res  Resonancia del corte de frecuencia del filtro,
   *                              o un objeto (es decir, un p5.Oscillator)
   *                              que se puede usar para modular este parámetro.
   *                              Los números altos (es decir, 15) producirán una resonancia,
   *                              números bajos (es decir, .2) producirán una pendiente.
   */
  p5.Delay.prototype.filter = function (freq, q) {
    this._leftFilter.set(freq, q);
    this._rightFilter.set(freq, q);
  };
  /**
   * Elija un tipo de retraso predeterminado. 'pingPong' rebota la señal del canal
   *  rebota la señal del canal izquierdo al derecho para producir un efecto estéreo.
   *  Cualquier otro parámetro volverá a la configuración de retardo predeterminada.
   *
   *  @method  setType
   *  @param {String|Number} type 'pingPong' (1) or 'default' (0)
   */
  p5.Delay.prototype.setType = function (t) {
    if (t === 1) {
      t = 'pingPong';
    }
    this._split.disconnect();
    this._leftFilter.disconnect();
    this._rightFilter.disconnect();
    this._split.connect(this.leftDelay, 0);
    this._split.connect(this.rightDelay, 1);
    switch (t) {
    case 'pingPong':
      this._rightFilter.setType(this._leftFilter.biquad.type);
      this._leftFilter.output.connect(this._merge, 0, 0);
      this._rightFilter.output.connect(this._merge, 0, 1);
      this._leftFilter.output.connect(this.rightDelay);
      this._rightFilter.output.connect(this.leftDelay);
      break;
    default:
      this._leftFilter.output.connect(this._merge, 0, 0);
      this._rightFilter.output.connect(this._merge, 0, 1);
      this._leftFilter.output.connect(this.leftDelay);
      this._rightFilter.output.connect(this.rightDelay);
    }
  };
  // DocBlocks para los métodos heredados de p5.Effect
  /**
   *  Establece el nivel de salida del efecto de retardo.
   *
   *  @method  amp
   *  @param  {Number} amplitud de volumen entre 0 y 1.0
   *  @param {Number} [rampTime] crea un desvanecimiento que dura rampTime
   *  @param {Number} [timeFromNow] programar este evento para que suceda
   *                                segundos a partir de ahora
   */
  /**
   *  Enviar salida a un objeto de audio web o p5.sound
   *
   *  @method  connect - conectar
   *  @param  {Object} unit - unidad
   */ 
  /**
   *  Desconecte todas las salidas.
   *
   *  @method disconnect - desconectar
   */
  p5.Delay.prototype.dispose = function () {
    Effect.prototype.dispose.apply(this);
    this._split.disconnect();
    this._leftFilter.dispose();
    this._rightFilter.dispose();
    this._merge.disconnect();
    this._leftGain.disconnect();
    this._rightGain.disconnect();
    this.leftDelay.disconnect();
    this.rightDelay.disconnect();
    this._split = undefined;
    this._leftFilter = undefined;
    this._rightFilter = undefined;
    this._merge = undefined;
    this._leftGain = undefined;
    this._rightGain = undefined;
    this.leftDelay = undefined;
    this.rightDelay = undefined;
  };
}(filter, effect);
var reverb;
'use strict';
reverb = function () {
  var CustomError = errorHandler;
  var Effect = effect;
  /**
   *  La reverberación agrega profundidad a un sonido a través de una gran cantidad de ecos 
   *  en decadencia. Crea la percepción de que el sonido está ocurriendo en
   *  un espacio físico. El p5.Reverb tiene parámetros para Time (cuánto dura la reverberación) y
   *  decay Rate (cuánto decae el sonido con cada eco) que se pueden configurar con
   *  los métodos .set () o .process (). El p5.Convolver extiende
   *  p5.Reverb permitiéndole recrear el sonido de espacios físicos
   *  reales a través de la convolución.
   *
   *  Esta clase se extiende <a href = "/reference/#/p5.Effect">p5.Effect</a>.
   *  Métodos <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>,
   *  <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, y
   *  <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> están disponibles.
   *
   *  @class p5.Reverb
   *  @extends p5.Effect
   *  @constructor - constructor
   *  @example - ejemplo 
   *  <div><code>
   *  let soundFile, reverb;
   *  function preload() {
   *    soundFile = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *
   *  function setup() {
   *    reverb = new p5.Reverb();
   *    soundFile.disconnect(); // así que solo escucharemos reverberación ...
   *
   *    // conectar soundFile al proceso de reverberación w/
   *    // 3 segundos reverbTime, decayRate de 2%
   *    reverb.process(soundFile, 3, 2);
   *    soundFile.play();
   *  }
   *  </code></div>
   */
  p5.Reverb = function () {
    Effect.call(this);
    this._initConvolverNode();
    // de lo contrario, Safari distorsiona
    this.input.gain.value = 0.5;
    // parámetros predeterminados
    this._seconds = 3;
    this._decay = 2;
    this._reverse = false;
    this._buildImpulse();
  };
  p5.Reverb.prototype = Object.create(Effect.prototype);
  p5.Reverb.prototype._initConvolverNode = function () {
    this.convolverNode = this.ac.createConvolver();
    this.input.connect(this.convolverNode);
    this.convolverNode.connect(this.wet);
  };
  p5.Reverb.prototype._teardownConvolverNode = function () {
    if (this.convolverNode) {
      this.convolverNode.disconnect();
      delete this.convolverNode;
    }
  };
  p5.Reverb.prototype._setBuffer = function (audioBuffer) {
    this._teardownConvolverNode();
    this._initConvolverNode();
    this.convolverNode.buffer = audioBuffer;
  };
  /**
   *  Conecte una fuente a la reverberación y asigne parámetros de reverberación.
   *
   *  @method  process - proceso 
   *  @param  {Object} src     p5.sound / Objeto Web Audio con salida 
   *                           de sonido.
   *  @param  {Number} [seconds] Duración de la reverberación, en segundos.
   *                           Min: 0, Max: 10. Por defecto es 3.
   *  @param  {Number} [decayRate] Porcentaje de decaimiento con cada eco.
   *                            Min: 0, Max: 100. Por defecto es 2.
   *  @param  {Boolean} [reverse] Reproduzca la reverberación hacia atrás o hacia adelante.
   */
  p5.Reverb.prototype.process = function (src, seconds, decayRate, reverse) {
    src.connect(this.input);
    var rebuild = false;
    if (seconds) {
      this._seconds = seconds;
      rebuild = true;
    }
    if (decayRate) {
      this._decay = decayRate;
    }
    if (reverse) {
      this._reverse = reverse;
    }
    if (rebuild) {
      this._buildImpulse();
    }
  };
  /**
   *  Configure los ajustes de reverberación. Similar a .process (), pero sin
   *  asignar una nueva entrada.
   *
   *  @method  set - configurar
   *  @param  {Number} [seconds] Duración de la reverberación, en segundos.
   *                           Min: 0, Max: 10. Por defecto es 3.
   *  @param  {Number} [decayRate] Porcentaje de decaimiento con cada eco.
   *                            Min: 0, Max: 100. Por defecto es 2.
   *  @param  {Boolean} [reverse] Reproduzca la reverberación hacia atrás o hacia adelante.
   */
  p5.Reverb.prototype.set = function (seconds, decayRate, reverse) {
    var rebuild = false;
    if (seconds) {
      this._seconds = seconds;
      rebuild = true;
    }
    if (decayRate) {
      this._decay = decayRate;
    }
    if (reverse) {
      this._reverse = reverse;
    }
    if (rebuild) {
      this._buildImpulse();
    }
  };
  // DocBlocks para métodos heredados de p5.Effect
  /**
   *  Establece el nivel de salida del efecto de reverberación.
   *
   *  @method  amp
   *  @param  {Number} amplitud de volumen entre 0 y 1.0
   *  @param  {Number} [rampTime] crea un desvanecimiento que dura rampTime
   *  @param  {Number} [timeFromNow] programar este evento para que suceda
   *                                segundos a partir de ahora
   */
  /**
   *  Enviar salida a un objeto de audio web o p5.sound
   *
   *  @method  connect - conectar
   *  @param  {Object} unit - unidad
   */
  /**
   *  Desconecte todas las salidas.
   *
   *  @method disconnect - desconectar
   */
  /**
   *  Inspirado en Reverberación Simple por Jordan Santell
   *  https://github.com/web-audio-components/simple-reverb/blob/master/index.js
   *
   *  Función de utilidad para construir una respuesta de impulso
   *  basada en los parámetros del módulo.
   *
   *  @private - privado
   */
  p5.Reverb.prototype._buildImpulse = function () {
    var rate = this.ac.sampleRate;
    var length = rate * this._seconds;
    var decay = this._decay;
    var impulse = this.ac.createBuffer(2, length, rate);
    var impulseL = impulse.getChannelData(0);
    var impulseR = impulse.getChannelData(1);
    var n, i;
    for (i = 0; i < length; i++) {
      n = this._reverse ? length - i : i;
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    this._setBuffer(impulse);
  };
  p5.Reverb.prototype.dispose = function () {
    Effect.prototype.dispose.apply(this);
    this._teardownConvolverNode();
  };
  // =======================================================================
  //                          *** p5.Convolver ***
  // =======================================================================
  /**
   *  <p>p5.Convolver extiende p5.Reverb. Puede emular el sonido de espacios físicos reales
   *  a través de un proceso llamado<a href="
   *  https://en.wikipedia.org/wiki/Convolution_reverb#Real_space_simulation">
   *  convolution</a>.</p>
   *
   *  <p>La convolución multiplica cualquier entrada de audio por una "respuesta de impulso"
   *  para simular la dispersión del sonido a lo largo del tiempo. La respuesta de impulso se genera a partir de un
   *  archivo de audio que proporciones. Una forma de generar
   *  una respuesta de impulso es hacer estallar un globo en un espacio reverberante y
   *  registrar el eco. La convolución también se puede utilizar para experimentar
   *  con el sonido.</p>
   *
   *  <p>Usa el método <code>createConvolution(path)</code> para instanciar un
   *  p5.Convolver con una ruta a su archivo de audio de respuesta de impulso.</p>
   *
   *  @class p5.Convolver
   *  @extends p5.Effect
   *  @constructor - constructor
   *  @param  {String}   path - ruta    ruta a un archivo de sonido
   *  @param  {Function} [callback] función para llamar cuando la carga se realiza correctamente
   *  @param  {Function} [errorCallback] función para llamar si la carga falla.
   *                                     Esta función recibirá un error o un
   *                                     objeto XMLHttpRequest con información
   *                                     sobre lo que salió mal.
   *  @example - ejemplo
   *  <div><code>
   *  let cVerb, sound;
   *  function preload() {
   *    // Tenemos versiones MP3 y OGG de todos los bienes de sonido.
   *    soundFormats('ogg', 'mp3');
   *
   *    // Intente reemplazar 'bx-spring' con otros archivos de sonido como
   *    // 'concrete-tunnel' 'small-plate' 'drum' 'beatbox'
   *    cVerb = createConvolver('assets/bx-spring.mp3');
   *
   *    // Intente reemplazar 'Damscray_DancingTiger' con
   *    // 'beat', 'doorbell', lucky_dragons_-_power_melody'
   *    sound = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *
   *  function setup() {
   *    // desconectar de la salida maestra ...
   *    sound.disconnect();
   *
   *    // ...y procesar con cVerb
   *    // para que solo escuchemos la convolución
   *    cVerb.process(sound);
   *
   *    sound.play();
   *  }
   *  </code></div>
   */
  p5.Convolver = function (path, callback, errorCallback) {
    p5.Reverb.call(this);
    /**
     *  Internamente, el p5.Convolver usa la 
     *  <a href="http://www.w3.org/TR/webaudio/#ConvolverNode">
     *  Web Audio Convolver Node</a>.
     *
     *  @property {ConvolverNode} convolverNode
     */
    this._initConvolverNode();
    // de lo contrario, Safari distorsiona
    this.input.gain.value = 0.5;
    if (path) {
      this.impulses = [];
      this._loadBuffer(path, callback, errorCallback);
    } else {
      // parámetros
      this._seconds = 3;
      this._decay = 2;
      this._reverse = false;
      this._buildImpulse();
    }
  };
  p5.Convolver.prototype = Object.create(p5.Reverb.prototype);
  p5.prototype.registerPreloadMethod('createConvolver', p5.prototype);
  /**
   *  Cree un p5.Convolver. Acepta una ruta a un archivo de sonido
   *  que se utilizará para generar una respuesta de impulso.
   *
   *  @method  createConvolver
   *  @param  {String}   path - ruta    ruta a un archivo de sonido
   *  @param  {Function} [callback] función para llamar si la carga es exitosa.
   *                                El objeto se pasará como argumento a la función
   *                                de devolución de llamada.
   *  @param  {Function} [errorCallback] función para llamar si la carga no es exitosa.
   *                                Se pasará un error personalizado como argumento
   *                                a la función de devolución de llamada.
   *  @return {p5.Convolver}
   *  @example - ejemplo
   *  <div><code>
   *  let cVerb, sound;
   *  function preload() {
   *    // Tenemos versiones MP3 y OGG de todos los activos de sonido.
   *    soundFormats('ogg', 'mp3');
   *
   *    // Intente reemplazar 'box-spring' con otros archivos de sonido como
   *    // 'concrete-tunnel' 'small-plate' 'drum' 'beatbox'
   *    cVerb = createConvolver('assets/bx-spring.mp3');
   *
   *    // Intente reemplazar 'Damscray_DancingTiger' con
   *    // 'beat', 'doorbell', lucky_dragons_-_power_melody'
   *    sound = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *
   *  function setup() {
   *    // desconectar de la salida maestra ...
   *    sound.disconnect();
   *
   *    // ... y procesar con cVerb
   *    // para que solo escuchemos la convolución
   *    cVerb.process(sound);
   *
   *    sound.play();
   *  }
   *  </code></div>
   */
  p5.prototype.createConvolver = function (path, callback, errorCallback) {
    // si se carga localmente sin un servidor
    if (window.location.origin.indexOf('file://') > -1 && window.cordova === 'indefinido') {
      alert('Este boceto puede requerir que un servidor cargue archivos externos. Por favor mirahttp://bit.ly/1qcInwS');
    }
    var self = this;
    var cReverb = new p5.Convolver(path, function (buffer) {
      if (typeof callback === 'function') {
        callback(buffer);
      }
      if (typeof self._decrementPreload === 'function') {
        self._decrementPreload();
      }
    }, errorCallback);
    cReverb.impulses = [];
    return cReverb;
  };
  /**
   *  Método privado para cargar un búfer como una respuesta de impulso,
   *  asignarlo al convolverNode y agregarlo a la matriz de .impulses.
   *
   *  @param   {String}   path - ruta
   *  @param   {Function} callback - llamada de vuelta
   *  @param   {Function} errorCallback 
   *  @private - privado
   */
  p5.Convolver.prototype._loadBuffer = function (path, callback, errorCallback) {
    var path = p5.prototype._checkFileFormats(path);
    var self = this;
    var errorTrace = new Error().stack;
    var ac = p5.prototype.getAudioContext();
    var request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
      if (request.status === 200) {
        // al cargar el archivo con éxito:
        ac.decodeAudioData(request.response, function (buff) {
          var buffer = {};
          var chunks = path.split('/');
          buffer.name = chunks[chunks.length - 1];
          buffer.audioBuffer = buff;
          self.impulses.push(buffer);
          self._setBuffer(buffer.audioBuffer);
          if (callback) {
            callback(buffer);
          }
        }, // búfer de decodificación de errores. "e" no está definido en Chrome 22/11/2015
        function () {
          var err = new CustomError('decodeAudioData', errorTrace, self.url);
          var msg = 'AudioContext error at decodeAudioData for ' + self.url;
          if (errorCallback) {
            err.msg = msg;
            errorCallback(err);
          } else {
            console.error(msg + '\n The error stack trace includes: \n' + err.stack);
          }
        });
      } else {
        var err = new CustomError('loadConvolver', errorTrace, self.url);
        var msg = 'Unable to load ' + self.url + '. The request status was: ' + request.status + ' (' + request.statusText + ')';
        if (errorCallback) {
          err.message = msg;
          errorCallback(err);
        } else {
          console.error(msg + '\n The error stack trace includes: \n' + err.stack);
        }
      }
    };
    // si hay otro error, aparte del 404 ...
    request.onerror = function () {
      var err = new CustomError('loadConvolver', errorTrace, self.url);
      var msg = 'No hubo respuesta del servidor en ' + self.url + '. Check the url and internet connectivity.';
      if (errorCallback) {
        err.message = msg;
        errorCallback(err);
      } else {
        console.error(msg + '\n El seguimiento de la pila de errores incluye: \n' + err.stack);
      }
    };
    request.send();
  };
  p5.Convolver.prototype.set = null;
  /**
   *  Conecte una fuente a la reverberación y asigne parámetros de reverberación.
   *
   *  @method  process - proceso
   *  @param  {Object} src     p5.sound / Objeto Web Audio con salida de
   *                           sonido.
   *  @example - ejemplo
   *  <div><code>
   *  let cVerb, sound;
   *  function preload() {
   *    soundFormats('ogg', 'mp3');
   *
   *    cVerb = createConvolver('assets/concrete-tunnel.mp3');
   *
   *    sound = loadSound('assets/beat.mp3');
   *  }
   *
   *  function setup() {
   *    // desconectar de la salida maestra ...
   *    sound.disconnect();
   *
   *    // ... y procesar con (es decir, conectarse a) cVerb
   *    // para que solo escuchemos la convolución
   *    cVerb.process(sound);
   *
   *    sound.play();
   *  }
   *  </code></div>
   */
  p5.Convolver.prototype.process = function (src) {
    src.connect(this.input);
  };
  /**
   *  Si carga varios archivos de impulso utilizando el método
   *  addImpulse, se almacenarán como objetos en esta matriz. Cambie entre
   *  ellos con el método <code> toggleImpulse (id) </code>.
   *
   *  @property {Array} impulses - impulsos
   */
  p5.Convolver.prototype.impulses = [];
  /**
   *  Cargue y asigne una nueva respuesta de impulso al p5.Convolver.
   *  El impulso se agrega a la matriz <code> .impulses </code>. Se puede
   *  acceder a los impulsos anteriores con el método
   *  <code> .toggleImpulse (id) </code>.
   *
   *  @method  addImpulse
   *  @param  {String}   path - ruta    ruta a un archivo de sonido
   *  @param  {Function} función de devolución de llamada (opcional)
   *  @param  {Function} errorCallback función (opcional)
   */
  p5.Convolver.prototype.addImpulse = function (path, callback, errorCallback) {
    // si se carga localmente sin un servidor
    if (window.location.origin.indexOf('file://') > -1 && window.cordova === 'undefined') {
      alert('Este boceto puede requerir que un servidor cargue archivos externos. Por favor mirahttp://bit.ly/1qcInwS');
    }
    this._loadBuffer(path, callback, errorCallback);
  };
  /**
   *  Similar a .addImpulse, excepto que <code> .impulses </code>
   *  La matriz se restablece para ahorrar memoria. Una nueva matriz <code>.impulses</code>
   *  se crea con este impulso como único elemento.
   *
   *  @method  resetImpulse
   *  @param  {String}   path - ruta   ruta a un archivo de sonido
   *  @param  {Function} función de devolución de llamada (opcional)
   *  @param  {Function} errorCallback función (opcional)
   */
  p5.Convolver.prototype.resetImpulse = function (path, callback, errorCallback) {
    // si se carga localmente sin un servidor
    if (window.location.origin.indexOf('file://') > -1 && window.cordova === 'undefined') {
      alert('Este boceto puede requerir que un servidor cargue archivos externos. Por favor mira http://bit.ly/1qcInwS');
    }
    this.impulses = [];
    this._loadBuffer(path, callback, errorCallback);
  };
  /**
   *  Si ha usado <code>.addImpulse()</code> para agregar múltiples impulsos
   *  a un p5.Convolver, entonces puede usar este método para alternar entre los
   *  elementos de la matriz <code> .impulses </code>. Acepta un parámetro para
   *  dentificar qué impulso desea utilizar, identificado por su nombre de archivo original (String)
   *  o por su posición en el <code> .impulses
   *  </code> Matriz (número).<br/>
   *  Puede acceder a los objetos en .impulses Array directamente. Cada
   *  objeto tiene dos atributos: un <code>.audioBuffer</code> (type:
   *  Web Audio <a href="
   *  http://webaudio.github.io/web-audio-api/#the-audiobuffer-interface">
   *  AudioBuffer)</a> y un <code>.name</code>, una cadena que corresponde con el
   *  nombre del archivo original.
   *
   *  @method toggleImpulse
   *  @param {String|Number} id Identificar el impulso por su nombre de archivo original
   *                            (Cadena), o por su posición en la matrìz (número)
   *                            <code>.impulses</code>.
   */
  p5.Convolver.prototype.toggleImpulse = function (id) {
    if (typeof id === 'number' && id < this.impulses.length) {
      this._setBuffer(this.impulses[id].audioBuffer);
    }
    if (typeof id === 'string') {
      for (var i = 0; i < this.impulses.length; i++) {
        if (this.impulses[i].name === id) {
          this._setBuffer(this.impulses[i].audioBuffer);
          break;
        }
      }
    }
  };
  p5.Convolver.prototype.dispose = function () {
    p5.Reverb.prototype.dispose.apply(this);
    // eliminar todos los búferes de respuesta a impulso
    para (var i in this.impulses) {
      if (this.impulses[i]) {
        this.impulses[i] = null;
      }
    }
  };
}(errorHandler, effect);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_core_TimelineState;
Tone_core_TimelineState = function (Tone) {
  'use strict';
  Tone.TimelineState = function (initial) {
    Tone.Timeline.call(this);
    this._initial = initial;
  };
  Tone.extend(Tone.TimelineState, Tone.Timeline);
  Tone.TimelineState.prototype.getValueAtTime = function (time) {
    var event = this.get(time);
    if (event !== null) {
      return event.state;
    } else {
      return this._initial;
    }
  };
  Tone.TimelineState.prototype.setStateAtTime = function (state, time) {
    this.add({
      'state': state,
      'time': time
    });
  };
  return Tone.TimelineState;
}(Tone_core_Tone, Tone_core_Timeline);
/** Tone.js módulo por Yotam Mann, Licencia MIT 2016  http://opensource.org/licenses/MIT **/
var Tone_core_Clock;
Tone_core_Clock = function (Tone) {
  'use strict';
  Tone.Clock = function () {
    Tone.Emitter.call(this);
    var options = this.optionsObject(arguments, [
      'callback',
      'frequency'
    ], Tone.Clock.defaults);
    this.callback = options.callback;
    this._nextTick = 0;
    this._lastState = Tone.State.Stopped;
    this.frequency = new Tone.TimelineSignal(options.frequency, Tone.Type.Frequency);
    this._readOnly('frequency');
    this.ticks = 0;
    this._state = new Tone.TimelineState(Tone.State.Stopped);
    this._boundLoop = this._loop.bind(this);
    this.context.on('tick', this._boundLoop);
  };
  Tone.extend(Tone.Clock, Tone.Emitter);
  Tone.Clock.defaults = {
    'callback': Tone.noOp,
    'frequency': 1,
    'lookAhead': 'auto'
  };
  Object.defineProperty(Tone.Clock.prototype, 'state', {
    get: function () {
      return this._state.getValueAtTime(this.now());
    }
  });
  Tone.Clock.prototype.start = function (time, offset) {
    time = this.toSeconds(time);
    if (this._state.getValueAtTime(time) !== Tone.State.Started) {
      this._state.add({
        'state': Tone.State.Started,
        'time': time,
        'offset': offset
      });
    }
    return this;
  };
  Tone.Clock.prototype.stop = function (time) {
    time = this.toSeconds(time);
    this._state.cancel(time);
    this._state.setStateAtTime(Tone.State.Stopped, time);
    return this;
  };
  Tone.Clock.prototype.pause = function (time) {
    time = this.toSeconds(time);
    if (this._state.getValueAtTime(time) === Tone.State.Started) {
      this._state.setStateAtTime(Tone.State.Paused, time);
    }
    return this;
  };
  Tone.Clock.prototype._loop = function () {
    var now = this.now();
    var lookAhead = this.context.lookAhead;
    var updateInterval = this.context.updateInterval;
    var lagCompensation = this.context.lag * 2;
    var loopInterval = now + lookAhead + updateInterval + lagCompensation;
    while (loopInterval > this._nextTick && this._state) {
      var currentState = this._state.getValueAtTime(this._nextTick);
      if (currentState !== this._lastState) {
        this._lastState = currentState;
        var event = this._state.get(this._nextTick);
        if (currentState === Tone.State.Started) {
          this._nextTick = event.time;
          if (!this.isUndef(event.offset)) {
            this.ticks = event.offset;
          }
          this.emit('start', event.time, this.ticks);
        } else if (currentState === Tone.State.Stopped) {
          this.ticks = 0;
          this.emit('stop', event.time);
        } else if (currentState === Tone.State.Paused) {
          this.emit('pause', event.time);
        }
      }
      var tickTime = this._nextTick;
      if (this.frequency) {
        this._nextTick += 1 / this.frequency.getValueAtTime(this._nextTick);
        if (currentState === Tone.State.Started) {
          this.callback(tickTime);
          this.ticks++;
        }
      }
    }
  };
  Tone.Clock.prototype.getStateAtTime = function (time) {
    time = this.toSeconds(time);
    return this._state.getValueAtTime(time);
  };
  Tone.Clock.prototype.dispose = function () {
    Tone.Emitter.prototype.dispose.call(this);
    this.context.off('tick', this._boundLoop);
    this._writable('frequency');
    this.frequency.dispose();
    this.frequency = null;
    this._boundLoop = null;
    this._nextTick = Infinity;
    this.callback = null;
    this._state.dispose();
    this._state = null;
  };
  return Tone.Clock;
}(Tone_core_Tone, Tone_signal_TimelineSignal, Tone_core_TimelineState, Tone_core_Emitter);
var metro;
'use strict';
metro = function () {
  var p5sound = master;
  // requiere la librería Tone.js Clock (Licencia MIT, Yotam Mann)
  // https://github.com/TONEnoTONE/Tone.js/
  var Clock = Tone_core_Clock;
  p5.Metro = function () {
    this.clock = new Clock({ 'callback': this.ontick.bind(this) });
    this.syncedParts = [];
    this.bpm = 120;
    // es anulado por p5.Part
    this._init();
    this.prevTick = 0;
    this.tatumTime = 0;
    this.tickCallback = function () {
    };
  };
  p5.Metro.prototype.ontick = function (tickTime) {
    var elapsedTime = tickTime - this.prevTick;
    var secondsFromNow = tickTime - p5sound.audiocontext.currentTime;
    if (elapsedTime - this.tatumTime <= -0.02) {
      return;
    } else {
      // console.log('ok', this.syncedParts[0].phrases[0].name);
      this.prevTick = tickTime;
      // para todas las cosas activas en el metro:
      var self = this;
      this.syncedParts.forEach(function (thisPart) {
        if (!thisPart.isPlaying)
          return;
        thisPart.incrementStep(secondsFromNow);
        // cada fuente sincronizada realiza un seguimiento de su propio número de tiempo
        thisPart.phrases.forEach(function (thisPhrase) {
          var phraseArray = thisPhrase.sequence;
          var bNum = self.metroTicks % phraseArray.length;
          if (phraseArray[bNum] !== 0 && (self.metroTicks < phraseArray.length || !thisPhrase.looping)) {
            thisPhrase.callback(secondsFromNow, phraseArray[bNum]);
          }
        });
      });
      this.metroTicks += 1;
      this.tickCallback(secondsFromNow);
    }
  };
  p5.Metro.prototype.setBPM = function (bpm, rampTime) {
    var beatTime = 60 / (bpm * this.tatums);
    var now = p5sound.audiocontext.currentTime;
    this.tatumTime = beatTime;
    var rampTime = rampTime || 0;
    this.clock.frequency.setValueAtTime(this.clock.frequency.value, now);
    this.clock.frequency.linearRampToValueAtTime(bpm, now + rampTime);
    this.bpm = bpm;
  };
  p5.Metro.prototype.getBPM = function () {
    return this.clock.getRate() / this.tatums * 60;
  };
  p5.Metro.prototype._init = function () {
    this.metroTicks = 0;
  };
  // borre las partes sincronizadas existentes, agregue solo esta
  p5.Metro.prototype.resetSync = function (part) {
    this.syncedParts = [part];
  };
  // empujar una nueva parte sincronizada a la matriz
  p5.Metro.prototype.pushSync = function (part) {
    this.syncedParts.push(part);
  };
  p5.Metro.prototype.start = function (timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    this.clock.start(now + t);
    this.setBPM(this.bpm);
  };
  p5.Metro.prototype.stop = function (timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    this.clock.stop(now + t);
  };
  p5.Metro.prototype.beatLength = function (tatums) {
    this.tatums = 1 / tatums / 4;
  };
}(master, Tone_core_Clock);
var looper;
'use strict';
looper = function () {
  var p5sound = master;
  var BPM = 120;
  /**
   *  Establezca el tempo global, en pulsaciones por minuto, para
   *  p5.Parts. Este método afectará a todas las p5.Parts activas.
   *
   *  @method setBPM
   *  @param {Number} BPM      pulsaciones por minuto.
   *  @param {Number} rampTime Segundos a partir de ahora
   */
  p5.prototype.setBPM = function (bpm, rampTime) {
    BPM = bpm;
    for (var i in p5sound.parts) {
      if (p5sound.parts[i]) {
        p5sound.parts[i].setBPM(bpm, rampTime);
      }
    }
  };
  /**
   *  <p>Una frase es un patrón de eventos musicales a lo largo del tiempo, es
   *  decir, una serie de notas y silencios.</p>
   *
   *  <p>Las frases deben agregarse a una p5.Part para
   *  la reproducción, y cada parte puede reproducir varias frases al mismo tiempo.
   *  Por ejemplo, una frase podría ser un bombo,
   *  otra podría ser un redoblante y otra podría ser la línea de bajo.</p>
   *
   *  <p>El primer parámetro es un nombre para que la frase se
   *  pueda modificar o eliminar más tarde. La devolución de llamada es una función que
   *  esta frase llamará en cada paso; por ejemplo, podría
   *  llamarse <code> playNote (value) {} </code>. La matriz determina qué valor 
   *  se pasa a la devolución de llamada en cada paso de la 
   *  frase. Pueden ser números, un objeto con varios números o un cero (0) indica
   *  un descanso para que no se llame a la devolución de llamada).</p>
   *
   *  @class p5.Phrase
   *  @constructor - constructor
   *  @param {String}   name - nombre    Nombre para que pueda acceder a la Frase.
   *  @param {Function} callback El nombre de una función a la que llamará
   *                             esta frase. Por lo general, reproducirá un sonido y aceptará
   *                             dos parámetros: un momento en el que
   *                             reproducir el sonido (en segundos a partir de ahora)
   *                             y un valor de la matriz de secuencia. El tiempo 
   *                             debe pasarse al método play () o start () para
   *                             garantizar la precisión.
   *  @param {Array}   sequence - secuencia   Matriz de valores para pasar a la devolución
   *                            	      de llamada en cada paso de la frase.
   *  @example - ejemplo 
   *  <div><code>
   *  let mySound, myPhrase, myPart;
   *  let pattern = [1,0,0,2,0,2,0,0];
   *  let msg = 'click to play';
   *
   *  function preload() {
   *    mySound = loadSound('assets/beatbox.mp3');
   *  }
   *
   *  function setup() {
   *    noStroke();
   *    fill(255);
   *    textAlign(CENTER);
   *    masterVolume(0.1);
   *
   *    myPhrase = new p5.Phrase('bbox', makeSound, pattern);
   *    myPart = new p5.Part();
   *    myPart.addPhrase(myPhrase);
   *    myPart.setBPM(60);
   *  }
   *
   *  function draw() {
   *    background(0);
   *    text(msg, width/2, height/2);
   *  }
   *
   *  function makeSound(time, playbackRate) {
   *    mySound.rate(playbackRate);
   *    mySound.play(time);
   *  }
   *
   *  function mouseClicked() {
   *    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
   *      myPart.start();
   *      msg = 'playing pattern';
   *    }
   *  }
   *
   *  </code></div>
   */
  p5.Phrase = function (name, callback, sequence) {
    this.phraseStep = 0;
    this.name = name;
    this.callback = callback;
    /**
     * Matriz de valores para pasar a la devolución de 
     * llamada en cada paso de la frase. Según los requisitos de la
     * función de devolución de llamada, estos valores pueden ser números,
     * cadenas o un objeto con varios parámetros.
     * Cero (0) indica un descanso.
     *
     * @property {Array} sequence - secuencia
     */
    this.sequence = sequence;
  };
  /**
   *  <p>Una p5.Part reproduce una o más p5.Frases. Instancia de una parte
   * con pasos y tatums. De forma predeterminada, cada paso representa una semicorchea.</p>
   *
   *  <p>Ve p5.Phrase para obtener más información sobre la sincronización musical.</p>
   *
   *  @class p5.Part
   *  @constructor - constructor
   *  @param {Number} [steps]  Pasos en la pieza
   *  @param {Number} [tatums] Divisiones de un ritmo, p. Ej. use 1/4 o 0.25 para una negra (el valor predeterminado es 1/16, una semicorchea)
   *  @example - ejemplo
   *  <div><code>
   *  let box, drum, myPart;
   *  let boxPat = [1,0,0,2,0,2,0,0];
   *  let drumPat = [0,1,1,0,2,0,1,0];
   *  let msg = 'clic para reproducir';
   *
   *  function preload() {
   *    box = loadSound('assets/beatbox.mp3');
   *    drum = loadSound('assets/drum.mp3');
   *  }
   *
   *  function setup() {
   *    noStroke();
   *    fill(255);
   *    textAlign(CENTER);
   *    masterVolume(0.1);
   *
   *    let boxPhrase = new p5.Phrase('box', playBox, boxPat);
   *    let drumPhrase = new p5.Phrase('tambor', playDrum, drumPat);
   *    myPart = new p5.Part();
   *    myPart.addPhrase(boxPhrase);
   *    myPart.addPhrase(drumPhrase);
   *    myPart.setBPM(60);
   *    masterVolume(0.1);
   *  }
   *
   *  function draw() {
   *    background(0);
   *    text(msg, width/2, height/2);
   *  }
   *
   *  function playBox(time, playbackRate) {
   *    box.rate(playbackRate);
   *    box.play(time);
   *  }
   *
   *  function playDrum(time, playbackRate) {
   *    drum.rate(playbackRate);
   *    drum.play(time);
   *  }
   *
   *  function mouseClicked() {
   *    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
   *      myPart.start();
   *      msg = 'playing part';
   *    }
   *  }
   *  </code></div>
   */
  p5.Part = function (steps, bLength) {
    this.length = steps || 0;
    // Cuantos latidos
    this.partStep = 0;
    this.phrases = [];
    this.isPlaying = false;
    this.noLoop();
    this.tatums = bLength || 0.0625;
    // por defecto a la nota negra
    this.metro = new p5.Metro();
    this.metro._init();
    this.metro.beatLength(this.tatums);
    this.metro.setBPM(BPM);
    p5sound.parts.push(this);
    this.callback = function () {
    };
  };
  /**
   *  Establezca el tempo de esta parte, en tiempos por minuto.
   *
   *  @method  setBPM
   *  @param {Number} BPM      Pulsaciones por minuto
   *  @param {Number} [rampTime] Segundos a partir de ahora
   */
  p5.Part.prototype.setBPM = function (tempo, rampTime) {
    this.metro.setBPM(tempo, rampTime);
  };
  /**
   *  Devuelve el tempo, en pulsaciones por minuto, de esta parte.
   *
   *  @method getBPM
   *  @return {Number}
   */
  p5.Part.prototype.getBPM = function () {
    return this.metro.getBPM();
  };
  /**
   *  Inicie la reproducción de esta parte. Reproducirá todas
   *  sus frases a una velocidad determinada
   *  por setBPM.
   *
   *  @method  start - iniciar
   *  @param  {Number} [time] segundos a partir de ahora
   */
  p5.Part.prototype.start = function (time) {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.metro.resetSync(this);
      var t = time || 0;
      this.metro.start(t);
    }
  };
  /**
   *  Reproducción en bucle de esta parte. Comenzará
   *  a recorrer todas sus frases a una velocidad
   *  determinada por setBPM.
   *
   *  @method  loop - bucle
   *  @param  {Number} [time] segundos a partir de ahora
   */
  p5.Part.prototype.loop = function (time) {
    this.looping = true;
    // función de descanso
    this.onended = function () {
      this.partStep = 0;
    };
    var t = time || 0;
    this.start(t);
  };
  /**
   *  Dile a la pieza que deje de girar.
   *
   *  @method  noLoop
   */
  p5.Part.prototype.noLoop = function () {
    this.looping = false;
    // función de descanso
    this.onended = function () {
      this.stop();
    };
  };
  /**
   * Detenga la parte y colóquela en el paso 0. La reproducción se reanudará desde el principio de la parte cuando se vuelva a reproducir.
   *
   *  @method  stop - detener
   *  @param  {Number} [time] segundos a partir de ahora
   */
  p5.Part.prototype.stop = function (time) {
    this.partStep = 0;
    this.pause(time);
  };
  /**
   *  Pausa la parte. La reproducción se reanudará
   *  desde el paso actual.
   *
   *  @method  pause - pausa
   *  @param  {Number} segundos a partir de ahora
   */
  p5.Part.prototype.pause = function (time) {
    this.isPlaying = false;
    var t = time || 0;
    this.metro.stop(t);
  };
  /**
   *  Agregue una p5.Phrase a esta parte.
   *
   *  @method  addPhrase
   *  @param {p5.Phrase}   phrase - frase   referencia a una p5.Phrase
   */
  p5.Part.prototype.addPhrase = function (name, callback, array) {
    var p;
    if (arguments.length === 3) {
      p = new p5.Phrase(name, callback, array);
    } else if (arguments[0] instanceof p5.Phrase) {
      p = arguments[0];
    } else {
      throw 'invalid input. addPhrase accepts name, callback, array or a p5.Phrase';
    }
    this.phrases.push(p);
    // restablecer la longitud si la frase es más larga que la longitud existente de la parte
    if (p.sequence.length > this.length) {
      this.length = p.sequence.length;
    }
  };
  /**
   *  Elimine una frase de esta parte, según el nombre que
   *  se le dio cuando se creó.
   *
   *  @method  removePhrase
   *  @param  {String} phraseName
   */
  p5.Part.prototype.removePhrase = function (name) {
    for (var i in this.phrases) {
      if (this.phrases[i].name === name) {
        this.phrases.splice(i, 1);
      }
    }
  };
  /**
   *  Obtenga una frase de esta parte, según el nombre que
   *  se le dio cuando se creó. Ahora puedes modificar su matriz.
   *
   *  @method  getPhrase
   *  @param  {String} phraseName
   */
  p5.Part.prototype.getPhrase = function (name) {
    for (var i in this.phrases) {
      if (this.phrases[i].name === name) {
        return this.phrases[i];
      }
    }
  };
  /**
   *  Busque todas las secuencias con el nombre especificado y reemplace sus patrones con la matriz especificada.
   *
   *  @method  replaceSequence
   *  @param  {String} phraseName
   *  @param  {Array} sequence - secuencia Matriz de valores para pasar a la devolución
   *                            	   de llamada en cada paso de la frase.
   */
  p5.Part.prototype.replaceSequence = function (name, array) {
    for (var i in this.phrases) {
      if (this.phrases[i].name === name) {
        this.phrases[i].sequence = array;
      }
    }
  };
  p5.Part.prototype.incrementStep = function (time) {
    if (this.partStep < this.length - 1) {
      this.callback(time);
      this.partStep += 1;
    } else {
      if (!this.looping && this.partStep === this.length - 1) {
        console.log('done');
        // this.callback(time);
        this.onended();
      }
    }
  };
  /**
   *  Configure la función a la que se llamará en cada paso. Esto borrará la función anterior.
   *
   *  @method onStep
   *  @param  {Function} callback El nombre de la devolución de llamada
   *                              que desea disparar en cada
   *                              ritmo / tatum.
   */
  p5.Part.prototype.onStep = function (callback) {
    this.callback = callback;
  };
  // ===============
  // p5.Score
  // ===============
  /**
   *  Una partitura consta de una serie de partes. Las partes
   *  se reproducirán en orden. Por ejemplo, podría tener una
   *  parte A, una parte B y una parte C, y reproducirlas en este orden
   *  <code>new p5.Score(a, a, b, a, c)</code>
   *
   *  @class p5.Score
   *  @constructor - constructor
   *  @param {p5.Part} [...parts] Una o varias partes, para tocar en secuencia.
   */
  p5.Score = function () {
    // para todos los argumentos
    this.parts = [];
    this.currentPart = 0;
    var thisScore = this;
    for (var i in arguments) {
      if (arguments[i] && this.parts[i]) {
        this.parts[i] = arguments[i];
        this.parts[i].nextPart = this.parts[i + 1];
        this.parts[i].onended = function () {
          thisScore.resetPart(i);
          playNextPart(thisScore);
        };
      }
    }
    this.looping = false;
  };
  p5.Score.prototype.onended = function () {
    if (this.looping) {
      // this.resetParts();
      this.parts[0].start();
    } else {
      this.parts[this.parts.length - 1].onended = function () {
        this.stop();
        this.resetParts();
      };
    }
    this.currentPart = 0;
  };
  /**
   *  Inicie la reproducción de la partitura.
   *
   *  @method  start
   */
  p5.Score.prototype.start = function () {
    this.parts[this.currentPart].start();
    this.scoreStep = 0;
  };
  /**
   *  Detenga la reproducción de la partitura.
   *
   *  @method  stop - detener
   */
  p5.Score.prototype.stop = function () {
    this.parts[this.currentPart].stop();
    this.currentPart = 0;
    this.scoreStep = 0;
  };
  /**
   *  Pausar la reproducción de la partitura.
   *
   *  @method  pause - pausar
   */
  p5.Score.prototype.pause = function () {
    this.parts[this.currentPart].stop();
  };
  /**
   *  Reproducción en bucle de la partitura.
   *
   *  @method  loop - bucle
   */
  p5.Score.prototype.loop = function () {
    this.looping = true;
    this.start();
  };
  /**
   *  Detenga la reproducción en bucle de la partitura. Si se
   *  está reproduciendo actualmente, entrará en vigor una vez
   *  que se complete la ronda actual de reproducción.
   *
   *  @method  noLoop
   */
  p5.Score.prototype.noLoop = function () {
    this.looping = false;
  };
  p5.Score.prototype.resetParts = function () {
    var self = this;
    this.parts.forEach(function (part) {
      self.resetParts[part];
    });
  };
  p5.Score.prototype.resetPart = function (i) {
    this.parts[i].stop();
    this.parts[i].partStep = 0;
    for (var p in this.parts[i].phrases) {
      if (this.parts[i]) {
        this.parts[i].phrases[p].phraseStep = 0;
      }
    }
  };
  /**
   *  Establecer el tempo para todas las partes de la partitura
   *
   *  @method setBPM
   *  @param {Number} BPM      Pulsaciones por minuto
   *  @param {Number} rampTime Segundos a partir de ahora
   */
  p5.Score.prototype.setBPM = function (bpm, rampTime) {
    for (var i in this.parts) {
      if (this.parts[i]) {
        this.parts[i].setBPM(bpm, rampTime);
      }
    }
  };
  function playNextPart(aScore) {
    aScore.currentPart++;
    if (aScore.currentPart >= aScore.parts.length) {
      aScore.scoreStep = 0;
      aScore.onended();
    } else {
      aScore.scoreStep = 0;
      aScore.parts[aScore.currentPart - 1].stop();
      aScore.parts[aScore.currentPart].start();
    }
  }
}(master);
var soundloop;
'use strict';
soundloop = function () {
  var p5sound = master;
  var Clock = Tone_core_Clock;
  /**
   * SoundLoop
   *
   * @class p5.SoundLoop
   * @constructor - constructor
   *
   * @param {Function} callback esta función se llamará en cada iteración del bucle
   * @param {Number|String} [interval] cantidad de tiempo o pulsaciones para cada iteración del ciclo
   *                                       predeterminado en 1
   *
   * @example - ejemplo 
   * <div><code>
   * let click;
   * let looper1;
   *
   * function preload() {
   *   click = loadSound('assets/drum.mp3');
   * }
   *
   * function setup() {
   *   //la llamada de vuelta del bucle es pasada de timeFromNow
   *   //este valor debe utilizarse como punto de referencia de
   *   //que programar sonidos
   *   looper1 = new p5.SoundLoop(function(timeFromNow){
   *     click.play(timeFromNow);
   *     background(255 * (looper1.iterations % 2));
   *     }, 2);
   *
   *   //detenerse después de 10 iteraciones;
   *   looper1.maxIterations = 10;
   *   //iniciar el ciclo
   *   looper1.start();
   * }
   * </code></div>
   */
  p5.SoundLoop = function (callback, interval) {
    this.callback = callback;
    /**
       * musicalTimeMode usa <a href = "https://github.com/Tonejs/Tone.js/wiki/Time">Tone.Time</a> convention
    * true if string, false if number
       * @property {Boolean} musicalTimeMode
       */
    this.musicalTimeMode = typeof this._interval === 'number' ? false : true;
    this._interval = interval || 1;
    /**
     * musicalTimeMode variables - variables
     * modificar estos solo cuando el intervalo se especifica en formato musicalTime como una cadena
     */
    this._timeSignature = 4;
    this._bpm = 60;
    this.isPlaying = false;
    /**
     * Establece un límite al número de bucles para jugar. predeterminado a Infinity
     * @property {Number} maxIterations
     */
    this.maxIterations = Infinity;
    var self = this;
    this.clock = new Clock({
      'callback': function (time) {
        var timeFromNow = time - p5sound.audiocontext.currentTime;
        /**
         * No inicie la devolución de llamada si timeFromNow es <0
         * Esto suele ocurrir durante unos milisegundos cuando la página
         * no está completamente cargada.
         *
         * La devolución de llamada solo se debe llamar hasta que se alcance el máximo
         */
        if (timeFromNow > 0 && self.iterations <= self.maxIterations) {
          self.callback(timeFromNow);
        }
      },
      'frequency': this._calcFreq()
    });
  };
  /**
   * Iniciar el bucle
   * @method  start - iniciar
   * @param  {Number} [timeFromNow] programar una hora de inicio
   */
  p5.SoundLoop.prototype.start = function (timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    if (!this.isPlaying) {
      this.clock.start(now + t);
      this.isPlaying = true;
    }
  };
  /**
   * Detener el bucle
   * @method  stop - detener
   * @param  {Number} [timeFromNow] programar una hora de parada
   */
  p5.SoundLoop.prototype.stop = function (timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    if (this.isPlaying) {
      this.clock.stop(now + t);
      this.isPlaying = false;
    }
  };
  /**
   * Pausar el bucle
   * @method pause - pausar 
   * @param  {Number} [timeFromNow] programar un tiempo de pausa
   */
  p5.SoundLoop.prototype.pause = function (timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    if (this.isPlaying) {
      this.clock.pause(now + t);
      this.isPlaying = false;
    }
  };
  /**
   * Sincronizar bucles. Utilice este método para iniciar dos bucles más en sincronización
   * o para iniciar un bucle en sincronización con un bucle que ya se está reproduciendo.
   * Este método programará el bucle implícito en sincronización con el bucle maestro explícito, es decir,
   * loopToStart.syncedStart (loopToSyncWith)
   * 
   * @method  syncedStart
   * @param  {Object} otherLoop   un p5.SoundLoop para sincronizar
   * @param  {Number} [timeFromNow] Inicie los bucles en sincronía después de segundos timeFromNow 
   */
  p5.SoundLoop.prototype.syncedStart = function (otherLoop, timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    if (!otherLoop.isPlaying) {
      otherLoop.clock.start(now + t);
      otherLoop.isPlaying = true;
      this.clock.start(now + t);
      this.isPlaying = true;
    } else if (otherLoop.isPlaying) {
      var time = otherLoop.clock._nextTick - p5sound.audiocontext.currentTime;
      this.clock.start(now + time);
      this.isPlaying = true;
    }
  };
  /**
   * Actualiza el valor de frecuencia, reflejado en la próxima devolución de llamada
   * @private - privado
   * @method  _update
   */
  p5.SoundLoop.prototype._update = function () {
    this.clock.frequency.value = this._calcFreq();
  };
  /**
   * Calcule la frecuencia de la devolución de llamada del reloj en función de bpm, intervalo y firma de tiempo
   * @private - privado
   * @method  _calcFreq
   * @return {Number} nuevo valor de frecuencia de reloj
   */
  p5.SoundLoop.prototype._calcFreq = function () {
    //Modo de segundos, bpm / timesignature no tiene ningún efecto
    if (typeof this._interval === 'number') {
      this.musicalTimeMode = false;
      return 1 / this._interval;
    } else if (typeof this._interval === 'string') {
      this.musicalTimeMode = true;
      return this._bpm / 60 / this._convertNotation(this._interval) * (this._timeSignature / 4);
    }
  };
  /**
   * Convertir notación de formato de tiempo musical a segundos
   * Usa <a href = "https://github.com/Tonejs/Tone.js/wiki/Time">Tone.Time</a> convención
   * @private - privado
   * @method _convertNotation
   * @param  {String} value valor a convertir
   * @return {Number}       valor convertido en segundos
   */
  p5.SoundLoop.prototype._convertNotation = function (value) {
    var type = value.slice(-1);
    value = Number(value.slice(0, -1));
    switch (type) {
    case 'm':
      return this._measure(value);
    case 'n':
      return this._note(value);
    default:
      console.warn('Specified interval is not formatted correctly. See Tone.js ' + 'timing reference for more info: https://github.com/Tonejs/Tone.js/wiki/Time');
    }
  };
  /**
   * Métodos auxiliares de conversión de medida y nota
   * @private - privado
   * @method  _measure
   * @private - privado
   * @method  _note
   */
  p5.SoundLoop.prototype._measure = function (value) {
    return value * this._timeSignature;
  };
  p5.SoundLoop.prototype._note = function (value) {
    return this._timeSignature / value;
  };
  /**
   * Getters y Setters, configurar cualquier parámetro dará como resultado un cambio en la frecuencia del reloj,
   * que se reflejará después de que la siguiente devolución de llamada
   * pulsaciones por minuto (el valor predeterminado es 60)
   * @property {Number} bpm
   */
  Object.defineProperty(p5.SoundLoop.prototype, 'bpm', {
    get: function () {
      return this._bpm;
    },
    set: function (bpm) {
      if (!this.musicalTimeMode) {
        console.warn('Changing the BPM in "seconds" mode has no effect. ' + 'BPM is only relevant in musicalTimeMode ' + 'when the interval is specified as a string ' + '("2n", "4n", "1m"...etc)');
      }
      this._bpm = bpm;
      this._update();
    }
  });
  /**
   * número de negras en un compás (predeterminado en 4)
   * @property {Number} timeSignature
   */
  Object.defineProperty(p5.SoundLoop.prototype, 'timeSignature', {
    get: function () {
      return this._timeSignature;
    },
    set: function (timeSig) {
      if (!this.musicalTimeMode) {
        console.warn('Changing the timeSignature in "seconds" mode has no effect. ' + 'BPM is only relevant in musicalTimeMode ' + 'when the interval is specified as a string ' + '("2n", "4n", "1m"...etc)');
      }
      this._timeSignature = timeSig;
      this._update();
    }
  });
  /**
   * longitud del intervalo de bucles
   * @property {Number|String} interval - intervalo
   */
  Object.defineProperty(p5.SoundLoop.prototype, 'interval', {
    get: function () {
      return this._interval;
    },
    set: function (interval) {
      this.musicalTimeMode = typeof interval === 'Number' ? false : true;
      this._interval = interval;
      this._update();
    }
  });
  /**
   * cuántas veces se ha llamado a la devolución de llamada hasta ahora
   * @property {Number} iterations - iteraciones
   * @readonly
   */
  Object.defineProperty(p5.SoundLoop.prototype, 'iterations', {
    get: function () {
      return this.clock.ticks;
    }
  });
  return p5.SoundLoop;
}(master, Tone_core_Clock);
var compressor;
compressor = function () {
  'use strict';
  var p5sound = master;
  var Effect = effect;
  var CustomError = errorHandler;
  /**
   * Compressor es una clase de efectos de audio que realiza compresión dinámica 
   * en una fuente de entrada de audio. Esta es una técnica muy utilizada 
   * en la producción musical y sonora. La compresión crea un sonido general más alto, rico y
   * completo al bajar el volumen de los altavoces y aumentar el de los softs.
   * La compresión se puede utilizar para evitar el recorte (distorsión del
   * sonido debido a picos de volumen) y es especialmente útil cuando se reproducen muchos sonidos
   * a la vez. La compresión se puede utilizar en fuentes de sonido individuales además
   * de la salida maestra.
   *
   * Esta clase se extiende <a href = "/reference/#/p5.Effect">p5.Effect</a>.  
   * Metódos <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>, 
   * <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, y 
   * <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> are available.
   *
   * @class p5.Compressor
   * @constructor - constructor
   * @extends p5.Effect
   *
   * 
   */
  p5.Compressor = function () {
    Effect.call(this);
    /**
       * El p5.Compressor está construido con un<a href="https://www.w3.org/TR/webaudio/#the-dynamicscompressornode-interface" 
     *   target="_blank" title="W3 spec for Dynamics Compressor Node">Web Audio Dynamics Compressor Node
     *   </a>
       * @property {AudioNode} compressor - compresor
       */
    this.compressor = this.ac.createDynamicsCompressor();
    this.input.connect(this.compressor);
    this.compressor.connect(this.wet);
  };
  p5.Compressor.prototype = Object.create(Effect.prototype);
  /**
  * Realiza la misma función que .connect, pero también acepta parámetros
  * oopcionales para configurar los audioParams del compresor. 
  * @method process 
  *
  * @param {Object} src        Fuente de sonido para ser conectada
  * 
  * @param {Number} [attack]    La cantidad de tiempo (en segundos) para reducir la ganancia en 10dB,
  *                            predeterminado = .003, rango 0 - 1
  * @param {Number} [knee]       Un valor en decibelios que representa el rango por encima del
  *                            umbral donde la curva pasa suavemente a la parte de "relación".
  *                            predeterminado = 30, rango 0 - 40
  * @param {Number} [ratio]      La cantidad de cambio de dB en la entrada para un cambio de 1 dB en la salida.
  *                            predeterminado = 12, rango 1 - 20
  * @param {Number} [threshold]  El valor de decibelios por encima del cual la compresión comenzará a surtir efecto.
  *                            predeterminado = - 24, rango - 100 - 0
  * @param {Number} [release]    La cantidad de tiempo (en segundos) para aumentar la ganancia en 10dB
  *                            predeterminado = .25, rango 0-1
  */
  p5.Compressor.prototype.process = function (src, attack, knee, ratio, threshold, release) {
    src.connect(this.input);
    this.set(attack, knee, ratio, threshold, release);
  };
  /**
   * Configure los parámetros de un compresor. 
   * @method  set - configurar
   * @param {Number} attack     La cantidad de tiempo (en segundos) para reducir la ganancia en 10dB,
   *                            predeterminado = .003, rango 0 - 1
   * @param {Number} knee       Un valor en decibelios que representa el rango por encima del
   *                            umbral donde la curva pasa suavemente a la parte de "relación".
   *                            predeterminado = 30, rango 0 - 40
   * @param {Number} ratio      La cantidad de cambio de dB en la entrada para un cambio de 1 dB en la salida.
   *                            predeterminado = 12, rango 1 - 20
   * @param {Number} threshold  El valor de decibelios por encima del cual la compresión comenzará a surtir efecto.
   *                            predeterminado = -24, rango -100-0
   * @param {Number} release    La cantidad de tiempo (en segundos) para aumentar la ganancia en 10dB
   *                            predeterminado = .25, rango 0-1
   */
  p5.Compressor.prototype.set = function (attack, knee, ratio, threshold, release) {
    if (typeof attack !== 'undefined') {
      this.attack(attack);
    }
    if (typeof knee !== 'undefined') {
      this.knee(knee);
    }
    if (typeof ratio !== 'undefined') {
      this.ratio(ratio);
    }
    if (typeof threshold !== 'undefined') {
      this.threshold(threshold);
    }
    if (typeof release !== 'undefined') {
      this.release(release);
    }
  };
  /**
   * Obtenga el ataque actual o establezca el valor con / time ramp
   * 
   * 
   * @method attack - atacar
   * @param {Number} [attack] El ataque es la cantidad de tiempo (en segundos) para reducir la ganancia en 10dB,
   *                          default = .003, range 0 - 1
   * @param {Number} [time]  Asignar valor de tiempo para programar el cambio de valor
   */
  p5.Compressor.prototype.attack = function (attack, time) {
    var t = time || 0;
    if (typeof attack == 'number') {
      this.compressor.attack.value = attack;
      this.compressor.attack.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.attack.linearRampToValueAtTime(attack, this.ac.currentTime + 0.02 + t);
    } else if (typeof attack !== 'undefined') {
      attack.connect(this.compressor.attack);
    }
    return this.compressor.attack.value;
  };
  /**
   * Obtener el knee actual o establecer el valor con / time ramp 
   * 
   * @method knee
   * @param {Number} [knee] Un valor en decibelios que representa el rango por encima del
   *                       umbral donde la curva pasa suavemente a la parte de "proporción".
   *                        predeterminado = 30, rango 0 - 40
   * @param {Number} [time]  Asignar valor de tiempo para programar el cambio de valor
   */
  p5.Compressor.prototype.knee = function (knee, time) {
    var t = time || 0;
    if (typeof knee == 'number') {
      this.compressor.knee.value = knee;
      this.compressor.knee.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.knee.linearRampToValueAtTime(knee, this.ac.currentTime + 0.02 + t);
    } else if (typeof knee !== 'undefined') {
      knee.connect(this.compressor.knee);
    }
    return this.compressor.knee.value;
  };
  /**
   * Obtener la relación actual o establecer el valor con / rampa de tiempo
   * @method ratio
   *
   * @param {Number} [ratio]      La cantidad de cambio de dB en la entrada para un cambio de 1 dB en la salida.
   *                           predeterminado = 12, rango 1 - 20 
   * @param {Number} [time]  Asignar valor de tiempo para programar el cambio de valor
   */
  p5.Compressor.prototype.ratio = function (ratio, time) {
    var t = time || 0;
    if (typeof ratio == 'number') {
      this.compressor.ratio.value = ratio;
      this.compressor.ratio.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.ratio.linearRampToValueAtTime(ratio, this.ac.currentTime + 0.02 + t);
    } else if (typeof ratio !== 'undefined') {
      ratio.connect(this.compressor.ratio);
    }
    return this.compressor.ratio.value;
  };
  /**
   * Obtener el umbral actual o establecer el valor con / time ramp
   * @method threshold - umbral
   *
   * @param {Number} threshold  El valor de decibelios por encima del cual la compresión comenzará a surtir efecto.
   *                            predeterminado = -24, rango -100-0
   * @param {Number} [time]  Asignar valor de tiempo para programar el cambio de valor
   */
  p5.Compressor.prototype.threshold = function (threshold, time) {
    var t = time || 0;
    if (typeof threshold == 'number') {
      this.compressor.threshold.value = threshold;
      this.compressor.threshold.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.threshold.linearRampToValueAtTime(threshold, this.ac.currentTime + 0.02 + t);
    } else if (typeof threshold !== 'undefined') {
      threshold.connect(this.compressor.threshold);
    }
    return this.compressor.threshold.value;
  };
  /**
   * Obtener la versión actual o establecer el valor con / time ramp
   * @method release - versión
   *
   * @param {Number} release    La cantidad de tiempo (en segundos) para aumentar la ganancia en 10dB
   *                            predeterminado = .25, rango 0-1
   *
   * @param {Number} [time]  Asignar valor de tiempo para programar el cambio de valor
   */
  p5.Compressor.prototype.release = function (release, time) {
    var t = time || 0;
    if (typeof release == 'number') {
      this.compressor.release.value = release;
      this.compressor.release.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.release.linearRampToValueAtTime(release, this.ac.currentTime + 0.02 + t);
    } else if (typeof number !== 'undefined') {
      release.connect(this.compressor.release);
    }
    return this.compressor.release.value;
  };
  /**
   * Devuelve el valor de reducción actual
   *
   * @method reduction - reducción
   * @return {Number} Valor de la cantidad de reducción de ganancia que se aplica a la señal
   */
  p5.Compressor.prototype.reduction = function () {
    return this.compressor.reduction.value;
  };
  p5.Compressor.prototype.dispose = function () {
    Effect.prototype.dispose.apply(this);
    if (this.compressor) {
      this.compressor.disconnect();
      delete this.compressor;
    }
  };
  return p5.Compressor;
}(master, effect, errorHandler);
var soundRecorder;
'use strict';
soundRecorder = function () {
  // inspiration: recorder.js, Tone.js & typedarray.org
  var p5sound = master;
  var convertToWav = helpers.convertToWav;
  var ac = p5sound.audiocontext;
  /**
   *  <p>Grabe sonidos para reproducirlos y / o guardarlos como un archivo .wav.
   *  El p5.SoundRecorder graba toda la salida de sonido de su boceto,
   *  o se le puede asignar una fuente específica con setInput ().</p>
   *  <p>El método record () acepta un p5.SoundFile como parámetro.
   *  Cuando se detiene la reproducción (ya sea después de un período de tiempo
   *  determinado o con el método stop ()), p5.SoundRecorder enviará su grabación
   *  a ese p5.SoundFile para su reproducción.</p>
   *
   *  @class p5.SoundRecorder
   *  @constructor - constructor
   *  @example - ejemplo
   *  <div><code>
   *  let mic, recorder, soundFile;
   *  let state = 0;
   *
   *  function setup() {
   *    background(200);
   *    // crear un audio en
   *    mic = new p5.AudioIn();
   *
   *    //solicita al usuario que habilite el micrófono de su navegador
   *    mic.start();
   *
   *    // crear una grabadora de sonido
   *    recorder = new p5.SoundRecorder();
   *
   *    // conecte el micrófono a la grabadora
   *    recorder.setInput(mic);
   *
   *    // este archivo de sonido se utilizará para
   *    // reproducir y guardar la grabación
   *    soundFile = new p5.SoundFile();
   *
   *    text('keyPress to record', 20, 20);
   *  }
   *
   *  function keyPressed() {
   *    // asegúrese de que el usuario haya habilitado el micrófono
   *    if (state === 0 && mic.enabled) {
   *
   *      // grabar en nuestro p5.SoundFile
   *      recorder.record(soundFile);
   *
   *      background(255,0,0);
   *      text('Recording!', 20, 20);
   *      state++;
   *    }
   *    else if (state === 1) {
   *      background(0,255,0);
   *
   *      // detener la grabadora y
   *      // enviar resultado a soundFile
   *      recorder.stop();
   *
   *      text('Stopped', 20, 20);
   *      state++;
   *    }
   *
   *    else if (state === 2) {
   *      soundFile.play(); // play the result!
   *      save(soundFile, 'mySound.wav');
   *      state++;
   *    }
   *  }
   *  </div></code>
   */
  p5.SoundRecorder = function () {
    this.input = ac.createGain();
    this.output = ac.createGain();
    this.recording = false;
    this.bufferSize = 1024;
    this._channels = 2;
    // stereo (default)
    this._clear();
    // inicializar variables
    this._jsNode = ac.createScriptProcessor(this.bufferSize, this._channels, 2);
    this._jsNode.onaudioprocess = this._audioprocess.bind(this);
    /**
     *  devolución de llamada invocada cuando finaliza la grabación
     *  @private - privado
     *  @type Function(Float32Array)
     */
    this._callback = function () {
    };
    // conexiones
    this._jsNode.connect(p5.soundOut._silentNode);
    this.setInput();
    // agregue este p5.SoundFile al soundArray
    p5sound.soundArray.push(this);
  };
  /**
   *  Conecte un dispositivo específico al p5.SoundRecorder.
   *  Si no se proporciona ningún parámetro, p5.SoundRecorer grabará
   *  todos los p5.sound audibles de su boceto.
   *
   *  @method  setInput
   *  @param {Object} [unit] p5.objeto de sonido o una unidad de audio web
   *                         que emite sonido
   */
  p5.SoundRecorder.prototype.setInput = function (unit) {
    this.input.disconnect();
    this.input = null;
    this.input = ac.createGain();
    this.input.connect(this._jsNode);
    this.input.connect(this.output);
    if (unit) {
      unit.connect(this.input);
    } else {
      p5.soundOut.output.connect(this.input);
    }
  };
  /**
   *  Iniciar la grabación. Para acceder a la grabación, proporcione
   *  un p5.SoundFile como primer parámetro. El p5.SoundRecorder enviará
   *  su grabación a ese p5.SoundFile para su reproducción una vez que
   *  se complete la grabación. Los parámetros opcionales incluyen la duración
   *  (en segundos) de la grabación y una función de devolución de llamada
   *  que se llamará una vez que la grabación completa se haya
   *  transferido al p5.SoundFile.
   *
   *  @method  record - grabar
   *  @param  {p5.SoundFile}   soundFile    p5.SoundFile
   *  @param  {Number}   [duration] Tiempo (en segundos)
   *  @param  {Function} [callback] El nombre de una función que será
   *                                llamada una vez que la grabación termine. 
   */
  p5.SoundRecorder.prototype.record = function (sFile, duration, callback) {
    this.recording = true;
    if (duration) {
      this.sampleLimit = Math.round(duration * ac.sampleRate);
    }
    if (sFile && callback) {
      this._callback = function () {
        this.buffer = this._getBuffer();
        sFile.setBuffer(this.buffer);
        callback();
      };
    } else if (sFile) {
      this._callback = function () {
        this.buffer = this._getBuffer();
        sFile.setBuffer(this.buffer);
      };
    }
  };
  /**
   *  Detén la grabación. Una vez que se detiene la grabación, los
   *  resultados se enviarán al archivo p5.SoundFile que se proporcionó
   *  en .record (), y si se proporcionó una función de devolución de
   *  llamada en el registro, se llamará a esa función.
   *
   *  @method  stop - detener
   */
  p5.SoundRecorder.prototype.stop = function () {
    this.recording = false;
    this._callback();
    this._clear();
  };
  p5.SoundRecorder.prototype._clear = function () {
    this._leftBuffers = [];
    this._rightBuffers = [];
    this.recordedSamples = 0;
    this.sampleLimit = null;
  };
  /**
   *  método interno llamado en proceso de audio
   *
   *  @private - privado
   *  @param   {AudioProcessorEvent} event - evento
   */
  p5.SoundRecorder.prototype._audioprocess = function (event) {
    if (this.recording === false) {
      return;
    } else if (this.recording === true) {
      // si pasamos la duración, entonces deténgase ...
      if (this.sampleLimit && this.recordedSamples >= this.sampleLimit) {
        this.stop();
      } else {
        // obtener datos del canal
        var left = event.inputBuffer.getChannelData(0);
        var right = event.inputBuffer.getChannelData(1);
        // clonar las muestras
        this._leftBuffers.push(new Float32Array(left));
        this._rightBuffers.push(new Float32Array(right));
        this.recordedSamples += this.bufferSize;
      }
    }
  };
  p5.SoundRecorder.prototype._getBuffer = function () {
    var buffers = [];
    buffers.push(this._mergeBuffers(this._leftBuffers));
    buffers.push(this._mergeBuffers(this._rightBuffers));
    return buffers;
  };
  p5.SoundRecorder.prototype._mergeBuffers = function (channelBuffer) {
    var result = new Float32Array(this.recordedSamples);
    var offset = 0;
    var lng = channelBuffer.length;
    for (var i = 0; i < lng; i++) {
      var buffer = channelBuffer[i];
      result.set(buffer, offset);
      offset += buffer.length;
    }
    return result;
  };
  p5.SoundRecorder.prototype.dispose = function () {
    this._clear();
    // eliminar la referencia de soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    this._callback = function () {
    };
    if (this.input) {
      this.input.disconnect();
    }
    this.input = null;
    this._jsNode = null;
  };
  /**
   * Guarde un archivo p5.SoundFile como un archivo .wav. El navegador le
   * pedirá al usuario que descargue el archivo en su dispositivo.
   * Para cargar audio a un servidor, use
   * <a href="/docs/reference/#/p5.SoundFile/saveBlob">`p5.SoundFile.saveBlob`</a>.
   *
   *  @for p5
   *  @method saveSound
   *  @param  {p5.SoundFile} soundFile p5.SoundFile que desea guardar
   *  @param  {String} fileName      nombre del archivo .wav resultante.
   */
  // agregar a p5.prototype ya que es usado por el método p5 `save ()`.
  p5.prototype.saveSound = function (soundFile, fileName) {
    const dataView = convertToWav(soundFile.buffer);
    p5.prototype.writeFile([dataView], fileName, 'wav');
  };
}(master, helpers);
var peakdetect;
'use strict';
peakdetect = function () {
  /**
   *  <p>PeakDetecttrabaja en conjunto con p5.FFT para
   *  buscar inicios en parte o en todo el espectro de frecuencias.
   *  </p>
   *  <p>
   *  Para usar p5.PeakDetect, llame a <code> update </code> en el bucle de extracción y 
   *  pase un objeto p5.FFT.
   *  </p>
   *  <p>
   *  Puede escuchar una parte específica del espectro de frecuencias
   *  configurando el rango entre <code> freq1 </code> y <code> freq2 </code>.
   *  </p>
   *
   *  <p><code>threshold</code> es el umbral para detectar un pico,
   *  escalado entre 0 y 1. Es logarítmico, por lo que 0.1 
   *  es la mitad de alto que 1,0.</p>
   *
   *  <p>
   *  El método de actualización está destinado a ejecutarse en el bucle de extracción y
   *  <b>frames</b> determina cuántos bucles deben pasar antes
   *  de que se pueda detectar otro pico.
   *  Por ejemplo, si el frameRate() = 60, podrías detectar el ritmo de una
   *  canción de 120 pulsaciones por minuto con esta ecuación:
   *  <code> framesPerPeak = 60 / (estimatedBPM / 60 );</code>
   *  </p>
   *
   *  <p>
   *  Basado en un ejemplo aportado por @ b2renger, y una explicación simple de detección
   *  de pulsaciones de <a
   *  href="http://www.airtightinteractive.com/2013/10/making-audio-reactive-visuals/"
   *  target="_blank">Felix Turner</a>.
   *  </p>
   *
   *  @class  p5.PeakDetect
   *  @constructor - constructor
   *  @param {Number} [freq1]     lowFrequency - por defecto a 20Hz
   *  @param {Number} [freq2]     highFrequency - predeterminado a 20000 Hz
   *  @param {Number} [threshold] Umbral para detectar una pulsación entre 0 y 1
   *                            escalado logarítmicamente donde 0.1 es la mitad del volumen
   *                            de 1.0. El valor predeterminado es 0.35.
   *  @param {Number} [framesPerPeak]    El valor predeterminado es 20.
   *  @example - ejemplo
   *  <div><code>
   *
   *  let cnv, soundFile, fft, peakDetect;
   *  let ellipseWidth = 10;
   *
   *  function preload() {
   *    soundFile = loadSound('assets/beat.mp3');
   *  }
   *
   *  function setup() {
   *    background(0);
   *    noStroke();
   *    fill(255);
   *    textAlign(CENTER);
   *
   *    //p5.PeakDetect requiere un p5.FFT
   *    fft = new p5.FFT();
   *    peakDetect = new p5.PeakDetect();
   *  }
   *
   *  function draw() {
   *    background(0);
   *    text('click to play/pause', width/2, height/2);
   *
   *    // PeakDetect acepta un análisis posterior de FFT
   *    fft.analyze();
   *    peakDetect.update(fft);
   *
   *    if ( peakDetect.isDetected ) {
   *      ellipseWidth = 50;
   *    } else {
   *      ellipseWidth *= 0.95;
   *    }
   *
   *    ellipse(width/2, height/2, ellipseWidth, ellipseWidth);
   *  }
   *
   *  // alternar reproducir / detener cuando se hace clic en el lienzo
   *  function mouseClicked() {
   *    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
   *      if (soundFile.isPlaying() ) {
   *        soundFile.stop();
   *      } else {
   *        soundFile.play();
   *      }
   *    }
   *  }
   *  </code></div>
   */
  p5.PeakDetect = function (freq1, freq2, threshold, _framesPerPeak) {
    // framesPerPeak determina con qué frecuencia buscar una pulsación. 
    // Si se proporciona un latido, intente buscar una pulsación basada en bpm
    this.framesPerPeak = _framesPerPeak || 20;
    this.framesSinceLastPeak = 0;
    this.decayRate = 0.95;
    this.threshold = threshold || 0.35;
    this.cutoff = 0;
    // cuánto aumentar el corte
    // TO DO: documentar esto / descubrir cómo hacerlo accesible
    this.cutoffMult = 1.5;
    this.energy = 0;
    this.penergy = 0;
    // TO DO: documentar esta propiedad / averiguar cómo hacerla accesible
    this.currentValue = 0;
    /**
     *  isDetected Se establece en verdadero cuando se detecta un pico.
     *
     *  @attribute isDetected {Boolean}
     *  @default  false -  falso
     */
    this.isDetected = false;
    this.f1 = freq1 || 40;
    this.f2 = freq2 || 20000;
    // función para llamar cuando se detecta un pico
    this._onPeak = function () {
    };
  };
  /**
   *  El método de actualización se ejecuta en el bucle de extracción.
   *
   *  Acepta un objeto FFT. Debe llamar a .analyze () en el
   *  objeto FFT antes de actualizar el peakDetect porque se
   *  basa en un análisis FFT completo.
   *
   *  @method  update - actualizar
   *  @param  {p5.FFT} fftObject A p5.FFT object
   */
  p5.PeakDetect.prototype.update = function (fftObject) {
    var nrg = this.energy = fftObject.getEnergy(this.f1, this.f2) / 255;
    if (nrg > this.cutoff && nrg > this.threshold && nrg - this.penergy > 0) {
      // activar devolución de llamada
      this._onPeak();
      this.isDetected = true;
      // rebote
      this.cutoff = nrg * this.cutoffMult;
      this.framesSinceLastPeak = 0;
    } else {
      this.isDetected = false;
      if (this.framesSinceLastPeak <= this.framesPerPeak) {
        this.framesSinceLastPeak++;
      } else {
        this.cutoff *= this.decayRate;
        this.cutoff = Math.max(this.cutoff, this.threshold);
      }
    }
    this.currentValue = nrg;
    this.penergy = nrg;
  };
  /**
   *  onPeak acepta dos argumentos: una función para llamar cuando
   *  se detecta un pico. El valor del pico, entre 0.0 y
   *  1.0, se pasa a la devolución de llamada.
   *
   *  @method  onPeak
   *  @param  {Function} callback Nombre de una función que
   *                              se llamará cuando se detecte
   *                              un pico.
   *  @param  {Object}   [val]    Valor opcional para pasar
   *                              a la función cuando se detecta
   *                              un pico.
   *  @example - ejemplo 
   *  <div><code>
   *  let cnv, soundFile, fft, peakDetect;
   *  let ellipseWidth = 0;
   *
   *  function preload() {
   *    soundFile = loadSound('assets/beat.mp3');
   *  }
   *
   *  function setup() {
   *    cnv = createCanvas(100,100);
   *    textAlign(CENTER);
   *
   *    fft = new p5.FFT();
   *    peakDetect = new p5.PeakDetect();
   *
   *    setupSound();
   *
   *    // cuando se detecta una pulsación, llame a triggerBeat ()
   *    peakDetect.onPeak(triggerBeat);
   *  }
   *
   *  function draw() {
   *    background(0);
   *    fill(255);
   *    text('click to play', width/2, height/2);
   *
   *    fft.analyze();
   *    peakDetect.update(fft);
   *
   *    ellipseWidth *= 0.95;
   *    ellipse(width/2, height/2, ellipseWidth, ellipseWidth);
   *  }
   *
   *  // esta función es llamada por peakDetect.onPeak
   *  function triggerBeat() {
   *    ellipseWidth = 50;
   *  }
   *
   *  // el clic del ratón inicia / detiene el sonido
   *  function setupSound() {
   *    cnv.mouseClicked( function() {
   *      if (soundFile.isPlaying() ) {
   *        soundFile.stop();
   *      } else {
   *        soundFile.play();
   *      }
   *    });
   *  }
   *  </code></div>
   */
  p5.PeakDetect.prototype.onPeak = function (callback, val) {
    var self = this;
    self._onPeak = function () {
      callback(self.energy, val);
    };
  };
}();
var gain;
'use strict';
gain = function () {
  var p5sound = master;
  /**
   *  Un nodo de ganancia es útil para establecer el volumen relativo del sonido.
   *  Por lo general, se usa para construir mezcladores.
   *
   *  @class p5.Gain
   *  @constructor - constructor
   *  @example - ejemplo
   *  <div><code>
   *
   * // Cargar dos archivos de sonido y fundido cruzado entre ellos
   * let sound1,sound2;
   * let gain1, gain2, gain3;
   *
   * function preload(){
   *   soundFormats('ogg', 'mp3');
   *   sound1 = loadSound('assets/Damscray_-_Dancing_Tiger_01');
   *   sound2 = loadSound('assets/beat.mp3');
   * }
   *
   * function setup() {
   *   createCanvas(400,200);
   *
   *   // crear una ganancia 'maestra' a la que conectaremos ambos archivos de sonido
   *   gain3 = new p5.Gain();
   *   gain3.connect();
   *
   *   // configurar el primer sonido para jugar
   *   sound1.rate(1);
   *   sound1.loop();
   *   sound1.disconnect(); // diconnect from p5 output
   *
   *   gain1 = new p5.Gain(); // setup a gain node
   *   gain1.setInput(sound1); // connect the first sound to its input
   *   gain1.connect(gain3); // connect its output to the 'master'
   *
   *   sound2.rate(1);
   *   sound2.disconnect();
   *   sound2.loop();
   *
   *   gain2 = new p5.Gain();
   *   gain2.setInput(sound2);
   *   gain2.connect(gain3);
   *
   * }
   *
   * function draw(){
   *   background(180);
   *
   *   // calcular la distancia horizontal entre el ratón y la derecha de la pantalla
   *   let d = dist(mouseX,0,width,0);
   *
   *   // mapear la posición horizontal del ratón a los valores utilizables para el control de volumen del sonido1
   *   let vol1 = map(mouseX,0,width,0,1);
   *   let vol2 = 1-vol1; // cuando el sonido es fuerte, el sonido es silencioso y viceversa
   *
   *   gain1.amp(vol1,0.5,0);
   *   gain2.amp(vol2,0.5,0);
   *
   *   // mapear la posición vertical delratón a los valores utilizables para el 'control de volumen maestro'
   *   let vol3 = map(mouseY,0,height,0,1);
   *   gain3.amp(vol3,0.5,0);
   * }
   *</code></div>
   *
   */
  p5.Gain = function () {
    this.ac = p5sound.audiocontext;
    this.input = this.ac.createGain();
    this.output = this.ac.createGain();
    // de lo contrario, Safari distorsiona
    this.input.gain.value = 0.5;
    this.input.connect(this.output);
    // agregar al soundArray
    p5sound.soundArray.push(this);
  };
  /**
   *  Conecte una fuente al nodo de ganancia.
   *
   *  @method  setInput
   *  @param  {Object} src     p5.sound / Objeto Web Audio con salida de 
   *                           sonido.
   */
  p5.Gain.prototype.setInput = function (src) {
    src.connect(this.input);
  };
  /**
   *  Enviar salida a un objeto de audio web o p5.sound
   *
   *  @method  connect - conectar
   *  @param  {Object} unit - unidad
   */
  p5.Gain.prototype.connect = function (unit) {
    var u = unit || p5.soundOut.input;
    this.output.connect(u.input ? u.input : u);
  };
  /**
   *  Desconecta todas las salidas.
   *
   *  @method disconnect - desconectar
   */
  p5.Gain.prototype.disconnect = function () {
    if (this.output) {
      this.output.disconnect();
    }
  };
  /**
   *  Establezca el nivel de salida del nodo de ganancia.
   *
   *  @method  amp
   *  @param  {Number} amplitud de volumen entre 0 y 1.0
   *  @param  {Number} [rampTime] crea un desvanecimiento que dura rampTime
   *  @param  {Number} [timeFromNow] programar este evento para que suceda
   *                                segundos a partir de ahora
   */
  p5.Gain.prototype.amp = function (vol, rampTime, tFromNow) {
    var rampTime = rampTime || 0;
    var tFromNow = tFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    var currentVol = this.output.gain.value;
    this.output.gain.cancelScheduledValues(now);
    this.output.gain.linearRampToValueAtTime(currentVol, now + tFromNow);
    this.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime);
  };
  p5.Gain.prototype.dispose = function () {
    // eliminar la referencia de soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    if (this.output) {
      this.output.disconnect();
      delete this.output;
    }
    if (this.input) {
      this.input.disconnect();
      delete this.input;
    }
  };
}(master);
var audioVoice;
'use strict';
audioVoice = function () {
  var p5sound = master;
  /**
   * Clase base para sintetizadores monofónicos. Cualquier extensión de esta clase
   * debe seguir la API e implementar los métodos siguientes para seguir
   * siendo compatible con p5.PolySynth ();
   *
   * @class p5.AudioVoice
   * @constructor - constructor
   */
  p5.AudioVoice = function () {
    this.ac = p5sound.audiocontext;
    this.output = this.ac.createGain();
    this.connect();
    p5sound.soundArray.push(this);
  };
  p5.AudioVoice.prototype.play = function (note, velocity, secondsFromNow, sustime) {
  };
  p5.AudioVoice.prototype.triggerAttack = function (note, velocity, secondsFromNow) {
  };
  p5.AudioVoice.prototype.triggerRelease = function (secondsFromNow) {
  };
  p5.AudioVoice.prototype.amp = function (vol, rampTime) {
  };
  /**
   * Conéctese a objetos p5 o nodos de audio web
   * @method  connect - conectar
   * @param {Object} unit - unidad
   */
  p5.AudioVoice.prototype.connect = function (unit) {
    var u = unit || p5sound.input;
    this.output.connect(u.input ? u.input : u);
  };
  /**
   * Desconectarse de soundOut
   * @method  disconnect - desconectar
   */
  p5.AudioVoice.prototype.disconnect = function () {
    this.output.disconnect();
  };
  p5.AudioVoice.prototype.dispose = function () {
    if (this.output) {
      this.output.disconnect();
      delete this.output;
    }
  };
  return p5.AudioVoice;
}(master);
var monosynth;
'use strict';
monosynth = function () {
  var p5sound = master;
  var AudioVoice = audioVoice;
  var noteToFreq = helpers.noteToFreq;
  var DEFAULT_SUSTAIN = 0.15;
  /**
  *  Un MonoSynth se utiliza como una sola voz para la síntesis de sonido.
  *  Esta es una clase que se utilizará junto con la clase PolySynth.
  *  Los sintetizadores personalizados deben construirse heredando 
  *  de esta clase.
  *
  *  @class p5.MonoSynth
  *  @constructor - constructor
  *  @example - ejemplo
  *  <div><code>
  *  let monoSynth;
  *
  *  function setup() {
  *    let cnv = createCanvas(100, 100);
  *    cnv.mousePressed(playSynth);
  *
  *    monoSynth = new p5.MonoSynth();
  *
  *    textAlign(CENTER);
  *    text('click to play', width/2, height/2);
  *  }
  *
  *  function playSynth() {
  *    // tiempo a partir de ahora (en segundos)
  *    let time = 0;
  *    // duración de la nota (en segundos)
  *    let dur = 0.25;
  *    // velocidad (volumen, de 0 a 1)
  *    let v = 0.2;
  *
  *    monoSynth.play("G3", v, time, dur);
  *    monoSynth.play("C4", v, time += dur, dur);
  *
  *    background(random(255), random(255), 255);
  *    text('click to play', width/2, height/2);
  *  }
  *  </code></div>
  **/
  p5.MonoSynth = function () {
    AudioVoice.call(this);
    this.oscillator = new p5.Oscillator();
    this.env = new p5.Envelope();
    this.env.setRange(1, 0);
    this.env.setExp(true);
    //set params
    this.setADSR(0.02, 0.25, 0.05, 0.35);
    // oscilador -> env -> this.output (ganancia) -> p5.soundOut
    this.oscillator.disconnect();
    this.oscillator.connect(this.output);
    this.env.disconnect();
    this.env.setInput(this.output.gain);
    // restablecer la ganancia del oscilador a 1.0
    this.oscillator.output.gain.value = 1;
    this.oscillator.start();
    this.connect();
    p5sound.soundArray.push(this);
  };
  p5.MonoSynth.prototype = Object.create(p5.AudioVoice.prototype);
  /**
  *  Reproducir le dice al MonoSynth que comience a tocar una nota. Este método
  *  programa la llamada de .triggerAttack y .triggerRelease.
  *
  *  @method play - reproducir
  *  @param {String | Number} anote la nota que desea tocar, especificada como una
  *                                 frecuencia en Hertz (Número) o como un valor midi en
  *                                 formato Note / Octave ("C4", "Eb3" ... etc ")
  *                                 Ve <a href = "https://github.com/Tonejs/Tone.js/wiki/Instruments">
  *                                 Tone</a>. Predeterminado a 440 hz.
  *  @param  {Number} [velocity] velocidad de la nota a tocar (que va de 0 a 1)
  *  @param  {Number} [secondsFromNow]  tiempo a partir de ahora (en segundos) en el que reproduce
  *  @param  {Number} [sustainTime] tiempo para sostener antes de soltar el sobre
  *  @example - ejemplo
  *  <div><code>
  *  let monoSynth;
  *
  *  function setup() {
  *    let cnv = createCanvas(100, 100);
  *    cnv.mousePressed(playSynth);
  *
  *    monoSynth = new p5.MonoSynth();
  *
  *    textAlign(CENTER);
  *    text('click to play', width/2, height/2);
  *  }
  *
  *  function playSynth() {
  *    // tiempo a partir de ahora (en segundos)
  *    let time = 0;
  *    // duración de la nota (en segundos)
  *    let dur = 1/6;
  *    // velocidad de nota (volumen, de 0 a 1)
  *    let v = random();
  *
  *    monoSynth.play("Fb3", v, 0, dur);
  *    monoSynth.play("Gb3", v, time += dur, dur);
  *
  *    background(random(255), random(255), 255);
  *    text('click to play', width/2, height/2);
  *  }
  *  </code></div>
  *
  */
  p5.MonoSynth.prototype.play = function (note, velocity, secondsFromNow, susTime) {
    this.triggerAttack(note, velocity, ~~secondsFromNow);
    this.triggerRelease(~~secondsFromNow + (susTime || DEFAULT_SUSTAIN));
  };
  /**
   *  Active la parte Attack y Decay del sobre.
   *  Similar a mantener presionada una tecla en un piano, pero
   *  mantenga el nivel de sostenido hasta que lo suelte.
   *
   *  @param {String | Number} anote la nota que desea tocar, especificada como una frecuencia
   *                                 en Hertz (Número) o como un valor midi en
   *                                 formato Note / Octave ("C4", "Eb3" ... etc ")
   *                                 Ve <a href = "https://github.com/Tonejs/Tone.js/wiki/Instruments">
   *                                 Tone</a>. Predeterminado a 440 hz
   *  @param  {Number} [velocity] velocidad de la nota a tocar (que va de 0 a 1)
   *  @param  {Number} [secondsFromNow]  tiempo a partir de ahora (en segundos) en el que reproducir
   *  @method  triggerAttack
   *  @example - ejemplo
   *  <div><code>
   *  let monoSynth = new p5.MonoSynth();
   *
   *  function mousePressed() {
   *    monoSynth.triggerAttack("E3");
   *  }
   *
   *  function mouseReleased() {
   *    monoSynth.triggerRelease();
   *  }
   *  </code></div>
   */
  p5.MonoSynth.prototype.triggerAttack = function (note, velocity, secondsFromNow) {
    var secondsFromNow = ~~secondsFromNow;
    var freq = noteToFreq(note);
    var vel = velocity || 0.1;
    this.oscillator.freq(freq, 0, secondsFromNow);
    this.env.ramp(this.output.gain, secondsFromNow, vel);
  };
  /**
   *  Activa la liberación del sobre. Esto es similar a soltar la 
   *  tecla de un piano y dejar que el sonido se desvanezca según el
   *  nivel de liberación y el tiempo de liberación.
   *
   *  @param  {Number} secondsFromNow hora de desencadenar la liberación
   *  @method  triggerRelease
   *  @example - ejemplo
   *  <div><code>
   *  let monoSynth = new p5.MonoSynth();
   *
   *  function mousePressed() {
   *    monoSynth.triggerAttack("E3");
   *  }
   *
   *  function mouseReleased() {
   *    monoSynth.triggerRelease();
   *  }
   *  </code></div>
   */
  p5.MonoSynth.prototype.triggerRelease = function (secondsFromNow) {
    var secondsFromNow = secondsFromNow || 0;
    this.env.ramp(this.output.gain, secondsFromNow, 0);
  };
  /**
   *  Establecer valores como un tradicional
   *  <a href="https://en.wikipedia.org/wiki/Synthesizer#/media/File:ADSR_parameter.svg">
   *  sobre ADSR
   *  </a>.
   *
   *  @method  setADSR
   *  @param {Number} attackTime    Tiempo (en segundos antes de que el
   *                                sobre alcance el nivel de ataque
   *  @param {Number} [decayTime]    Tiempo (en segundos) antes de que el sobre
   *                                alcance el nivel de decaimiento / sostenido
   *  @param {Number} [susRatio]    Relación entre attackLevel y releaseLevel, en una escala de 0 a 1,
   *                                donde 1.0 = attackLevel, 0.0 = releaseLevel.
   *                                SusRatio determina el decayLevel y el nivel en el que se mantendrá la
   *                                parte de sostenido de la envolvente.
   *                                Por ejemplo, si attackLevel es 0.4, releaseLevel es 0 y
   *                                susAmt es 0.5, decayLevel sería 0.2. Si attackLevel aumenta
   *                                a 1.0 (usando <code> setRange </code>), decayLevel
   *                                aumentaría proporcionalmente, para convertirse en 0.5.
   *  @param {Number} [releaseTime]   Tiempo en segundos a partir de ahora (predeterminado en 0)
   */
  p5.MonoSynth.prototype.setADSR = function (attack, decay, sustain, release) {
    this.env.setADSR(attack, decay, sustain, release);
  };
  /**
   * Getters and Setters
   * @property {Number} attack - atacar
   */
  /**
   * @property {Number} decay - decaer
   */
  /**
   * @property {Number} sustain - sostener
   */
  /**
   * @property {Number} release - lanzamiento
   */
  Object.defineProperties(p5.MonoSynth.prototype, {
    'attack': {
      get: function () {
        return this.env.aTime;
      },
      set: function (attack) {
        this.env.setADSR(attack, this.env.dTime, this.env.sPercent, this.env.rTime);
      }
    },
    'decay': {
      get: function () {
        return this.env.dTime;
      },
      set: function (decay) {
        this.env.setADSR(this.env.aTime, decay, this.env.sPercent, this.env.rTime);
      }
    },
    'sustain': {
      get: function () {
        return this.env.sPercent;
      },
      set: function (sustain) {
        this.env.setADSR(this.env.aTime, this.env.dTime, sustain, this.env.rTime);
      }
    },
    'release': {
      get: function () {
        return this.env.rTime;
      },
      set: function (release) {
        this.env.setADSR(this.env.aTime, this.env.dTime, this.env.sPercent, release);
      }
    }
  });
  /**
   * MonoSynth amp
   * @method  amp
   * @param  {Number} vol      volumen deseado
   * @param  {Number} [rampTime] Es hora de alcanzar un nuevo volumen
   * @return {Number}          nuevo valor de volumen
   */
  p5.MonoSynth.prototype.amp = function (vol, rampTime) {
    var t = rampTime || 0;
    if (typeof vol !== 'undefined') {
      this.oscillator.amp(vol, t);
    }
    return this.oscillator.amp().value;
  };
  /**
   *  Conéctese a un objeto p5.sound / Web Audio.
   *
   *  @method  connect - conectar
   *  @param  {Object} unidad A p5.sound u objeto Web Audio
   */
  p5.MonoSynth.prototype.connect = function (unit) {
    var u = unit || p5sound.input;
    this.output.connect(u.input ? u.input : u);
  };
  /**
   *  Desconecte todas las salidas
   *
   *  @method  disconnect - desconectar
   */
  p5.MonoSynth.prototype.disconnect = function () {
    if (this.output) {
      this.output.disconnect();
    }
  };
  /**
   *  Deshágase de MonoSynth y libere sus recursos / memoria.
   *
   *  @method  dispose - disponer
   */
  p5.MonoSynth.prototype.dispose = function () {
    AudioVoice.prototype.dispose.apply(this);
    if (this.env) {
      this.env.dispose();
    }
    if (this.oscillator) {
      this.oscillator.dispose();
    }
  };
}(master, audioVoice, helpers);
var polysynth;
'use strict';
polysynth = function () {
  var p5sound = master;
  var TimelineSignal = Tone_signal_TimelineSignal;
  var noteToFreq = helpers.noteToFreq;
  /**
  *  Una AudioVoice se utiliza como una sola voz para la síntesis de sonido.
  *  La clase PolySynth contiene una matriz de AudioVoice y se ocupa
  *  de las asignaciones de voces, con la configuración de las notas que se tocarán y
  *  os parámetros que se establecerán.
  *
  *  @class p5.PolySynth
  *  @constructor - constructor
  *
  *  @param {Number} [synthVoice]   Una voz de sintetizador monofónica que hereda
  *                                 la clase AudioVoice. El valor predeterminado es p5.MonoSynth
  *  @param {Number} [maxVoices] Número de voces, predeterminado en 8;
  *  @example - ejemplo
  *  <div><code>
  *  let polySynth;
  *
  *  function setup() {
  *    let cnv = createCanvas(100, 100);
  *    cnv.mousePressed(playSynth);
  *
  *    polySynth = new p5.PolySynth();
  *
  *    textAlign(CENTER);
  *    text('click to play', width/2, height/2);
  *  }
  *
  *  function playSynth() {
  *    // duración de la nota (en segundos)
  *    let dur = 1.5;
  *
  *    // tiempo a partir de ahora (en segundos)
  *    let time = 0;
  *
  *    // velocidad (volumen, de 0 a 1)
  *    let vel = 0.1;
  *
  *    // las notas pueden superponerse entre sí
  *    polySynth.play("G2", vel, 0, dur);
  *    polySynth.play("C3", vel, time += 1/3, dur);
  *    polySynth.play("G3", vel, time += 1/3, dur);
  *
  *    background(random(255), random(255), 255);
  *    text('click to play', width/2, height/2);
  *  }
  *  </code></div>
  **/
  p5.PolySynth = function (audioVoice, maxVoices) {
    //audiovoices will contain maxVoices many monophonic synths
    this.audiovoices = [];
    /**
     * Objeto que contiene información sobre qué notas se han tocado y
     * qué notas se están reproduciendo actualmente. Las nuevas notas se agregan
     * como claves sobre la marcha. Si bien una nota ha sido atacada, pero no liberada,
     * el valor de la clave es la voz de audio que está generando esa nota.
     * Cuando se sueltan las notas, el valor de la clave se vuelve indefinido.
     * @property notes - notas
     */
    this.notes = {};
    //índices de la voz de audio utilizada más recientemente y la menos utilizada 
    this._newest = 0;
    this._oldest = 0;
    /**
     * Un PolySynth debe tener al menos 1 voz, el valor predeterminado es 8
     * @property polyvalue
     */
    this.maxVoices = maxVoices || 8;
    /**
     * Monosynth que genera el sonido de cada nota que se dispara. El p5.PolySynth
     * utiliza de forma predeterminada el p5.MonoSynth como su voz.
     * @property AudioVoice
     */
    this.AudioVoice = audioVoice === undefined ? p5.MonoSynth : audioVoice;
    /**
       * Este valor solo debe cambiar cuando se ataca o se libera una nota. Debido a
       * Los tiempos de retraso y sostenimiento, se requiere Tone.TimelineSignal para programar el cambio de valor.
    * @private - privado
       * @property {Tone.TimelineSignal} _voicesInUse
       */
    this._voicesInUse = new TimelineSignal(0);
    this.output = p5sound.audiocontext.createGain();
    this.connect();
    //Construya el número apropiado de voces de audio
    this._allocateVoices();
    p5sound.soundArray.push(this);
  };
  /**
   * Construya el número apropiado de voces de audio
   * @private - privado
   * @method  _allocateVoices
   */
  p5.PolySynth.prototype._allocateVoices = function () {
    for (var i = 0; i < this.maxVoices; i++) {
      this.audiovoices.push(new this.AudioVoice());
      this.audiovoices[i].disconnect();
      this.audiovoices[i].connect(this.output);
    }
  };
  /**
   *  Toca una nota activando noteAttack y noteRelease con tiempo de sostenido
   *
   *  @method  play - reproducir
   *  @param  {Number} [note] nota midi para tocar (de 0 a 127, siendo 60 una C media)
   *  @param  {Number} [velocity] velocidad de la nota a tocar (que va de 0 a 1)
   *  @param  {Number} [secondsFromNow]  tiempo a partir de ahora (en segundos) en el que reproduce
   *  @param  {Number} [sustainTime] tiempo para sostener antes de soltar el sobre
   *  @example - ejemplo 
   *  <div><code>
   *  let polySynth;
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    cnv.mousePressed(playSynth);
   *
   *    polySynth = new p5.PolySynth();
   *
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *  }
   *
   *  function playSynth() {
   *    // duración de la nota (en segundos)
   *    let dur = 0.1;
   *
   *    // tiempo a partir de ahora (en segundos)
   *    let time = 0;
   *
   *    // velocidad (volumen, de 0 a 1)
   *    let vel = 0.1;
   *
   *    polySynth.play("G2", vel, 0, dur);
   *    polySynth.play("C3", vel, 0, dur);
   *    polySynth.play("G3", vel, 0, dur);
   *
   *    background(random(255), random(255), 255);
   *    text('click to play', width/2, height/2);
   *  }
   *  </code></div>
   */
  p5.PolySynth.prototype.play = function (note, velocity, secondsFromNow, susTime) {
    var susTime = susTime || 1;
    this.noteAttack(note, velocity, secondsFromNow);
    this.noteRelease(note, secondsFromNow + susTime);
  };
  /**
   *  noteADSR establece el sobre para una nota específica que acaba de activarse.
   *  El uso de este método modifica el sobre de cualquier voz de audio que se esté utilizando
   *  para tocar la nota deseada. El sobre debe reiniciarse antes de llamar
   *  a noteRelease para evitar que la envolvente modificada se utilice en otras notas.
   *
   *  @method  noteADSR
   *  @param {Number} [note]        Nota midi en la que se debe establecer ADSR.
   *  @param {Number} [attackTime]  Tiempo (en segundos antes de que el sobre
   *                                alcance el nivel de ataque
   *  @param {Number} [decayTime]   Tiempo (en segundos) antes de que la envolvente
   *                                alcance el nivel de decaimiento / sostenido
   *  @param {Number} [susRatio]    Relación entre attackLevel y releaseLevel, en una escala de 0 a 1,
   *                                donde 1.0 = attackLevel, 0.0 = releaseLevel.
   *                                SusRatio determina el decayLevel y el nivel en el que se mantendrá
   *                                la parte de sostenido de la envolvente.
   *                                Por ejemplo, si attackLevel es 0.4, releaseLevel es 0 y susAmt
   *                                es 0.5, decayLevel sería 0.2. Si attackLevel aumenta a 1.0
   *                                (usando <code> setRange </code>), decayLevel aumentaría
   *                                proporcionalmente, para convertirse en 0.5.
   *  @param {Number} [releaseTime]   Tiempo en segundos a partir de ahora (predeterminado en 0)
   **/
  p5.PolySynth.prototype.noteADSR = function (note, a, d, s, r, timeFromNow) {
    var now = p5sound.audiocontext.currentTime;
    var timeFromNow = timeFromNow || 0;
    var t = now + timeFromNow;
    this.audiovoices[this.notes[note].getValueAtTime(t)].setADSR(a, d, s, r);
  };
  /**
   * Configure la envolvente global de PolySynths. Este método modifica las envolventes de cada
   * monosintético para que todas las notas se toquen con esta envolvente.
   *
   *  @method  setADSR
   *  @param {Number} [attackTime]  Tiempo (en segundos antes de que la envolvente
   *                                alcance el nivel de ataque
   *  @param {Number} [decayTime]   Tiempo (en segundos) antes de que la envolvente alcance
   *                                el nivel de decaimiento / sostenido
   *  @param {Number} [susRatio]    Relación entre attackLevel y releaseLevel, en una escala de 0 a 1,
   *                                donde 1.0 = attackLevel, 0.0 = releaseLevel.
   *                                SusRatio determina el decayLevel y el nivel en el que se mantendrá
   *                                la parte de sostenido de la envolvente.
   *                                Por ejemplo, si attackLevel es 0.4, releaseLevel es 0,
   *                                y susAmt es 0.5, el decayLevel sería 0.2. Si attackLevel es
   *                                aumentado a 1.0 (usando <code> setRange </code>),
   *                                entonces decayLevel aumentaría proporcionalmente, hasta convertirse en 0,5.
   *  @param {Number} [releaseTime]   Tiempo en segundos a partir de ahora (predeterminado en 0)
   **/
  p5.PolySynth.prototype.setADSR = function (a, d, s, r) {
    this.audiovoices.forEach(function (voice) {
      voice.setADSR(a, d, s, r);
    });
  };
  /**
   *  Active la parte Attack y Decay de un MonoSynth.
   *  Similar a mantener presionada una tecla en un piano, pero
   *  mantendrá el nivel de sostenido hasta que la suelte.
   *
   *  @method  noteAttack
   *  @param  {Number} [note]           midi nota sobre qué ataque debe activarse.
   *  @param  {Number} [velocity]       velocidad de la nota a tocar (que va de 0 a 1) /
   *  @param  {Number} [secondsFromNow] tiempo a partir de ahora (en segundos)
   *  @example
   *  <div><code>
   *  let polySynth = new p5.PolySynth();
   *  let pitches = ["G", "D", "G", "C"];
   *  let octaves = [2, 3, 4];
   *
   *  function mousePressed() {
   *    // tocar un acorde: varias notas al mismo tiempo
   *    for (let i = 0; i < 4; i++) {
   *      let note = random(pitches) + random(octaves);
   *      polySynth.noteAttack(note, 0.1);
   *    }
   *  }
   *
   *  function mouseReleased() {
   *    // ralzar todas las voces
   *    polySynth.noteRelease();
   *  }
   *  </code></div>
   */
  p5.PolySynth.prototype.noteAttack = function (_note, _velocity, secondsFromNow) {
    //este valor va a las audiovoces que manejan su propia programación
    var secondsFromNow = ~~secondsFromNow;
    //este valor es utilizado por this._voicesInUse
    var acTime = p5sound.audiocontext.currentTime + secondsFromNow;
    //Convierta la nota en frecuencia si es necesario. Esto se debe a que las entradas en this.notes
    //debe basarse en la frecuencia en aras de la coherencia.
    var note = noteToFreq(_note);
    var velocity = _velocity || 0.1;
    var currentVoice;
    //Suelta la nota si ya está sonando
    if (this.notes[note] && this.notes[note].getValueAtTime(acTime) !== null) {
      this.noteRelease(note, 0);
    }
    //Verifique cuántas voces están en uso en el momento en que comenzará la nota
    if (this._voicesInUse.getValueAtTime(acTime) < this.maxVoices) {
      currentVoice = Math.max(~~this._voicesInUse.getValueAtTime(acTime), 0);
    } else {
      currentVoice = this._oldest;
      var oldestNote = p5.prototype.freqToMidi(this.audiovoices[this._oldest].oscillator.freq().value);
      this.noteRelease(oldestNote);
      this._oldest = (this._oldest + 1) % (this.maxVoices - 1);
    }
    //Anula la entrada en el objeto de notas. Una nota (valor de frecuencia)
    //corresponde al índice de la audiovoice que lo está reproduciendo
    this.notes[note] = new TimelineSignal();
    this.notes[note].setValueAtTime(currentVoice, acTime);
    //Busque el cambio programado en this._voicesInUse que será anterior a esta nueva nota
    //Agregue 1 y programe este valor en el momento 't', cuando esta nota comenzará a reproducirse
    var previousVal = this._voicesInUse._searchBefore(acTime) === null ? 0 : this._voicesInUse._searchBefore(acTime).value;
    this._voicesInUse.setValueAtTime(previousVal + 1, acTime);
    //Luego actualice todos los valores programados que siguen para aumentar en 1
    this._updateAfter(acTime, 1);
    this._newest = currentVoice;
    //La audiovoice maneja la programación real de la nota.
    if (typeof velocity === 'number') {
      var maxRange = 1 / this._voicesInUse.getValueAtTime(acTime) * 2;
      velocity = velocity > maxRange ? maxRange : velocity;
    }
    this.audiovoices[currentVoice].triggerAttack(note, velocity, secondsFromNow);
  };
  /**
   * Método privado para garantizar valores precisos de this._voicesInUse
   * Cada vez que se programa un nuevo valor, es necesario incrementar todos los
   * scheduledValues después del ataque y disminución de todas las posteriores
   * scheduledValues después del lanzamiento
   *
   * @private - privado
   * @param  {[type]} time  [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  p5.PolySynth.prototype._updateAfter = function (time, value) {
    if (this._voicesInUse._searchAfter(time) === null) {
      return;
    } else {
      this._voicesInUse._searchAfter(time).value += value;
      var nextTime = this._voicesInUse._searchAfter(time).time;
      this._updateAfter(nextTime, value);
    }
  };
  /**
   *  Activa el lanzamiento de una nota de AudioVoice. Esto es similar a
   *  soltar la tecla de un piano y dejar que el sonido se desvanezca según el
   *  nivel de liberación y el tiempo de liberación.
   *
   *  @method  noteRelease
   *  @param  {Number} [note]           midi nota sobre qué ataque debe activarse.
   *                                    Si no se proporciona ningún valor, se liberarán todas las notas.
   *  @param  {Number} [secondsFromNow] hora de desencadenar la liberación
   *  @example - ejemplo
   *  <div><code>
   *  let pitches = ["G", "D", "G", "C"];
   *  let octaves = [2, 3, 4];
   *  let polySynth = new p5.PolySynth();
   *
   *  function mousePressed() {
   *    //tocar un acorde: varias notas al mismo tiempo
   *    for (let i = 0; i < 4; i++) {
   *      let note = random(pitches) + random(octaves);
   *      polySynth.noteAttack(note, 0.1);
   *    }
   *  }
   *
   *  function mouseReleased() {
   *    // suelta todas las voces
   *    polySynth.noteRelease();
   *  }
   *  </code></div>
   *
   */
  p5.PolySynth.prototype.noteRelease = function (_note, secondsFromNow) {
    var now = p5sound.audiocontext.currentTime;
    var tFromNow = secondsFromNow || 0;
    var t = now + tFromNow;
    // si no se proporciona un valor de nota, suelte todas las voces
    if (!_note) {
      this.audiovoices.forEach(function (voice) {
        voice.triggerRelease(tFromNow);
      });
      this._voicesInUse.setValueAtTime(0, t);
      for (var n in this.notes) {
        this.notes[n].dispose();
        delete this.notes[n];
      }
      return;
    }
    //Asegúrese de que la nota esté en frecuencia para consultar el objeto this.notes
    var note = noteToFreq(_note);
    if (!this.notes[note] || this.notes[note].getValueAtTime(t) === null) {
      console.warn('Cannot release a note that is not already playing');
    } else {
      //Busque el cambio programado en this._voicesInUse que será anterior a esta nueva nota
      //reste 1 y programe este valor en el tiempo 't', cuando esta nota dejará de reproducirse
      var previousVal = Math.max(~~this._voicesInUse.getValueAtTime(t).value, 1);
      this._voicesInUse.setValueAtTime(previousVal - 1, t);
      //Luego actualice todos los valores programados que siguen para disminuir en 1 pero nunca bajen de 0
      if (previousVal > 0) {
        this._updateAfter(t, -1);
      }
      this.audiovoices[this.notes[note].getValueAtTime(t)].triggerRelease(tFromNow);
      this.notes[note].dispose();
      delete this.notes[note];
      this._newest = this._newest === 0 ? 0 : (this._newest - 1) % (this.maxVoices - 1);
    }
  };
  /**
  *  Conéctese a un objeto p5.sound / Web Audio.
  *
  *  @method  connect - conectar
  *  @param  {Object} unidad A p5.sound u objeto Web Audio
  */
  p5.PolySynth.prototype.connect = function (unit) {
    var u = unit || p5sound.input;
    this.output.connect(u.input ? u.input : u);
  };
  /**
  *  Desconecte todas las salidas
  *
  *  @method  disconnect - desconectar
  */
  p5.PolySynth.prototype.disconnect = function () {
    if (this.output) {
      this.output.disconnect();
    }
  };
  /**
  *  Deshágase de MonoSynth y libere sus recursos / memoria.
  *
  *  @method  dispose - disponer
  */
  p5.PolySynth.prototype.dispose = function () {
    this.audiovoices.forEach(function (voice) {
      voice.dispose();
    });
    if (this.output) {
      this.output.disconnect();
      delete this.output;
    }
  };
}(master, Tone_signal_TimelineSignal, helpers);
var distortion;
'use strict';
distortion = function () {
  var Effect = effect;
  /*
   * Adaptado de [Kevin Ennis en StackOverflow](http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion)
   */
  function makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50;
    var numSamples = 44100;
    var curve = new Float32Array(numSamples);
    var deg = Math.PI / 180;
    var i = 0;
    var x;
    for (; i < numSamples; ++i) {
      x = i * 2 / numSamples - 1;
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
  /**
   * Un efecto de distorsión creado con un nodo Waveshaper,
   * con un enfoque adaptado de
   * [Kevin Ennis](http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion)
   * 
   * This class extends <a href = "/reference/#/p5.Effect">p5.Effect</a>.  
   * Métodos <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>, 
   * <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, y
   * <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> están disponibles.
   * 
   * @class p5.Distortion
   * @extends p5.Effect
   * @constructor - constructor
   * @param {Number} [amount=0.25] Cantidad de distorsión ilimitada.
   *                                Los valores normales oscilan entre 0-1.
   * @param {String} [oversample='none'] 'none', '2x', or '4x'.
   *
   */
  p5.Distortion = function (amount, oversample) {
    Effect.call(this);
    if (typeof amount === 'undefined') {
      amount = 0.25;
    }
    if (typeof amount !== 'number') {
      throw new Error('la cantidad debe ser un número');
    }
    if (typeof oversample === 'undefined') {
      oversample = '2x';
    }
    if (typeof oversample !== 'string') {
      throw new Error('la sobremuestra debe ser una cadena');
    }
    var curveAmount = p5.prototype.map(amount, 0, 1, 0, 2000);
    /**
     *  El p5.Distortion está construido con un
     *  <a href="http://www.w3.org/TR/webaudio/#WaveShaperNode">
     *  Web Audio WaveShaper Node</a>.
     *
     *  @property {AudioNode} WaveShaperNode
     */
    this.waveShaperNode = this.ac.createWaveShaper();
    this.amount = curveAmount;
    this.waveShaperNode.curve = makeDistortionCurve(curveAmount);
    this.waveShaperNode.oversample = oversample;
    this.input.connect(this.waveShaperNode);
    this.waveShaperNode.connect(this.wet);
  };
  p5.Distortion.prototype = Object.create(Effect.prototype);
  /**
   * Procese una fuente de sonido, especifique opcionalmente la cantidad y los valores de sobremuestreo.
   *
   * @method process - proceso
   * @param {Number} [amount=0.25] Cantidad de distorsión ilimitada.
   *                                Los valores normales oscilan entre 0-1.
   * @param {String} [oversample='none'] 'none', '2x', or '4x'.
   */
  p5.Distortion.prototype.process = function (src, amount, oversample) {
    src.connect(this.input);
    this.set(amount, oversample);
  };
  /**
   * Establezca la cantidad y la sobremuestra de la distorsión del modelador de ondas.
   *
   * @method set - establecer
   * @param {Number} [amount=0.25] Cantidad de distorsión ilimitada.
   *                                Los valores normales oscilan entre 0-1.
   * @param {String} [oversample='none'] 'none', '2x', or '4x'.
   */
  p5.Distortion.prototype.set = function (amount, oversample) {
    if (amount) {
      var curveAmount = p5.prototype.map(amount, 0, 1, 0, 2000);
      this.amount = curveAmount;
      this.waveShaperNode.curve = makeDistortionCurve(curveAmount);
    }
    if (oversample) {
      this.waveShaperNode.oversample = oversample;
    }
  };
  /**
   *  Devuelve la cantidad de distorsión, normalmente entre 0-1.
   *
   *  @method  getAmount
   *  @return {Number} Cantidad de distorsión ilimitada.
   *                   Los valores normales oscilan entre 0-1.
   */
  p5.Distortion.prototype.getAmount = function () {
    return this.amount;
  };
  /**
   *  Devuelve el sobremuestreo.
   *
   *  @method getOversample
   *
   *  @return {String} La sobremuestra puede ser 'ninguna', '2x' o '4x'.
   */
  p5.Distortion.prototype.getOversample = function () {
    return this.waveShaperNode.oversample;
  };
  p5.Distortion.prototype.dispose = function () {
    Effect.prototype.dispose.apply(this);
    if (this.waveShaperNode) {
      this.waveShaperNode.disconnect();
      this.waveShaperNode = null;
    }
  };
}(effect);
var src_app;
'use strict';
src_app = function () {
  var p5SOUND = master;
  return p5SOUND;
}(shims, audiocontext, master, helpers, errorHandler, panner, soundfile, amplitude, fft, signal, oscillator, envelope, pulse, noise, audioin, filter, eq, panner3d, listener3d, delay, reverb, metro, looper, soundloop, compressor, soundRecorder, peakdetect, gain, monosynth, polysynth, distortion, audioVoice, monosynth, polysynth);
}));
