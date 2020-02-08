$(".header").load("header.html");
$(".footer").load("footer.html");
$("#memberdiv").load("html/memberdiv.html");
$("#signindiv").load("html/signindiv.html");

var API_HOST = location.origin;

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

//此localStorage有存在
if(localStorage["access_token"]){
  var access_token = localStorage.access_token;
  document.querySelector('#signindiv').style.display = "none"
}
