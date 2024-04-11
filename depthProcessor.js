"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepthProcessor = void 0;
var dir = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
];
var prefixSum = /** @class */ (function () {
    function prefixSum(data) {
        this.sum = [];
        this.height = 0;
        this.width = 0;
        this.sum[0] = [];
        this.height = data.length;
        this.width = data[0].length;
        for (var i = 0; i <= data.length; i++) {
            this.sum[i] = [];
            this.sum[i][0] = 0;
        }
        for (var i = 0; i <= data[0].length; i++) {
            this.sum[0][i] = 0;
        }
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].length; j++) {
                this.sum[i + 1][j + 1] = data[i][j];
            }
        }
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].length; j++) {
                this.sum[i + 1][j + 1] += this.sum[i + 1][j + 1 - 1];
            }
            for (var j = 0; j < data[i].length; j++) {
                this.sum[i + 1][j + 1] += this.sum[i + 1 - 1][j + 1];
            }
        }
    }
    prefixSum.prototype.getSum = function (x1, y1, x2, y2) {
        var _a, _b;
        if (x1 > x2)
            _a = [x2, x1], x1 = _a[0], x2 = _a[1];
        if (y1 > y2)
            _b = [y2, y1], y1 = _b[0], y2 = _b[1];
        if (x1 < 0)
            x1 = 0;
        if (y1 < 0)
            y1 = 0;
        if (x2 >= this.width)
            x2 = this.width - 1;
        if (y2 >= this.height)
            y2 = this.height - 1;
        x2++;
        y2++;
        x1++;
        y1++;
        x1 = Math.floor(x1);
        y1 = Math.floor(y1);
        x2 = Math.floor(x2);
        y2 = Math.floor(y2);
        return this.sum[y2][x2] - this.sum[y1 - 1][x2] - this.sum[y2][x1 - 1] + this.sum[y1 - 1][x1 - 1];
    };
    return prefixSum;
}());
var DepthProcessor = /** @class */ (function () {
    function DepthProcessor(ctx, url, option) {
        var _this = this;
        this.depth = [];
        this.inAnimation = [];
        this.animationElems = [];
        this.rect = false;
        this.level = 10;
        this.min = 0;
        if (option["rect"])
            this.rect = true;
        if (option["level"])
            this.level = option["level"];
        if (option["min"])
            this.min = option["min"];
        this.ctx = ctx;
        this.image = new Image();
        this.image.onload = function () {
            var tmpCanvas = document.createElement("canvas");
            document.body.appendChild(tmpCanvas);
            tmpCanvas.width = 1 << _this.level;
            tmpCanvas.height = 1 << _this.level;
            var tmpCtx = tmpCanvas.getContext("2d");
            tmpCtx.drawImage(_this.image, 0, 0, tmpCanvas.width, tmpCanvas.height);
            var rData = [];
            var gData = [];
            var bData = [];
            for (var i = 0; i < tmpCanvas.width; i++) {
                rData[i] = [];
                gData[i] = [];
                bData[i] = [];
                _this.depth[i] = [];
                _this.inAnimation[i] = [];
            }
            var data = null;
            try {
                data = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height).data;
            }
            catch (e) {
                document.body.removeChild(tmpCanvas);
                alert("图片加载失败");
                return;
            }
            if (!data) {
                alert("图片加载失败");
                return;
            }
            for (var i = 0; i < tmpCanvas.height; i++) {
                for (var j = 0; j < tmpCanvas.width; j++) {
                    _this.depth[j][i] = _this.level;
                    _this.inAnimation[j][i] = false;
                    rData[i][j] = data[(i * tmpCanvas.width + j) * 4 + 0];
                    gData[i][j] = data[(i * tmpCanvas.width + j) * 4 + 1];
                    bData[i][j] = data[(i * tmpCanvas.width + j) * 4 + 2];
                }
            }
            _this.sumR = new prefixSum(rData);
            _this.sumG = new prefixSum(gData);
            _this.sumB = new prefixSum(bData);
            document.body.removeChild(tmpCanvas);
            ctx.fillStyle = "rgb(" + [
                Math.round(_this.sumR.getSum(0, 0, tmpCanvas.width, tmpCanvas.height) / tmpCanvas.width / tmpCanvas.height),
                Math.round(_this.sumG.getSum(0, 0, tmpCanvas.width, tmpCanvas.height) / tmpCanvas.width / tmpCanvas.height),
                Math.round(_this.sumB.getSum(0, 0, tmpCanvas.width, tmpCanvas.height) / tmpCanvas.width / tmpCanvas.height),
            ] + ")";
            if (_this.rect) {
                ctx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
            }
            else {
                _this.ctx.beginPath();
                _this.ctx.arc(tmpCanvas.width / 2, tmpCanvas.height / 2, tmpCanvas.width / 2, 0, 2 * Math.PI);
                _this.ctx.fill();
            }
            document.body.removeChild(document.getElementById("tip"));
        };
        fetch(url).then(function (res) { return res.blob(); }).then(function (blob) {
            var url = URL.createObjectURL(blob);
            _this.image.src = url;
        }).catch(function (e) {
            alert("图片加载失败");
        });
    }
    /**
     *
     * @param x 实际点x
     * @param y 实际点y
     * @returns 控制区域大小
     */
    DepthProcessor.prototype.getAreaSize = function (x, y) {
        var dv = 1 << this.depth[x][y];
        return [dv, dv];
    };
    /**
     * 根据图上任意坐标获取控制区域起点
     * @param x 实际点x
     * @param y 实际点y
     * @returns 控制区域起点[x,y]
     */
    DepthProcessor.prototype.getAreaPos = function (x, y) {
        var _a = this.getAreaSize(x, y), _ = _a[0], dv = _a[1];
        var ox = Math.floor(x / dv) * dv;
        var oy = Math.floor(y / dv) * dv;
        return [ox, oy];
    };
    DepthProcessor.prototype.setDepth = function (x, y, w, h, d) {
        for (var i = 0; i < w; i++) {
            for (var j = 0; j < h; j++) {
                this.depth[x + i][y + j] = d;
            }
        }
    };
    /**
     * 设置区域的动画状态
     * @param x 起点x
     * @param y 起点y
     * @param w 宽
     * @param h 高
     * @param animation 是否设置为动画状态
     */
    DepthProcessor.prototype.setInAnimation = function (x, y, w, h, animation) {
        for (var i = 0; i < w; i++) {
            for (var j = 0; j < h; j++) {
                this.inAnimation[x + i][y + j] = animation;
            }
        }
    };
    DepthProcessor.prototype.splitArea = function (x, y) {
        if (x < 0 || y < 0 || x >= this.inAnimation.length || y >= this.inAnimation[0].length)
            return;
        if (this.inAnimation[x][y])
            return;
        if (this.depth[x][y] <= this.min || this.depth[x][y] == 0)
            return;
        var _a = this.getAreaSize(x, y), w = _a[0], h = _a[1];
        var _b = this.getAreaPos(x, y), ox = _b[0], oy = _b[1];
        this.setInAnimation(ox, oy, w, h, true);
        this.animationElems.push({
            x: ox,
            y: oy,
            w: w,
            h: h,
            depth: this.depth[x][y],
            done: false,
            duration: 0
        });
    };
    DepthProcessor.prototype.updateAnimation = function (tick) {
        var _this = this;
        this.animationElems.forEach(function (elem) {
            if (!elem.startTick) {
                //初始状态
                elem.startTick = tick;
                elem.color = [];
                dir.forEach(function (_a) {
                    var _b;
                    var mulX = _a[0], mulY = _a[1];
                    var tx = elem.x + mulX * elem.w / 2;
                    var ty = elem.y + mulY * elem.h / 2;
                    var ww = Math.floor(elem.w / 2);
                    var hh = Math.floor(elem.h / 2);
                    (_b = elem.color) === null || _b === void 0 ? void 0 : _b.push([
                        Math.round(_this.sumR.getSum(tx, ty, tx + ww - 1, ty + hh - 1) / ww / hh),
                        Math.round(_this.sumG.getSum(tx, ty, tx + ww - 1, ty + hh - 1) / ww / hh),
                        Math.round(_this.sumB.getSum(tx, ty, tx + ww - 1, ty + hh - 1) / ww / hh),
                    ]);
                });
            }
            elem.duration = tick - elem.startTick;
            var progress = elem.duration / 150;
            if (progress >= 1) {
                _this.setInAnimation(elem.x, elem.y, elem.w, elem.h, false);
                _this.inAnimation[elem.x][elem.y] = false;
                elem.done = true;
                _this.setDepth(elem.x, elem.y, elem.w, elem.h, elem.depth - 1);
            }
            else {
                _this.ctx.clearRect(elem.x, elem.y, elem.w, elem.h);
                dir.forEach(function (_a, i) {
                    var mulX = _a[0], mulY = _a[1];
                    var tx = elem.x + mulX * progress * elem.w / 2;
                    var ty = elem.y + mulY * progress * elem.h / 2;
                    var ww = Math.floor(elem.w / 2) * (2 - progress);
                    var hh = Math.floor(elem.h / 2) * (2 - progress);
                    var xOffset = ww / 2;
                    var yOffset = hh / 2;
                    var radius = Math.min(xOffset, yOffset) * 0.95;
                    _this.ctx.fillStyle = "rgb(".concat(elem.color[i].join(','), ")");
                    if (_this.rect) {
                        _this.ctx.fillRect(tx, ty, ww, hh);
                    }
                    else {
                        _this.ctx.beginPath();
                        _this.ctx.arc(tx + xOffset, ty + yOffset, radius, 0, 2 * Math.PI);
                        _this.ctx.fill();
                    }
                });
            }
        });
        this.animationElems = this.animationElems.filter(function (e) { return !e.done; });
    };
    return DepthProcessor;
}());
exports.DepthProcessor = DepthProcessor;
