# 圆圈粒子化图片显示

> 群友快乐刮刮乐

demo: [https://circled_img.xypp.cc/?id=2](https://circled_img.xypp.cc/?id=2)
demo(矩形): [https://circled_img.xypp.cc/?id=9](https://circled_img.xypp.cc/?id=9)
demo(最小分片): [https://circled_img.xypp.cc/?id=10](https://circled_img.xypp.cc/?id=10)

demo所用图片来自https://www.pixiv.net/artworks/111582057

## Build

因为作者偷懒，不想写构建配置，请使用下面的命令编译TS文件（就这么点代码，将就一下算了）

```bash
tsc --outDir ./ --lib es5,dom ts/depthProcessor.ts
```

## 说明
由于涉及服务器信息，服务器相关的内容尚未提供。可以自行实现data.php并将html中的注释恢复。
data.php应当返回以下信息:
```json
{
    "url":"图片链接(要求能够cors访问，可以使用cors代理)",
    "data":{
        "min":"最小值分片大小",
        "level":"最大区分层级",
        "rect":"使用矩形区域"
    }
}
```

该项目不应该用作违法用途。使用本项目、本项目提供demo所引起的相关责任需要用户自行承担。