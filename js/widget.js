/**
 *
 * @param {Object} id
 * @param {Object} pid
 */
function Widget(id, pid, option) {
	this.minWidth = 250;
	this.minHeight = 250;
	this.id = id;
	this.pid = pid;
	//初始化页面中的widget元素
	this.appendToDocument();
	this.option = option || {};
	this.obj = get.byId(this.id);
	this.obj.style.width = this.minWidth + "px";
	this.obj.style.height = this.minHeight + "px";

	this.initButton();
	this.initTitle();
	this.initResize();
	this.appendContent = function(html) {
		var con = get.byClass("content", this.obj)[0];
		con.innerHTML = con.innerHTML +html;
	}
	this.resetContent = function(html){
		var con = get.byClass("content", this.obj)[0];
		con.innerHTML = html;
	}
};

Widget.prototype.appendToDocument = function() {
	var parent = get.byId(this.pid);
	var temp = document.createElement('div');
	temp.id = this.id;
	temp.className = "widget";
	temp.innerHTML = templateHtml();
	parent.appendChild(temp);
};
Widget.prototype.initTitle = function() {
	this.title = {
		canDrag: true
	}
	get.extend(this.title, this.option);
	var tObj = get.byClass("widget_title", this.obj)[0];
	this.title.canDrag && this.drag(tObj);
}
Widget.prototype.setTitle = function(content){
	var title = get.byClass("title", this.obj)[0];
	title.innerHTML = content;
};
Widget.prototype.initButton = function() {
	var obj = this.obj;
	var minBtn = get.byClass("widget_min", obj)[0];
	var maxBtn = get.byClass("widget_max", obj)[0];
	var revertBtn = get.byClass("widget_revert", obj)[0];
	var closeBtn = get.byClass("widget_close", obj)[0];
	minBtn.onclick = closeBtn.onclick = function() {
		obj.style.display = "none";
		var oA = document.createElement("a");
		oA.className = "widget_open";
		oA.href = "javascript:;";
		oA.title = "还原";
		document.body.appendChild(oA);
		oA.onclick = function() {
			obj.style.display = "block";
			document.body.removeChild(this);
			this.onclick = null;
		};
	};
	maxBtn.onclick = function() {
		obj.oldLeft = obj.style.left;
		obj.oldTop = obj.style.top;
		obj.oldWidth = obj.style.width;
		obj.oldHeight = obj.style.height;
		obj.style.left = obj.style.top = 0;
		obj.style.width = document.documentElement.clientWidth / 2 + "px";
		obj.style.height = document.documentElement.clientHeight / 2 + "px";
		obj.style.position = "relative";
		obj.style['z-index'] = 9999;
		this.style.display = "none";
		revertBtn.style.display = "block";
	};
	revertBtn.onclick = function() {
		obj.style.left = obj.oldLeft;
		obj.style.top = obj.oldTop;
		obj.style.width = obj.oldWidth;
		obj.style.height = obj.oldHeight;
		obj.style.position = "absolute";
		obj.style['z-index'] = '';
		this.style.display = "none";
		maxBtn.style.display = "block";
	};
	//阻止冒泡
	minBtn.onmousedown = maxBtn.onmousedown = closeBtn.onmousedown = function(event) {
		this.onfocus = function() {
			this.blur()
		};
		(event || window.event).cancelBubble = true
	};
};
Widget.prototype.initResize = function() {
	//widget四边是否可resize
	this.lock = {
		l: true,
		t: true,
		r: true,
		b: true,
		lt: true,
		lb: true,
		rt: true,
		rb: true
	};
	get.extend(this.lock, this.option);
	this.lock.r && this.resize(get.byClass("widget_r", this.obj)[0]);
	this.lock.l && this.resize(get.byClass("widget_l", this.obj)[0]);
	this.lock.t && this.resize(get.byClass("widget_t", this.obj)[0]);
	this.lock.b && this.resize(get.byClass("widget_b", this.obj)[0]);
	this.lock.lt && this.resize(get.byClass("widget_lt", this.obj)[0]);
	this.lock.lb && this.resize(get.byClass("widget_lb", this.obj)[0]);
	this.lock.rt && this.resize(get.byClass("widget_rt", this.obj)[0]);
	this.lock.rb && this.resize(get.byClass("widget_rb", this.obj)[0]);
}
Widget.prototype.drag = function(handle) {
	var obj = this.obj;
	var widget = this;
	handle = handle || this.obj;
	handle.style.cursor = "move";
	var disX = disY = 0;
	handle.onmousedown = function(event) {
		obj.style['z-index'] = 9999;
		var event = event || window.event;
		disX = event.clientX - obj.offsetLeft; //焦点到widget左边框的距离
		disY = event.clientY - obj.offsetTop; //焦点到widget上边框的距离
		document.onmousemove = function(event) {
			var event = event || window.event;
			var cl = event.clientX - disX; //鼠标移动后widget距离屏幕左边的距离 
			var ct = event.clientY - disY; //鼠标移动后widget距离屏幕上方的距离
			var maxX = document.documentElement.clientWidth - obj.offsetWidth; //widget距离屏幕左边的最大距离
			var maxY = document.documentElement.clientHeight - obj.offsetHeight; //widget距离屏幕上方的最大距离
			// 微调widget的位置
			cl <= 0 && (cl = 0);
			cl >= maxX && (cl = maxX);
			ct <= 0 && (ct = 0);
			ct >= maxY && (ct = maxY);
			obj.style.left = cl + "px";
			obj.style.top = ct + "px";
			
			return false;
		};
		document.onmouseup = function(event) {
			document.onmousemove = null;
			document.onmouseup = null;
			obj.style['z-index'] = '';
			this.releaseCapture && this.releaseCapture();
			widget.zrid && widget.zrid.dragLayout(widget);
		};
		this.setCapture && this.setCapture();
		return false;
	};
	return true;
};
/**
 * widget 调解尺寸
 * @param {Object} handle
 * @param {Object} xmin x最小坐标
 * @param {Object} ymin y最小坐标
 * @param {Object} xmax x最大坐标
 * @param {Object} ymax y最大坐标
 */
