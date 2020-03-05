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

function change2login(){
  if(document.querySelector('.loginform').style.display !== "flex" && document.querySelector('.loginform').style.display !== ""){
    document.querySelector('.signup').style.borderBottomWidth = "1px"
    document.querySelector('.login').style.borderBottomWidth = "0px"

    animateCSS('.signupform', 'fadeOutDown' , function() {document.querySelector('.signupform').style.display = "none" })
    document.querySelector('.loginform').style.display = "flex"
    animateCSS('.loginform', 'fadeInUp')

    animateCSS('#signupwelcomeword', 'fadeOutDown' , function() { document.querySelector('#signupwelcomeword').style.display = "none"})
    document.querySelector('#loginwelcomeword').style.display = "block"
    animateCSS('#loginwelcomeword', 'fadeInUp')

  }
}

function change2signup(){
  if(document.querySelector('.signupform').style.display !== "flex"){

    document.querySelector('.login').style.borderBottomWidth = "1px"
    document.querySelector('.signup').style.borderBottomWidth = "0px"

    document.querySelector('.signupform').style.display = "flex"
    animateCSS('.loginform', 'fadeOutDown' , function() {document.querySelector('.loginform').style.display = "none"})
    animateCSS('.signupform', 'fadeInUp' )

    animateCSS('#loginwelcomeword', 'fadeOutDown' , function() {document.querySelector('#loginwelcomeword').style.display = "none"})
    document.querySelector('#signupwelcomeword').style.display = "block"
    animateCSS('#signupwelcomeword', 'fadeInUp')

  }
}

function loginAjax() {
  var jsonobj = {
    provider : $('#inprovider').val(),
    email : $('#inemail').val(),
    password : $('#inpassword').val()
  }
  $.ajax({
    type: 'POST',
    data: JSON.stringify(jsonobj),
    contentType: 'application/json',
    url: `${API_HOST}/user/login`,
    success: function(data) {
      sessionStorage.setItem('access_token', data.data.access_token);
      sessionStorage.setItem('name', data.data.user.name);
      if (data.data.user.picture) {sessionStorage.setItem('picture', data.data.user.picture);}
      document.querySelector('.hitext strong').innerText = data.data.user.name
      animateCSS('#signindiv', 'bounceOutUp' , function() {document.querySelector('#signindiv').style.display = 'none' })
      window.location.reload();
    },
    error: function(data) {
      document.querySelector('.loginerror').innerText = data.responseJSON.error
      document.querySelector('.loginerror').style.display = 'block'
    }
  })
}

function signupAjax() {
  if (!document.querySelector('.emailvalid').value) {
    document.querySelector('#upemail').style.boxShadow = "0 0 5px 0 #eb2f06"
  }else {
    var jsonobj = {
      name : $('#upname').val(),
      email : $('#upemail').val(),
      password : $('#uppassword').val()
    }
    $.ajax({
      type: 'POST',
      data: JSON.stringify(jsonobj),
      contentType: 'application/json',
      url: `${API_HOST}/user/signup`,
      success: function(data) {
        sessionStorage.setItem("access_token", data.data.access_token);
        sessionStorage.setItem("name", data.data.user.name);
        sessionStorage.setItem("id", data.data.user.id);
        document.querySelector('.hitext strong').innerText = data.data.user.name
        animateCSS('#signindiv', 'bounceOutUp' , function() {document.querySelector('#signindiv').style.display = "none" })
        window.location.reload();
      },
      error: function(data) {
        document.querySelector('.signuperror').innerText = data.responseJSON.error
        document.querySelector('.signuperror').style.display = 'block'
      }
    })
  }
}

function validation(){
  let email = document.querySelector('#upemail').value
  let emailvalid = document.querySelector('.emailvalid')
  var pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

  if (email.match(pattern)){
    document.querySelector('#upemail').style.boxShadow = "0 0 5px 0 #009432"
    emailvalid.innerText = 'Your Email Address in Valid.'
    emailvalid.style.color = '#009432'
    emailvalid.style.left = '23%'
    emailvalid.value = true
  }else{
    document.querySelector('#upemail').style.boxShadow = "0 0 5px 0 #eb2f06"
    emailvalid.innerText = 'Please Enter Valid Email Address.'
    emailvalid.style.color = '#eb2f06'
    emailvalid.style.left = '20%'
    emailvalid.value = false
  }
}


// FB
window.fbAsyncInit = function() {
  FB.init({
    appId      : '529585240973854',
    cookie     : true,                     // Enable cookies to allow the server to access the session.
    xfbml      : true,                     // Parse social plugins on this webpage.
    version    : 'v5.0'
  });
  FB.AppEvents.logPageView();
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "https://connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function fblogin(){
  FB.login(function(response){
    // Handle the response object,
    // like in statusChangeCallback() in our demo
    // code.
    var jsonobj = {
      provider : "facebook",
      access_token : response.authResponse.accessToken
    }
    $.ajax({
      type: 'POST',
      data: JSON.stringify(jsonobj),
      contentType: 'application/json',
      url: `${API_HOST}/user/login`,
      success: function(data) {
        sessionStorage.setItem("access_token", data.data.access_token);
        sessionStorage.setItem("name", data.data.user.name);
        sessionStorage.setItem("id", data.data.user.id);
        document.querySelector('.hitext strong').innerText = data.data.user.name
        animateCSS('#signindiv', 'bounceOutUp' , function() {document.querySelector('#signindiv').style.display = "none" })
        window.location.reload();
      },
      error: function(data) {
        document.querySelector('.loginerror').innerText = data.responseJSON.error
        document.querySelector('.loginerror').style.display = 'block'
      }
    })
  });
}

// Google
function init() {
	gapi.load('auth2', function () {
		gapi.auth2.init({
			client_id: "903784164097-u7rf60ibbveqda2u45le12806qquv2i8" //必填，記得開發時期要開啟 Chrome開發人員工具 查看有沒有403錯誤(Javascript來源被禁止)
		});
	});
}//end GoogleSigninInit function

let google_res;
function onSignIn() {
	let auth2 = gapi.auth2.getAuthInstance();//取得GoogleAuth物件
	auth2.signIn().then(function (GoogleUser) {
		console.log("Google登入成功");
		console.log('ID: ' + GoogleUser.getId()); // Do not send to your backend! Use an ID token instead.
		// The ID token you need to pass to your backend:
		let id_token = GoogleUser.getAuthResponse().id_token;
		const jsonobj = {
			provider: "google",
      google_Id : GoogleUser.getId(),
			access_token: id_token
		};
    $.ajax({
      type: 'POST',
      data: JSON.stringify(jsonobj),
      contentType: 'application/json',
      url: `${API_HOST}/user/login`,
      success: function(data) {
        sessionStorage.setItem("access_token", data.data.access_token);
        sessionStorage.setItem("name", data.data.user.name);
        sessionStorage.setItem("id", data.data.user.id);
        document.querySelector('.hitext strong').innerText = data.data.user.name
        animateCSS('#signindiv', 'bounceOutUp' , function() {document.querySelector('#signindiv').style.display = "none" })
        window.location.reload();
      },
      error: function(data) {
        document.querySelector('.loginerror').innerText = data.responseJSON.error
        document.querySelector('.loginerror').style.display = 'block'
      }
    })
	})
}
