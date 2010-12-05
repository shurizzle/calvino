Calvino = Class.create({
  initialize: function() {
    this.__langs = new Hash();
    this.__default = undefined;
  },
  setLang: function(name, words) {
    name = name.toLowerCase();

    if (!name.match(/^[a-z]{2}(_[a-z]{2})?$/)) {
      return false;
    }

    this.__langs.set(name, new Calvino.Language());
    this.__langs.get(name).parse(words);
    this[name] = this.__langs.get(name);

    return true;
  },
  unsetLang: function(name) {
    this.__langs.unset(name);
    delete this[name];
  },
  defaultLang: function(name) {
    if (this.__langs.member(name)) {
      return false;
    } else {
      this.__default = name;
      return true;
    }
  },
  defaultError: function() {
    throw("Default language not setted");
  },
  langError: function() {
    throw("Language doens't exist");
  },
  set: function() {
    args = $A(arguments);
    if (args.length > 2) {
      obj = this.__langs.get(args.shift()) || this.langError();
    } else {
      obj = this.__langs.get(this.__default) || this.defaultError();
    }

    return obj.set.apply(obj, args);
  },
  get: function() {
    args = $A(arguments);
    if (args.length > 1) {
      obj = this.__langs.get(args.shift()) || this.langError();
    } else {
      obj = this.__langs.get(this.__default) || this.defaultError();
    }

    return obj.get.apply(obj, args);
  },
  parse: function(words) {
    if (this.__langs.get(this.__default)) {
      if (typeof(words) == 'string')
        words = words.evalJSON();
      words = $H(words);

      if (typeof(words[words.values()[0]]) == 'string')
        this.__langs.get(this.__default).parse(words);
      else
        this._glob_parse(words);
    } else {
      this._glob_parse(words);
    }
  },
  _glob_parse: function(langs) {
    if (typeof(langs) == 'string')
      langs = langs.evalJSON();
    langs = $H(langs);

    langs.each(function(lang) {
      this.setLang(lang.key, lang.value);
    }, this);
  },
  load: function(file) {
    var res = false;

    new Ajax.Request(file, {
      method:       'get',
      asynchronous: false,
      evalJS:       false,

      onSuccess: function(http) {
        res = http.responseText;
      }
    });
    
    if (res) {
      this.parse(res);
      res = true;
    }

    return res;
  }
});

Calvino.Language = Class.create({
  initialize: function() {
    this.__words = new Hash();
  },
  set: function(name, value) {
    if (typeof(name) != 'string' ||
      typeof(value) != 'string')
      return false;

    this.__words.set(name, value);
  },
  get: function(name) {
    if (typeof(this.__words.get(name)) != 'string') {
      return false;
    } else {
      var last = this.__words.get(name);
      var prev;
      var replacements = this.__words.toTemplateReplacements();

      do {
        prev = last;
        last = new Template(last).evaluate(replacements);
      } while (last != prev);

      return last;
    }
  },
  parse: function(words) {
    if (typeof(words) == 'string') {
      words = words.evalJSON();
    }

    words = (words ?
      (Object.isHash(words) ? words : $H(words)) :
      new Hash());

    words.each(function(rule) {
        this.set(rule.key, rule.value);
      }, this);
  }
});
