var rem = {},
    win = window,                 // window
    doc = win.document,           // document
    docEl = doc.documentElement,  // html
    refreshRemTimer;              // resize/show timer

function startTimer(){
    clearTimeout(refreshRemTimer);
    refreshRemTimer = setTimeout(refreshRem, 300);
}

function refreshRem(){
    var width = docEl.getBoundingClientRect().width;

    width = width < 240 ? 240 : width; // 最小宽度
    width = width > 1240 ? 1240 : width; // 最大宽度

    var rem = width / 10; // 将屏幕宽度分成10份， 1份为1rem
    docEl.style.fontSize = rem + 'px';
}

rem.init = function(){
    refreshRem();
    win.addEventListener('resize', startTimer);
    win.addEventListener('pageshow', function(e) {
        if(e.persisted) {
            startTimer();
        }
    });
}
rem.init();
//处理RETINA 1px边框
if(window.devicePixelRatio && devicePixelRatio == 2){
    document.querySelector('html').className = 'hairlines2';
}
if(window.devicePixelRatio && devicePixelRatio >= 3){
    document.querySelector('html').className = 'hairlines3';
}
