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
if(sessionStorage["access_token"]){
  var access_token = sessionStorage.access_token;

  $.ajax({
    type : 'GET',
    contentType : 'application/json' ,
    headers : { 'authorization' : `Bearer ${access_token}`},
    url : `${location.origin}/user/profile`,
    success :function(data){
      // 照片
      if (data.user.picture) {document.querySelector('.memberprofile').src = data.user.picture}
      document.querySelector('.memberid').innerText = `ID : ${data.user.id}`
      document.querySelector('.membername').innerText = data.user.name
      document.querySelector('.memberemail').innerText = data.user.email
      document.querySelector('.logout').style.display = 'block'
      if (data.tour.length > 0) {
        for (var i in data.tour) {

          var onetour = document.createElement('a')
          onetour.className = 'onetour'
          onetour.href = `${API_HOST}/tourdetail.html?id=${data.tour[i].id}`

          var tourimg = document.createElement('img')
          tourimg.className = 'tourimg'
          tourimg.src = "../icon/taiwan.png";

          var tourtitle = document.createElement('div')
          tourtitle.className = 'tourtitle'
          tourtitle.innerText = data.tour[i].tourtitle

          var tourId = document.createElement('div')
          tourId.className = 'tourId'
          tourId.innerText = data.tour[i].id

          var deletetour = document.createElement('img')
          deletetour.className = 'deletetour'
          deletetour.id = data.tour[i].id
          deletetour.src = "../icon/trash.png";
          deletetour.title = '刪除這趟旅程'
          deletetour.onclick = function (){ confirmdelete(this) }

          onetour.appendChild(tourimg)
          onetour.appendChild(tourtitle)
          onetour.appendChild(tourId)
          onetour.appendChild(deletetour)

          document.querySelector('.tourlist').appendChild(onetour)
        }
      }else {

        var link2index = document.createElement('div')
        link2index.className = 'link2index'
        link2index.innerText = '你還沒有任何行程哦！趕快去自動產生一個吧'

        var link2indeximg = document.createElement('img')
        link2indeximg.className = 'link2indeximg'
        link2indeximg.src = "../icon/letsautour.png";
        link2indeximg.onclick = function (){ window.location.href = `${API_HOST}` }

        document.querySelector('.tourlist').appendChild(link2index)
        document.querySelector('.tourlist').appendChild(link2indeximg)
        animateCSS('.link2indeximg','pulse')
      }
    },
    error : function(data) {
      document.querySelector('#signindiv').style.display = "flex"
      console.log(data.responseJSON.error)
    }
  })
}else{
  document.querySelector('#signindiv').style.display = "flex"
}

function logout(){
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("name");
  sessionStorage.removeItem("id");
  window.location.reload();
}

function confirmdelete(thisobj){
  // event.stopPropagation(); //父層是 div
  event.preventDefault() //父層是 a
  document.getElementById('confirmdelete').style.display = 'block'
  document.querySelector('#confirmdelete p strong').innerText = thisobj.parentNode.getElementsByClassName('tourtitle')[0].innerText
  document.querySelector('#confirmdelete .confirmdeletebtndiv .yes').onclick = function() {deletetourfunc(thisobj.id)}
}

function deletetourfunc(id) {
  event.stopPropagation();

  $.ajax({
    type : 'DELETE',
    contentType : 'application/json' ,
    headers : { 'authorization' : `Bearer ${sessionStorage.access_token}` , 'id' : id},
    url : `${location.origin}/deleteAutour`,
    success :function(data){
      window.location.reload();
    },
    error : function(data){
      window.location.reload();
    }
  })

}

function closeconfirmdelete(){
  document.getElementById('confirmdelete').style.display = 'none'
}
