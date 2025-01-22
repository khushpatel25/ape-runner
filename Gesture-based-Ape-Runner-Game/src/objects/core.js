/**
 * CryptoJS core components.
 */
var CryptoJS = CryptoJS || (function (Math, undefined) {
    /**
     * CryptoJS namespace.
     */
    var C = {};

    /**
     * Library namespace.
     */
    var C_lib = C.lib = {};

    /**
     * Base object for prototypal inheritance.
     */
    var Base = C_lib.Base = (function () {
        function F() {}

        return {
            /**
             * Creates a new object that inherits from this object.
             *
             * @param {Object} overrides Properties to copy into the new object.
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
             */
            extend: function (overrides) {
                // Spawn
                F.prototype = this;
                var subtype = new F();

                // Augment
                if (overrides) {
                    subtype.mixIn(overrides);
                }

                // Create default initializer
                if (!subtype.hasOwnProperty('init')) {
                    subtype.init = function () {
                        subtype.$super.init.apply(this, arguments);
                    };
                }

                // Initializer's prototype is the subtype object
                subtype.init.prototype = subtype;

                // Reference supertype
                subtype.$super = this;

                return subtype;
            },

            /**
             * Extends this object and runs the init method.
             * Arguments to create() will be passed to init().
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var instance = MyType.create();
             */
            create: function () {
                var instance = this.extend();
                instance.init.apply(instance, arguments);

                return instance;
            },

            /**
             * Initializes a newly created object.
             * Override this method to add some logic when your objects are created.
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
             */
            init: function () {},

            /**
             * Copies properties into this object.
             *
             * @param {Object} properties The properties to mix in.
             *
             * @example
             *
             *     MyType.mixIn({
             *         field: 'value'
             *     });
             */
            mixIn: function (properties) {
                for (var propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName)) {
                        this[propertyName] = properties[propertyName];
                    }
                }

                // IE won't copy toString using the loop above
                if (properties.hasOwnProperty('toString')) {
                    this.toString = properties.toString;
                }
            },

            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = instance.clone();
             */
            clone: function () {
                return this.init.prototype.extend(this);
            }
        };
    }());

    /**
     * An array of 32-bit words.
     *
     * @property {Array} words The array of 32-bit words.
     * @property {number} sigBytes The number of significant bytes in this word array.
     */
    var WordArray = C_lib.WordArray = Base.extend({
        /**
         * Initializes a newly created word array.
         *
         * @param {Array} words (Optional) An array of 32-bit words.
         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.create();
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
         */
        init: function (words, sigBytes) {
            words = this.words = words || [];

            if (sigBytes != undefined) {
                this.sigBytes = sigBytes;
            } else {
                this.sigBytes = words.length * 4;
            }
        },

        /**
         * Converts this word array to a string.
         *
         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
         *
         * @return {string} The stringified word array.
         *
         * @example
         *
         *     var string = wordArray + '';
         *     var string = wordArray.toString();
         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
         */
        toString: function (encoder) {
            return (encoder || Hex).stringify(this);
        },

        /**
         * Concatenates a word array to this word array.
         *
         * @param {WordArray} wordArray The word array to append.
         *
         * @return {WordArray} This word array.
         *
         * @example
         *
         *     wordArray1.concat(wordArray2);
         */
        concat: function (wordArray) {
            // Shortcuts
            var thisWords = this.words;
            var thatWords = wordArray.words;
            var thisSigBytes = this.sigBytes;
            var thatSigBytes = wordArray.sigBytes;

            // Clamp excess bits
            this.clamp();

            // Concat
            if (thisSigBytes % 4) {
                // Copy one byte at a time
                for (var i = 0; i < thatSigBytes; i++) {
                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
                }
            } else {
                // Copy one word at a time
                for (var i = 0; i < thatSigBytes; i += 4) {
                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
                }
            }
            this.sigBytes += thatSigBytes;

            // Chainable
            return this;
        },

        /**
         * Removes insignificant bits.
         *
         * @example
         *
         *     wordArray.clamp();
         */
        clamp: function () {
            // Shortcuts
            var words = this.words;
            var sigBytes = this.sigBytes;

            // Clamp
            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
            words.length = Math.ceil(sigBytes / 4);
        },

        /**
         * Creates a copy of this word array.
         *
         * @return {WordArray} The clone.
         *
         * @example
         *
         *     var clone = wordArray.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone.words = this.words.slice(0);

            return clone;
        },

        /**
         * Creates a word array filled with random bytes.
         *
         * @param {number} nBytes The number of random bytes to generate.
         *
         * @return {WordArray} The random word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.random(16);
         */
        random: function (nBytes) {
            var words = [];

            var r = (function (m_w) {
                var m_w = m_w;
                var m_z = 0x3ade68b1;
                var mask = 0xffffffff;

                return function () {
                    m_z = (0x9069 * (m_z & 0xFFFF) + (m_z >> 0x10)) & mask;
                    m_w = (0x4650 * (m_w & 0xFFFF) + (m_w >> 0x10)) & mask;
                    var result = ((m_z << 0x10) + m_w) & mask;
                    result /= 0x100000000;
                    result += 0.5;
                    return result * (Math.random() > .5 ? 1 : -1);
                }
            });

            for (var i = 0, rcache; i < nBytes; i += 4) {
                var _r = r((rcache || Math.random()) * 0x100000000);

                rcache = _r() * 0x3ade67b7;
                words.push((_r() * 0x100000000) | 0);
            }

            return new WordArray.init(words, nBytes);
        }
    });

    /**
     * Encoder namespace.
     */
    var C_enc = C.enc = {};

    /**
     * Hex encoding strategy.
     */
    var Hex = C_enc.Hex = {
        /**
         * Converts a word array to a hex string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The hex string.
         *
         * @static
         *
         * @example
         *
         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var hexChars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                hexChars.push((bite >>> 4).toString(16));
                hexChars.push((bite & 0x0f).toString(16));
            }

            return hexChars.join('');
        },

        /**
         * Converts a hex string to a word array.
         *
         * @param {string} hexStr The hex string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
         */
        parse: function (hexStr) {
            // Shortcut
            var hexStrLength = hexStr.length;

            // Convert
            var words = [];
            for (var i = 0; i < hexStrLength; i += 2) {
                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
            }

            return new WordArray.init(words, hexStrLength / 2);
        }
    };

    /**
     * Latin1 encoding strategy.
     */
    var Latin1 = C_enc.Latin1 = {
        /**
         * Converts a word array to a Latin1 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Latin1 string.
         *
         * @static
         *
         * @example
         *
         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var latin1Chars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                latin1Chars.push(String.fromCharCode(bite));
            }

            return latin1Chars.join('');
        },

        /**
         * Converts a Latin1 string to a word array.
         *
         * @param {string} latin1Str The Latin1 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
         */
        parse: function (latin1Str) {
            // Shortcut
            var latin1StrLength = latin1Str.length;

            // Convert
            var words = [];
            for (var i = 0; i < latin1StrLength; i++) {
                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
            }

            return new WordArray.init(words, latin1StrLength);
        }
    };

    /**
     * UTF-8 encoding strategy.
     */
    var Utf8 = C_enc.Utf8 = {
        /**
         * Converts a word array to a UTF-8 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The UTF-8 string.
         *
         * @static
         *
         * @example
         *
         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
         */
        stringify: function (wordArray) {
            try {
                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
            } catch (e) {
                throw new Error('Malformed UTF-8 data');
            }
        },

        /**
         * Converts a UTF-8 string to a word array.
         *
         * @param {string} utf8Str The UTF-8 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
         */
        parse: function (utf8Str) {
            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
        }
    };

    /**
     * Abstract buffered block algorithm template.
     *
     * The property blockSize must be implemented in a concrete subtype.
     *
     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
     */
    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
        /**
         * Resets this block algorithm's data buffer to its initial state.
         *
         * @example
         *
         *     bufferedBlockAlgorithm.reset();
         */
        reset: function () {
            // Initial values
            this._data = new WordArray.init();
            this._nDataBytes = 0;
        },

        /**
         * Adds new data to this block algorithm's buffer.
         *
         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
         *
         * @example
         *
         *     bufferedBlockAlgorithm._append('data');
         *     bufferedBlockAlgorithm._append(wordArray);
         */
        _append: function (data) {
            // Convert string to WordArray, else assume WordArray already
            if (typeof data == 'string') {
                data = Utf8.parse(data);
            }

            // Append
            this._data.concat(data);
            this._nDataBytes += data.sigBytes;
        },

        /**
         * Processes available data blocks.
         *
         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
         *
         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
         *
         * @return {WordArray} The processed data.
         *
         * @example
         *
         *     var processedData = bufferedBlockAlgorithm._process();
         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
         */
        _process: function (doFlush) {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;
            var dataSigBytes = data.sigBytes;
            var blockSize = this.blockSize;
            var blockSizeBytes = blockSize * 4;

            // Count blocks ready
            var nBlocksReady = dataSigBytes / blockSizeBytes;
            if (doFlush) {
                // Round up to include partial blocks
                nBlocksReady = Math.ceil(nBlocksReady);
            } else {
                // Round down to include only full blocks,
                // less the number of blocks that must remain in the buffer
                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
            }

            // Count words ready
            var nWordsReady = nBlocksReady * blockSize;

            // Count bytes ready
            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

            // Process blocks
            if (nWordsReady) {
                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                    // Perform concrete-algorithm logic
                    this._doProcessBlock(dataWords, offset);
                }

                // Remove processed words
                var processedWords = dataWords.splice(0, nWordsReady);
                data.sigBytes -= nBytesReady;
            }

            // Return processed words
            return new WordArray.init(processedWords, nBytesReady);
        },

        /**
         * Creates a copy of this object.
         *
         * @return {Object} The clone.
         *
         * @example
         *
         *     var clone = bufferedBlockAlgorithm.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone._data = this._data.clone();

            return clone;
        },

        _minBufferSize: 0
    });

    /**
     * Abstract hasher template.
     *
     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
     */
    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
        /**
         * Configuration options.
         */
        cfg: Base.extend(),

        /**
         * Initializes a newly created hasher.
         *
         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
         *
         * @example
         *
         *     var hasher = CryptoJS.algo.SHA256.create();
         */
        init: function (cfg) {
            // Apply config defaults
            this.cfg = this.cfg.extend(cfg);

            // Set initial values
            this.reset();
        },

        /**
         * Resets this hasher to its initial state.
         *
         * @example
         *
         *     hasher.reset();
         */
        reset: function () {
            // Reset data buffer
            BufferedBlockAlgorithm.reset.call(this);

            // Perform concrete-hasher logic
            this._doReset();
        },

        /**
         * Updates this hasher with a message.
         *
         * @param {WordArray|string} messageUpdate The message to append.
         *
         * @return {Hasher} This hasher.
         *
         * @example
         *
         *     hasher.update('message');
         *     hasher.update(wordArray);
         */
        update: function (messageUpdate) {
            // Append
            this._append(messageUpdate);

            // Update the hash
            this._process();

            // Chainable
            return this;
        },

        /**
         * Finalizes the hash computation.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} messageUpdate (Optional) A final message update.
         *
         * @return {WordArray} The hash.
         *
         * @example
         *
         *     var hash = hasher.finalize();
         *     var hash = hasher.finalize('message');
         *     var hash = hasher.finalize(wordArray);
         */
        finalize: function (messageUpdate) {
            // Final message update
            if (messageUpdate) {
                this._append(messageUpdate);
            }

            // Perform concrete-hasher logic
            var hash = this._doFinalize();

            return hash;
        },

        blockSize: 512 / 32,

        /**
         * Creates a shortcut function to a hasher's object interface.
         *
         * @param {Hasher} hasher The hasher to create a helper for.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
         */
        _createHelper: function (hasher) {
            return function (message, cfg) {
                return new hasher.init(cfg).finalize(message);
            };
        },

        /**
         * Creates a shortcut function to the HMAC's object interface.
         *
         * @param {Hasher} hasher The hasher to use in this HMAC helper.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
         */
        _createHmacHelper: function (hasher) {
            return function (message, key) {
                return new C_algo.HMAC.init(hasher, key).finalize(message);
            };
        }
    });

    /**
     * Algorithm namespace.
     */
    var C_algo = C.algo = {};

    return C;
}(Math));

