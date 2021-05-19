/*! p5.dom.js v0.3.4 Jan 19, 2017 */
/**
 * <p>La web es mucho más que un lienzo y p5.dom facilita la interacción
 * con otros objetos HTML5, incluidos texto, hipervínculo, imagen, entrada, video,
 * audio y cámara web. </p>
 * <p>Existe un conjunto de métodos de creación, métodos de manipulación DOM y
 * un p5.Element extendido que admite una variedad de elementos HTML. Ver 
 * <a href='https://github.com/processing/p5.js/wiki/Beyond-the-canvas'>
 * más allá del tutorial de lienzo </a> para obtener una descripción general completa de cómo funciona este complemento.
 *
 * <p> Los métodos y propiedades que se muestran en negro son parte del núcleo de p5.js, los elementos en
 * azul son parte de la biblioteca p5.dom. Deberá incluir un archivo adicional
 * para acceder a las funciones azules. Ver la
 * <a href='http://p5js.org/libraries/#using-a-library'>using a library</a>
 * sección para obtener información sobre cómo incluir esta biblioteca. p5.dom viene con
 * <a href='http://p5js.org/download'>p5 complete</a> o puedes descargar el archivo único
 * <a href='https://raw.githubusercontent.com/lmccart/p5.js/master/lib/addons/p5.dom.js'>
 * aquí</a>.</p>
 * <p>Mira el <a href='https://github.com/processing/p5.js/wiki/Beyond-the-canvas'>tutorial: más allá del lienzo</a>
 * para obtener más información sobre cómo utilizar esta biblioteca.</a>
 *
 * @module p5.dom
 * @submodule p5.dom
 * @for p5.dom
 * @main
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd)
    define('p5.dom', ['p5'], function(p5) {
      factory(p5);
    });
  else if (typeof exports === 'object') factory(require('../p5'));
  else factory(root['p5']);
})(this, function(p5) {
  // =============================================================================
  //                         adiciones p5 
  // =============================================================================

  /**
   * Busca en la página un elemento con el ID, la clase o el nombre de etiqueta indicados (utilizando el '#' o los '.'
   * prefijos para especificar un ID o clase respectivamente, y ninguno para una etiqueta) y lo devuelve como
   * un elemento p5. Si se proporciona un nombre de clase o etiqueta con más de 1 elemento,
   * solo se devolverá el primer elemento.
   * Se puede acceder al nodo DOM en sí con .elt.
   * Devuelve nulo si no se encuentra ninguno. También puedes especificar un contenedor para buscar dentro.
   *
   * @method select - seleccionar
   * @param  {String} nombre id, clase o etiqueta nombre del elemento para buscar
   * @param  {String} [container] id, p5.Element, o elemento HTML para buscar dentro
   * @return {Object|p5.Element|Null} p5.Elemento que contiene el nodo encontrado
   * @example - ejemplo
   * <div ><code class='norender'>
   * function setup() {
   *   createCanvas(100, 100);
   *   //lleva al lienzo 50px hacia abajo
   *   select('canvas').position(100, 100);
   * }
   * </code></div>
   * <div ><code class='norender'>
   * // estas son todas llamadas válidas para select()
   * var a = select('#moo');
   * var b = select('#blah', '#myContainer');
   * var c = select('#foo', b);
   * var d = document.getElementById('beep');
   * var e = select('p', d);
   * [a, b, c, d, e]; // No utilizado
   * </code></div>
   *
   */
  p5.prototype.select = function(e, p) {
    p5._validateParameters('select', arguments);
    var res = null;
    var container = getContainer(p);
    if (e[0] === '.') {
      e = e.slice(1);
      res = container.getElementsByClassName(e);
      if (res.length) {
        res = res[0];
      } else {
        res = null;
      }
    } else if (e[0] === '#') {
      e = e.slice(1);
      res = container.getElementById(e);
    } else {
      res = container.getElementsByTagName(e);
      if (res.length) {
        res = res[0];
      } else {
        res = null;
      }
    }
    if (res) {
      return this._wrapElement(res);
    } else {
      return null;
    }
  };

  /**
   * Busca en la página elementos con la clase dada o el nombre de etiqueta (usando el prefijo '.'
   * para especificar una clase y ningún prefijo para una etiqueta) y los devuelve como p5.Elements
   * en una matriz.
   * Se puede acceder al nodo DOM en sí con .elt.
   * Devuelve una matriz vacía si no se encuentra ninguna.
   * También puedes especificar un contenedor para buscar dentro.
   *
   * @method selectAll - seleccionar todo
   * @param  {String} nombre de clase o etiqueta nombre de los elementos a buscar
   * @param  {String} [container] id, p5.Element, o elemento HTML para buscar dentro
   * @return {Array} Matriz de elementos p5 que contienen nodos encontrados
   * @example
   * <div class='norender'><code>
   * function setup() {
   *   createButton('btn');
   *   createButton('2nd btn');
   *   createButton('3rd btn');
   *   var buttons = selectAll('button');
   *
   *   for (var i = 0; i < buttons.length; i++) {
   *     buttons[i].size(100, 100);
   *   }
   * }
   * </code></div>
   * <div class='norender'><code>
   * // estas son todas llamadas válidas para select()
   * var a = selectAll('.moo');
   * a = selectAll('div');
   * a = selectAll('button', '#myContainer');
   *
   * var d = select('#container');
   * a = selectAll('p', d);
   *
   * var f = document.getElementById('beep');
   * a = select('.blah', f);
   *
   * a; // No utilizado
   * </code></div>
   *
   */
  p5.prototype.selectAll = function(e, p) {
    p5._validateParameters('selectAll', arguments);
    var arr = [];
    var res;
    var container = getContainer(p);
    if (e[0] === '.') {
      e = e.slice(1);
      res = container.getElementsByClassName(e);
    } else {
      res = container.getElementsByTagName(e);
    }
    if (res) {
      for (var j = 0; j < res.length; j++) {
        var obj = this._wrapElement(res[j]);
        arr.push(obj);
      }
    }
    return arr;
  };

  /**
   * Función auxiliar para select y selectAll
   */
  function getContainer(p) {
    var container = document;
    if (typeof p === 'string' && p[0] === '#') {
      p = p.slice(1);
      container = document.getElementById(p) || document;
    } else if (p instanceof p5.Element) {
      container = p.elt;
    } else if (p instanceof HTMLElement) {
      container = p;
    }
    return container;
  }

  /**
   * Función auxiliar para getElement y getElements.
   */
  p5.prototype._wrapElement = function(elt) {
    var children = Array.prototype.slice.call(elt.children);
    if (elt.tagName === 'INPUT' && elt.type === 'checkbox') {
      var converted = new p5.Element(elt);
      converted.checked = function() {
        if (arguments.length === 0) {
          return this.elt.checked;
        } else if (arguments[0]) {
          this.elt.checked = true;
        } else {
          this.elt.checked = false;
        }
        return this;
      };
      return converted;
    } else if (elt.tagName === 'VIDEO' || elt.tagName === 'AUDIO') {
      return new p5.MediaElement(elt);
    } else if (elt.tagName === 'SELECT') {
      return this.createSelect(new p5.Element(elt));
    } else if (
      children.length > 0 &&
      children.every(function(c) {
        return c.tagName === 'INPUT' || c.tagName === 'LABEL';
      })
    ) {
      return this.createRadio(new p5.Element(elt));
    } else {
      return new p5.Element(elt);
    }
  };

  /**
   * Elimina todos los elementos creados por p5, excepto cualquier elemento
   * lienzo / gráfico creados por createCanvas o createGraphics.
   * Los controladores de eventos se eliminan y el elemento se elimina del DOM.
   * @method removeElements - eliminar elementos
   * @example
   * <div class='norender'><code>
   * function setup() {
   *   createCanvas(100, 100);
   *   createDiv('este es un texto');
   *   createP('esto es un párrafo');
   * }
   * function mousePressed() {
   *   removeElements(); // esto eliminará el div y p, no el lienzo
   * }
   * </code></div>
   *
   */
  p5.prototype.removeElements = function(e) {
    p5._validateParameters('removeElements', arguments);
    for (var i = 0; i < this._elements.length; i++) {
      if (!(this._elements[i].elt instanceof HTMLCanvasElement)) {
        this._elements[i].remove();
      }
    }
  };

  /**
   * Ayudantes para crear métodos.
   */
  function addElement(elt, pInst, media) {
    var node = pInst._userNode ? pInst._userNode : document.body;
    node.appendChild(elt);
    var c = media ? new p5.MediaElement(elt) : new p5.Element(elt);
    pInst._elements.push(c);
    return c;
  }

  /**
   * Crea un & lt; div & gt; & lt; / div & gt; elemento en el DOM con HTML interno dado.
   * Se agrega al nodo contenedor si se especifica uno; de lo contrario
   * se agrega al cuerpo.
   *
   * @method createDiv
   * @param  {String} [html] HTML interno para el elemento creado
   * @return {Object|p5.Element} puntero a p5.Element que contiene el nodo creado
   * @example
   * <div class='norender'><code>
   * createDiv('este es un texto');
   * </code></div>
   */

  /**
   * Crea un & lt; p & gt; & lt; / p & gt; elemento en el DOM con HTML interno dado. Usado
   * para la longitud del texto del párrafo.
   * Se agrega al nodo contenedor si se especifica uno; de lo contrario
   * se agrega al cuerpo.
   *
   * @method createP
   * @param  {String} [html] HTML interno para el elemento creado
   * @return {Object|p5.Element} puntero a p5.Element que contiene el nodo creado
   * @example
   * <div class='norender'><code>
   * createP('este es un texto');
   * </code></div>
   */

  /**
   * Crea una etiqueta & lt; span & gt; & lt; / span & gt; elemento en el DOM con HTML interno dado.
   * Se agrega al nodo contenedor si se especifica uno; de lo contrario
   * se agrega al cuerpo.
   *
   * @method createSpan
   * @param  {String} [html] HTML interno para el elemento creado
   * @return {Object|p5.Element} puntero a p5.Element que contiene el nodo creado
   * @example
   * <div class='norender'><code>
   * createSpan('este es un texto');
   * </code></div>
   */
  var tags = ['div', 'p', 'span'];
  tags.forEach(function(tag) {
    var method = 'create' + tag.charAt(0).toUpperCase() + tag.slice(1);
    p5.prototype[method] = function(html) {
      var elt = document.createElement(tag);
      elt.innerHTML = typeof html === undefined ? '' : html;
      return addElement(elt, this);
    };
  });

  /**
   * Crea una etiqueta & lt; img & gt; elemento en el DOM con src dado y
   * texto alternativo.
   * Se agrega al nodo contenedor si se especifica uno; de lo contrario
   * se agrega al cuerpo.
   *
   * @method createImg
   * @param  {String} src src ruta o URL para la imagen
   * @param  {String} [alt] texto alternativo que se utilizará si la imagen no se carga
   * @param  {Function} [successCallback] devolución de llamada que se llamará una vez que se carguen los datos de imagen
   * @return {Object|p5.Element} puntero a p5.Element que contiene el nodo creado
   * @example
   * <div class='norender'><code>
   * createImg('http://p5js.org/img/asterisk-01.png');
   * </code></div>
   */
  p5.prototype.createImg = function() {
    p5._validateParameters('createImg', arguments);
    var elt = document.createElement('img');
    var args = arguments;
    var self;
    var setAttrs = function() {
      self.width = elt.offsetWidth || elt.width;
      self.height = elt.offsetHeight || elt.height;
      if (args.length > 1 && typeof args[1] === 'function') {
        self.fn = args[1];
        self.fn();
      } else if (args.length > 1 && typeof args[2] === 'function') {
        self.fn = args[2];
        self.fn();
      }
    };
    elt.src = args[0];
    if (args.length > 1 && typeof args[1] === 'string') {
      elt.alt = args[1];
    }
    elt.onload = function() {
      setAttrs();
    };
    self = addElement(elt, this);
    return self;
  };

  /**
   * Crea una etiqueta & lt; a & gt; & lt; / a & gt; elemento en el DOM para incluir un hipervínculo.
   * Se agrega al nodo contenedor si se especifica uno; de lo contrario
   * se agrega al cuerpo.
   *
   * @method createA
   * @param  {String} href       URL de la página a la que enlazar
   * @param  {String} html       html interno del elemento de enlace para mostrar
   * @param  {String} [target]   apuntar donde debería abrirse el nuevo enlace,
   *                             puede ser _blank, _self, _parent, _top.
   * @return {Object|p5.Element} puntero a p5.Element que contiene el nodo creado
   * @example
   * <div class='norender'><code>
   * createA('http://p5js.org/', 'este es un enlace');
   * </code></div>
   */
  p5.prototype.createA = function(href, html, target) {
    p5._validateParameters('createA', arguments);
    var elt = document.createElement('a');
    elt.href = href;
    elt.innerHTML = html;
    if (target) elt.target = target;
    return addElement(elt, this);
  };

  /** ENTRADA **/

  /**
   * Crea un control deslizante & lt; input & gt; & lt; / input & gt; elemento en el DOM.
   * Utiliza .size () para establecer la longitud de visualización del control deslizante.
   * Se agrega al nodo contenedor si se especifica uno; de lo contrario
   * se agrega al cuerpo.
   *
   * @method createSlider
   * @param  {Number} min valor mínimo del control deslizante
   * @param  {Number} max valor máximo del control deslizante
   * @param  {Number} [value] valor predeterminado del control deslizante
   * @param  {Number} [step] tamaño de paso para cada marca del control deslizante (si el paso se establece en 0, el control deslizante se moverá continuamente desde el valor mínimo al máximo)
   * @return {Object|p5.Element} puntero a p5.Element que contiene el nodo creado
   * @example
   * <div><code>
   * var slider;
   * function setup() {
   *   slider = createSlider(0, 255, 100);
   *   slider.position(10, 10);
   *   slider.style('width', '80px');
   * }
   *
   * function draw() {
   *   var val = slider.value();
   *   background(val);
   * }
   * </code></div>
   *
   * <div><code>
   * var slider;
   * function setup() {
   *   colorMode(HSB);
   *   slider = createSlider(0, 360, 60, 40);
   *   slider.position(10, 10);
   *   slider.style('width', '80px');
   * }
   *
   * function draw() {
   *   var val = slider.value();
   *   background(val, 100, 100, 1);
   * }
   * </code></div>
   */
  p5.prototype.createSlider = function(min, max, value, step) {
    p5._validateParameters('createSlider', arguments);
    var elt = document.createElement('input');
    elt.type = 'range';
    elt.min = min;
    elt.max = max;
    if (step === 0) {
      elt.step = 0.000000000000000001; // paso válido más pequeño
    } else if (step) {
      elt.step = step;
    }
    if (typeof value === 'number') elt.value = value;
    return addElement(elt, this);
  };

  /**
   * Crea un & lt; button & gt; & lt; / button & gt; elemento en el DOM.
   * Usa .size() para establecer el tamaño de visualización del botón.
   * Usa .mousePressed() para especificar el comportamiento de la presión.
   * Se agrega al nodo contenedor si se especifica uno; de lo contrario
   * se agrega al cuerpo.
   *
   * @method createButton
   * @param  {String} label etiqueta que se muestra en el botón
   * @param  {String} [value] valor del botón
   * @return {Object|p5.Element} puntero a p5.Element que contiene el nodo creado
   * @example
   * <div class='norender'><code>
   * var button;
   * function setup() {
   *   createCanvas(100, 100);
   *   background(0);
   *   button = createButton('Haz clic en mi');
   *   button.position(19, 19);
   *   button.mousePressed(changeBG);
   * }
   *
   * function changeBG() {
   *   var val = random(255);
   *   background(val);
   * }
   * </code></div>
   */
  p5.prototype.createButton = function(label, value) {
    p5._validateParameters('createButton', arguments);
    var elt = document.createElement('button');
    elt.innerHTML = label;
    if (value) elt.value = value;
    return addElement(elt, this);
  };

  /**
   * Crea una casilla de verificación & lt; input & gt; & lt; / input & gt; elemento en el DOM.
   * Llamar .checked () en una casilla de verificación devuelve si está marcado o no
   *
   * @method createCheckbox
   * @param  {String} [label] etiqueta mostrada después de la casilla de verificación
   * @param  {boolean} [value] valor de la casilla de verificación; marcado es verdadero, desmarcado es falso
   * @return {Object|p5.Element} puntero a p5.Element que contiene el nodo creado
   * @example
   * <div class='norender'><code>
   * var checkbox;
   *
   * function setup() {
   *   checkbox = createCheckbox('label', false);
   *   checkbox.changed(myCheckedEvent);
   * }
   *
   * function myCheckedEvent() {
   *   if (this.checked()) {
   *     console.log('¡Comprobar!');
   *   } else {
   *     console.log('¡Sin Comprobar!');
   *   }
   * }
   * </code></div>
   */
  p5.prototype.createCheckbox = function() {
    p5._validateParameters('createCheckbox', arguments);
    var elt = document.createElement('div');
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    elt.appendChild(checkbox);
    // La casilla de verificación debe estar envuelta en p5.Element antes de la etiqueta para que la etiqueta aparezca después
    var self = addElement(elt, this);
    self.checked = function() {
      var cb = self.elt.getElementsByTagName('input')[0];
      if (cb) {
        if (arguments.length === 0) {
          return cb.checked;
        } else if (arguments[0]) {
          cb.checked = true;
        } else {
          cb.checked = false;
        }
      }
      return self;
    };
    this.value = function(val) {
      self.value = val;
      return this;
    };
    if (arguments[0]) {
      var ran = Math.random()
        .toString(36)
        .slice(2);
      var label = document.createElement('label');
      checkbox.setAttribute('id', ran);
      label.htmlFor = ran;
      self.value(arguments[0]);
      label.appendChild(document.createTextNode(arguments[0]));
      elt.appendChild(label);
    }
    if (arguments[1]) {
      checkbox.checked = true;
    }
    return self;
  };

  /**
   * Crea un menú desplegable & lt; select & gt; & lt; / select & gt; elemento en el DOM.
   * También ayuda a asignar métodos de cuadro de selección a p5.Element al seleccionar cuadro de selección existente
   * @method createSelect
   * @param {boolean} [multiple] verdadero si el menú desplegable debe admitir múltiples selecciones
   * @return {p5.Element}
   * @example
   * <div><code>
   * var sel;
   *
   * function setup() {
   *   textAlign(CENTER);
   *   background(200);
   *   sel = createSelect();
   *   sel.position(10, 10);
   *   sel.option('pear');
   *   sel.option('kiwi');
   *   sel.option('grape');
   *   sel.changed(mySelectEvent);
   * }
   *
   * function mySelectEvent() {
   *   var item = sel.value();
   *   background(200);
   *   text('este es un' + item + '!', 50, 50);
   * }
   * </code></div>
   */
  /**
   * @method createSelect
   * @param {Object} elemento de selección DOM existente
   * @return {p5.Element}
   */

  p5.prototype.createSelect = function() {
    p5._validateParameters('createSelect', arguments);
    var elt, self;
    var arg = arguments[0];
    if (typeof arg === 'object' && arg.elt.nodeName === 'SELECT') {
      self = arg;
      elt = this.elt = arg.elt;
    } else {
      elt = document.createElement('select');
      if (arg && typeof arg === 'boolean') {
        elt.setAttribute('multiple', 'true');
      }
      self = addElement(elt, this);
    }
    self.option = function(name, value) {
      var index;
      //mira si ya hay una opción con este nombre
      for (var i = 0; i < this.elt.length; i++) {
        if (this.elt[i].innerHTML === name) {
          index = i;
          break;
        }
      }
      //si hay una opción con este nombre la modificaremos
      if (index !== undefined) {
        //si el usuario pasó en falso, elimina esa opción
        if (value === false) {
          this.elt.remove(index);
        } else {
          //de lo contrario, si el nombre y el valor son iguales, cambia ambos
          if (this.elt[index].innerHTML === this.elt[index].value) {
            this.elt[index].innerHTML = this.elt[index].value = value;
            //de lo contrario, solo cambia el valor
          } else {
            this.elt[index].value = value;
          }
        }
      } else {
        //si no existe hazlo
        var opt = document.createElement('option');
        opt.innerHTML = name;
        if (arguments.length > 1) opt.value = value;
        else opt.value = name;
        elt.appendChild(opt);
      }
    };
    self.selected = function(value) {
      var arr = [],
        i;
      if (arguments.length > 0) {
        for (i = 0; i < this.elt.length; i++) {
          if (value.toString() === this.elt[i].value) {
            this.elt.selectedIndex = i;
          }
        }
        return this;
      } else {
        if (this.elt.getAttribute('multiple')) {
          for (i = 0; i < this.elt.selectedOptions.length; i++) {
            arr.push(this.elt.selectedOptions[i].value);
          }
          return arr;
        } else {
          return this.elt.value;
        }
      }
    };
    return self;
  };

  /**
   * Crea un botón de opción & lt; input & gt; & lt; / input & gt; elemento en el DOM.
   * El método .option () se puede utilizar para configurar opciones para la radio después de que es
   * creado. El método .value () devolverá la opción seleccionada actualmente.
   *
   * @method createRadio
   * @param  {String} [divId] la identificación y el nombre del campo de entrada y div creado respectivamente
   * @return {Object|p5.Element} puntero a p5.Element que contiene el nodo creado
   * @example
   * <div><code>
   * var radio;
   *
   * function setup() {
   *   radio = createRadio();
   *   radio.option('black');
   *   radio.option('white');
   *   radio.option('gray');
   *   radio.style('width', '60px');
   *   textAlign(CENTER);
   *   fill(255, 0, 0);
   * }
   *
   * function draw() {
   *   var val = radio.value();
   *   background(val);
   *   text(val, width / 2, height / 2);
   * }
   * </code></div>
   * <div><code>
   * var radio;
   *
   * function setup() {
   *   radio = createRadio();
   *   radio.option('apple', 1);
   *   radio.option('bread', 2);
   *   radio.option('juice', 3);
   *   radio.style('width', '60px');
   *   textAlign(CENTER);
   * }
   *
   * function draw() {
   *   background(200);
   *   var val = radio.value();
   *   if (val) {
   *     text('el costo del artículo es $' + val, width / 2, height / 2);
   *   }
   * }
   * </code></div>
   */
  p5.prototype.createRadio = function(existing_radios) {
    p5._validateParameters('createRadio', arguments);
    // haz algo de preparación contando el número de radios en la página
    var radios = document.querySelectorAll('input[type=radio]');
    var count = 0;
    if (radios.length > 1) {
      var length = radios.length;
      var prev = radios[0].name;
      var current = radios[1].name;
      count = 1;
      for (var i = 1; i < length; i++) {
        current = radios[i].name;
        if (prev !== current) {
          count++;
        }
        prev = current;
      }
    } else if (radios.length === 1) {
      count = 1;
    }
    // mira si tenemos un conjunto existente de radios de callee
    var elt, self;
    if (typeof existing_radios === 'object') {
      // usa elementos existentes
      self = existing_radios;
      elt = this.elt = existing_radios.elt;
    } else {
      // crea un conjunto de botones de radio
      elt = document.createElement('div');
      self = addElement(elt, this);
    }
    // configurar funciones de miembros
    self._getInputChildrenArray = function() {
      return Array.prototype.slice.call(this.elt.children).filter(function(c) {
        return c.tagName === 'INPUT';
      });
    };

    var times = -1;
    self.option = function(name, value) {
      var opt = document.createElement('input');
      opt.type = 'radio';
      opt.innerHTML = name;
      if (value) opt.value = value;
      else opt.value = name;
      opt.setAttribute('name', 'defaultradio' + count);
      elt.appendChild(opt);
      if (name) {
        times++;
        var label = document.createElement('label');
        opt.setAttribute('id', 'defaultradio' + count + '-' + times);
        label.htmlFor = 'defaultradio' + count + '-' + times;
        label.appendChild(document.createTextNode(name));
        elt.appendChild(label);
      }
      return opt;
    };
    self.selected = function(value) {
      var i;
      var inputChildren = self._getInputChildrenArray();
      if (value) {
        for (i = 0; i < inputChildren.length; i++) {
          if (inputChildren[i].value === value) inputChildren[i].checked = true;
        }
        return this;
      } else {
        for (i = 0; i < inputChildren.length; i++) {
          if (inputChildren[i].checked === true) return inputChildren[i].value;
        }
      }
    };
    self.value = function(value) {
      var i;
      var inputChildren = self._getInputChildrenArray();
      if (value) {
        for (i = 0; i < inputChildren.length; i++) {
          if (inputChildren[i].value === value) inputChildren[i].checked = true;
        }
        return this;
      } else {
        for (i = 0; i < inputChildren.length; i++) {
          if (inputChildren[i].checked === true) return inputChildren[i].value;
        }
        return '';
      }
    };
    return self;
  };

  /**
   * Crea una etiqueta & lt; input & gt; & lt; / input & gt; elemento en el DOM para la entrada de texto.
   * Utiliza .size () para establecer la longitud de visualización del cuadro.
   * Se agrega al nodo contenedor si se especifica uno, de lo contrario
   * se agrega al cuerpo.
   *
   * @method createInput
   * @param {String} [value] valor predeterminado del cuadro de entrada
   * @param {String} [type] tipo de texto, es decir, texto, contraseña, etc. Por defecto es texto
   * @return {Object|p5.Element} puntero a p5.Element que contiene el nodo creado
   * @example
   * <div class='norender'><code>
   * function setup() {
   *   var inp = createInput('');
   *   inp.input(myInputEvent);
   * }
   *
   * function myInputEvent() {
   *   console.log('estás escribiendo: ', this.value());
   * }
   * </code></div>
   */
  p5.prototype.createInput = function(value, type) {
    p5._validateParameters('createInput', arguments);
    var elt = document.createElement('input');
    elt.type = type ? type : 'text';
    if (value) elt.value = value;
    return addElement(elt, this);
  };

  /**
   * Crea una etiqueta & lt; input & gt; & lt; / input & gt; elemento en el DOM de tipo 'archivo'.
   * Esto permite a los usuarios seleccionar archivos locales para usarlos en un boceto.
   *
   * @method createFileInput
   * @param  {Function} [callback] función de devolución de llamada para cuando se carga un archivo
   * @param  {String} [multiple] opcional para permitir varios archivos seleccionados
   * @return {Object|p5.Element} puntero a p5.Element que contiene el elemento DOM creado
   * @example
   * var input;
   * var img;
   *
   * function setup() {
   *   input = createFileInput(handleFile);
   *   input.position(0, 0);
   * }
   *
   * function draw() {
   *   if (img) {
   *     image(img, 0, 0, width, height);
   *   }
   * }
   *
   * function handleFile(file) {
   *   print(file);
   *   if (file.type === 'image') {
   *     img = createImg(file.data);
   *     img.hide();
   *   }
   * }
   */
  p5.prototype.createFileInput = function(callback, multiple) {
    p5._validateParameters('createFileInput', arguments);
    // Función para manejar cuando se selecciona un archivo
    // Estamos simplificando la vida y asumiendo que siempre
    // queremos cargar cada archivo seleccionado
    function handleFileSelect(evt) {
      function makeLoader(theFile) {
        // Hacer un objeto p5.File
        var p5file = new p5.File(theFile);
        return function(e) {
          p5file.data = e.target.result;
          callback(p5file);
        };
      }
      // Estos son los archivos
      var files = evt.target.files;
      // Carga cada uno y activa una devolución de llamada
      for (var i = 0; i < files.length; i++) {
        var f = files[i];
        var reader = new FileReader();

        reader.onload = makeLoader(f);

        // ¿Texto o datos?
        // Esto probablemente debería mejorarse
        if (f.type.indexOf('text') > -1) {
          reader.readAsText(f);
        } else {
          reader.readAsDataURL(f);
        }
      }
    }
    // ¿El material del archivo es compatible?
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      // Sí, estamos bien y hacemos un selector de archivos de entrada
      var elt = document.createElement('input');
      elt.type = 'file';

      // Si obtenemos un segundo argumento que se evalúa como verdadero
      // entonces buscamos varios archivos
      if (multiple) {
        // Cualquier cosa hace el trabajo
        elt.multiple = 'multiple';
      }

      // Ahora manejemos cuando se seleccionó un archivo
      elt.addEventListener('change', handleFileSelect, false);
      return addElement(elt, this);
    } else {
      console.log(
        'Las API de archivos no son totalmente compatibles con este navegador. No se puede crear el elementot.'
      );
    }
  };

  /** COSAS PARA VIDEO **/

  function createMedia(pInst, type, src, callback) {
    var elt = document.createElement(type);

    // Permitir que src esté vacío
    src = src || '';
    if (typeof src === 'string') {
      src = [src];
    }
    for (var i = 0; i < src.length; i++) {
      var source = document.createElement('source');
      source.src = src[i];
      elt.appendChild(source);
    }
    if (typeof callback !== 'undefined') {
      var callbackHandler = function() {
        callback();
        elt.removeEventListener('canplaythrough', callbackHandler);
      };
      elt.addEventListener('canplaythrough', callbackHandler);
    }

    var c = addElement(elt, pInst, true);
    c.loadedmetadata = false;
    // establecer metadatos de carga de ancho y alto
    elt.addEventListener('loadedmetadata', function() {
      c.width = elt.videoWidth;
      c.height = elt.videoHeight;
      // establezca el ancho y la altura del elt si no está establecido
      if (c.elt.width === 0) c.elt.width = elt.videoWidth;
      if (c.elt.height === 0) c.elt.height = elt.videoHeight;
      c.loadedmetadata = true;
    });

    return c;
  }
  /**
   * Crea una etiqueta HTML5 & lt; video & gt; elemento en el DOM para una reproducción simple
   * de audio / video. Se muestra de forma predeterminada, se puede ocultar con .hide ()
   * y dibujado en lienzo usando video (). Anexa al contenedor
   * nodo si se especifica uno; de lo contrario, se agrega al cuerpo. El primer parámetro
   * cpuede ser una ruta de una sola cadena a un archivo de video o una matriz de cadenas
   * rutas a diferentes formatos del mismo video. Esto es útil para asegurar
   * que su video puede reproducirse en diferentes navegadores, ya que cada uno admite
   * diferentes formatos. See <a href='https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats'>this
   * page</a> para obtener más información sobre los formatos compatibles.
   *
   * @method createVideo
   * @param  {String|Array} src  ruta a un archivo de video, o matriz de rutas para
   *                             admitir diferentes navegadores
   * @param  {Object} [callback] función de devolución de llamada para ser 
   *                             invocada cuando se activa el evento 'canplaythrough', es decir,
   *                             cuando el navegador puede reproducir los medios y estima que
   *                             se han cargado suficientes datos para reproducir los medios
   *                             hasta el final sin tener que detenerse
   *                             para almacenar más contenido en el búfer
   * @return {p5.MediaElement|p5.Element} puntero al video p5.Element
   * @example
   * <div><code>
   * var vid;
   * function setup() {
   *   vid = createVideo(['small.mp4', 'small.ogv', 'small.webm'], vidLoad);
   * }
   *
   * // Esta función se llama cuando se carga el video.
   * function vidLoad() {
   *   vid.play();
   * }
   * </code></div>
   */
  p5.prototype.createVideo = function(src, callback) {
    p5._validateParameters('createVideo', arguments);
    return createMedia(this, 'video', src, callback);
  };

  /** COSAS DE AUDIO **/

  /**
   * Crea una etiqueta HTML5 & lt; audio & gt; elemento en el DOM para una reproducción
   * de audio simple. Se agrega al nodo contenedor si se especifica uno,
   * de lo contrario, se agrega al cuerpo. El primer parámetro
   * puede ser una ruta de una sola cadena a un archivo de audio o una matriz de cadenas
   * rutas a diferentes formatos del mismo audio. Esto es útil para asegurar
   * que su audio puede reproducirse en diferentes navegadores, ya que cada uno admite 
   * diferentes formatos. Mira <a href='https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats'> esta
   * página para obtener más información sobre los formatos compatibles </a>.
   *
   * @method createAudio
   * @param  {String|String[]} [src] ruta a un archivo de audio o matriz de rutas
   *                             para admitir diferentes navegadores
   * @param  {Object} [callback] función de devolución de llamada para ser invocada cuando
   *                             el evento 'canplaythrough' se activa, es decir, cuando el
   *                             navegador puede reproducir los medios y estima que
   *                             se han cargado suficientes datos para reproducir los medios 
   *                             hasta el final sin tener que detenerse para 
   *                             almacenar más contenido en búfer.
   * @return {p5.MediaElement|p5.Element} puntero al audio p5.element  /**
   * @example
   * <div><code>
   * var ele;
   * function setup() {
   *   ele = createAudio('assets/beat.mp3');
   *
   *   // aquí configuramos el elemento para que se reproduzca automáticamente
   *   // El elemento se reproducirá tan pronto
   *   // ya que puede hacerlo.
   *   ele.autoplay(true);
   * }
   * </code></div>
   */
  p5.prototype.createAudio = function(src, callback) {
    p5._validateParameters('createAudio', arguments);
    return createMedia(this, 'audio', src, callback);
  };

  /** COSAS DE CÁMARA **/

  p5.prototype.VIDEO = 'video';
  p5.prototype.AUDIO = 'audio';

  // desde: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  // Es posible que los navegadores más antiguos no implementen mediaDevices en absoluto, por lo que primero configuramos un objeto vacío
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }

  // Algunos navegadores implementan parcialmente mediaDevices. No podemos simplemente asignar un objeto
  // con getUserMedia ya que sobrescribiría las propiedades existentes.
  // Aquí, simplemente agregaremos la propiedad getUserMedia si falta.
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      // Primero consigue el getUserMedia heredado, si está presente
      var getUserMedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      // Algunos navegadores simplemente no lo implementan: devuelven una promesa rechazada con un error
      // para mantener una interfaz consistente
      if (!getUserMedia) {
        return Promise.reject(
          new Error('getUserMedia no está implementado en este navegador')
        );
      }

      // De lo contrario, envuelva la llamada al antiguo navigator.getUserMedia con una promesa
      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  /**
   * <p> Crea un nuevo & lt; video & gt; elemento que contiene el feed de audio / video
   * desde una cámara web. Esto se puede dibujar en el lienzo usando video (). </p>
   * <p>Se pueden pasar propiedades más específicas del feed en un objeto Constraints.
   * Mira el siguiente enlace
   * <a href='http://w3c.github.io/mediacapture-main/getusermedia.html#media-track-constraints'> W3C
   * spec</a> para posibles propiedades. Ten en cuenta que no todos estos son compatibles
   * por todos los navegadores.</p>
   * <p>Nota de seguridad: una nueva especificación de seguridad del navegador requiere que getUserMedia,
   * que está detrás de createCapture(), solo funciona cuando está ejecutando el código localmente,
   * o en HTTPS. Aprende más <a href='http://stackoverflow.com/questions/34197653/getusermedia-in-chrome-47-without-using-https'>here</a>
   * y <a href='https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia'>here</a>.</p>
   *
   * @method createCapture
   * @param  {String|Constant|Object}  tipo tipo de captura, ya sea VIDEO o
   *                                   AUDIO si no se especifica ninguno, ambos predeterminados,
   *                                   o un objeto de restricciones
   * @param  {Function}                función de devolución de llamada que se llamará una vez
   *                                   que la transmisión se ha cargado
   * @return {Object|p5.Element} captura del video p5.Element
   * @example
   * <div class='norender'><code>
   * var capture;
   *
   * function setup() {
   *   createCanvas(480, 120);
   *   capture = createCapture(VIDEO);
   * }
   *
   * function draw() {
   *   image(capture, 0, 0, width, width * capture.height / capture.width);
   *   filter(INVERT);
   * }
   * </code></div>
   * <div class='norender'><code>
   * function setup() {
   *   createCanvas(480, 120);
   *   var constraints = {
   *     video: {
   *       mandatory: {
   *         minWidth: 1280,
   *         minHeight: 720
   *       },
   *       optional: [{ maxFrameRate: 10 }]
   *     },
   *     audio: true
   *   };
   *   createCapture(constraints, function(stream) {
   *     console.log(stream);
   *   });
   * }
   * </code></div>
   */
  p5.prototype.createCapture = function() {
    p5._validateParameters('createCapture', arguments);
    var useVideo = true;
    var useAudio = true;
    var constraints;
    var cb;
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] === p5.prototype.VIDEO) {
        useAudio = false;
      } else if (arguments[i] === p5.prototype.AUDIO) {
        useVideo = false;
      } else if (typeof arguments[i] === 'object') {
        constraints = arguments[i];
      } else if (typeof arguments[i] === 'function') {
        cb = arguments[i];
      }
    }
    if (navigator.getUserMedia) {
      var elt = document.createElement('video');

      if (!constraints) {
        constraints = { video: useVideo, audio: useAudio };
      }

      navigator.mediaDevices.getUserMedia(constraints).then(
        function(stream) {
          try {
            if ('srcObject' in elt) {
              elt.srcObject = stream;
            } else {
              elt.src = window.URL.createObjectURL(stream);
            }
          } catch (err) {
            elt.src = stream;
          }
          if (cb) {
            cb(stream);
          }
        },
        function(e) {
          console.log(e);
        }
      );
    } else {
      throw 'getUserMedia no es compatible con este navegador';
    }
    var c = addElement(elt, this, true);
    c.loadedmetadata = false;
    // establecer metadatos de carga de ancho y alto
    elt.addEventListener('loadedmetadata', function() {
      elt.play();
      if (elt.width) {
        c.width = elt.videoWidth = elt.width;
        c.height = elt.videoHeight = elt.height;
      } else {
        c.width = c.elt.width = elt.videoWidth;
        c.height = c.elt.height = elt.videoHeight;
      }
      c.loadedmetadata = true;
    });
    return c;
  };

  /**
   * Crea un elemento con una etiqueta determinada en el DOM con un contenido determinado.
   * Se agrega al nodo contenedor si se especifica uno, de lo contrario
   * se agrega al cuerpo.
   *
   * @method createElement
   * @param  {String} tag tag for the new element
   * @param  {String} [content] html content to be inserted into the element
   * @return {Object|p5.Element} pointer to p5.Element holding created node
   * @example
   * <div class='norender'><code>
   * createElement('h2', 'soy un h2 p5.element!');
   * </code></div>
   */
  p5.prototype.createElement = function(tag, content) {
    p5._validateParameters('createElement', arguments);
    var elt = document.createElement(tag);
    if (typeof content !== 'undefined') {
      elt.innerHTML = content;
    }
    return addElement(elt, this);
  };

  // =============================================================================
  //                         adiciones p5.Element
  // =============================================================================
  /**
   *
   * Agrega la clase especificada al elemento.
   *
   * @for p5.Element
   * @method addClass
   * @param  {String} nombre de clase de la clase para agregar
   * @return {Object|p5.Element}
   * @example
   * <div class='norender'><code>
   * var div = createDiv('div');
   * div.addClass('myClass');
   * </code></div>
   */
  p5.Element.prototype.addClass = function(c) {
    if (this.elt.className) {
      // PEND no agrega clase más de una vez
      //var regex = new RegExp('[^a-zA-Z\d:]?'+c+'[^a-zA-Z\d:]?');
      //if (this.elt.className.search(/[^a-zA-Z\d:]?hi[^a-zA-Z\d:]?/) === -1) {
      this.elt.className = this.elt.className + ' ' + c;
      //}
    } else {
      this.elt.className = c;
    }
    return this;
  };

  /**
   *
   * Elimina la clase especificada del elemento.
   *
   * @method removeClass
   * @param  {String} nombre de clase de la clase a eliminar
   * @return {Object|p5.Element}   * @example
   * <div class='norender'><code>
   * // En este ejemplo, se establece una clase cuando se crea el div
   * // y se quita cuando se presiona el mouse. Esto podría enlazar
   * // con una regla de estilo CSS para alternar las propiedades de estilo.
   *
   * var div;
   *
   * function setup() {
   *   div = createDiv('div');
   *   div.addClass('myClass');
   * }
   *
   * function mousePressed() {
   *   div.removeClass('myClass');
   * }
   * </code></div>
   */
  p5.Element.prototype.removeClass = function(c) {
    var regex = new RegExp('(?:^|\\s)' + c + '(?!\\S)');
    this.elt.className = this.elt.className.replace(regex, '');
    this.elt.className = this.elt.className.replace(/^\s+|\s+$/g, ''); //embellecer (opcional)
    return this;
  };

  /**
   *
   * Adjunta el elemento como hijo al padre especificado.
   * Acepta un ID de cadena, un nodo DOM o un p5.Element
   * Si no se especifica ningún argumento, se devuelve una matriz de nodos DOM secundarios.
   *
   * @method child - hijo
   * @param  {String|Object|p5.Element} [child] el ID, nodo DOM, or p5.Element
   *                         para agregar al elemento actual
   * @return {p5.Element}
   * @example
   * <div class='norender'><code>
   * var div0 = createDiv('este es el padre');
   * var div1 = createDiv('este es el niño');
   * div0.child(div1); // usa p5.Element
   * </code></div>
   * <div class='norender'><code>
   * var div0 = createDiv('este es el padre');
   * var div1 = createDiv('este es el niño');
   * div1.id('apples');
   * div0.child('apples'); // usa el id
   * </code></div>
   * <div class='norender'><code>
   * var div0 = createDiv('este es el padre');
   * var elt = document.getElementById('myChildDiv');
   * div0.child(elt); // usar elemento de la página
   * </code></div>
   */
  p5.Element.prototype.child = function(c) {
    if (typeof c === 'indefinido') {
      return this.elt.childNodes;
    }
    if (typeof c === 'string') {
      if (c[0] === '#') {
        c = c.substring(1);
      }
      c = document.getElementById(c);
    } else if (c instanceof p5.Element) {
      c = c.elt;
    }
    this.elt.appendChild(c);
    return this;
  };

  /**
   * Centra un elemento p5 ya sea verticalmente, horizontalmente,
   * o ambos, en relación con su padre o de acuerdo con
   * el cuerpo si el elemento no tiene padre. Si no se pasa ningún argumento
   * el elemento está alineado tanto vertical como horizontalmente.
   *
   * @method center
   * @param  {String} [align]      pasar 'vertical', 'horizontal' alinea el elemento en consecuencia
   * @return {Object|p5.Element} puntero al p5.Element
   * @example
   * <div><code>
   * function setup() {
   *   var div = createDiv('').size(10, 10);
   *   div.style('background-color', 'orange');
   *   div.center();
   * }
   * </code></div>
   */
  p5.Element.prototype.center = function(align) {
    var style = this.elt.style.display;
    var hidden = this.elt.style.display === 'none';
    var parentHidden = this.parent().style.display === 'none';
    var pos = { x: this.elt.offsetLeft, y: this.elt.offsetTop };

    if (hidden) this.show();

    this.elt.style.display = 'block';
    this.position(0, 0);

    if (parentHidden) this.parent().style.display = 'block';

    var wOffset = Math.abs(this.parent().offsetWidth - this.elt.offsetWidth);
    var hOffset = Math.abs(this.parent().offsetHeight - this.elt.offsetHeight);
    var y = pos.y;
    var x = pos.x;

    if (align === 'both' || align === undefined) {
      this.position(wOffset / 2, hOffset / 2);
    } else if (align === 'horizontal') {
      this.position(wOffset / 2, y);
    } else if (align === 'vertical') {
      this.position(x, hOffset / 2);
    }

    this.style('display', style);

    if (hidden) this.hide();

    if (parentHidden) this.parent().style.display = 'none';

    return this;
  };

  /**
   *
   * Si se proporciona un argumento, establece el HTML interno del elemento,
   * reemplazando cualquier html existente. Si es verdadero se incluye como segundo
   * argumento, se agrega html en lugar de reemplazar el html existente.
   * Si no se dan argumentos, devuelve
   * el HTML interno del elemento.
   *
   * @for p5.Element
   * @method html
   * @param  {String} [html] el HTML que se colocará dentro del elemento
   * @param  {boolean} [append] si agregar HTML a los existentes
   * @return {Object|p5.Element|String}
   * @example
   * <div class='norender'><code>
   * var div = createDiv('').size(100, 100);
   * div.html('hi');
   * </code></div>
   * <div class='norender'><code>
   * var div = createDiv('Hola ').size(100, 100);
   * div.html('World', true);
   * </code></div>
   */
  p5.Element.prototype.html = function() {
    if (arguments.length === 0) {
      return this.elt.innerHTML;
    } else if (arguments[1]) {
      this.elt.innerHTML += arguments[0];
      return this;
    } else {
      this.elt.innerHTML = arguments[0];
      return this;
    }
  };

  /**
   *
   * Establece la posición del elemento en relación con (0, 0) de la
   * ventana. Esencialmente, establece la posición: absoluta, izquierda y arriba
   * propiedades de estilo. Si no se dan argumentos, devuelve la posición xey
   * del elemento en un objeto.
   *
   * @method position
   * @param  {Number} [x] posición x relativa a la parte superior izquierda de la ventana
   * @param  {Number} [y] posición y relativa a la parte superior izquierda de la ventana
   * @return {Object|p5.Element}
   * @example
   * <div><code class='norender'>
   * function setup() {
   *   var cnv = createCanvas(100, 100);
   *   // coloca el lienzo 50px a la derecha y 100px
   *   // debajo de la esquina superior izquierda de la ventana
   *   cnv.position(50, 100);
   * }
   * </code></div>
   */
  p5.Element.prototype.position = function() {
    if (arguments.length === 0) {
      return { x: this.elt.offsetLeft, y: this.elt.offsetTop };
    } else {
      this.elt.style.position = 'absolute';
      this.elt.style.left = arguments[0] + 'px';
      this.elt.style.top = arguments[1] + 'px';
      this.x = arguments[0];
      this.y = arguments[1];
      return this;
    }
  };

  /* Método auxiliar llamado por p5.Element.style() */
  p5.Element.prototype._translate = function() {
    this.elt.style.position = 'absolute';
    //ahorra el estilo de transformación inicial sin traducción
    var transform = '';
    if (this.elt.style.transform) {
      transform = this.elt.style.transform.replace(/translate3d\(.*\)/g, '');
      transform = transform.replace(/translate[X-Z]?\(.*\)/g, '');
    }
    if (arguments.length === 2) {
      this.elt.style.transform =
        'translate(' + arguments[0] + 'px, ' + arguments[1] + 'px)';
    } else if (arguments.length > 2) {
      this.elt.style.transform =
        'translate3d(' +
        arguments[0] +
        'px,' +
        arguments[1] +
        'px,' +
        arguments[2] +
        'px)';
      if (arguments.length === 3) {
        this.elt.parentElement.style.perspective = '1000px';
      } else {
        this.elt.parentElement.style.perspective = arguments[3] + 'px';
      }
    }
    // agrega cualquier estilo de transformación adicional al final
    this.elt.style.transform += transform;
    return this;
  };

  /* Método auxiliar llamado por p5.Element.style() */
  p5.Element.prototype._rotate = function() {
    // ahorra el estilo de transformación inicial sin rotación
    var transform = '';
    if (this.elt.style.transform) {
      transform = this.elt.style.transform.replace(/rotate3d\(.*\)/g, '');
      transform = transform.replace(/rotate[X-Z]?\(.*\)/g, '');
    }

    if (arguments.length === 1) {
      this.elt.style.transform = 'rotate(' + arguments[0] + 'deg)';
    } else if (arguments.length === 2) {
      this.elt.style.transform =
        'rotate(' + arguments[0] + 'deg, ' + arguments[1] + 'deg)';
    } else if (arguments.length === 3) {
      this.elt.style.transform = 'rotateX(' + arguments[0] + 'deg)';
      this.elt.style.transform += 'rotateY(' + arguments[1] + 'deg)';
      this.elt.style.transform += 'rotateZ(' + arguments[2] + 'deg)';
    }
    // agrega la transformación restante nuevamente en
    this.elt.style.transform += transform;
    return this;
  };

  /**
   * Establece la propiedad de estilo dada (css) (1er argumento) del elemento con el
   * valor dado (segundo argumento). Si se da un solo argumento, .style()
   * devuelve el valor de la propiedad dada; sin embargo, si el único argumento
   * se da en la sintaxis css ('text-align: center'), .style () establece el css
   * apropiadamente. .style () también maneja transformaciones CSS 2d y 3d. Si
   * el primer argumento es 'rotar', 'traducir' o 'posicionar', los siguientes argumentos
   * aceptar números como valores. ('traducir', 10, 100, 50);
   *
   * @method style
   * @param  {String} property   propiedad a establecer
   * @param  {String|Number|p5.Color} [value]   valor para asignar a la propiedad (solo Cadena | Número para rotar / traducir)
   * @param  {String|Number|p5.Color} [value2]  la posición puede tomar un segundo valor
   * @param  {String|Number|p5.Color} [value3]  traducir puede tomar un segundo y tercer valor
   * @return {String|Object|p5.Element} valor de la propiedad, si no se especifica ningún valor
   * or p5.Element
   * @example
   * <div><code class='norender'>
   * var myDiv = createDiv('Me gustan los pandas.');
   * myDiv.style('font-size', '18px');
   * myDiv.style('color', '#ff0000');
   * </code></div>
   * <div><code class='norender'>
   * var col = color(25, 23, 200, 50);
   * var button = createButton('button');
   * button.style('background-color', col);
   * button.position(10, 10);
   * </code></div>
   * <div><code class='norender'>
   * var myDiv = createDiv('Me gustan las lagartijas.');
   * myDiv.style('position', 20, 20);
   * myDiv.style('rotate', 45);
   * </code></div>
   * <div><code class='norender'>
   * var myDiv;
   * function setup() {
   *   background(200);
   *   myDiv = createDiv('Me gusta el gris.');
   *   myDiv.position(20, 20);
   * }
   *
   * function draw() {
   *   myDiv.style('font-size', mouseX + 'px');
   * }
   * </code></div>
   */
  p5.Element.prototype.style = function(prop, val) {
    var self = this;

    if (val instanceof p5.Color) {
      val =
        'rgba(' +
        val.levels[0] +
        ',' +
        val.levels[1] +
        ',' +
        val.levels[2] +
        ',' +
        val.levels[3] / 255 +
        ')';
    }

    if (typeof val === 'undefined') {
      if (prop.indexOf(':') === -1) {
        var styles = window.getComputedStyle(self.elt);
        var style = styles.getPropertyValue(prop);
        return style;
      } else {
        var attrs = prop.split(';');
        for (var i = 0; i < attrs.length; i++) {
          var parts = attrs[i].split(':');
          if (parts[0] && parts[1]) {
            this.elt.style[parts[0].trim()] = parts[1].trim();
          }
        }
      }
    } else {
      if (prop === 'rotate' || prop === 'translate' || prop === 'position') {
        var trans = Array.prototype.shift.apply(arguments);
        var f = this[trans] || this['_' + trans];
        f.apply(this, arguments);
      } else {
        this.elt.style[prop] = val;
        if (
          prop === 'width' ||
          prop === 'height' ||
          prop === 'left' ||
          prop === 'top'
        ) {
          var numVal = val.replace(/\D+/g, '');
          this[prop] = parseInt(numVal, 10); // pend: ¿Es esto necesario?
        }
      }
    }
    return this;
  };

  /**
   *
   * Agrega un nuevo atributo o cambia el valor de un atributo existente
   * en el elemento especificado. Si no se especifica ningún valor, devuelve el
   * valor del atributo dado, o nulo si el atributo no está establecido.
   *
   * @method attribute
   * @param  {String} attr       atributo para establecer
   * @param  {String} [value]    valor para asignar al atributo
   * @return {String|Object|p5.Element} valor del atributo, si no hay valor
   *                             específico o p5.Element
   * @example
   * <div class='norender'><code>
   * var myDiv = createDiv('Me gustan los pandas.');
   * myDiv.attribute('align', 'center');
   * </code></div>
   */
  p5.Element.prototype.attribute = function(attr, value) {
    //manejo de casillas de verificación y radios para garantizar que las opciones obtengan
    //atributos no divs
    if (
      this.elt.firstChild != null &&
      (this.elt.firstChild.type === 'checkbox' ||
        this.elt.firstChild.type === 'radio')
    ) {
      if (typeof value === 'undefined') {
        return this.elt.firstChild.getAttribute(attr);
      } else {
        for (var i = 0; i < this.elt.childNodes.length; i++) {
          this.elt.childNodes[i].setAttribute(attr, value);
        }
      }
    } else if (typeof value === 'undefined') {
      return this.elt.getAttribute(attr);
    } else {
      this.elt.setAttribute(attr, value);
      return this;
    }
  };

  /**
   *
   * Elimina un atributo del elemento especificado.
   *
   * @method removeAttribute
   * @param  {String} attr       atributo para eliminar
   * @return {Object|p5.Element}
   *
   * @example
   * <div><code>
   * var button;
   * var checkbox;
   *
   * function setup() {
   *   checkbox = createCheckbox('enable', true);
   *   checkbox.changed(enableButton);
   *   button = createButton('button');
   *   button.position(10, 10);
   * }
   *
   * function enableButton() {
   *   if (this.checked()) {
   *     // Vuelva a habilitar el botón
   *     button.removeAttribute('disabled');
   *   } else {
   *     // Desactivar el botón
   *     button.attribute('disabled', '');
   *   }
   * }
   * </code></div>
   */
  p5.Element.prototype.removeAttribute = function(attr) {
    if (
      this.elt.firstChild != null &&
      (this.elt.firstChild.type === 'checkbox' ||
        this.elt.firstChild.type === 'radio')
    ) {
      for (var i = 0; i < this.elt.childNodes.length; i++) {
        this.elt.childNodes[i].removeAttribute(attr);
      }
    }
    this.elt.removeAttribute(attr);
    return this;
  };

  /**
   * O devuelve el valor del elemento si no hay argumentos
   * dados, o establece el valor del elemento.
   *
   * @method value
   * @param  {String|Number}     [value]
   * @return {String|Object|p5.Element} valor del elemento si no se especifica ningún valor o p5.
   * @example
   * <div class='norender'><code>
   * // obtiene el valor
   * var inp;
   * function setup() {
   *   inp = createInput('');
   * }
   *
   * function mousePressed() {
   *   print(inp.value());
   * }
   * </code></div>
   * <div class='norender'><code>
   * // establece el valor
   * var inp;
   * function setup() {
   *   inp = createInput('myValue');
   * }
   *
   * function mousePressed() {
   *   inp.value('myValue');
   * }
   * </code></div>
   */
  p5.Element.prototype.value = function() {
    if (arguments.length > 0) {
      this.elt.value = arguments[0];
      return this;
    } else {
      if (this.elt.type === 'range') {
        return parseFloat(this.elt.value);
      } else return this.elt.value;
    }
  };

  /**
   *
   * Muestra el elemento actual. Esencialmente, configuración de visualización: bloque para el estilo.
   *
   * @method show
   * @return {Object|p5.Element}
   * @example
   * <div class='norender'><code>
   * var div = createDiv('div');
   * div.style('display', 'none');
   * div.show(); // convierte la pantalla en bloque
   * </code></div>
   */
  p5.Element.prototype.show = function() {
    this.elt.style.display = 'block';
    return this;
  };

  /**
   * Oculta el elemento actual. Esencialmente, configuración de pantalla: ninguna para el estilo.
   *
   * @method hide
   * @return {Object|p5.Element}
   * @example
   * <div class='norender'><code>
   * var div = createDiv('esta es una div');
   * div.hide();
   * </code></div>
   */
  p5.Element.prototype.hide = function() {
    this.elt.style.display = 'none';
    return this;
  };

  /**
   *
   * Establece el ancho y alto del elemento. AUTO se puede utilizar para
   * solo ajustar una dimensión. Si no se proporcionan argumentos, devuelve el ancho y el alto
   * del elemento en un objeto.
   *
   * @method size
   * @param  {Number|Constant} [w] ancho del elemento, ya sea AUTO o un número
   * @param  {Number|Constant} [h] altura del elemento, ya sea AUTO o un número
   * @return {Object|p5.Element}
   * @example
   * <div class='norender'><code>
   * var div = createDiv('esta es una div');
   * div.size(100, 100);
   * </code></div>
   */
  p5.Element.prototype.size = function(w, h) {
    if (arguments.length === 0) {
      return { width: this.elt.offsetWidth, height: this.elt.offsetHeight };
    } else {
      var aW = w;
      var aH = h;
      var AUTO = p5.prototype.AUTO;
      if (aW !== AUTO || aH !== AUTO) {
        if (aW === AUTO) {
          aW = h * this.width / this.height;
        } else if (aH === AUTO) {
          aH = w * this.height / this.width;
        }
        // establecer diff para cnv vs div normal
        if (this.elt instanceof HTMLCanvasElement) {
          var j = {};
          var k = this.elt.getContext('2d');
          var prop;
          for (prop in k) {
            j[prop] = k[prop];
          }
          this.elt.setAttribute('width', aW * this._pInst._pixelDensity);
          this.elt.setAttribute('height', aH * this._pInst._pixelDensity);
          this.elt.setAttribute(
            'style',
            'width:' + aW + 'px; height:' + aH + 'px'
          );
          this._pInst.scale(
            this._pInst._pixelDensity,
            this._pInst._pixelDensity
          );
          for (prop in j) {
            this.elt.getContext('2d')[prop] = j[prop];
          }
        } else {
          this.elt.style.width = aW + 'px';
          this.elt.style.height = aH + 'px';
          this.elt.width = aW;
          this.elt.height = aH;
          this.width = aW;
          this.height = aH;
        }

        this.width = this.elt.offsetWidth;
        this.height = this.elt.offsetHeight;

        if (this._pInst) {
          // lienzo principal asociado con la instancia p5
          if (this._pInst._curElement.elt === this.elt) {
            this._pInst._setProperty('width', this.elt.offsetWidth);
            this._pInst._setProperty('height', this.elt.offsetHeight);
          }
        }
      }
      return this;
    }
  };

  /**
   * Elimina el elemento y anula el registro de todos los oyentes.
   * @method remove - eliminar
   * @example
   * <div class='norender'><code>
   * var myDiv = createDiv('este es un texto');
   * myDiv.remove();
   * </code></div>
   */
  p5.Element.prototype.remove = function() {
    // anular el registro de eventos
    for (var ev in this._events) {
      this.elt.removeEventListener(ev, this._events[ev]);
    }
    if (this.elt.parentNode) {
      this.elt.parentNode.removeChild(this.elt);
    }
    delete this;
  };

  // =============================================================================
  //                        adiciones p5.MediaElement
  // =============================================================================

  /**
   * Extiende p5.Element para manejar audio y video. Además de los métodos
   * de p5.Element, también contiene métodos para controlar los medios. No lo es
   * llamado directamente, pero p5.MediaElements se crean llamando a createVideo,
   * createAudio y createCapture.
   *
   * @class p5.MediaElement
   * @constructor
   * @param {String} elt nodo DOM que está envuelto
   */
  p5.MediaElement = function(elt, pInst) {
    p5.Element.call(this, elt, pInst);

    var self = this;
    this.elt.crossOrigin = 'anonymous';

    this._prevTime = 0;
    this._cueIDCounter = 0;
    this._cues = [];
    this._pixelDensity = 1;
    this._modified = false;

    /**
     * Ruta a la fuente del elemento multimedia.
     *
     * @property src
     * @return {String} src
     * @example
     * <div><code>
     * var ele;
     *
     * function setup() {
     *   background(250);
     *
     *   //Los objetos p5.MediaElement generalmente se crean
     *   //llamando a createAudio(), createVideo(), y 
     *   //funciones createCapture().
     *
     *   //En este ejemplo creamos
     *   //un nuevo p5.MediaElement a través de createAudio ().
     *   ele = createAudio('assets/beat.mp3');
     *
     *   //Configuraremos nuestro ejemplo para que
     *   //cuando haces clic en el texto,
     *   //un cuadro de alerta muestra el MediaElement
     *   // campo src.
     *   textAlign(CENTER);
     *   text('Haz clic en mi!', width / 2, height / 2);
     * }
     *
     * function mouseClicked() {
     *   //aquí probamos si el mouse está sobre el elemento
     *   //de lienzo cuando se hace clic
     *   if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
     *     //Mostrar el campo src de nuestro p5.MediaElement
     *     alert(ele.src);
     *   }
     * }
     * </code></div>
     */
    Object.defineProperty(self, 'src', {
      get: function() {
        var firstChildSrc = self.elt.children[0].src;
        var srcVal = self.elt.src === window.location.href ? '' : self.elt.src;
        var ret =
          firstChildSrc === window.location.href ? srcVal : firstChildSrc;
        return ret;
      },
      set: function(newValue) {
        for (var i = 0; i < self.elt.children.length; i++) {
          self.elt.removeChild(self.elt.children[i]);
        }
        var source = document.createElement('source');
        source.src = newValue;
        elt.appendChild(source);
        self.elt.src = newValue;
        self.modified = true;
      }
    });

    // devolución de llamada privada _onended, establecida por el método: onended (devolución de llamada)
    self._onended = function() {};
    self.elt.onended = function() {
      self._onended(self);
    };
  };
  p5.MediaElement.prototype = Object.create(p5.Element.prototype);

  /**
   * Reproduce un elemento multimedia HTML5.
   *
   * @method play
   * @return {Object|p5.Element}
   * @example
   * <div><code>
   * var ele;
   *
   * function setup() {
   *   //Los objetos p5.MediaElement generalmente se crean
   *   //llamando a createAudio(), createVideo(),
   *   //y funciones createCapture().
   *
   *   //En este ejemplo creamos
   *   //un nuevo p5.MediaElement a través de createAudio().
   *   ele = createAudio('assets/beat.mp3');
   *
   *   background(250);
   *   textAlign(CENTER);
   *   text('¡Haz "clic" para jugar!', width / 2, height / 2);
   * }
   *
   * function mouseClicked() {
   *   //aquí probamos si el mouse está sobre el
   *   //elemento de lienzo cuando se hace clic
   *   if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
   *     //Aquí llamamos a la función play() en el 
   *     //p5.MediaElement que creamos arriba.
   *     //Esto iniciará la muestra de audio.
   *     ele.play();
   *
   *     background(200);
   *     text('¡Hiciste clic en Reproducir!', width / 2, height / 2);
   *   }
   * }
   * </code></div>
   */
  p5.MediaElement.prototype.play = function() {
    if (this.elt.currentTime === this.elt.duration) {
      this.elt.currentTime = 0;
    }

    if (this.elt.readyState > 1) {
      this.elt.play();
    } else {
      // en Chrome, la reproducción no se puede reanudar después de detenerse y debe recargarse
      this.elt.load();
      this.elt.play();
    }
    return this;
  };

  /**
   * Detiene un elemento multimedia HTML5 (establece la hora actual en cero).
   *
   * @method stop
   * @return {Object|p5.Element}
   * @example
   * <div><code>
   * //Este ejemplo comienza
   * //y detiene una muestra de sonido
   * //cuando el usuario hace clic en el lienzo
   *
   * //Almacenaremos el p5.MediaElement
   * //objeto aquí
   * var ele;
   *
   * //mientras se reproduce nuestro audio,
   * //esto se establecerá en verdadero
   * var sampleIsPlaying = false;
   *
   * function setup() {
   *   //Aquí creamos un objeto p5.MediaElement
   *   //usando la función createAudio().
   *   ele = createAudio('assets/beat.mp3');
   *   background(200);
   *   textAlign(CENTER);
   *   text('¡Dale "click" para jugar!', width / 2, height / 2);
   * }
   *
   * function mouseClicked() {
   *   //aquí probamos si el mouse está sobre el
   *   //elemento de lienzo cuando se hace clic
   *   if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
   *     background(200);
   *
   *     if (sampleIsPlaying) {
   *       //si la muestra se está reproduciendo actualmente
   *       //llamando a la función stop() en
   *       //nuestro p5.MediaElement se detendrá
   *       //y restablecer su corriente
   *       //tiempo a 0 (es decir, comenzará
   *       //al principio la próxima vez
   *       //lo juegas)
   *       ele.stop();
   *
   *       sampleIsPlaying = false;
   *       text('¡Dale "click" para jugar!', width / 2, height / 2);
   *     } else {
   *       //bucle nuestro elemento de sonido hasta que
   *       //llama a ele.stop () en él.
   *       ele.loop();
   *
   *       sampleIsPlaying = true;
   *       text('Click to stop!', width / 2, height / 2);
   *     }
   *   }
   * }
   * </code></div>
   */
  p5.MediaElement.prototype.stop = function() {
    this.elt.pause();
    this.elt.currentTime = 0;
    return this;
  };

  /**
   * Pausa un elemento multimedia HTML5.
   *
   * @method pause
   * @return {Object|p5.Element}
   * @example
   * <div><code>
   * //Este ejemplo comienza
   * //y pausa una muestra de sonido
   * //cuando el usuario hace clic en el lienzo
   *
   * //Almacenaremos el p5.MediaElement
   * //objeto aquí
   * var ele;
   *
   * //mientras se reproduce nuestro audio,
   * //esto se establecerá en verdadero
   * var sampleIsPlaying = false;
   *
   * function setup() {
   *   //Aquí creamos un objeto p5.MediaElement
   *   //usando la función createAudio ().
   *   ele = createAudio('assets/lucky_dragons.mp3');
   *   background(200);
   *   textAlign(CENTER);
   *   text('Click to play!', width / 2, height / 2);
   * }
   *
   * function mouseClicked() {
   *   //aquí probamos si el mouse está sobre el
   *   //elemento de lienzo cuando se hace clic
   *   if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
   *     background(200);
   *
   *     if (sampleIsPlaying) {
   *       //Llamando a pause() en nuestro
   *       //p5.MediaElement lo detendrá
   *       //jugando, pero cuando llamamos al
   *       //funciones loop () o play ()
   *       //la muestra comenzará
   *       //desde donde lo detuvimos.
   *       ele.pause();
   *
   *       sampleIsPlaying = false;
   *       text('¡Haz clic para reanudar!', width / 2, height / 2);
   *     } else {
   *       //repite nuestro elemento de sonido hasta que
   *       //llama a ele.pause () en él.
   *       ele.loop();
   *
   *       sampleIsPlaying = true;
   *       text('Click to pause!', width / 2, height / 2);
   *     }
   *   }
   * }
   * </code></div>
   */
  p5.MediaElement.prototype.pause = function() {
    this.elt.pause();
    return this;
  };

  /**
   * Establece 'loop' en verdadero para un elemento multimedia HTML5 y comience a reproducir.
   *
   * @method loop
   * @return {Object|p5.Element}
   * @example
   * <div><code>
   * //Al hacer clic en el lienzo se repetirá
   * //la muestra de audio hasta que el usuario
   * //vuelva a hacer clic para detenerlo
   *
   * //Almacenaremos el objeto 
   * //p5.MediaElement aquí
   * var ele;
   *
   * //mientras se reproduce nuestro audio,
   * //esto se establecerá en verdadero
   * var sampleIsLooping = false;
   *
   * function setup() {
   *   //Aquí creamos un objeto p5.MediaElement
   *   //usando la función createAudio().
   *   ele = createAudio('assets/lucky_dragons.mp3');
   *   background(200);
   *   textAlign(CENTER);
   *   text('¡Haz clic para hacer un bucle!', width / 2, height / 2);
   * }
   *
   * function mouseClicked() {
   *   //aquí probamos si el ratón está sobre el
   *   //elemento de lienzo cuando se hace clic
   *   if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
   *     background(200);
   *
   *     if (!sampleIsLooping) {
   *       //bucle nuestro elemento de sonido hasta que
   *       //llama a ele.stop () en él.
   *       ele.loop();
   *
   *       sampleIsLooping = true;
   *       text('Haz clic para detener!', width / 2, height / 2);
   *     } else {
   *       ele.stop();
   *
   *       sampleIsLooping = false;
   *       text('¡Haz clic para hacer un bucle!', width / 2, height / 2);
   *     }
   *   }
   * }
   * </code></div>
   */
  p5.MediaElement.prototype.loop = function() {
    this.elt.setAttribute('loop', true);
    this.play();
    return this;
  };
  /**
   * Establezca 'loop' en falso para un elemento multimedia HTML5. El elemento se detendrá
   * cuando llega al final.
   *
   * @method noLoop
   * @return {Object|p5.Element}
   * @example
   * <div><code>
   * //Este ejemplo comienza
   * //y detiene el bucle de la muestra de sonido
   * //cuando el usuario hace clic en el lienzo
   *
   * //Almacenaremos el objeto 
   * //p5.MediaElement aquí
   * var ele;
   * //mientras se reproduce nuestro audio,
   * //esto se establecerá en verdadero
   * var sampleIsPlaying = false;
   *
   * function setup() {
   *   //Here we create a p5.MediaElement object
   *   //using the createAudio() function.
   *   ele = createAudio('assets/beat.mp3');
   *   background(200);
   *   textAlign(CENTER);
   *   text('Click to play!', width / 2, height / 2);
   * }
   *
   * function mouseClicked() {
   *   //here we test if the mouse is over the
   *   //canvas element when it's clicked
   *   if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
   *     background(200);
   *
   *     if (sampleIsPlaying) {
   *       ele.noLoop();
   *       text('No more Loops!', width / 2, height / 2);
   *     } else {
   *       ele.loop();
   *       sampleIsPlaying = true;
   *       text('Click to stop looping!', width / 2, height / 2);
   *     }
   *   }
   * }
   * </code></div>
   *
   */
  p5.MediaElement.prototype.noLoop = function() {
    this.elt.setAttribute('loop', false);
    return this;
  };

  /**
   * Set HTML5 media element to autoplay or not.
   *
   * @method autoplay
   * @param {Boolean} autoplay whether the element should autoplay
   * @return {Object|p5.Element}
   */
  p5.MediaElement.prototype.autoplay = function(val) {
    this.elt.setAttribute('autoplay', val);
    return this;
  };

  /**
   * Sets volume for this HTML5 media element. If no argument is given,
   * returns the current volume.
   *
   * @param {Number}            [val] volume between 0.0 and 1.0
   * @return {Number|p5.MediaElement} current volume or p5.MediaElement
   * @method volume
   *
   * @example
   * <div><code>
   * var ele;
   * function setup() {
   *   // p5.MediaElement objects are usually created
   *   // by calling the createAudio(), createVideo(),
   *   // and createCapture() functions.
   *   // In this example we create
   *   // a new p5.MediaElement via createAudio().
   *   ele = createAudio('assets/lucky_dragons.mp3');
   *   background(250);
   *   textAlign(CENTER);
   *   text('Click to Play!', width / 2, height / 2);
   * }
   * function mouseClicked() {
   *   // Here we call the volume() function
   *   // on the sound element to set its volume
   *   // Volume must be between 0.0 and 1.0
   *   ele.volume(0.2);
   *   ele.play();
   *   background(200);
   *   text('You clicked Play!', width / 2, height / 2);
   * }
   * </code></div>
   * <div><code>
   * var audio;
   * var counter = 0;
   *
   * function loaded() {
   *   audio.play();
   * }
   *
   * function setup() {
   *   audio = createAudio('assets/lucky_dragons.mp3', loaded);
   *   textAlign(CENTER);
   * }
   *
   * function draw() {
   *   if (counter === 0) {
   *     background(0, 255, 0);
   *     text('volume(0.9)', width / 2, height / 2);
   *   } else if (counter === 1) {
   *     background(255, 255, 0);
   *     text('volume(0.5)', width / 2, height / 2);
   *   } else if (counter === 2) {
   *     background(255, 0, 0);
   *     text('volume(0.1)', width / 2, height / 2);
   *   }
   * }
   *
   * function mousePressed() {
   *   counter++;
   *   if (counter === 0) {
   *     audio.volume(0.9);
   *   } else if (counter === 1) {
   *     audio.volume(0.5);
   *   } else if (counter === 2) {
   *     audio.volume(0.1);
   *   } else {
   *     counter = 0;
   *     audio.volume(0.9);
   *   }
   * }
   * </code>
   * </div>
   */
  p5.MediaElement.prototype.volume = function(val) {
    if (typeof val === 'undefined') {
      return this.elt.volume;
    } else {
      this.elt.volume = val;
    }
  };

  /**
   * If no arguments are given, returns the current playback speed of the
   * element. The speed parameter sets the speed where 2.0 will play the
   * element twice as fast, 0.5 will play at half the speed, and -1 will play
   * the element in normal speed in reverse.(Note that not all browsers support
   * backward playback and even if they do, playback might not be smooth.)
   *
   * @method speed
   * @param {Number} [speed]  speed multiplier for element playback
   * @return {Number|Object|p5.MediaElement} current playback speed or p5.MediaElement
   * @example
   * <div class='norender'><code>
   * //Clicking the canvas will loop
   * //the audio sample until the user
   * //clicks again to stop it
   *
   * //We will store the p5.MediaElement
   * //object in here
   * var ele;
   * var button;
   *
   * function setup() {
   *   createCanvas(710, 400);
   *   //Here we create a p5.MediaElement object
   *   //using the createAudio() function.
   *   ele = createAudio('assets/beat.mp3');
   *   ele.loop();
   *   background(200);
   *
   *   button = createButton('2x speed');
   *   button.position(100, 68);
   *   button.mousePressed(twice_speed);
   *
   *   button = createButton('half speed');
   *   button.position(200, 68);
   *   button.mousePressed(half_speed);
   *
   *   button = createButton('reverse play');
   *   button.position(300, 68);
   *   button.mousePressed(reverse_speed);
   *
   *   button = createButton('STOP');
   *   button.position(400, 68);
   *   button.mousePressed(stop_song);
   *
   *   button = createButton('PLAY!');
   *   button.position(500, 68);
   *   button.mousePressed(play_speed);
   * }
   *
   * function twice_speed() {
   *   ele.speed(2);
   * }
   *
   * function half_speed() {
   *   ele.speed(0.5);
   * }
   *
   * function reverse_speed() {
   *   ele.speed(-1);
   * }
   *
   * function stop_song() {
   *   ele.stop();
   * }
   *
   * function play_speed() {
   *   ele.play();
   * }
   * </code></div>
   */
  p5.MediaElement.prototype.speed = function(val) {
    if (typeof val === 'undefined') {
      return this.elt.playbackRate;
    } else {
      this.elt.playbackRate = val;
    }
  };

  /**
   * If no arguments are given, returns the current time of the element.
   * If an argument is given the current time of the element is set to it.
   *
   * @method time
   * @param {Number} [time] time to jump to (in seconds)
   * @return {Number|Object|p5.MediaElement} current time (in seconds)
   *                                 or p5.MediaElement
   * @example
   * <div><code>
   * var ele;
   * var beginning = true;
   * function setup() {
   *   //p5.MediaElement objects are usually created
   *   //by calling the createAudio(), createVideo(),
   *   //and createCapture() functions.
   *
   *   //In this example we create
   *   //a new p5.MediaElement via createAudio().
   *   ele = createAudio('assets/lucky_dragons.mp3');
   *   background(250);
   *   textAlign(CENTER);
   *   text('start at beginning', width / 2, height / 2);
   * }
   *
   * // this function fires with click anywhere
   * function mousePressed() {
   *   if (beginning === true) {
   *     // here we start the sound at the beginning
   *     // time(0) is not necessary here
   *     // as this produces the same result as
   *     // play()
   *     ele.play().time(0);
   *     background(200);
   *     text('jump 2 sec in', width / 2, height / 2);
   *     beginning = false;
   *   } else {
   *     // here we jump 2 seconds into the sound
   *     ele.play().time(2);
   *     background(250);
   *     text('start at beginning', width / 2, height / 2);
   *     beginning = true;
   *   }
   * }
   * </code></div>
   */

  p5.MediaElement.prototype.time = function(val) {
    if (typeof val === 'undefined') {
      return this.elt.currentTime;
    } else {
      this.elt.currentTime = val;
    }
  };

  /**
   * Returns the duration of the HTML5 media element.
   *
   * @method duration
   * @return {Number} duration
   *
   * @example
   * <div><code>
   * var ele;
   * function setup() {
   *   //p5.MediaElement objects are usually created
   *   //by calling the createAudio(), createVideo(),
   *   //and createCapture() functions.
   *   //In this example we create
   *   //a new p5.MediaElement via createAudio().
   *   ele = createAudio('assets/doorbell.mp3');
   *   background(250);
   *   textAlign(CENTER);
   *   text('Click to know the duration!', 10, 25, 70, 80);
   * }
   * function mouseClicked() {
   *   ele.play();
   *   background(200);
   *   //ele.duration dislpays the duration
   *   text(ele.duration() + ' seconds', width / 2, height / 2);
   * }
   * </code></div>
   */
  p5.MediaElement.prototype.duration = function() {
    return this.elt.duration;
  };
  p5.MediaElement.prototype.pixels = [];
  p5.MediaElement.prototype.loadPixels = function() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.drawingContext = this.canvas.getContext('2d');
    }
    if (this.loadedmetadata) {
      // wait for metadata for w/h
      if (this.canvas.width !== this.elt.width) {
        this.canvas.width = this.elt.width;
        this.canvas.height = this.elt.height;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
      }
      this.drawingContext.drawImage(
        this.elt,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      p5.Renderer2D.prototype.loadPixels.call(this);
    }
    this.setModified(true);
    return this;
  };
  p5.MediaElement.prototype.updatePixels = function(x, y, w, h) {
    if (this.loadedmetadata) {
      // wait for metadata
      p5.Renderer2D.prototype.updatePixels.call(this, x, y, w, h);
    }
    this.setModified(true);
    return this;
  };
  p5.MediaElement.prototype.get = function(x, y, w, h) {
    if (this.loadedmetadata) {
      // wait for metadata
      return p5.Renderer2D.prototype.get.call(this, x, y, w, h);
    } else if (typeof x === 'undefined') {
      return new p5.Image(1, 1);
    } else if (w > 1) {
      return new p5.Image(x, y, w, h);
    } else {
      return [0, 0, 0, 255];
    }
  };
  p5.MediaElement.prototype.set = function(x, y, imgOrCol) {
    if (this.loadedmetadata) {
      // wait for metadata
      p5.Renderer2D.prototype.set.call(this, x, y, imgOrCol);
      this.setModified(true);
    }
  };
  p5.MediaElement.prototype.copy = function() {
    p5.Renderer2D.prototype.copy.apply(this, arguments);
  };
  p5.MediaElement.prototype.mask = function() {
    this.loadPixels();
    this.setModified(true);
    p5.Image.prototype.mask.apply(this, arguments);
  };
  /**
   * helper method for web GL mode to figure out if the element
   * has been modified and might need to be re-uploaded to texture
   * memory between frames.
   * @method isModified
   * @private
   * @return {boolean} a boolean indicating whether or not the
   * image has been updated or modified since last texture upload.
   */
  p5.MediaElement.prototype.isModified = function() {
    return this._modified;
  };
  /**
   * helper method for web GL mode to indicate that an element has been
   * changed or unchanged since last upload. gl texture upload will
   * set this value to false after uploading the texture; or might set
   * it to true if metadata has become available but there is no actual
   * texture data available yet..
   * @method setModified
   * @param {boolean} val sets whether or not the element has been
   * modified.
   * @private
   */
  p5.MediaElement.prototype.setModified = function(value) {
    this._modified = value;
  };
  /**
   * Schedule an event to be called when the audio or video
   * element reaches the end. If the element is looping,
   * this will not be called. The element is passed in
   * as the argument to the onended callback.
   *
   * @method  onended
   * @param  {Function} callback function to call when the
   *                             soundfile has ended. The
   *                             media element will be passed
   *                             in as the argument to the
   *                             callback.
   * @return {Object|p5.MediaElement}
   * @example
   * <div><code>
   * function setup() {
   *   var audioEl = createAudio('assets/beat.mp3');
   *   audioEl.showControls();
   *   audioEl.onended(sayDone);
   * }
   *
   * function sayDone(elt) {
   *   alert('done playing ' + elt.src);
   * }
   * </code></div>
   */
  p5.MediaElement.prototype.onended = function(callback) {
    this._onended = callback;
    return this;
  };

  /*** CONNECT TO WEB AUDIO API / p5.sound.js ***/

  /**
   * Send the audio output of this element to a specified audioNode or
   * p5.sound object. If no element is provided, connects to p5's master
   * output. That connection is established when this method is first called.
   * All connections are removed by the .disconnect() method.
   *
   * This method is meant to be used with the p5.sound.js addon library.
   *
   * @method  connect
   * @param  {AudioNode|Object} audioNode AudioNode from the Web Audio API,
   * or an object from the p5.sound library
   */
  p5.MediaElement.prototype.connect = function(obj) {
    var audioContext, masterOutput;

    // if p5.sound exists, same audio context
    if (typeof p5.prototype.getAudioContext === 'function') {
      audioContext = p5.prototype.getAudioContext();
      masterOutput = p5.soundOut.input;
    } else {
      try {
        audioContext = obj.context;
        masterOutput = audioContext.destination;
      } catch (e) {
        throw 'connect() is meant to be used with Web Audio API or p5.sound.js';
      }
    }

    // create a Web Audio MediaElementAudioSourceNode if none already exists
    if (!this.audioSourceNode) {
      this.audioSourceNode = audioContext.createMediaElementSource(this.elt);

      // connect to master output when this method is first called
      this.audioSourceNode.connect(masterOutput);
    }

    // connect to object if provided
    if (obj) {
      if (obj.input) {
        this.audioSourceNode.connect(obj.input);
      } else {
        this.audioSourceNode.connect(obj);
      }
    } else {
      // otherwise connect to master output of p5.sound / AudioContext
      this.audioSourceNode.connect(masterOutput);
    }
  };

  /**
   * Disconnect all Web Audio routing, including to master output.
   * This is useful if you want to re-route the output through
   * audio effects, for example.
   *
   * @method  disconnect
   */
  p5.MediaElement.prototype.disconnect = function() {
    if (this.audioSourceNode) {
      this.audioSourceNode.disconnect();
    } else {
      throw 'nothing to disconnect';
    }
  };

  /*** SHOW / HIDE CONTROLS ***/

  /**
   * Show the default MediaElement controls, as determined by the web browser.
   *
   * @method  showControls
   * @example
   * <div><code>
   * var ele;
   * function setup() {
   *   //p5.MediaElement objects are usually created
   *   //by calling the createAudio(), createVideo(),
   *   //and createCapture() functions.
   *   //In this example we create
   *   //a new p5.MediaElement via createAudio()
   *   ele = createAudio('assets/lucky_dragons.mp3');
   *   background(200);
   *   textAlign(CENTER);
   *   text('Click to Show Controls!', 10, 25, 70, 80);
   * }
   * function mousePressed() {
   *   ele.showControls();
   *   background(200);
   *   text('Controls Shown', width / 2, height / 2);
   * }
   * </code></div>
   */
  p5.MediaElement.prototype.showControls = function() {
    // must set style for the element to show on the page
    this.elt.style['text-align'] = 'inherit';
    this.elt.controls = true;
  };

  /**
   * Hide the default mediaElement controls.
   * @method hideControls
   * @example
   * <div><code>
   * var ele;
   * function setup() {
   *   //p5.MediaElement objects are usually created
   *   //by calling the createAudio(), createVideo(),
   *   //and createCapture() functions.
   *   //In this example we create
   *   //a new p5.MediaElement via createAudio()
   *   ele = createAudio('assets/lucky_dragons.mp3');
   *   ele.showControls();
   *   background(200);
   *   textAlign(CENTER);
   *   text('Click to hide Controls!', 10, 25, 70, 80);
   * }
   * function mousePressed() {
   *   ele.hideControls();
   *   background(200);
   *   text('Controls hidden', width / 2, height / 2);
   * }
   * </code></div>
   */
  p5.MediaElement.prototype.hideControls = function() {
    this.elt.controls = false;
  };

  /*** SCHEDULE EVENTS ***/

  // Cue inspired by JavaScript setTimeout, and the
  // Tone.js Transport Timeline Event, MIT License Yotam Mann 2015 tonejs.org
  var Cue = function(callback, time, id, val) {
    this.callback = callback;
    this.time = time;
    this.id = id;
    this.val = val;
  };

  /**
   * Schedule events to trigger every time a MediaElement
   * (audio/video) reaches a playback cue point.
   *
   * Accepts a callback function, a time (in seconds) at which to trigger
   * the callback, and an optional parameter for the callback.
   *
   * Time will be passed as the first parameter to the callback function,
   * and param will be the second parameter.
   *
   *
   * @method  addCue
   * @param {Number}   time     Time in seconds, relative to this media
   *                             element's playback. For example, to trigger
   *                             an event every time playback reaches two
   *                             seconds, pass in the number 2. This will be
   *                             passed as the first parameter to
   *                             the callback function.
   * @param {Function} callback Name of a function that will be
   *                             called at the given time. The callback will
   *                             receive time and (optionally) param as its
   *                             two parameters.
   * @param {Object} [value]    An object to be passed as the
   *                             second parameter to the
   *                             callback function.
   * @return {Number} id ID of this cue,
   *                     useful for removeCue(id)
   * @example
   * <div><code>
   * function setup() {
   *   background(255, 255, 255);
   *
   *   var audioEl = createAudio('assets/beat.mp3');
   *   audioEl.showControls();
   *
   *   // schedule three calls to changeBackground
   *   audioEl.addCue(0.5, changeBackground, color(255, 0, 0));
   *   audioEl.addCue(1.0, changeBackground, color(0, 255, 0));
   *   audioEl.addCue(2.5, changeBackground, color(0, 0, 255));
   *   audioEl.addCue(3.0, changeBackground, color(0, 255, 255));
   *   audioEl.addCue(4.2, changeBackground, color(255, 255, 0));
   *   audioEl.addCue(5.0, changeBackground, color(255, 255, 0));
   * }
   *
   * function changeBackground(val) {
   *   background(val);
   * }
   * </code></div>
   */
  p5.MediaElement.prototype.addCue = function(time, callback, val) {
    var id = this._cueIDCounter++;

    var cue = new Cue(callback, time, id, val);
    this._cues.push(cue);

    if (!this.elt.ontimeupdate) {
      this.elt.ontimeupdate = this._onTimeUpdate.bind(this);
    }

    return id;
  };

  /**
   * Remove a callback based on its ID. The ID is returned by the
   * addCue method.
   * @method removeCue
   * @param  {Number} id ID of the cue, as returned by addCue
   * @example
   * <div><code>
   * var audioEl, id1, id2;
   * function setup() {
   *   background(255, 255, 255);
   *   audioEl = createAudio('assets/beat.mp3');
   *   audioEl.showControls();
   *   // schedule five calls to changeBackground
   *   id1 = audioEl.addCue(0.5, changeBackground, color(255, 0, 0));
   *   audioEl.addCue(1.0, changeBackground, color(0, 255, 0));
   *   audioEl.addCue(2.5, changeBackground, color(0, 0, 255));
   *   audioEl.addCue(3.0, changeBackground, color(0, 255, 255));
   *   id2 = audioEl.addCue(4.2, changeBackground, color(255, 255, 0));
   *   text('Click to remove first and last Cue!', 10, 25, 70, 80);
   * }
   * function mousePressed() {
   *   audioEl.removeCue(id1);
   *   audioEl.removeCue(id2);
   * }
   * function changeBackground(val) {
   *   background(val);
   * }
   * </code></div>
   */
  p5.MediaElement.prototype.removeCue = function(id) {
    for (var i = 0; i < this._cues.length; i++) {
      if (this._cues[i].id === id) {
        console.log(id);
        this._cues.splice(i, 1);
      }
    }

    if (this._cues.length === 0) {
      this.elt.ontimeupdate = null;
    }
  };

  /**
   * Remove all of the callbacks that had originally been scheduled
   * via the addCue method.
   * @method  clearCues
   * @param  {Number} id ID of the cue, as returned by addCue
   * @example
   * <div><code>
   * var audioEl;
   * function setup() {
   *   background(255, 255, 255);
   *   audioEl = createAudio('assets/beat.mp3');
   *   //Show the default MediaElement controls, as determined by the web browser
   *   audioEl.showControls();
   *   // schedule calls to changeBackground
   *   background(200);
   *   text('Click to change Cue!', 10, 25, 70, 80);
   *   audioEl.addCue(0.5, changeBackground, color(255, 0, 0));
   *   audioEl.addCue(1.0, changeBackground, color(0, 255, 0));
   *   audioEl.addCue(2.5, changeBackground, color(0, 0, 255));
   *   audioEl.addCue(3.0, changeBackground, color(0, 255, 255));
   *   audioEl.addCue(4.2, changeBackground, color(255, 255, 0));
   * }
   * function mousePressed() {
   *   // here we clear the scheduled callbacks
   *   audioEl.clearCues();
   *   // then we add some more callbacks
   *   audioEl.addCue(1, changeBackground, color(2, 2, 2));
   *   audioEl.addCue(3, changeBackground, color(255, 255, 0));
   * }
   * function changeBackground(val) {
   *   background(val);
   * }
   * </code></div>
   */
  p5.MediaElement.prototype.clearCues = function() {
    this._cues = [];
    this.elt.ontimeupdate = null;
  };

  // private method that checks for cues to be fired if events
  // have been scheduled using addCue(callback, time).
  p5.MediaElement.prototype._onTimeUpdate = function() {
    var playbackTime = this.time();

    for (var i = 0; i < this._cues.length; i++) {
      var callbackTime = this._cues[i].time;
      var val = this._cues[i].val;

      if (this._prevTime < callbackTime && callbackTime <= playbackTime) {
        // pass the scheduled callbackTime as parameter to the callback
        this._cues[i].callback(val);
      }
    }

    this._prevTime = playbackTime;
  };

  // =============================================================================
  //                         p5.File
  // =============================================================================

  /**
   * Base class for a file
   * Using this for createFileInput
   *
   * @class p5.File
   * @constructor
   * @param {File} file File that is wrapped
   */
  p5.File = function(file, pInst) {
    /**
     * Underlying File object. All normal File methods can be called on this.
     *
     * @property file
     */
    this.file = file;

    this._pInst = pInst;

    // Splitting out the file type into two components
    // This makes determining if image or text etc simpler
    var typeList = file.type.split('/');
    /**
     * File type (image, text, etc.)
     *
     * @property type
     */
    this.type = typeList[0];
    /**
     * File subtype (usually the file extension jpg, png, xml, etc.)
     *
     * @property subtype
     */
    this.subtype = typeList[1];
    /**
     * File name
     *
     * @property name
     */
    this.name = file.name;
    /**
     * File size
     *
     * @property size
     */
    this.size = file.size;

    /**
     * URL string containing image data.
     *
     * @property data
     */
    this.data = undefined;
  };
});
