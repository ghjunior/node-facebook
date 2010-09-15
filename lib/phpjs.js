module.exports = {

  call_user_func_array : function (cb, parameters) {
      // Call a user function which is the first parameter with the arguments contained in array  
      // 
      // version: 1008.1718
      // discuss at: http://phpjs.org/functions/call_user_func_array
      // +   original by: Thiago Mata (http://thiagomata.blog.com)
      // +   revised  by: Jon Hohle
      // +   improved by: Brett Zamir (http://brett-zamir.me)
      // +   improved by: Diplom@t (http://difane.com/)
      // +   improved by: Brett Zamir (http://brett-zamir.me)
      // *     example 1: call_user_func_array('isNaN', ['a']);
      // *     returns 1: true
      // *     example 2: call_user_func_array('isNaN', [1]);
      // *     returns 2: false
      var func;
   
      if (typeof cb === 'string') {
          func = (typeof this[cb] === 'function') ? this[cb] : func = (new Function(null, 'return ' + cb))();
      } else if (cb instanceof Array) {
          func = ( typeof cb[0] == 'string' ) ? eval(cb[0]+"['"+cb[1]+"']") : func = cb[0][cb[1]];
      } else if (typeof cb === 'function') {
          func = cb;
      }
      
      if (typeof func !== 'function') {
          throw new Error(func + ' is not a valid function');
      }
   
      return (typeof cb[0] === 'string') ? func.apply(eval(cb[0]), parameters) :
                  ( typeof cb[0] !== 'object' ) ? func.apply(null, parameters) : func.apply(cb[0], parameters);
  },

  is_array : function (mixed_var) {
      // Returns true if variable is an array  
      // 
      // version: 1008.1718
      // discuss at: http://phpjs.org/functions/is_array
      // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   improved by: Legaev Andrey
      // +   bugfixed by: Cord
      // +   bugfixed by: Manish
      // +   improved by: Onno Marsman
      // +   improved by: Brett Zamir (http://brett-zamir.me)
      // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
      // %        note 1: In php.js, javascript objects are like php associative arrays, thus JavaScript objects will also
      // %        note 1: return true  in this function (except for objects which inherit properties, being thus used as objects),
      // %        note 1: unless you do ini_set('phpjs.objectsAsArrays', true), in which case only genuine JavaScript arrays
      // %        note 1: will return true
      // *     example 1: is_array(['Kevin', 'van', 'Zonneveld']);
      // *     returns 1: true
      // *     example 2: is_array('Kevin van Zonneveld');
      // *     returns 2: false
      // *     example 3: is_array({0: 'Kevin', 1: 'van', 2: 'Zonneveld'});
      // *     returns 3: true
      // *     example 4: is_array(function tmp_a(){this.name = 'Kevin'});
      // *     returns 4: false
      var key = '';
      var getFuncName = function (fn) {
          var name = (/\W*function\s+([\w\$]+)\s*\(/).exec(fn);
          if (!name) {
              return '(Anonymous)';
          }
          return name[1];
      };
   
      if (!mixed_var) {
          return false;
      }
   
      // BEGIN REDUNDANT
      this.php_js = this.php_js || {};
      this.php_js.ini = this.php_js.ini || {};
      // END REDUNDANT
   
      if (typeof mixed_var === 'object') {
   
          if (this.php_js.ini['phpjs.objectsAsArrays'] &&  // Strict checking for being a JavaScript array (only check this way if call ini_set('phpjs.objectsAsArrays', 0) to disallow objects as arrays)
              (
              (this.php_js.ini['phpjs.objectsAsArrays'].local_value.toLowerCase &&
                      this.php_js.ini['phpjs.objectsAsArrays'].local_value.toLowerCase() === 'off') ||
                  parseInt(this.php_js.ini['phpjs.objectsAsArrays'].local_value, 10) === 0)
              ) {
              return mixed_var.hasOwnProperty('length') && // Not non-enumerable because of being on parent class
                              !mixed_var.propertyIsEnumerable('length') && // Since is own property, if not enumerable, it must be a built-in function
                                  getFuncName(mixed_var.constructor) !== 'String'; // exclude String()
          }
   
          if (mixed_var.hasOwnProperty) {
              for (key in mixed_var) {
                  // Checks whether the object has the specified property
                  // if not, we figure it's not an object in the sense of a php-associative-array.
                  if (false === mixed_var.hasOwnProperty(key)) {
                      return false;
                  }
              }
          }
   
          // Read discussion at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_array/
          return true;
      }
   
      return false;
  },

  http_build_query : function(formdata, numeric_prefix, arg_separator) {
      // Generates a form-encoded query string from an associative array or object.  
      // 
      // version: 1008.1718
      // discuss at: http://phpjs.org/functions/http_build_query
      // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   improved by: Legaev Andrey
      // +   improved by: Michael White (http://getsprink.com)
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   improved by: Brett Zamir (http://brett-zamir.me)
      // +    revised by: stag019
      // -    depends on: urlencode
      // *     example 1: http_build_query({foo: 'bar', php: 'hypertext processor', baz: 'boom', cow: 'milk'}, '', '&amp;');
      // *     returns 1: 'foo=bar&amp;php=hypertext+processor&amp;baz=boom&amp;cow=milk'
      // *     example 2: http_build_query({'php': 'hypertext processor', 0: 'foo', 1: 'bar', 2: 'baz', 3: 'boom', 'cow': 'milk'}, 'myvar_');
      // *     returns 2: 'php=hypertext+processor&myvar_0=foo&myvar_1=bar&myvar_2=baz&myvar_3=boom&cow=milk'
      var value, key, tmp = [];
      
      var self = this;
   
      var _http_build_query_helper = function (key, val, arg_separator) {
          var k, tmp = [];
          if (val === true) {
              val = "1";
          } else if (val === false) {
              val = "0";
          }
          if (val !== null && typeof(val) === "object") {
              for (k in val) {
                  if (val[k] !== null) {
                      tmp.push(_http_build_query_helper(key + "[" + k + "]", val[k], arg_separator));
                  }
              }
              return tmp.join(arg_separator);
          } else if (typeof(val) !== "function") {
              return self.urlencode(key) + "=" + self.urlencode(val);
          } else {
              throw new Error('There was an error processing for http_build_query().');
          }
      };
   
      if (!arg_separator) {
          arg_separator = "&";
      }
      for (key in formdata) {
          value = formdata[key];
          if (numeric_prefix && !isNaN(key)) {
              key = String(numeric_prefix) + key;
          }
          tmp.push(_http_build_query_helper(key, value, arg_separator));
      }
   
      return tmp.join(arg_separator);
  },

  urlencode : function (str) {
      // URL-encodes string  
      // 
      // version: 1008.1718
      // discuss at: http://phpjs.org/functions/urlencode
      // +   original by: Philip Peterson
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +      input by: AJ
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   improved by: Brett Zamir (http://brett-zamir.me)
      // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +      input by: travc
      // +      input by: Brett Zamir (http://brett-zamir.me)
      // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   improved by: Lars Fischer
      // +      input by: Ratheous
      // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
      // +   bugfixed by: Joris
      // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
      // %          note 1: This reflects PHP 5.3/6.0+ behavior
      // %        note 2: Please be aware that this function expects to encode into UTF-8 encoded strings, as found on
      // %        note 2: pages served as UTF-8
      // *     example 1: urlencode('Kevin van Zonneveld!');
      // *     returns 1: 'Kevin+van+Zonneveld%21'
      // *     example 2: urlencode('http://kevin.vanzonneveld.net/');
      // *     returns 2: 'http%3A%2F%2Fkevin.vanzonneveld.net%2F'
      // *     example 3: urlencode('http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a');
      // *     returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a'
      str = (str+'').toString();
      
      // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
      // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
      return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
                                                                      replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
  }

}