(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var C_enc = C.enc;

    /**
     * Base64 encoding strategy.
     */
    var Base64 = C_enc.Base64 = {
        /**
         * Converts a word array to a Base64 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Base64 string.
         *
         * @static
         *
         * @example
         *
         *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var map = this._map;

            // Clamp excess bits
            wordArray.clamp();

            // Convert
            var base64Chars = [];
            for (var i = 0; i < sigBytes; i += 3) {
                var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
                var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
                var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

                var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

                for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
                    base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
                }
            }

            // Add padding
            var paddingChar = map.charAt(64);
            if (paddingChar) {
                while (base64Chars.length % 4) {
                    base64Chars.push(paddingChar);
                }
            }

            return base64Chars.join('');
        },

        /**
         * Converts a Base64 string to a word array.
         *
         * @param {string} base64Str The Base64 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
         */
        parse: function (base64Str) {
            // Shortcuts
            var base64StrLength = base64Str.length;
            var map = this._map;

            // Ignore padding
            var paddingChar = map.charAt(64);
            if (paddingChar) {
                var paddingIndex = base64Str.indexOf(paddingChar);
                if (paddingIndex != -1) {
                    base64StrLength = paddingIndex;
                }
            }

            // Convert
            var words = [];
            var nBytes = 0;
            for (var i = 0; i < base64StrLength; i++) {
                if (i % 4) {
                    var bits1 = map.indexOf(base64Str.charAt(i - 1)) << ((i % 4) * 2);
                    var bits2 = map.indexOf(base64Str.charAt(i)) >>> (6 - (i % 4) * 2);
                    var bitsCombined = bits1 | bits2;
                    words[nBytes >>> 2] |= (bitsCombined) << (24 - (nBytes % 4) * 8);
                    nBytes++;
                }
            }

            return WordArray.create(words, nBytes);
        },

        _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    };
}());

