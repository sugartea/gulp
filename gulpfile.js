var gulp = require('gulp'),
    sass = require('gulp-sass'),
 	notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,
    fs = require('fs'),
    parseArgs  = require('minimist'),
    changed = require('gulp-changed'),
    minifycss = require('gulp-clean-css'),
    uglify = require('gulp-uglify');
    //less = require('gulp-less')
//命令与路径相关
var argv = parseArgs(process.argv.slice(2),{
    string: ['n'],
    default: {
        'n': 'nofound'
    }
});
var pth = 'src/' + (argv.n == 'nofound' ? '**' : argv.n);//src文件路径
var dpath = 'dist/' + (argv.n == 'nofound' ? '**' : argv.n);//dist文件路径

//css相关 
gulp.task('build:sass', function () {
    gulp.src(pth+'/sass/*.scss')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(sass())
        .pipe(minifycss())
        .pipe(gulp.dest(dpath+'/css'))
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

// 静态服务器&监听变化
gulp.task('serve', ['build:sass','autofx'], function() {
    browserSync.init({
        server: './'+dpath,
/*        port: 80*/
        open: false,
        notify: false
    });
    //gulp.watch(pth+"/less/*.less", ['build:less']);//不可在边转换less的时候边给css加前缀
    gulp.watch(pth+"/sass/*.scss",['build:sass']);
    gulp.watch(pth+"/css/*.css", ['autofx']);
    gulp.watch(pth+"/js/*.js", ['copy-js']);
    gulp.watch(pth+"/*.html",['copy-html']);
    gulp.watch(pth+"/img/*.*",['copy-img']);
});

gulp.task('default', ['prepare','copy','serve',]);//创建文件夹，复制文件，启动服务器

//创建src各个文件夹
function ensureDir(pth){
    fs.mkdirSync(pth);
    fs.mkdirSync(pth+'/sass');
    fs.mkdirSync(pth+'/js');
    fs.mkdirSync(pth+'/img');
    createIndexHtml(pth);
}
//创建dist各个文件夹
function ensureDirDist(pth){
    fs.mkdirSync(pth);
    fs.mkdirSync(pth+'/css');
    fs.mkdirSync(pth+'/js');
    fs.mkdirSync(pth+'/img');
}

//创建index.html的模板
function createIndexHtml(pth){
    var html =
        `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <title></title>
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
        fs.statSync(dpath);
    }catch(e){
        ensureDir(pth);
        ensureDirDist(dpath);
    }
    return cb();
});

//初始化时复制文件
gulp.task('copy', ['copy-html','copy-js','copy-img']);

gulp.task('copy-js',function(){
    gulp.src(pth + '/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(dpath + "/js/"))
    .pipe(reload({stream: true}));
})

gulp.task('copy-html',function(){
    gulp.src(pth + "/*.html")
    .pipe(gulp.dest(dpath+'/'))
    .pipe(reload({stream: true}));
})

gulp.task('copy-img',function(){
    gulp.src(pth + "/img/*.*")
    .pipe(gulp.dest(dpath + "/img/"));
})
