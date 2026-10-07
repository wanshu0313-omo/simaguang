# 司马光演讲练习

面向日本学生的中文演讲练习页面：汉字上方拼音、两位学生姓名选择、逐句与重点字词发音、Part 1–3 整段录音、A4 打印。

## GitHub Pages 发布

1. 将本目录内容上传到目标仓库的 `main` 分支根目录。`index.html`、`app.js`、`style.css` 与 `audio/` 应在同一级。
2. 进入仓库 **Settings → Pages**。
3. 在 **Build and deployment → Source** 选择 **Deploy from a branch**。
4. 分支选择 **main**，目录选择 **/ (root)**，点击 **Save**。
5. 等待部署完成，在 Pages 页面打开网站链接。

无需安装依赖或构建。资源使用相对路径，支持 GitHub Pages 的项目子路径。

## 文件

- `index.html`：页面入口。
- `style.css`：排版与打印样式。
- `app.js`：正文、拼音、录音映射及播放行为。
- `audio/`：38 份真人录音。
- `.nojekyll`：直接发布静态文件。

普通 GitHub Pages 站点公开可访问。参考：https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
