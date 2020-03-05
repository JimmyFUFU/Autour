$(".header").load("header.html");
$(".footer").load("footer.html");
$("#errordiv").load("html/errordiv.html");

function getRandom(x){
    return Math.floor(Math.random()*x)+1;
};
function animateCSS(element, animationName, callback) {
    const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)

        if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
}

var bouncepointid = new Array()
for (let i = 0; i < 5; i++) {
  setTimeout(()=> {
    let point = document.querySelectorAll('.pointcity')[getRandom(20)-1]
    point.style.display = "block"
    bouncepointid.push(point.id)
    animateCSS(`#${point.id}`,'bounceInDown')
  },3000)
}
document.querySelector(".letsGo").onclick = function(){startquestion()};

function startquestion() {
  // $("html, body").animate({scrollTop:$('.bigflex').offset().top-20},500)
  $(".question").load("question.html");
  bouncepointid.forEach((item, i) => {animateCSS(`#${item}`,'bounceOutUp' ,function(){document.querySelector(`#${item}`).style.display = "none"})});
  document.querySelector(".introduction").style.display = 'none'
  document.querySelector('.index').style.width = '35%'
  document.querySelector('.index').style.flexDirection = 'column'
  document.querySelector('.letsGo').style.alignSelf = 'center'
  document.querySelector('.question').style.width = '65%'
  document.querySelector('.question').style.padding = '5%'
  document.querySelector('.taiwan').style.height = '500px'
  document.querySelector(".letsGo").onclick = function(){confirmQ1()};
  document.querySelector(".letsGo").style.width = '80px'
  document.querySelector(".letsGo").style.height = '80px'
  document.querySelector(".letsGo").style.backgroundImage = "url('../icon/next.png')"
  document.querySelector(".backicon").style.display = 'block'
  document.querySelector(".backicon").onclick = function(){window.location.href =`${API_HOST}`}
  document.querySelector(".progresscontainer").style.display = 'block'
}
