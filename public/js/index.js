$(".header").load("header.html");
$(".footer").load("footer.html");

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

var bouncepointid = []
for (var i = 0; i < 5; i++) {
  let point = document.querySelectorAll('.pointcity')[getRandom(20)-1]
  point.style.display = "block"
  bouncepointid.push(point.id)
  animateCSS(`#${point.id}`,'bounceInDown')
}
document.querySelector(".letsGo").onclick = function(){startquestion()};

function startquestion() {
  // $("html, body").animate({scrollTop:$('.bigflex').offset().top-20},500)
  bouncepointid.forEach((item, i) => {animateCSS(`#${item}`,'bounceOutUp' ,function(){document.querySelector(`#${item}`).style.display = "none"})});
  document.querySelector('.index').style.width = '35%'
  document.querySelector('.index').style.flexDirection = 'column'
  document.querySelector('.letsGo').style.alignSelf = 'center'
  document.querySelector('.question').style.width = '65%'
  document.querySelector('.taiwan').style.height = '500px'
  $(".question").load("question.html");
  document.querySelector(".letsGo").onclick = function(){confirmQ1()};
  document.querySelector(".letsGo").style.width = '80px'
  document.querySelector(".letsGo").style.height = '80px'
  document.querySelector(".letsGo").style.backgroundImage = "url('../icon/next.png')"
  document.querySelector(".backicon").style.display = 'block'
  document.querySelector(".backicon").onclick = function(){window.location.href =`${API_HOST}/index.html`}
  document.querySelector(".progresscontainer").style.display = 'block'
}
