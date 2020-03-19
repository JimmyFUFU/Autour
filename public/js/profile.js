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

function renderProfile(){
  // access_token 是否存在
  if(sessionStorage['access_token']){
    const access_token = sessionStorage.access_token;

    $.ajax({
      type : 'GET',
      contentType : 'application/json' ,
      headers : { 'authorization' : `Bearer ${access_token}`},
      url : `${location.origin}/user/profile`,
      success :function(data){

        if (data.user.picture) { document.querySelector('.memberprofile').src = data.user.picture }     // 照片
        document.querySelector('.memberid').innerText = `ID : ${data.user.id}`
        document.querySelector('.membername').innerText = data.user.name
        document.querySelector('.memberemail').innerText = data.user.email
        document.querySelector('.logout').style.display = 'block'
        if (data.tour.length > 0) {
          for (let i in data.tour) {

            let onetour = document.createElement('a')
            onetour.className = 'onetour'
            onetour.href = `${API_HOST}/tourdetail.html?id=${data.tour[i].id}`

            let tourimg = document.createElement('img')
            tourimg.className = 'tourimg'
            tourimg.src = "../icon/taiwan.png";

            let tourtitle = document.createElement('div')
            tourtitle.className = 'tourtitle'
            tourtitle.innerText = data.tour[i].tourtitle

            let tourId = document.createElement('div')
            tourId.className = 'tourId'
            tourId.innerText = data.tour[i].id

            let deletetour = document.createElement('img')
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

          let link2index = document.createElement('div')
          link2index.className = 'link2index'
          link2index.innerText = '你還沒有任何行程哦！趕快去自動產生一個吧'

          let link2indeximg = document.createElement('img')
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
    document.querySelector('.memberprofile').style.display = 'none'
    document.querySelector('#signindiv').style.display = "flex"
  }
}

function logout(){
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("name");
  sessionStorage.removeItem("picture");
  sessionStorage.removeItem("id");
  window.location.reload()
}

function confirmdelete(thisobj){
  // event.stopPropagation(); //父層是 div
  event.preventDefault() //父層是 a
  document.getElementById('confirmdelete').style.display = 'block'
  document.querySelector('#confirmdelete p strong').innerText = thisobj.parentNode.getElementsByClassName('tourtitle')[0].innerText
  document.querySelector('#confirmdelete .confirmdeletebtndiv .yes').onclick = function() {deletetourfunc(thisobj.id)}
}

renderProfile()

function deletetourfunc(id) {
  event.stopPropagation();

  $.ajax({
    type : 'DELETE',
    contentType : 'application/json' ,
    headers : { 'authorization' : `Bearer ${sessionStorage.access_token}` , 'id' : id},
    url : `${location.origin}/tour/tour`,
    success :function(data){
      document.querySelector('.tourlist').innerHTML = ''
      document.getElementById('confirmdelete').style.display = 'none'
      renderalert('success', '刪除成功！' )
      renderProfile()
    },
    error : function(data){
      renderalert('error', '可能因為某些原因沒有成功哦！試試重新登入吧！' )
      document.querySelector('.tourlist').innerHTML = ''
      document.getElementById('confirmdelete').style.display = 'none'
      renderProfile()
    }
  })

}

function closeconfirmdelete(){
  document.getElementById('confirmdelete').style.display = 'none'
}

function upload(thisobj){
  const access_token = sessionStorage.access_token;
  const avatar = new FormData()
  avatar.append('userAvatar', thisobj.files[0])
  $.ajax({
    type : 'POST',
    headers : { 'authorization' : `Bearer ${access_token}`},
    processData: false,
    contentType : false,
    data : avatar,
    url : `${location.origin}/user/uploadAvatar`,
    success : function(data){
      document.querySelector('.member').src = data.picture
      document.querySelector('.member').style.border = '1.4px solid #233D4D'
      document.querySelector('.member').style.borderRadius="50%"
      document.querySelector('.member').style.padding = '6%'
      document.querySelector('.memberprofile').src = data.picture
      sessionStorage.setItem('picture', data.picture)
      renderalert('success', '成功上傳大頭貼！' )
    },
    error: function(data){
      renderalert('error', '可能因為某些原因沒有成功哦！試試重新登入吧！' )
    }
  })
}

function renderalert(type, alertText){
  switch (type) {
    case 'success':
      document.querySelector('#successAlert').style.display = 'flex'
      document.querySelector('#successAlert .alertText').innerText = alertText
      animateCSS('#successAlert','fadeIn')
      setTimeout(()=> {
        animateCSS('#successAlert','fadeOut', function(){
          document.querySelector('#successAlert').style.display = 'none'
          document.querySelector('#successAlert .alertText').innerText = ''
        })
      },4000)
      break;
    case 'error':
      document.querySelector('#errorAlert').style.display = 'flex'
      document.querySelector('#errorAlert .alertText').innerText = alertText
      animateCSS('#errorAlert','fadeIn')
      setTimeout(()=> {
        animateCSS('#errorAlert','fadeOut', function(){
          document.querySelector('#errorAlert').style.display = 'none'
          document.querySelector('#errorAlert .alertText').innerText = ''
        })
      },4000)
      break;
  }
}
