$(".header").load("header.html");
$(".footer").load("footer.html");
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

// access_token 是否存在
if(localStorage["access_token"]){
  var access_token = localStorage.access_token;

  $.ajax({
    type : 'GET',
    contentType : 'application/json' ,
    headers : { 'authorization' : `Bearer ${access_token}`},
    url : `${location.origin}/user/profile`,
    success :function(data){
      // 照片
      // document.querySelector('.memberprofile') = data.user.picture
      document.querySelector('.memberid').innerText = `ID : ${data.user.id}`
      document.querySelector('.membername').innerText = data.user.name
      document.querySelector('.memberemail').innerText = data.user.email
      document.querySelector('.logout').style.display = 'block'
      for (var i in data.tour) {
        var onetour = document.createElement('a')
        onetour.className = 'onetour'
        onetour.href = `${API_HOST}/tourdetail.html?id=${data.tour[i].id}`;

        var tourimg = document.createElement('img')
        tourimg.className = 'tourimg'
        tourimg.src = "../icon/taiwan.png";

        var tourtitle = document.createElement('div')
        tourtitle.className = 'tourtitle'
        tourtitle.innerText = data.tour[i].tourtitle

        onetour.appendChild(tourimg)
        onetour.appendChild(tourtitle)

        document.querySelector('.tourlist').appendChild(onetour)
      }
    },
    error : function(data) {

    }
  })
}else{
  document.querySelector('#signindiv').style.display = "flex"
}

function logout(){
  localStorage.removeItem("access_token");
  localStorage.removeItem("name");
  localStorage.removeItem("id");
  window.location.reload();
}
