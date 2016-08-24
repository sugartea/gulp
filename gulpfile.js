//自动编译less
//自动增加前缀
//自动刷新浏览器

//模块相关
var gulp = require('gulp'),
    less = require('gulp-less'),
 	notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,
    fs = require('fs'),
    parseArgs  = require('minimist'),
    changed = require('gulp-changed');

//命令与路径相关
var argv = parseArgs(process.argv.slice(2),{
    string: ['n'],
    default: {
        'n': 'nofound'
    }
});
var pth = 'src/' + (argv.n == 'nofound' ? '**' : argv.n);

//css相关 
gulp.task('build:less', function () {
    gulp.src(pth+'/less/*.less')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(changed(pth+'/css', {extension: '.less'}))
        .pipe(less())
        .pipe(gulp.dest(pth+'/css'))
        .pipe(reload({stream: true}));
});
 
gulp.task('autofx', function () {
    gulp.src(pth+'/css/*.css')
        .pipe(changed(pth+'/css', {extension: '.css'}))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:true //是否去掉不必要的前缀 默认：true 
        }))
        .pipe(gulp.dest(pth+'/css'));
});


// 静态服务器 + 监听 less/html 文件
gulp.task('serve', ['build:less','autofx'], function() {
    var pth = 'src/' + (argv.n == 'nofound' ? '**' : argv.n);  
    browserSync.init({
        server: './'+pth
    });
    open: false;
    gulp.watch(pth+"/less/*.less", ['build:less']);//不可在边转换less的时候边给css加前缀
    gulp.watch(pth+"/css/*.css", ['autofx']);
    gulp.watch(pth+"/js/*.js").on('change', reload);
    gulp.watch(pth+"/*.html").on('change', reload);
});

gulp.task('default', ['serve','prepare','copy']);

//创建各个文件夹
function ensureDir(pth){
    fs.mkdirSync(pth);
    fs.mkdirSync(pth+'/css');
    fs.mkdirSync(pth+'/less');
    fs.mkdirSync(pth+'/js');
    fs.mkdirSync(pth+'/img');
    createIndexHtml(pth);
}

//创建index.html的模板
function createIndexHtml(pth){
    var html =
        `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta http-equiv="Cache-Control" content="no-transform"/>
    <meta http-equiv="Cache-Control" content="no-siteapp"/>
    <meta name="format-detection" content="telephone=no"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta content="yes" name="apple-touch-fullscreen"/>
    <meta name="apple-mobile-web-app-status-bar-style" content="black"/>
    <title></title>
    <script>!function(n){var e=n.document,t=e.documentElement,dpr,scale;var isAndroid=n.navigator.appVersion.match(/android/gi),isIPhone=n.navigator.appVersion.match(/iphone/gi),devicePixelRatio=n.devicePixelRatio;if(isIPhone){if(devicePixelRatio>=2&&(!dpr||dpr>=2)){dpr=2}else{dpr=1}}else{dpr=1}scale=1/dpr;var metaEl=e.createElement("meta");var scale=dpr===1?1:0.5;metaEl.setAttribute("name","viewport");metaEl.setAttribute("content","initial-scale="+scale+", maximum-scale="+scale+", minimum-scale="+scale+", user-scalable=no");if(t.firstElementChild){t.firstElementChild.appendChild(metaEl)}else{var wrap=e.createElement("div");wrap.appendChild(metaEl);e.write(wrap.innerHTML)}var i=1440,d=i/200,rem,o="orientationchange" in n?"orientationchange":"resize",a=function(){var n=t.clientWidth||320;n>i&&(n=i),t.style.fontSize=(rem=n/d)+"px"};n.px2rem=function(px){var v=parseFloat(px);return v/rem};n.rem2px=function(r){var v=parseFloat(r);return rem*v};e.addEventListener&&(n.addEventListener(o,a,!1),e.addEventListener("DOMContentLoaded",a,!1))}(window);</script>
</head>
<body>
    hello world! 
</body>
</html>`;
    fs.writeFileSync(pth + '/index.html', html)
}

//若文件不存在，则创建文件，否则打开已有文件
gulp.task('prepare', function(cb){
    try{
        fs.statSync(pth)
    }catch(e){
        ensureDir(pth);
    }
    return cb();
});

//复制初始化文件
gulp.task('copy-less', function(){
    gulp.src('./common/common.less')
        .pipe(gulp.dest(pth+'/less'));     
});

gulp.task('copy-jquery', function(){
    gulp.src('./common/jquery.min.js')
        .pipe(gulp.dest(pth+'/js'));      
});

gulp.task('copy', ['copy-less','copy-jquery']);
