//export匯出

function $g(selector) {
    //判斷是否為id selector
    if (selector.includes("#") && !selector.includes(" ")) {
        //回傳element
        return document.querySelector(selector);
    }
 
    //回傳 NodeList集合
    let nodelist = document.querySelectorAll(selector);
    //對使用者友善
    return nodelist.length == 1 ? nodelist[0] : nodelist;
}


function $c(value){
    return document.createElement(value);
}

function $ctn(value){
    return document.createTextNode(value);
};

export{$g,$c,$ctn};