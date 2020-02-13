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
      localStorage.setItem("access_token", data.data.access_token);
      localStorage.setItem("name", data.data.user.name);
      localStorage.setItem("id", data.data.user.id);
      document.querySelector('.hitext strong').innerText = data.data.user.name
      animateCSS('#signindiv', 'bounceOutUp' , function() {document.querySelector('#signindiv').style.display = "none" })
      window.location.reload();
    },
    error: function(data) {
      document.querySelector('.loginerror').innerText = data.responseJSON.error
      document.querySelector('.loginerror').style.display = 'block'
    }
  })
}

function signupAjax() {
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
      localStorage.setItem("access_token", data.data.access_token);
      localStorage.setItem("name", data.data.user.name);
      localStorage.setItem("id", data.data.user.id);
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
        localStorage.setItem("access_token", data.data.access_token);
        localStorage.setItem("name", data.data.user.name);
        localStorage.setItem("id", data.data.user.id);
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

// function statusChangeCallback(response) {  // Called with the results from FB.getLoginStatus().
//     console.log('statusChangeCallback');
//     console.log(response);                   // The current login status of the person.
//     if (response.status === 'connected') {   // Logged into your webpage and Facebook.
//       testAPI();
//     } else {                                 // Not logged into your webpage or we are unable to tell.
//       document.getElementById('status').innerHTML = 'Please log ' + 'into this webpage.';
//     }
//   }
// FB.getLoginStatus(function(response) {
//    statusChangeCallback(response);
// });
// FB.getLoginStatus(function(response) {
//    statusChangeCallback(response);
// });
//
// FB.logout(function(response) {
//     // Person is now logged out
// });

function GoogleSigninInit() {
	gapi.load('auth2', function () {
		gapi.auth2.init({
			client_id: "903784164097-u7rf60ibbveqda2u45le12806qquv2i8" //必填，記得開發時期要開啟 Chrome開發人員工具 查看有沒有403錯誤(Javascript來源被禁止)
		});
	});
}//end GoogleSigninInit function

function onSignIn() {
	let auth2 = gapi.auth2.getAuthInstance();//取得GoogleAuth物件
	auth2.signIn().then(function (GoogleUser) {
		console.log("Google登入成功");
		console.log('ID: ' + GoogleUser.getId()); // Do not send to your backend! Use an ID token instead.
		// The ID token you need to pass to your backend:
		let id_token = GoogleUser.getAuthResponse().id_token;
		console.log("ID Token: " + id_token);
		const data = {
			provider: "google",
			access_token: id_token
		};
		console.log(data);
		// 把登入資料拿去打後端 signin api, 再轉址到 member.html 顯示用戶資料
		// app.ajax("post", app.cst.API_HOST + "/user/signin", data, {}, function (res) {
		// 	if (res.readyState === 4 && res.status === 200) {
		// 		console.log(res);
		// 		google_res = res;
		// 		document.cookie = `token=${JSON.parse(res.response).data.access_token}`;
		// 		window.location = "./member.html";
		// 	} else {
		// 		alert(res.responseText);
		// 	}
		// });

	})
}
