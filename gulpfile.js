const { src, dest, watch, series, parallel} = require("gulp");
const browserSync = require("browser-sync").create();
const Delete = require("del");

//Плагины
const FileInclude = require("gulp-file-include");
const HtmlMin = require("gulp-htmlmin");
const Size = require("gulp-size");
const Plumber = require("gulp-plumber");
const Concat = require("gulp-concat");
const AutoPrefixer = require("gulp-autoprefixer");
const CssO = require("gulp-csso");
const Rename = require("gulp-rename");
const ShortHand = require("gulp-shorthand");
const GroupMedia = require("gulp-group-css-media-queries");
const Sass = require("gulp-sass")(require("sass"));
const ImageMin = require("gulp-imagemin");
const Newer = require("gulp-newer");
const GulpFonter = require("gulp-fonter");
const Ttf2Woff2 = require("gulp-ttf2woff2");
const SpriteSvg = require("gulp-svg-sprite");


//Обработка HTML
const html = () => src("./src/html/*.html")
  .pipe(Plumber())
  .pipe(FileInclude())
  .pipe(Size({ title: "До сжатия" }))
  .pipe(HtmlMin({
    collapseWhitespace: true
  }))
  .pipe(Size({ title: "После сжатия" }))
  .pipe(dest("./public"))
  .pipe(browserSync.stream())


//Обработка SCSS
const scss = function(){
  return src("./src/scss/*.scss", { sourcemaps: true })
    .pipe(Sass())  
    .pipe(AutoPrefixer())
    .pipe(ShortHand())
    .pipe(GroupMedia())
    .pipe(Size({ title: "style.css"}))
    .pipe(dest("./public/css", { sourcemaps: true }))
    .pipe(Rename({ suffix: ".min" }))
    .pipe(CssO())
    .pipe(Size({ title: "style.min.css"}))
    .pipe(dest("./public/css", { sourcemaps: true }))
    .pipe(browserSync.stream());
}

//Обработка IMAGES
const images = function(){
  return src("./src/img/**/*.{jpg,png,jpeg,gif}")
    .pipe(Plumber())
    .pipe(Newer("./public/img"))
    .pipe(ImageMin({
        verbose: true
    }))    
    .pipe(dest("./public/img"));   
}

const spritesvg = function(){
  return src("./src/img/svg/**/*.svg")
  .pipe(SpriteSvg({
    shape: {
      dimension: {
          maxWidth: 500,
          maxHeight: 500
      },
      spacing: {
          padding: 0
      },
      transform: [{
          "svgo": {
              "plugins": [
                  { removeViewBox: false },
                  { removeUnusedNS: false },
                  { removeUselessStrokeAndFill: true },
                  { cleanupIDs: false },
                  { removeComments: true },
                  { removeEmptyAttrs: true },
                  { removeEmptyText: true },
                  { collapseGroups: true },
                  { removeAttrs: { attrs: '(fill|stroke|style)' } }
              ]
          }
      }]
  },
  mode: {
      symbol: {
          dest : '.',
          sprite: 'sprite.svg'
      }
  }
  }))
  .pipe(dest("./public/img")); 
}

//Обработка FONTS
const fonts = function(){
  return src("./src/font/*.{eot,ttf,otf,otc,ttc,woff,woff2,svg}")
    .pipe(Plumber())
    .pipe(Newer("./public/img"))
    // .pipe(GulpFonter({
    //   formats: ["ttf", "woff"]
    // }))
   // .pipe(dest("./public/font"))
    .pipe(Ttf2Woff2())
    .pipe(dest("./public/font"));   

}

//Удаление директории
const clear = function(){
  return Delete("./public");
}

//Сервер
const server = function(){
  browserSync.init({
    server: {
      baseDir: "./public"
    }
  });
}

//Наблюдатель
const watcher = function(){
  watch("./src/html/**/*.html", html);
  watch("./src/scss/**/*.scss", scss);
  watch("./src/img/**/*.{jpg,jpeg,png,gif,svg}", series(images, spritesvg));
  watch("./src/font/**/*.{eot,ttf,otf,otc,ttc,woff,woff2,svg}", fonts); 
}

//Задачи
exports.html = html;
exports.watch = watcher;
exports.clear = clear;
exports.scss = scss;
exports.images = images;
exports.font = fonts;
exports.spritesvg = spritesvg;

//Сборка
exports.dev = series(
  clear,
  parallel(html, scss, images, spritesvg, fonts),
  parallel(watcher, server)
);

//Продакшн
exports.build = series(
  clear,
  parallel(html, scss, images, spritesvg, fonts),  
);