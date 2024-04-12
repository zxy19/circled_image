const dir = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
]
interface AnimationDesc {
    x: number,
    y: number,
    w: number,
    h: number,
    depth: number,
    duration: number,
    startTick?: number,
    done: boolean,
    color?: number[][]
}
class prefixSum {
    sum: number[][] = []
    height: number = 0;
    width: number = 0;
    constructor(
        data: number[][],
    ) {
        this.sum[0] = [];
        this.height = data.length;
        this.width = data[0].length;
        for (let i = 0; i <= data.length; i++) {
            this.sum[i] = [];
            this.sum[i][0] = 0
        }
        for (let i = 0; i <= data[0].length; i++) {
            this.sum[0][i] = 0
        }
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                this.sum[i + 1][j + 1] = data[i][j];
            }
        }
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                this.sum[i + 1][j + 1] += this.sum[i + 1][j + 1 - 1];
            }
            for (let j = 0; j < data[i].length; j++) {
                this.sum[i + 1][j + 1] += this.sum[i + 1 - 1][j + 1];
            }
        }
    }
    public getSum(x1: number, y1: number, x2: number, y2: number): number {
        if (x1 > x2)
            [x1, x2] = [x2, x1];
        if (y1 > y2)
            [y1, y2] = [y2, y1];
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
    }
}
export class DepthProcessor {
    image: HTMLImageElement
    depth: number[][] = []
    sumR: prefixSum
    sumG: prefixSum
    sumB: prefixSum
    inAnimation: boolean[][] = []
    animationElems: AnimationDesc[] = []
    ctx: CanvasRenderingContext2D
    rect: boolean = false;
    level: number = 10
    min: number = 0
    constructor(ctx: CanvasRenderingContext2D, url: string, option: {}) {
        if (option["rect"]) this.rect = true
        if (option["level"]) this.level = option["level"]
        if (option["min"]) this.min = option["min"]
        this.ctx = ctx
        this.image = new Image()
        this.image.onload = () => {
            const tmpCanvas = document.createElement("canvas");
            document.body.appendChild(tmpCanvas);
            tmpCanvas.width = 1 << this.level;
            tmpCanvas.height = 1 << this.level;
            const tmpCtx = tmpCanvas.getContext("2d")!;
            tmpCtx.drawImage(this.image, 0, 0, tmpCanvas.width, tmpCanvas.height);
            const rData: number[][] = [];
            const gData: number[][] = [];
            const bData: number[][] = [];

            for (let i = 0; i < tmpCanvas.width; i++) {
                rData[i] = [];
                gData[i] = [];
                bData[i] = [];
                this.depth[i] = [];
                this.inAnimation[i] = [];
            }
            let data: Uint8ClampedArray | null = null;
            try {
                data = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height).data;
            } catch (e) {
                document.body.removeChild(tmpCanvas);
                alert("图片加载失败");
                return;
            }
            if (!data) {
                alert("图片加载失败");
                return;
            }

            for (let i = 0; i < tmpCanvas.height; i++) {
                for (let j = 0; j < tmpCanvas.width; j++) {
                    this.depth[j][i] = this.level;
                    this.inAnimation[j][i] = false;
                    rData[i][j] = data[(i * tmpCanvas.width + j) * 4 + 0];
                    gData[i][j] = data[(i * tmpCanvas.width + j) * 4 + 1];
                    bData[i][j] = data[(i * tmpCanvas.width + j) * 4 + 2];
                }
            }

            this.sumR = new prefixSum(rData);
            this.sumG = new prefixSum(gData);
            this.sumB = new prefixSum(bData);
            document.body.removeChild(tmpCanvas);

            ctx.fillStyle = "rgb(" + [
                Math.round(this.sumR.getSum(0, 0, tmpCanvas.width, tmpCanvas.height) / tmpCanvas.width / tmpCanvas.height),
                Math.round(this.sumG.getSum(0, 0, tmpCanvas.width, tmpCanvas.height) / tmpCanvas.width / tmpCanvas.height),
                Math.round(this.sumB.getSum(0, 0, tmpCanvas.width, tmpCanvas.height) / tmpCanvas.width / tmpCanvas.height),
            ] + ")";
            if (this.rect) {
                ctx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(tmpCanvas.width / 2, tmpCanvas.height / 2, tmpCanvas.width / 2, 0, 2 * Math.PI);
                this.ctx.fill();
            }

            document.body.removeChild(document.getElementById("tip")!);

        }
        fetch(url).then(res => res.blob()).then(blob => {
            let url = URL.createObjectURL(blob);
            this.image.src = url;
        }).catch(e => {
            alert("图片加载失败");
        });

    }

    /**
     * 
     * @param x 实际点x
     * @param y 实际点y
     * @returns 控制区域大小
     */
    getAreaSize(x: number, y: number): number[] {
        const dv = 1 << this.depth[x][y];
        return [dv, dv];
    }
    /**
     * 根据图上任意坐标获取控制区域起点
     * @param x 实际点x
     * @param y 实际点y
     * @returns 控制区域起点[x,y]
     */
    getAreaPos(x: number, y: number): number[] {
        const [_, dv] = this.getAreaSize(x, y);
        const ox = Math.floor(x / dv) * dv;
        const oy = Math.floor(y / dv) * dv;
        return [ox, oy];
    }

    setDepth(x: number, y: number, w: number, h: number, d: number) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                this.depth[x + i][y + j] = d;
            }
        }
    }


    /**
     * 设置区域的动画状态
     * @param x 起点x
     * @param y 起点y
     * @param w 宽
     * @param h 高
     * @param animation 是否设置为动画状态
     */
    setInAnimation(x: number, y: number, w: number, h: number, animation: boolean) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                this.inAnimation[x + i][y + j] = animation;
            }
        }
    }

    public splitArea(x: number, y: number) {
        if (x < 0 || y < 0 || x >= this.inAnimation.length || y >= this.inAnimation[0].length) return;
        if (this.inAnimation[x][y]) return;
        if (this.depth[x][y] <= this.min || this.depth[x][y] == 0) return;
        const [w, h] = this.getAreaSize(x, y);
        const [ox, oy] = this.getAreaPos(x, y);

        this.setInAnimation(ox, oy, w, h, true);

        this.animationElems.push({
            x: ox,
            y: oy,
            w: w,
            h: h,
            depth: this.depth[x][y],
            done: false,
            duration: 0
        })
    }
    public updateAnimation(tick: number) {
        this.animationElems.forEach(elem => {
            if (!elem.startTick) {
                //初始状态
                elem.startTick = tick;
                elem.color = []
                dir.forEach(([mulX, mulY]) => {
                    const tx = elem.x + mulX * elem.w / 2;
                    const ty = elem.y + mulY * elem.h / 2;
                    const ww = Math.floor(elem.w / 2);
                    const hh = Math.floor(elem.h / 2);
                    elem.color?.push([
                        Math.round(this.sumR.getSum(tx, ty, tx + ww - 1, ty + hh - 1) / ww / hh),
                        Math.round(this.sumG.getSum(tx, ty, tx + ww - 1, ty + hh - 1) / ww / hh),
                        Math.round(this.sumB.getSum(tx, ty, tx + ww - 1, ty + hh - 1) / ww / hh),
                    ]);
                })
            }
            elem.duration = tick - elem.startTick;
            let progress = elem.duration / 150;
            if (progress >= 1) {
                this.setInAnimation(elem.x, elem.y, elem.w, elem.h, false);
                this.inAnimation[elem.x][elem.y] = false;
                elem.done = true;
                this.setDepth(elem.x, elem.y, elem.w, elem.h, elem.depth - 1);
                progress = 1;
            }

            this.ctx.clearRect(elem.x, elem.y, elem.w, elem.h);
            dir.forEach(([mulX, mulY], i) => {
                const tx = elem.x + mulX * progress * elem.w / 2;
                const ty = elem.y + mulY * progress * elem.h / 2;
                const ww = Math.floor(elem.w / 2) * (2 - progress);
                const hh = Math.floor(elem.h / 2) * (2 - progress);

                const xOffset = ww / 2;
                const yOffset = hh / 2;
                const radius = Math.min(xOffset, yOffset) * 0.95;
                this.ctx.fillStyle = `rgb(${elem.color![i].join(',')})`;

                if (this.rect) {
                    this.ctx.fillRect(tx, ty, ww, hh);
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(tx + xOffset, ty + yOffset, radius, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            })
            
        })
        this.animationElems = this.animationElems.filter(e => !e.done)
    }
}