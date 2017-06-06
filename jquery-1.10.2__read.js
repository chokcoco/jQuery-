/*!
 * jQuery JavaScript Library v1.10.2
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-07-03T13:48Z
 *
 * 中文注释：Coco
 *
 * last-update: 2016-10-10
 */

// 写在前面：
// jQuery 源码有些方法的实现特别长且繁琐，因为 jQuery 本身作为一个通用性特别强的框架，
// 一个方法兼容了许多情况，也允许用户传入各种不同的参数，导致内部处理的逻辑十分复杂，
// 所以当解读一个方法的时候感觉到了明显的困难，尝试着跳出卡壳的那段代码本身，
// 站在更高的维度去思考这些复杂的逻辑是为了处理或兼容什么，为什么要这样写，一定会有不一样的收获
// 其次，也是因为这个原因，jQuery 源码存在许多兼容低版本的 HACK 或者逻辑十分晦涩繁琐的代码片段
// 浏览器兼容这样的大坑极其容易让一个前端工程师不能学到编程的精髓
// 所以不要太执着于一些边角料，即使兼容性很重要，也应该适度学习理解，适可而止

// 用一个函数域包起来，就是所谓的沙箱
// 在这里边 var 定义的变量，属于这个函数域内的局部变量，避免污染全局
// 把当前沙箱需要的外部变量通过函数参数引入进来
// 只要保证参数对内提供的接口的一致性，你还可以随意替换传进来的这个参数
// 为了不污染全局作用域，只在后面暴露 $ 和 jQuery 这 2 个变量给外界，尽量的避开变量冲突
(function(window, undefined) {

		// Can't do this because several apps including ASP.NET trace
		// the stack via arguments.caller.callee and Firefox dies if
		// you try to trace through "use strict" call chains. (#13335)
		// Support: Firefox 18+
		//"use strict";
		var
			// The deferred used on DOM ready
			// 一个用在 DOM ready 上的回调函数处理变量
			readyList,

			// A central reference to the root jQuery(document)
			// 所有 jQuery 对象最后的指向应该都是回到 jQuery(document)
			rootjQuery,

			// Support: IE<10
			// For `typeof xmlNode.method` instead of `xmlNode.method !== undefined`
			// 将 undefined 转换为字符串 "undefined"
			core_strundefined = typeof undefined,

			// Use the correct document accordingly with window argument (sandbox)
			// 通过闭包函数传入的 window 对象，避免 document 之类的全局变量被其他插件修改
			location = window.location,
			document = window.document,
			docElem = document.documentElement,

			// Map over jQuery in case of overwrite
			// 设置别名，通过两个私有变量映射了 window 环境下的 jQuery 和 $ 两个对象，以防止变量被强行覆盖
			_jQuery = window.jQuery,

			// Map over the $ in case of overwrite
			// 设置别名，同上所述
			_$ = window.$,

			// [[Class]] -> type pairs
			// 储存了常见类型的 typeof 的哈希表
			// Boolean Number String Function Array Date RegExp Object Error
			// 其次，这里定义了一个空对象 {} ，如果下文行文需要调用对象的 toString 和 hasOwnProperty 方法
			// 将会调用 core_toString 和 core_hasOwn ，这两个变量事先存储好了这两个方法的入口
			// 节省查找内存地址时间，提高效率
			class2type = {},

			// 定义当前版本
			// 其次，这里定义了一个字符串对象 ，如果下文行文需要调用字符串对象的 trim 方法
			// 将会调用 core_trim ，这个变量事先存储好了 String.trim 方法的入口
			// 节省查找内存地址时间，提高效率
			core_version = "1.10.2",

			// List of deleted data cache ids, so we can reuse them
			// 其次，这里定义了一个空的数组对象 ，如果下文行文需要调用数组对象的 concat 、push 、slice 、indexOf 方法
			// 将会调用 core_concat 、core_push 、core_slice 、和 core_indexOf ，这四个变量事先存储好了这四个方法的入口
			// 节省查找内存地址时间，提高效率
			// 同时使用 call 或 apply 调用这些方法也可以使类数组也能用到数组的方法
			core_deletedIds = [],

			// Save a reference to some core methods
			// 定义这几个变量的作用如上所述
			// 存储了一些常用的核心方法
			core_concat = core_deletedIds.concat,
			core_push = core_deletedIds.push,
			core_slice = core_deletedIds.slice,
			core_indexOf = core_deletedIds.indexOf,
			core_toString = class2type.toString,
			core_hasOwn = class2type.hasOwnProperty,
			core_trim = core_version.trim,

			// Define a local copy of jQuery
			// 实例化 jQuery 对象 ,selector 是选择器，context 是上下文
			// 用法：$('#xxx') || $('<div></div>', { class: 'css-class', data-name: 'data-val' });
			jQuery = function(selector, context) {
				// The jQuery object is actually just the init constructor 'enhanced'
				// jQuery 没有使用 new 运算符将 jQuery 显示的实例化，而是直接调用其函数
				// 要实现这样,那么 jQuery 就要看成一个类，且返回一个正确的实例
				// 且实例还要能正确访问 jQuery 类原型上的属性与方法
				// 通过原型传递解决问题，把 jQuery 的原型传递给jQuery.prototype.init.prototype
				// jQuery.fn.init.prototype = jQuery.fn;
				// 所以通过这个方法生成的实例 this 所指向的 仍然是 jQuery.fn(jQuery.prototype)，所以能正确访问 jQuery 类原型上的属性与方法
				// http://rapheal.sinaapp.com/2013/01/31/jquery-src-obj/
				return new jQuery.fn.init(selector, context, rootjQuery);
			},

			// Used for matching numbers
			// 匹配数字
			// 第一个分组 (?:\d*\.|) 匹配 数字后面接一个小数点. 例如 123. 456. 或者空（注意正则最后的|）
			// 第二个分组 (?:[eE][+-]?\d+|) 匹配 e+10 或者 E-10 这样的指数表达式 或空
			// 需要注意的是 [+-]? 表示可匹配 +- 0 次或者 1 次，
			// (?:\d*\.|) 可匹配空
			// (?:[eE][+-]?\d+|) 可匹配空
			// 所以这个正则表达式的核心匹配是 /\d+/ 匹配数字一次或者多次
			core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

			// Used for splitting on whitespace
			// \S -- 匹配任意不是空白符的字符
			core_rnotwhite = /\S+/g,

			// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
			// 匹配头尾空格，确保去除 BOM 和 $nbsp;
			// | 分割的两部分是一样，分别匹配头尾的空格
			// 最快的trim方法请看：http://www.cnblogs.com/rubylouvre/archive/2009/09/18/1568794.html
			rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

			// A simple way to check for HTML strings
			// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
			// Strict HTML recognition (#11290: must start with <)
			// 一个简单的检测HTML字符串的表达式
			// 要看懂 jQuery 中的正则匹配，还必须深入理解 exec() 方法
			rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

			// Match a standalone tag
			// 这个正则匹配的是 纯HTML标签,不带任何属性 ，如 '<html></html>' 或者 '<img/>'
			// rsingleTag.test('<html></html>') --> true
			// rsingleTag.test('<img/>') --> true
			// rsingleTag.test('<div class="foo"></div>') --> false
			rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

			// JSON RegExp
			rvalidchars = /^[\],:{}\s]*$/,
			rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
			rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
			rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,

			// Matches dashed string for camelizing
			// 匹配 -ms- 前缀
			rmsPrefix = /^-ms-/,

			// [\da-z] 表示任意英文字母或者数字
			rdashAlpha = /-([\da-z])/gi,

			// Used by jQuery.camelCase as callback to replace()
			// 在 jQuery.camelCase() 中会用到
			// 驼峰表示法，将 font-size 形式转化为 fontSize
			// function camelCase(string){
			// 	return string.replace(/-([a-z])/g,function(all,letter){
			// 		return letter.toUpperCase();
			// 	})
			// }
			fcamelCase = function(all, letter) {
				return letter.toUpperCase();
			},

			// The ready event handler
			completed = function(event) {

				// readyState === "complete" is good enough for us to call the dom ready in oldIE
				if (document.addEventListener || event.type === "load" || document.readyState === "complete") {
					detach();
					jQuery.ready();
				}
			},
			// Clean-up method for dom ready events
			detach = function() {
				if (document.addEventListener) {
					document.removeEventListener("DOMContentLoaded", completed, false);
					window.removeEventListener("load", completed, false);

				} else {
					document.detachEvent("onreadystatechange", completed);
					window.detachEvent("onload", completed);
				}
			};

		// 给 jQuery.prototype 设置别名 jQuery.fn
		// jQuery.prototype 即是 jQuery的原型，挂载在 jQuery.prototype 上的方法，即可让所有 jQuery 对象使用
		jQuery.fn = jQuery.prototype = {
			// The current version of jQuery being used
			// 当前版本
			jquery: core_version,

			// 构造函数
			// 相当于 jQuery.prototype.constructor = jQuery
			// 由于采用对象字面量的方式 jQuery.prototype = {} 重写了 jQuery.prototype
			// 如果不加上下面这句，jQuery.prototype.constructor 将指向 Object，
			// 为了严谨，可以在使用 jQuery.prototype = {} 重写整个 jQuery.prototype 的时候
			// 加上此句，手动让 jQuery.prototype.constructor 指回 jQuery
			// 如果采用 jQuery.prototype.init = function(){} 的方法一个一个新增原型方法
			// 则不需要添加下面这句， jQuery.prototype.constructor 默认指向 jQuery
			// 更为详细的原因可以看看高程3第六章
			constructor: jQuery,

			// 初始化方法
			// 即 构造jQuery对象实际上最后是调用这个方法(new jQuery.fn.init( selector, context, rootjQuery ) )
			// $('#xxx') -> new jQuery('#xxx')
			// 这个方法可以称作 jQuery对象构造器
			init: function(selector, context, rootjQuery) {
				var match, elem;

				// HANDLE: $(""), $(null), $(undefined), $(false)
				// 如果传入的参数为空，则直接返回this
				// 处理"",null,undefined,false,返回this ，增加程序的健壮性
				if (!selector) {
					return this;
				}

				// Handle HTML strings
				// 处理字符串
				if (typeof selector === "string") {
					// 下面这个 if 条件判断是先给 match 变量赋值
					// if 条件相当于这个正则式 /^<\.+>$/
					// 也就是以  "<"开始，">"结尾，且长度大于等于3 ，
					// ex. <p> <html>
					if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
						// Assume that strings that start and end with <> are HTML and skip the regex check
						// 如果selector是html标签组成的话，match的组成直接如下
						// match[1] = selecetor 即匹配的是 (<[\w\W]+>)
						match = [null, selector, null];

						// 并非是以  "<"开始，">"结尾
					} else {
						// 使用 exec 处理 selector ，得到数组match
						// rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/ 简单的检测 HTML 字符串的表达式
						match = rquickExpr.exec(selector);
					}

					// Match html or make sure no context is specified for #id
					// 匹配的html或确保没有上下文指定为# id
					if (match && (match[1] || !context)) {

						// HANDLE: $(html) -> $(array)
						// match[1] 为 true 的情况，是上面的这一句 match = [ null, selector, null ]
						if (match[1]) {
							// 传入上下文
							context = context instanceof jQuery ? context[0] : context;

							// scripts is true for back-compat
							// 合并两个数组内容到第一个数组
							// jQuery.parseHTML -> 使用原生的DOM元素的创建函数，将字符串转换为DOM元素数组，然后可以插入到文档中
							jQuery.merge(this, jQuery.parseHTML(
								match[1],
								context && context.nodeType ? context.ownerDocument || context : document,
								true
							));

							// HANDLE: $(html, props)
							// 这个 if 语句的作用是当 传入的selector 是纯 HTML 标签，且 context 不为空，相当于
							// var jqHTML = $('<div></div>', { class: 'css-class', data-name: 'data-val' });
							// console.log(jqHTML.attr('class')); //css-class
							// console.log(jqHTML.attr('data-name')); //data-val
							// rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/
							// 上面这个正则匹配的是 纯HTML标签,不带任何属性 ，如 '<html></html>' 或者 '<img/>'
							// rsingleTag.test('<html></html>') --> true
							// rsingleTag.test('<img/>') --> true
							// rsingleTag.test('<div class="foo"></div>') --> false
							// jQuery.isPlainObject 用于测试是否为纯粹的对象
							// 纯粹的对象指的是 通过 "{}" 或者 "new Object" 创建的
							if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
								for (match in context) {
									// Properties of context are called as methods if possible
									if (jQuery.isFunction(this[match])) {
										this[match](context[match]);

										// ...and otherwise set as attributes
									} else {
										this.attr(match, context[match]);
									}
								}
							}

							return this;

							// HANDLE: $(#id)
							// 处理id -> $('#id')
							// 反之，match[1]为false 的情况下，是上面的 match = rquickExpr.exec( selector )
						} else {
							// match[2] 是匹配到的 id 名
							elem = document.getElementById(match[2]);

							// Check parentNode to catch when Blackberry 4.6 returns
							// nodes that are no longer in the document #6963
							if (elem && elem.parentNode) {
								// Handle the case where IE and Opera return items
								// by name instead of ID
								if (elem.id !== match[2]) {
									// 调用 Sizzle 引擎进行更复杂的选择器查找
									return rootjQuery.find(selector);
								}

								// Otherwise, we inject the element directly into the jQuery object
								this.length = 1;
								this[0] = elem;
							}

							this.context = document;
							this.selector = selector;
							return this;
						}

						// HANDLE: $(expr, $(...))
						// 如果第一个参数是一个.className ，第二参数为一个选择器
					} else if (!context || context.jquery) {
						// rootjQuery 相当于 jQuery(document)
						// 下面的 return 相当于 $(context).find( selector )
						// (如果 context 为空) jQuery(document).find( selector )
						// 调用 Sizzle 引擎进行更复杂的选择器查找
						return (context || rootjQuery).find(selector);

						// HANDLE: $(expr, context)
						// (which is just equivalent to: $(context).find(expr)
						// 如果第一个参数是.className，第二个参数是一个上下文对象
						// 等同于处理$(.className .className)
					} else {
						// this.constructor 即是 jQuery
						// this.constructor( context ).find( selector ) -> jQuery(context).find(selector)
						// 调用 Sizzle 引擎进行更复杂的选择器查找
						return this.constructor(context).find(selector);
					}

					// HANDLE: $(DOMElement)
					// 处理DOMElement,返回修改过后的this
				} else if (selector.nodeType) {
					this.context = this[0] = selector;
					this.length = 1;
					return this;

					// HANDLE: $(function)
					// Shortcut for document ready
					// 处理$(function(){})
				} else if (jQuery.isFunction(selector)) {
					return rootjQuery.ready(selector);
				}

				// 匹配选择器里嵌套了一个选择器
				// $($('#container')) 相当于 $('#container')
				if (selector.selector !== undefined) {
					this.selector = selector.selector;
					this.context = selector.context;
				}

				return jQuery.makeArray(selector, this);
			},

			// Start with an empty selector
			selector: "",

			// The default length of a jQuery object is 0
			// jQuery 对象的默认长度为 0
			// jQuery 对象里边选取的DOM节点数目，有了这个属性就已经像“半个”数组了，:)
			length: 0,

			// 将 jQuery 对象转换成数组类型，这里返回的结果就真的是 Array 类型了
			// 相当于 Array.prototype.slice.call(this)
			// slice() 方法：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
			toArray: function() {
				return core_slice.call(this);
			},

			// Get the Nth element in the matched element set OR
			// Get the whole matched element set as a clean array
			// 如果 num 不为 null ，将返回索引为 num 的元素
			// （否则）返回索引为 num 的 jQuery 对象
			// 当 num 为负数的时候，相当于从数组尾巴倒数索引
			get: function(num) {
				return num == null ?

					// Return a 'clean' array
					this.toArray() :

					// Return just the object
					// 负数即是可以反向选取
					(num < 0 ? this[this.length + num] : this[num]);
			},

			// Take an array of elements and push it onto the stack
			// (returning the new matched element set)
			// 将一个 DOM 元素集合加入到 jQuery 栈
			// 此方法在 jQuery 的 DOM 操作中被频繁的使用, 如在 parent(), find(), filter() 中
			// pushStack() 方法通过改变一个 jQuery 对象的 prevObject 属性来跟踪链式调用中前一个方法返回的 DOM 结果集合
			// 当我们在链式调用 end() 方法后, 内部就返回当前 jQuery 对象的 prevObject 属性
			pushStack: function(elems) {

				// Build a new jQuery matched element set
				// 构建一个新的jQuery对象，无参的 this.constructor()，只是返回引用 this
				// jQuery.merge 把 elems 节点，合并到新的 jQuery 对象
				// this.constructor 就是 jQuery 的构造函数 jQuery.fn.init，所以 this.constructor() 返回一个 jQuery 对象
				// 由于 jQuery.merge 函数返回的对象是第二个函数附加到第一个上面，所以 ret 也是一个 jQuery 对象，这里可以解释为什么 pushStack 出入的 DOM 对象也可以用 CSS 方法进行操作
				// 返回的对象的 prevObject 属性指向上一个对象，所以可以通过这个属性找到栈的上一个对象
				var ret = jQuery.merge(this.constructor(), elems);

				// Add the old object onto the stack (as a reference)
				// 给返回的新 jQuery 对象添加属性 prevObject
				// 所以也就是为什么通过 prevObject 能取到上一个合集的引用了
				ret.prevObject = this;
				ret.context = this.context;

				// Return the newly-formed element set
				return ret;
			},

			// Execute a callback for every element in the matched set.
			// (You can seed the arguments with an array of args, but this is
			// only used internally.)
			// 具体实现
			each: function(callback, args) {
				return jQuery.each(this, callback, args);
			},

			// 可以看出 ready 回调是绑定在 jQuery 的实例上的
			// $(document).ready(fn)
			// $("#id").ready(fn)
			// 都调用此处
			ready: function(fn) {
				// Add the callback
				// 这里的 jQuery.ready.promise() 返回异步队列
				// 调用异步队列的 done 方法，把 fn 回调加入成功队列里边去
				jQuery.ready.promise().done(fn);

				// 支持jQuery的链式操作
				return this;
			},

			// 构建一个新的jQuery对象数组，并可以回溯回上一个对象
			slice: function() {
				return this.pushStack(core_slice.apply(this, arguments));
			},

			// 取当前 jQuery 对象的第一个
			first: function() {
				return this.eq(0);
			},

			// 取当前 jQuery 对象的最后一个
			last: function() {
				return this.eq(-1);
			},

			// 取当前 jQuery 对象的第 i 个
			eq: function(i) {
				var len = this.length,
					j = +i + (i < 0 ? len : 0);
				return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
			},

			map: function(callback) {
				return this.pushStack(jQuery.map(this, function(elem, i) {
					return callback.call(elem, i, elem);
				}));
			},

			// 回溯链式调用的上一个对象
			// $("#id").find('.clr').html('.clr HTML').end().html('#id HTML')
			// 本来 find 函数已经使得链的上下文切换到 .clr 这个 jQ 对象了，为了最后能回到 #id 这个 jQ 对象
			// 可以使用 end 方法来返回
			// 这里的秘籍就是每个对象里边的 prevObject 保存着链中的上一个 jQ 对象
			end: function() {
				// 回溯的关键是返回 prevObject 属性
				// 而 prevObject 属性保存了上一步操作的 jQuery 对象集合
				return this.prevObject || this.constructor(null);
			},

			// For internal use only.
			// Behaves like an Array's method, not like a jQuery method.
			// 仅在内部使用
			push: core_push,
			sort: [].sort,
			splice: [].splice
		};

		// Give the init function the jQuery prototype for later instantiation
		// jQuery 没有使用 new 运算符将 jQuery 显示的实例化，而是直接调用其函数
		// 要实现这样,那么 jQuery 就要看成一个类，且返回一个正确的实例
		// 且实例还要能正确访问 jQuery 类原型上的属性与方法
		// 通过原型传递解决问题，把 jQuery 的原型传递给jQuery.prototype.init.prototype
		// jQuery.fn.init.prototype = jQuery.fn;
		// 所以通过这个方法生成的实例 this 所指向的 仍然是 jQuery.fn(jQuery.prototype)，所以能正确访问 jQuery 类原型上的属性与方法
		jQuery.fn.init.prototype = jQuery.fn;

		// 扩展合并函数
		// 合并两个或更多对象的属性到第一个对象中，jQuery 后续的大部分功能都通过该函数扩展
		// 虽然实现方式一样，但是要注意区分用法的不一样，那么为什么两个方法指向同一个函数实现，但是却实现不同的功能呢,
		// 阅读源码就能发现这归功于 this 的强大力量
		// 如果传入两个或多个对象，所有对象的属性会被添加到第一个对象 target
		// 如果只传入一个对象，则将对象的属性添加到 jQuery 对象中，也就是添加静态方法
		// 用这种方式，我们可以为 jQuery 命名空间增加新的方法，可以用于编写 jQuery 插件
		// 如果不想改变传入的对象，可以传入一个空对象：$.extend({}, object1, object2);
		// 默认合并操作是不迭代的，即便 target 的某个属性是对象或属性，也会被完全覆盖而不是合并
		// 如果第一个参数是 true，则是深拷贝
		// 从 object 原型继承的属性会被拷贝，值为 undefined 的属性不会被拷贝
		// 因为性能原因，JavaScript 自带类型的属性不会合并
		jQuery.extend = jQuery.fn.extend = function() {
			var src, copyIsArray, copy, name, options, clone,
				target = arguments[0] || {},
				i = 1,
				length = arguments.length,
				deep = false;

			// Handle a deep copy situation
			// target 是传入的第一个参数
			// 如果第一个参数是布尔类型，则表示是否要深递归，
			if (typeof target === "boolean") {
				deep = target;
				target = arguments[1] || {};
				// skip the boolean and the target
				// 如果传了类型为 boolean 的第一个参数，i 则从 2 开始
				i = 2;
			}

			// Handle case when target is a string or something (possible in deep copy)
			// 如果传入的第一个参数是 字符串或者其他
			if (typeof target !== "object" && !jQuery.isFunction(target)) {
				target = {};
			}

			// extend jQuery itself if only one argument is passed
			// 如果参数的长度为 1 ，表示是 jQuery 静态方法
			if (length === i) {
				target = this;
				--i;
			}

			// 可以传入多个复制源
			// i 是从 1或2 开始的
			for (; i < length; i++) {
				// Only deal with non-null/undefined values
				// 将每个源的属性全部复制到 target 上
				if ((options = arguments[i]) != null) {
					// Extend the base object
					for (name in options) {
						// src 是源（即本身）的值
						// copy 是即将要复制过去的值
						src = target[name];
						copy = options[name];

						// Prevent never-ending loop
						// 防止有环，例如 extend(true, target, {'target':target});
						if (target === copy) {
							continue;
						}

						// Recurse if we're merging plain objects or arrays
						// 这里是递归调用，最终都会到下面的 else if 分支
						// jQuery.isPlainObject 用于测试是否为纯粹的对象
						// 纯粹的对象指的是 通过 "{}" 或者 "new Object" 创建的
						// 如果是深复制
						if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
							// 数组
							if (copyIsArray) {
								copyIsArray = false;
								clone = src && jQuery.isArray(src) ? src : [];

								// 对象
							} else {
								clone = src && jQuery.isPlainObject(src) ? src : {};
							}

							// Never move original objects, clone them
							// 递归
							target[name] = jQuery.extend(deep, clone, copy);

							// Don't bring in undefined values
							// 最终都会到这条分支
							// 简单的值覆盖
						} else if (copy !== undefined) {
							target[name] = copy;
						}
					}
				}
			}

			// Return the modified object
			// 返回新的 target
			// 如果 i < length ，是直接返回没经过处理的 target，也就是 arguments[0]
			// 也就是如果不传需要覆盖的源，调用 $.extend 其实是增加 jQuery 的静态方法
			return target;
		};

		// 一些工具函数，区分 jQuery.extend(object) 和 jQuery.fn.extend(object) 区别
		// jQuery.extend(object) 为扩展 jQuery 类本身，为类添加新的方法。
		// jQuery.fn.extend(object) 给 jQuery 对象添加方法
		jQuery.extend({
				// Unique for each copy of jQuery on the page
				// Non-digits removed to match rinlinejQuery
				// 产生jQuery随机数 类似于： "jQuery044958585570566356"
				expando: "jQuery" + (core_version + Math.random()).replace(/\D/g, ""),

				// noConflict() 方法让出变量 $ 的 jQuery 控制权，这样其他脚本就可以使用它了
				// 通过全名替代简写的方式来使用 jQuery
				// deep -- 布尔值。指示是否允许彻底将 jQuery 变量还原(移交 $ 引用的同时是否移交 jQuery 对象本身)
				// 让出 jQuery $ 的控制权不代表不能在 jQuery 使用 $ ，方法如下 （）
				//
				//	var query = jQuery.noConflict(true);
				//
				// (function($) {
				//
				//     // 插件或其他形式的代码，也可以将参数设为 jQuery
				//  })(query);
				//
				//  ... 其他用 $ 作为别名的库的代码
				//
				noConflict: function(deep) {
					// 判断全局 $ 变量是否等于 jQuery 变量
					// 如果等于，则重新还原全局变量 $ 为 jQuery 运行之前的变量（存储在内部变量 _$ 中）
					if (window.$ === jQuery) {
						// 此时 jQuery 别名 $ 失效
						window.$ = _$;
					}
					// 当开启深度冲突处理并且全局变量 jQuery 等于内部 jQuery，则把全局 jQuery 还原成之前的状况
					if (deep && window.jQuery === jQuery) {
						// 如果 deep 为 true，此时 jQuery 失效
						window.jQuery = _jQuery;
					}

					// 这里返回的是 jQuery 库内部的 jQuery 构造函数（new jQuery.fn.init()）
					// 像使用 $ 一样尽情使用它吧
					return jQuery;
				},

				// Is the DOM ready to be used? Set to true once it occurs.
				// DOM ready 是否已经完成
				isReady: false,

				// A counter to track how many items to wait for before
				// the ready event fires. See #6781
				// 控制有多少个 holdReady 事件需要在 Dom ready 之前执行
				readyWait: 1,

				// Hold (or release) the ready event
				// 方法允许调用者延迟 jQuery 的 ready 事件
				// example. 延迟就绪事件，直到已加载的插件。
				//
				// $.holdReady(true);
				// $.getScript("myplugin.js", function() {
				//   $.holdReady(false);
				// });
				//
				holdReady: function(hold) {
					if (hold) {
						jQuery.readyWait++;
					} else {
						jQuery.ready(true);
					}
				},

				// Handle when the DOM is ready
				ready: function(wait) {

					// Abort if there are pending holds or we're already ready
					// 如果需要等待，holdReady()的时候，把hold住的次数减1，如果还没到达0，说明还需要继续hold住，return掉
					// 如果不需要等待，判断是否已经Ready过了，如果已经ready过了，就不需要处理了。异步队列里边的done的回调都会执行了
					if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
						return;
					}

					// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
					// 确定 body 存在
					if (!document.body) {
						// 如果 body 还不存在 ，DOMContentLoaded 未完成，此时
						// 将 jQuery.ready 放入定时器 setTimeout 中
						// 不带时间参数的 setTimeout(a) 相当于 setTimeout(a,0)
						// 但是这里并不是立即触发 jQuery.ready
						// 由于 javascript 的单线程的异步模式
						// setTimeout(jQuery.ready) 会等到重绘完成才执行代码，也就是 DOMContentLoaded 之后才执行 jQuery.ready
						// 所以这里有个小技巧：在 setTimeout 中触发的函数, 一定会在 DOM 准备完毕后触发
						return setTimeout(jQuery.ready);
					}

					// Remember that the DOM is ready
					// 记录 DOM ready 已经完成
					jQuery.isReady = true;

					// If a normal DOM Ready event fired, decrement, and wait if need be
					// wait 为 false 表示ready事情未触发过，否则 return
					if (wait !== true && --jQuery.readyWait > 0) {
						return;
					}

					// If there are functions bound, to execute
					// 调用异步队列，然后派发成功事件出去（最后使用done接收，把上下文切换成document，默认第一个参数是jQuery。
					readyList.resolveWith(document, [jQuery]);

					// Trigger any bound ready events
					// 最后jQuery还可以触发自己的ready事件
					// 例如：
					//    $(document).on('ready', fn2);
					//    $(document).ready(fn1);
					// 这里的fn1会先执行，自己的ready事件绑定的fn2回调后执行
					if (jQuery.fn.trigger) {
						jQuery(document).trigger("ready").off("ready");
					}
				},

				// See test/unit/core.js for details concerning isFunction.
				// Since version 1.3, DOM methods and functions like alert
				// aren't supported. They return false on IE (#2968).
				// 判断传入对象是否为 function
				isFunction: function(obj) {
					return jQuery.type(obj) === "function";
				},
				// 判断传入对象是否为数组
				isArray: Array.isArray || function(obj) {
					return jQuery.type(obj) === "array";
				},
				// 判断传入对象是否为 window 对象
				isWindow: function(obj) {
					/* jshint eqeqeq: false */
					return obj != null && obj == obj.window;
				},
				// 确定它的参数是否是一个数字
				isNumeric: function(obj) {
					return !isNaN(parseFloat(obj)) && isFinite(obj);
				},

				// 确定JavaScript 对象的类型
				// 这个方法的关键之处在于 class2type[core_toString.call(obj)]
				// 可以使得 typeof obj 为 "object" 类型的得到更进一步的精确判断
				type: function(obj) {
					// 如果传入的为 null --> $.type(null)
					// "null"
					if (obj == null) {
						return String(obj);
					}
					// 利用事先存好的 hash 表 class2type 作精准判断
					return typeof obj === "object" || typeof obj === "function" ?
						class2type[core_toString.call(obj)] || "object" :
						typeof obj;
				},
				// 测试对象是否是纯粹的对象
				// 通过 "{}" 或者 "new Object" 创建的
				isPlainObject: function(obj) {
					var key;

					// Must be an Object.
					// Because of IE, we also have to check the presence of the constructor property.
					// Make sure that DOM nodes and window objects don't pass through, as well
					if (!obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) {
						return false;
					}

					try {
						// Not own constructor property must be Object
						if (obj.constructor &&
							!core_hasOwn.call(obj, "constructor") &&
							!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
							return false;
						}
					} catch (e) {
						// IE8,9 Will throw exceptions on certain host objects #9897
						return false;
					}

					// Support: IE<9
					// Handle iteration over inherited properties before own properties.
					if (jQuery.support.ownLast) {
						for (key in obj) {
							return core_hasOwn.call(obj, key);
						}
					}

					// Own properties are enumerated firstly, so to speed up,
					// if last one is own, then all properties are own.
					for (key in obj) {}

					return key === undefined || core_hasOwn.call(obj, key);
				},
				// 检查对象是否为空（不包含任何属性）
				isEmptyObject: function(obj) {
					var name;
					for (name in obj) {
						return false;
					}
					return true;
				},
				// 为 JavaScript 的 "error" 事件绑定一个处理函数
				error: function(msg) {
					throw new Error(msg);
				},
				// data: string of html
				// context (optional): If specified, the fragment will be created in this context, defaults to document
				// keepScripts (optional): If true, will include scripts passed in the html string
				// 将字符串解析到一个 DOM 节点的数组中
				// data -- 用来解析的HTML字符串
				// context -- DOM元素的上下文，在这个上下文中将创建的HTML片段
				// keepScripts  -- 一个布尔值，表明是否在传递的HTML字符串中包含脚本
				parseHTML: function(data, context, keepScripts) {
					// 传入的 data 不是字符串，返回 null
					if (!data || typeof data !== "string") {
						return null;
					}

					// 如果没有传上下文参数
					// function(data,keepScripts)
					if (typeof context === "boolean") {
						keepScripts = context;
						context = false;
					}

					// 如果没有传上下文参数 , 将上下文参数置为 document
					context = context || document;

					// rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
					// 上面这个正则匹配的是 纯HTML标签,不带任何属性 ，如 '<html></html>' 或者 '<img/>'
					// rsingleTag.test('<html></html>') --> true
					// rsingleTag.test('<img/>') --> true
					// rsingleTag.test('<div class="foo"></div>') --> false
					var parsed = rsingleTag.exec(data),
						scripts = !keepScripts && [];
					// 这里相当于
					// if(!keepScripts){
					// 	 scripts = [];
					// }else{
					// 	 scripts = !keepScripts;
					// }

					// Single tag
					// 单个标签，如果捕获的 div 相当于
					// return document.createElement('div');
					if (parsed) {
						return [context.createElement(parsed[1])];
					}

					parsed = jQuery.buildFragment([data], context, scripts);
					if (scripts) {
						jQuery(scripts).remove();
					}
					return jQuery.merge([], parsed.childNodes);
				},

				// 解析 JSON 字符串
				parseJSON: function(data) {
					// Attempt to parse using the native JSON parser first
					if (window.JSON && window.JSON.parse) {
						return window.JSON.parse(data);
					}

					if (data === null) {
						return data;
					}

					if (typeof data === "string") {

						// Make sure leading/trailing whitespace is removed (IE can't handle it)
						data = jQuery.trim(data);

						if (data) {
							// Make sure the incoming data is actual JSON
							// Logic borrowed from http://json.org/json2.js
							if (rvalidchars.test(data.replace(rvalidescape, "@")
									.replace(rvalidtokens, "]")
									.replace(rvalidbraces, ""))) {

								return (new Function("return " + data))();
							}
						}
					}

					jQuery.error("Invalid JSON: " + data);
				},

				// Cross-browser xml parsing
				parseXML: function(data) {
					var xml, tmp;
					if (!data || typeof data !== "string") {
						return null;
					}
					try {
						if (window.DOMParser) { // Standard
							tmp = new DOMParser();
							xml = tmp.parseFromString(data, "text/xml");
						} else { // IE
							xml = new ActiveXObject("Microsoft.XMLDOM");
							xml.async = "false";
							xml.loadXML(data);
						}
					} catch (e) {
						xml = undefined;
					}
					if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
						jQuery.error("Invalid XML: " + data);
					}
					return xml;
				},

				noop: function() {},

				// Evaluates a script in a global context
				// Workarounds based on findings by Jim Driscoll
				// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
				// 一个 eval 的变种（eval()：函数可计算某个字符串，并执行其中的的 JavaScript 代码）
				// globalEval()函数用于全局性地执行一段JavaScript代码
				// 该方法跟eval方法相比有一个作用域的范围差异即始终处于全局作用域下面
				globalEval: function(data) {
					// 如果 data 不为空
					if (data && jQuery.trim(data)) {
						// We use execScript on Internet Explorer
						// We use an anonymous function so that context is window
						// rather than jQuery in Firefox
						// 如果 window.execScript 存在，则直接 window.execScript(data)
						// window.execScript 方法会根据提供的脚本语言执行一段脚本代码
						// 现在是在IE跟旧版本的Chrome是支持此方法的，新版浏览器没有 window.execScript 这个API
						(window.execScript || function(data) {
							// 这里为何不能直接：eval.call( window, data );
							// 在chrome一些旧版本里eval.call( window, data )无效
							window["eval"].call(window, data);
						})(data);
					}
				},

				// Convert dashed to camelCase; used by the css and data modules
				// Microsoft forgot to hump their vendor prefix (#9572)
				// 驼峰表示法 例如将 font-size 变为 fontSize
				// 在很多需要兼容 IE 的地方用得上，例如 IE678 获取 CSS 样式的时候，使用
				// element.currentStyle.getAttribute(camelCase(style)) 传入的参数必须是驼峰表示法
				camelCase: function(string) {
					return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
				},

				// 获取 DOM 节点的节点名字或者判断其名字跟传入参数是否匹配
				nodeName: function(elem, name) {
					// IE下，DOM节点的nodeName是大写的，例如DIV
					// 所以统一转成小写再判断
					// 这里不return elem.nodeName.toLowerCase();
					// 我认为原因是为了保持浏览器自身的对外的规则，避免所有引用nodeName都要做转换的动作
					return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
					// return a && b; 等同于
					// if(a){
					// 		return b;
					// }else{
					// 	  return a;
					// }
				},

				// args is for internal usage only
				// 遍历一个数组或者对象
				// obj 是需要遍历的数组或者对象
				// callback 是处理数组/对象的每个元素的回调函数，它的返回值实际会中断循环的过程
				// args 是额外的参数数组
				each: function(obj, callback, args) {
					var value,
						i = 0,
						length = obj.length,
						isArray = isArraylike(obj); // 判断是不是数组

					// 传了第三个参数
					if (args) {
						if (isArray) {
							for (; i < length; i++) {
								// 相当于:
								// args = [arg1, arg2, arg3];
								// callback(args1, args2, args3)。然后callback里边的this指向了obj[i]
								value = callback.apply(obj[i], args);

								if (value === false) {
									// 注意到，当callback函数返回值会false的时候，注意是全等！循环结束
									break;
								}
							}
							// 非数组
						} else {
							for (i in obj) {
								value = callback.apply(obj[i], args);

								if (value === false) {
									break;
								}
							}
						}

						// A special, fast, case for the most common use of each
					} else {
						// 数组
						// 其实这里代码有点赘余，如果考虑代码的简洁性牺牲一点点性能
						// 在处理数组的情况下，也是可以用 for(i in obj)的
						if (isArray) {
							for (; i < length; i++) {
								// 相当于callback(i, obj[i])。然后callback里边的this指向了obj[i]
								value = callback.call(obj[i], i, obj[i]);

								if (value === false) {
									break;
								}
							}
							// 非数组
						} else {
							for (i in obj) {
								value = callback.call(obj[i], i, obj[i]);

								if (value === false) {
									break;
								}
							}
						}
					}

					return obj;
				},

				// Use native String.trim function wherever possible
				// 去除字符串两端空格
				// core_trim = core_version.trim,
				// rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g
				// \uFEFF 是 utf8 的字节序标记，详见：字节顺序标记 https://zh.wikipedia.org/wiki/%E4%BD%8D%E5%85%83%E7%B5%84%E9%A0%86%E5%BA%8F%E8%A8%98%E8%99%9F
				// \xA0 是全角空格
				trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
					// 如果已经支持原生的 String 的 trim 方法
					// 相当于等于下面这个方法 $.trim = function( text ) {...}
					function(text) {
						return text == null ?
							"" :
							core_trim.call(text);
					} :

					// Otherwise use our own trimming functionality
					// 不支持原生的 String 的 trim 方法
					function(text) {
						return text == null ?
							"" :
							// text + "" 强制类型转换 ，转换为 String 类型
							(text + "").replace(rtrim, "");
					},

				// results is for internal usage only
				// 将类数组对象转换为数组对象
				// 此方法为内部方法
				makeArray: function(arr, results) {
					var ret = results || [];

					if (arr != null) {
						// 如果 arr 是一个类数组对象，调用 merge 合到返回值
						if (isArraylike(Object(arr))) {
							jQuery.merge(ret,
								typeof arr === "string" ?
								[arr] : arr
							);
						} else {
							// 如果不是数组，则将其放到返回数组末尾
							// 等同于 ret.push(arr);
							core_push.call(ret, arr);
						}
					}

					return ret;
				},

				// 在数组中查找指定值并返回它的索引（如果没有找到，则返回-1）
				// elem 规定需检索的值。
				// arr 数组
				// i 可选的整数参数。规定在数组中开始检索的位置。它的合法取值是 0 到 arr.length - 1。如省略该参数，则将从数组首元素开始检索。
				inArray: function(elem, arr, i) {
					var len;

					if (arr) {
						// 如果支持原生的 indexOf 方法，直接调用
						// core_indexOf.call( arr, elem, i ) 相当于：
						// Array.indexOf.call(arr,elem, i)
						if (core_indexOf) {
							return core_indexOf.call(arr, elem, i);
						}

						len = arr.length;
						i = i ? i < 0 ? Math.max(0, len + i) : i : 0;

						for (; i < len; i++) {
							// Skip accessing in sparse arrays
							// jQuery这里的(i in arr)判断是为了跳过稀疏数组中的元素
							// 例如 var arr = []; arr[1] = 1;
							// 此时 arr == [undefined, 1]
							// 结果是 => (0 in arr == false) (1 in arr == true)
							// 测试了一下 $.inArray(undefined, arr, 0)是返回 -1 的
							if (i in arr && arr[i] === elem) {
								return i;
							}
						}
					}

					return -1;
				},

				// merge的两个参数必须为数组，作用就是修改第一个数组，使得它末尾加上第二个数组
				merge: function(first, second) {
					var l = second.length,
						i = first.length,
						j = 0;

					if (typeof l === "number") {
						for (; j < l; j++) {
							first[i++] = second[j];
						}
					} else {
						while (second[j] !== undefined) {
							first[i++] = second[j++];
						}
					}

					first.length = i;

					return first;
				},
				// 查找满足过滤函数的数组元素,原始数组不受影响
				// elems 是传入的数组，callback 是过滤器，inv 为 true 则返回那些被过滤掉的值
				grep: function(elems, callback, inv) {
					var retVal,
						ret = [],
						i = 0,
						length = elems.length;
					// !! 强制类型转换为 boolean 值
					inv = !!inv;

					// Go through the array, only saving the items
					// that pass the validator function
					for (; i < length; i++) {
						// !! 强制类型转换为 boolean 值
						// 注意这里的 callback 参数是先 value,后 key
						if (inv !== retVal) {
							retVal = !!callback(elems[i], i);
							if (inv !== retVal) {
								ret.push(elems[i]);
							}
						}

						return ret;
					},

					// arg is for internal usage only
					// 把数组每一项经过callback处理后的值依次加入到返回数组中
					map: function(elems, callback, arg) {
							var value,
								i = 0,
								length = elems.length,
								isArray = isArraylike(elems),
								ret = [];

							// Go through the array, translating each of the items to their
							// 如果传入的 elems 是数组
							if (isArray) {
								for (; i < length; i++) {
									value = callback(elems[i], i, arg);

									if (value != null) {
										ret[ret.length] = value;
									}
								}

								// Go through every key on the object,
								// 如果传入的 elems 是对象
							} else {
								for (i in elems) {
									value = callback(elems[i], i, arg);

									if (value != null) {
										ret[ret.length] = value;
									}
								}
							}

							// Flatten any nested arrays
							// 这里相当于 var a = [];a.concat(ret)
							return core_concat.apply([], ret);
						},

						// A global GUID counter for objects
						// 一个全局的计数器
						guid: 1,

						// Bind a function to a context, optionally partially applying any
						// arguments.
						// 接受一个函数，然后返回一个新函数，并且这个新函数始终保持了特定的上下文语境
						// fn -- 将要改变上下文语境的函数
						// context -- 函数的上下文语境( this )会被设置成这个 object 对象
						proxy: function(fn, context) {
							var args, proxy, tmp;

							if (typeof context === "string") {
								tmp = fn[context];
								context = fn;
								fn = tmp;
							}

							// Quick check to determine if target is callable, in the spec
							// this throws a TypeError, but we will just return undefined.
							if (!jQuery.isFunction(fn)) {
								return undefined;
							}

							// Simulated bind
							// 将参数转化为数组
							args = core_slice.call(arguments, 2);
							proxy = function() {
								return fn.apply(context || this, args.concat(core_slice.call(arguments)));
							};

							// Set the guid of unique handler to the same of original handler, so it can be removed
							proxy.guid = fn.guid = fn.guid || jQuery.guid++;

							return proxy;
						},

						// Multifunctional method to get and set values of a collection
						// The value/s can optionally be executed if it's a function
						// access 函数只在内部 $.fn.attr 和 $.fn.css 方法中用到
						// example:
						// $('#test').height(100).width(100).css('color', 'red') 或者 $('#test').attr('class','cls1') -- 都会调用 $.access()
						// 这是一个重载方法，根据传入的参数不同，作用不同
     				// @param elems 元素的集合[collection]，[类]数组
     				// @param fn 函数
     				// @param key 属性
     				// @param value 值
     				// @param chainable 是否可以链式调用，如果是 get 动作，为 false，如果是 set 动作，为 true
     				//   对于 get 类方法，我们会获得一个返回值，例如字符串、数字等等，这时候是不需要链式执行的，而对于 set 类方法，通常需要如此
     				// @param emptyGet 如果 jQuery 没有选中到元素的返回值
     				// @param raw value 是否为原始数据，如果 raw 是 true，说明 value 是原始数据，如果是 false，说明 raw 是个函数
     				// @returns {*}
						access: function(elems, fn, key, value, chainable, emptyGet, raw) {
							var i = 0,
								// 元素的集合[collection]，[类]数组
								length = elems.length,
								bulk = key == null;

							// Sets many values
							// 如果参数 key 是对象，表示要设置多个属性，则遍历参数 key，遍历调用 access 方法
							// example:
							// $('#div').attr({data:1,def:'addd'});
							if (jQuery.type(key) === "object") {
								// 设置属性，支持链式调用
								chainable = true;
								for (i in key) {
									jQuery.access(elems, fn, i, key[i], true, emptyGet, raw);
								}

							// Sets one value
							// 设置单个属性
							// example:
							// $('#box').attr('customvalue','abc')
             	// $('#box').attr('customvalue',function (value) {});
							} else if (value !== undefined) {
								// 设置属性，支持链式调用
								chainable = true;

								if (!jQuery.isFunction(value)) {
									raw = true;
								}

								// 相当于
 								// if (key == null && value !== undefined)
								if (bulk) {
									// Bulk operations run against the entire set
									if (raw) {
										fn.call(elems, value);
										fn = null;

									// ...except when executing function values
									// 如果key有值的话，这里的 bulk 是为了节省一个变量，将 fn 用 bulk 存起来，然后封装 fn 的调用
									} else {
										bulk = fn;
										fn = function(elem, key, value) {
											return bulk.call(jQuery(elem), value);
										};
									}
								}

								// 如果 fn 存在，掉调用每一个元素，无论 key 是否有值，都会走到这个判断，执行 set 动作
								if (fn) {
									for (; i < length; i++) {

								    // 如果 value 是原始数据，就取 value，如果是个函数，就调用这个函数取值
                    // $('#box').attr('abc',function (index,value) { });
                    // index 指向当前元素的索引,value 指向 oldValue
                    // 先调用 jQuery.attr(elements[i],key) 取到当前的值，然后调用传入的fn值
										fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
									}
								}
							}

			         // 如果 chainable 为 true，说明是个 set 方法，就返回 elems
			         // 否则说明是 get 方法
			         // 1.如果 bulk 是个 true，说明没有 key 值，调用 fn，将 elems 传进去
			         // 2.如果 bulk 是个 false，说明 key 有值，然后判断元素的长度是否大于 0
			         //    2.1 如果大于 0，调用 fn，传入 elems[0] 和 key ，完成 get
			         //    2.2 如果为 0，说明传参有问题，返回指定的空值 emptyGet
							return chainable ?
								elems :

								// Gets
								bulk ?
								fn.call(elems) :
								length ? fn(elems[0], key) : emptyGet;
						},

						// 获取当前时间
						now: function() {
							return (new Date()).getTime();
						},

						// A method for quickly swapping in/out CSS properties to get correct calculations.
						// Note: this method belongs to the css module but it's needed here for the support module.
						// If support gets modularized, this method should be moved back to the css module.
						// 此方法是属于 css 模块
						swap: function(elem, options, callback, args) {
							var ret, name,
								old = {};

							// Remember the old values, and insert the new ones
							for (name in options) {
								old[name] = elem.style[name];
								elem.style[name] = options[name];
							}

							ret = callback.apply(elem, args || []);

							// Revert the old values
							// 还原旧数据
							for (name in options) {
								elem.style[name] = old[name];
							}

							return ret;
						}
				});

			// $.ready()
			jQuery.ready.promise = function(obj) {
				if (!readyList) {

					// 如果没有，新建一个 Deferred 对象
					// Deferred 用于处理异步延时回调函数，也就是内部用于 ready 的一个异步队列
					readyList = jQuery.Deferred();

					// Catch cases where $(document).ready() is called after the browser event has already occurred.
					// we once tried to use readyState "interactive" here, but it caused issues like the one
					// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
					if (document.readyState === "complete") {
						// Handle it asynchronously to allow scripts the opportunity to delay ready
						// setTimeout : 在setTimeout中触发的函数, 一定会在DOM准备完毕后触发.(即是 DOMContentLoaded)
						setTimeout(jQuery.ready);

						// Standards-based browsers support DOMContentLoaded
						// 支持 DOMContentLoaded 的浏览器 （除去ie 6 7 8）
					} else if (document.addEventListener) {
						// Use the handy event callback
						// 当检测的 document.readyState 的值不为 complete 时， 用 readystatechange 监听 document.readyState 值的变化事件
						document.addEventListener("DOMContentLoaded", completed, false);

						// A fallback to window.onload, that will always work
						// 一种退而求其次的方法，确保一定会发生
						window.addEventListener("load", completed, false);

						// If IE event model is used
						// 如果是 IE 浏览器（6、7、8）
					} else {
						// Ensure firing before onload, maybe late but safe also for iframes
						document.attachEvent("onreadystatechange", completed);

						// A fallback to window.onload, that will always work
						window.attachEvent("onload", completed);

						// If IE and not a frame
						// continually check to see if the document is ready
						// 如果是 IE 且不是在 frame 中
						var top = false;

						try {
							top = window.frameElement == null && document.documentElement;
						} catch (e) {}

						// 如果是IE并且不是iframe
						if (top && top.doScroll) {
							// 这里有个立即执行函数 doScrollCheck()
							(function doScrollCheck() {
								if (!jQuery.isReady) {

									try {
										// Use the trick by Diego Perini
										// http://javascript.nwbox.com/IEContentLoaded/
										// Diego Perini 在 2007 年的时候，报告了一种检测 IE 是否加载完成的方式，使用 doScroll 方法调用
										// 原理就是对于 IE 在非 iframe 内时，只有不断地通过能否执行 doScroll 判断 DOM 是否加载完毕
										// 在上述中间隔 50 毫秒尝试去执行 doScroll，注意，由于页面没有加载完成的时候，调用 doScroll 会导致异常，所以使用了 try - catch 来捕获异常
										// 直到DOM渲染结束了，这个时候 doScroll 方法不会抛出异常，然后就调用$.ready()
										top.doScroll("left");
									} catch (e) {
										return setTimeout(doScrollCheck, 50);
									}

									// detach all dom ready events
									detach();

									// and execute any waiting functions
									jQuery.ready();
								}
							})();
						}
					}
				}
				// 函数返回的是deferred对象，这就可以加上链式操作了
				// 可以使用 .done .fail 等方法
				return readyList.promise(obj);

				// Populate the class2type map
			};
			// typeof 并不能区分出它是 Array 、RegExp 等 object 类型，jQuery 为了扩展 typeof 的表达力，因此有了 $.type 方法
			// 针对一些特殊的对象（例如 null，Array，RegExp）也进行精准的类型判断
			// 运用了钩子机制，判断类型前，将常见类型打表，先存于一个 Hash 表 class2type 里边
			jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
				class2type["[object " + name + "]"] = name.toLowerCase();
			});

			// 返回对象是否是类数组对象
			function isArraylike(obj) {
				var length = obj.length,
					type = jQuery.type(obj);

				if (jQuery.isWindow(obj)) {
					return false;
				}

				if (obj.nodeType === 1 && length) {
					return true;
				}

				return type === "array" || type !== "function" &&
					(length === 0 ||
						typeof length === "number" && length > 0 && (length - 1) in obj);
			}

			// All jQuery objects should point back to these
			// 所有jQuery 对象最后的指向应该都是回到 jQuery(document)
			// 此对象为 document 的 jQuery 对象，所有的 jQuery 对象最终都将指向它
			// 可以在chrome dev tools中观察 prevObject
			rootjQuery = jQuery(document);


			/*!
			 * Sizzle CSS Selector Engine v1.10.2
			 * http://sizzlejs.com/
			 *
			 * Copyright 2013 jQuery Foundation, Inc. and other contributors
			 * Released under the MIT license
			 * http://jquery.org/license
			 *
			 * Date: 2013-07-03
			 */
			// 下面一长篇开始将是 Sizzle 引擎
			(function(window, undefined) {

				// 一些变量，下文会用到，可以先初略了解
				// support -- 用于检测浏览器对一些原生方法是否支持（ document.getElementsByClassName 这些）
				// cachedruns --
				// Expr -- 记录跟选择器相关的属性以及操作
				// getText --
				// isXML -- 是否是XML
				// compile -- 编译函数机制
				// outermostContext -- 最大的上下文环境
				// sortInput --
				var i,
					support,
					cachedruns,
					Expr,
					getText,
					isXML,
					compile,
					outermostContext,
					sortInput,

					// Local document vars
					setDocument,
					document,
					docElem,
					documentIsHTML,
					rbuggyQSA,
					rbuggyMatches,
					matches,
					contains,

					// Instance-specific data
					// 用来对特殊的函数进行标记
					expando = "sizzle" + -(new Date()),
					// 保存复用的 document 变量，提高效率
					preferredDoc = window.document,
					dirruns = 0,
					done = 0,

					// 这里定义了 3 个缓存函数
					// 使用方法：
					// 通过 classCache(key, value) 的形式进行存储
					// 通过 classCache[key+ ' '] 来进行获取
					classCache = createCache(),
					tokenCache = createCache(),
					compilerCache = createCache(),

					// 刚检查完的两个元素是否重复
					hasDuplicate = false,
					sortOrder = function(a, b) {
						if (a === b) {
							hasDuplicate = true;
							return 0;
						}
						return 0;
					},

					// General-purpose constants
					// typeof undefined --> "undefined"
					// 将 undefined 类型转换为字符串，用于判断
					strundefined = typeof undefined,
					MAX_NEGATIVE = 1 << 31,

					// Instance methods
					// 定义一些常用方法的入口（后面使用 apply 或者 call 调用）
					hasOwn = ({}).hasOwnProperty,
					arr = [],
					// 分别缓存了数组的 pop 、push 、silce 方法
					pop = arr.pop,
					push_native = arr.push,
					push = arr.push,
					slice = arr.slice,

					// Use a stripped-down indexOf if we can't use a native one
					// 定义一个 indexOf 方法（如果原生浏览器支持则使用原生的）
					indexOf = arr.indexOf || function(elem) {
						var i = 0,
							len = this.length;
						for (; i < len; i++) {
							if (this[i] === elem) {
								return i;
							}
						}
						return -1;
					},

					// 用来在做属性选择的时候进行判断
					booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

					// Regular expressions
					// 下面是一些正则表达式（或正则表达式片段）

					// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
					// 空白符正则
					// \t 制表符；\r 回车；\n 换行；\f 换页；
					// \xnn 由十六进制数nn指定的拉丁字符 -->  \uxxxx 由十六进制数xxxx指定的Unicode字符,
					// \x20 化为二进制数为 0010 0000 ,对照表格  http://ascii.911cha.com/ ，表示空格
					whitespace = "[\\x20\\t\\r\\n\\f]",
					// http://www.w3.org/TR/css3-syntax/#characters
					// 一段正则规则（这里并非完整的正则表达式，只是一段）
					// 匹配符合 css 命名的字符串
					// \\\\. 转换到正则表达式中就是 \\.+ 用来兼容带斜杠的 css
					// 三种匹配字符的方式：\\.+ ，[\w-]+ , 大于\xa0的字符+ ，为什么匹配这三个请看上面的链接
					characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

					// Loosely modeled on CSS identifier characters
					// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
					// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
					// identifier = "(?:\\.|[\w#-]|[^\x00-\xa0])+"
					identifier = characterEncoding.replace("w", "w#"),

					// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
					// attributes = "\[[\x20\t\r\n\f]*((?:\\.|[\w-]|[^\x00-\xa0])+)[\x20\t\r\n\f]*(?:([*^$|!~]?=)[\x20\t\r\n\f]*(?:(['"])((?:\\.|[^\\])*?)\3|((?:\\.|[\w#-]|[^\x00-\xa0])+)|)|)[\x20\t\r\n\f]*\]"
					// 得到的捕获组序列:
					// $1:attrName, $2:([*^$|!~]?=), $3:(['\"]), $4:((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|), $5:(" + identifier + ")
					// $1 捕获的是 attrName,
					// $2 捕获的是 = 或 != 这样的等号方式，
					// $3 捕获单双引号
					// $4 提供三种匹配字符串的方式：\\.*?\3,非斜$杠*?\3(因为斜杠没意义),识别符,此处相当于捕获 attrValue，只不过要兼容带引号和不带两种形式
					// $5 捕获识别符
					// 看 attributes 开头和结尾匹配的是代表属性选择符的'['和']'，
					// 所以整个正则捕获出来的结果分别代表的含义是[ attrName、等号、引号、attrValue、attrValue ]
					// 大致就是可以匹配 "[name = abc]" | "[name = 'abc']" 这种属性表达式
					attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
					"*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

					// Prefer arguments quoted,
					//   then not containing pseudos/brackets,
					//   then attribute selectors/non-parenthetical expressions,
					//   then anything else
					// These preferences are here to reduce the number of selectors
					//   needing tokenize in the PSEUDO preFilter
					// 伪类
					// 得到的捕获组序列:
					// $1: pseudoName
					// $2: ((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)
					// $3: (['\"])
					// $4: ((?:\\\\.|[^\\\\])*?),$5:((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)
					// $1 捕获伪元素或伪类的名字，
					// $2 捕获两种类型的字符，一种是带引号的字符串，一种是attributes那样的键值对
					// $3 捕获引号，
					// $4 和 $5 分别捕获 $2 中的一部分
					pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace(3, 8) + ")*)|.*)\\)|)",

					// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
					// 匹配前后空格
					rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),

					// 匹配逗号
					// 这个后面用来清除 css 规则中组与组之间的逗号
					rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),

					// 选择器当中的关系连接符 [>+~ whitespace ]
					// $1: ([>+~]|whitespace)分别捕获4种连接符:'>','+','~','whitespace'
					// 第二个 whitespace 的作用是匹配空格，表示关系连接符 当中的后代关系（例如"div p"这里面的空格）
					rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),

					// 兄弟关系[+~]
					rsibling = new RegExp(whitespace + "*[+~]"),

					// rattributeQuotes = new RegExp("=[\\x20\\t\\r\\n\\f]*([^\\]'\"]*)[\\x20\\t\\r\\n\\f]*\\]","g")
					// 匹配属性等号 [type = xxx] =之后的 = xxx]
					rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*)" + whitespace + "*\\]", "g"),

					// 构造匹配伪类的正则表达式
					rpseudo = new RegExp(pseudos),

					// 构造匹配符合 css 命名规范的字符串正则表达式
					ridentifier = new RegExp("^" + identifier + "$"),

					// 存储了匹配各类选择器的数组
					// 这里是最后用来检测的正则表达式，
					// 使用形式通常是matchExpr[tokens[i].type].test(...)
					matchExpr = {
						"ID": new RegExp("^#(" + characterEncoding + ")"),
						"CLASS": new RegExp("^\\.(" + characterEncoding + ")"),
						"TAG": new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
						"ATTR": new RegExp("^" + attributes),
						"PSEUDO": new RegExp("^" + pseudos),
						"CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
							"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
							"*(\\d+)|))" + whitespace + "*\\)|)", "i"),
						"bool": new RegExp("^(?:" + booleans + ")$", "i"),
						// For use in libraries implementing .is()
						// We use this for POS matching in `select`
						"needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
							whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
					},

					// 检测浏览器是否支持诸如 document.getElementById 、document.getElementByClassName 等方法
					rnative = /^[^{]+\{\s*\[native \w/,

					// Easily-parseable/retrievable ID or TAG or CLASS selectors
					// 便捷的匹配 id tag 或者 class 选择器
					rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

					// 匹配input类型 ：
					// input select textarea button
					rinputs = /^(?:input|select|textarea|button)$/i,

					// 匹配 h1 ~ h6 标签
					rheader = /^h\d$/i,

					// 匹配 ' 和 \
					rescape = /'|\\/g,

					// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
					// runescape = /\\([\da-f]{1,6}[\x20\t\r\n\f]?|([\x20\t\r\n\f])|.)/gi
					// 正则匹配字符编码，类似 \0a0000 这样的编码
					runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),

					// jQuery还考虑了编码 http://zh.wikipedia.org/wiki/UTF-16
					// 转换为 UTF-16 编码，若某个字符是多种字符，超过 BMP 的计数范围 0xFFFF ,则必须将其编码成小于 0x10000 的形式。
					funescape = function(_, escaped, escapedWhitespace) {
						var high = "0x" + escaped - 0x10000;
						// NaN means non-codepoint
						// Support: Firefox
						// Workaround erroneous numeric interpretation of +"0x"
						// 这里的 high !== 用于判断 high是否是 NaN , NaN !== NaN
						// 当 high 为 NaN , escapedWhitespace 为 undefined 时，再判断 high 是否为负数
						return high !== high || escapedWhitespace ?
							escaped :
							// BMP codepoint
							high < 0 ?
							String.fromCharCode(high + 0x10000) :
							// Supplemental Plane codepoint (surrogate pair)
							String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
					};

				// Optimize for push.apply( _, NodeList )
				// 对 push.apply( _, NodeList ) 进行优化
				try {
					push.apply(
						(arr = slice.call(preferredDoc.childNodes)),
						preferredDoc.childNodes
					);
					// Support: Android<4.0
					// Detect silently failing push.apply
					arr[preferredDoc.childNodes.length].nodeType;
				} catch (e) {
					push = {
						apply: arr.length ?

							// Leverage slice if possible
							function(target, els) {
								push_native.apply(target, slice.call(els));
							} :

							// Support: IE<9
							// Otherwise append directly
							function(target, els) {
								var j = target.length,
									i = 0;
								// Can't trust NodeList.length
								while ((target[j++] = els[i++])) {}
								target.length = j - 1;
							}
					};
				}

				// Sizzle 引擎的入口函数
				// 选择器入口，jQuery 的构造函数要处理 6 大类情况
				// 但是只有在处理选择器表达式(selector expression)时才会调用 Sizzle 选择器引擎。
				// @param selector 已去掉头尾空白的选择器字符串
				// @param context 执行匹配的最初的上下文（即DOM元素集合）。若context没有赋值，则取document。
				// @param results 已匹配出的部分最终结果。若results没有赋值，则赋予空数组。
				// @param seed 初始集合
				function Sizzle(selector, context, results, seed) {
					var match, elem, m, nodeType,
						// QSA vars
						// QSA 表示 querySelectorAll ，高级浏览器支持 querySelectorAll 这个接口，Sizzle 的作用就是兼容不支持的低级浏览器
						i, groups, old, nid, newContext, newSelector;

					if ((context ? context.ownerDocument || context : preferredDoc) !== document) {
						// 根据不同的浏览器环境,设置合适的 Expr 方法,构造合适的 rbuggy 测试
						setDocument(context);
					}

					// 执行匹配的最初的上下文（即DOM元素集合）。若context没有赋值，则取document
					// 已匹配出的部分最终结果。若results没有赋值，则赋予空数组
					context = context || document;
					results = results || [];

					// 如果选择器字符串为空，返回 results
					// results 可能是已匹配出的部分最终结果，也可能是空数组
					if (!selector || typeof selector !== "string") {
						return results;
					}

					// nodeType 属性返回被选节点的节点类型
					// nodeType 各个数字所代表的含义 http://www.w3school.com.cn/xmldom/prop_element_nodetype.asp
					// 1 -- Element
					// 9 -- Document
					// 如果上下文传入错误，返回空数组
					if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
						return [];
					}

					// 不存在 seed 集合
					// seed - 种子合集（搜索器搜到符合条件的标签）
					if (documentIsHTML && !seed) {

						// Shortcuts
						// 快速匹配，如果是 id 、tag 或者 class 选择器
						// rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/
						if ((match = rquickExpr.exec(selector))) {
							// Speed-up: Sizzle("#ID")
							// selector会匹配 #[id] | [tag] | .[class] 其中之一
							// match[1] 的值是元素是与 rquickExpr 的第 1 个子表达式相匹配的文本，
							// 在这里 match[1] 就是匹配到的 id 选择器的名字（如果有）
							// 如果匹配到 id 选择器 #xx
							if ((m = match[1])) {
								// 9 -- Document
								// 如果上下文是 document
								if (nodeType === 9) {
									// 利用原生方法 document.getElementById 匹配到的 elem
									elem = context.getElementById(m);
									// Check parentNode to catch when Blackberry 4.6 returns
									// nodes that are no longer in the document #6963
									if (elem && elem.parentNode) {
										// Handle the case where IE, Opera, and Webkit return items
										// by name instead of ID
										if (elem.id === m) {
											results.push(elem);
											return results;
										}
									} else {
										// 返回结果
										return results;
									}
								} else {
									// Context is not a document
									// 上下文不是 document
									if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) &&
										contains(context, elem) && elem.id === m) {
										results.push(elem);
										return results;
									}
								}

								// Speed-up: Sizzle("TAG")
								// 在这里 match[2] 就是匹配到的 tag 选择器的名字（如果有）
								// 如果匹配到 tag 选择器 诸如div p 等
							} else if (match[2]) {
								// 利用原生方法 getElementsByTagName 找到元素
								push.apply(results, context.getElementsByTagName(selector));
								return results;

								// Speed-up: Sizzle(".CLASS")
								// 在这里 match[3] 就是匹配到的 class 选择器的名字（如果有）
								// 如果匹配到 class 选择器 .xxx
								// 并且
								// support.getElementsByClassName 为 true 表示浏览器支持 getElementsByClassName 这个方法
							} else if ((m = match[3]) && support.getElementsByClassName && context.getElementsByClassName) {
								push.apply(results, context.getElementsByClassName(m));
								return results;
							}
						}

						// QSA path
						// QSA 表示 querySelectorAll，原生的QSA运行速度非常快,因此尽可能使用 QSA 来对 CSS 选择器进行查询
						// querySelectorAll 是原生的选择器，但不支持老的浏览器版本, 主要是 IE8 及以前的浏览器
						// rbuggyQSA 保存了用于解决一些浏览器兼容问题的 bug 修补的正则表达式
						// QSA 在不同浏览器上运行的效果有差异，表现得非常奇怪，因此对某些 selector 不能用 QSA
						// 为了适应不同的浏览器，就需要首先进行浏览器兼容性测试，然后确定测试正则表达式,用 rbuggyQSA 来确定 selector 是否能用 QSA
						if (support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
							nid = old = expando;
							newContext = context;
							newSelector = nodeType === 9 && selector;

							// qSA works strangely on Element-rooted queries
							// We can work around this by specifying an extra ID on the root
							// and working up from there (Thanks to Andrew Dupont for the technique)
							// IE 8 doesn't work on object elements
							// QSA 在以某个根节点ID为基础的查找中(.rootClass span)表现很奇怪，
							// 它会忽略某些selector选项，返回不合适的结果
							// 一个比较通常的解决方法是为根节点设置一个额外的id，并以此开始查询
							if (nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
								// 调用词法分析器分析选择器，得到一个 Token 序列
								groups = tokenize(selector);

								// 保存并设置新id
								if ((old = context.getAttribute("id"))) {
									nid = old.replace(rescape, "\\$&");
								} else {
									context.setAttribute("id", nid);
								}
								nid = "[id='" + nid + "'] ";

								// 把新的id添加到 Token 序列里
								i = groups.length;

								while (i--) {
									groups[i] = nid + toSelector(groups[i]);
								}
								// 构造新的上下文
								newContext = rsibling.test(selector) && context.parentNode || context;
								// 构造新的选择器
								newSelector = groups.join(",");
							}

							// 使用新的选择器通过QSA来查询元素
							if (newSelector) {
								try {
									// 将查询结果合并到results上
									push.apply(results,
										newContext.querySelectorAll(newSelector)
									);
									return results;
								} catch (qsaError) {} finally {
									// 如果没有旧 id ,则移除
									if (!old) {
										context.removeAttribute("id");
									}
								}
							}
						}
					}

					// All others
					// 到这里仍没有返回结果，表明这些 selector 无法直接使用原生的 document 查询方法（当前浏览器不支持 QSA）
					// 调用 select 方法
					return select(selector.replace(rtrim, "$1"), context, results, seed);
				}

				/**
				 * Create key-value caches of limited size
				 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
				 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
				 *	deleting the oldest entry
				 */
				// 创建一个 key-value 格式的缓存
				function createCache() {
					// 用来保存已经存储过的 key-value，这是一种闭包
					var keys = [];

					// 这里使用cache这个函数本身来当作存放数据的对象
					function cache(key, value) {
						// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
						// key 后面加空格是为了避免覆盖原生属性
						// 当缓存栈超过长度限制时，则需要删除以前的缓存（后进先出，从栈底删除）
						if (keys.push(key += " ") > Expr.cacheLength) {
							// Only keep the most recent entries
							delete cache[keys.shift()];
						}
						// 返回存储好的信息
						return (cache[key] = value);
					}
					return cache;
				}

				/**
				 * Mark a function for special use by Sizzle
				 * @param {Function} fn The function to mark
				 */
				// 标记函数
				function markFunction(fn) {
					fn[expando] = true;
					return fn;
				}

				/**
				 * Support testing using an element
				 * @param {Function} fn Passed the created div and expects a boolean result
				 */
				// 使用 assert(function(div){}) 函数进程浏览器 bug 测试
				// assert 函数建立一个 div 节点，将这个 div 节点传递给回调函数
				// div 节点在 assert 函数结束时会被删除，此时注意要删除由回调函数创建的子节点，并将 div 赋值 null 以让 GC 回收。
				function assert(fn) {
					// 创建测试用节点
					var div = document.createElement("div");

					try {
						// 转换fn的返回值为boolean值
						// fn(div) -- assert(function(div){}) 这里的 div 就是上面创建的测试节点
						return !!fn(div);
					} catch (e) {
						return false;
						// 结束时移除这个节点
					} finally {
						// Remove from its parent by default
						if (div.parentNode) {
							div.parentNode.removeChild(div);
						}
						// release memory in IE
						// 在 IE 里释放内存
						div = null;
					}
				}

				/**
				 * Adds the same handler for all of the specified attrs
				 * @param {String} attrs Pipe-separated list of attributes
				 * @param {Function} handler The method that will be applied
				 */
				//
				function addHandle(attrs, handler) {
					var arr = attrs.split("|"),
						i = attrs.length;

					while (i--) {
						Expr.attrHandle[arr[i]] = handler;
					}
				}

				/**
				 * Checks document order of two siblings
				 * @param {Element} a
				 * @param {Element} b
				 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
				 */
				function siblingCheck(a, b) {
					var cur = b && a,
						diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
						(~b.sourceIndex || MAX_NEGATIVE) -
						(~a.sourceIndex || MAX_NEGATIVE);

					// Use IE sourceIndex if available on both nodes
					if (diff) {
						return diff;
					}

					// Check if b follows a
					if (cur) {
						while ((cur = cur.nextSibling)) {
							if (cur === b) {
								return -1;
							}
						}
					}

					return a ? 1 : -1;
				}

				/**
				 * Returns a function to use in pseudos for input types
				 * @param {String} type
				 */
				function createInputPseudo(type) {
					return function(elem) {
						var name = elem.nodeName.toLowerCase();
						return name === "input" && elem.type === type;
					};
				}

				/**
				 * Returns a function to use in pseudos for buttons
				 * @param {String} type
				 */
				function createButtonPseudo(type) {
					return function(elem) {
						var name = elem.nodeName.toLowerCase();
						return (name === "input" || name === "button") && elem.type === type;
					};
				}

				/**
				 * Returns a function to use in pseudos for positionals
				 * @param {Function} fn
				 */
				function createPositionalPseudo(fn) {
					return markFunction(function(argument) {
						argument = +argument;
						return markFunction(function(seed, matches) {
							var j,
								matchIndexes = fn([], seed.length, argument),
								i = matchIndexes.length;

							// Match elements found at the specified indexes
							while (i--) {
								if (seed[(j = matchIndexes[i])]) {
									seed[j] = !(matches[j] = seed[j]);
								}
							}
						});
					});
				}

				/**
				 * Detect xml
				 * @param {Element|Object} elem An element or a document
				 */
				isXML = Sizzle.isXML = function(elem) {
					// documentElement is verified for cases where it doesn't yet exist
					// (such as loading iframes in IE - #4833)
					var documentElement = elem && (elem.ownerDocument || elem).documentElement;
					return documentElement ? documentElement.nodeName !== "HTML" : false;
				};

				// Expose support vars for convenience
				// 暴露 support 变量
				support = Sizzle.support = {};

				/**
				 * Sets document-related variables once based on the current document
				 * @param {Element|Object} [doc] An element or document object to use to set the document
				 * @returns {Object} Returns the current document
				 */

				setDocument = Sizzle.setDocument = function(node) {
					var doc = node ? node.ownerDocument || node : preferredDoc,
						parent = doc.defaultView;

					// If no document and documentElement is available, return
					if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
						return document;
					}

					// Set our document
					document = doc;
					docElem = doc.documentElement;

					// Support tests
					documentIsHTML = !isXML(doc);

					// Support: IE>8
					// If iframe document is assigned to "document" variable and if iframe has been reloaded,
					// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
					// IE6-8 do not support the defaultView property so parent will be undefined
					if (parent && parent.attachEvent && parent !== parent.top) {
						parent.attachEvent("onbeforeunload", function() {
							setDocument();
						});
					}

					/* Attributes
					---------------------------------------------------------------------- */

					// Support: IE<8
					// Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
					support.attributes = assert(function(div) {
						div.className = "i";
						return !div.getAttribute("className");
					});

					/* getElement(s)By*
					---------------------------------------------------------------------- */

					// Check if getElementsByTagName("*") returns only elements
					// 检查 getElementsByTagName 浏览器是否支持
					support.getElementsByTagName = assert(function(div) {
						div.appendChild(doc.createComment(""));
						return !div.getElementsByTagName("*").length;
					});

					// Check if getElementsByClassName can be trusted
					support.getElementsByClassName = assert(function(div) {
						div.innerHTML = "<div class='a'></div><div class='a i'></div>";

						// Support: Safari<4
						// Catch class over-caching
						div.firstChild.className = "i";
						// Support: Opera<10
						// Catch gEBCN failure to find non-leading classes
						return div.getElementsByClassName("i").length === 2;
					});

					// Support: IE<10
					// Check if getElementById returns elements by name
					// The broken getElementById methods don't pick up programatically-set names,
					// so use a roundabout getElementsByName test
					// 兼容 IE10 以下
					// 检查是否 getElementById
					// getElemenById 方法不收集程序设置的 name 属性，所以迂回的使用 getElementsByName 测试
					support.getById = assert(function(div) {
						docElem.appendChild(div).id = expando;
						return !doc.getElementsByName || !doc.getElementsByName(expando).length;
					});

					// ID find and filter
					// 定义 id 选择器的实现方法 Expr.find["ID"] 以及过滤方法 Expr.filter["ID"]
					if (support.getById) {
						Expr.find["ID"] = function(id, context) {
							if (typeof context.getElementById !== strundefined && documentIsHTML) {
								var m = context.getElementById(id);
								// Check parentNode to catch when Blackberry 4.6 returns
								// nodes that are no longer in the document #6963
								return m && m.parentNode ? [m] : [];
							}
						};
						// ID元匹配器工厂
						Expr.filter["ID"] = function(id) {
							var attrId = id.replace(runescape, funescape);
							// 生成一个匹配器
							return function(elem) {
								return elem.getAttribute("id") === attrId;
							};
						};
					} else {
						// Support: IE6/7
						// getElementById is not reliable as a find shortcut
						// 兼容ie6 7
						delete Expr.find["ID"];
						Expr.filter["ID"] = function(id) {
							var attrId = id.replace(runescape, funescape);
							// 生成一个匹配器
							return function(elem) {
								var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
								return node && node.value === attrId;
							};
						};
					}

					// Tag
					// 定义 Tag 选择器的实现方法
					Expr.find["TAG"] = support.getElementsByTagName ?
						function(tag, context) {
							if (typeof context.getElementsByTagName !== strundefined) {
								return context.getElementsByTagName(tag);
							}
						} :
						function(tag, context) {
							var elem,
								tmp = [],
								i = 0,
								results = context.getElementsByTagName(tag);

							// Filter out possible comments
							if (tag === "*") {
								while ((elem = results[i++])) {
									if (elem.nodeType === 1) {
										tmp.push(elem);
									}
								}

								return tmp;
							}
							return results;
						};

					// Class
					// 定义 Class 选择器的实现方法
					Expr.find["CLASS"] = support.getElementsByClassName && function(className, context) {
						if (typeof context.getElementsByClassName !== strundefined && documentIsHTML) {
							return context.getElementsByClassName(className);
						}
					};

					/* QSA/matchesSelector
						 QSA -- querySelectorAll
					---------------------------------------------------------------------- */

					// QSA and matchesSelector support

					// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
					rbuggyMatches = [];

					// qSa(:focus) reports false when true (Chrome 21)
					// We allow this because of a bug in IE8/9 that throws an error
					// whenever `document.activeElement` is accessed on an iframe
					// So, we allow :focus to pass through QSA all the time to avoid the IE error
					// See http://bugs.jquery.com/ticket/13378
					rbuggyQSA = [];

					// 如果 rnative.test(doc.querySelectorAll) 为 true
					// 即是 浏览器支持 querySelectorAll
					// rbuggyQSA -- 保存了用于解决一些浏览器兼容问题的 bug 修补的正则表达式
					if ((support.qsa = rnative.test(doc.querySelectorAll))) {
						// Build QSA regex
						// Regex strategy adopted from Diego Perini
						// 一个利用 assert 函数的 bug 测试例子
						assert(function(div) {
							// Select is set to empty string on purpose
							// This is to test IE's treatment of not explicitly
							// setting a boolean content attribute,
							// since its presence should be enough
							// http://bugs.jquery.com/ticket/12359
							// 创建一些子节点
							div.innerHTML = "<select><option selected=''></option></select>";

							// Support: IE8
							// Boolean attributes and "value" are not treated correctly
							// 测试 document.querySelectorAll() 的正确性
							if (!div.querySelectorAll("[selected]").length) {
								rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
							}

							// Webkit/Opera - :checked should return selected option elements
							// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
							// IE8 throws error here and will not see later tests
							if (!div.querySelectorAll(":checked").length) {
								rbuggyQSA.push(":checked");
							}
						});

						//
						assert(function(div) {

							// Support: Opera 10-12/IE8
							// ^= $= *= and empty values
							// Should not select anything
							// Support: Windows 8 Native Apps
							// The type attribute is restricted during .innerHTML assignment
							var input = doc.createElement("input");
							input.setAttribute("type", "hidden");
							div.appendChild(input).setAttribute("t", "");

							if (div.querySelectorAll("[t^='']").length) {
								rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
							}

							// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
							// IE8 throws error here and will not see later tests
							if (!div.querySelectorAll(":enabled").length) {
								rbuggyQSA.push(":enabled", ":disabled");
							}

							// Opera 10-11 does not throw on post-comma invalid pseudos
							div.querySelectorAll("*,:x");
							rbuggyQSA.push(",.*:");
						});
					}

					if ((support.matchesSelector = rnative.test((matches = docElem.webkitMatchesSelector ||
							docElem.mozMatchesSelector ||
							docElem.oMatchesSelector ||
							docElem.msMatchesSelector)))) {

						assert(function(div) {
							// Check to see if it's possible to do matchesSelector
							// on a disconnected node (IE 9)
							support.disconnectedMatch = matches.call(div, "div");

							// This should fail with an exception
							// Gecko does not error, returns false instead
							matches.call(div, "[s!='']:x");
							rbuggyMatches.push("!=", pseudos);
						});
					}

					rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
					rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));

					/* Contains
					---------------------------------------------------------------------- */

					// Element contains another
					// Purposefully does not implement inclusive descendent
					// As in, an element does not contain itself
					contains = rnative.test(docElem.contains) || docElem.compareDocumentPosition ?
						function(a, b) {
							var adown = a.nodeType === 9 ? a.documentElement : a,
								bup = b && b.parentNode;
							return a === bup || !!(bup && bup.nodeType === 1 && (
								adown.contains ?
								adown.contains(bup) :
								a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16
							));
						} :
						function(a, b) {
							if (b) {
								while ((b = b.parentNode)) {
									if (b === a) {
										return true;
									}
								}
							}
							return false;
						};

					/* Sorting
					---------------------------------------------------------------------- */

					// Document order sorting
					sortOrder = docElem.compareDocumentPosition ?
						function(a, b) {

							// Flag for duplicate removal
							if (a === b) {
								hasDuplicate = true;
								return 0;
							}

							var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition(b);

							if (compare) {
								// Disconnected nodes
								if (compare & 1 ||
									(!support.sortDetached && b.compareDocumentPosition(a) === compare)) {

									// Choose the first element that is related to our preferred document
									if (a === doc || contains(preferredDoc, a)) {
										return -1;
									}
									if (b === doc || contains(preferredDoc, b)) {
										return 1;
									}

									// Maintain original order
									return sortInput ?
										(indexOf.call(sortInput, a) - indexOf.call(sortInput, b)) :
										0;
								}

								return compare & 4 ? -1 : 1;
							}

							// Not directly comparable, sort on existence of method
							return a.compareDocumentPosition ? -1 : 1;
						} :
						function(a, b) {
							var cur,
								i = 0,
								aup = a.parentNode,
								bup = b.parentNode,
								ap = [a],
								bp = [b];

							// Exit early if the nodes are identical
							if (a === b) {
								hasDuplicate = true;
								return 0;

								// Parentless nodes are either documents or disconnected
							} else if (!aup || !bup) {
								return a === doc ? -1 :
									b === doc ? 1 :
									aup ? -1 :
									bup ? 1 :
									sortInput ?
									(indexOf.call(sortInput, a) - indexOf.call(sortInput, b)) :
									0;

								// If the nodes are siblings, we can do a quick check
							} else if (aup === bup) {
								return siblingCheck(a, b);
							}

							// Otherwise we need full lists of their ancestors for comparison
							cur = a;
							while ((cur = cur.parentNode)) {
								ap.unshift(cur);
							}
							cur = b;
							while ((cur = cur.parentNode)) {
								bp.unshift(cur);
							}

							// Walk down the tree looking for a discrepancy
							while (ap[i] === bp[i]) {
								i++;
							}

							return i ?
								// Do a sibling check if the nodes have a common ancestor
								siblingCheck(ap[i], bp[i]) :

								// Otherwise nodes in our document sort first
								ap[i] === preferredDoc ? -1 :
								bp[i] === preferredDoc ? 1 :
								0;
						};

					return doc;
				};

				Sizzle.matches = function(expr, elements) {
					return Sizzle(expr, null, null, elements);
				};

				Sizzle.matchesSelector = function(elem, expr) {
					// Set document vars if needed
					if ((elem.ownerDocument || elem) !== document) {
						setDocument(elem);
					}

					// Make sure that attribute selectors are quoted
					expr = expr.replace(rattributeQuotes, "='$1']");

					if (support.matchesSelector && documentIsHTML &&
						(!rbuggyMatches || !rbuggyMatches.test(expr)) &&
						(!rbuggyQSA || !rbuggyQSA.test(expr))) {

						try {
							var ret = matches.call(elem, expr);

							// IE 9's matchesSelector returns false on disconnected nodes
							if (ret || support.disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9
								elem.document && elem.document.nodeType !== 11) {
								return ret;
							}
						} catch (e) {}
					}

					return Sizzle(expr, document, null, [elem]).length > 0;
				};

				Sizzle.contains = function(context, elem) {
					// Set document vars if needed
					if ((context.ownerDocument || context) !== document) {
						setDocument(context);
					}
					return contains(context, elem);
				};

				Sizzle.attr = function(elem, name) {
					// Set document vars if needed
					if ((elem.ownerDocument || elem) !== document) {
						setDocument(elem);
					}

					var fn = Expr.attrHandle[name.toLowerCase()],
						// Don't get fooled by Object.prototype properties (jQuery #13807)
						val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ?
						fn(elem, name, !documentIsHTML) :
						undefined;

					return val === undefined ?
						support.attributes || !documentIsHTML ?
						elem.getAttribute(name) :
						(val = elem.getAttributeNode(name)) && val.specified ?
						val.value :
						null :
						val;
				};

				// 抛出异常
				Sizzle.error = function(msg) {
					throw new Error("Syntax error, unrecognized expression: " + msg);
				};

				/**
				 * Document sorting and removing duplicates
				 * @param {ArrayLike} results
				 */
				Sizzle.uniqueSort = function(results) {
					var elem,
						duplicates = [],
						j = 0,
						i = 0;

					// Unless we *know* we can detect duplicates, assume their presence
					hasDuplicate = !support.detectDuplicates;
					sortInput = !support.sortStable && results.slice(0);
					results.sort(sortOrder);

					if (hasDuplicate) {
						while ((elem = results[i++])) {
							if (elem === results[i]) {
								j = duplicates.push(i);
							}
						}
						while (j--) {
							results.splice(duplicates[j], 1);
						}
					}

					return results;
				};

				/**
				 * Utility function for retrieving the text value of an array of DOM nodes
				 * @param {Array|Element} elem
				 */
				getText = Sizzle.getText = function(elem) {
					var node,
						ret = "",
						i = 0,
						nodeType = elem.nodeType;

					if (!nodeType) {
						// If no nodeType, this is expected to be an array
						for (;
							(node = elem[i]); i++) {
							// Do not traverse comment nodes
							ret += getText(node);
						}
					} else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
						// Use textContent for elements
						// innerText usage removed for consistency of new lines (see #11153)
						if (typeof elem.textContent === "string") {
							return elem.textContent;
						} else {
							// Traverse its children
							for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
								ret += getText(elem);
							}
						}
					} else if (nodeType === 3 || nodeType === 4) {
						return elem.nodeValue;
					}
					// Do not include comment or processing instruction nodes

					return ret;
				};

				// 记录跟选择器相关的属性以及操作
				Expr = Sizzle.selectors = {

					// Can be adjusted by the user
					cacheLength: 50,

					createPseudo: markFunction,

					match: matchExpr,

					attrHandle: {},

					find: {},

					// relative 用来表示节点间的关系，一个节点跟另一个节点有以下几种关系
					// 父亲和儿子，用 > 表达
					// 祖宗和后代 ，用 （空格） 表达
					// 临近兄弟，用 + 表达
					// 普通兄弟，用 ~ 表达
					// first属性，用来标识两个节点的“紧密”程度,例如父子关系和临近兄弟关系就是紧密的
					relative: {
						">": {
							dir: "parentNode",
							first: true
						},
						" ": {
							dir: "parentNode"
						},
						"+": {
							dir: "previousSibling",
							first: true
						},
						"~": {
							dir: "previousSibling"
						}
					},

					// 预处理
					preFilter: {
						"ATTR": function(match) {
							match[1] = match[1].replace(runescape, funescape);

							// Move the given value to match[3] whether quoted or unquoted
							match[3] = (match[4] || match[5] || "").replace(runescape, funescape);

							if (match[2] === "~=") {
								match[3] = " " + match[3] + " ";
							}

							return match.slice(0, 4);
						},

						"CHILD": function(match) {
							/* matches from matchExpr["CHILD"]
								1 type (only|nth|...)
								2 what (child|of-type)
								3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
								4 xn-component of xn+y argument ([+-]?\d*n|)
								5 sign of xn-component
								6 x of xn-component
								7 sign of y-component
								8 y of y-component
							*/
							match[1] = match[1].toLowerCase();

							if (match[1].slice(0, 3) === "nth") {
								// nth-* requires argument
								if (!match[3]) {
									Sizzle.error(match[0]);
								}

								// numeric x and y parameters for Expr.filter.CHILD
								// remember that false/true cast respectively to 0/1
								match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
								match[5] = +((match[7] + match[8]) || match[3] === "odd");

								// other types prohibit arguments
							} else if (match[3]) {
								Sizzle.error(match[0]);
							}

							return match;
						},

						"PSEUDO": function(match) {
							var excess,
								unquoted = !match[5] && match[2];

							if (matchExpr["CHILD"].test(match[0])) {
								return null;
							}

							// Accept quoted arguments as-is
							if (match[3] && match[4] !== undefined) {
								match[2] = match[4];

								// Strip excess characters from unquoted arguments
							} else if (unquoted && rpseudo.test(unquoted) &&
								// Get excess from tokenize (recursively)
								(excess = tokenize(unquoted, true)) &&
								// advance to the next closing parenthesis
								(excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {

								// excess is a negative index
								match[0] = match[0].slice(0, excess);
								match[2] = unquoted.slice(0, excess);
							}

							// Return only captures needed by the pseudo filter method (type and argument)
							return match.slice(0, 3);
						}
					},

					// 过滤器
					filter: {
						// TAG 过滤
						"TAG": function(nodeNameSelector) {
							var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
							return nodeNameSelector === "*" ?
								function() {
									return true;
								} :
								function(elem) {
									return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
								};
						},

						// CLASS 过滤
						"CLASS": function(className) {
							var pattern = classCache[className + " "];

							return pattern ||
								(pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) &&
								classCache(className, function(elem) {
									return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "");
								});
						},

						// 属性过滤
						"ATTR": function(name, operator, check) {
							return function(elem) {
								var result = Sizzle.attr(elem, name);

								if (result == null) {
									return operator === "!=";
								}
								if (!operator) {
									return true;
								}

								result += "";

								return operator === "=" ? result === check :
									operator === "!=" ? result !== check :
									operator === "^=" ? check && result.indexOf(check) === 0 :
									operator === "*=" ? check && result.indexOf(check) > -1 :
									operator === "$=" ? check && result.slice(-check.length) === check :
									operator === "~=" ? (" " + result + " ").indexOf(check) > -1 :
									operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" :
									false;
							};
						},

						//
						"CHILD": function(type, what, argument, first, last) {
							var simple = type.slice(0, 3) !== "nth",
								forward = type.slice(-4) !== "last",
								ofType = what === "of-type";

							return first === 1 && last === 0 ?

								// Shortcut for :nth-*(n)
								function(elem) {
									return !!elem.parentNode;
								} :

								function(elem, context, xml) {
									var cache, outerCache, node, diff, nodeIndex, start,
										dir = simple !== forward ? "nextSibling" : "previousSibling",
										parent = elem.parentNode,
										name = ofType && elem.nodeName.toLowerCase(),
										useCache = !xml && !ofType;

									if (parent) {

										// :(first|last|only)-(child|of-type)
										if (simple) {
											while (dir) {
												node = elem;
												while ((node = node[dir])) {
													if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
														return false;
													}
												}
												// Reverse direction for :only-* (if we haven't yet done so)
												start = dir = type === "only" && !start && "nextSibling";
											}
											return true;
										}

										start = [forward ? parent.firstChild : parent.lastChild];

										// non-xml :nth-child(...) stores cache data on `parent`
										if (forward && useCache) {
											// Seek `elem` from a previously-cached index
											outerCache = parent[expando] || (parent[expando] = {});
											cache = outerCache[type] || [];
											nodeIndex = cache[0] === dirruns && cache[1];
											diff = cache[0] === dirruns && cache[2];
											node = nodeIndex && parent.childNodes[nodeIndex];

											while ((node = ++nodeIndex && node && node[dir] ||

													// Fallback to seeking `elem` from the start
													(diff = nodeIndex = 0) || start.pop())) {

												// When found, cache indexes on `parent` and break
												if (node.nodeType === 1 && ++diff && node === elem) {
													outerCache[type] = [dirruns, nodeIndex, diff];
													break;
												}
											}

											// Use previously-cached element index if available
										} else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns) {
											diff = cache[1];

											// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
										} else {
											// Use the same loop as above to seek `elem` from the start
											while ((node = ++nodeIndex && node && node[dir] ||
													(diff = nodeIndex = 0) || start.pop())) {

												if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
													// Cache the index of each encountered element
													if (useCache) {
														(node[expando] || (node[expando] = {}))[type] = [dirruns, diff];
													}

													if (node === elem) {
														break;
													}
												}
											}
										}

										// Incorporate the offset, then check against cycle size
										diff -= last;
										return diff === first || (diff % first === 0 && diff / first >= 0);
									}
								};
						},

						"PSEUDO": function(pseudo, argument) {
							// pseudo-class names are case-insensitive
							// http://www.w3.org/TR/selectors/#pseudo-classes
							// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
							// Remember that setFilters inherits from pseudos
							var args,
								fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] ||
								Sizzle.error("unsupported pseudo: " + pseudo);

							// The user may use createPseudo to indicate that
							// arguments are needed to create the filter function
							// just as Sizzle does
							if (fn[expando]) {
								return fn(argument);
							}

							// But maintain support for old signatures
							if (fn.length > 1) {
								args = [pseudo, pseudo, "", argument];
								return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ?
									markFunction(function(seed, matches) {
										var idx,
											matched = fn(seed, argument),
											i = matched.length;
										while (i--) {
											idx = indexOf.call(seed, matched[i]);
											seed[idx] = !(matches[idx] = matched[i]);
										}
									}) :
									function(elem) {
										return fn(elem, 0, args);
									};
							}

							return fn;
						}
					},

					pseudos: {
						// Potentially complex pseudos
						"not": markFunction(function(selector) {
							// Trim the selector passed to compile
							// to avoid treating leading and trailing
							// spaces as combinators
							var input = [],
								results = [],
								matcher = compile(selector.replace(rtrim, "$1"));

							return matcher[expando] ?
								markFunction(function(seed, matches, context, xml) {
									var elem,
										unmatched = matcher(seed, null, xml, []),
										i = seed.length;

									// Match elements unmatched by `matcher`
									while (i--) {
										if ((elem = unmatched[i])) {
											seed[i] = !(matches[i] = elem);
										}
									}
								}) :
								function(elem, context, xml) {
									input[0] = elem;
									matcher(input, null, xml, results);
									return !results.pop();
								};
						}),

						"has": markFunction(function(selector) {
							return function(elem) {
								return Sizzle(selector, elem).length > 0;
							};
						}),

						"contains": markFunction(function(text) {
							return function(elem) {
								return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
							};
						}),

						// "Whether an element is represented by a :lang() selector
						// is based solely on the element's language value
						// being equal to the identifier C,
						// or beginning with the identifier C immediately followed by "-".
						// The matching of C against the element's language value is performed case-insensitively.
						// The identifier C does not have to be a valid language name."
						// http://www.w3.org/TR/selectors/#lang-pseudo
						"lang": markFunction(function(lang) {
							// lang value must be a valid identifier
							if (!ridentifier.test(lang || "")) {
								Sizzle.error("unsupported lang: " + lang);
							}
							lang = lang.replace(runescape, funescape).toLowerCase();
							return function(elem) {
								var elemLang;
								do {
									if ((elemLang = documentIsHTML ?
											elem.lang :
											elem.getAttribute("xml:lang") || elem.getAttribute("lang"))) {

										elemLang = elemLang.toLowerCase();
										return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
									}
								} while ((elem = elem.parentNode) && elem.nodeType === 1);
								return false;
							};
						}),

						// Miscellaneous
						"target": function(elem) {
							var hash = window.location && window.location.hash;
							return hash && hash.slice(1) === elem.id;
						},

						"root": function(elem) {
							return elem === docElem;
						},

						"focus": function(elem) {
							return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
						},

						// Boolean properties
						"enabled": function(elem) {
							return elem.disabled === false;
						},

						"disabled": function(elem) {
							return elem.disabled === true;
						},

						"checked": function(elem) {
							// In CSS3, :checked should return both checked and selected elements
							// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
							var nodeName = elem.nodeName.toLowerCase();
							return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
						},

						"selected": function(elem) {
							// Accessing this property makes selected-by-default
							// options in Safari work properly
							if (elem.parentNode) {
								elem.parentNode.selectedIndex;
							}

							return elem.selected === true;
						},

						// Contents
						"empty": function(elem) {
							// http://www.w3.org/TR/selectors/#empty-pseudo
							// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
							//   not comment, processing instructions, or others
							// Thanks to Diego Perini for the nodeName shortcut
							//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
							for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
								if (elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4) {
									return false;
								}
							}
							return true;
						},

						"parent": function(elem) {
							return !Expr.pseudos["empty"](elem);
						},

						// Element/input types
						"header": function(elem) {
							return rheader.test(elem.nodeName);
						},

						"input": function(elem) {
							return rinputs.test(elem.nodeName);
						},

						"button": function(elem) {
							var name = elem.nodeName.toLowerCase();
							return name === "input" && elem.type === "button" || name === "button";
						},

						"text": function(elem) {
							var attr;
							// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
							// use getAttribute instead to test this case
							return elem.nodeName.toLowerCase() === "input" &&
								elem.type === "text" &&
								((attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type);
						},

						// Position-in-collection
						"first": createPositionalPseudo(function() {
							return [0];
						}),

						"last": createPositionalPseudo(function(matchIndexes, length) {
							return [length - 1];
						}),

						"eq": createPositionalPseudo(function(matchIndexes, length, argument) {
							return [argument < 0 ? argument + length : argument];
						}),

						"even": createPositionalPseudo(function(matchIndexes, length) {
							var i = 0;
							for (; i < length; i += 2) {
								matchIndexes.push(i);
							}
							return matchIndexes;
						}),

						"odd": createPositionalPseudo(function(matchIndexes, length) {
							var i = 1;
							for (; i < length; i += 2) {
								matchIndexes.push(i);
							}
							return matchIndexes;
						}),

						"lt": createPositionalPseudo(function(matchIndexes, length, argument) {
							var i = argument < 0 ? argument + length : argument;
							for (; --i >= 0;) {
								matchIndexes.push(i);
							}
							return matchIndexes;
						}),

						"gt": createPositionalPseudo(function(matchIndexes, length, argument) {
							var i = argument < 0 ? argument + length : argument;
							for (; ++i < length;) {
								matchIndexes.push(i);
							}
							return matchIndexes;
						})
					}
				};

				Expr.pseudos["nth"] = Expr.pseudos["eq"];

				// Add button/input type pseudos
				for (i in {
						radio: true,
						checkbox: true,
						file: true,
						password: true,
						image: true
					}) {
					Expr.pseudos[i] = createInputPseudo(i);
				}
				for (i in {
						submit: true,
						reset: true
					}) {
					Expr.pseudos[i] = createButtonPseudo(i);
				}

				// Easy API for creating new setFilters
				function setFilters() {}
				setFilters.prototype = Expr.filters = Expr.pseudos;
				Expr.setFilters = new setFilters();

				// 词法分析，返回的是一个Token序列(根据是否是并联选择器，可能返回的是多组Token序列)
				// Sizzle的 Token 格式如下 ：{value:'匹配到的字符串', type:'对应的Token类型', matches:'正则匹配到的一个结构'}
				// 假设传入进来的选择器是：div > p + .clr[type="checkbox"], #id:first-child
				function tokenize(selector, parseOnly) {
					// soFar 是表示目前还未分析的字符串剩余部分
					// groups 表示目前已经匹配到的规则组，
					// 在这个例子里边，groups的长度最后是2（传进来的选择器以逗号,分隔）
					// 存放的是每个规则对应的Token序列
					var matched, match, tokens, type,
						soFar, groups, preFilters,
						cached = tokenCache[selector + " "];

					// 如果cache里边有，直接拿出来即可
					if (cached) {
						return parseOnly ? 0 : cached.slice(0);
					}

					// 初始化
					soFar = selector;
					groups = [];
					// 这里的预处理器为了对匹配到的 Token 适当做一些调整
					// 其实就是正则匹配到的内容的一个预处理
					preFilters = Expr.preFilter;

					// 当字符串还没解析完毕，循环开始
					while (soFar) {

						// Comma and first run
						// 如果匹配到逗号，用逗号,分组
						// whitespace = "[\\x20\\t\\r\\n\\f]",
						// rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*")
						if (!matched || (match = rcomma.exec(soFar))) {
							if (match) {
								// Don't consume trailing commas as valid
								soFar = soFar.slice(match[0].length) || soFar;
							}
							// 往规则组里边压入一个Token序列，目前Token序列还是空的
							groups.push(tokens = []);
						}

						matched = false;

						// Combinators
						// 先处理这几个特殊的Token ： >, +, 空格, ~
						// 因为他们比较简单，并且是单字符的
						// rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),
						if ((match = rcombinators.exec(soFar))) {
							// 获取到匹配的字符
							matched = match.shift();

							// 放入Token序列中
							tokens.push({
								value: matched,
								// Cast descendant combinators to space
								// rtrim 匹配头尾空格，这里是去掉头尾的空格
								type: match[0].replace(rtrim, " ")
							});
							// 剩余还未分析的字符串需要减去这段已经分析过的
							soFar = soFar.slice(matched.length);
						}

						// Filters
						// 这里开始分析这几种Token ： TAG, ID, CLASS, ATTR, CHILD, PSEUDO, NAME
						// Expr.filter里边对应地 就有这些key
						for (type in Expr.filter) {
							// 如果通过正则匹配到了 Token 格式：match = matchExpr[ type ].exec( soFar )
							// 然后看看需不需要预处理：!preFilters[ type ]
							// 如果需要 ，那么通过预处理器将匹配到的处理一下 ： match = preFilters[ type ]( match )
							if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] ||
									(match = preFilters[type](match)))) {
								matched = match.shift();
								// 放入Token序列中
								tokens.push({
									value: matched,
									type: type,
									matches: match
								});
								// 剩余还未分析的字符串需要减去这段已经分析过的
								soFar = soFar.slice(matched.length);
							}
						}

						// 如果到了这里都还没matched到，那么说明这个选择器在这里有错误
						// 直接中断词法分析过程
						// 这就是Sizzle对词法分析的异常处理
						if (!matched) {
							break;
						}
					}

					// Return the length of the invalid excess
					// if we're just parsing
					// Otherwise, throw an error or return tokens
					// 如果只需要这个接口检查选择器的合法性，直接就返回 soFar 的剩余长度，倘若是大于零，说明选择器不合法
					// 其余情况，如果 soFar 长度大于零，抛出异常；否则把 groups 记录在 cache 里边并返回，
					return parseOnly ?
						soFar.length :
						soFar ?
						Sizzle.error(selector) :
						// Cache the tokens
						tokenCache(selector, groups).slice(0);
				}

				function toSelector(tokens) {
					var i = 0,
						len = tokens.length,
						selector = "";
					for (; i < len; i++) {
						selector += tokens[i].value;
					}
					return selector;
				}

				//
				function addCombinator(matcher, combinator, base) {
					var dir = combinator.dir,
						checkNonElements = base && dir === "parentNode",
						doneName = done++;

					return combinator.first ?
						// Check against closest ancestor/preceding element
						function(elem, context, xml) {
							while ((elem = elem[dir])) {
								if (elem.nodeType === 1 || checkNonElements) {
									return matcher(elem, context, xml);
								}
							}
						} :

						// Check against all ancestor/preceding elements
						function(elem, context, xml) {
							var data, cache, outerCache,
								dirkey = dirruns + " " + doneName;

							// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
							if (xml) {
								while ((elem = elem[dir])) {
									if (elem.nodeType === 1 || checkNonElements) {
										if (matcher(elem, context, xml)) {
											return true;
										}
									}
								}
							} else {
								while ((elem = elem[dir])) {
									if (elem.nodeType === 1 || checkNonElements) {
										outerCache = elem[expando] || (elem[expando] = {});
										if ((cache = outerCache[dir]) && cache[0] === dirkey) {
											if ((data = cache[1]) === true || data === cachedruns) {
												return data === true;
											}
										} else {
											cache = outerCache[dir] = [dirkey];
											cache[1] = matcher(elem, context, xml) || cachedruns;
											if (cache[1] === true) {
												return true;
											}
										}
									}
								}
							}
						};
				}

				function elementMatcher(matchers) {
					return matchers.length > 1 ?
						function(elem, context, xml) {
							var i = matchers.length;
							while (i--) {
								if (!matchers[i](elem, context, xml)) {
									return false;
								}
							}
							return true;
						} :
						matchers[0];
				}

				function condense(unmatched, map, filter, context, xml) {
					var elem,
						newUnmatched = [],
						i = 0,
						len = unmatched.length,
						mapped = map != null;

					for (; i < len; i++) {
						if ((elem = unmatched[i])) {
							if (!filter || filter(elem, context, xml)) {
								newUnmatched.push(elem);
								if (mapped) {
									map.push(i);
								}
							}
						}
					}

					return newUnmatched;
				}

				function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
					if (postFilter && !postFilter[expando]) {
						postFilter = setMatcher(postFilter);
					}
					if (postFinder && !postFinder[expando]) {
						postFinder = setMatcher(postFinder, postSelector);
					}
					return markFunction(function(seed, results, context, xml) {
						var temp, i, elem,
							preMap = [],
							postMap = [],
							preexisting = results.length,

							// Get initial elements from seed or context
							elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []),

							// Prefilter to get matcher input, preserving a map for seed-results synchronization
							matcherIn = preFilter && (seed || !selector) ?
							condense(elems, preMap, preFilter, context, xml) :
							elems,

							matcherOut = matcher ?
							// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
							postFinder || (seed ? preFilter : preexisting || postFilter) ?

							// ...intermediate processing is necessary
							[] :

							// ...otherwise use results directly
							results :
							matcherIn;

						// Find primary matches
						if (matcher) {
							matcher(matcherIn, matcherOut, context, xml);
						}

						// Apply postFilter
						if (postFilter) {
							temp = condense(matcherOut, postMap);
							postFilter(temp, [], context, xml);

							// Un-match failing elements by moving them back to matcherIn
							i = temp.length;
							while (i--) {
								if ((elem = temp[i])) {
									matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
								}
							}
						}

						if (seed) {
							if (postFinder || preFilter) {
								if (postFinder) {
									// Get the final matcherOut by condensing this intermediate into postFinder contexts
									temp = [];
									i = matcherOut.length;
									while (i--) {
										if ((elem = matcherOut[i])) {
											// Restore matcherIn since elem is not yet a final match
											temp.push((matcherIn[i] = elem));
										}
									}
									postFinder(null, (matcherOut = []), temp, xml);
								}

								// Move matched elements from seed to results to keep them synchronized
								i = matcherOut.length;
								while (i--) {
									if ((elem = matcherOut[i]) &&
										(temp = postFinder ? indexOf.call(seed, elem) : preMap[i]) > -1) {

										seed[temp] = !(results[temp] = elem);
									}
								}
							}

							// Add elements to results, through postFinder if defined
						} else {
							matcherOut = condense(
								matcherOut === results ?
								matcherOut.splice(preexisting, matcherOut.length) :
								matcherOut
							);
							if (postFinder) {
								postFinder(null, results, matcherOut, xml);
							} else {
								push.apply(results, matcherOut);
							}
						}
					});
				}

				// 生成用于匹配单个选择器组的函数
				// 充当了 selector“tokens” 与 Expr 中定义的匹配方法的串联与纽带的作用，
				// 可以说选择符的各种排列组合都是能适应的了
				// Sizzle 巧妙的就是它没有直接将拿到的词法分析的结果与 Expr 中的方法逐个匹配逐个执行，
				// 而是先根据规则组合出一个大的匹配方法，最后一步执行。但是组合之后怎么执行的
				function matcherFromTokens(tokens) {
					var checkContext, matcher, j,
						len = tokens.length,
						leadingRelative = Expr.relative[tokens[0].type],
						// 亲密度关系
						implicitRelative = leadingRelative || Expr.relative[" "],
						i = leadingRelative ? 1 : 0,

						// The foundational matcher ensures that elements are reachable from top-level context(s)
						// 确保这些元素可以在 context 中找到
						matchContext = addCombinator(function(elem) {
							return elem === checkContext;
						}, implicitRelative, true),

						matchAnyContext = addCombinator(function(elem) {
							return indexOf.call(checkContext, elem) > -1;
						}, implicitRelative, true),

						// 这里用来确定元素在哪个 context
						matchers = [function(elem, context, xml) {
							return (!leadingRelative && (xml || context !== outermostContext)) || (
								(checkContext = context).nodeType ?
								matchContext(elem, context, xml) :
								matchAnyContext(elem, context, xml));
						}];

					for (; i < len; i++) {
						if ((matcher = Expr.relative[tokens[i].type])) {
							matchers = [addCombinator(elementMatcher(matchers), matcher)];
						} else {
							matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches);

							// Return special upon seeing a positional matcher
							if (matcher[expando]) {
								// Find the next relative operator (if any) for proper handling
								j = ++i;
								for (; j < len; j++) {
									if (Expr.relative[tokens[j].type]) {
										break;
									}
								}
								return setMatcher(
									i > 1 && elementMatcher(matchers),
									i > 1 && toSelector(
										// If the preceding token was a descendant combinator, insert an implicit any-element `*`
										tokens.slice(0, i - 1).concat({
											value: tokens[i - 2].type === " " ? "*" : ""
										})
									).replace(rtrim, "$1"),
									matcher,
									i < j && matcherFromTokens(tokens.slice(i, j)),
									j < len && matcherFromTokens((tokens = tokens.slice(j))),
									j < len && toSelector(tokens)
								);
							}
							matchers.push(matcher);
						}
					}

					return elementMatcher(matchers);
				}

				// 返回一个终极匹配器 superMatcher
				function matcherFromGroupMatchers(elementMatchers, setMatchers) {
					// A counter to specify which element is currently being matched
					var matcherCachedRuns = 0,
						bySet = setMatchers.length > 0,
						byElement = elementMatchers.length > 0,
						// 内嵌 superMatcher
						//
						superMatcher = function(seed, context, xml, results, expandContext) {
							var elem, j, matcher,
								setMatched = [],
								matchedCount = 0,
								i = "0",
								unmatched = seed && [],
								outermost = expandContext != null,
								contextBackup = outermostContext,
								// We must always have either seed elements or context
								// 根据参数 seed 、expandContext 和 context 确定一个起始的查询范围
								// 如果已经定义了初始集合 seed ，就直接用它，可以缩小过滤范围
								// 如果没有，那只能把整个 DOM 树节点取出来过滤了
								elems = seed || byElement && Expr.find["TAG"]("*", expandContext && context.parentNode || context),
								// Use integer dirruns if this is the outermost matcher
								dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

							// 搜索范围作用域
							// 可以看出对于优化选择器，最右边应该写一个作用域的搜索范围context比较好
							if (outermost) {
								outermostContext = context !== document && context;
								cachedruns = matcherCachedRuns;
							}

							// Add elements passing elementMatchers directly to results
							// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
							// 开始遍历 seed 种子合集了
							for (;
								(elem = elems[i]) != null; i++) {
								if (byElement && elem) {
									j = 0;
									while ((matcher = elementMatchers[j++])) {
										if (matcher(elem, context, xml)) {
											results.push(elem);
											break;
										}
									}
									if (outermost) {
										dirruns = dirrunsUnique;
										cachedruns = ++matcherCachedRuns;
									}
								}

								// Track unmatched elements for set filters
								if (bySet) {
									// They will have gone through all possible matchers
									if ((elem = !matcher && elem)) {
										matchedCount--;
									}

									// Lengthen the array for every element, matched or not
									if (seed) {
										unmatched.push(elem);
									}
								}
							}

							// Apply set filters to unmatched elements
							matchedCount += i;
							if (bySet && i !== matchedCount) {
								j = 0;
								while ((matcher = setMatchers[j++])) {
									matcher(unmatched, setMatched, context, xml);
								}

								if (seed) {
									// Reintegrate element matches to eliminate the need for sorting
									if (matchedCount > 0) {
										while (i--) {
											if (!(unmatched[i] || setMatched[i])) {
												setMatched[i] = pop.call(results);
											}
										}
									}

									// Discard index placeholder values to get only actual matches
									setMatched = condense(setMatched);
								}

								// Add matches to results
								push.apply(results, setMatched);

								// Seedless set matches succeeding multiple successful matchers stipulate sorting
								if (outermost && !seed && setMatched.length > 0 &&
									(matchedCount + setMatchers.length) > 1) {

									Sizzle.uniqueSort(results);
								}
							}

							// Override manipulation of globals by nested matchers
							if (outermost) {
								dirruns = dirrunsUnique;
								outermostContext = contextBackup;
							}

							return unmatched;
						};

					return bySet ?
						markFunction(superMatcher) :
						superMatcher;
				}

				// 编译函数机制
				// 通过传递进来的 selector 和 match 生成匹配器：
				compile = Sizzle.compile = function(selector, group /* Internal Use Only */ ) {
					var i,
						setMatchers = [],
						elementMatchers = [],
						cached = compilerCache[selector + " "];

					// 先看看有没有缓存
					if (!cached) {
						// Generate a function of recursive functions that can be used to check each element
						// 如果没有词法解析过
						if (!group) {
							group = tokenize(selector);
						}
						i = group.length;
						// 如果是有并联选择器这里多次等循环
						while (i--) {
							// 这里用 matcherFromTokens 来生成对应 Token 的匹配器
							cached = matcherFromTokens(group[i]);
							if (cached[expando]) {
								setMatchers.push(cached);
							} else {
								// 普通的那些匹配器都压入了elementMatchers里边
								elementMatchers.push(cached);
							}
						}

						// Cache the compiled function
						// 这里可以看到，是通过 matcherFromGroupMatchers 这个函数来生成最终的匹配器
						cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));
					}
					// 把这个终极匹配器返回到 select 函数中
					return cached;
				};

				function multipleContexts(selector, contexts, results) {
					var i = 0,
						len = contexts.length;
					for (; i < len; i++) {
						Sizzle(selector, contexts[i], results);
					}
					return results;
				}

				// Sizzle 引擎的主要入口函数
				// Expr.find: 主查找函数
				// Expr.filter: 主过滤函数
				// Expr.relative: 块间关系处理函数集
				// 程序走到这里调用了这个函数，说明选择器 selector 非简单的单条规则（如 id 、 tag 、class）
				// 且浏览器不支持 querySelectorAll 接口
				function select(selector, context, results, seed) {
					var i, tokens, token, type, find,
						// tokenize 解析出词法格式
						// tokenize 返回的是一个 Token 序列
						match = tokenize(selector);

					// 如果外界没有指定初始集合 seed
					if (!seed) {
						// Try to minimize operations if there is only one group
						// 如果只有一组，就是在单个选择器的情况（即是没有逗号的选择器，并非单条规则）
						// 可以有一些便捷的处理方式
						if (match.length === 1) {

							// Take a shortcut and set the context if the root selector is an ID
							// 取出选择器 Token 序列
							tokens = match[0] = match[0].slice(0);

							// 这么一大串其实简单来说是
							// 其实 Sizzle 不完全是采用从右到左，如果选择器表达式的最左边存在 #id 选择器
							// 就会首先对最左边进行查询，并将其作为下一步的执行上下文，
							// 最终达到缩小上下文的目的，考虑的相当全面
							if (tokens.length > 2 && (token = tokens[0]).type === "ID" &&
								support.getById && context.nodeType === 9 && documentIsHTML &&
								Expr.relative[tokens[1].type]) {

								// 如果是 id 选择器，那么以 #id 作为新的上下文
								context = (Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [])[0];

								// 如果 context 为空，说明新的上下文没找到
								// 如果 context 这个元素（ selector 第一个 id 选择器）都不存在就不用继续查找
								if (!context) {
									return results;
								}
								// 去掉第一个id选择器
								selector = selector.slice(tokens.shift().value.length);
							}

							// Fetch a seed set for right-to-left matching
							// 从右至左匹配，找出一个 seed 集合
							// 其中： "needsContext"= new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
							// 即是表示如果没有一些结构伪类，这些是需要用另一种方式过滤
							i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;

							// 从右向左边查询
							while (i--) {
								token = tokens[i];

								// Abort if we hit a combinator
								// 如果遇到了关系选择器中止
								//
								//  > + ~ 空
								if (Expr.relative[(type = token.type)]) {
									break;
								}

								// 先看看有没有搜索器find，搜索器就是浏览器一些原生的取DOM接口，简单的表述就是以下对象了
								//  Expr.find = {
								//    'ID'    : context.getElementById,
								//    'CLASS' : context.getElementsByClassName,
								//    'NAME'  : context.getElementsByName,
								//    'TAG'   : context.getElementsByTagName
								//  }
								if ((find = Expr.find[type])) {
									// Search, expanding context for leading sibling combinators
									// 尝试一下能否通过这个搜索器搜到符合条件的初始集合seed
									if ((seed = find(
											token.matches[0].replace(runescape, funescape),
											rsibling.test(tokens[0].type) && context.parentNode || context
										))) {

										// If seed is empty or no tokens remain, we can return early
										// 如果真的搜到了,把最后一条规则去除掉
										tokens.splice(i, 1);
										selector = seed.length && toSelector(tokens);

										// 看看当前剩余的选择器是否为空
										if (!selector) {
											// 是的话，提前返回结果了
											push.apply(results, seed);
											return results;
										}

										// 已经找到了符合条件的seed集合，此时前边还有其他规则，跳出去
										break;
									}
								}
							}
						}
					}

					// Compile and execute a filtering function
					// Provide `match` to avoid retokenization if we modified the selector above
					// tokenize(selector) 的结果不止一组，无法使用上述简便的方法
					// 交由 compile 来生成一个称为终极匹配器
					// 通过这个匹配器过滤 seed ，把符合条件的结果放到 results 里边
					// 生成编译函数
					// var superMatcher = compile( selector, match )
					// 执行
					// superMatcher(seed,context,!documentIsHTML,results,rsibling.test( selector ))
					compile(selector, match)(
						seed,
						context, !documentIsHTML,
						results,
						rsibling.test(selector)
					);
					// 返回结果
					return results;
				}

				// One-time assignments

				// Sort stability
				support.sortStable = expando.split("").sort(sortOrder).join("") === expando;

				// Support: Chrome<14
				// Always assume duplicates if they aren't passed to the comparison function
				support.detectDuplicates = hasDuplicate;

				// Initialize against the default document
				setDocument();

				// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
				// Detached nodes confoundingly follow *each other*
				support.sortDetached = assert(function(div1) {
					// Should return 1, but returns 4 (following)
					return div1.compareDocumentPosition(document.createElement("div")) & 1;
				});

				// Support: IE<8
				// Prevent attribute/property "interpolation"
				// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
				if (!assert(function(div) {
						div.innerHTML = "<a href='#'></a>";
						return div.firstChild.getAttribute("href") === "#";
					})) {
					addHandle("type|href|height|width", function(elem, name, isXML) {
						if (!isXML) {
							return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
						}
					});
				}

				// Support: IE<9
				// Use defaultValue in place of getAttribute("value")
				if (!support.attributes || !assert(function(div) {
						div.innerHTML = "<input/>";
						div.firstChild.setAttribute("value", "");
						return div.firstChild.getAttribute("value") === "";
					})) {
					addHandle("value", function(elem, name, isXML) {
						if (!isXML && elem.nodeName.toLowerCase() === "input") {
							return elem.defaultValue;
						}
					});
				}

				// Support: IE<9
				// Use getAttributeNode to fetch booleans when getAttribute lies
				if (!assert(function(div) {
						return div.getAttribute("disabled") == null;
					})) {
					addHandle(booleans, function(elem, name, isXML) {
						var val;
						if (!isXML) {
							return (val = elem.getAttributeNode(name)) && val.specified ?
								val.value :
								elem[name] === true ? name.toLowerCase() : null;
						}
					});
				}

				// 暴露接口
				jQuery.find = Sizzle;
				jQuery.expr = Sizzle.selectors;
				jQuery.expr[":"] = jQuery.expr.pseudos;
				jQuery.unique = Sizzle.uniqueSort;
				jQuery.text = Sizzle.getText;
				jQuery.isXMLDoc = Sizzle.isXML;
				jQuery.contains = Sizzle.contains;


			})(window);
			// String to Object options format cache
			// 创建一个 options 缓存，用于 Callbacks
			var optionsCache = {};

			// Convert String-formatted options into Object-formatted ones and store in cache
			// 生成一个 options 配置对象
			// 使用 optionsCache[ options ] 缓存住配置对象
			// 生成的配置对象就是{once:true, memory:true}
			function createOptions(options) {
				var object = optionsCache[options] = {};
				jQuery.each(options.match(core_rnotwhite) || [], function(_, flag) {
					object[flag] = true;
				});
				return object;
			}

			/*
			 * Create a callback list using the following parameters:
			 *
			 *	options: an optional list of space-separated options that will change how
			 *			the callback list behaves or a more traditional option object
			 *
			 * By default a callback list will act like an event callback list and can be
			 * "fired" multiple times.
			 *
			 * Possible options:
			 *
			 *	once:			will ensure the callback list can only be fired once (like a Deferred)
			 *
			 *	memory:			will keep track of previous values and will call any callback added
			 *					after the list has been fired right away with the latest "memorized"
			 *					values (like a Deferred)
			 *
			 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
			 *
			 *	stopOnFalse:	interrupt callings when a callback returns false
			 *
			 */
			// options 参数包含四个可选项，可用空格或者, 分隔，分别是
			// once 、 memory 、 unique 、stopOnFalse
			// once -- 确保这个回调列表只执行（ .fire() ）一次(像一个递延 Deferred)
			// memory -- 保持以前的值，将添加到这个列表的后面的最新的值立即执行调用任何回调 (像一个递延 Deferred)
			// unique -- 确保一次只能添加一个回调(所以在列表中没有重复的回调)
			// stopOnFalse -- 当一个回调返回 false 时中断调用
			jQuery.Callbacks = function(options) {

				// Convert options from String-formatted to Object-formatted if needed
				// (we check in cache first)
				// 通过字符串在optionsCache寻找有没有相应缓存，如果没有则创建一个，有则引用
				options = typeof options === "string" ?
					// 如果传递的是字符串
					// 可以传递字符串："once memory"
					// 这里还用optionsCache[ options ]缓存住配置对象
					// 生成的配置对象就是{once:true, memory:true}
					(optionsCache[options] || createOptions(options)) :
					// 如果传递的是对象
					// 可以传递对象：{once:true, memory:true}
					jQuery.extend({}, options);

				var
				// Flag to know if list is currently firing
				// 列表中的函数是否正在回调中
					firing,
					// Last fire value (for non-forgettable lists)
					// 最后一次触发回调时传的参数
					memory,
					// Flag to know if list was already fired
					// 列表中的函数是否已经回调至少一次
					fired,
					// End of the loop when firing
					// 需要 fire 的队列长度
					firingLength,
					// Index of currently firing callback (modified by remove if needed)
					// 当前正在firing的回调在队列的索引
					firingIndex,
					// First callback to fire (used internally by add and fireWith)
					// 回调的起点
					firingStart,
					// Actual callback list
					// 回调函数列表
					list = [],
					// Stack of fire calls for repeatable lists
					// 可重复的回调函数堆栈，用于控制触发回调时的参数列表
					// 如果不是once的，那么stack会keep住fire所需的上下文跟参数（假设称为事件）
					stack = !options.once && [],

					// Fire callbacks
					// 触发回调函数列表
					// 这个函数是内部使用的辅助函数，私有方法
					// 它被 self.fire 以及 self.fireWith 调用
					fire = function(data) {
						// 如果参数 memory 为true，则记录 data
						// 如果是 memory 类型管理器
						// 要记住 fire 的事件 data，以便下次 add 的时候可以重新 fire 这个事件
						// 看 add 源码最后一段就知道
						memory = options.memory && data;
						fired = true;
						firingIndex = firingStart || 0;
						firingStart = 0;
						firingLength = list.length;
						// 开始 fire,表示正在 fire
						firing = true;

						// 遍历回调队列 list
						for (; list && firingIndex < firingLength; firingIndex++) {
							// data[ 0 ]是函数执行的上下文，也就是平时的this
							// 这里看再看下 self.fireWith 传过来的参数 args 的格式
							// 如果是stopOnFalse管理器，并且回调返回值是false，中断！
							// list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) 是最终的执行回调的方法
							if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
								memory = false; // To prevent further calls using add
								break;
							}
						}
						// 结束 fire ，标记回调结束
						firing = false;

						if (list) {
							if (stack) {
								// 如果事件栈还不为空
								// 不是 "once" 的情况
								if (stack.length) {
									// 从堆栈头部取出，递归fire
									fire(stack.shift());
									// 这里是深度遍历，直到事件队列为空
								}
								// 深度遍历结束
								// 等到fire完所有的事件后
								// 如果是memory类型管理器，下次还能继续
							} else if (memory) {
								// 清空队列
								// "once memory" ，或者 "memory" 情况下 lock 过。
								list = [];
							} else {
								// once
								self.disable();
							}
						}
					},
					// Actual Callbacks object
					// 实际的 callbacks 对象
					// var callbacks = $.Callbacks() 最后返回的是 sele 对象
					self = {
						// Add a callback or a collection of callbacks to the list
						// 向回调列表中添加一个回调或回调的集合。
						// 也就是实参可以是一个函数，或者一个函数数组
						add: function() {
							// 确保 list 是存在的
							if (list) {
								// First, we save the current length
								// 首先，存储当前回调队列的长度
								var start = list.length;
								// 这里是一个立即执行函数，参数 add 是传入的参数
								// 直接遍历传过来的 arguments 进行 push
								(function add(args) {
									// 遍历这个 参数 集合
									jQuery.each(args, function(_, arg) {
										// 类型判断
										var type = jQuery.type(arg);
										// 如果传入的是单个方法
										if (type === "function") {
											// 不是unique管理器或者当前队列还没有该回调
											if (!options.unique || !self.has(arg)) {
												// 将回调push入队列
												list.push(arg);
											}
											// 如果传入的是回调的集合数组 或者 array-like
											// 因为可以同时add多个回调
											// 从这里可以看出add的传参可以有add(fn),add([fn1,fn2]),add(fn1,fn2)
											// 同时这里排除掉type为string的情况，其实是提高效率，不加判断也能正确
										} else if (arg && arg.length && type !== "string") {
											// Inspect recursively
											// 递归调用自己，注意这个使用技巧
											// 如果是数组，以这个数组为参数再递归调用这个立即执行函数本身
											add(arg);
										}
									});
								})(arguments);
								// Do we need to add the callbacks to the
								// current firing batch?
								// 如果当前在 firing 当中，那就把需要firing的长度设置成列表长度
								if (firing) {
									firingLength = list.length;
									// With memory, if we're not firing then
									// we should call right away
									// 如果已经 fire 过并且是 memory 类型的管理器
									// memory 在这里是上一次 fire 的 [context, args]
								} else if (memory) {
									firingStart = start;
									// memory 在上一次 fire 的时候被记录过了
									// fire 的时候有这么一段
									// memory = options.memory && data;
									// memory 作用在这里，没有fire，一样有结果
									fire(memory);
								}
							}
							return this;
						},
						// Remove a callback from the list
						// 从队列中移除一个或多个回调
						remove: function() {
							// 确保队列是存在的
							if (list) {
								// 遍历传入的参数（即是要移除的回调）
								jQuery.each(arguments, function(_, arg) {
									var index;
									// inArray(elem,arr,i) -- 在数组中查找指定值并返回它的索引（如果没有找到，则返回-1）
									// elem 规定需检索的值, arr 数组, i 可选的整数参数
									//
									while ((index = jQuery.inArray(arg, list, index)) > -1) {
										// splice(index,howmany) 方法向/从数组中添加/删除项目，然后返回被删除的项目
										// index -- 必需。整数，规定添加/删除项目的位置
										// howmany -- 必需。要删除的项目数量。如果设置为 0，则不会删除项目
										// 从回调队列中移除当前查找到的这个方法
										list.splice(index, 1);
										// Handle firing indexes
										// 在函数列表处于firing状态时，最主要的就是维护firingLength和firgingIndex这两个值
										// 保证fire时函数列表中的函数能够被正确执行（fire中的for循环需要这两个值
										if (firing) {
											if (index <= firingLength) {
												firingLength--;
											}
											if (index <= firingIndex) {
												firingIndex--;
											}
										}
									}
								});
							}
							return this;
						},
						// Check if a given callback is in the list.
						// If no argument is given, return whether or not list has callbacks attached.
						// 查找一个给定的回调函数是否存在于回调列表中
						has: function(fn) {
							return fn ? jQuery.inArray(fn, list) > -1 : !!(list && list.length);
						},
						// Remove all callbacks from the list
						// 清空回调列表
						empty: function() {
							list = [];
							firingLength = 0;
							return this;
						},
						// Have the list do nothing anymore
						// 禁用回调列表中的回调
						// 禁用掉之后，把里边的队列、栈等全部清空了！无法再恢复了
						disable: function() {
							list = stack = memory = undefined;
							return this;
						},
						// Is it disabled?
						// 列表是否被禁用
						disabled: function() {
							return !list;
						},
						// Lock the list in its current state
						//
						lock: function() {
							stack = undefined;
							if (!memory) {
								self.disable();
							}
							return this;
						},
						// Is it locked?
						locked: function() {
							return !stack;
						},
						// Call all callbacks with the given context and arguments
						// 以给定的上下文和参数调用所有回调函数
						fireWith: function(context, args) {
							// list 不为空
							// 并且没有 fire 过或者 stack 不为空
							if (list && (!fired || stack)) {
								args = args || [];
								// 把 args 组织成 [context, [arg1, arg2, arg3, ...]]
								// 可以看到第一个参数是上下文
								args = [context, args.slice ? args.slice() : args];
								// 如果当前还在 firing
								if (firing) {
									// 将参数推入堆栈，等待当前回调结束再调用
									stack.push(args);
								} else {
									// 否则直接调用
									// 这里调用的 fire 是内部使用的 fire 方法，不是self.fire
									fire(args);
								}
							}
							return this;
						},
						// Call all the callbacks with the given arguments
						// 以给定的参数调用所有回调函数
						// 外观模式 self.fire –> self.fireWith –> fire
						// 最终执行代码是内部私有的 fire 方法
						fire: function() {
							self.fireWith(this, arguments);
							return this;
						},
						// To know if the callbacks have already been called at least once
						// 回调函数列表是否至少被调用一次
						fired: function() {
							return !!fired;
						}
					};

				return self;
			};

			// 当 jQuery.extend 只有一个参数的时候，其实就是对 jQuery 静态方法的一个扩展
			// jQuery 整体架构对 extend 的解析
			// http://www.cnblogs.com/aaronjs/p/3278578.html
			jQuery.extend({

				// Deferred 方法
				// 生成的 deferred 对象就是 jQuery 的回调函数解决方案
				// $.Deferred() 生成一个 deferred 对象
				// deferred.done(fnc) 指定操作成功时的回调函数
				// deferred.fail(fnc) 指定操作失败时的回调函数
				// deferred.promise() 没有参数时，返回一个新的deferred对象，该对象的运行状态无法被改变；接受参数时，作用为在参数对象上部署 deferred 接口
				// deferred.resolve() 手动改变 deferred 对象的运行状态为"已完成"，从而立即触发 done() 方法
				// deferred.reject() 这个方法与 deferred.resolve() 正好相反，调用后将 deferred 对象的运行状态变为"已失败"，从而立即触发 fail() 方法
				// $.when() 为多个操作指定回调函数
				// deferred.then() 便捷写法，把 done()、fail() 和 progress() 合在一起写
				// deferred.always() 用来指定回调函数的，它的作用是，不管调用的是 deferred.resolve() 还是 deferred.reject()，最后总是执行
				// deferred对象详解 http://www.ruanyifeng.com/blog/2011/08/a_detailed_explanation_of_jquery_deferred_object.html
				Deferred: function(func) {
					// tuples 创建三个 $.Callbacks 对象，分别表示成功，失败，处理中三种状态
					// 为什么要写成 tuples 这种格式呢，其实是把相同有共同特性的代码的给合并成一种结构，
					// 然后下面通过 jQuery.each(tuples, function(i, tuple) {} 一次处理
					var tuples = [
							// action, add listener, listener list, final state
							// 三个队列，done|fail|progress 成功|失败|处理中
							// resolved 对应 已完成
							// resolved 对象立刻调用 done()方法指定的回调函数
							// rejected 对应 已失败
							// rejected 对象立刻调用 fail()方法指定的回调函数
							// notify 对应 处理中
							// progress 对象立刻调用 progress()方法指定的回调函数
							["resolve", "done", jQuery.Callbacks("once memory"), "resolved"],
							["reject", "fail", jQuery.Callbacks("once memory"), "rejected"],
							["notify", "progress", jQuery.Callbacks("memory")]
						],
						// 初始状态 ，pending 的意思为待定
						state = "pending",

						// 定义一个 promise 对象，坑爹是这个对象里面还有一个 promise 对象需要注意
						// 具有 state、always、then、primise 方法
						promise = {
							// 返回一个 Deferred 对象的当前状态
							state: function() {
								return state;
							},
							// 这个方法也是用来指定回调函数的
							// 它的作用是，不管调用的是 deferred.resolve() 还是 deferred.reject() ，最后总是执行
							always: function() {
								// deferred 是最终生成的异步队列实例
								deferred.done(arguments).fail(arguments);
								// 返回 this，便于链式操作
								return this;
							},
							// 把 done()、fail() 和 progress() 合在一起写
							// deferred.done(fnDone), fail(fnFail) , progress(fnProgress) 的快捷方式
							then: function( /* fnDone, fnFail, fnProgress */ ) {
								// 参数为传入的 done 、 fail 、progress 函数
								// fns = [fnDone, fnFail, fnProgress]
								var fns = arguments;

								// 这里 return jQuery.Deferred(function( newDefer ) {}).promise();
								// 这里可以看到，又使用了 jQuery.Deferred() 对 then 方法里面的参数又封装了一次
								return jQuery.Deferred(function(newDefer) {

									// 遍历 tuples
									jQuery.each(tuples, function(i, tuple) {
										// action 表示三种状态 resolve 、reject 、notify 其中之一
										// 分别对应 fnDone, fnFail, fnProgress（首先用 isFunction 判断传入的参数是否是方法，注意 && 在这里的用法）
										var action = tuple[0],
											fn = jQuery.isFunction(fns[i]) && fns[i];

										// deferred[ done | fail | progress ] for forwarding actions to newDefer
										// tuple[1] = [ done | fail | progress ]
										// 绑定 deferred [done | fail | progress] 方法
										deferred[tuple[1]](function() {
											// 当前的 this == deferred
											var returned = fn && fn.apply(this, arguments);

											// 如果回调返回的是一个 Deferred 实例
											if (returned && jQuery.isFunction(returned.promise)) {
												// 则继续派发事件
												returned.promise()
													.done(newDefer.resolve)
													.fail(newDefer.reject)
													.progress(newDefer.notify);
												// 如果回调返回的是不是一个 Deferred 实例，则被当做 args 由 XXXWith 派发出去
											} else {
												newDefer[action + "With"](this === promise ? newDefer.promise() : this, fn ? [returned] : arguments);
											}
										});
									});
									// 销毁变量，防止内存泄漏（退出前手工设置null避免闭包造成的内存占用）
									fns = null;
								}).promise();
							},
							// Get a promise for this deferred
							// If obj is provided, the promise aspect is added to the object
							// 如果 obj 存在，给 obj 拓展 then | done | fail | progress 等方法，也就是外层的 promise 对象所定义的 state 、always 、then 方法
							promise: function(obj) {
								// 注意区分这里的 promise ，这里的 promise 指代的是外层的 promise 对象，而不是里层的 promise 方法
								// 在这里的 promise 就相当于 this
								return obj != null ? jQuery.extend(obj, promise) : promise;
							}
						},

						// 最终生成的异步队列实例
						deferred = {};

					// Keep pipe for back-compat
					// 兼容旧版
					promise.pipe = promise.then;

					// Add list-specific methods
					// 初始化三条 Callbacks 队列
					// 对于 tuples 的 3 条数据集是分 2 部分处理的
					// 1、将回调函数（ done | fail | progress ）存入函数
					// 2、给 deferred 对象扩充6个方法 （resolve/reject/notify/resolveWith/rejectWith/notifyWith ）
					// resolve/reject/notify 是 callbacks.fireWith ，执行回调函数
					// resolveWith/rejectWith/notifyWith 是 callbacks.fireWith 队列方法引用
					jQuery.each(tuples, function(i, tuple) {
						// list 为队列，jQuery.Callbacks() ,创建了一个 callback 对象
						// stateString 为最后的状态
						var list = tuple[2],
							stateString = tuple[3];

						// promise[ done | fail | progress ] = list.add
						// tuple[1] == done | fail | progress
						// 可以看到 done|fail|progress 其实就是 Callbacks 里边的 add 方法
						promise[tuple[1]] = list.add;

						// Handle state
						// 成功或者失败
						// 如果存在 deferred 最终状态，向 doneList,failList 中的 list 添加 3 个回调函数
						if (stateString) {

							list.add(function() {
									// state = [ resolved | rejected ]
									// 修改最终状态
									state = stateString;

									// [ reject_list | resolve_list ].disable; progress_list.lock
									// 这里用到了 disable ，即是禁用回调列表中的回调
									// 禁用对立的那条队列
									// 注意 0^1 = 1   1^1 = 0
									// 即是成功的时候，把失败那条队列禁用
									// 即是成功的时候，把成功那条队列禁用
								}, tuples[i ^ 1][2].disable,
								// 锁住当前队列状态
								tuples[2][2].lock);
						}

						// deferred[ resolve | reject | notify ]
						// tuple[0] == resolve | reject | notify
						// 可以看到 resolve | reject | notify 其实就是 Callbacks 里边的 fire 方法
						// 这里还有一点，deferred 对象是暴露了 resolve | reject | notify 三个方法的，而 deferred.promise() 只暴露 done, fail, always 这些个回调函数接口
						// 之所以通常使用 deferred 是要返回 deferred.promise() ，一是因为 CommonJS promise/A 本来就应当是这样子的；二也是用来避免返回的对象能够主动地调用到 resolve 与 reject 这些关键性的方法
						deferred[tuple[0]] = function() {
							deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments);
							return this;
						};
						// deferred[resolveWith | rejectWith | notifyWith] 调用的是 Callbacks 里的 fireWith 方法
						//
						deferred[tuple[0] + "With"] = list.fireWith;
					});
					// Make the deferred a promise
					// 这一步之前 promise 和 deferred 绑定了以下方法
					// deferred[ resolve | reject | notify ]
					// deferred[ resolveWith | rejectWith | notifyWith ]
					// promise[ done | fail | progress | then | always | state | promise ]


					// 合并内部辅助的 promise 的 promise 方法（jQ 同学坑爹，起同样名字）
					// 扩展 deferred 的 then | done | fail | progress 等方法
					promise.promise(deferred);

					// Call given func if any
					// $.Deferred(func)格式
					// $.Deferred() 可以接受一个函数名（注意，是函数名）作为参数，$.Deferred() 所生成的 deferred 对象将作为这个函数的默认参数
					// 例子:
					// http://www.ruanyifeng.com/blog/2011/08/a_detailed_explanation_of_jquery_deferred_object.html
					// 并且把当前任务的上下文跟参数设置成当前生成的deferred实例
					if (func) {
						func.call(deferred, deferred);
					}

					// All done!
					// 返回实例，显而易见 Deferred 是个工厂类，返回的是内部构建的 deferred 对象
					return deferred;
				},

				// Deferred helper
				// $.when( deferreds ) 提供一种方法来执行一个或多个对象的回调函数，
				// http://www.css88.com/jqapi-1.9/jQuery.when/
				// 参数 deferreds 表示一个或多个延迟对象，或者普通的JavaScript对象
				// 例子:
				// http://www.ruanyifeng.com/blog/2011/08/a_detailed_explanation_of_jquery_deferred_object.html
				// 注意到 $.when 是多任务的，当一个任务失败的时候，代表整个都失败了，
				// 即是 $.when(d1, d2).done(fnc) 如果 d1 或者 d2 其中一个失败了，代表整个都失败了，将不会执行fnc
				// 任务是 Deferred 实例，称为异步任务
				// 任务是普通 function 时，称为同步任务
				when: function(subordinate /* , ..., subordinateN */ ) {
					var i = 0,
						// 将传入的任务对象变为任务对象数组
						resolveValues = core_slice.call(arguments),
						// 任务对象数组的长度
						length = resolveValues.length,

						// the count of uncompleted subordinates
						// 还没完成的异步任务数
						remaining = length !== 1 || (subordinate && jQuery.isFunction(subordinate.promise)) ? length : 0,

						// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
						// 如果任务对象参数列表 resolveValues 只有一个对象，那么 deferred 对象就是它，否则新建一个 deferred 对象
						deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

						// Update function for both resolve and progress values
						// 用于更新 成功|处理 中两个状态，
						// 这里不考虑失败的状态是因为，当一个任务失败的时候，代表整个都失败了。
						updateFunc = function(i, contexts, values) {
							return function(value) {
								contexts[i] = this;
								values[i] = arguments.length > 1 ? core_slice.call(arguments) : value;
								// 处理中，派发正在处理事件
								if (values === progressValues) {
									deferred.notifyWith(contexts, values);
									// 成功，并且最后剩余的异步任务为0了
								} else if (!(--remaining)) {
									// 说明所有任务都成功了，派发成功事件出去
									// 事件包含的上下文是当前任务前边的所有任务的一个集合
									deferred.resolveWith(contexts, values);
								}
							};
						},

						progressValues, progressContexts, resolveContexts;

					// add listeners to Deferred subordinates; treat others as resolved
					// 如果只有一个任务，可以不用做维护状态的处理了
					// 只有大于1个任务才需要维护任务的状态
					if (length > 1) {
						progressValues = new Array(length);
						progressContexts = new Array(length);
						resolveContexts = new Array(length);
						for (; i < length; i++) {
							if (resolveValues[i] && jQuery.isFunction(resolveValues[i].promise)) {
								resolveValues[i].promise()
									.done(updateFunc(i, resolveContexts, resolveValues))
									.fail(deferred.reject)
									.progress(updateFunc(i, progressContexts, progressValues));
							} else {
								--remaining;
							}
						}
					}

					// if we're not waiting on anything, resolve the master
					// 传进来的任务都是同步任务
					if (!remaining) {
						deferred.resolveWith(resolveContexts, resolveValues);
					}

					// 注意这里有一种情况是，
					// 如果你不传递任何参数，jQuery.when() 将返回一个 resolved（解决）状态的 promise 对象
					return deferred.promise();
				}
			});

			// jQuery.support 属性包含表示不同浏览器特性或漏洞的属性集
			// 需要注意的是，官网强烈建议浏览器功能性检测不要使用 jQuery.support 上的属性。而使用比如 Modernizr 这样的外部类库（http://www.css88.com/jqapi-1.9/jQuery.support/）
			// example:
			// $.support.ajax --> true
			jQuery.support = (function(support) {

				var all, a, input, select, fragment, opt, eventName, isSupported, i,
					div = document.createElement("div");

				// Setup
				// 创建测试用例
				div.setAttribute("className", "t");
				div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

				// Finish early in limited (non-browser) environments
				// 在非浏览器环境提前结束
				all = div.getElementsByTagName("*") || [];
				a = div.getElementsByTagName("a")[0];
				if (!a || !a.style || !all.length) {
					return support;
				}

				// First batch of tests
				// 第一批次测试
				select = document.createElement("select");
				opt = select.appendChild(document.createElement("option"));
				input = div.getElementsByTagName("input")[0];

				a.style.cssText = "top:1px;float:left;opacity:.5";

				// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
				// 测试是否支持 setAttribute 方法
				// setAttribute 方法需要传入驼峰表示法的参数
				// 在 IE67 中要获得单个属性的值，就必须将属性名转为驼峰形式
				// element.currentStyle.getAttribute(camelCase(style)) -- http://www.cnblogs.com/coco1s/p/5210667.html
				support.getSetAttribute = div.className !== "t";

				// IE strips leading whitespace when .innerHTML is used
				// IE678 的 childNodes 不包含空白文本节点，firstChild 同理
				// nodeType = 3 --- Text
				support.leadingWhitespace = div.firstChild.nodeType === 3;

				// Make sure that tbody elements aren't automatically inserted
				// IE will insert them into empty tables
				// 空 table，IE 会自动生成 tbody，而标准浏览器不会(标准浏览器如果有 tr 存在，也会自动生成 tbody )
				support.tbody = !div.getElementsByTagName("tbody").length;

				// Make sure that link elements get serialized correctly by innerHTML
				// This requires a wrapper element in IE
				// IE678 无法通过 div.innerHTML = '<link />';来插入 link
				support.htmlSerialize = !!div.getElementsByTagName("link").length;

				// Get the style information from getAttribute
				// (IE uses .cssText instead)
				// IE67 无法用 getAttribute 获取 style ，返回 object ，
				// 同理也无法用 setAttribute 设置 style
				support.style = /top/.test(a.getAttribute("style"));

				// Make sure that URLs aren't manipulated
				// (IE normalizes it by default)
				// getAttribute 获取 href 的问题，
				// 详见http://www.cnblogs.com/littledu/articles/2710234.html
				support.hrefNormalized = a.getAttribute("href") === "/a";

				// Make sure that element opacity exists
				// (IE uses filter instead)
				// Use a regex to work around a WebKit issue. See #5145
				// 确定 opacity 属性是否存在，IE678 是通过 filter 滤镜来支持透明度
				support.opacity = /^0.5/.test(a.style.opacity);

				// Verify style float existence
				// (IE uses styleFloat instead of cssFloat)
				// IE678 通过 styleFloat 来获取 float，而标准浏览器用 cssFloat
				support.cssFloat = !!a.style.cssFloat;

				// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
				// checkbox 的默认值是否为 'on' 的测试
				support.checkOn = !!input.value;

				// Make sure that a selected-by-default option has a working selected property.
				// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
				// IE 中，第一个 option 默认不被选中，包括 IE9 依然如此，其他则选中
				support.optSelected = opt.selected;

				// Tests for enctype support on a form (#6743)
				// 测试 form 是否支持 enctype
				// enctype 属性规定在发送到服务器之前应该如何对表单数据进行编码
				support.enctype = !!document.createElement("form").enctype;

				// Makes sure cloning an html5 element does not cause problems
				// Where outerHTML is undefined, this still works
				// IE6 在克隆 HTML5 的新标签元素时 outerHTML 有":"
				support.html5Clone = document.createElement("nav").cloneNode(true).outerHTML !== "<:nav></:nav>";

				// Will be defined later
				// 初始化定义，下面进行测试及修改
				support.inlineBlockNeedsLayout = false;
				support.shrinkWrapBlocks = false;
				support.pixelPosition = false;
				support.deleteExpando = true;
				support.noCloneEvent = true;
				support.reliableMarginRight = true;
				support.boxSizingReliable = true;

				// Make sure checked status is properly cloned
				// IE6789 , checked 不能被拷贝
				input.checked = true;
				support.noCloneChecked = input.cloneNode(true).checked;

				// Make sure that the options inside disabled selects aren't marked as disabled
				// (WebKit marks them as disabled)
				// chrome23 已修复
				select.disabled = true;
				// 如果预设的 select 元素中 option 元素不会自动标识为 disabled（oldIE）
				// 那么 optDisabled 会被设定为 true
				support.optDisabled = !opt.disabled;

				// Support: IE<9
				// IE678 不能 delete 节点上的属性
				try {
					delete div.test;
				} catch (e) {
					support.deleteExpando = false;
				}

				// Check if we can trust getAttribute("value")
				// getAttribute 检测
				input = document.createElement("input");
				input.setAttribute("value", "");

				// 是否支持 input 的 getAttribute("value")
				support.input = input.getAttribute("value") === "";

				// Check if an input maintains its value after becoming a radio
				// IE下，input 被更换类型后，无法保持前一个类型所设的值
				input.value = "t";
				input.setAttribute("type", "radio");
				support.radioValue = input.value === "t";

				// #11217 - WebKit loses check when the name is after the checked attribute
				input.setAttribute("checked", "t");
				input.setAttribute("name", "t");

				// createdocumentfragment() 方法创建了一虚拟的节点对象，节点对象包含所有属性和方法。
				fragment = document.createDocumentFragment();
				fragment.appendChild(input);

				// Check if a disconnected checkbox will retain its checked
				// value of true after appended to the DOM (IE6/7)
				support.appendChecked = input.checked;

				// WebKit doesn't clone checked state correctly in fragments
				// 检查 fragment 中的 checkbox 的选中状态是否能被复制
				// 这段代码创建了一个 fragment ，并将一个处于选中状态的 checkbox 加入，连续复制两遍后检查 checkbox 是否为选中状态。
				support.checkClone = fragment.cloneNode(true).cloneNode(true).lastChild.checked;

				// Support: IE<9
				// Opera does not clone events (and typeof div.attachEvent === undefined).
				// IE9-10 clones events bound via attachEvent, but they don't trigger with .click()
				// 检查复制 DOM Element 时是否会连同 event 一起复制，会则为 false ， 不会则为true
				// IE 中为 false ， FireFox 中为 true
				if (div.attachEvent) {
					// 首先在 support 中增加属性 noCloneEvent ， 默认值为 true (在上面 Will be defined later 中定义)
					div.attachEvent("onclick", function() {
						support.noCloneEvent = false;
					});
					// 然后复制 div， 并触发其 “onclick” 事件，触发成功则为将 noCloneEvent 设为 false
					div.cloneNode(true).click();
				}

				// Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event)
				// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
				// submitBubbles, changeBubbles, focusinBubbles
				// 检查 submit、change、focus 事件是否在“冒泡阶段”触发
				// 实际上只针对 IE 进行检查。因为大多数浏览器（及IE9）使用 addEventListener 附加事件，函数的第三个参数 useCapture （是否在“捕捉阶段”触发事件）既可以为 false ，也可以为 true
				//  而 IE （IE9之前）使用 attachEvent 函数附加事件，该函数无法指定在哪个阶段触发事件，一律都为“冒泡阶段”触发
				for (i in {
						submit: true,
						change: true,
						focusin: true
					}) {
					// 通过 setAttribute(eventName, xxx)进行设置
					div.setAttribute(eventName = "on" + i, "t");
					// 通过设置的属性（onXXX）存在，可以的话就判断为“冒泡阶段”触发（即只要支持该事件，就判断为“冒泡阶段”触发）
					support[i + "Bubbles"] = eventName in window || div.attributes[eventName].expando === false;
				}

				// 克隆出来的div应该不影响原 div, IE678 则会受到影响变为 “” ，等于false
				div.style.backgroundClip = "content-box";
				div.cloneNode(true).style.backgroundClip = "";
				support.clearCloneStyle = div.style.backgroundClip === "content-box";

				// Support: IE<9
				// Iteration over object's inherited properties before its own.
				// 我们知道正常的 for..in.. 循环，首先是从一个对象的实例属性开始的，然后再循环 prototype 中的属性。
				// 但是在 IE9 之前的版本中，这个刚好是反过来的。
				// 所以在这里，jQuery(support) 返回的对象中，第一个 i 应该是 0 ，但是在IE中的是 'andSelf' ，这是 jQuery 中 prototype 里的最后一个属性，
				// 所以最后用 i 与 0 比较，确定 for..in.. 顺序。
				for (i in jQuery(support)) {
					break;
				}
				support.ownLast = i !== "0";

				// Run tests that need a body at doc ready
				// 运行测试，and 需要 doc ready 环境
				jQuery(function() {
					var container, marginDiv, tds,
						divReset = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
						body = document.getElementsByTagName("body")[0];

					// 不存在 body 标签直接返回
					if (!body) {
						// Return for frameset docs that don't have a body
						return;
					}

					// 创建测试用例
					container = document.createElement("div");
					container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

					body.appendChild(container).appendChild(div);

					// Support: IE8
					// Check if table cells still have offsetWidth/Height when they are set
					// to display:none and there are still other visible table cells in a
					// table row; if so, offsetWidth/Height are not reliable for use when
					// determining if an element has been hidden directly using
					// display:none (it is still safe to use offsets if a parent element is
					// hidden; don safety goggles and see bug #4512 for more information).
					div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
					tds = div.getElementsByTagName("td");
					tds[0].style.cssText = "padding:0;margin:0;border:0;display:none";
					isSupported = (tds[0].offsetHeight === 0);

					tds[0].style.display = "";
					tds[1].style.display = "none";

					// Support: IE8
					// Check if empty table cells still have offsetWidth/Height
					// 空 table 是否仍然存在 offsetWidth/Height （IE8）
					support.reliableHiddenOffsets = isSupported && (tds[0].offsetHeight === 0);

					// Check box-sizing and margin behavior.
					div.innerHTML = "";
					// 注意这里设置了一些样式 box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;
					// border-box -- 这是IE 怪异模式（Quirks mode）使用的 盒模型。
					// width 与 height 包括内边距（padding）与边框（border），不包括外边距（margin）
					// width = border + padding + 内容的宽度，height = border + padding + 内容的高度
					div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";

					// Workaround failing boxSizing test due to offsetWidth returning wrong value
					// with some non-1 values of body zoom, ticket #13543
					jQuery.swap(body, body.style.zoom != null ? {
						zoom: 1
					} : {}, function() {
						// 当 offsetWidth 为 4 ，说明不包括内边距（padding）与边框（border），不支持 boxSizing
						support.boxSizing = div.offsetWidth === 4;
					});

					// Use window.getComputedStyle because jsdom on node.js will break without it.
					// window.getComputedStyle -- 方法得出所有在应用有效的样式和分解任何可能会包含值的基础计算后的元素的CSS属性值
					// jQuery 的 CSS() 方法，其底层运作就应用了 getComputedStyle 以及 getPropertyValue 方法
					// https://developer.mozilla.org/zh-CN/docs/Web/API/Window/getComputedStyle
					if (window.getComputedStyle) {
						// safari 下返回 1%，因此等于 false ，而其他浏览器会转换成相应的像素值
						support.pixelPosition = (window.getComputedStyle(div, null) || {}).top !== "1%";
						// IE 下，如果是怪异模式，width 不等于 4px，需要减去 padding，border
						support.boxSizingReliable = (window.getComputedStyle(div, null) || {
							width: "4px"
						}).width === "4px";

						// Check if div with explicit width and no margin-right incorrectly
						// gets computed margin-right based on width of container. (#3333)
						// Fails in WebKit before Feb 2011 nightlies
						// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
						marginDiv = div.appendChild(document.createElement("div"));
						marginDiv.style.cssText = div.style.cssText = divReset;
						marginDiv.style.marginRight = marginDiv.style.width = "0";
						div.style.width = "1px";

						// 检查 Margin Right 的计算是否可靠。 各浏览器中都为 true
						// 上面注释中提到某些老版本的 Webkit 内核的浏览器中为 false
						// 简单地说，就是将 width 和 marginRight 设为 0 时，获取的 marginRignt 应为 0
						support.reliableMarginRight = !parseFloat((window.getComputedStyle(marginDiv, null) || {}).marginRight);
					}

					if (typeof div.style.zoom !== core_strundefined) {
						// Support: IE<8
						// Check if natively block-level elements act like inline-block
						// elements when setting their display to 'inline' and giving
						// them layout
						div.innerHTML = "";
						div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";

						// inlineBlockNeedsLayout 表示将原本 display 为 block 的 DOM Element 设置为 disylay: inline 时
						// 是否与 inline 形式的 DOM Element 一致（ offsetWidth 为 2 ）
						// IE8 及之前的浏览器中为 true ， FireFox 中为 false
						support.inlineBlockNeedsLayout = (div.offsetWidth === 3);

						// Support: IE6
						// Check if elements with layout shrink-wrap their children
						div.style.display = "block";
						div.innerHTML = "<div></div>";
						div.firstChild.style.width = "5px";

						// shrinkWrapBlocks 表示内部 DOM Element 的样式是否会影响外部 DOM Element 的样式
						// IE 6 中为 true ， 多数浏览器中为 false
						support.shrinkWrapBlocks = (div.offsetWidth !== 3);

						if (support.inlineBlockNeedsLayout) {
							// Prevent IE 6 from affecting layout for positioned elements #11048
							// Prevent IE from shrinking the body in IE 7 mode #12869
							// Support: IE<8
							body.style.zoom = 1;
						}
					}

					// 销毁测试用例
					body.removeChild(container);

					// Null elements to avoid leaks in IE
					// 在 $(function(){})闭包内部，释放内存，防止内存泄漏
					container = div = tds = marginDiv = null;
				});

				// Null elements to avoid leaks in IE
				// 释放内存，防止内存泄漏
				all = select = fragment = opt = a = input = null;

				// 返回 support 对象
				return support;
			})({});


			// 下面一块是数据的存储
			// $.data() , $().data()
			// $.removeData() , $().removeData() 等

			// 匹配 {任意字符*} 或者 [任意字符*]
			var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
				// 匹配大写字母
				rmultiDash = /([A-Z])/g;

			// 数据存取方法	（pvt 表示此方法仅在内部使用）
			function internalData(elem, name, data, pvt /* Internal Use Only */ ) {
				// 检查 elem 元素是否可以设置数据
				if (!jQuery.acceptData(elem)) {
					// 如果参数 elem 不支持设置数据，则立即返回
					return;
				}

				var ret, thisCache,
					// 产生jQuery键值随机数 类似于： "11020056177454302087426"
					// jQuery.expando = (core_version + Math.random()).replace(/\D/g, "");
					// (core_version + Math.random()) 产生一串随机字符串 "1.10.20.6013481540139765"
					// replace(/\D/g, "") 去掉非数字
					internalKey = jQuery.expando,

					// We have to handle DOM nodes and JS objects differently because IE6-7
					// can't GC object references properly across the DOM-JS boundary
					// 元素的 nodeType
					isNode = elem.nodeType,

					// Only DOM nodes need the global jQuery cache; JS object data is
					// attached directly to the object so GC can occur automatically
					// 只有 DOM 元素需要全局的 jQuery 缓存 cache，
					// 而如果是 JS 对象，则直接将数据保存在这个对象上
					cache = isNode ? jQuery.cache : elem,

					// Only defining an ID for JS objects if its cache already exists allows
					// the code to shortcut on the same path as a DOM node with no cache
					// 添加的对象的 key 值，根据元素 elem 的 nodeType 判断
					// 如果是 Dom 元素，为 elem[internalKey]
					// 如果是 JS 对象，elem[internalKey] 存在则使用 internalKey ，反之，为 elem[internalKey]
					id = isNode ? elem[internalKey] : elem[internalKey] && internalKey;
				// 可以看到，上面的 cache 和 id 都是要根据 elem 的类型去判断
				// 而 internalData 方法，是适用于对 DOM（doc.getElementById类型）元素 和 JS（var obj={}）对象的



				// Avoid doing any more work than we need to when trying to get data on an
				// object that has no data at all
				// 如果是读取数据，且没有数据，则返回
				if ((!id || !cache[id] || (!pvt && !cache[id].data)) && data === undefined && typeof name === "string") {
					return;
				}

				// 如果 id 不存在的时候
				if (!id) {
					// Only DOM nodes need a new unique ID for each element since their data
					// ends up in the global cache
					// 只有当 elem 是 DOM 结点的时候，需要添加一个唯一的 ID
					if (isNode) {
						// jQuery.guid 全局计数器
						// 对于 DOM 结点，jQuery.uuid 会自加 1，并附加到 DOM 元素上
						id = elem[internalKey] = core_deletedIds.pop() || jQuery.guid++;
						// 不是 DOM 结点，是 JS 对象的话直接使用 internalKey
					} else {
						id = internalKey;
					}
				}

				// 如果 cache[id] 不存在
				if (!cache[id]) {
					// Avoid exposing jQuery metadata on plain JS objects when the object
					// is serialized using JSON.stringify
					// 对于 DOM 如果数据缓存对象不存在，则初始化为空对象 {}
					// 对于 JS 对象，设置方法 toJSON 为空函数，以避免在执行 JSON.stringify() 时暴露缓存数据
					// 如果一个对象定义了方法 toJSON(), JSON.stringify() 在序列化该对象时会调用这个方法来生成该对象的 JSON 元素
					cache[id] = isNode ? {} : {
						toJSON: jQuery.noop
					};
				}

				// An object can be passed to jQuery.data instead of a key/value pair; this gets
				// shallow copied over onto the existing cache
				// 如果参数 name 是对象或函数，则批量设置数据
				if (typeof name === "object" || typeof name === "function") {
					// pvt 表示方法使用于内部
					if (pvt) {
						// 对于内部数据，把参数 name 中的属性合并到 cache[id] 中
						cache[id] = jQuery.extend(cache[id], name);
					} else {
						// 对于自定义数据，把参数 name 中的属性合并到 cache[id].data 中
						cache[id].data = jQuery.extend(cache[id].data, name);
					}
				}

				// 这是缓存后的数据
				thisCache = cache[id];

				// jQuery data() is stored in a separate object inside the object's internal data
				// cache in order to avoid key collisions between internal data and user-defined
				// jQuery 库会使用 jQuery.data 方法存储一些内部使用的数据，比如 queue 队列，on 事件绑定等等，这些方法都需要存储空间来存储数据
				// 为了区分内部使用的数据和用户定义的数据，jQuery 将内部使用的数据直接存储在 cache[id] 里面，而用户定义的数据则存储在 cache[id].data 中
				// 如果是自定义数据 则将 thisCache 变量指向到 .data 对象中,如果为空则创建一个空对象
				// 这里是个重点，很简单的代码，这里改变了将数据存储的位置
				// 而且这里存储的位置影响到后文 internalRemoveData remove 的位置
				if (!pvt) {
					if (!thisCache.data) {
						thisCache.data = {};
					}

					thisCache = thisCache.data;
				}

				// 如果 data 不为空，设置键值对 key - value
				if (data !== undefined) {
					// camelCase 驼峰表示法
					thisCache[jQuery.camelCase(name)] = data;
				}

				// Check for both converted-to-camel and non-converted data property names
				// If a data property was specified
				// 如果参数 name 是 "string" 类型，则读取单个数据
				// 就是获取返回值了 internalData(elem,'key')
				if (typeof name === "string") {

					// First Try to find as-is property data
					// 先尝试读取参数 name 对应的数据
					ret = thisCache[name];

					// Test for null|undefined property data
					// 如果未取到，则把参数 name 转换为驼峰式再次尝试读取对应的数据
					if (ret == null) {

						// Try to find the camelCased property
						// camelCased -- 将 name 变为驼峰表示法
						ret = thisCache[jQuery.camelCase(name)];
					}
				} else {
					// 如果未传入参数 name , data ,则返回数据缓存对象
					ret = thisCache;
				}

				// 返回 ret 对象
				return ret;
			}

			// 数据对象的移除
			function internalRemoveData(elem, name, pvt) {
				// 检查 elem 元素是否可以设置数据，同上
				if (!jQuery.acceptData(elem)) {
					return;
				}

				var thisCache, i,
					// 元素的 nodeType
					isNode = elem.nodeType,

					// See jQuery.data for more information
					// 只有 DOM 元素需要全局的 jQuery 缓存 cache，
					// 而如果是 JS 对象，则直接将数据保存在这个对象上
					cache = isNode ? jQuery.cache : elem,

					// 添加的对象的 key 值，根据元素 elem 的 nodeType 判断
					// 如果是 Dom 元素，为 elem[internalKey]
					// 如果是 JS 对象，elem[internalKey] 存在则使用 internalKey ，反之，为 elem[internalKey]
					id = isNode ? elem[jQuery.expando] : jQuery.expando;

				// If there is already no cache entry for this object, there is no
				// purpose in continuing
				// 如果没有数据那也就不用删除了
				if (!cache[id]) {
					return;
				}

				// cache[id] != false
				// 有数据存在
				if (name) {

					// 缓存的位置，指向私有对象还是指向用户自定义的 data
					thisCache = pvt ? cache[id] : cache[id].data;

					// 有数据
					if (thisCache) {

						// Support array or space separated string names for data keys
						// 非数组
						if (!jQuery.isArray(name)) {

							// try the string as a key before any manipulation
							// 不是数组的话 则单独进行匹配删除
							if (name in thisCache) {
								name = [name];
							} else {

								// split the camel cased version by spaces unless a key with the spaces exists
								// 进行一次驼峰命名转换
								name = jQuery.camelCase(name);

								// 如果进行了驼峰命名转换的 name 存在于 thisCache中
								if (name in thisCache) {
									// 转化为数组形式
									name = [name];
								} else {
									// 没找到，使用空格分隔 name，也是转化为数组形式
									name = name.split(" ");
								}
							}
							// 如果是数组
						} else {
							// If "name" is an array of keys...
							// When data is initially created, via ("key", "val") signature,
							// keys will be converted to camelCase.
							// Since there is no way to tell _how_ a key was added, remove
							// both plain key and camelCase key. #12786
							// This will only penalize the array argument path.
							name = name.concat(jQuery.map(name, jQuery.camelCase));
						}

						// 经过上面的处理我们看到 jQ 兼容了很多形式上的参数
						// [key1,key2] "key1 key2" "key1" "key1-name"
						// 上边的一顿整理，到了这里都是一个数组，执行删除操作
						// 遍历删除
						i = name.length;
						while (i--) {
							delete thisCache[name[i]];
						}

						// If there is no data left in the cache, we want to continue
						// and let the cache object itself get destroyed
						// isEmptyDataObject 检测的是 JS 数据对象是否为空
						// isEmptyObject 检测一个普通对象是否是空对象
						// 如果数据对象中还有剩余数据则函数执行完毕，return 返回
						if (pvt ? !isEmptyDataObject(thisCache) : !jQuery.isEmptyObject(thisCache)) {
							return;
						}
					}
				}

				// 代码执行到这里的时候有两种情况：
				// 1.没有传name参数，意味着要删除所有数据
				// 2.按照传递的name参数删除后,没有数据了
				// See jQuery.data for more information
				// 如果是来删除自定义的数据
				if (!pvt) {
					//删除 cache[id].data
					delete cache[id].data;

					// Don't destroy the parent cache unless the internal data object
					// had been the only thing left in it
					// 删除后检测到数据缓存对象还有剩余数据则返回
					if (!isEmptyDataObject(cache[id])) {
						return;
					}
				}

				// 代码执行到这里时：
				// 1.删除的是系统级别数据,
				// 2.已经清空完了用户的缓存数据,而且数据缓存对象还不是空的时候

				// Destroy the cache
				// 销毁缓存
				// 该对象是dom元素
				if (isNode) {
					jQuery.cleanData([elem], true);

					// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
					/* jshint eqeqeq: false */
				} else if (jQuery.support.deleteExpando || cache != cache.window) {
					/* jshint eqeqeq: true */
					delete cache[id];

					// When all else fails, null
				} else {
					// 其他手段都失败了，将 cache[id] 置为 null
					cache[id] = null;
				}
			}

			// 下面的就是一些 jQuery 涉及数据存储的操作
			jQuery.extend({
				// 全局的缓存对象
				cache: {},

				// The following elements throw uncatchable exceptions if you
				// attempt to add expando properties to them.
				// 如果你尝试给以下元素添加扩展属性,将抛出“无法捕捉”的异常
				// 这里声明的几个元素对象是不给于数据绑定的
				// applet、embed 和 object 元素是不支持设置 expando 属性的，所以不支持 data 方法
				noData: {
					"applet": true,
					"embed": true,
					// Ban all objects except for Flash (which handle expandos)
					"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
				},

				// 检查对象是否已经存储了数据
				hasData: function(elem) {
					elem = elem.nodeType ? jQuery.cache[elem[jQuery.expando]] : elem[jQuery.expando];
					return !!elem && !isEmptyDataObject(elem);
				},

				// 给 elem（可是DOM，可以是JS对象）添加 key-value 为 name-data 的数据
				data: function(elem, name, data) {
					return internalData(elem, name, data);
				},

				// 移除 elem（可是DOM，可以是JS对象）上
				removeData: function(elem, name) {
					return internalRemoveData(elem, name);
				},

				// For internal use only.
				// 添加或读取一个仅供内部使用的数据
				_data: function(elem, name, data) {
					return internalData(elem, name, data, true);
				},

				// 删除内部使用的数据数据
				_removeData: function(elem, name) {
					return internalRemoveData(elem, name, true);
				},

				// A method for determining if a DOM node can handle the data expando
				// 检测一个属性是否可以绑定数据
				// nodeType = 1 -- Element
				// nodeType = 9 -- Document
				acceptData: function(elem) {
					// Do not set data on non-element because it will not be cleared (#8335).
					//
					if (elem.nodeType && elem.nodeType !== 1 && elem.nodeType !== 9) {
						return false;
					}

					// if(elem.nodeName){
					//   noData = jQuery.noData[elem.nodeName.toLowerCase()];
					// }
					var noData = elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()];

					// nodes accept data unless otherwise specified; rejection can be conditional
					return !noData || noData !== true && elem.getAttribute("classid") === noData;
				}
			});

			// 原型方法拓展
			// 挂载在 jQuery.fn 下的方法是所有 jQuery 对象都能使用的
			// 已经设置了 jQuery.data 为什么还要 jQuery.fn.data 呢
			// 因为 jQuery 的多样性，处理数据存储可以有如下两种方式：
			// $.data(divElement,'name','value') 或者是 $(divElement).data('name','value')
			jQuery.fn.extend({
				// 设置、读取自定义数据，解析HTML5属性data-
				data: function(key, value) {
					var attrs, name,
						data = null,
						i = 0,
						elem = this[0];

					// Special expections of .data basically thwart jQuery.access,
					// so implement the relevant behavior ourselves

					// Gets all values
					// 未传入参数的情况
					if (key === undefined) {
						// 如果参数 key 是 undefined , 即参数格式是.data(),
						// 则调用方法 jQuery.data(elem, name, data) 获取第一个匹配元素关联的自定义数据缓存对象，并返回
						// 这里的 this 指代的是调用 .data() 的对象
						if (this.length) {
							data = jQuery.data(elem);

							// 如果是 DOM 元素
							if (elem.nodeType === 1 && !jQuery._data(elem, "parsedAttrs")) {
								// 拿到 dom 元素的属性列表
								attrs = elem.attributes;
								// 遍历
								for (; i < attrs.length; i++) {
									// name为属性名
									name = attrs[i].name;

									// 先尝试是否有命名为 data-xxxx 的数据
									if (name.indexOf("data-") === 0) {
										// 取 data-xxxx 后面的 xxxx，即是
										// <div data-idName="123"></div> 取其属性 "data-idName" 其中的 idName
										name = jQuery.camelCase(name.slice(5));

										// 通过 dataAttr 解析 elem 元素身上的 html 标签 "data-" 的值
										dataAttr(elem, name, data[name]);
									}
								}
								jQuery._data(elem, "parsedAttrs", true);
							}
						}

						return data;
					}

					// 方法走到这里，说明传入了至少一个参数
					// 下面分情况处理

					// Sets multiple values
					// 如果参数 key 是对象，批量设置 key-value
					//
					// $.data(divElement,{
					//     'name': 'div',
					//     'age': 19
					// });
					//
					if (typeof key === "object") {
						return this.each(function() {
							jQuery.data(this, key);
						});
					}


					// 返回结果
					return arguments.length > 1 ?

						// Sets one value
						// 参数大于一个，那么必然是设置 key-value
						// 设置单个 key
						this.each(function() {
							jQuery.data(this, key, value);
						}) :

						// Gets one value
						// 参数为一个，那么就是获取数据 key
						// Try to fetch any internally stored data first
						// 首先应该尝试内部 jQuery.data 是有值，再解析 elem 元素身上的 html 标签 "data-" 的值
						// 因为 dataAttr(elem, key, data) 里，如果 data !== undefined 是直接返回 data的
						elem ? dataAttr(elem, key, jQuery.data(elem, key)) : null;
				},

				// 移除自定义数据
				removeData: function(key) {
					return this.each(function() {
						jQuery.removeData(this, key);
					});
				}
			});

			// 这里函数是用来解析 elem 元素身上的 html 标签 "data-" 的值
			// 如果传入的 data 对象有值的话,则直接返回不进行解析
			function dataAttr(elem, key, data) {
				// If nothing was found internally, try to fetch any
				// data from the HTML5 data-* attribute
				// 如果传入的 data 为空且 elem 是 DOM 元素
				if (data === undefined && elem.nodeType === 1) {

					// rmultiDash = /([A-Z])/g -- 匹配大写字母
					// key.replace(rmultiDash, "-$1").toLowerCase() 的意思是将驼峰表示法转化为斜杠表示，即 fontSzie --> font-size
					// 键名转换，这里的意思是将传入的 name 统一转化为 data-xxx-xxx 的形式
					var name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase();

					// 查找是否有该属性
					data = elem.getAttribute(name);

					// 找到了，且类型是 String
					if (typeof data === "string") {
						try {
							data = data === "true" ? true :
								data === "false" ? false :
								data === "null" ? null :
								// Only convert to a number if it doesn't change the string
								+data + "" === data ? +data :
								rbrace.test(data) ? jQuery.parseJSON(data) :
								data;
						} catch (e) {}

						// Make sure we set the data so it isn't changed later
						jQuery.data(elem, key, data);

						// 木有找到，赋值 undefined
					} else {
						data = undefined;
					}
				}

				// 返回结果
				return data;
			}

			// checks a cache object for emptiness
			// 检查数据缓存对象是否为空
			function isEmptyDataObject(obj) {
				var name;
				for (name in obj) {

					// if the public data object is empty, the private is still empty
					if (name === "data" && jQuery.isEmptyObject(obj[name])) {
						continue;
					}
					if (name !== "toJSON") {
						return false;
					}
				}

				return true;
			}
			// $.data() $().data() 结束
			// --------------------------------


			// jQuery 的队列管理
			// 这里拓展的 3 个方法是底层方法，是其内部调用的
			jQuery.extend({
				// 静态的底层方法实现入列
				// 方法重载，当只传入 queue(elem, type) 表示返回挂载在 elem 上名字为 type 的队列信息
				// 传入 queue(elem, type, data) 表示 data 入列
				queue: function(elem, type, data) {
					// 最后返回的队列信息
					var queue;

					// elem 存在
					if (elem) {
						// 拼接队列名，为
						// typequeue 或者 fxqueue，不传入队列名则默认为后者
						// 当是默认队列时，也就是 animate 操作时，队列名为 fxqueue
						type = (type || "fx") + "queue";

						// jQuery._data() 添加或读取一个仅供内部使用的数据
						// 这里是取出队列
						queue = jQuery._data(elem, type);

						// Speed up dequeue by getting out quickly if this is just a lookup
						// 如果有 data ，表示是将 data 入列，反之是取队列，返回上面已经取到的队列即可
						if (data) {
							// 查看 queue 是否已经存在，
							if (!queue || jQuery.isArray(data)) {
								// 不存在，新建一个队列，并将数据以数组形式 jQuery.makeArray(data)
								// 使用 jQuery._data 存储起来
								// jQuery.makeArray() -- 将类似数组或者不是数组的东西强制转换成一个数组然后返回
								queue = jQuery._data(elem, type, jQuery.makeArray(data));
							} else {
								// 已经有该队列了，直接 push 入列
								queue.push(data);
							}
						}

						// 返回队列
						// 这个方法主要注意方法的重载，当传入 data 和不传 data 的两种处理方法
						// 以及队列的存储使用了内部方法 $._data()
						return queue || [];
					}
				},

				// 出列，在匹配的元素上执行队列中的下一个函数
				dequeue: function(elem, type) {
					// 队列名，如果没有传入 type 参数，则赋予默认的队列名 “fx”，也就是 animate 操作
					type = type || "fx";

					// 使用 jQuery.queue(elem, type) 取到队列
					// 上文提到了，当 jQuery.queue(elem, type) 这种传两个参数（不带 data ）的时候，是 get 操队列作
					var queue = jQuery.queue(elem, type),

						// 队列长度，注意使用 jQuery.queue(elem, type) 返回的必然是个数组
						startLength = queue.length,

						// 弹出队列头部 data （FIFO，先入先出）
						fn = queue.shift(),

 						// hooks 其实是元素 elem 在数据缓存中的一个属性对象，
 						// 如果我们调用的是 $.dequeue(document,"q1") 的话，
 						// 那么属性对象名就是 q1queueHooks，
 						// 属性值是 {empty: jQuery.Callbacks("once memory").add(function() { data_priv.remove( elem, [ type + "queue", key ] );})}
 						// 因此你使用 hooks.empty，其实就是 q1queueHooks.empty
						hooks = jQuery._queueHooks(elem, type),

						// 预处理，触发当前队列的下一个函数
						next = function() {
							jQuery.dequeue(elem, type);
						};

					// If the fx queue is dequeued, always remove the progress sentinel
	        // 如果取到的是一个占位符，则舍弃再从队列取出一个
	        // 只有动画队列会设置占位符，表示动画正在执行中
					if (fn === "inprogress") {
						fn = queue.shift();
						startLength--;
					}

					// 是否有 fn
					if (fn) {

						// Add a progress sentinel to prevent the fx queue from being
						// automatically dequeued
						// 当是默认队列时，也就是 animate 操作时，就会先往队列的前面添加 inprogress 占位符
						if (type === "fx") {
							queue.unshift("inprogress");
						}

						// clear up the last queue stop function
						delete hooks.stop;

						// 执行 fn ，执行完之后，就会调用 next 方法，进行出队
						fn.call(elem, next, hooks);
					}

					// 当队列结束后，清理数据缓存中队列数据
					if (!startLength && hooks) {
						// 这里执行 fire 方法，就会触发 add 添加的方法，也就是data_priv.remove( elem, [ type + "queue", key ] );
						// 把缓存数据中的所有队列信息，以及 typequeueHooks 一起删除掉
						hooks.empty.fire();
					}
				},

				// not intended for public consumption - generates a queueHooks object, or returns the current one
				// 产生一个 queueHooks 对象，或者是返回当前有的那个
				_queueHooks: function(elem, type) {
					// key 名为 type + "queueHooks"
					var key = type + "queueHooks";

					// jQuery._data(elem, key) 存在，则直接返回
					// 否则，添加一个 keyqueueHooks 对象
					return jQuery._data(elem, key) || jQuery._data(elem, key, {
						empty: jQuery.Callbacks("once memory").add(function() {
							jQuery._removeData(elem, type + "queue");
							jQuery._removeData(elem, key);
						})
					});
				}
			});

			// jQuery原型方法，供 jQuery 对象使用
			// $().queue()
			jQuery.fn.extend({
				// 函数入队，返回队列
				// 注意方法的重载，传入 data 参数与否的区别（set or get）
				queue: function(type, data) {
					// 与 arguments.length 对比
					// arguments.length -- 传入参数的个数
					var setter = 2;

					// 如果 type 不是 "string" 类型
					// 也就是传入的是单个参数
					if (typeof type !== "string") {
						data = type;
						type = "fx";
						setter--;
					}

					// 传参数少于 setter
					// get -- 取队列
					if (arguments.length < setter) {
						return jQuery.queue(this[0], type);
					}

					// 运行到这里说明是 set 队列
					// 设置 data
					return data === undefined ?
						// data 为 undefine
						// 返回 this
						this :

						// data 不为 undefine
						// 遍历 this
						// 这里的是 this 指的是 jQuery 对象,是一个类数组对象,each 是遍历操作
						this.each(function() {
							// data 入列
							// 这里 this 指代单个 DOM 元素，为每个对象添加 data 到队列中
							var queue = jQuery.queue(this, type, data);

							// ensure a hooks for this queue
							jQuery._queueHooks(this, type);

              // 如果队列顶部不是占位符 inprogress 且 type 是 fx 则调用出队列
              // 这里运动的情况,如果没有动画函数正在执行,则立刻出队并执行动画函数
              // 这里看起来是不是有点像 callbacks 的 memory 模式呢 add 的同时被 fireWidth
							if (type === "fx" && queue[0] !== "inprogress") {
								jQuery.dequeue(this, type);
							}
						});
				},
				// 出列，执行队列中的下一个函数
				dequeue: function(type) {
					// 这里的是 this 指的是 jQuery 对象,是一个类数组对象,each 是遍历操作
					return this.each(function() {
						// 调用内部 jQuery.dequeue()
						jQuery.dequeue(this, type);
					});
				},
				// Based off of the plugin by Clint Helfers, with permission.
				// http://blindsignals.com/index.php/2009/07/jquery-delay/
				// 设置延迟出队
				// 第一个参数 time 是延迟的时间，第二个参数 type（队列的名字） 是哪个队列延迟
				// 举个例子说下 delay 方法的作用：
				// $(this).animate({width:300},2000).delay(2000).animate({left:300},2000)
				// 这个代码的意思是：第一个定时器函数执行结束后，会延迟两秒钟，才会执行第二个定时器函数
				delay: function(time, type) {
					// jQuery.fx.speeds = {slow: 600,fast: 200,_default: 400}
					// 意思就是说，你 delay 里面是否写了 slow ， fast ，或 _default
					// 如果是，就直接调用默认的值，如果传入的是数字，那么就只用数字
					time =  ? jQuery.fx.speeds[time] || time : time;

					// 是否传入了 type 参数
					// 没传入则使用默认 fx ，表示动画队列
					type = type || "fx";

					return this.queue(type, function(next, hooks) {
						// 延迟 time 秒，再进行出队
						// 意思就是 time 秒后，第二个定时器函数才会执行
						var timeout = setTimeout(next, time);
						// 这个方法会清除定时器，如果下文执行
						// next 方法就不会执行，也就不会出队了
						hooks.stop = function() {
							clearTimeout(timeout);
						};
					});
				},
				// 清除队列，使用的方法是置空队列
				// 传入数组，会覆盖队列的原数组
				clearQueue: function(type) {
					return this.queue(type || "fx", []);
				},
				// Get a promise resolved when queues of a certain type
				// are emptied (fx is the type by default)
				// type 是指队列的名字，如果此 type 的队列全部出队后，就会执行 done 添加的方法
				// 例子：
				// $(this).animate({width:300},2000).animate({left:300},2000);
				// $(this).promise().done(function(){alert(3)});
				// 这句代码的意思是，等上面两个定时器函数都执行结束后（因为他们默认处理的都是 fx 队列）。才会执行弹出 alert(3) 的函数
				promise: function(type, obj) {
					var tmp,
						count = 1,

						// 新建一个 deferred 对象
						defer = jQuery.Deferred(),
						elements = this,

						// 参数的长度
						i = this.length,
						resolve = function() {
							if (!(--count)) {
								defer.resolveWith(elements, [elements]);
							}
						};

					// 传入的是单个参数
					if (typeof type !== "string") {
						obj = type;
						type = undefined;
					}

					// 如果没传入队列名，就用 fx 默认队列
					type = type || "fx";

					// 执行一次
					while (i--) {
						// 去 queueHooks 缓存系统找跟这个元素有关的数据
						tmp = jQuery._data(elements[i], type + "queueHooks");

						// 如果存在，就证明队列中有定时器函数要执行
						// 进入if语句
						if (tmp && tmp.empty) {
							count++;
							tmp.empty.add(resolve);
						}
					}

					// 这里会先执行一次 resolve 方法，count--
					resolve();

					// 返回这个延迟对象
					// 如果感觉这个方法没看懂，需要回头先弄清楚 $.Callbacks() 和 $.Deferred() 对象的作用
					return defer.promise(obj);
				}
			});


			// 下面一块是关于 DOM元素 属性的操作 -- attr() 、prop() 、 val() 等
			var nodeHook, boolHook,
				// \t -- 制表符，Tab
				// \r -- 回车符
				// \n -- 换行符
				// \f -- 换页符
				rclass = /[\t\r\n\f]/g,

				// \r -- 回车符
				// 匹配单个回车
				rreturn = /\r/g,

				// 匹配一些 input 结构
				rfocusable = /^(?:input|select|textarea|button|object)$/i,

				// a | area
				rclickable = /^(?:a|area)$/i,

				// checked | selected
				ruseDefault = /^(?:checked|selected)$/i,

				// jQuery.support.getSetAttribute 测试是否支持 setAttribute 方法
				// setAttribute 用于在 IE6\7 下获取元素的单个 CSS 属性值
				getSetAttribute = jQuery.support.getSetAttribute,

				// 是否支持 input 的 getAttribute("value")
				getSetInput = jQuery.support.input;

			// jQuery 对象方法拓展
			jQuery.fn.extend({
				// 获取匹配的元素集合中的第一个元素的属性的值，或设置每一个匹配元素的一个或多个属性
				// 调用了 jQuery.access 方法实现
				attr: function(name, value) {
					return jQuery.access(this, jQuery.attr, name, value, arguments.length > 1);
				},

				// 清除某个属性（可批量）
				removeAttr: function(name) {
					return this.each(function() {
						// 调用了 jQuery.removeAttr()
						jQuery.removeAttr(this, name);
					});
				},

				// .prop() 方法只获得第一个匹配元素的属性值
				// 如果元素上没有该属性，或者如果没有匹配的元素。那么该方法会返回 undefined 值
				// 与 $.attr() 的区别
				// 具有 true 和 false 两个属性的属性，如 checked, selected 或者 disabled 使用 prop()，其他的使用 attr()
				prop: function(name, value) {
					return jQuery.access(this, jQuery.prop, name, value, arguments.length > 1);
				},

				// 为集合中匹配的元素删除一个属性
				removeProp: function(name) {
					name = jQuery.propFix[name] || name;

					// 遍历 this 集合
					return this.each(function() {
						// try/catch handles cases where IE balks (such as removing a property on window)
						// 若尝试移除 DOM 元素或 window 对象上一些内建的 属性（ property ） ，浏览器可能会产生错误
						// 如果真的那么做了，那么 jQuery 首先会将 属性（ property ） 设置成 undefined ，然后忽略任何浏览器产生的错误
						// 一般来说,只需要移除自定义的 属性（ property ） ，而不是移除内建的（原生的）属性（ property ）
						// 所以不要使用此方法来删除原生的属性（ property ）
						// 比如checked, disabled, 或者 selected ，这将完全移除该属性，一旦移除，不能再次被添加到元素上
						// 使用 .prop() 来设置这些属性设置为 false 代替
						try {
							this[name] = undefined;
							delete this[name];
						} catch (e) {}
					});
				},

				// 向被选元素添加一个或多个类
				addClass: function(value) {
					var classes, elem, cur, clazz, j,
						i = 0,
						// 要操作的被选元素集合
						len = this.length,
						// 检测value是否为字符串
						proceed = typeof value === "string" && value;

					// 如果 value 是函数
					if (jQuery.isFunction(value)) {
						// 那么逐个遍历现有元素，递归addClass方法
						return this.each(function(j) {
							jQuery(this).addClass(value.call(this, j, this.className));
						});
					}

					// 如果是个字符串，那就执行正真的添加
					if (proceed) {
						// The disjunction here is for better compressibility (see removeClass)
						// core_rnotwhite = /\S+/g ，匹配任意不是空白符的字符串
						// 将 value 用空格分开成一个数组，相当于 classes = (value || "").split("/\s+/")
						classes = (value || "").match(core_rnotwhite) || [];

						// 遍历被选元素集合
						for (; i < len; i++) {
							elem = this[i];

							// 检测是否为 HTMLElement
							// nodeType === 1 --  Element
							cur = elem.nodeType === 1 && (elem.className ?
								// rclass = /[\t\r\n\f]/g
								// 去掉换行换页什么的，两边加上空格，防止出错
								(" " + elem.className + " ").replace(rclass, " ") :
								// 如果没有class的话，那就等于一个空格
								" "
							);

							if (cur) {
								j = 0;
								// 遍历所有的classes
								while ((clazz = classes[j++])) {
									// 当前元素没有要添加的 Class，才加入
									if (cur.indexOf(" " + clazz + " ") < 0) {
										cur += clazz + " ";
									}
								}
								// 设置 className，去掉首尾空格
								elem.className = jQuery.trim(cur);

							}
						}
					}

					// 返回 this，支持链式操作
					return this;
				},

				// 移除当前元素集合指定 Class
				removeClass: function(value) {
					var classes, elem, cur, clazz, j,
						i = 0,
						len = this.length,
						proceed = arguments.length === 0 || typeof value === "string" && value;

					// 传入的如果是方法，遍历移除
					if (jQuery.isFunction(value)) {
						return this.each(function(j) {
							jQuery(this).removeClass(value.call(this, j, this.className));
						});
					}

					// 传入的是字符串
					if (proceed) {
						// The disjunction here is for better compressibility (see removeClass)
						// core_rnotwhite = /\S+/g ，匹配任意不是空白符的字符串
						// 将 value 用空格分开成一个数组，相当于 classes = (value || "").split("/\s+/")
						classes = (value || "").match(core_rnotwhite) || [];

						for (; i < len; i++) {
							elem = this[i];
							// This expression is here for better compressibility (see addClass)
							// 检测是否为 HTMLElement
							cur = elem.nodeType === 1 && (elem.className ?
								// 去掉换行换页什么的，两边加上空格，防止出错
								(" " + elem.className + " ").replace(rclass, " ") :
								""
							);

							// cur 不为空
							if (cur) {
								j = 0;
								// 遍历 classes ，如果有则删除
								while ((clazz = classes[j++])) {
									// Remove *all* instances
									while (cur.indexOf(" " + clazz + " ") >= 0) {
										cur = cur.replace(" " + clazz + " ", " ");
									}
								}
								// 重置 className
								elem.className = value ? jQuery.trim(cur) : "";
							}
						}
					}

					// 返回 this，支持链式操作
					return this;
				},

		    // 设置或移除被选元素的一个或多个类进行切换
		    // 该方法检查每个元素中指定的类。如果不存在则添加类，如果已设置则删除之。这就是所谓的切换效果。
		    // @param value String:类名  Function:规定返回需要添加或删除的一个或多个类名的函数 $(selector).toggleClass(function(index,class,switch),switch)
		    // @param stateVal 规定是否添加 (true) 或移除 (false) 类为 true 不存在,则添加。为 false ,已存在则删除
		    // @returns {*}
				toggleClass: function(value, stateVal) {
					// 传入类名类型
					var type = typeof value;

					// 规定是否添加 (true) 或移除 (false) 类为 true 不存在,则添加。为 false ,已存在则删除
					if (typeof stateVal === "boolean" && type === "string") {
						return stateVal ? this.addClass(value) : this.removeClass(value);
					}

					// 如果 value 的类型是 function
					if (jQuery.isFunction(value)) {
						return this.each(function(i) {
							jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
						});
					}

					// 遍历 this 元素合集
					return this.each(function() {
						// 如果是传入单个参数，且参数是 string 类型
						if (type === "string") {
							// toggle individual class names
							var className,
								i = 0,
								self = jQuery(this),
								// core_rnotwhite = /\S+/g ，匹配任意不是空白符的字符串
								// 将 value 用空格分开成一个数组，相当于 classes = (value || "").split("/\s+/")
								classNames = value.match(core_rnotwhite) || [];

							// 如果传入了多个 Class ，遍历class
							while ((className = classNames[i++])) {
								// check each className given, space separated list
								// 查询是否已经有当前遍历到的这个 Class，有则删除，
								if (self.hasClass(className)) {
									self.removeClass(className);
								// 反之添加
								} else {
									self.addClass(className);
								}
							}

						// Toggle whole class name
						// 如果只传入了第二个参数 || 或者value是false
            // 则对整个 class 字符串执行设置和取消
						} else if (type === core_strundefined || type === "boolean") {
							if (this.className) {
								// store className if set
								jQuery._data(this, "__className__", this.className);
							}

							// If the element has a class name or if we're passed "false",
							// then remove the whole classname (if there was one, the above saved it).
							// Otherwise bring back whatever was previously saved (if anything),
							// falling back to the empty string if nothing was stored.
							this.className = this.className || value === false ? "" : jQuery._data(this, "__className__") || "";
						}
					});
				},

				// 在元素的 class 属性上是否存在指定的 selector
				// 由于可能是在元素的集合上查找，有一项存在就返回 true,否则就返回 false
				hasClass: function(selector) {
					// 传入的 selector 首尾添加空格
					var className = " " + selector + " ",
						i = 0,
						l = this.length;

					// 遍历元素的合集
					for (; i < l; i++) {
						// 首先确保 this 是 Element 元素
						// 并且 selector 存在于 this 的 ClassName 中
						if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) >= 0) {
							return true;
						}
					}

					// 否则返回 false
					return false;
				},

				// 获取匹配的元素集合中第一个元素的当前值
				// 或设置匹配的元素集合中每个元素的值
				// val 方法主要做的就是对于 option 和 select 的兼容性的处理，
				// 正常情况下直接取 Element.vlaue 进行操作，亮点依旧在钩子技术和参数重载上
				val: function(value) {
					var ret, hooks, isFunction,
						elem = this[0];

					// 如果没有传入参数
					if (!arguments.length) {
						// elem = this[0]
						if (elem) {
							//
							hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()];

							if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
								return ret;
							}

							ret = elem.value;

							return typeof ret === "string" ?
								// handle most common string cases
								ret.replace(rreturn, "") :
								// handle cases where value is null/undef or number
								ret == null ? "" : ret;
						}

						return;
					}

					// 判断 value 是否是函数
					isFunction = jQuery.isFunction(value);

					return this.each(function(i) {
						var val;

						if (this.nodeType !== 1) {
							return;
						}

						if (isFunction) {
							val = value.call(this, i, jQuery(this).val());
						} else {
							val = value;
						}

						// Treat null/undefined as ""; convert numbers to string
						if (val == null) {
							val = "";
						} else if (typeof val === "number") {
							val += "";
						} else if (jQuery.isArray(val)) {
							val = jQuery.map(val, function(value) {
								return value == null ? "" : value + "";
							});
						}

						hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];

						// If set returns undefined, fall back to normal setting
						if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
							this.value = val;
						}
					});
				}
			});

			jQuery.extend({
				// 定义一些钩子函数，用于处理一些特殊情况，避免在函数中使用大量的 else if
				// val钩子
				valHooks: {
					// 当你获取 option 元素的 value 属性值时，
					// 如果没有对此 option 显式设置 value 值，获取到的值是 option 的 text ，也就是 option 的文本
					// 但是 IE6-7 下获取到的值是""
					option: {
						get: function(elem) {
							// Use proper attribute retrieval(#6932, #12072)
							// 在 IE6-7 下，val 是一个 object
							var val = jQuery.find.attr(elem, "value");

							// 兼容 IE 的处理
							return val != null ?
								val :
								elem.text;
						}
					},
					select: {
						// 当 select 是单选时，获取的 value 值，就是你选择的那个 option 的值，
						// 如果是多选，获取值时，就是你选择的所有 option 的值的数组形式
						get: function(elem) {
							var value, option,
								// select 的所有 option 的集合
								options = elem.options,
								// 当前选择的 option 的索引值
								index = elem.selectedIndex,
								one = elem.type === "select-one" || index < 0,
								// 如果是单选框，values 为 null，如果是多选，values = []
								values = one ? null : [],
								max = one ? index + 1 : options.length,
								i = index < 0 ?
								max :
								one ? index : 0;

							// Loop through all the selected options
							// 循环所有 options 选项
							// 单选，循环一次，多选，循环多次
							for (; i < max; i++) {
								// 拿到当前循环到的项
								option = options[i];

								// oldIE doesn't update selected after form reset (#2551)
								// IE6-9 下，点击 reset 按钮时，option 的 selected 不会恢复默认值
								// 其他浏览器会恢复所有 option 的 selected 的默认值
								if ((option.selected || i === index) &&
									// Don't return options that are disabled or in a disabled optgroup
									// jQuery.support.optDisabled --
									// 如果 option 被设置了 disabled，那么获取 option 的值时，是获取不到的
									(jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
									// 如果 option 的父元素被设置了 disabled，并且父元素是 optgroup，那么也获取不到
									(!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup"))) {

									// Get the specific value for the option
									value = jQuery(option).val();

									// We don't need an array for one selects
									if (one) {
										return value;
									}

									// Multi-Selects return an array
									values.push(value);
								}
							}

							return values;
						},

						set: function(elem, value) {
							var optionSet, option,
								options = elem.options,
								// 把 value 转换成数组
								values = jQuery.makeArray(value),
								i = options.length;

							while (i--) {
								option = options[i];
								// 判断 select 的子元素 option 的 value 是否在 values 数组中，
								// 如果在，就会把这个 option 选中
								if ((option.selected = jQuery.inArray(jQuery(option).val(), values) >= 0)) {
									optionSet = true;
								}
							}

							// force browsers to behave consistently when non-matching value is set
							// 如果 select 下的 option 的 value 值没有一个等于 value 的
							// 那么就让 select 的选择索引值赋为 -1，让 select 框中没有任何值
							if (!optionSet) {
								elem.selectedIndex = -1;
							}
							return values;
						}
					}
				},

				attr: function(elem, name, value) {
					var hooks, ret,
						nType = elem.nodeType;

					// don't get/set attributes on text, comment and attribute nodes
					if (!elem || nType === 3 || nType === 8 || nType === 2) {
						return;
					}

					// Fallback to prop when attributes are not supported
					if (typeof elem.getAttribute === core_strundefined) {
						return jQuery.prop(elem, name, value);
					}

					// All attributes are lowercase
					// Grab necessary hook if one is defined
					if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
						// 转化为小写
						name = name.toLowerCase();
						// 获取相应的 hook, 这里主要是获取 attrHooks,
						hooks = jQuery.attrHooks[name] ||
							(jQuery.expr.match.bool.test(name) ? boolHook : nodeHook);
					}

					// 如果 value 存在，则设置对应属性值为 value
					if (value !== undefined) {

						if (value === null) {
							// value 为null，则删除该属性
							jQuery.removeAttr(elem, name);

						// 如果hooks存在, 且 hooks 中有 set 属性，且不为 xml，则执行该 set 方法
            // 如果有返回值，则返回该返回值
						} else if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
							return ret;

						// 处理普通情况的属性赋值
						} else {
							elem.setAttribute(name, value + "");
							return value;
						}

					// 如果 value 存在，则取出该属性对应的值
        	// 与上述钩子一样，处理特殊情况
					} else if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
						return ret;

					// 处理普通情况
					} else {
						ret = jQuery.find.attr(elem, name);

						// Non-existent attributes return null, we normalize to undefined
						return ret == null ?
							undefined :
							ret;
					}
				},

				removeAttr: function(elem, value) {
					var name, propName,
						i = 0,
						attrNames = value && value.match(core_rnotwhite);

					if (attrNames && elem.nodeType === 1) {
						while ((name = attrNames[i++])) {
							propName = jQuery.propFix[name] || name;

							// Boolean attributes get special treatment (#10870)
							if (jQuery.expr.match.bool.test(name)) {
								// Set corresponding property to false
								if (getSetInput && getSetAttribute || !ruseDefault.test(name)) {
									elem[propName] = false;
									// Support: IE<9
									// Also clear defaultChecked/defaultSelected (if appropriate)
								} else {
									elem[jQuery.camelCase("default-" + name)] =
										elem[propName] = false;
								}

								// See #9699 for explanation of this approach (setting first, then removal)
							} else {
								jQuery.attr(elem, name, "");
							}

							elem.removeAttribute(getSetAttribute ? name : propName);
						}
					}
				},
				// 意思就是在使用attr('type',??)设置的时候就会调用这个 hooks，
				// 用于处理 IE6-9 input 属性不可写入的问题
				// 实现 attr 属性处理相关特殊情况
				attrHooks: {
					// 这个钩子只支持 type 和 value 属性的
					// 意思就是在使用 attr('type',??) 设置的时候就会调用这个hooks
					// 用于处理 IE6-9 input 属性不可写入的问题
					type: {
						// type 是只有 set 的
						set: function(elem, value) {
							if (!jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input")) {
								// Setting the type on a radio button after the value resets the value in IE6-9
								// Reset value to default in case type is set after value during creation
								var val = elem.value;
								elem.setAttribute("type", value);
								if (val) {
									elem.value = val;
								}
								return value;
							}
						}
					}
				},

				propFix: {
					"for": "htmlFor",
					"class": "className"
				},

				prop: function(elem, name, value) {
					var ret, hooks, notxml,
						nType = elem.nodeType;

					// don't get/set properties on text, comment and attribute nodes
					if (!elem || nType === 3 || nType === 8 || nType === 2) {
						return;
					}

					notxml = nType !== 1 || !jQuery.isXMLDoc(elem);

					if (notxml) {
						// Fix name and attach hooks
						name = jQuery.propFix[name] || name;
						hooks = jQuery.propHooks[name];
					}

					if (value !== undefined) {
						return hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined ?
							ret :
							(elem[name] = value);

					} else {
						return hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null ?
							ret :
							elem[name];
					}
				},

				// $().prop() 方法的钩子
				propHooks: {
					//
					tabIndex: {
						get: function(elem) {
							// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
							// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
							// Use proper attribute retrieval(#12072)
							var tabindex = jQuery.find.attr(elem, "tabindex");

							return tabindex ?
								parseInt(tabindex, 10) :
								rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href ?
								0 :
								-1;
						}
					}
				}
			});

			// Hooks for boolean attributes
			//
			boolHook = {
				set: function(elem, value, name) {
					if (value === false) {
						// Remove boolean attributes when set to false
						jQuery.removeAttr(elem, name);
					} else if (getSetInput && getSetAttribute || !ruseDefault.test(name)) {
						// IE<8 needs the *property* name
						elem.setAttribute(!getSetAttribute && jQuery.propFix[name] || name, name);

						// Use defaultChecked and defaultSelected for oldIE
					} else {
						elem[jQuery.camelCase("default-" + name)] = elem[name] = true;
					}

					return name;
				}
			};

			jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function(i, name) {
				var getter = jQuery.expr.attrHandle[name] || jQuery.find.attr;

				jQuery.expr.attrHandle[name] = getSetInput && getSetAttribute || !ruseDefault.test(name) ?
					function(elem, name, isXML) {
						var fn = jQuery.expr.attrHandle[name],
							ret = isXML ?
							undefined :
							/* jshint eqeqeq: false */
							(jQuery.expr.attrHandle[name] = undefined) !=
							getter(elem, name, isXML) ?

							name.toLowerCase() :
							null;
						jQuery.expr.attrHandle[name] = fn;
						return ret;
					} :
					function(elem, name, isXML) {
						return isXML ?
							undefined :
							elem[jQuery.camelCase("default-" + name)] ?
							name.toLowerCase() :
							null;
					};
			});

			// fix oldIE attroperties
			if (!getSetInput || !getSetAttribute) {
				jQuery.attrHooks.value = {
					set: function(elem, value, name) {
						if (jQuery.nodeName(elem, "input")) {
							// Does not return so that setAttribute is also used
							elem.defaultValue = value;
						} else {
							// Use nodeHook if defined (#1954); otherwise setAttribute is fine
							return nodeHook && nodeHook.set(elem, value, name);
						}
					}
				};
			}

			// IE6/7 do not support getting/setting some attributes with get/setAttribute
			if (!getSetAttribute) {

				// Use this for any attribute in IE6/7
				// This fixes almost every IE6/7 issue
				nodeHook = {
					set: function(elem, value, name) {
						// Set the existing or create a new attribute node
						var ret = elem.getAttributeNode(name);
						if (!ret) {
							elem.setAttributeNode(
								(ret = elem.ownerDocument.createAttribute(name))
							);
						}

						ret.value = value += "";

						// Break association with cloned elements by also using setAttribute (#9646)
						return name === "value" || value === elem.getAttribute(name) ?
							value :
							undefined;
					}
				};
				jQuery.expr.attrHandle.id = jQuery.expr.attrHandle.name = jQuery.expr.attrHandle.coords =
					// Some attributes are constructed with empty-string values when not defined
					function(elem, name, isXML) {
						var ret;
						return isXML ?
							undefined :
							(ret = elem.getAttributeNode(name)) && ret.value !== "" ?
							ret.value :
							null;
					};
				jQuery.valHooks.button = {
					get: function(elem, name) {
						var ret = elem.getAttributeNode(name);
						return ret && ret.specified ?
							ret.value :
							undefined;
					},
					set: nodeHook.set
				};

				// Set contenteditable to false on removals(#10429)
				// Setting to empty string throws an error as an invalid value
				jQuery.attrHooks.contenteditable = {
					set: function(elem, value, name) {
						nodeHook.set(elem, value === "" ? false : value, name);
					}
				};

				// Set width and height to auto instead of 0 on empty string( Bug #8150 )
				// This is for removals
				jQuery.each(["width", "height"], function(i, name) {
					jQuery.attrHooks[name] = {
						set: function(elem, value) {
							if (value === "") {
								elem.setAttribute(name, "auto");
								return value;
							}
						}
					};
				});
			}


			// Some attributes require a special call on IE
			// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
			if (!jQuery.support.hrefNormalized) {
				// href/src property should get the full normalized URL (#10299/#12915)
				jQuery.each(["href", "src"], function(i, name) {
					jQuery.propHooks[name] = {
						get: function(elem) {
							return elem.getAttribute(name, 4);
						}
					};
				});
			}

			if (!jQuery.support.style) {
				jQuery.attrHooks.style = {
					get: function(elem) {
						// Return undefined in the case of empty string
						// Note: IE uppercases css property names, but if we were to .toLowerCase()
						// .cssText, that would destroy case senstitivity in URL's, like in "background"
						return elem.style.cssText || undefined;
					},
					set: function(elem, value) {
						return (elem.style.cssText = value + "");
					}
				};
			}

			// Safari mis-reports the default selected property of an option
			// Accessing the parent's selectedIndex property fixes it
			if (!jQuery.support.optSelected) {
				jQuery.propHooks.selected = {
					get: function(elem) {
						var parent = elem.parentNode;

						if (parent) {
							parent.selectedIndex;

							// Make sure that it also works with optgroups, see #5701
							if (parent.parentNode) {
								parent.parentNode.selectedIndex;
							}
						}
						return null;
					}
				};
			}

			jQuery.each([
				"tabIndex",
				"readOnly",
				"maxLength",
				"cellSpacing",
				"cellPadding",
				"rowSpan",
				"colSpan",
				"useMap",
				"frameBorder",
				"contentEditable"
			], function() {
				jQuery.propFix[this.toLowerCase()] = this;
			});

			// IE6/7 call enctype encoding
			if (!jQuery.support.enctype) {
				jQuery.propFix.enctype = "encoding";
			}

			// Radios and checkboxes getter/setter
			jQuery.each(["radio", "checkbox"], function() {
				jQuery.valHooks[this] = {
					set: function(elem, value) {
						if (jQuery.isArray(value)) {
							return (elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0);
						}
					}
				};
				if (!jQuery.support.checkOn) {
					jQuery.valHooks[this].get = function(elem) {
						// Support: Webkit
						// "" is returned instead of "on" if a value isn't specified
						return elem.getAttribute("value") === null ? "on" : elem.value;
					};
				}
			});
			var rformElems = /^(?:input|select|textarea)$/i,
				rkeyEvent = /^key/,
				rmouseEvent = /^(?:mouse|contextmenu)|click/,
				rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
				rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

			function returnTrue() {
				return true;
			}

			function returnFalse() {
				return false;
			}

			function safeActiveElement() {
				try {
					return document.activeElement;
				} catch (err) {}
			}

			/*
			 * Helper functions for managing events -- not part of the public interface.
			 * Props to Dean Edwards' addEvent library for many of the ideas.
			 */
			// 事件操作相关处理模块
			jQuery.event = {

				//
				global: {},

				// 事件的 add 方法
				// jQuery 从 1.2.3 版本引入数据缓存系统，贯穿内部，为整个体系服务，事件体系也引入了这个缓存机制
				add: function(elem, types, handler, data, selector) {
					var tmp, events, t, handleObjIn,
						special, eventHandle, handleObj,
						handlers, type, namespaces, origType,
						// 添加或读取一个仅供内部使用的数据缓存
						// 第一步：获取数据缓存
						elemData = jQuery._data(elem);

					// Don't attach events to noData or text/comment nodes (but allow plain objects)
					// 为空返回
					if (!elemData) {
						return;
					}

					// Caller can pass in an object of custom data in lieu of the handler
        	// 这里在之前一直不明白为什么要这么做，原因就是这里的 handler 可以是一个function,即我们平时所说的绑定的事件方法
        	// 同时也可以是一个事件对象，也就是下面所说的 handleObj ,那么如果是在 jQuery 的内部是可以传递一个事件对象过来的
					if (handler.handler) {
						handleObjIn = handler;
						handler = handleObjIn.handler;
						selector = handleObjIn.selector;
					}

					// Make sure that the handler has a unique ID, used to find/remove it later
					// 生成唯一的 guid
					// 第二步：创建编号
					if (!handler.guid) {
						handler.guid = jQuery.guid++;
					}

					// Init the element's event structure and main handler, if this is the first
					// 如果缓存数据中没有 events 数据，第一次调用的时候
					// 第三步：分解事件名与句柄
					if (!(events = elemData.events)) {
						// 则初始化events
						events = elemData.events = {};
					}

					// 如果缓存数据中没有 handle 数据
					if (!(eventHandle = elemData.handle)) {
						// 定义事件处理函数
						eventHandle = elemData.handle = function(e) {
							// Discard the second event of a jQuery.event.trigger() and
							// when an event is called after a page has unloaded
							// 取消jQuery.event.trigger第二次触发事件
            	// 以及装卸后的事件
							return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
								// jQuery.event.dispatch -- 分派（执行）事件处理函数
								jQuery.event.dispatch.apply(eventHandle.elem, arguments) :
								undefined;
						};
						// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
						// 定义事件处理器对应的元素，用于防止 IE 非原生事件中的内存泄露
						eventHandle.elem = elem;
					}
					// events，eventHandle 都是 elemData 缓存对象内部的，可见
					// 在 elemData 中有两个重要的属性
					// 一个是 events，是 jQuery 内部维护的事件列队
					// 一个是 handle，是实际绑定到 elem 中的事件处理函数
					// 之后的代码无非就是对这 2 个对象的筛选，分组，填充

					// Handle multiple events separated by a space
					// 事件可能是通过空格键分隔的字符串，所以将其变成字符串数组
					// core_rnotwhite = /\S+/g;  -- 匹配任意不是空白符的字符
					// 第四步: 填充事件名与相应事件句柄
					types = (types || "").match(core_rnotwhite) || [""];
					t = types.length;

					// 遍历所有事件
					// 多事件处理
					// 如果是多事件分组的情况 jQuery(...).bind("mouseover mouseout", fn);
					// 事件可能是通过空格键分隔的字符串，所以将其变成字符串数组
					while (t--) {
						// 尝试取出事件的 namespace，如aaa.bbb.ccc
						tmp = rtypenamespace.exec(types[t]) || [];
						// 取出事件，如aaa
						type = origType = tmp[1];
						// 取出事件命名空间，如bbb.ccc，并根据"."分隔成数组
						// 增加命名空间处理
						// 事件名称可以添加指定的 event namespaces（命名空间） 来简化删除或触发事件。例如，
						// "click.myPlugin.simple" 为 click 事件同时定义了两个命名空间 myPlugin 和 simple。通过上述方法绑定的 click 事件处理，可以用
						// .off("click.myPlugin") 或 .off("click.simple") 删除绑定到相应元素的 Click 事件处理程序，而不会干扰其他绑定在该元素上的“click（点击）” 事件。命名空间类似CSS类，因为它们是不分层次的;只需要有一个名字相匹配即可。
						// 以下划线开头的名字空间是供 jQuery 使用的。
						namespaces = (tmp[2] || "").split(".").sort();

						// There *must* be a type, no attaching namespace-only handlers
						if (!type) {
							continue;
						}

						// If event changes its type, use the special event handlers for the changed type
						// 事件是否会改变当前状态，如果会则使用特殊事件
						special = jQuery.event.special[type] || {};

						// If selector defined, determine special event api type, otherwise given type
						// 根据是否已定义 selector ，决定使用哪个特殊事件 api ，如果没有非特殊事件，则用 type
						type = (selector ? special.delegateType : special.bindType) || type;

						// Update special based on newly reset type
						// 根据状态改变后的特殊事件
						special = jQuery.event.special[type] || {};

						// handleObj is passed to all event handlers
						// 组装用于特殊事件处理的对象
						handleObj = jQuery.extend({
							type: type,
							origType: origType,
							data: data,
							handler: handler,
							guid: handler.guid,
							selector: selector,
							needsContext: selector && jQuery.expr.match.needsContext.test(selector),
							namespace: namespaces.join(".")
						}, handleObjIn);

						// Init the event handler queue if we're the first
						// 初始化事件处理列队，如果是第一次使用
						if (!(handlers = events[type])) {
							handlers = events[type] = [];
							handlers.delegateCount = 0;

							// Only use addEventListener/attachEvent if the special events handler returns false
							if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
								// Bind the global event handler to the element
								// 关键在这里：底层的绑定接口
								if (elem.addEventListener) {
									// false 是在冒泡阶段触发
									elem.addEventListener(type, eventHandle, false);
								// 兼容IE8-
								} else if (elem.attachEvent) {
									elem.attachEvent("on" + type, eventHandle);
								}
							}
						}

						// 通过特殊事件 add 处理事件
						// 什么时候要用到自定义函数？
						// 有些浏览器并不兼容某类型的事件，如IE6～8不支持hashchange事件，你无法通过jQuery(window).bind('hashchange', callback)来绑定这个事件，这个时候你就可以通过jQuery自定义事件接口来模拟这个事件，做到跨浏览器兼容。
						if (special.add) {
							// 添加事件
							special.add.call(elem, handleObj);
							// 设置处理函数的 id
							if (!handleObj.handler.guid) {
								handleObj.handler.guid = handler.guid;
							}
						}

						// Add to the element's handler list, delegates in front
						// 将事件处理函数推入处理列表
						if (selector) {
							// 冒泡标记
							handlers.splice(handlers.delegateCount++, 0, handleObj);
						} else {
							handlers.push(handleObj);
						}

						// Keep track of which events have ever been used, for event optimization
						// 表示事件曾经使用过，用于事件优化
						jQuery.event.global[type] = true;
					}

					// Nullify elem to prevent memory leaks in IE
					// 设置为null避免IE中循环引用导致的内存泄露
					elem = null;
				},

				// Detach an event or set of events from an element
				// 移除事件是主要方法
				remove: function(elem, types, handler, selector, mappedTypes) {
					var j, handleObj, tmp,
						origCount, t, events,
						special, handlers, type,
						namespaces, origType,
						elemData = jQuery.hasData(elem) && jQuery._data(elem);

					if (!elemData || !(events = elemData.events)) {
						return;
					}

					// Once for each type.namespace in types; type may be omitted
					types = (types || "").match(core_rnotwhite) || [""];
					t = types.length;
					while (t--) {
						tmp = rtypenamespace.exec(types[t]) || [];
						type = origType = tmp[1];
						namespaces = (tmp[2] || "").split(".").sort();

						// Unbind all events (on this namespace, if provided) for the element
						if (!type) {
							for (type in events) {
								jQuery.event.remove(elem, type + types[t], handler, selector, true);
							}
							continue;
						}

						special = jQuery.event.special[type] || {};
						type = (selector ? special.delegateType : special.bindType) || type;
						handlers = events[type] || [];
						tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");

						// Remove matching events
						origCount = j = handlers.length;
						while (j--) {
							handleObj = handlers[j];

							if ((mappedTypes || origType === handleObj.origType) &&
								(!handler || handler.guid === handleObj.guid) &&
								(!tmp || tmp.test(handleObj.namespace)) &&
								(!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
								handlers.splice(j, 1);

								if (handleObj.selector) {
									handlers.delegateCount--;
								}
								if (special.remove) {
									special.remove.call(elem, handleObj);
								}
							}
						}

						// Remove generic event handler if we removed something and no more handlers exist
						// (avoids potential for endless recursion during removal of special event handlers)
						if (origCount && !handlers.length) {
							if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
								jQuery.removeEvent(elem, type, elemData.handle);
							}

							delete events[type];
						}
					}

					// Remove the expando if it's no longer used
					if (jQuery.isEmptyObject(events)) {
						delete elemData.handle;

						// removeData also checks for emptiness and clears the expando if empty
						// so use it instead of delete
						jQuery._removeData(elem, "events");
					}
				},

				// jQuery触发事件的核心方法是 jQuery.event.trigger。
				// 它提供给客户端程序员使用的触发事件方法有两个：$.fn.trigger / $.fn.triggerHandler
				trigger: function(event, data, elem, onlyHandlers) {
					var handle, ontype, cur,
						bubbleType, special, tmp, i,
						eventPath = [elem || document],
						// core_hasOwn = [].hasOwnProperty
						type = core_hasOwn.call(event, "type") ? event.type : event,
						namespaces = core_hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];

					cur = tmp = elem = elem || document;

					// Don't do events on text and comment nodes
					// nodeType = 3 -- Text
					// nodeType = 8 -- Comment
					if (elem.nodeType === 3 || elem.nodeType === 8) {
						return;
					}

					// focus/blur morphs to focusin/out; ensure we're not firing them right now
					// focus/blur 将变形为 focusin/focusout 另行处理
					if (rfocusMorph.test(type + jQuery.event.triggered)) {
						return;
					}

					// 对具有命名空间事件的处理
					if (type.indexOf(".") >= 0) {
						// Namespaced trigger; create a regexp to match event type in handle()
						namespaces = type.split(".");
						type = namespaces.shift();
						namespaces.sort();
					}

					//
					ontype = type.indexOf(":") < 0 && "on" + type;

					// Caller can pass in a jQuery.Event object, Object, or just an event type string
					//
					event = event[jQuery.expando] ?
						event :
						new jQuery.Event(type, typeof event === "object" && event);

					// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
					event.isTrigger = onlyHandlers ? 2 : 3;
					event.namespace = namespaces.join(".");
					event.namespace_re = event.namespace ?
						new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") :
						null;

					// Clean up the event in case it is being reused
					event.result = undefined;
					if (!event.target) {
						event.target = elem;
					}

					// Clone any incoming data and prepend the event, creating the handler arg list
					data = data == null ?
						[event] :
						jQuery.makeArray(data, [event]);

					// Allow special events to draw outside the lines
					special = jQuery.event.special[type] || {};
					if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
						return;
					}

					// Determine event propagation path in advance, per W3C events spec (#9951)
					// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
					if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {

						bubbleType = special.delegateType || type;
						if (!rfocusMorph.test(bubbleType + type)) {
							cur = cur.parentNode;
						}
						for (; cur; cur = cur.parentNode) {
							eventPath.push(cur);
							tmp = cur;
						}

						// Only add window if we got to document (e.g., not plain obj or detached DOM)
						if (tmp === (elem.ownerDocument || document)) {
							eventPath.push(tmp.defaultView || tmp.parentWindow || window);
						}
					}

					// Fire handlers on the event path
					// 取handle
					// 执行
					// 执行通过onXXX方式添加的事件（如onclick="fun()"）
					// 取父元素
					// while循环不断重复这四步以模拟事件冒泡。直到window对象
					i = 0;
					while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {

						event.type = i > 1 ?
							bubbleType :
							special.bindType || type;

						// jQuery handler
						handle = (jQuery._data(cur, "events") || {})[event.type] && jQuery._data(cur, "handle");
						if (handle) {
							handle.apply(cur, data);
						}

						// Native handler
						handle = ontype && cur[ontype];
						if (handle && jQuery.acceptData(cur) && handle.apply && handle.apply(cur, data) === false) {
							event.preventDefault();
						}
					}
					event.type = type;

					// If nobody prevented the default action, do it now
					// 这一段是对于浏览器默认行为的触发
					if (!onlyHandlers && !event.isDefaultPrevented()) {

						if ((!special._default || special._default.apply(eventPath.pop(), data) === false) &&
							jQuery.acceptData(elem)) {

							// Call a native DOM method on the target with the same name name as the event.
							// Can't use an .isFunction() check here because IE6/7 fails that test.
							// Don't do default actions on window, that's where global variables be (#6170)
							if (ontype && elem[type] && !jQuery.isWindow(elem)) {

								// Don't re-trigger an onFOO event when we call its FOO() method
								tmp = elem[ontype];

								if (tmp) {
									elem[ontype] = null;
								}

								// Prevent re-triggering of the same event, since we already bubbled it above
								jQuery.event.triggered = type;
								try {
									elem[type]();
								} catch (e) {
									// IE<9 dies on focus/blur to hidden element (#1486,#12518)
									// only reproducible on winXP IE8 native, not IE9 in IE8 mode
								}
								jQuery.event.triggered = undefined;

								if (tmp) {
									elem[ontype] = tmp;
								}
							}
						}
					}

					return event.result;
				},

				// 分派（执行）事件处理函数
				dispatch: function(event) {

					// Make a writable jQuery.Event from the native event object
					event = jQuery.event.fix(event);

					var i, ret, handleObj, matched, j,
						handlerQueue = [],
						args = core_slice.call(arguments),
						handlers = (jQuery._data(this, "events") || {})[event.type] || [],
						special = jQuery.event.special[event.type] || {};

					// Use the fix-ed jQuery.Event rather than the (read-only) native event
					args[0] = event;
					event.delegateTarget = this;

					// Call the preDispatch hook for the mapped type, and let it bail if desired
					if (special.preDispatch && special.preDispatch.call(this, event) === false) {
						return;
					}

					// Determine handlers
					handlerQueue = jQuery.event.handlers.call(this, event, handlers);

					// Run delegates first; they may want to stop propagation beneath us
					i = 0;
					while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
						event.currentTarget = matched.elem;

						j = 0;
						while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {

							// Triggered event must either 1) have no namespace, or
							// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
							if (!event.namespace_re || event.namespace_re.test(handleObj.namespace)) {

								event.handleObj = handleObj;
								event.data = handleObj.data;

								ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler)
									.apply(matched.elem, args);

								if (ret !== undefined) {
									if ((event.result = ret) === false) {
										event.preventDefault();
										event.stopPropagation();
									}
								}
							}
						}
					}

					// Call the postDispatch hook for the mapped type
					if (special.postDispatch) {
						special.postDispatch.call(this, event);
					}

					return event.result;
				},
				// 事件处理器
				// 针对事件委托和原生事件（例如"click"）绑定，区分对待
				handlers: function(event, handlers) {
					var sel, handleObj, matches, i,
						handlerQueue = [],
						delegateCount = handlers.delegateCount,
						cur = event.target;

					// Find delegate handlers
					// Black-hole SVG <use> instance trees (#13180)
					// Avoid non-left-click bubbling in Firefox (#3861)
					if (delegateCount && cur.nodeType && (!event.button || event.type !== "click")) {

						/* jshint eqeqeq: false */
						for (; cur != this; cur = cur.parentNode || this) {
							/* jshint eqeqeq: true */

							// Don't check non-elements (#13208)
							// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
							if (cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click")) {
								matches = [];
								for (i = 0; i < delegateCount; i++) {
									handleObj = handlers[i];

									// Don't conflict with Object.prototype properties (#13203)
									sel = handleObj.selector + " ";

									if (matches[sel] === undefined) {
										matches[sel] = handleObj.needsContext ?
											jQuery(sel, this).index(cur) >= 0 :
											jQuery.find(sel, this, null, [cur]).length;
									}
									if (matches[sel]) {
										matches.push(handleObj);
									}
								}
								if (matches.length) {
									handlerQueue.push({
										elem: cur,
										handlers: matches
									});
								}
							}
						}
					}

					// Add the remaining (directly-bound) handlers
					if (delegateCount < handlers.length) {
						handlerQueue.push({
							elem: this,
							handlers: handlers.slice(delegateCount)
						});
					}

					return handlerQueue;
				},
				// 对游览器的差异性进行包装处理
				fix: function(event) {
					if (event[jQuery.expando]) {
						return event;
					}

					// Create a writable copy of the event object and normalize some properties
					var i, prop, copy,
						type = event.type,
						originalEvent = event,
						fixHook = this.fixHooks[type];

					if (!fixHook) {
						this.fixHooks[type] = fixHook =
							rmouseEvent.test(type) ? this.mouseHooks :
							rkeyEvent.test(type) ? this.keyHooks : {};
					}
					copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;

					// 将浏览器原生 Event 的属性赋值到新创建的jQuery.Event对象中去
					event = new jQuery.Event(originalEvent);

					i = copy.length;
					while (i--) {
						prop = copy[i];
						event[prop] = originalEvent[prop];
					}

					// Support: IE<9
					// Fix target property (#1925)
					if (!event.target) {
						event.target = originalEvent.srcElement || document;
					}

					// Support: Chrome 23+, Safari?
					// Target should not be a text node (#504, #13143)
					if (event.target.nodeType === 3) {
						event.target = event.target.parentNode;
					}

					// Support: IE<9
					// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
					event.metaKey = !!event.metaKey;

					return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
				},

				// Includes some event props shared by KeyEvent and MouseEvent
				// 存储了原生事件对象 event 的通用属性
				props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

				// 对象用于缓存不同事件所属的事件类别
				// fixHooks['click'] === jQuery.event.mouseHooks
				// fixHooks['keydown'] === jQuery.event.keyHooks
				fixHooks: {},

				keyHooks: {
					// 存储键盘事件的特有属性
					props: "char charCode key keyCode".split(" "),
					// 用于修改键盘事件的属性兼容性问题，用于统一接口
					filter: function(event, original) {

						// Add which for key events
						if (event.which == null) {
							event.which = original.charCode != null ? original.charCode : original.keyCode;
						}

						return event;
					}
				},

				mouseHooks: {
					// 存储鼠标事件的特有属性
					props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
					// 用于修改鼠标事件的属性兼容性问题，用于统一接口
					filter: function(event, original) {
						var body, eventDoc, doc,
							button = original.button,
							fromElement = original.fromElement;

						// Calculate pageX/Y if missing and clientX/Y available
						if (event.pageX == null && original.clientX != null) {
							eventDoc = event.target.ownerDocument || document;
							doc = eventDoc.documentElement;
							body = eventDoc.body;

							event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
							event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
						}

						// Add relatedTarget, if necessary
						if (!event.relatedTarget && fromElement) {
							event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
						}

						// Add which for click: 1 === left; 2 === middle; 3 === right
						// Note: button is not normalized, so don't use it
						if (!event.which && button !== undefined) {
							event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
						}

						return event;
					}
				},

				special: {
					load: {
						// Prevent triggered image.load events from bubbling to window.load
						noBubble: true
					},
					focus: {
						// Fire native event if possible so blur/focus sequence is correct
						trigger: function() {
							if (this !== safeActiveElement() && this.focus) {
								try {
									this.focus();
									return false;
								} catch (e) {
									// Support: IE<9
									// If we error on focus to hidden element (#1486, #12518),
									// let .trigger() run the handlers
								}
							}
						},
						delegateType: "focusin"
					},
					blur: {
						trigger: function() {
							if (this === safeActiveElement() && this.blur) {
								this.blur();
								return false;
							}
						},
						delegateType: "focusout"
					},
					click: {
						// For checkbox, fire native event so checked state will be right
						trigger: function() {
							if (jQuery.nodeName(this, "input") && this.type === "checkbox" && this.click) {
								this.click();
								return false;
							}
						},

						// For cross-browser consistency, don't fire native .click() on links
						_default: function(event) {
							return jQuery.nodeName(event.target, "a");
						}
					},

					beforeunload: {
						postDispatch: function(event) {

							// Even when returnValue equals to undefined Firefox will still show alert
							if (event.result !== undefined) {
								event.originalEvent.returnValue = event.result;
							}
						}
					}
				},

				simulate: function(type, elem, event, bubble) {
					// Piggyback on a donor event to simulate a different one.
					// Fake originalEvent to avoid donor's stopPropagation, but if the
					// simulated event prevents default then we do the same on the donor.
					var e = jQuery.extend(
						new jQuery.Event(),
						event, {
							type: type,
							isSimulated: true,
							originalEvent: {}
						}
					);
					if (bubble) {
						jQuery.event.trigger(e, null, elem);
					} else {
						jQuery.event.dispatch.call(elem, e);
					}
					if (e.isDefaultPrevented()) {
						event.preventDefault();
					}
				}
			};

			jQuery.removeEvent = document.removeEventListener ?
			function(elem, type, handle) {
				if (elem.removeEventListener) {
					elem.removeEventListener(type, handle, false);
				}
			} :
			function(elem, type, handle) {
				var name = "on" + type;

				if (elem.detachEvent) {

					// #8545, #7054, preventing memory leaks for custom events in IE6-8
					// detachEvent needed property on element, by name of that event, to properly expose it to GC
					if (typeof elem[name] === core_strundefined) {
						elem[name] = null;
					}

					elem.detachEvent(name, handle);
				}
			};

			// jQuery 重写了原生 event 事件
			jQuery.Event = function(src, props) {
				// Allow instantiation without the 'new' keyword
				if (!(this instanceof jQuery.Event)) {
					return new jQuery.Event(src, props);
				}

				// Event object
				if (src && src.type) {
					this.originalEvent = src;
					this.type = src.type;

					// Events bubbling up the document may have been marked as prevented
					// by a handler lower down the tree; reflect the correct value.
					this.isDefaultPrevented = (src.defaultPrevented || src.returnValue === false ||
						src.getPreventDefault && src.getPreventDefault()) ? returnTrue : returnFalse;

					// Event type
				} else {
					this.type = src;
				}

				// Put explicitly provided properties onto the event object
				if (props) {
					jQuery.extend(this, props);
				}

				// Create a timestamp if incoming event doesn't have one
				this.timeStamp = src && src.timeStamp || jQuery.now();

				// Mark it as fixed
				this[jQuery.expando] = true;
			};

			// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
			// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
			jQuery.Event.prototype = {
				isDefaultPrevented: returnFalse,
				isPropagationStopped: returnFalse,
				isImmediatePropagationStopped: returnFalse,

				preventDefault: function() {
					var e = this.originalEvent;

					this.isDefaultPrevented = returnTrue;
					if (!e) {
						return;
					}

					// If preventDefault exists, run it on the original event
					if (e.preventDefault) {
						e.preventDefault();

						// Support: IE
						// Otherwise set the returnValue property of the original event to false
					} else {
						e.returnValue = false;
					}
				},
				stopPropagation: function() {
					var e = this.originalEvent;

					this.isPropagationStopped = returnTrue;
					if (!e) {
						return;
					}
					// If stopPropagation exists, run it on the original event
					if (e.stopPropagation) {
						e.stopPropagation();
					}

					// Support: IE
					// Set the cancelBubble property of the original event to true
					e.cancelBubble = true;
				},
				stopImmediatePropagation: function() {
					this.isImmediatePropagationStopped = returnTrue;
					this.stopPropagation();
				}
			};

			// Create mouseenter/leave events using mouseover/out and event-time checks
			jQuery.each({
				mouseenter: "mouseover",
				mouseleave: "mouseout"
			}, function(orig, fix) {
				jQuery.event.special[orig] = {
					delegateType: fix,
					bindType: fix,

					handle: function(event) {
						var ret,
							target = this,
							related = event.relatedTarget,
							handleObj = event.handleObj;

						// For mousenter/leave call the handler if related is outside the target.
						// NB: No relatedTarget if the mouse left/entered the browser window
						if (!related || (related !== target && !jQuery.contains(target, related))) {
							event.type = handleObj.origType;
							ret = handleObj.handler.apply(this, arguments);
							event.type = fix;
						}
						return ret;
					}
				};
			});

			// IE submit delegation
			if (!jQuery.support.submitBubbles) {

				jQuery.event.special.submit = {
					setup: function() {
						// Only need this for delegated form submit events
						if (jQuery.nodeName(this, "form")) {
							return false;
						}

						// Lazy-add a submit handler when a descendant form may potentially be submitted
						jQuery.event.add(this, "click._submit keypress._submit", function(e) {
							// Node name check avoids a VML-related crash in IE (#9807)
							var elem = e.target,
								form = jQuery.nodeName(elem, "input") || jQuery.nodeName(elem, "button") ? elem.form : undefined;
							if (form && !jQuery._data(form, "submitBubbles")) {
								jQuery.event.add(form, "submit._submit", function(event) {
									event._submit_bubble = true;
								});
								jQuery._data(form, "submitBubbles", true);
							}
						});
						// return undefined since we don't need an event listener
					},

					postDispatch: function(event) {
						// If form was submitted by the user, bubble the event up the tree
						if (event._submit_bubble) {
							delete event._submit_bubble;
							if (this.parentNode && !event.isTrigger) {
								jQuery.event.simulate("submit", this.parentNode, event, true);
							}
						}
					},

					teardown: function() {
						// Only need this for delegated form submit events
						if (jQuery.nodeName(this, "form")) {
							return false;
						}

						// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
						jQuery.event.remove(this, "._submit");
					}
				};
			}

			// IE change delegation and checkbox/radio fix
			if (!jQuery.support.changeBubbles) {

				jQuery.event.special.change = {

					setup: function() {

						if (rformElems.test(this.nodeName)) {
							// IE doesn't fire change on a check/radio until blur; trigger it on click
							// after a propertychange. Eat the blur-change in special.change.handle.
							// This still fires onchange a second time for check/radio after blur.
							if (this.type === "checkbox" || this.type === "radio") {
								jQuery.event.add(this, "propertychange._change", function(event) {
									if (event.originalEvent.propertyName === "checked") {
										this._just_changed = true;
									}
								});
								jQuery.event.add(this, "click._change", function(event) {
									if (this._just_changed && !event.isTrigger) {
										this._just_changed = false;
									}
									// Allow triggered, simulated change events (#11500)
									jQuery.event.simulate("change", this, event, true);
								});
							}
							return false;
						}
						// Delegated event; lazy-add a change handler on descendant inputs
						jQuery.event.add(this, "beforeactivate._change", function(e) {
							var elem = e.target;

							if (rformElems.test(elem.nodeName) && !jQuery._data(elem, "changeBubbles")) {
								jQuery.event.add(elem, "change._change", function(event) {
									if (this.parentNode && !event.isSimulated && !event.isTrigger) {
										jQuery.event.simulate("change", this.parentNode, event, true);
									}
								});
								jQuery._data(elem, "changeBubbles", true);
							}
						});
					},

					handle: function(event) {
						var elem = event.target;

						// Swallow native change events from checkbox/radio, we already triggered them above
						if (this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox")) {
							return event.handleObj.handler.apply(this, arguments);
						}
					},

					teardown: function() {
						jQuery.event.remove(this, "._change");

						return !rformElems.test(this.nodeName);
					}
				};
			}

			// Create "bubbling" focus and blur events
			if (!jQuery.support.focusinBubbles) {
				jQuery.each({
					focus: "focusin",
					blur: "focusout"
				}, function(orig, fix) {

					// Attach a single capturing handler while someone wants focusin/focusout
					var attaches = 0,
						handler = function(event) {
							jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true);
						};

					jQuery.event.special[fix] = {
						setup: function() {
							if (attaches++ === 0) {
								document.addEventListener(orig, handler, true);
							}
						},
						teardown: function() {
							if (--attaches === 0) {
								document.removeEventListener(orig, handler, true);
							}
						}
					};
				});
			}

			// jQuery 对象方法
			jQuery.fn.extend({
				// events：事件名
				// selector: 一个选择器字符串，用于过滤出被选中的元素中能触发事件的后代元素
				// data: 当一个事件被触发时，要传递给事件处理函数的
				// handler: 事件被触发时，执行的函数
				// on 方法实质只完成一些参数调整的工作，而实际负责事件绑定的是其内部 jQuery.event.add 方法
				on: function(types, selector, data, fn, /*INTERNAL*/ one) {
					var type, origFn;

					// Types can be a map of types/handlers
					// types 参数可能是个对象 传入了多个事件
					if (typeof types === "object") {
						// ( types-Object, selector, data )
						// 简单的参数处理
						// 没有传入 selector 的情况
						if (typeof selector !== "string") {
							// ( types-Object, data )
							data = data || selector;
							selector = undefined;
						}
						// 遍历 types
						for (type in types) {
							// 递归调用自己
							this.on(type, selector, data, types[type], one);
						}

						return this;
					}

					// 参数处理
					// 相当于传参为 elem.on(types,fn)
					// elem.on('click',function(){ ... })
					if (data == null && fn == null) {
						// ( types, fn )
						fn = selector;
						data = selector = undefined;
					// 参数处理
					// 相当于传入 3 个参数
					} else if (fn == null) {
						if (typeof selector === "string") {
							// ( types, selector, fn )
							// .on( types, selector, fn )
							fn = data;
							data = undefined;
						} else {
							// ( types, data, fn )
							// .on( types, data, fn )
							fn = data;
							data = selector;
							selector = undefined;
						}
					}
					if (fn === false) {
						fn = returnFalse;
					} else if (!fn) {
						return this;
					}

					// 仅在内部使用
					if (one === 1) {
						origFn = fn;
						fn = function(event) {
							// Can use an empty set, since event contains the info
							jQuery().off(event);
							return origFn.apply(this, arguments);
						};
						// Use same guid so caller can remove using origFn
						fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
					}

					// 上面处理完参数没有返回结果的，最后都是调用 add 方法
					// jQuery.event.add 给选中元素注册事件处理程序
					return this.each(function() {
						jQuery.event.add(this, types, fn, data, selector);
					});
				},
				// 调用了 jQuery.fn.on 方法
				one: function(types, selector, data, fn) {
					return this.on(types, selector, data, fn, 1);
				},
				// 移除事件处理函数
				// off 事件主要是一些参数处理，事件的移除主要还是调用 jQuery.event.remove(this, types, fn, selector)
				off: function(types, selector, fn) {
					var handleObj, type;
					if (types && types.preventDefault && types.handleObj) {
						// ( event )  dispatched jQuery.Event
						handleObj = types.handleObj;
						jQuery(types.delegateTarget).off(
							handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
							handleObj.selector,
							handleObj.handler
						);
						return this;
					}
					// types 是一个对象
					// 批量移除
					if (typeof types === "object") {
						// ( types-object [, selector] )
						for (type in types) {
							this.off(type, selector, types[type]);
						}
						return this;
					}

					if (selector === false || typeof selector === "function") {
						// ( types [, fn] )
						fn = selector;
						selector = undefined;
					}
					if (fn === false) {
						fn = returnFalse;
					}
					return this.each(function() {
						// 事件的移除主要还是调用 remove
						jQuery.event.remove(this, types, fn, selector);
					});
				},

				// trigger 执行事件hanlder/执行冒泡/执行默认行为
				trigger: function(type, data) {
					return this.each(function() {
						jQuery.event.trigger(type, data, this);
					});
				},
				// triggerHandler 执行事件handler/不冒泡/不执行默认行为
				triggerHandler: function(type, data) {
					var elem = this[0];
					if (elem) {
						// 相比于上面的 trigger 方法
						// 传了 true 的 triggerHander 就表示仅执行事件 handler ，不执行默认行为
						return jQuery.event.trigger(type, data, elem, true);
					}
				}
			});
			var isSimple = /^.[^:#\[\.,]*$/,
				rparentsprev = /^(?:parents|prev(?:Until|All))/,
				rneedsContext = jQuery.expr.match.needsContext,
				// methods guaranteed to produce a unique set when starting from a unique set
				guaranteedUnique = {
					children: true,
					contents: true,
					next: true,
					prev: true
				};

			jQuery.fn.extend({
				find: function(selector) {
					var i,
						ret = [],
						self = this,
						len = self.length;

					if (typeof selector !== "string") {
						return this.pushStack(jQuery(selector).filter(function() {
							for (i = 0; i < len; i++) {
								if (jQuery.contains(self[i], this)) {
									return true;
								}
							}
						}));
					}

					for (i = 0; i < len; i++) {
						jQuery.find(selector, self[i], ret);
					}

					// Needed because $( selector, context ) becomes $( context ).find( selector )
					ret = this.pushStack(len > 1 ? jQuery.unique(ret) : ret);
					ret.selector = this.selector ? this.selector + " " + selector : selector;
					return ret;
				},

				has: function(target) {
					var i,
						targets = jQuery(target, this),
						len = targets.length;

					return this.filter(function() {
						for (i = 0; i < len; i++) {
							if (jQuery.contains(this, targets[i])) {
								return true;
							}
						}
					});
				},

				not: function(selector) {
					return this.pushStack(winnow(this, selector || [], true));
				},

				filter: function(selector) {
					return this.pushStack(winnow(this, selector || [], false));
				},

				is: function(selector) {
					return !!winnow(
						this,

						// If this is a positional/relative selector, check membership in the returned set
						// so $("p:first").is("p:last") won't return true for a doc with two "p".
						typeof selector === "string" && rneedsContext.test(selector) ?
						jQuery(selector) :
						selector || [],
						false
					).length;
				},

				closest: function(selectors, context) {
					var cur,
						i = 0,
						l = this.length,
						ret = [],
						pos = rneedsContext.test(selectors) || typeof selectors !== "string" ?
						jQuery(selectors, context || this.context) :
						0;

					for (; i < l; i++) {
						for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
							// Always skip document fragments
							if (cur.nodeType < 11 && (pos ?
									pos.index(cur) > -1 :

									// Don't pass non-elements to Sizzle
									cur.nodeType === 1 &&
									jQuery.find.matchesSelector(cur, selectors))) {

								cur = ret.push(cur);
								break;
							}
						}
					}

					return this.pushStack(ret.length > 1 ? jQuery.unique(ret) : ret);
				},

				// Determine the position of an element within
				// the matched set of elements
				index: function(elem) {

					// No argument, return index in parent
					// 如果没有传入参数，那么
					// 例如，调用方式： $("li").index( )  
					if (!elem) {
						// 如果元素存在并且拥有父节点，获取第一个元素前面的所有的同级元素的个数  
						return (this[0] && this[0].parentNode) ? this.first().prevAll().length : -1;
					}

					// index in selector
					// 如果指定参数为字符型，如调用：$("li").index( "#id" ) 
					if (typeof elem === "string") {

						return jQuery.inArray(this[0], jQuery(elem));
					}

					// Locate the position of the desired element
					return jQuery.inArray(
						// If it receives a jQuery object, the first element is used
						// 如果是jQuery对象作为参数，那么获取参数第一个对象在调用选择器中的位置 
						elem.jquery ? elem[0] : elem, this);
				},

				add: function(selector, context) {
					var set = typeof selector === "string" ?
						jQuery(selector, context) :
						jQuery.makeArray(selector && selector.nodeType ? [selector] : selector),
						all = jQuery.merge(this.get(), set);

					return this.pushStack(jQuery.unique(all));
				},

				addBack: function(selector) {
					return this.add(selector == null ?
						this.prevObject : this.prevObject.filter(selector)
					);
				}
			});

			function sibling(cur, dir) {
				do {
					cur = cur[dir];
				} while (cur && cur.nodeType !== 1);

				return cur;
			}

			jQuery.each({
				parent: function(elem) {
					var parent = elem.parentNode;
					return parent && parent.nodeType !== 11 ? parent : null;
				},
				parents: function(elem) {
					return jQuery.dir(elem, "parentNode");
				},
				parentsUntil: function(elem, i, until) {
					return jQuery.dir(elem, "parentNode", until);
				},
				next: function(elem) {
					return sibling(elem, "nextSibling");
				},
				prev: function(elem) {
					return sibling(elem, "previousSibling");
				},
				nextAll: function(elem) {
					return jQuery.dir(elem, "nextSibling");
				},
				prevAll: function(elem) {
					return jQuery.dir(elem, "previousSibling");
				},
				nextUntil: function(elem, i, until) {
					return jQuery.dir(elem, "nextSibling", until);
				},
				prevUntil: function(elem, i, until) {
					return jQuery.dir(elem, "previousSibling", until);
				},
				siblings: function(elem) {
					return jQuery.sibling((elem.parentNode || {}).firstChild, elem);
				},
				children: function(elem) {
					return jQuery.sibling(elem.firstChild);
				},
				contents: function(elem) {
					return jQuery.nodeName(elem, "iframe") ?
						elem.contentDocument || elem.contentWindow.document :
						jQuery.merge([], elem.childNodes);
				}
			}, function(name, fn) {
				jQuery.fn[name] = function(until, selector) {
					var ret = jQuery.map(this, fn, until);

					if (name.slice(-5) !== "Until") {
						selector = until;
					}

					if (selector && typeof selector === "string") {
						ret = jQuery.filter(selector, ret);
					}

					if (this.length > 1) {
						// Remove duplicates
						if (!guaranteedUnique[name]) {
							ret = jQuery.unique(ret);
						}

						// Reverse order for parents* and prev-derivatives
						if (rparentsprev.test(name)) {
							ret = ret.reverse();
						}
					}

					return this.pushStack(ret);
				};
			});

			jQuery.extend({
				filter: function(expr, elems, not) {
					var elem = elems[0];

					if (not) {
						expr = ":not(" + expr + ")";
					}

					return elems.length === 1 && elem.nodeType === 1 ?
						jQuery.find.matchesSelector(elem, expr) ? [elem] : [] :
						jQuery.find.matches(expr, jQuery.grep(elems, function(elem) {
							return elem.nodeType === 1;
						}));
				},

				dir: function(elem, dir, until) {
					var matched = [],
						cur = elem[dir];

					while (cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery(cur).is(until))) {
						if (cur.nodeType === 1) {
							matched.push(cur);
						}
						cur = cur[dir];
					}
					return matched;
				},

				sibling: function(n, elem) {
					var r = [];

					for (; n; n = n.nextSibling) {
						if (n.nodeType === 1 && n !== elem) {
							r.push(n);
						}
					}

					return r;
				}
			});

			// Implement the identical functionality for filter and not
			function winnow(elements, qualifier, not) {
				if (jQuery.isFunction(qualifier)) {
					return jQuery.grep(elements, function(elem, i) {
						/* jshint -W018 */
						return !!qualifier.call(elem, i, elem) !== not;
					});

				}

				if (qualifier.nodeType) {
					return jQuery.grep(elements, function(elem) {
						return (elem === qualifier) !== not;
					});

				}

				if (typeof qualifier === "string") {
					if (isSimple.test(qualifier)) {
						return jQuery.filter(qualifier, elements, not);
					}

					qualifier = jQuery.filter(qualifier, elements);
				}

				return jQuery.grep(elements, function(elem) {
					return (jQuery.inArray(elem, qualifier) >= 0) !== not;
				});
			}

			function createSafeFragment(document) {
				var list = nodeNames.split("|"),
					safeFrag = document.createDocumentFragment();

				if (safeFrag.createElement) {
					while (list.length) {
						safeFrag.createElement(
							list.pop()
						);
					}
				}
				return safeFrag;
			}

			var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
				"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
				rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
				rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
				rleadingWhitespace = /^\s+/,
				rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
				rtagName = /<([\w:]+)/,
				rtbody = /<tbody/i,
				rhtml = /<|&#?\w+;/,
				rnoInnerhtml = /<(?:script|style|link)/i,
				manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
				// checked="checked" or checked
				rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
				rscriptType = /^$|\/(?:java|ecma)script/i,
				rscriptTypeMasked = /^true\/(.*)/,
				rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

				// We have to close these tags to support XHTML (#13200)
				wrapMap = {
					option: [1, "<select multiple='multiple'>", "</select>"],
					legend: [1, "<fieldset>", "</fieldset>"],
					area: [1, "<map>", "</map>"],
					param: [1, "<object>", "</object>"],
					thead: [1, "<table>", "</table>"],
					tr: [2, "<table><tbody>", "</tbody></table>"],
					col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
					td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],

					// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
					// unless wrapped in a div with non-breaking characters in front of it.
					_default: jQuery.support.htmlSerialize ? [0, "", ""] : [1, "X<div>", "</div>"]
				},
				safeFragment = createSafeFragment(document),
				fragmentDiv = safeFragment.appendChild(document.createElement("div"));

			wrapMap.optgroup = wrapMap.option; wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead; wrapMap.th = wrapMap.td;

			jQuery.fn.extend({
				text: function(value) {
					return jQuery.access(this, function(value) {
						return value === undefined ?
							jQuery.text(this) :
							this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(value));
					}, null, value, arguments.length);
				},

				append: function() {
					return this.domManip(arguments, function(elem) {
						if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
							var target = manipulationTarget(this, elem);
							target.appendChild(elem);
						}
					});
				},

				prepend: function() {
					return this.domManip(arguments, function(elem) {
						if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
							var target = manipulationTarget(this, elem);
							target.insertBefore(elem, target.firstChild);
						}
					});
				},

				before: function() {
					return this.domManip(arguments, function(elem) {
						if (this.parentNode) {
							this.parentNode.insertBefore(elem, this);
						}
					});
				},

				after: function() {
					return this.domManip(arguments, function(elem) {
						if (this.parentNode) {
							this.parentNode.insertBefore(elem, this.nextSibling);
						}
					});
				},

				// keepData is for internal use only--do not document
				remove: function(selector, keepData) {
					var elem,
						elems = selector ? jQuery.filter(selector, this) : this,
						i = 0;

					for (;
						(elem = elems[i]) != null; i++) {

						if (!keepData && elem.nodeType === 1) {
							jQuery.cleanData(getAll(elem));
						}

						if (elem.parentNode) {
							if (keepData && jQuery.contains(elem.ownerDocument, elem)) {
								setGlobalEval(getAll(elem, "script"));
							}
							elem.parentNode.removeChild(elem);
						}
					}

					return this;
				},

				empty: function() {
					var elem,
						i = 0;

					for (;
						(elem = this[i]) != null; i++) {
						// Remove element nodes and prevent memory leaks
						if (elem.nodeType === 1) {
							jQuery.cleanData(getAll(elem, false));
						}

						// Remove any remaining nodes
						while (elem.firstChild) {
							elem.removeChild(elem.firstChild);
						}

						// If this is a select, ensure that it displays empty (#12336)
						// Support: IE<9
						if (elem.options && jQuery.nodeName(elem, "select")) {
							elem.options.length = 0;
						}
					}

					return this;
				},

				clone: function(dataAndEvents, deepDataAndEvents) {
					dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
					deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

					return this.map(function() {
						return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
					});
				},

				html: function(value) {
					return jQuery.access(this, function(value) {
						var elem = this[0] || {},
							i = 0,
							l = this.length;

						if (value === undefined) {
							return elem.nodeType === 1 ?
								elem.innerHTML.replace(rinlinejQuery, "") :
								undefined;
						}

						// See if we can take a shortcut and just use innerHTML
						if (typeof value === "string" && !rnoInnerhtml.test(value) &&
							(jQuery.support.htmlSerialize || !rnoshimcache.test(value)) &&
							(jQuery.support.leadingWhitespace || !rleadingWhitespace.test(value)) &&
							!wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {

							value = value.replace(rxhtmlTag, "<$1></$2>");

							try {
								for (; i < l; i++) {
									// Remove element nodes and prevent memory leaks
									elem = this[i] || {};
									if (elem.nodeType === 1) {
										jQuery.cleanData(getAll(elem, false));
										elem.innerHTML = value;
									}
								}

								elem = 0;

								// If using innerHTML throws an exception, use the fallback method
							} catch (e) {}
						}

						if (elem) {
							this.empty().append(value);
						}
					}, null, value, arguments.length);
				},

				replaceWith: function() {
					var
					// Snapshot the DOM in case .domManip sweeps something relevant into its fragment
						args = jQuery.map(this, function(elem) {
							return [elem.nextSibling, elem.parentNode];
						}),
						i = 0;

					// Make the changes, replacing each context element with the new content
					this.domManip(arguments, function(elem) {
						var next = args[i++],
							parent = args[i++];

						if (parent) {
							// Don't use the snapshot next if it has moved (#13810)
							if (next && next.parentNode !== parent) {
								next = this.nextSibling;
							}
							jQuery(this).remove();
							parent.insertBefore(elem, next);
						}
						// Allow new content to include elements from the context set
					}, true);

					// Force removal if there was no new content (e.g., from empty arguments)
					return i ? this : this.remove();
				},

				detach: function(selector) {
					return this.remove(selector, true);
				},

				domManip: function(args, callback, allowIntersection) {

					// Flatten any nested arrays
					args = core_concat.apply([], args);

					var first, node, hasScripts,
						scripts, doc, fragment,
						i = 0,
						l = this.length,
						set = this,
						iNoClone = l - 1,
						value = args[0],
						isFunction = jQuery.isFunction(value);

					// We can't cloneNode fragments that contain checked, in WebKit
					if (isFunction || !(l <= 1 || typeof value !== "string" || jQuery.support.checkClone || !rchecked.test(value))) {
						return this.each(function(index) {
							var self = set.eq(index);
							if (isFunction) {
								args[0] = value.call(this, index, self.html());
							}
							self.domManip(args, callback, allowIntersection);
						});
					}

					if (l) {
						fragment = jQuery.buildFragment(args, this[0].ownerDocument, false, !allowIntersection && this);
						first = fragment.firstChild;

						if (fragment.childNodes.length === 1) {
							fragment = first;
						}

						if (first) {
							scripts = jQuery.map(getAll(fragment, "script"), disableScript);
							hasScripts = scripts.length;

							// Use the original fragment for the last item instead of the first because it can end up
							// being emptied incorrectly in certain situations (#8070).
							for (; i < l; i++) {
								node = fragment;

								if (i !== iNoClone) {
									node = jQuery.clone(node, true, true);

									// Keep references to cloned scripts for later restoration
									if (hasScripts) {
										jQuery.merge(scripts, getAll(node, "script"));
									}
								}

								callback.call(this[i], node, i);
							}

							if (hasScripts) {
								doc = scripts[scripts.length - 1].ownerDocument;

								// Reenable scripts
								jQuery.map(scripts, restoreScript);

								// Evaluate executable scripts on first document insertion
								for (i = 0; i < hasScripts; i++) {
									node = scripts[i];
									if (rscriptType.test(node.type || "") &&
										!jQuery._data(node, "globalEval") && jQuery.contains(doc, node)) {

										if (node.src) {
											// Hope ajax is available...
											jQuery._evalUrl(node.src);
										} else {
											jQuery.globalEval((node.text || node.textContent || node.innerHTML || "").replace(rcleanScript, ""));
										}
									}
								}
							}

							// Fix #11809: Avoid leaking memory
							fragment = first = null;
						}
					}

					return this;
				}
			});

			// Support: IE<8
			// Manipulating tables requires a tbody
			function manipulationTarget(elem, content) {
				return jQuery.nodeName(elem, "table") &&
					jQuery.nodeName(content.nodeType === 1 ? content : content.firstChild, "tr") ?

					elem.getElementsByTagName("tbody")[0] ||
					elem.appendChild(elem.ownerDocument.createElement("tbody")) :
					elem;
			}

			// Replace/restore the type attribute of script elements for safe DOM manipulation
			function disableScript(elem) {
				elem.type = (jQuery.find.attr(elem, "type") !== null) + "/" + elem.type;
				return elem;
			}

			function restoreScript(elem) {
				var match = rscriptTypeMasked.exec(elem.type);
				if (match) {
					elem.type = match[1];
				} else {
					elem.removeAttribute("type");
				}
				return elem;
			}

			// Mark scripts as having already been evaluated
			function setGlobalEval(elems, refElements) {
				var elem,
					i = 0;
				for (;
					(elem = elems[i]) != null; i++) {
					jQuery._data(elem, "globalEval", !refElements || jQuery._data(refElements[i], "globalEval"));
				}
			}

			function cloneCopyEvent(src, dest) {

				if (dest.nodeType !== 1 || !jQuery.hasData(src)) {
					return;
				}

				var type, i, l,
					oldData = jQuery._data(src),
					curData = jQuery._data(dest, oldData),
					events = oldData.events;

				if (events) {
					delete curData.handle;
					curData.events = {};

					for (type in events) {
						for (i = 0, l = events[type].length; i < l; i++) {
							jQuery.event.add(dest, type, events[type][i]);
						}
					}
				}

				// make the cloned public data object a copy from the original
				if (curData.data) {
					curData.data = jQuery.extend({}, curData.data);
				}
			}

			function fixCloneNodeIssues(src, dest) {
				var nodeName, e, data;

				// We do not need to do anything for non-Elements
				if (dest.nodeType !== 1) {
					return;
				}

				nodeName = dest.nodeName.toLowerCase();

				// IE6-8 copies events bound via attachEvent when using cloneNode.
				if (!jQuery.support.noCloneEvent && dest[jQuery.expando]) {
					data = jQuery._data(dest);

					for (e in data.events) {
						jQuery.removeEvent(dest, e, data.handle);
					}

					// Event data gets referenced instead of copied if the expando gets copied too
					dest.removeAttribute(jQuery.expando);
				}

				// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
				if (nodeName === "script" && dest.text !== src.text) {
					disableScript(dest).text = src.text;
					restoreScript(dest);

					// IE6-10 improperly clones children of object elements using classid.
					// IE10 throws NoModificationAllowedError if parent is null, #12132.
				} else if (nodeName === "object") {
					if (dest.parentNode) {
						dest.outerHTML = src.outerHTML;
					}

					// This path appears unavoidable for IE9. When cloning an object
					// element in IE9, the outerHTML strategy above is not sufficient.
					// If the src has innerHTML and the destination does not,
					// copy the src.innerHTML into the dest.innerHTML. #10324
					if (jQuery.support.html5Clone && (src.innerHTML && !jQuery.trim(dest.innerHTML))) {
						dest.innerHTML = src.innerHTML;
					}

				} else if (nodeName === "input" && manipulation_rcheckableType.test(src.type)) {
					// IE6-8 fails to persist the checked state of a cloned checkbox
					// or radio button. Worse, IE6-7 fail to give the cloned element
					// a checked appearance if the defaultChecked value isn't also set

					dest.defaultChecked = dest.checked = src.checked;

					// IE6-7 get confused and end up setting the value of a cloned
					// checkbox/radio button to an empty string instead of "on"
					if (dest.value !== src.value) {
						dest.value = src.value;
					}

					// IE6-8 fails to return the selected option to the default selected
					// state when cloning options
				} else if (nodeName === "option") {
					dest.defaultSelected = dest.selected = src.defaultSelected;

					// IE6-8 fails to set the defaultValue to the correct value when
					// cloning other types of input fields
				} else if (nodeName === "input" || nodeName === "textarea") {
					dest.defaultValue = src.defaultValue;
				}
			}

			jQuery.each({
				appendTo: "append",
				prependTo: "prepend",
				insertBefore: "before",
				insertAfter: "after",
				replaceAll: "replaceWith"
			}, function(name, original) {
				jQuery.fn[name] = function(selector) {
					var elems,
						i = 0,
						ret = [],
						insert = jQuery(selector),
						last = insert.length - 1;

					for (; i <= last; i++) {
						elems = i === last ? this : this.clone(true);
						jQuery(insert[i])[original](elems);

						// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
						core_push.apply(ret, elems.get());
					}

					return this.pushStack(ret);
				};
			});

			function getAll(context, tag) {
				var elems, elem,
					i = 0,
					found = typeof context.getElementsByTagName !== core_strundefined ? context.getElementsByTagName(tag || "*") :
					typeof context.querySelectorAll !== core_strundefined ? context.querySelectorAll(tag || "*") :
					undefined;

				if (!found) {
					for (found = [], elems = context.childNodes || context;
						(elem = elems[i]) != null; i++) {
						if (!tag || jQuery.nodeName(elem, tag)) {
							found.push(elem);
						} else {
							jQuery.merge(found, getAll(elem, tag));
						}
					}
				}

				return tag === undefined || tag && jQuery.nodeName(context, tag) ?
					jQuery.merge([context], found) :
					found;
			}

			// Used in buildFragment, fixes the defaultChecked property
			function fixDefaultChecked(elem) {
				if (manipulation_rcheckableType.test(elem.type)) {
					elem.defaultChecked = elem.checked;
				}
			}

			jQuery.extend({
				clone: function(elem, dataAndEvents, deepDataAndEvents) {
					var destElements, node, clone, i, srcElements,
						inPage = jQuery.contains(elem.ownerDocument, elem);

					if (jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test("<" + elem.nodeName + ">")) {
						clone = elem.cloneNode(true);

						// IE<=8 does not properly clone detached, unknown element nodes
					} else {
						fragmentDiv.innerHTML = elem.outerHTML;
						fragmentDiv.removeChild(clone = fragmentDiv.firstChild);
					}

					if ((!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
						(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {

						// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
						destElements = getAll(clone);
						srcElements = getAll(elem);

						// Fix all IE cloning issues
						for (i = 0;
							(node = srcElements[i]) != null; ++i) {
							// Ensure that the destination node is not null; Fixes #9587
							if (destElements[i]) {
								fixCloneNodeIssues(node, destElements[i]);
							}
						}
					}

					// Copy the events from the original to the clone
					if (dataAndEvents) {
						if (deepDataAndEvents) {
							srcElements = srcElements || getAll(elem);
							destElements = destElements || getAll(clone);

							for (i = 0;
								(node = srcElements[i]) != null; i++) {
								cloneCopyEvent(node, destElements[i]);
							}
						} else {
							cloneCopyEvent(elem, clone);
						}
					}

					// Preserve script evaluation history
					destElements = getAll(clone, "script");
					if (destElements.length > 0) {
						setGlobalEval(destElements, !inPage && getAll(elem, "script"));
					}

					destElements = srcElements = node = null;

					// Return the cloned set
					return clone;
				},

				buildFragment: function(elems, context, scripts, selection) {
					var j, elem, contains,
						tmp, tag, tbody, wrap,
						l = elems.length,

						// Ensure a safe fragment
						safe = createSafeFragment(context),

						nodes = [],
						i = 0;

					for (; i < l; i++) {
						elem = elems[i];

						if (elem || elem === 0) {

							// Add nodes directly
							if (jQuery.type(elem) === "object") {
								jQuery.merge(nodes, elem.nodeType ? [elem] : elem);

								// Convert non-html into a text node
							} else if (!rhtml.test(elem)) {
								nodes.push(context.createTextNode(elem));

								// Convert html into DOM nodes
							} else {
								tmp = tmp || safe.appendChild(context.createElement("div"));

								// Deserialize a standard representation
								tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
								wrap = wrapMap[tag] || wrapMap._default;

								tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, "<$1></$2>") + wrap[2];

								// Descend through wrappers to the right content
								j = wrap[0];
								while (j--) {
									tmp = tmp.lastChild;
								}

								// Manually add leading whitespace removed by IE
								if (!jQuery.support.leadingWhitespace && rleadingWhitespace.test(elem)) {
									nodes.push(context.createTextNode(rleadingWhitespace.exec(elem)[0]));
								}

								// Remove IE's autoinserted <tbody> from table fragments
								if (!jQuery.support.tbody) {

									// String was a <table>, *may* have spurious <tbody>
									elem = tag === "table" && !rtbody.test(elem) ?
										tmp.firstChild :

										// String was a bare <thead> or <tfoot>
										wrap[1] === "<table>" && !rtbody.test(elem) ?
										tmp :
										0;

									j = elem && elem.childNodes.length;
									while (j--) {
										if (jQuery.nodeName((tbody = elem.childNodes[j]), "tbody") && !tbody.childNodes.length) {
											elem.removeChild(tbody);
										}
									}
								}

								jQuery.merge(nodes, tmp.childNodes);

								// Fix #12392 for WebKit and IE > 9
								tmp.textContent = "";

								// Fix #12392 for oldIE
								while (tmp.firstChild) {
									tmp.removeChild(tmp.firstChild);
								}

								// Remember the top-level container for proper cleanup
								tmp = safe.lastChild;
							}
						}
					}

					// Fix #11356: Clear elements from fragment
					if (tmp) {
						safe.removeChild(tmp);
					}

					// Reset defaultChecked for any radios and checkboxes
					// about to be appended to the DOM in IE 6/7 (#8060)
					if (!jQuery.support.appendChecked) {
						jQuery.grep(getAll(nodes, "input"), fixDefaultChecked);
					}

					i = 0;
					while ((elem = nodes[i++])) {

						// #4087 - If origin and destination elements are the same, and this is
						// that element, do not do anything
						if (selection && jQuery.inArray(elem, selection) !== -1) {
							continue;
						}

						contains = jQuery.contains(elem.ownerDocument, elem);

						// Append to fragment
						tmp = getAll(safe.appendChild(elem), "script");

						// Preserve script evaluation history
						if (contains) {
							setGlobalEval(tmp);
						}

						// Capture executables
						if (scripts) {
							j = 0;
							while ((elem = tmp[j++])) {
								if (rscriptType.test(elem.type || "")) {
									scripts.push(elem);
								}
							}
						}
					}

					tmp = null;

					return safe;
				},

				cleanData: function(elems, /* internal */ acceptData) {
					var elem, type, id, data,
						i = 0,
						internalKey = jQuery.expando,
						cache = jQuery.cache,
						deleteExpando = jQuery.support.deleteExpando,
						special = jQuery.event.special;

					for (;
						(elem = elems[i]) != null; i++) {

						if (acceptData || jQuery.acceptData(elem)) {

							id = elem[internalKey];
							data = id && cache[id];

							if (data) {
								if (data.events) {
									for (type in data.events) {
										if (special[type]) {
											jQuery.event.remove(elem, type);

											// This is a shortcut to avoid jQuery.event.remove's overhead
										} else {
											jQuery.removeEvent(elem, type, data.handle);
										}
									}
								}

								// Remove cache only if it was not already removed by jQuery.event.remove
								if (cache[id]) {

									delete cache[id];

									// IE does not allow us to delete expando properties from nodes,
									// nor does it have a removeAttribute function on Document nodes;
									// we must handle all of these cases
									if (deleteExpando) {
										delete elem[internalKey];

									} else if (typeof elem.removeAttribute !== core_strundefined) {
										elem.removeAttribute(internalKey);

									} else {
										elem[internalKey] = null;
									}

									core_deletedIds.push(id);
								}
							}
						}
					}
				},

				_evalUrl: function(url) {
					return jQuery.ajax({
						url: url,
						type: "GET",
						dataType: "script",
						async: false,
						global: false,
						"throws": true
					});
				}
			}); jQuery.fn.extend({
				wrapAll: function(html) {
					if (jQuery.isFunction(html)) {
						return this.each(function(i) {
							jQuery(this).wrapAll(html.call(this, i));
						});
					}

					if (this[0]) {
						// The elements to wrap the target around
						var wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);

						if (this[0].parentNode) {
							wrap.insertBefore(this[0]);
						}

						wrap.map(function() {
							var elem = this;

							while (elem.firstChild && elem.firstChild.nodeType === 1) {
								elem = elem.firstChild;
							}

							return elem;
						}).append(this);
					}

					return this;
				},

				wrapInner: function(html) {
					if (jQuery.isFunction(html)) {
						return this.each(function(i) {
							jQuery(this).wrapInner(html.call(this, i));
						});
					}

					return this.each(function() {
						var self = jQuery(this),
							contents = self.contents();

						if (contents.length) {
							contents.wrapAll(html);

						} else {
							self.append(html);
						}
					});
				},

				wrap: function(html) {
					var isFunction = jQuery.isFunction(html);

					return this.each(function(i) {
						jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
					});
				},

				unwrap: function() {
					return this.parent().each(function() {
						if (!jQuery.nodeName(this, "body")) {
							jQuery(this).replaceWith(this.childNodes);
						}
					}).end();
				}
			});
			var iframe, getStyles, curCSS,
				ralpha = /alpha\([^)]*\)/i,
				ropacity = /opacity\s*=\s*([^)]*)/,
				rposition = /^(top|right|bottom|left)$/,
				// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
				// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
				rdisplayswap = /^(none|table(?!-c[ea]).+)/,
				rmargin = /^margin/,
				rnumsplit = new RegExp("^(" + core_pnum + ")(.*)$", "i"),
				rnumnonpx = new RegExp("^(" + core_pnum + ")(?!px)[a-z%]+$", "i"),
				rrelNum = new RegExp("^([+-])=(" + core_pnum + ")", "i"),
				elemdisplay = {
					BODY: "block"
				},

				cssShow = {
					position: "absolute",
					visibility: "hidden",
					display: "block"
				},
				cssNormalTransform = {
					letterSpacing: 0,
					fontWeight: 400
				},

				cssExpand = ["Top", "Right", "Bottom", "Left"],
				cssPrefixes = ["Webkit", "O", "Moz", "ms"];

			// return a css property mapped to a potentially vendor prefixed property
			function vendorPropName(style, name) {

				// shortcut for names that are not vendor prefixed
				if (name in style) {
					return name;
				}

				// check for vendor prefixed names
				var capName = name.charAt(0).toUpperCase() + name.slice(1),
					origName = name,
					i = cssPrefixes.length;

				while (i--) {
					name = cssPrefixes[i] + capName;
					if (name in style) {
						return name;
					}
				}

				return origName;
			}

			function isHidden(elem, el) {
				// isHidden might be called from jQuery#filter function;
				// in that case, element will be second argument
				elem = el || elem;
				return jQuery.css(elem, "display") === "none" || !jQuery.contains(elem.ownerDocument, elem);
			}

			function showHide(elements, show) {
				var display, elem, hidden,
					values = [],
					index = 0,
					length = elements.length;

				for (; index < length; index++) {
					elem = elements[index];
					if (!elem.style) {
						continue;
					}

					values[index] = jQuery._data(elem, "olddisplay");
					display = elem.style.display;
					if (show) {
						// Reset the inline display of this element to learn if it is
						// being hidden by cascaded rules or not
						if (!values[index] && display === "none") {
							elem.style.display = "";
						}

						// Set elements which have been overridden with display: none
						// in a stylesheet to whatever the default browser style is
						// for such an element
						if (elem.style.display === "" && isHidden(elem)) {
							values[index] = jQuery._data(elem, "olddisplay", css_defaultDisplay(elem.nodeName));
						}
					} else {

						if (!values[index]) {
							hidden = isHidden(elem);

							if (display && display !== "none" || !hidden) {
								jQuery._data(elem, "olddisplay", hidden ? display : jQuery.css(elem, "display"));
							}
						}
					}
				}

				// Set the display of most of the elements in a second loop
				// to avoid the constant reflow
				for (index = 0; index < length; index++) {
					elem = elements[index];
					if (!elem.style) {
						continue;
					}
					if (!show || elem.style.display === "none" || elem.style.display === "") {
						elem.style.display = show ? values[index] || "" : "none";
					}
				}

				return elements;
			}

			jQuery.fn.extend({
				css: function(name, value) {
					return jQuery.access(this, function(elem, name, value) {
						var len, styles,
							map = {},
							i = 0;

						if (jQuery.isArray(name)) {
							styles = getStyles(elem);
							len = name.length;

							for (; i < len; i++) {
								map[name[i]] = jQuery.css(elem, name[i], false, styles);
							}

							return map;
						}

						return value !== undefined ?
							jQuery.style(elem, name, value) :
							jQuery.css(elem, name);
					}, name, value, arguments.length > 1);
				},
				show: function() {
					return showHide(this, true);
				},
				hide: function() {
					return showHide(this);
				},
				toggle: function(state) {
					if (typeof state === "boolean") {
						return state ? this.show() : this.hide();
					}

					return this.each(function() {
						if (isHidden(this)) {
							jQuery(this).show();
						} else {
							jQuery(this).hide();
						}
					});
				}
			});

			jQuery.extend({
				// Add in style property hooks for overriding the default
				// behavior of getting and setting a style property
				cssHooks: {
					opacity: {
						get: function(elem, computed) {
							if (computed) {
								// We should always get a number back from opacity
								var ret = curCSS(elem, "opacity");
								return ret === "" ? "1" : ret;
							}
						}
					}
				},

				// Don't automatically add "px" to these possibly-unitless properties
				cssNumber: {
					"columnCount": true,
					"fillOpacity": true,
					"fontWeight": true,
					"lineHeight": true,
					"opacity": true,
					"order": true,
					"orphans": true,
					"widows": true,
					"zIndex": true,
					"zoom": true
				},

				// Add in properties whose names you wish to fix before
				// setting or getting the value
				cssProps: {
					// normalize float css property
					"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
				},

				// Get and set the style property on a DOM Node
				style: function(elem, name, value, extra) {
					// Don't set styles on text and comment nodes
					// 异常判断
					if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
						return;
					}

					// Make sure that we're working with the right name
					var ret, type, hooks,
						origName = jQuery.camelCase(name),
						style = elem.style;

					name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(style, origName));

					// gets hook for the prefixed version
					// followed by the unprefixed version
					hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];

					// Check if we're setting a value
					if (value !== undefined) {
						type = typeof value;

						// convert relative number strings (+= or -=) to relative numbers. #7345
						if (type === "string" && (ret = rrelNum.exec(value))) {
							value = (ret[1] + 1) * ret[2] + parseFloat(jQuery.css(elem, name));
							// Fixes bug #9237
							type = "number";
						}

						// Make sure that NaN and null values aren't set. See: #7116
						if (value == null || type === "number" && isNaN(value)) {
							return;
						}

						// If a number was passed in, add 'px' to the (except for certain CSS properties)
						if (type === "number" && !jQuery.cssNumber[origName]) {
							value += "px";
						}

						// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
						// but it would mean to define eight (for every problematic property) identical functions
						if (!jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
							style[name] = "inherit";
						}

						// If a hook was provided, use that value, otherwise just set the specified value
						if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {

							// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
							// Fixes bug #5509
							try {
								style[name] = value;
							} catch (e) {}
						}

					} else {
						// If a hook was provided get the non-computed value from there
						if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
							return ret;
						}

						// Otherwise just get the value from the style object
						return style[name];
					}
				},

				css: function(elem, name, extra, styles) {
					var num, val, hooks,
						origName = jQuery.camelCase(name);

					// Make sure that we're working with the right name
					name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(elem.style, origName));

					// gets hook for the prefixed version
					// followed by the unprefixed version
					hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];

					// If a hook was provided get the computed value from there
					if (hooks && "get" in hooks) {
						val = hooks.get(elem, true, extra);
					}

					// Otherwise, if a way to get the computed value exists, use that
					if (val === undefined) {
						val = curCSS(elem, name, styles);
					}

					//convert "normal" to computed value
					if (val === "normal" && name in cssNormalTransform) {
						val = cssNormalTransform[name];
					}

					// Return, converting to number if forced or a qualifier was provided and val looks numeric
					if (extra === "" || extra) {
						num = parseFloat(val);
						return extra === true || jQuery.isNumeric(num) ? num || 0 : val;
					}
					return val;
				}
			});

			// NOTE: we've included the "window" in window.getComputedStyle
			// because jsdom on node.js will break without it.
			if (window.getComputedStyle) {
				getStyles = function(elem) {
					return window.getComputedStyle(elem, null);
				};

				curCSS = function(elem, name, _computed) {
					var width, minWidth, maxWidth,
						computed = _computed || getStyles(elem),

						// getPropertyValue is only needed for .css('filter') in IE9, see #12537
						ret = computed ? computed.getPropertyValue(name) || computed[name] : undefined,
						style = elem.style;

					if (computed) {

						if (ret === "" && !jQuery.contains(elem.ownerDocument, elem)) {
							ret = jQuery.style(elem, name);
						}

						// A tribute to the "awesome hack by Dean Edwards"
						// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
						// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
						// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
						if (rnumnonpx.test(ret) && rmargin.test(name)) {

							// Remember the original values
							width = style.width;
							minWidth = style.minWidth;
							maxWidth = style.maxWidth;

							// Put in the new values to get a computed value out
							style.minWidth = style.maxWidth = style.width = ret;
							ret = computed.width;

							// Revert the changed values
							style.width = width;
							style.minWidth = minWidth;
							style.maxWidth = maxWidth;
						}
					}

					return ret;
				};
			} else if (document.documentElement.currentStyle) {
				getStyles = function(elem) {
					return elem.currentStyle;
				};

				curCSS = function(elem, name, _computed) {
					var left, rs, rsLeft,
						computed = _computed || getStyles(elem),
						ret = computed ? computed[name] : undefined,
						style = elem.style;

					// Avoid setting ret to empty string here
					// so we don't default to auto
					if (ret == null && style && style[name]) {
						ret = style[name];
					}

					// From the awesome hack by Dean Edwards
					// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

					// If we're not dealing with a regular pixel number
					// but a number that has a weird ending, we need to convert it to pixels
					// but not position css attributes, as those are proportional to the parent element instead
					// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
					if (rnumnonpx.test(ret) && !rposition.test(name)) {

						// Remember the original values
						left = style.left;
						rs = elem.runtimeStyle;
						rsLeft = rs && rs.left;

						// Put in the new values to get a computed value out
						if (rsLeft) {
							rs.left = elem.currentStyle.left;
						}
						style.left = name === "fontSize" ? "1em" : ret;
						ret = style.pixelLeft + "px";

						// Revert the changed values
						style.left = left;
						if (rsLeft) {
							rs.left = rsLeft;
						}
					}

					return ret === "" ? "auto" : ret;
				};
			}

			function setPositiveNumber(elem, value, subtract) {
				var matches = rnumsplit.exec(value);
				return matches ?
					// Guard against undefined "subtract", e.g., when used as in cssHooks
					Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || "px") :
					value;
			}

			function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
				var i = extra === (isBorderBox ? "border" : "content") ?
					// If we already have the right measurement, avoid augmentation
					4 :
					// Otherwise initialize for horizontal or vertical properties
					name === "width" ? 1 : 0,

					val = 0;

				for (; i < 4; i += 2) {
					// both box models exclude margin, so add it if we want it
					if (extra === "margin") {
						val += jQuery.css(elem, extra + cssExpand[i], true, styles);
					}

					if (isBorderBox) {
						// border-box includes padding, so remove it if we want content
						if (extra === "content") {
							val -= jQuery.css(elem, "padding" + cssExpand[i], true, styles);
						}

						// at this point, extra isn't border nor margin, so remove border
						if (extra !== "margin") {
							val -= jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
						}
					} else {
						// at this point, extra isn't content, so add padding
						val += jQuery.css(elem, "padding" + cssExpand[i], true, styles);

						// at this point, extra isn't content nor padding, so add border
						if (extra !== "padding") {
							val += jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
						}
					}
				}

				return val;
			}

			function getWidthOrHeight(elem, name, extra) {

				// Start with offset property, which is equivalent to the border-box value
				var valueIsBorderBox = true,
					val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
					styles = getStyles(elem),
					isBorderBox = jQuery.support.boxSizing && jQuery.css(elem, "boxSizing", false, styles) === "border-box";

				// some non-html elements return undefined for offsetWidth, so check for null/undefined
				// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
				// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
				if (val <= 0 || val == null) {
					// Fall back to computed then uncomputed css if necessary
					val = curCSS(elem, name, styles);
					if (val < 0 || val == null) {
						val = elem.style[name];
					}

					// Computed unit is not pixels. Stop here and return.
					if (rnumnonpx.test(val)) {
						return val;
					}

					// we need the check for style in case a browser which returns unreliable values
					// for getComputedStyle silently falls back to the reliable elem.style
					valueIsBorderBox = isBorderBox && (jQuery.support.boxSizingReliable || val === elem.style[name]);

					// Normalize "", auto, and prepare for extra
					val = parseFloat(val) || 0;
				}

				// use the active box-sizing model to add/subtract irrelevant styles
				return (val +
					augmentWidthOrHeight(
						elem,
						name,
						extra || (isBorderBox ? "border" : "content"),
						valueIsBorderBox,
						styles
					)
				) + "px";
			}

			// Try to determine the default display value of an element
			function css_defaultDisplay(nodeName) {
				var doc = document,
					display = elemdisplay[nodeName];

				if (!display) {
					display = actualDisplay(nodeName, doc);

					// If the simple way fails, read from inside an iframe
					if (display === "none" || !display) {
						// Use the already-created iframe if possible
						iframe = (iframe ||
							jQuery("<iframe frameborder='0' width='0' height='0'/>")
							.css("cssText", "display:block !important")
						).appendTo(doc.documentElement);

						// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
						doc = (iframe[0].contentWindow || iframe[0].contentDocument).document;
						doc.write("<!doctype html><html><body>");
						doc.close();

						display = actualDisplay(nodeName, doc);
						iframe.detach();
					}

					// Store the correct default display
					elemdisplay[nodeName] = display;
				}

				return display;
			}

			// Called ONLY from within css_defaultDisplay
			function actualDisplay(name, doc) {
				var elem = jQuery(doc.createElement(name)).appendTo(doc.body),
					display = jQuery.css(elem[0], "display");
				elem.remove();
				return display;
			}

			jQuery.each(["height", "width"], function(i, name) {
				jQuery.cssHooks[name] = {
					get: function(elem, computed, extra) {
						if (computed) {
							// certain elements can have dimension info if we invisibly show them
							// however, it must have a current display style that would benefit from this
							return elem.offsetWidth === 0 && rdisplayswap.test(jQuery.css(elem, "display")) ?
								jQuery.swap(elem, cssShow, function() {
									return getWidthOrHeight(elem, name, extra);
								}) :
								getWidthOrHeight(elem, name, extra);
						}
					},

					set: function(elem, value, extra) {
						var styles = extra && getStyles(elem);
						return setPositiveNumber(elem, value, extra ?
							augmentWidthOrHeight(
								elem,
								name,
								extra,
								jQuery.support.boxSizing && jQuery.css(elem, "boxSizing", false, styles) === "border-box",
								styles
							) : 0
						);
					}
				};
			});

			if (!jQuery.support.opacity) {
				jQuery.cssHooks.opacity = {
					get: function(elem, computed) {
						// IE uses filters for opacity
						return ropacity.test((computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "") ?
							(0.01 * parseFloat(RegExp.$1)) + "" :
							computed ? "1" : "";
					},

					set: function(elem, value) {
						var style = elem.style,
							currentStyle = elem.currentStyle,
							opacity = jQuery.isNumeric(value) ? "alpha(opacity=" + value * 100 + ")" : "",
							filter = currentStyle && currentStyle.filter || style.filter || "";

						// IE has trouble with opacity if it does not have layout
						// Force it by setting the zoom level
						style.zoom = 1;

						// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
						// if value === "", then remove inline opacity #12685
						if ((value >= 1 || value === "") &&
							jQuery.trim(filter.replace(ralpha, "")) === "" &&
							style.removeAttribute) {

							// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
							// if "filter:" is present at all, clearType is disabled, we want to avoid this
							// style.removeAttribute is IE Only, but so apparently is this code path...
							style.removeAttribute("filter");

							// if there is no filter style applied in a css rule or unset inline opacity, we are done
							if (value === "" || currentStyle && !currentStyle.filter) {
								return;
							}
						}

						// otherwise, set new filter values
						style.filter = ralpha.test(filter) ?
							filter.replace(ralpha, opacity) :
							filter + " " + opacity;
					}
				};
			}

			// These hooks cannot be added until DOM ready because the support test
			// for it is not run until after DOM ready
			jQuery(function() {
				if (!jQuery.support.reliableMarginRight) {
					jQuery.cssHooks.marginRight = {
						get: function(elem, computed) {
							if (computed) {
								// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
								// Work around by temporarily setting element display to inline-block
								return jQuery.swap(elem, {
										"display": "inline-block"
									},
									curCSS, [elem, "marginRight"]);
							}
						}
					};
				}

				// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
				// getComputedStyle returns percent when specified for top/left/bottom/right
				// rather than make the css module depend on the offset module, we just check for it here
				if (!jQuery.support.pixelPosition && jQuery.fn.position) {
					jQuery.each(["top", "left"], function(i, prop) {
						jQuery.cssHooks[prop] = {
							get: function(elem, computed) {
								if (computed) {
									computed = curCSS(elem, prop);
									// if curCSS returns percentage, fallback to offset
									return rnumnonpx.test(computed) ?
										jQuery(elem).position()[prop] + "px" :
										computed;
								}
							}
						};
					});
				}

			});

			if (jQuery.expr && jQuery.expr.filters) {
				jQuery.expr.filters.hidden = function(elem) {
					// Support: Opera <= 12.12
					// Opera reports offsetWidths and offsetHeights less than zero on some elements
					return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||
						(!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css(elem, "display")) === "none");
				};

				jQuery.expr.filters.visible = function(elem) {
					return !jQuery.expr.filters.hidden(elem);
				};
			}

			// These hooks are used by animate to expand properties
			jQuery.each({
				margin: "",
				padding: "",
				border: "Width"
			}, function(prefix, suffix) {
				jQuery.cssHooks[prefix + suffix] = {
					expand: function(value) {
						var i = 0,
							expanded = {},

							// assumes a single number if not a string
							parts = typeof value === "string" ? value.split(" ") : [value];

						for (; i < 4; i++) {
							expanded[prefix + cssExpand[i] + suffix] =
								parts[i] || parts[i - 2] || parts[0];
						}

						return expanded;
					}
				};

				if (!rmargin.test(prefix)) {
					jQuery.cssHooks[prefix + suffix].set = setPositiveNumber;
				}
			});

			var r20 = /%20/g,
				rbracket = /\[\]$/,
				rCRLF = /\r?\n/g,
				rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
				rsubmittable = /^(?:input|select|textarea|keygen)/i;

			jQuery.fn.extend({
				serialize: function() {
					return jQuery.param(this.serializeArray());
				},
				serializeArray: function() {
					return this.map(function() {
							// Can add propHook for "elements" to filter or add form elements
							var elements = jQuery.prop(this, "elements");
							return elements ? jQuery.makeArray(elements) : this;
						})
						.filter(function() {
							var type = this.type;
							// Use .is(":disabled") so that fieldset[disabled] works
							return this.name && !jQuery(this).is(":disabled") &&
								rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) &&
								(this.checked || !manipulation_rcheckableType.test(type));
						})
						.map(function(i, elem) {
							var val = jQuery(this).val();

							return val == null ?
								null :
								jQuery.isArray(val) ?
								jQuery.map(val, function(val) {
									return {
										name: elem.name,
										value: val.replace(rCRLF, "\r\n")
									};
								}) : {
									name: elem.name,
									value: val.replace(rCRLF, "\r\n")
								};
						}).get();
				}
			});

			//Serialize an array of form elements or a set of
			//key/values into a query string
			jQuery.param = function(a, traditional) {
				var prefix,
					s = [],
					add = function(key, value) {
						// If value is a function, invoke it and return its value
						value = jQuery.isFunction(value) ? value() : (value == null ? "" : value);
						s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
					};

				// Set traditional to true for jQuery <= 1.3.2 behavior.
				if (traditional === undefined) {
					traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
				}

				// If an array was passed in, assume that it is an array of form elements.
				if (jQuery.isArray(a) || (a.jquery && !jQuery.isPlainObject(a))) {
					// Serialize the form elements
					jQuery.each(a, function() {
						add(this.name, this.value);
					});

				} else {
					// If traditional, encode the "old" way (the way 1.3.2 or older
					// did it), otherwise encode params recursively.
					for (prefix in a) {
						buildParams(prefix, a[prefix], traditional, add);
					}
				}

				// Return the resulting serialization
				return s.join("&").replace(r20, "+");
			};

			function buildParams(prefix, obj, traditional, add) {
				var name;

				if (jQuery.isArray(obj)) {
					// Serialize array item.
					jQuery.each(obj, function(i, v) {
						if (traditional || rbracket.test(prefix)) {
							// Treat each array item as a scalar.
							add(prefix, v);

						} else {
							// Item is non-scalar (array or object), encode its numeric index.
							buildParams(prefix + "[" + (typeof v === "object" ? i : "") + "]", v, traditional, add);
						}
					});

				} else if (!traditional && jQuery.type(obj) === "object") {
					// Serialize object item.
					for (name in obj) {
						buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
					}

				} else {
					// Serialize scalar item.
					add(prefix, obj);
				}
			}
			// 合并 15 种事件统一增加到 jQuery.fn 上
			jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
				"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
				"change select submit keydown keypress keyup error contextmenu").split(" "), function(i, name) {

				// Handle event binding
				jQuery.fn[name] = function(data, fn) {
					// 内部调用this.on / this.trigger
					return arguments.length > 0 ?
						this.on(name, null, data, fn) :
						this.trigger(name);
				};
			});

			jQuery.fn.extend({
				hover: function(fnOver, fnOut) {
					return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
				},
				// bind 与 unbind 内部调用的 this.on/this.off
				// bind() 方法用于直接附加一个事件处理程序到元素上
				// 处理程序附加到 jQuery 对象中当前选中的元素，所以，在 .bind() 绑定事件的时候，这些元素必须已经存在
				// 没利用委托机制
				bind: function(types, data, fn) {
					return this.on(types, null, data, fn);
				},
				unbind: function(types, fn) {
					return this.off(types, null, fn);
				},

				// 同样调用的 this.on/this.off
				// 所有匹配选择器（selector参数）的元素绑定一个或多个事件处理函数，基于一个指定的根元素的子集，
				// 匹配的元素包括那些目前已经匹配到的元素，也包括那些今后可能匹配到的元素
				delegate: function(selector, types, data, fn) {
					return this.on(types, selector, data, fn);
				},
				undelegate: function(selector, types, fn) {
					// ( namespace ) or ( selector, types [, fn] )
					return arguments.length === 1 ? this.off(selector, "**") : this.off(types, selector || "**", fn);
				}
			});
			var
			// Document location
				ajaxLocParts,
				ajaxLocation,
				ajax_nonce = jQuery.now(),

				ajax_rquery = /\?/,
				rhash = /#.*$/,
				rts = /([?&])_=[^&]*/,
				rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
				// #7653, #8125, #8152: local protocol detection
				rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
				rnoContent = /^(?:GET|HEAD)$/,
				rprotocol = /^\/\//,
				rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

				// Keep a copy of the old load method
				_load = jQuery.fn.load,

				/* Prefilters
				 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
				 * 2) These are called:
				 *    - BEFORE asking for a transport
				 *    - AFTER param serialization (s.data is a string if s.processData is true)
				 * 3) key is the dataType
				 * 4) the catchall symbol "*" can be used
				 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
				 */
				prefilters = {},

				/* Transports bindings
				 * 1) key is the dataType
				 * 2) the catchall symbol "*" can be used
				 * 3) selection will start with transport dataType and THEN go to "*" if needed
				 */
				transports = {},

				// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
				allTypes = "*/".concat("*");

			// #8138, IE may throw an exception when accessing
			// a field from window.location if document.domain has been set
			try {
				ajaxLocation = location.href;
			} catch (e) {
				// Use the href attribute of an A element
				// since IE will modify it given document.location
				ajaxLocation = document.createElement("a");
				ajaxLocation.href = "";
				ajaxLocation = ajaxLocation.href;
			}

			// Segment location into parts
			ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];

			// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
			function addToPrefiltersOrTransports(structure) {

				// dataTypeExpression is optional and defaults to "*"
				return function(dataTypeExpression, func) {

					if (typeof dataTypeExpression !== "string") {
						func = dataTypeExpression;
						dataTypeExpression = "*";
					}

					var dataType,
						i = 0,
						dataTypes = dataTypeExpression.toLowerCase().match(core_rnotwhite) || [];

					if (jQuery.isFunction(func)) {
						// For each dataType in the dataTypeExpression
						while ((dataType = dataTypes[i++])) {
							// Prepend if requested
							if (dataType[0] === "+") {
								dataType = dataType.slice(1) || "*";
								(structure[dataType] = structure[dataType] || []).unshift(func);

								// Otherwise append
							} else {
								(structure[dataType] = structure[dataType] || []).push(func);
							}
						}
					}
				};
			}

			// Base inspection function for prefilters and transports
			function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {

				var inspected = {},
					seekingTransport = (structure === transports);

				function inspect(dataType) {
					var selected;
					inspected[dataType] = true;
					jQuery.each(structure[dataType] || [], function(_, prefilterOrFactory) {
						var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
						if (typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[dataTypeOrTransport]) {
							options.dataTypes.unshift(dataTypeOrTransport);
							inspect(dataTypeOrTransport);
							return false;
						} else if (seekingTransport) {
							return !(selected = dataTypeOrTransport);
						}
					});
					return selected;
				}

				return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
			}

			// A special extend for ajax options
			// that takes "flat" options (not to be deep extended)
			// Fixes #9887
			function ajaxExtend(target, src) {
				var deep, key,
					flatOptions = jQuery.ajaxSettings.flatOptions || {};

				for (key in src) {
					if (src[key] !== undefined) {
						(flatOptions[key] ? target : (deep || (deep = {})))[key] = src[key];
					}
				}
				if (deep) {
					jQuery.extend(true, target, deep);
				}

				return target;
			}

			jQuery.fn.load = function(url, params, callback) {
				if (typeof url !== "string" && _load) {
					return _load.apply(this, arguments);
				}

				var selector, response, type,
					self = this,
					off = url.indexOf(" ");

				if (off >= 0) {
					selector = url.slice(off, url.length);
					url = url.slice(0, off);
				}

				// If it's a function
				if (jQuery.isFunction(params)) {

					// We assume that it's the callback
					callback = params;
					params = undefined;

					// Otherwise, build a param string
				} else if (params && typeof params === "object") {
					type = "POST";
				}

				// If we have elements to modify, make the request
				if (self.length > 0) {
					jQuery.ajax({
						url: url,

						// if "type" variable is undefined, then "GET" method will be used
						type: type,
						dataType: "html",
						data: params
					}).done(function(responseText) {

						// Save response for use in complete callback
						response = arguments;

						self.html(selector ?

							// If a selector was specified, locate the right elements in a dummy div
							// Exclude scripts to avoid IE 'Permission Denied' errors
							jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) :

							// Otherwise use the full result
							responseText);

					}).complete(callback && function(jqXHR, status) {
						self.each(callback, response || [jqXHR.responseText, status, jqXHR]);
					});
				}

				return this;
			};

			// Attach a bunch of functions for handling common AJAX events
			jQuery.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(i, type) {
				jQuery.fn[type] = function(fn) {
					return this.on(type, fn);
				};
			});

			jQuery.extend({

				// Counter for holding the number of active queries
				active: 0,

				// Last-Modified header cache for next request
				lastModified: {},
				etag: {},

				ajaxSettings: {
					url: ajaxLocation,
					type: "GET",
					isLocal: rlocalProtocol.test(ajaxLocParts[1]),
					global: true,
					processData: true,
					async: true,
					contentType: "application/x-www-form-urlencoded; charset=UTF-8",
					/*
					timeout: 0,
					data: null,
					dataType: null,
					username: null,
					password: null,
					cache: null,
					throws: false,
					traditional: false,
					headers: {},
					*/

					accepts: {
						"*": allTypes,
						text: "text/plain",
						html: "text/html",
						xml: "application/xml, text/xml",
						json: "application/json, text/javascript"
					},

					contents: {
						xml: /xml/,
						html: /html/,
						json: /json/
					},

					responseFields: {
						xml: "responseXML",
						text: "responseText",
						json: "responseJSON"
					},

					// Data converters
					// Keys separate source (or catchall "*") and destination types with a single space
					converters: {

						// Convert anything to text
						"* text": String,

						// Text to html (true = no transformation)
						"text html": true,

						// Evaluate text as a json expression
						"text json": jQuery.parseJSON,

						// Parse text as xml
						"text xml": jQuery.parseXML
					},

					// For options that shouldn't be deep extended:
					// you can add your own custom options here if
					// and when you create one that shouldn't be
					// deep extended (see ajaxExtend)
					flatOptions: {
						url: true,
						context: true
					}
				},

				// Creates a full fledged settings object into target
				// with both ajaxSettings and settings fields.
				// If target is omitted, writes into ajaxSettings.
				ajaxSetup: function(target, settings) {
					return settings ?

						// Building a settings object
						ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) :

						// Extending ajaxSettings
						ajaxExtend(jQuery.ajaxSettings, target);
				},

				ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
				ajaxTransport: addToPrefiltersOrTransports(transports),

				// Main method
				ajax: function(url, options) {

					// If url is an object, simulate pre-1.5 signature
					if (typeof url === "object") {
						options = url;
						url = undefined;
					}

					// Force options to be an object
					options = options || {};

					var // Cross-domain detection vars
						parts,
						// Loop variable
						i,
						// URL without anti-cache param
						cacheURL,
						// Response headers as string
						responseHeadersString,
						// timeout handle
						timeoutTimer,

						// To know if global events are to be dispatched
						fireGlobals,

						transport,
						// Response headers
						responseHeaders,
						// Create the final options object
						s = jQuery.ajaxSetup({}, options),
						// Callbacks context
						callbackContext = s.context || s,
						// Context for global events is callbackContext if it is a DOM node or jQuery collection
						globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ?
						jQuery(callbackContext) :
						jQuery.event,
						// Deferreds
						deferred = jQuery.Deferred(),
						completeDeferred = jQuery.Callbacks("once memory"),
						// Status-dependent callbacks
						statusCode = s.statusCode || {},
						// Headers (they are sent all at once)
						requestHeaders = {},
						requestHeadersNames = {},
						// The jqXHR state
						state = 0,
						// Default abort message
						strAbort = "canceled",
						// Fake xhr
						jqXHR = {
							readyState: 0,

							// Builds headers hashtable if needed
							getResponseHeader: function(key) {
								var match;
								if (state === 2) {
									if (!responseHeaders) {
										responseHeaders = {};
										while ((match = rheaders.exec(responseHeadersString))) {
											responseHeaders[match[1].toLowerCase()] = match[2];
										}
									}
									match = responseHeaders[key.toLowerCase()];
								}
								return match == null ? null : match;
							},

							// Raw string
							getAllResponseHeaders: function() {
								return state === 2 ? responseHeadersString : null;
							},

							// Caches the header
							setRequestHeader: function(name, value) {
								var lname = name.toLowerCase();
								if (!state) {
									name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
									requestHeaders[name] = value;
								}
								return this;
							},

							// Overrides response content-type header
							overrideMimeType: function(type) {
								if (!state) {
									s.mimeType = type;
								}
								return this;
							},

							// Status-dependent callbacks
							statusCode: function(map) {
								var code;
								if (map) {
									if (state < 2) {
										for (code in map) {
											// Lazy-add the new callback in a way that preserves old ones
											statusCode[code] = [statusCode[code], map[code]];
										}
									} else {
										// Execute the appropriate callbacks
										jqXHR.always(map[jqXHR.status]);
									}
								}
								return this;
							},

							// Cancel the request
							abort: function(statusText) {
								var finalText = statusText || strAbort;
								if (transport) {
									transport.abort(finalText);
								}
								done(0, finalText);
								return this;
							}
						};

					// Attach deferreds
					deferred.promise(jqXHR).complete = completeDeferred.add;
					jqXHR.success = jqXHR.done;
					jqXHR.error = jqXHR.fail;

					// Remove hash character (#7531: and string promotion)
					// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
					// Handle falsy url in the settings object (#10093: consistency with old signature)
					// We also use the url parameter if available
					s.url = ((url || s.url || ajaxLocation) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");

					// Alias method option to type as per ticket #12004
					s.type = options.method || options.type || s.method || s.type;

					// Extract dataTypes list
					s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().match(core_rnotwhite) || [""];

					// A cross-domain request is in order when we have a protocol:host:port mismatch
					if (s.crossDomain == null) {
						parts = rurl.exec(s.url.toLowerCase());
						s.crossDomain = !!(parts &&
							(parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] ||
								(parts[3] || (parts[1] === "http:" ? "80" : "443")) !==
								(ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? "80" : "443")))
						);
					}

					// Convert data if not already a string
					if (s.data && s.processData && typeof s.data !== "string") {
						s.data = jQuery.param(s.data, s.traditional);
					}

					// Apply prefilters
					inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);

					// If request was aborted inside a prefilter, stop there
					if (state === 2) {
						return jqXHR;
					}

					// We can fire global events as of now if asked to
					fireGlobals = s.global;

					// Watch for a new set of requests
					if (fireGlobals && jQuery.active++ === 0) {
						jQuery.event.trigger("ajaxStart");
					}

					// Uppercase the type
					s.type = s.type.toUpperCase();

					// Determine if request has content
					s.hasContent = !rnoContent.test(s.type);

					// Save the URL in case we're toying with the If-Modified-Since
					// and/or If-None-Match header later on
					cacheURL = s.url;

					// More options handling for requests with no content
					if (!s.hasContent) {

						// If data is available, append data to url
						if (s.data) {
							cacheURL = (s.url += (ajax_rquery.test(cacheURL) ? "&" : "?") + s.data);
							// #9682: remove data so that it's not used in an eventual retry
							delete s.data;
						}

						// Add anti-cache in url if needed
						if (s.cache === false) {
							s.url = rts.test(cacheURL) ?

								// If there is already a '_' parameter, set its value
								cacheURL.replace(rts, "$1_=" + ajax_nonce++) :

								// Otherwise add one to the end
								cacheURL + (ajax_rquery.test(cacheURL) ? "&" : "?") + "_=" + ajax_nonce++;
						}
					}

					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if (s.ifModified) {
						if (jQuery.lastModified[cacheURL]) {
							jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[cacheURL]);
						}
						if (jQuery.etag[cacheURL]) {
							jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL]);
						}
					}

					// Set the correct header, if data is being sent
					if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
						jqXHR.setRequestHeader("Content-Type", s.contentType);
					}

					// Set the Accepts header for the server, depending on the dataType
					jqXHR.setRequestHeader(
						"Accept",
						s.dataTypes[0] && s.accepts[s.dataTypes[0]] ?
						s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") :
						s.accepts["*"]
					);

					// Check for headers option
					for (i in s.headers) {
						jqXHR.setRequestHeader(i, s.headers[i]);
					}

					// Allow custom headers/mimetypes and early abort
					if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
						// Abort if not done already and return
						return jqXHR.abort();
					}

					// aborting is no longer a cancellation
					strAbort = "abort";

					// Install callbacks on deferreds
					for (i in {
							success: 1,
							error: 1,
							complete: 1
						}) {
						jqXHR[i](s[i]);
					}

					// Get transport
					transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);

					// If no transport, we auto-abort
					if (!transport) {
						done(-1, "No Transport");
					} else {
						jqXHR.readyState = 1;

						// Send global event
						if (fireGlobals) {
							globalEventContext.trigger("ajaxSend", [jqXHR, s]);
						}
						// Timeout
						if (s.async && s.timeout > 0) {
							timeoutTimer = setTimeout(function() {
								jqXHR.abort("timeout");
							}, s.timeout);
						}

						try {
							state = 1;
							transport.send(requestHeaders, done);
						} catch (e) {
							// Propagate exception as error if not done
							if (state < 2) {
								done(-1, e);
								// Simply rethrow otherwise
							} else {
								throw e;
							}
						}
					}

					// Callback for when everything is done
					function done(status, nativeStatusText, responses, headers) {
						var isSuccess, success, error, response, modified,
							statusText = nativeStatusText;

						// Called once
						if (state === 2) {
							return;
						}

						// State is "done" now
						state = 2;

						// Clear timeout if it exists
						if (timeoutTimer) {
							clearTimeout(timeoutTimer);
						}

						// Dereference transport for early garbage collection
						// (no matter how long the jqXHR object will be used)
						transport = undefined;

						// Cache response headers
						responseHeadersString = headers || "";

						// Set readyState
						jqXHR.readyState = status > 0 ? 4 : 0;

						// Determine if successful
						isSuccess = status >= 200 && status < 300 || status === 304;

						// Get response data
						if (responses) {
							response = ajaxHandleResponses(s, jqXHR, responses);
						}

						// Convert no matter what (that way responseXXX fields are always set)
						response = ajaxConvert(s, response, jqXHR, isSuccess);

						// If successful, handle type chaining
						if (isSuccess) {

							// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
							if (s.ifModified) {
								modified = jqXHR.getResponseHeader("Last-Modified");
								if (modified) {
									jQuery.lastModified[cacheURL] = modified;
								}
								modified = jqXHR.getResponseHeader("etag");
								if (modified) {
									jQuery.etag[cacheURL] = modified;
								}
							}

							// if no content
							if (status === 204 || s.type === "HEAD") {
								statusText = "nocontent";

								// if not modified
							} else if (status === 304) {
								statusText = "notmodified";

								// If we have data, let's convert it
							} else {
								statusText = response.state;
								success = response.data;
								error = response.error;
								isSuccess = !error;
							}
						} else {
							// We extract error from statusText
							// then normalize statusText and status for non-aborts
							error = statusText;
							if (status || !statusText) {
								statusText = "error";
								if (status < 0) {
									status = 0;
								}
							}
						}

						// Set data for the fake xhr object
						jqXHR.status = status;
						jqXHR.statusText = (nativeStatusText || statusText) + "";

						// Success/Error
						if (isSuccess) {
							deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
						} else {
							deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
						}

						// Status-dependent callbacks
						jqXHR.statusCode(statusCode);
						statusCode = undefined;

						if (fireGlobals) {
							globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [jqXHR, s, isSuccess ? success : error]);
						}

						// Complete
						completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);

						if (fireGlobals) {
							globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
							// Handle the global AJAX counter
							if (!(--jQuery.active)) {
								jQuery.event.trigger("ajaxStop");
							}
						}
					}

					return jqXHR;
				},

				getJSON: function(url, data, callback) {
					return jQuery.get(url, data, callback, "json");
				},

				getScript: function(url, callback) {
					return jQuery.get(url, undefined, callback, "script");
				}
			});

			jQuery.each(["get", "post"], function(i, method) {
				jQuery[method] = function(url, data, callback, type) {
					// shift arguments if data argument was omitted
					if (jQuery.isFunction(data)) {
						type = type || callback;
						callback = data;
						data = undefined;
					}

					return jQuery.ajax({
						url: url,
						type: method,
						dataType: type,
						data: data,
						success: callback
					});
				};
			});

			/* Handles responses to an ajax request:
			 * - finds the right dataType (mediates between content-type and expected dataType)
			 * - returns the corresponding response
			 */
			function ajaxHandleResponses(s, jqXHR, responses) {
				var firstDataType, ct, finalDataType, type,
					contents = s.contents,
					dataTypes = s.dataTypes;

				// Remove auto dataType and get content-type in the process
				while (dataTypes[0] === "*") {
					dataTypes.shift();
					if (ct === undefined) {
						ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
					}
				}

				// Check if we're dealing with a known content-type
				if (ct) {
					for (type in contents) {
						if (contents[type] && contents[type].test(ct)) {
							dataTypes.unshift(type);
							break;
						}
					}
				}

				// Check to see if we have a response for the expected dataType
				if (dataTypes[0] in responses) {
					finalDataType = dataTypes[0];
				} else {
					// Try convertible dataTypes
					for (type in responses) {
						if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
							finalDataType = type;
							break;
						}
						if (!firstDataType) {
							firstDataType = type;
						}
					}
					// Or just use first one
					finalDataType = finalDataType || firstDataType;
				}

				// If we found a dataType
				// We add the dataType to the list if needed
				// and return the corresponding response
				if (finalDataType) {
					if (finalDataType !== dataTypes[0]) {
						dataTypes.unshift(finalDataType);
					}
					return responses[finalDataType];
				}
			}

			/* Chain conversions given the request and the original response
			 * Also sets the responseXXX fields on the jqXHR instance
			 */
			function ajaxConvert(s, response, jqXHR, isSuccess) {
				var conv2, current, conv, tmp, prev,
					converters = {},
					// Work with a copy of dataTypes in case we need to modify it for conversion
					dataTypes = s.dataTypes.slice();

				// Create converters map with lowercased keys
				if (dataTypes[1]) {
					for (conv in s.converters) {
						converters[conv.toLowerCase()] = s.converters[conv];
					}
				}

				current = dataTypes.shift();

				// Convert to each sequential dataType
				while (current) {

					if (s.responseFields[current]) {
						jqXHR[s.responseFields[current]] = response;
					}

					// Apply the dataFilter if provided
					if (!prev && isSuccess && s.dataFilter) {
						response = s.dataFilter(response, s.dataType);
					}

					prev = current;
					current = dataTypes.shift();

					if (current) {

						// There's only work to do if current dataType is non-auto
						if (current === "*") {

							current = prev;

							// Convert response if prev dataType is non-auto and differs from current
						} else if (prev !== "*" && prev !== current) {

							// Seek a direct converter
							conv = converters[prev + " " + current] || converters["* " + current];

							// If none found, seek a pair
							if (!conv) {
								for (conv2 in converters) {

									// If conv2 outputs current
									tmp = conv2.split(" ");
									if (tmp[1] === current) {

										// If prev can be converted to accepted input
										conv = converters[prev + " " + tmp[0]] ||
											converters["* " + tmp[0]];
										if (conv) {
											// Condense equivalence converters
											if (conv === true) {
												conv = converters[conv2];

												// Otherwise, insert the intermediate dataType
											} else if (converters[conv2] !== true) {
												current = tmp[0];
												dataTypes.unshift(tmp[1]);
											}
											break;
										}
									}
								}
							}

							// Apply converter (if not an equivalence)
							if (conv !== true) {

								// Unless errors are allowed to bubble, catch and return them
								if (conv && s["throws"]) {
									response = conv(response);
								} else {
									try {
										response = conv(response);
									} catch (e) {
										return {
											state: "parsererror",
											error: conv ? e : "No conversion from " + prev + " to " + current
										};
									}
								}
							}
						}
					}
				}

				return {
					state: "success",
					data: response
				};
			}
			// Install script dataType
			jQuery.ajaxSetup({
				accepts: {
					script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
				},
				contents: {
					script: /(?:java|ecma)script/
				},
				converters: {
					"text script": function(text) {
						jQuery.globalEval(text);
						return text;
					}
				}
			});

			// Handle cache's special case and global
			jQuery.ajaxPrefilter("script", function(s) {
				if (s.cache === undefined) {
					s.cache = false;
				}
				if (s.crossDomain) {
					s.type = "GET";
					s.global = false;
				}
			});

			// Bind script tag hack transport
			jQuery.ajaxTransport("script", function(s) {

				// This transport only deals with cross domain requests
				if (s.crossDomain) {

					var script,
						head = document.head || jQuery("head")[0] || document.documentElement;

					return {

						send: function(_, callback) {

							script = document.createElement("script");

							script.async = true;

							if (s.scriptCharset) {
								script.charset = s.scriptCharset;
							}

							script.src = s.url;

							// Attach handlers for all browsers
							script.onload = script.onreadystatechange = function(_, isAbort) {

								if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {

									// Handle memory leak in IE
									script.onload = script.onreadystatechange = null;

									// Remove the script
									if (script.parentNode) {
										script.parentNode.removeChild(script);
									}

									// Dereference the script
									script = null;

									// Callback if not abort
									if (!isAbort) {
										callback(200, "success");
									}
								}
							};

							// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
							// Use native DOM manipulation to avoid our domManip AJAX trickery
							head.insertBefore(script, head.firstChild);
						},

						abort: function() {
							if (script) {
								script.onload(undefined, true);
							}
						}
					};
				}
			});
			var oldCallbacks = [],
				rjsonp = /(=)\?(?=&|$)|\?\?/;

			// Default jsonp settings
			jQuery.ajaxSetup({
				jsonp: "callback",
				jsonpCallback: function() {
					var callback = oldCallbacks.pop() || (jQuery.expando + "_" + (ajax_nonce++));
					this[callback] = true;
					return callback;
				}
			});

			// Detect, normalize options and install callbacks for jsonp requests
			jQuery.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {

				var callbackName, overwritten, responseContainer,
					jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ?
						"url" :
						typeof s.data === "string" && !(s.contentType || "").indexOf("application/x-www-form-urlencoded") && rjsonp.test(s.data) && "data"
					);

				// Handle iff the expected data type is "jsonp" or we have a parameter to set
				if (jsonProp || s.dataTypes[0] === "jsonp") {

					// Get callback name, remembering preexisting value associated with it
					callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ?
						s.jsonpCallback() :
						s.jsonpCallback;

					// Insert callback into url or form data
					if (jsonProp) {
						s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
					} else if (s.jsonp !== false) {
						s.url += (ajax_rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
					}

					// Use data converter to retrieve json after script execution
					s.converters["script json"] = function() {
						if (!responseContainer) {
							jQuery.error(callbackName + " was not called");
						}
						return responseContainer[0];
					};

					// force json dataType
					s.dataTypes[0] = "json";

					// Install callback
					overwritten = window[callbackName];
					window[callbackName] = function() {
						responseContainer = arguments;
					};

					// Clean-up function (fires after converters)
					jqXHR.always(function() {
						// Restore preexisting value
						window[callbackName] = overwritten;

						// Save back as free
						if (s[callbackName]) {
							// make sure that re-using the options doesn't screw things around
							s.jsonpCallback = originalSettings.jsonpCallback;

							// save the callback name for future use
							oldCallbacks.push(callbackName);
						}

						// Call if it was a function and we have a response
						if (responseContainer && jQuery.isFunction(overwritten)) {
							overwritten(responseContainer[0]);
						}

						responseContainer = overwritten = undefined;
					});

					// Delegate to script
					return "script";
				}
			});
			var xhrCallbacks, xhrSupported,
				xhrId = 0,
				// #5280: Internet Explorer will keep connections alive if we don't abort on unload
				xhrOnUnloadAbort = window.ActiveXObject && function() {
					// Abort all pending requests
					var key;
					for (key in xhrCallbacks) {
						xhrCallbacks[key](undefined, true);
					}
				};

			// Functions to create xhrs
			function createStandardXHR() {
				try {
					return new window.XMLHttpRequest();
				} catch (e) {}
			}

			function createActiveXHR() {
				try {
					return new window.ActiveXObject("Microsoft.XMLHTTP");
				} catch (e) {}
			}

			// Create the request object
			// (This is still attached to ajaxSettings for backward compatibility)
			jQuery.ajaxSettings.xhr = window.ActiveXObject ?
			/* Microsoft failed to properly
			 * implement the XMLHttpRequest in IE7 (can't request local files),
			 * so we use the ActiveXObject when it is available
			 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
			 * we need a fallback.
			 */
			function() {
				return !this.isLocal && createStandardXHR() || createActiveXHR();
			} :
			// For all other browsers, use the standard XMLHttpRequest object
			createStandardXHR;

			// Determine support properties
			xhrSupported = jQuery.ajaxSettings.xhr(); jQuery.support.cors = !!xhrSupported && ("withCredentials" in xhrSupported); xhrSupported = jQuery.support.ajax = !!xhrSupported;

			// Create transport if the browser can provide an xhr
			if (xhrSupported) {

				jQuery.ajaxTransport(function(s) {
					// Cross domain only allowed if supported through XMLHttpRequest
					if (!s.crossDomain || jQuery.support.cors) {

						var callback;

						return {
							send: function(headers, complete) {

								// Get a new xhr
								var handle, i,
									xhr = s.xhr();

								// Open the socket
								// Passing null username, generates a login popup on Opera (#2865)
								if (s.username) {
									xhr.open(s.type, s.url, s.async, s.username, s.password);
								} else {
									xhr.open(s.type, s.url, s.async);
								}

								// Apply custom fields if provided
								if (s.xhrFields) {
									for (i in s.xhrFields) {
										xhr[i] = s.xhrFields[i];
									}
								}

								// Override mime type if needed
								if (s.mimeType && xhr.overrideMimeType) {
									xhr.overrideMimeType(s.mimeType);
								}

								// X-Requested-With header
								// For cross-domain requests, seeing as conditions for a preflight are
								// akin to a jigsaw puzzle, we simply never set it to be sure.
								// (it can always be set on a per-request basis or even using ajaxSetup)
								// For same-domain requests, won't change header if already provided.
								if (!s.crossDomain && !headers["X-Requested-With"]) {
									headers["X-Requested-With"] = "XMLHttpRequest";
								}

								// Need an extra try/catch for cross domain requests in Firefox 3
								try {
									for (i in headers) {
										xhr.setRequestHeader(i, headers[i]);
									}
								} catch (err) {}

								// Do send the request
								// This may raise an exception which is actually
								// handled in jQuery.ajax (so no try/catch here)
								xhr.send((s.hasContent && s.data) || null);

								// Listener
								callback = function(_, isAbort) {
									var status, responseHeaders, statusText, responses;

									// Firefox throws exceptions when accessing properties
									// of an xhr when a network error occurred
									// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
									try {

										// Was never called and is aborted or complete
										if (callback && (isAbort || xhr.readyState === 4)) {

											// Only called once
											callback = undefined;

											// Do not keep as active anymore
											if (handle) {
												xhr.onreadystatechange = jQuery.noop;
												if (xhrOnUnloadAbort) {
													delete xhrCallbacks[handle];
												}
											}

											// If it's an abort
											if (isAbort) {
												// Abort it manually if needed
												if (xhr.readyState !== 4) {
													xhr.abort();
												}
											} else {
												responses = {};
												status = xhr.status;
												responseHeaders = xhr.getAllResponseHeaders();

												// When requesting binary data, IE6-9 will throw an exception
												// on any attempt to access responseText (#11426)
												if (typeof xhr.responseText === "string") {
													responses.text = xhr.responseText;
												}

												// Firefox throws an exception when accessing
												// statusText for faulty cross-domain requests
												try {
													statusText = xhr.statusText;
												} catch (e) {
													// We normalize with Webkit giving an empty statusText
													statusText = "";
												}

												// Filter status for non standard behaviors

												// If the request is local and we have data: assume a success
												// (success with no data won't get notified, that's the best we
												// can do given current implementations)
												if (!status && s.isLocal && !s.crossDomain) {
													status = responses.text ? 200 : 404;
													// IE - #1450: sometimes returns 1223 when it should be 204
												} else if (status === 1223) {
													status = 204;
												}
											}
										}
									} catch (firefoxAccessException) {
										if (!isAbort) {
											complete(-1, firefoxAccessException);
										}
									}

									// Call complete if needed
									if (responses) {
										complete(status, statusText, responses, responseHeaders);
									}
								};

								if (!s.async) {
									// if we're in sync mode we fire the callback
									callback();
								} else if (xhr.readyState === 4) {
									// (IE6 & IE7) if it's in cache and has been
									// retrieved directly we need to fire the callback
									setTimeout(callback);
								} else {
									handle = ++xhrId;
									if (xhrOnUnloadAbort) {
										// Create the active xhrs callbacks list if needed
										// and attach the unload handler
										if (!xhrCallbacks) {
											xhrCallbacks = {};
											jQuery(window).unload(xhrOnUnloadAbort);
										}
										// Add to list of active xhrs callbacks
										xhrCallbacks[handle] = callback;
									}
									xhr.onreadystatechange = callback;
								}
							},

							abort: function() {
								if (callback) {
									callback(undefined, true);
								}
							}
						};
					}
				});
			}
			var fxNow, timerId,
				rfxtypes = /^(?:toggle|show|hide)$/,
				rfxnum = new RegExp("^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i"),
				rrun = /queueHooks$/,
				animationPrefilters = [defaultPrefilter],
				tweeners = {
					"*": [function(prop, value) {
						var tween = this.createTween(prop, value),
							target = tween.cur(),
							parts = rfxnum.exec(value),
							unit = parts && parts[3] || (jQuery.cssNumber[prop] ? "" : "px"),

							// Starting value computation is required for potential unit mismatches
							start = (jQuery.cssNumber[prop] || unit !== "px" && +target) &&
							rfxnum.exec(jQuery.css(tween.elem, prop)),
							scale = 1,
							maxIterations = 20;

						if (start && start[3] !== unit) {
							// Trust units reported by jQuery.css
							unit = unit || start[3];

							// Make sure we update the tween properties later on
							parts = parts || [];

							// Iteratively approximate from a nonzero starting point
							start = +target || 1;

							do {
								// If previous iteration zeroed out, double until we get *something*
								// Use a string for doubling factor so we don't accidentally see scale as unchanged below
								scale = scale || ".5";

								// Adjust and apply
								start = start / scale;
								jQuery.style(tween.elem, prop, start + unit);

								// Update scale, tolerating zero or NaN from tween.cur()
								// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
							} while (scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations);
						}

						// Update tween properties
						if (parts) {
							start = tween.start = +start || +target || 0;
							tween.unit = unit;
							// If a +=/-= token was provided, we're doing a relative animation
							tween.end = parts[1] ?
								start + (parts[1] + 1) * parts[2] :
								+parts[2];
						}

						return tween;
					}]
				};

			// Animations created synchronously will run synchronously
			function createFxNow() {
				setTimeout(function() {
					fxNow = undefined;
				});
				return (fxNow = jQuery.now());
			}

			function createTween(value, prop, animation) {
				var tween,
					collection = (tweeners[prop] || []).concat(tweeners["*"]),
					index = 0,
					length = collection.length;
				for (; index < length; index++) {
					if ((tween = collection[index].call(animation, prop, value))) {

						// we're done with this property
						return tween;
					}
				}
			}

			function Animation(elem, properties, options) {
				var result,
					stopped,
					index = 0,
					length = animationPrefilters.length,
					deferred = jQuery.Deferred().always(function() {
						// don't match elem in the :animated selector
						delete tick.elem;
					}),
					tick = function() {
						if (stopped) {
							return false;
						}
						var currentTime = fxNow || createFxNow(),
							remaining = Math.max(0, animation.startTime + animation.duration - currentTime),
							// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
							temp = remaining / animation.duration || 0,
							percent = 1 - temp,
							index = 0,
							length = animation.tweens.length;

						for (; index < length; index++) {
							animation.tweens[index].run(percent);
						}

						deferred.notifyWith(elem, [animation, percent, remaining]);

						if (percent < 1 && length) {
							return remaining;
						} else {
							deferred.resolveWith(elem, [animation]);
							return false;
						}
					},
					animation = deferred.promise({
						elem: elem,
						props: jQuery.extend({}, properties),
						opts: jQuery.extend(true, {
							specialEasing: {}
						}, options),
						originalProperties: properties,
						originalOptions: options,
						startTime: fxNow || createFxNow(),
						duration: options.duration,
						tweens: [],
						createTween: function(prop, end) {
							var tween = jQuery.Tween(elem, animation.opts, prop, end,
								animation.opts.specialEasing[prop] || animation.opts.easing);
							animation.tweens.push(tween);
							return tween;
						},
						stop: function(gotoEnd) {
							var index = 0,
								// if we are going to the end, we want to run all the tweens
								// otherwise we skip this part
								length = gotoEnd ? animation.tweens.length : 0;
							if (stopped) {
								return this;
							}
							stopped = true;
							for (; index < length; index++) {
								animation.tweens[index].run(1);
							}

							// resolve when we played the last frame
							// otherwise, reject
							if (gotoEnd) {
								deferred.resolveWith(elem, [animation, gotoEnd]);
							} else {
								deferred.rejectWith(elem, [animation, gotoEnd]);
							}
							return this;
						}
					}),
					props = animation.props;

				propFilter(props, animation.opts.specialEasing);

				for (; index < length; index++) {
					result = animationPrefilters[index].call(animation, elem, props, animation.opts);
					if (result) {
						return result;
					}
				}

				jQuery.map(props, createTween, animation);

				if (jQuery.isFunction(animation.opts.start)) {
					animation.opts.start.call(elem, animation);
				}

				jQuery.fx.timer(
					jQuery.extend(tick, {
						elem: elem,
						anim: animation,
						queue: animation.opts.queue
					})
				);

				// attach callbacks from options
				return animation.progress(animation.opts.progress)
					.done(animation.opts.done, animation.opts.complete)
					.fail(animation.opts.fail)
					.always(animation.opts.always);
			}

			function propFilter(props, specialEasing) {
				var index, name, easing, value, hooks;

				// camelCase, specialEasing and expand cssHook pass
				for (index in props) {
					name = jQuery.camelCase(index);
					easing = specialEasing[name];
					value = props[index];
					if (jQuery.isArray(value)) {
						easing = value[1];
						value = props[index] = value[0];
					}

					if (index !== name) {
						props[name] = value;
						delete props[index];
					}

					hooks = jQuery.cssHooks[name];
					if (hooks && "expand" in hooks) {
						value = hooks.expand(value);
						delete props[name];

						// not quite $.extend, this wont overwrite keys already present.
						// also - reusing 'index' from above because we have the correct "name"
						for (index in value) {
							if (!(index in props)) {
								props[index] = value[index];
								specialEasing[index] = easing;
							}
						}
					} else {
						specialEasing[name] = easing;
					}
				}
			}

			jQuery.Animation = jQuery.extend(Animation, {

				tweener: function(props, callback) {
					if (jQuery.isFunction(props)) {
						callback = props;
						props = ["*"];
					} else {
						props = props.split(" ");
					}

					var prop,
						index = 0,
						length = props.length;

					for (; index < length; index++) {
						prop = props[index];
						tweeners[prop] = tweeners[prop] || [];
						tweeners[prop].unshift(callback);
					}
				},

				prefilter: function(callback, prepend) {
					if (prepend) {
						animationPrefilters.unshift(callback);
					} else {
						animationPrefilters.push(callback);
					}
				}
			});

			function defaultPrefilter(elem, props, opts) {
				/* jshint validthis: true */
				var prop, value, toggle, tween, hooks, oldfire,
					anim = this,
					orig = {},
					style = elem.style,
					hidden = elem.nodeType && isHidden(elem),
					dataShow = jQuery._data(elem, "fxshow");

				// handle queue: false promises
				if (!opts.queue) {
					hooks = jQuery._queueHooks(elem, "fx");
					if (hooks.unqueued == null) {
						hooks.unqueued = 0;
						oldfire = hooks.empty.fire;
						hooks.empty.fire = function() {
							if (!hooks.unqueued) {
								oldfire();
							}
						};
					}
					hooks.unqueued++;

					anim.always(function() {
						// doing this makes sure that the complete handler will be called
						// before this completes
						anim.always(function() {
							hooks.unqueued--;
							if (!jQuery.queue(elem, "fx").length) {
								hooks.empty.fire();
							}
						});
					});
				}

				// height/width overflow pass
				if (elem.nodeType === 1 && ("height" in props || "width" in props)) {
					// Make sure that nothing sneaks out
					// Record all 3 overflow attributes because IE does not
					// change the overflow attribute when overflowX and
					// overflowY are set to the same value
					opts.overflow = [style.overflow, style.overflowX, style.overflowY];

					// Set display property to inline-block for height/width
					// animations on inline elements that are having width/height animated
					if (jQuery.css(elem, "display") === "inline" &&
						jQuery.css(elem, "float") === "none") {

						// inline-level elements accept inline-block;
						// block-level elements need to be inline with layout
						if (!jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay(elem.nodeName) === "inline") {
							style.display = "inline-block";

						} else {
							style.zoom = 1;
						}
					}
				}

				if (opts.overflow) {
					style.overflow = "hidden";
					if (!jQuery.support.shrinkWrapBlocks) {
						anim.always(function() {
							style.overflow = opts.overflow[0];
							style.overflowX = opts.overflow[1];
							style.overflowY = opts.overflow[2];
						});
					}
				}


				// show/hide pass
				for (prop in props) {
					value = props[prop];
					if (rfxtypes.exec(value)) {
						delete props[prop];
						toggle = toggle || value === "toggle";
						if (value === (hidden ? "hide" : "show")) {
							continue;
						}
						orig[prop] = dataShow && dataShow[prop] || jQuery.style(elem, prop);
					}
				}

				if (!jQuery.isEmptyObject(orig)) {
					if (dataShow) {
						if ("hidden" in dataShow) {
							hidden = dataShow.hidden;
						}
					} else {
						dataShow = jQuery._data(elem, "fxshow", {});
					}

					// store state if its toggle - enables .stop().toggle() to "reverse"
					if (toggle) {
						dataShow.hidden = !hidden;
					}
					if (hidden) {
						jQuery(elem).show();
					} else {
						anim.done(function() {
							jQuery(elem).hide();
						});
					}
					anim.done(function() {
						var prop;
						jQuery._removeData(elem, "fxshow");
						for (prop in orig) {
							jQuery.style(elem, prop, orig[prop]);
						}
					});
					for (prop in orig) {
						tween = createTween(hidden ? dataShow[prop] : 0, prop, anim);

						if (!(prop in dataShow)) {
							dataShow[prop] = tween.start;
							if (hidden) {
								tween.end = tween.start;
								tween.start = prop === "width" || prop === "height" ? 1 : 0;
							}
						}
					}
				}
			}

			function Tween(elem, options, prop, end, easing) {
				return new Tween.prototype.init(elem, options, prop, end, easing);
			}
			jQuery.Tween = Tween;

			Tween.prototype = {
				constructor: Tween,
				init: function(elem, options, prop, end, easing, unit) {
					this.elem = elem;
					this.prop = prop;
					this.easing = easing || "swing";
					this.options = options;
					this.start = this.now = this.cur();
					this.end = end;
					this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px");
				},
				cur: function() {
					var hooks = Tween.propHooks[this.prop];

					return hooks && hooks.get ?
						hooks.get(this) :
						Tween.propHooks._default.get(this);
				},
				run: function(percent) {
					var eased,
						hooks = Tween.propHooks[this.prop];

					if (this.options.duration) {
						this.pos = eased = jQuery.easing[this.easing](
							percent, this.options.duration * percent, 0, 1, this.options.duration
						);
					} else {
						this.pos = eased = percent;
					}
					this.now = (this.end - this.start) * eased + this.start;

					if (this.options.step) {
						this.options.step.call(this.elem, this.now, this);
					}

					if (hooks && hooks.set) {
						hooks.set(this);
					} else {
						Tween.propHooks._default.set(this);
					}
					return this;
				}
			};

			Tween.prototype.init.prototype = Tween.prototype;

			Tween.propHooks = {
				_default: {
					get: function(tween) {
						var result;

						if (tween.elem[tween.prop] != null &&
							(!tween.elem.style || tween.elem.style[tween.prop] == null)) {
							return tween.elem[tween.prop];
						}

						// passing an empty string as a 3rd parameter to .css will automatically
						// attempt a parseFloat and fallback to a string if the parse fails
						// so, simple values such as "10px" are parsed to Float.
						// complex values such as "rotate(1rad)" are returned as is.
						result = jQuery.css(tween.elem, tween.prop, "");
						// Empty strings, null, undefined and "auto" are converted to 0.
						return !result || result === "auto" ? 0 : result;
					},
					set: function(tween) {
						// use step hook for back compat - use cssHook if its there - use .style if its
						// available and use plain properties where available
						if (jQuery.fx.step[tween.prop]) {
							jQuery.fx.step[tween.prop](tween);
						} else if (tween.elem.style && (tween.elem.style[jQuery.cssProps[tween.prop]] != null || jQuery.cssHooks[tween.prop])) {
							jQuery.style(tween.elem, tween.prop, tween.now + tween.unit);
						} else {
							tween.elem[tween.prop] = tween.now;
						}
					}
				}
			};

			// Support: IE <=9
			// Panic based approach to setting things on disconnected nodes

			Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
				set: function(tween) {
					if (tween.elem.nodeType && tween.elem.parentNode) {
						tween.elem[tween.prop] = tween.now;
					}
				}
			};

			jQuery.each(["toggle", "show", "hide"], function(i, name) {
				var cssFn = jQuery.fn[name];
				jQuery.fn[name] = function(speed, easing, callback) {
					return speed == null || typeof speed === "boolean" ?
						cssFn.apply(this, arguments) :
						this.animate(genFx(name, true), speed, easing, callback);
				};
			});

			jQuery.fn.extend({
				fadeTo: function(speed, to, easing, callback) {

					// show any hidden elements after setting opacity to 0
					return this.filter(isHidden).css("opacity", 0).show()

					// animate to the value specified
					.end().animate({
						opacity: to
					}, speed, easing, callback);
				},
				animate: function(prop, speed, easing, callback) {
					var empty = jQuery.isEmptyObject(prop),
						optall = jQuery.speed(speed, easing, callback),
						doAnimation = function() {
							// Operate on a copy of prop so per-property easing won't be lost
							var anim = Animation(this, jQuery.extend({}, prop), optall);

							// Empty animations, or finishing resolves immediately
							if (empty || jQuery._data(this, "finish")) {
								anim.stop(true);
							}
						};
					doAnimation.finish = doAnimation;

					return empty || optall.queue === false ?
						this.each(doAnimation) :
						this.queue(optall.queue, doAnimation);
				},
				stop: function(type, clearQueue, gotoEnd) {
					var stopQueue = function(hooks) {
						var stop = hooks.stop;
						delete hooks.stop;
						stop(gotoEnd);
					};

					if (typeof type !== "string") {
						gotoEnd = clearQueue;
						clearQueue = type;
						type = undefined;
					}
					if (clearQueue && type !== false) {
						this.queue(type || "fx", []);
					}

					return this.each(function() {
						var dequeue = true,
							index = type != null && type + "queueHooks",
							timers = jQuery.timers,
							data = jQuery._data(this);

						if (index) {
							if (data[index] && data[index].stop) {
								stopQueue(data[index]);
							}
						} else {
							for (index in data) {
								if (data[index] && data[index].stop && rrun.test(index)) {
									stopQueue(data[index]);
								}
							}
						}

						for (index = timers.length; index--;) {
							if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
								timers[index].anim.stop(gotoEnd);
								dequeue = false;
								timers.splice(index, 1);
							}
						}

						// start the next in the queue if the last step wasn't forced
						// timers currently will call their complete callbacks, which will dequeue
						// but only if they were gotoEnd
						if (dequeue || !gotoEnd) {
							jQuery.dequeue(this, type);
						}
					});
				},
				finish: function(type) {
					if (type !== false) {
						type = type || "fx";
					}
					return this.each(function() {
						var index,
							data = jQuery._data(this),
							queue = data[type + "queue"],
							hooks = data[type + "queueHooks"],
							timers = jQuery.timers,
							length = queue ? queue.length : 0;

						// enable finishing flag on private data
						data.finish = true;

						// empty the queue first
						jQuery.queue(this, type, []);

						if (hooks && hooks.stop) {
							hooks.stop.call(this, true);
						}

						// look for any active animations, and finish them
						for (index = timers.length; index--;) {
							if (timers[index].elem === this && timers[index].queue === type) {
								timers[index].anim.stop(true);
								timers.splice(index, 1);
							}
						}

						// look for any animations in the old queue and finish them
						for (index = 0; index < length; index++) {
							if (queue[index] && queue[index].finish) {
								queue[index].finish.call(this);
							}
						}

						// turn off finishing flag
						delete data.finish;
					});
				}
			});

			// Generate parameters to create a standard animation
			function genFx(type, includeWidth) {
				var which,
					attrs = {
						height: type
					},
					i = 0;

				// if we include width, step value is 1 to do all cssExpand values,
				// if we don't include width, step value is 2 to skip over Left and Right
				includeWidth = includeWidth ? 1 : 0;
				for (; i < 4; i += 2 - includeWidth) {
					which = cssExpand[i];
					attrs["margin" + which] = attrs["padding" + which] = type;
				}

				if (includeWidth) {
					attrs.opacity = attrs.width = type;
				}

				return attrs;
			}

			// Generate shortcuts for custom animations
			jQuery.each({
				slideDown: genFx("show"),
				slideUp: genFx("hide"),
				slideToggle: genFx("toggle"),
				fadeIn: {
					opacity: "show"
				},
				fadeOut: {
					opacity: "hide"
				},
				fadeToggle: {
					opacity: "toggle"
				}
			}, function(name, props) {
				jQuery.fn[name] = function(speed, easing, callback) {
					return this.animate(props, speed, easing, callback);
				};
			});

			jQuery.speed = function(speed, easing, fn) {
				var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
					complete: fn || !fn && easing ||
						jQuery.isFunction(speed) && speed,
					duration: speed,
					easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
				};

				opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
					opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

				// normalize opt.queue - true/undefined/null -> "fx"
				if (opt.queue == null || opt.queue === true) {
					opt.queue = "fx";
				}

				// Queueing
				opt.old = opt.complete;

				opt.complete = function() {
					if (jQuery.isFunction(opt.old)) {
						opt.old.call(this);
					}

					if (opt.queue) {
						jQuery.dequeue(this, opt.queue);
					}
				};

				return opt;
			};

			jQuery.easing = {
				linear: function(p) {
					return p;
				},
				swing: function(p) {
					return 0.5 - Math.cos(p * Math.PI) / 2;
				}
			};

			jQuery.timers = []; jQuery.fx = Tween.prototype.init; jQuery.fx.tick = function() {
				var timer,
					timers = jQuery.timers,
					i = 0;

				fxNow = jQuery.now();

				for (; i < timers.length; i++) {
					timer = timers[i];
					// Checks the timer has not already been removed
					if (!timer() && timers[i] === timer) {
						timers.splice(i--, 1);
					}
				}

				if (!timers.length) {
					jQuery.fx.stop();
				}
				fxNow = undefined;
			};

			jQuery.fx.timer = function(timer) {
				if (timer() && jQuery.timers.push(timer)) {
					jQuery.fx.start();
				}
			};

			jQuery.fx.interval = 13;

			jQuery.fx.start = function() {
				if (!timerId) {
					timerId = setInterval(jQuery.fx.tick, jQuery.fx.interval);
				}
			};

			jQuery.fx.stop = function() {
				clearInterval(timerId);
				timerId = null;
			};

			jQuery.fx.speeds = {
				slow: 600,
				fast: 200,
				// Default speed
				_default: 400
			};

			// Back Compat <1.8 extension point
			jQuery.fx.step = {};

			if (jQuery.expr && jQuery.expr.filters) {
				jQuery.expr.filters.animated = function(elem) {
					return jQuery.grep(jQuery.timers, function(fn) {
						return elem === fn.elem;
					}).length;
				};
			}
			jQuery.fn.offset = function(options) {
				if (arguments.length) {
					return options === undefined ?
						this :
						this.each(function(i) {
							jQuery.offset.setOffset(this, options, i);
						});
				}

				var docElem, win,
					box = {
						top: 0,
						left: 0
					},
					elem = this[0],
					doc = elem && elem.ownerDocument;

				if (!doc) {
					return;
				}

				docElem = doc.documentElement;

				// Make sure it's not a disconnected DOM node
				if (!jQuery.contains(docElem, elem)) {
					return box;
				}

				// If we don't have gBCR, just use 0,0 rather than error
				// BlackBerry 5, iOS 3 (original iPhone)
				if (typeof elem.getBoundingClientRect !== core_strundefined) {
					box = elem.getBoundingClientRect();
				}
				win = getWindow(doc);
				return {
					top: box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
					left: box.left + (win.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0)
				};
			};

			jQuery.offset = {

				setOffset: function(elem, options, i) {
					var position = jQuery.css(elem, "position");

					// set position first, in-case top/left are set even on static elem
					if (position === "static") {
						elem.style.position = "relative";
					}

					var curElem = jQuery(elem),
						curOffset = curElem.offset(),
						curCSSTop = jQuery.css(elem, "top"),
						curCSSLeft = jQuery.css(elem, "left"),
						calculatePosition = (position === "absolute" || position === "fixed") && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
						props = {},
						curPosition = {},
						curTop, curLeft;

					// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
					if (calculatePosition) {
						curPosition = curElem.position();
						curTop = curPosition.top;
						curLeft = curPosition.left;
					} else {
						curTop = parseFloat(curCSSTop) || 0;
						curLeft = parseFloat(curCSSLeft) || 0;
					}

					if (jQuery.isFunction(options)) {
						options = options.call(elem, i, curOffset);
					}

					if (options.top != null) {
						props.top = (options.top - curOffset.top) + curTop;
					}
					if (options.left != null) {
						props.left = (options.left - curOffset.left) + curLeft;
					}

					if ("using" in options) {
						options.using.call(elem, props);
					} else {
						curElem.css(props);
					}
				}
			};


			jQuery.fn.extend({

				position: function() {
					if (!this[0]) {
						return;
					}

					var offsetParent, offset,
						parentOffset = {
							top: 0,
							left: 0
						},
						elem = this[0];

					// fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
					if (jQuery.css(elem, "position") === "fixed") {
						// we assume that getBoundingClientRect is available when computed position is fixed
						offset = elem.getBoundingClientRect();
					} else {
						// Get *real* offsetParent
						offsetParent = this.offsetParent();

						// Get correct offsets
						offset = this.offset();
						if (!jQuery.nodeName(offsetParent[0], "html")) {
							parentOffset = offsetParent.offset();
						}

						// Add offsetParent borders
						parentOffset.top += jQuery.css(offsetParent[0], "borderTopWidth", true);
						parentOffset.left += jQuery.css(offsetParent[0], "borderLeftWidth", true);
					}

					// Subtract parent offsets and element margins
					// note: when an element has margin: auto the offsetLeft and marginLeft
					// are the same in Safari causing offset.left to incorrectly be 0
					return {
						top: offset.top - parentOffset.top - jQuery.css(elem, "marginTop", true),
						left: offset.left - parentOffset.left - jQuery.css(elem, "marginLeft", true)
					};
				},

				offsetParent: function() {
					return this.map(function() {
						var offsetParent = this.offsetParent || docElem;
						while (offsetParent && (!jQuery.nodeName(offsetParent, "html") && jQuery.css(offsetParent, "position") === "static")) {
							offsetParent = offsetParent.offsetParent;
						}
						return offsetParent || docElem;
					});
				}
			});


			// Create scrollLeft and scrollTop methods
			jQuery.each({
				scrollLeft: "pageXOffset",
				scrollTop: "pageYOffset"
			}, function(method, prop) {
				var top = /Y/.test(prop);

				jQuery.fn[method] = function(val) {
					return jQuery.access(this, function(elem, method, val) {
						var win = getWindow(elem);

						if (val === undefined) {
							return win ? (prop in win) ? win[prop] :
								win.document.documentElement[method] :
								elem[method];
						}

						if (win) {
							win.scrollTo(!top ? val : jQuery(win).scrollLeft(),
								top ? val : jQuery(win).scrollTop()
							);

						} else {
							elem[method] = val;
						}
					}, method, val, arguments.length, null);
				};
			});

			function getWindow(elem) {
				return jQuery.isWindow(elem) ?
					elem :
					elem.nodeType === 9 ?
					elem.defaultView || elem.parentWindow :
					false;
			}
			// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
			jQuery.each({
				Height: "height",
				Width: "width"
			}, function(name, type) {
				jQuery.each({
					padding: "inner" + name,
					content: type,
					"": "outer" + name
				}, function(defaultExtra, funcName) {
					// margin is only for outerHeight, outerWidth
					jQuery.fn[funcName] = function(margin, value) {
						var chainable = arguments.length && (defaultExtra || typeof margin !== "boolean"),
							extra = defaultExtra || (margin === true || value === true ? "margin" : "border");

						return jQuery.access(this, function(elem, type, value) {
							var doc;

							if (jQuery.isWindow(elem)) {
								// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
								// isn't a whole lot we can do. See pull request at this URL for discussion:
								// https://github.com/jquery/jquery/pull/764
								return elem.document.documentElement["client" + name];
							}

							// Get document width or height
							if (elem.nodeType === 9) {
								doc = elem.documentElement;

								// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
								// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
								return Math.max(
									elem.body["scroll" + name], doc["scroll" + name],
									elem.body["offset" + name], doc["offset" + name],
									doc["client" + name]
								);
							}

							return value === undefined ?
								// Get width or height on the element, requesting but not forcing parseFloat
								jQuery.css(elem, type, extra) :

								// Set width or height on the element
								jQuery.style(elem, type, value, extra);
						}, type, chainable ? margin : undefined, chainable, null);
					};
				});
			});
			// Limit scope pollution from any deprecated API
			// (function() {

			// The number of elements contained in the matched element set
			jQuery.fn.size = function() {
				return this.length;
			};

			jQuery.fn.andSelf = jQuery.fn.addBack;

			// })();
			if (typeof module === "object" && module && typeof module.exports === "object") {
				// Expose jQuery as module.exports in loaders that implement the Node
				// module pattern (including browserify). Do not create the global, since
				// the user will be storing it themselves locally, and globals are frowned
				// upon in the Node module world.
				module.exports = jQuery;
			} else {
				// Otherwise expose jQuery to the global object as usual
				// 设置别名 $
				window.jQuery = window.$ = jQuery;

				// Register as a named AMD module, since jQuery can be concatenated with other
				// files that may use define, but not via a proper concatenation script that
				// understands anonymous AMD modules. A named AMD is safest and most robust
				// way to register. Lowercase jquery is used because AMD module names are
				// derived from file names, and jQuery is normally delivered in a lowercase
				// file name. Do this after creating the global so that if an AMD module wants
				// to call noConflict to hide this version of jQuery, it will work.
				if (typeof define === "function" && define.amd) {
					define("jquery", [], function() {
						return jQuery;
					});
				}
			}
		})(window);