Widget.prototype.resize = function(handle) {
		var obj = this.obj;
		var widget = this;
		var minWidth = this.minWidth;
		var minHeight = this.minHeight;
		handle.onmousedown = function(event) {
			var event = event || window.event;
			var X = event.clientX; //坐标
			var Y = event.clientY; //坐标
			obj.style['z-index'] = 9999;
			var left = get.pxToNum(obj.style.left);
			var top = get.pxToNum(obj.style.top);
			var width = get.pxToNum(obj.style.width);
			var height = get.pxToNum(obj.style.height);
			var moveLeft = left;
			var moveTop = top;
			var moveWidth = width;
			var moveHeight = height;
			document.onmousemove = function(event) {
				var event = event || window.event;
				var disX = event.clientX - X; //obj的x位移
				var disY = event.clientY - Y; //obj的y位移

				var classname = handle.className;

				if (classname == 'widget_r' || classname == 'widget_rt' || classname == 'widget_rb') {
					moveWidth = width + disX < minWidth ? minWidth : (width + disX);
				}
				if (classname == 'widget_l' || classname == 'widget_lt' || classname == 'widget_lb') {
					moveWidth = width - disX < minWidth ? minWidth : (width - disX);
					if (moveWidth > minWidth) { //到达最小宽度后，不在移动
						moveLeft = left + disX;
					}
				}
				if (classname == 'widget_t' || classname == 'widget_rt' || classname == 'widget_lt') {
					moveHeight = height - disY < minHeight ? minHeight : (height - disY);
					if (moveHeight > minHeight) {
						moveTop = top + disY;
					}
				}
				if (classname == 'widget_b' || classname == 'widget_rb' || classname == 'widget_lb') {
					moveHeight = height + disY < minHeight ? minHeight : (height + disY);
				}
				obj.style.top = moveTop + "px";
				obj.style.left = moveLeft + "px";
				obj.style.width = moveWidth + "px";
				obj.style.height = moveHeight + "px";
				return false;
			}
			document.onmouseup = function() {
				document.onmousemove = null;
				document.onmouseup = null;
				obj.style['z-index'] = '';
				widget.zrid && widget.zrid.dragLayout(widget);
			};
			return false;
		}
	}
	/**
	 * util 工具类
	 */
var get = {
	byId: function(id) {
		return typeof id === "string" ? document.getElementById(id) : id;
	},
	byClass: function(cls, parentEle) {
		var result = [];
		var regCls = new RegExp("^" + cls + "$");
		var eles = this.byTagName("*", parentEle);
		for (var i = 0; i < eles.length; i++) {
			regCls.test(eles[i].className) && result.push(eles[i]);
		}
		return result;
	},
	byTagName: function(tag, obj) {
		return (obj || document).getElementsByTagName(tag)
	},
	pxToNum: function(px) {
		if (px == '') return 0;
		var reg = /\d+/;
		return px.match(reg)[0] >> 0;
	},
	extend: function(destination, source) {
		for (var property in source)
			destination[property] = source[property];
		return destination;
	}
};


var templateHtml = function() {
	var globTemplate = '<div class="widget_title" ><div class="title">标题内容</div><div class="widget_op"><a class="widget_min" href="javascript:;" title="最小化"></a><a class="widget_max" href="javascript:;" title="最大化" style="display: block;"></a><a class="widget_revert" href="javascript:;" title="还原" style="display: none;"></a><a class="widget_close" href="javascript:;" title="关闭"></a></div></div><div class="widget_t"></div><div class="widget_b"></div><div class="widget_l"></div><div class="widget_r"></div><div class="widget_lt"></div><div class="widget_lb"></div><div class="widget_rt"></div><div class="widget_rb"></div><div class="content"></div>';
	return globTemplate;
}