/*
 A JavaScript implementation of the SHA family of hashes, as
 defined in FIPS PUB 180-4 and FIPS PUB 202, as well as the corresponding
 HMAC implementation as defined in FIPS PUB 198a

 Copyright Brian Turek 2008-2016
 Distributed under the BSD License
 See http://caligatio.github.com/jsSHA/ for more information

 Several functions taken from Paul Johnston
*/
'use strict';(function(X){function C(f,b,c){var d=0,a=[],k=0,g,e,n,h,m,r,t,q,v=!1,u=[],w=[],x,y=!1,z=!1;c=c||{};g=c.encoding||"UTF8";x=c.numRounds||1;n=J(b,g);if(x!==parseInt(x,10)||1>x)throw Error("numRounds must a integer >= 1");if("SHA-1"===f)m=512,r=K,t=Y,h=160,q=function(b){return b.slice()};else if(0===f.lastIndexOf("SHA-",0))if(r=function(b,d){return L(b,d,f)},t=function(b,d,c,a){var l,k;if("SHA-224"===f||"SHA-256"===f)l=(d+65>>>9<<4)+15,k=16;else if("SHA-384"===f||"SHA-512"===f)l=(d+129>>>
    10<<5)+31,k=32;else throw Error("Unexpected error in SHA-2 implementation");for(;b.length<=l;)b.push(0);b[d>>>5]|=128<<24-d%32;d=d+c;b[l]=d&4294967295;b[l-1]=d/4294967296|0;c=b.length;for(d=0;d<c;d+=k)a=L(b.slice(d,d+k),a,f);if("SHA-224"===f)b=[a[0],a[1],a[2],a[3],a[4],a[5],a[6]];else if("SHA-256"===f)b=a;else if("SHA-384"===f)b=[a[0].a,a[0].b,a[1].a,a[1].b,a[2].a,a[2].b,a[3].a,a[3].b,a[4].a,a[4].b,a[5].a,a[5].b];else if("SHA-512"===f)b=[a[0].a,a[0].b,a[1].a,a[1].b,a[2].a,a[2].b,a[3].a,a[3].b,a[4].a,
    a[4].b,a[5].a,a[5].b,a[6].a,a[6].b,a[7].a,a[7].b];else throw Error("Unexpected error in SHA-2 implementation");return b},q=function(b){return b.slice()},"SHA-224"===f)m=512,h=224;else if("SHA-256"===f)m=512,h=256;else if("SHA-384"===f)m=1024,h=384;else if("SHA-512"===f)m=1024,h=512;else throw Error("Chosen SHA variant is not supported");else if(0===f.lastIndexOf("SHA3-",0)||0===f.lastIndexOf("SHAKE",0)){var F=6;r=D;q=function(b){var f=[],a;for(a=0;5>a;a+=1)f[a]=b[a].slice();return f};if("SHA3-224"===
    f)m=1152,h=224;else if("SHA3-256"===f)m=1088,h=256;else if("SHA3-384"===f)m=832,h=384;else if("SHA3-512"===f)m=576,h=512;else if("SHAKE128"===f)m=1344,h=-1,F=31,z=!0;else if("SHAKE256"===f)m=1088,h=-1,F=31,z=!0;else throw Error("Chosen SHA variant is not supported");t=function(b,f,a,d,c){a=m;var l=F,k,g=[],e=a>>>5,h=0,p=f>>>5;for(k=0;k<p&&f>=a;k+=e)d=D(b.slice(k,k+e),d),f-=a;b=b.slice(k);for(f%=a;b.length<e;)b.push(0);k=f>>>3;b[k>>2]^=l<<24-k%4*8;b[e-1]^=128;for(d=D(b,d);32*g.length<c;){b=d[h%5][h/
    5|0];g.push((b.b&255)<<24|(b.b&65280)<<8|(b.b&16711680)>>8|b.b>>>24);if(32*g.length>=c)break;g.push((b.a&255)<<24|(b.a&65280)<<8|(b.a&16711680)>>8|b.a>>>24);h+=1;0===64*h%a&&D(null,d)}return g}}else throw Error("Chosen SHA variant is not supported");e=B(f);this.setHMACKey=function(b,a,c){var l;if(!0===v)throw Error("HMAC key already set");if(!0===y)throw Error("Cannot set HMAC key after calling update");if(!0===z)throw Error("SHAKE is not supported for HMAC");g=(c||{}).encoding||"UTF8";a=J(a,g)(b);
    b=a.binLen;a=a.value;l=m>>>3;c=l/4-1;if(l<b/8){for(a=t(a,b,0,B(f),h);a.length<=c;)a.push(0);a[c]&=4294967040}else if(l>b/8){for(;a.length<=c;)a.push(0);a[c]&=4294967040}for(b=0;b<=c;b+=1)u[b]=a[b]^909522486,w[b]=a[b]^1549556828;e=r(u,e);d=m;v=!0};this.update=function(b){var f,c,g,h=0,q=m>>>5;f=n(b,a,k);b=f.binLen;c=f.value;f=b>>>5;for(g=0;g<f;g+=q)h+m<=b&&(e=r(c.slice(g,g+q),e),h+=m);d+=h;a=c.slice(h>>>5);k=b%m;y=!0};this.getHash=function(b,c){var g,m,n,r;if(!0===v)throw Error("Cannot call getHash after setting HMAC key");
    n=M(c);if(!0===z){if(-1===n.shakeLen)throw Error("shakeLen must be specified in options");h=n.shakeLen}switch(b){case "HEX":g=function(b){return N(b,h,n)};break;case "B64":g=function(b){return O(b,h,n)};break;case "BYTES":g=function(b){return P(b,h)};break;case "ARRAYBUFFER":try{m=new ArrayBuffer(0)}catch(sa){throw Error("ARRAYBUFFER not supported by this environment");}g=function(b){return Q(b,h)};break;default:throw Error("format must be HEX, B64, BYTES, or ARRAYBUFFER");}r=t(a.slice(),k,d,q(e),
    h);for(m=1;m<x;m+=1)!0===z&&0!==h%32&&(r[r.length-1]&=4294967040<<24-h%32),r=t(r,h,0,B(f),h);return g(r)};this.getHMAC=function(b,c){var g,n,u,x;if(!1===v)throw Error("Cannot call getHMAC without first setting HMAC key");u=M(c);switch(b){case "HEX":g=function(b){return N(b,h,u)};break;case "B64":g=function(b){return O(b,h,u)};break;case "BYTES":g=function(b){return P(b,h)};break;case "ARRAYBUFFER":try{g=new ArrayBuffer(0)}catch(z){throw Error("ARRAYBUFFER not supported by this environment");}g=function(b){return Q(b,
    h)};break;default:throw Error("outputFormat must be HEX, B64, BYTES, or ARRAYBUFFER");}n=t(a.slice(),k,d,q(e),h);x=r(w,B(f));x=t(n,h,m,x,h);return g(x)}}function a(f,b){this.a=f;this.b=b}function Z(f,b,a){var d=f.length,l,k,g,e,n;b=b||[0];a=a||0;n=a>>>3;if(0!==d%2)throw Error("String of HEX type must be in byte increments");for(l=0;l<d;l+=2){k=parseInt(f.substr(l,2),16);if(isNaN(k))throw Error("String of HEX type contains invalid characters");e=(l>>>1)+n;for(g=e>>>2;b.length<=g;)b.push(0);b[g]|=k<<
    8*(3-e%4)}return{value:b,binLen:4*d+a}}function aa(f,b,a){var d=[],l,k,g,e,d=b||[0];a=a||0;k=a>>>3;for(l=0;l<f.length;l+=1)b=f.charCodeAt(l),e=l+k,g=e>>>2,d.length<=g&&d.push(0),d[g]|=b<<8*(3-e%4);return{value:d,binLen:8*f.length+a}}function ba(f,b,a){var d=[],l=0,k,g,e,n,h,m,d=b||[0];a=a||0;b=a>>>3;if(-1===f.search(/^[a-zA-Z0-9=+\/]+$/))throw Error("Invalid character in base-64 string");g=f.indexOf("=");f=f.replace(/\=/g,"");if(-1!==g&&g<f.length)throw Error("Invalid '=' found in base-64 string");
    for(g=0;g<f.length;g+=4){h=f.substr(g,4);for(e=n=0;e<h.length;e+=1)k="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(h[e]),n|=k<<18-6*e;for(e=0;e<h.length-1;e+=1){m=l+b;for(k=m>>>2;d.length<=k;)d.push(0);d[k]|=(n>>>16-8*e&255)<<8*(3-m%4);l+=1}}return{value:d,binLen:8*l+a}}function ca(a,b,c){var d=[],l,k,g,d=b||[0];c=c||0;l=c>>>3;for(b=0;b<a.byteLength;b+=1)g=b+l,k=g>>>2,d.length<=k&&d.push(0),d[k]|=a[b]<<8*(3-g%4);return{value:d,binLen:8*a.byteLength+c}}function N(a,b,c){var d=
    "";b/=8;var l,k;for(l=0;l<b;l+=1)k=a[l>>>2]>>>8*(3-l%4),d+="0123456789abcdef".charAt(k>>>4&15)+"0123456789abcdef".charAt(k&15);return c.outputUpper?d.toUpperCase():d}function O(a,b,c){var d="",l=b/8,k,g,e;for(k=0;k<l;k+=3)for(g=k+1<l?a[k+1>>>2]:0,e=k+2<l?a[k+2>>>2]:0,e=(a[k>>>2]>>>8*(3-k%4)&255)<<16|(g>>>8*(3-(k+1)%4)&255)<<8|e>>>8*(3-(k+2)%4)&255,g=0;4>g;g+=1)8*k+6*g<=b?d+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(e>>>6*(3-g)&63):d+=c.b64Pad;return d}function P(a,
    b){var c="",d=b/8,l,k;for(l=0;l<d;l+=1)k=a[l>>>2]>>>8*(3-l%4)&255,c+=String.fromCharCode(k);return c}function Q(a,b){var c=b/8,d,l=new ArrayBuffer(c);for(d=0;d<c;d+=1)l[d]=a[d>>>2]>>>8*(3-d%4)&255;return l}function M(a){var b={outputUpper:!1,b64Pad:"=",shakeLen:-1};a=a||{};b.outputUpper=a.outputUpper||!1;!0===a.hasOwnProperty("b64Pad")&&(b.b64Pad=a.b64Pad);if(!0===a.hasOwnProperty("shakeLen")){if(0!==a.shakeLen%8)throw Error("shakeLen must be a multiple of 8");b.shakeLen=a.shakeLen}if("boolean"!==
    typeof b.outputUpper)throw Error("Invalid outputUpper formatting option");if("string"!==typeof b.b64Pad)throw Error("Invalid b64Pad formatting option");return b}function J(a,b){var c;switch(b){case "UTF8":case "UTF16BE":case "UTF16LE":break;default:throw Error("encoding must be UTF8, UTF16BE, or UTF16LE");}switch(a){case "HEX":c=Z;break;case "TEXT":c=function(a,f,c){var e=[],p=[],n=0,h,m,r,t,q,e=f||[0];f=c||0;r=f>>>3;if("UTF8"===b)for(h=0;h<a.length;h+=1)for(c=a.charCodeAt(h),p=[],128>c?p.push(c):
    2048>c?(p.push(192|c>>>6),p.push(128|c&63)):55296>c||57344<=c?p.push(224|c>>>12,128|c>>>6&63,128|c&63):(h+=1,c=65536+((c&1023)<<10|a.charCodeAt(h)&1023),p.push(240|c>>>18,128|c>>>12&63,128|c>>>6&63,128|c&63)),m=0;m<p.length;m+=1){q=n+r;for(t=q>>>2;e.length<=t;)e.push(0);e[t]|=p[m]<<8*(3-q%4);n+=1}else if("UTF16BE"===b||"UTF16LE"===b)for(h=0;h<a.length;h+=1){c=a.charCodeAt(h);"UTF16LE"===b&&(m=c&255,c=m<<8|c>>>8);q=n+r;for(t=q>>>2;e.length<=t;)e.push(0);e[t]|=c<<8*(2-q%4);n+=2}return{value:e,binLen:8*
    n+f}};break;case "B64":c=ba;break;case "BYTES":c=aa;break;case "ARRAYBUFFER":try{c=new ArrayBuffer(0)}catch(d){throw Error("ARRAYBUFFER not supported by this environment");}c=ca;break;default:throw Error("format must be HEX, TEXT, B64, BYTES, or ARRAYBUFFER");}return c}function y(a,b){return a<<b|a>>>32-b}function R(f,b){return 32<b?(b=b-32,new a(f.b<<b|f.a>>>32-b,f.a<<b|f.b>>>32-b)):0!==b?new a(f.a<<b|f.b>>>32-b,f.b<<b|f.a>>>32-b):f}function v(a,b){return a>>>b|a<<32-b}function w(f,b){var c=null,
    c=new a(f.a,f.b);return c=32>=b?new a(c.a>>>b|c.b<<32-b&4294967295,c.b>>>b|c.a<<32-b&4294967295):new a(c.b>>>b-32|c.a<<64-b&4294967295,c.a>>>b-32|c.b<<64-b&4294967295)}function S(f,b){var c=null;return c=32>=b?new a(f.a>>>b,f.b>>>b|f.a<<32-b&4294967295):new a(0,f.a>>>b-32)}function da(a,b,c){return a&b^~a&c}function ea(f,b,c){return new a(f.a&b.a^~f.a&c.a,f.b&b.b^~f.b&c.b)}function T(a,b,c){return a&b^a&c^b&c}function fa(f,b,c){return new a(f.a&b.a^f.a&c.a^b.a&c.a,f.b&b.b^f.b&c.b^b.b&c.b)}function ga(a){return v(a,
    2)^v(a,13)^v(a,22)}function ha(f){var b=w(f,28),c=w(f,34);f=w(f,39);return new a(b.a^c.a^f.a,b.b^c.b^f.b)}function ia(a){return v(a,6)^v(a,11)^v(a,25)}function ja(f){var b=w(f,14),c=w(f,18);f=w(f,41);return new a(b.a^c.a^f.a,b.b^c.b^f.b)}function ka(a){return v(a,7)^v(a,18)^a>>>3}function la(f){var b=w(f,1),c=w(f,8);f=S(f,7);return new a(b.a^c.a^f.a,b.b^c.b^f.b)}function ma(a){return v(a,17)^v(a,19)^a>>>10}function na(f){var b=w(f,19),c=w(f,61);f=S(f,6);return new a(b.a^c.a^f.a,b.b^c.b^f.b)}function G(a,
    b){var c=(a&65535)+(b&65535);return((a>>>16)+(b>>>16)+(c>>>16)&65535)<<16|c&65535}function oa(a,b,c,d){var l=(a&65535)+(b&65535)+(c&65535)+(d&65535);return((a>>>16)+(b>>>16)+(c>>>16)+(d>>>16)+(l>>>16)&65535)<<16|l&65535}function H(a,b,c,d,l){var e=(a&65535)+(b&65535)+(c&65535)+(d&65535)+(l&65535);return((a>>>16)+(b>>>16)+(c>>>16)+(d>>>16)+(l>>>16)+(e>>>16)&65535)<<16|e&65535}function pa(f,b){var c,d,l;c=(f.b&65535)+(b.b&65535);d=(f.b>>>16)+(b.b>>>16)+(c>>>16);l=(d&65535)<<16|c&65535;c=(f.a&65535)+
    (b.a&65535)+(d>>>16);d=(f.a>>>16)+(b.a>>>16)+(c>>>16);return new a((d&65535)<<16|c&65535,l)}function qa(f,b,c,d){var l,e,g;l=(f.b&65535)+(b.b&65535)+(c.b&65535)+(d.b&65535);e=(f.b>>>16)+(b.b>>>16)+(c.b>>>16)+(d.b>>>16)+(l>>>16);g=(e&65535)<<16|l&65535;l=(f.a&65535)+(b.a&65535)+(c.a&65535)+(d.a&65535)+(e>>>16);e=(f.a>>>16)+(b.a>>>16)+(c.a>>>16)+(d.a>>>16)+(l>>>16);return new a((e&65535)<<16|l&65535,g)}function ra(f,b,c,d,l){var e,g,p;e=(f.b&65535)+(b.b&65535)+(c.b&65535)+(d.b&65535)+(l.b&65535);g=
    (f.b>>>16)+(b.b>>>16)+(c.b>>>16)+(d.b>>>16)+(l.b>>>16)+(e>>>16);p=(g&65535)<<16|e&65535;e=(f.a&65535)+(b.a&65535)+(c.a&65535)+(d.a&65535)+(l.a&65535)+(g>>>16);g=(f.a>>>16)+(b.a>>>16)+(c.a>>>16)+(d.a>>>16)+(l.a>>>16)+(e>>>16);return new a((g&65535)<<16|e&65535,p)}function A(f){var b=0,c=0,d;for(d=0;d<arguments.length;d+=1)b^=arguments[d].b,c^=arguments[d].a;return new a(c,b)}function B(f){var b=[],c;if("SHA-1"===f)b=[1732584193,4023233417,2562383102,271733878,3285377520];else if(0===f.lastIndexOf("SHA-",
    0))switch(b=[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428],c=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],f){case "SHA-224":break;case "SHA-256":b=c;break;case "SHA-384":b=[new a(3418070365,b[0]),new a(1654270250,b[1]),new a(2438529370,b[2]),new a(355462360,b[3]),new a(1731405415,b[4]),new a(41048885895,b[5]),new a(3675008525,b[6]),new a(1203062813,b[7])];break;case "SHA-512":b=[new a(c[0],4089235720),new a(c[1],
    2227873595),new a(c[2],4271175723),new a(c[3],1595750129),new a(c[4],2917565137),new a(c[5],725511199),new a(c[6],4215389547),new a(c[7],327033209)];break;default:throw Error("Unknown SHA variant");}else if(0===f.lastIndexOf("SHA3-",0)||0===f.lastIndexOf("SHAKE",0))for(f=0;5>f;f+=1)b[f]=[new a(0,0),new a(0,0),new a(0,0),new a(0,0),new a(0,0)];else throw Error("No SHA variants supported");return b}function K(a,b){var c=[],d,e,k,g,p,n,h;d=b[0];e=b[1];k=b[2];g=b[3];p=b[4];for(h=0;80>h;h+=1)c[h]=16>h?
    a[h]:y(c[h-3]^c[h-8]^c[h-14]^c[h-16],1),n=20>h?H(y(d,5),e&k^~e&g,p,1518500249,c[h]):40>h?H(y(d,5),e^k^g,p,1859775393,c[h]):60>h?H(y(d,5),T(e,k,g),p,2400959708,c[h]):H(y(d,5),e^k^g,p,3395469782,c[h]),p=g,g=k,k=y(e,30),e=d,d=n;b[0]=G(d,b[0]);b[1]=G(e,b[1]);b[2]=G(k,b[2]);b[3]=G(g,b[3]);b[4]=G(p,b[4]);return b}function Y(a,b,c,d){var e;for(e=(b+65>>>9<<4)+15;a.length<=e;)a.push(0);a[b>>>5]|=128<<24-b%32;b+=c;a[e]=b&4294967295;a[e-1]=b/4294967296|0;b=a.length;for(e=0;e<b;e+=16)d=K(a.slice(e,e+16),d);
    return d}function L(f,b,c){var d,l,k,g,p,n,h,m,r,t,q,v,u,w,x,y,z,F,A,B,C,D,E=[],I;if("SHA-224"===c||"SHA-256"===c)t=64,v=1,D=Number,u=G,w=oa,x=H,y=ka,z=ma,F=ga,A=ia,C=T,B=da,I=e;else if("SHA-384"===c||"SHA-512"===c)t=80,v=2,D=a,u=pa,w=qa,x=ra,y=la,z=na,F=ha,A=ja,C=fa,B=ea,I=U;else throw Error("Unexpected error in SHA-2 implementation");c=b[0];d=b[1];l=b[2];k=b[3];g=b[4];p=b[5];n=b[6];h=b[7];for(q=0;q<t;q+=1)16>q?(r=q*v,m=f.length<=r?0:f[r],r=f.length<=r+1?0:f[r+1],E[q]=new D(m,r)):E[q]=w(z(E[q-2]),
    E[q-7],y(E[q-15]),E[q-16]),m=x(h,A(g),B(g,p,n),I[q],E[q]),r=u(F(c),C(c,d,l)),h=n,n=p,p=g,g=u(k,m),k=l,l=d,d=c,c=u(m,r);b[0]=u(c,b[0]);b[1]=u(d,b[1]);b[2]=u(l,b[2]);b[3]=u(k,b[3]);b[4]=u(g,b[4]);b[5]=u(p,b[5]);b[6]=u(n,b[6]);b[7]=u(h,b[7]);return b}function D(f,b){var c,d,e,k,g=[],p=[];if(null!==f)for(d=0;d<f.length;d+=2)b[(d>>>1)%5][(d>>>1)/5|0]=A(b[(d>>>1)%5][(d>>>1)/5|0],new a((f[d+1]&255)<<24|(f[d+1]&65280)<<8|(f[d+1]&16711680)>>>8|f[d+1]>>>24,(f[d]&255)<<24|(f[d]&65280)<<8|(f[d]&16711680)>>>8|
    f[d]>>>24));for(c=0;24>c;c+=1){k=B("SHA3-");for(d=0;5>d;d+=1)g[d]=A(b[d][0],b[d][1],b[d][2],b[d][3],b[d][4]);for(d=0;5>d;d+=1)p[d]=A(g[(d+4)%5],R(g[(d+1)%5],1));for(d=0;5>d;d+=1)for(e=0;5>e;e+=1)b[d][e]=A(b[d][e],p[d]);for(d=0;5>d;d+=1)for(e=0;5>e;e+=1)k[e][(2*d+3*e)%5]=R(b[d][e],V[d][e]);for(d=0;5>d;d+=1)for(e=0;5>e;e+=1)b[d][e]=A(k[d][e],new a(~k[(d+1)%5][e].a&k[(d+2)%5][e].a,~k[(d+1)%5][e].b&k[(d+2)%5][e].b));b[0][0]=A(b[0][0],W[c])}return b}var e,U,V,W;e=[1116352408,1899447441,3049323471,3921009573,
    961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,
    883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];U=[new a(e[0],3609767458),new a(e[1],602891725),new a(e[2],3964484399),new a(e[3],2173295548),new a(e[4],4081628472),new a(e[5],3053834265),new a(e[6],2937671579),new a(e[7],3664609560),new a(e[8],2734883394),new a(e[9],1164996542),new a(e[10],1323610764),new a(e[11],3590304994),new a(e[12],4068182383),new a(e[13],991336113),new a(e[14],633803317),new a(e[15],
    3479774868),new a(e[16],2666613458),new a(e[17],944711139),new a(e[18],2341262773),new a(e[19],2007800933),new a(e[20],1495990901),new a(e[21],1856431235),new a(e[22],3175218132),new a(e[23],2198950837),new a(e[24],3999719339),new a(e[25],766784016),new a(e[26],2566594879),new a(e[27],3203337956),new a(e[28],1034457026),new a(e[29],2466948901),new a(e[30],3758326383),new a(e[31],168717936),new a(e[32],1188179964),new a(e[33],1546045734),new a(e[34],1522805485),new a(e[35],2643833823),new a(e[36],
    2343527390),new a(e[37],1014477480),new a(e[38],1206759142),new a(e[39],344077627),new a(e[40],1290863460),new a(e[41],3158454273),new a(e[42],3505952657),new a(e[43],106217008),new a(e[44],3606008344),new a(e[45],1432725776),new a(e[46],1467031594),new a(e[47],851169720),new a(e[48],3100823752),new a(e[49],1363258195),new a(e[50],3750685593),new a(e[51],3785050280),new a(e[52],3318307427),new a(e[53],3812723403),new a(e[54],2003034995),new a(e[55],3602036899),new a(e[56],1575990012),new a(e[57],
    1125592928),new a(e[58],2716904306),new a(e[59],442776044),new a(e[60],593698344),new a(e[61],3733110249),new a(e[62],2999351573),new a(e[63],3815920427),new a(3391569614,3928383900),new a(3515267271,566280711),new a(3940187606,3454069534),new a(4118630271,4000239992),new a(116418474,1914138554),new a(174292421,2731055270),new a(289380356,3203993006),new a(460393269,320620315),new a(685471733,587496836),new a(852142971,1086792851),new a(1017036298,365543100),new a(1126000580,2618297676),new a(1288033470,
    3409855158),new a(1501505948,4234509866),new a(1607167915,987167468),new a(1816402316,1246189591)];W=[new a(0,1),new a(0,32898),new a(2147483648,32906),new a(2147483648,2147516416),new a(0,32907),new a(0,2147483649),new a(2147483648,2147516545),new a(2147483648,32777),new a(0,138),new a(0,136),new a(0,2147516425),new a(0,2147483658),new a(0,2147516555),new a(2147483648,139),new a(2147483648,32905),new a(2147483648,32771),new a(2147483648,32770),new a(2147483648,128),new a(0,32778),new a(2147483648,
    2147483658),new a(2147483648,2147516545),new a(2147483648,32896),new a(0,2147483649),new a(2147483648,2147516424)];V=[[0,36,3,41,18],[1,44,10,45,2],[62,6,43,15,61],[28,55,25,21,56],[27,20,39,8,14]];"function"===typeof define&&define.amd?define(function(){return C}):"undefined"!==typeof exports?("undefined"!==typeof module&&module.exports&&(module.exports=C),exports=C):X.jsSHA=C})(window);


    export {
        CryptoJS

    }
    
