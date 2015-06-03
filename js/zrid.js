/**
 * 多个widget在容器中的布局
 * @param {Object} id
 */
function Zrid(id) {
	this.autoNum = 0;
	this.id = id;
	this.zoom = 1;
	this.resetZoom();
	this.algorithm;
	this.widgets = [];
	this.positions = []; //widget的位置
	this.addWidget = function(option) {
		this.autoNum++;
		var pid = this.id;
		var widget = new Widget("widget_" + this.autoNum, pid, option);
		this.widgets[widget.id] = widget;
		this.widgets.length++;
		var position = [];
		position.left = get.pxToNum(widget.obj.style.left);
		position.top = get.pxToNum(widget.obj.style.top);
		position.width = get.pxToNum(widget.obj.style.width);
		position.height = get.pxToNum(widget.obj.style.height);
		this.positions[widget.id] = position;
		this.positions.length++;
		this.layout(this.algorithm);
		widget.zrid = this; //反补
		return widget;
	};
};
Zrid.prototype.dragLayout = function(widget, algorithm) {
	var position = this.positions[widget.id];
	var left = get.pxToNum(widget.obj.style.left);
	var top = get.pxToNum(widget.obj.style.top);
	var width = get.pxToNum(widget.obj.style.width);
	var height = get.pxToNum(widget.obj.style.height);
	position.left = left;
	position.top = top;
	position.width = width;
	position.height = height;
	this.layout(algorithm)
}
Zrid.prototype.layout = function(algorithm) {
	if (this.widgets.length < 1) return;
	var zridObj = get.byId(this.id);
	var mainWidth = get.pxToNum(zridObj.style.width) || zridObj.offsetWidth;
	var mainLeft = get.pxToNum(zridObj.style.left);
	console.log(mainLeft+"="+mainWidth);
	if (!algorithm) {
		//default algorithm
		this.resizeLayout(mainLeft, mainWidth);
	}
};
/**
 *距离左上方最近的wdiget位置,存在重叠情况
 */
Zrid.prototype.minPosition = function() {
	var min_pos_id = null;
	for (var id in this.positions) {
		var pos = this.positions[id];
		if (!pos.cover) {
			continue;
		}
		if (min_pos_id == null) {
			min_pos_id = id;
		} else {
			var mintop = this.positions[min_pos_id].top;
			var minleft = this.positions[min_pos_id].left;
			var wttop = this.positions[id].top;
			var wtleft = this.positions[id].left;
			if (Math.sqrt(minleft * minleft + mintop * mintop) > Math.sqrt(wttop * wttop + wtleft * wtleft)) {
				min_pos_id = id;
			}
		}
	}
	return min_pos_id;
};
Zrid.prototype.sortPosition = function(filed) {
	var position = [];

};
/**
 * 对水平方向上进行限制
 * @param {Object} mainLeft
 * @param {Object} mainWidth
 */
Zrid.prototype.resizeLayout = function(mainLeft, mainWidth) {
	//假设所有widget都存在重叠的情况
	for (var positionProperty in this.positions) {
		this.positions[positionProperty].cover = true;
	}
	var num = this.positions.length; //widget 个数
	var no_cover = 0; //不重叠的个数
	var start = this.minPosition();
	while (no_cover < num) {
		no_cover++;
		var p = this.positions[start];
		p.cover = false;
		for (var posId in this.positions) {
			if (start == posId) continue;
			var p2 = this.positions[posId];
			//定点在p内部
			if (p2.left >= p.left && p2.left < p.left + p.width && p2.top >= p.top && p2.top < p.top + p.height) {
				if (p.left + p.width - p2.left <= p.top + p.height - p2.top) { //水平方向调整
					if (mainLeft + mainWidth > p.left + p.width + p2.width) {
						p2.left = p.left + p.width;
						p2.top = p.top;
						if (!p2.cover) { //有调整恢复重叠状态
							p2.cover = true;
							no_cover--;
						}
					} else {
						p2.top = p.top + p.height;
						p2.left = mainLeft;
						if (!p2.cover) { //有调整恢复重叠状态
							p2.cover = true;
							no_cover--;
						}
					}
				} else {
					//垂直方向调整
					p2.top = p.top + p.height;
					p2.left = p.left;
					if (!p2.cover) { //有调整恢复重叠状态
						p2.cover = true;
						no_cover--;
					}
				}
			}
		}
		start = this.minPosition();
	}
	//元素调整
	for (var id in this.positions) {
		var pos = this.positions[id];
		var widget = this.widgets[id];
		widget.obj.style.left = pos.left + "px";
		widget.obj.style.top = pos.top + "px";
	}
};

/**
 *根据client调整widget的比例
 */
Zrid.prototype.resetZoom = function() {
	//TODO
};
var findFromArr = function(arry, property) {
	for (var p in arry) {
		if (p == property) {
			return arry[p];
		}
	}
	return null;
};
