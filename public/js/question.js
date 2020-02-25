// google Autocomplete
new google.maps.places.Autocomplete(document.querySelector('.startpoint'));
new google.maps.places.Autocomplete(document.querySelector('.endpoint'));
new google.maps.places.Autocomplete(document.querySelector('.mustgoinput'));

// 輸入資料放全域
var cityarr = [],
  hotelarray = [],
  prefertype = [],
  mustgoarr = [],
  startdaytime

var API_HOST = location.origin;

function addMustGo() {
  var mustgoinput = document.querySelector('.mustgoinput').value
  if(mustgoinput){
    var mustgoblock = document.querySelector('.mustgoblock')
    let div = document.createElement("div")
    let p = document.createElement("p")
    let delbtn = document.createElement("div")
    p.innerText = mustgoinput
    p.style.fontSize = '15px'
    delbtn.className = 'deletemustgoplace'
    delbtn.onclick = function() {deletemustgoplace(this)};
    div.appendChild(p);
    div.appendChild(delbtn);
    div.className = 'mustgoplace'
    div.value = mustgoinput
    mustgoblock.appendChild(div);
    document.querySelector('.mustgoinput').value = ''
  }
}

function deletemustgoplace(thisobject) {
  let mustgoblock = document.querySelector('.mustgoblock')
  mustgoblock.removeChild(thisobject.parentNode)
}

function clickcity(thisbox) {
  if (thisbox.checked){
    document.querySelector(`#point${thisbox.id}`).style.display = "block"
    animateCSS(`#point${thisbox.id}`,'bounceInDown')
  }else{
    animateCSS(`#point${thisbox.id}`,'bounceOutUp' , function(){document.querySelector(`#point${thisbox.id}`).style.display = "none"})
  }
}

function confirmQ1() {

  // city
  cityarr = [] //清空重放
  var citycheckbox = document.querySelectorAll('.citycheckbox')
  for (var i in citycheckbox) {
    if (citycheckbox[i].checked == true) {
      cityarr.push(citycheckbox[i].value);
    }
  }
  if (cityarr.length > 0) {
    document.querySelector("#Q2 > p > strong").innerText = `${cityarr}`
    document.querySelector('#Q2').style.display = 'block'
    document.querySelector('#Q1').style.display = 'none'
    document.querySelector(".letsGo").style.backgroundImage = "url('../icon/next.png')"
    document.querySelector(".letsGo").onclick = function(){confirmQ2()}
    document.querySelector(".backicon").style.display = 'block'
    document.querySelector(".backicon").onclick = function(){back2Q1()}
    document.querySelector(".progressbar").style.width = '33.3%'
    // let curtime = new Date()
    // document.querySelector('.startdaytime').value = `"${curtime.getFullYear()}-${curtime.getMonth()+1}-${curtime.getDate()}T09:00"`;
  } else {
    console.log('Please select city');
    document.querySelector('.Q1error').style.display = 'flex'
    animateCSS(`.Q1error`,'shake')
  }
}

function confirmQ2() {
  startdaytime = document.querySelector('.startdaytime').value
  var enddaytime = document.querySelector('.enddaytime').value
  var startpoint = document.querySelector('.startpoint').value
  var endpoint = document.querySelector('.endpoint').value

  if (!startdaytime || !enddaytime || !startpoint || !endpoint) {
    console.log('Please check your info')
    document.querySelector('.Q2error').style.display = 'flex'
    document.querySelector('.Q2errortext').innerText = '你確定你都有填嗎 ?'
    animateCSS(`.Q2error`,'shake')
  } else if (Date.parse(startdaytime).valueOf() >= Date.parse(enddaytime).valueOf()) {
    console.log('End time CAN NOT earlier than Start time')
    document.querySelector('.Q2error').style.display = 'flex'
    document.querySelector('.Q2errortext').innerText = '開始時間不能比結束時間晚哦 !'
    animateCSS(`.Q2error`,'shake')
  }else{
    // 有幾天
    startdaytime = new Date(startdaytime)
    var enddaytime = new Date(enddaytime)
    var days = (Date.parse(new Date(enddaytime.getFullYear(), enddaytime.getMonth(), enddaytime.getDate())) - Date.parse(new Date(startdaytime.getFullYear(), startdaytime.getMonth(), startdaytime.getDate())))/86400000

      // 有按就要清空 #hoteldiv
      document.querySelector('#hoteldiv').innerHTML = "";
      for (let i = 0; i < days; i++) {
        let div = document.createElement('div')
        let label = document.createElement('label')
        let hotelinput = document.createElement('input')
        // 都住同一個地方的按鈕
        /*if (i === 0) {
          let allSameHotelBtn = document.createElement('input')
          allSameHotelBtn.type = 'button'
          allSameHotelBtn.value = '都住同一個地方'
          allSameHotelBtn.onclick = function(){allSameHotel()};
          document.querySelector('#hoteldiv').appendChild(allSameHotelBtn)
        }*/

        //算天數 每天都要給住宿框框
        let getdate = new Date(startdaytime.valueOf() + 1000 * 60 * 60 * 24 * i)
        label.innerText = `${getdate.getFullYear()} / ${getdate.getMonth()+1} / ${getdate.getDate()}`
        label.className = 'hoteldate'
        hotelinput.type = 'text'
        hotelinput.className = 'hotel'
        // hotelinput.value = '台灣新竹市北區西濱路一段168旅館-新竹館'
        div.appendChild(label)
        div.appendChild(hotelinput)
        new google.maps.places.Autocomplete(hotelinput);
        document.querySelector('#hoteldiv').appendChild(div)
      }
      document.querySelector('#Q3').style.display = 'block'
      document.querySelector('#Q2').style.display = 'none'
      document.querySelector('.Q2error').style.display = 'none'
      document.querySelector(".letsGo").onclick = function(){confirmQ3()};
      document.querySelector(".backicon").style.display = 'block'
      document.querySelector(".backicon").onclick = function(){back2Q2()}
      document.querySelector(".progressbar").style.width = '50%'
  }
}

function confirmQ3() {
  var checkhotel = true
  for (let i = 0; i < $('.hoteldate').length; i++) {
    if (!document.querySelectorAll('.hotel')[i].value) {
      checkhotel = false
      break
    }
  }
  if (checkhotel) {
    document.querySelector('#Q4').style.display = 'block'
    document.querySelector('#Q3').style.display = 'none'
    document.querySelector('.Q3error').style.display = 'none'
    document.querySelector(".letsGo").onclick = function(){confirmQ4()};
    document.querySelector(".backicon").style.display = 'block'
    document.querySelector(".backicon").onclick = function(){back2Q3()}
    document.querySelector(".progressbar").style.width = '66.6%'
    // 放進 hotelarray
    hotelarray = [] // 清空
    for (let i = 0; i < $('.hoteldate').length; i++) {
      hotelarray.push({
        date: document.querySelectorAll('.hoteldate')[i].innerText,
        hotel: document.querySelectorAll('.hotel')[i].value
      })
    }
  }else {
    document.querySelector('.Q3error').style.display = 'flex'
    document.querySelector('.Q3errortext').innerText = '你確定你都有填嗎 ?'
    animateCSS(`.Q3error`,'shake')
  }
}

function confirmQ4() {
  document.querySelector('#Q5').style.display = 'block'
  document.querySelector('#Q4').style.display = 'none'
  document.querySelector(".letsGo").onclick = function(){confirmQ5()};
  document.querySelector(".backicon").style.display = 'block'
  document.querySelector(".backicon").onclick = function(){back2Q4()}
  document.querySelector(".progressbar").style.width = '83.3%'
  // get prefer type
  var prefercheckbox = document.querySelectorAll('.prefercheckbox')
  prefertype = []
  for (var i in prefercheckbox) {
    if (prefercheckbox[i].checked == true) {
      prefertype.push(prefercheckbox[i].value);
    }
  }

}

function confirmQ5() {
  document.querySelector('#Q6').style.display = 'block'
  document.querySelector('#Q5').style.display = 'none'
  document.querySelector(".letsGo").onclick = function(){submit()};
  document.querySelector(".letsGo").style.backgroundImage = "url('../icon/go.png')"
  document.querySelector(".backicon").style.display = 'block'
  document.querySelector(".backicon").onclick = function(){back2Q5()}
  document.querySelector(".progressbar").style.width = '99.9%'
  mustgoarr = [] // 清空
  for (var i = 0; i < $('.mustgoplace > p').length; i++) {
    mustgoarr.push($('.mustgoplace > p')[i].innerText)
  }
}

function changeEndtime() {
  if (document.querySelector('.enddaytime').value == "") {
    document.querySelector('.enddaytime').value = document.querySelector('.startdaytime').value
  }
}

function SameAsStartPoint(thisobject) {
  if (thisobject.checked) {
    document.querySelector('.endpoint').value = document.querySelector('.startpoint').value
  } else {
    document.querySelector('.endpoint').value = ''
  }
}

function submit() {

  var transportation = []
  for (var i = 0; i < $('.transcheckbox').length; i++) {
    if ($('.transcheckbox')[i].checked == true) {
      transportation.push($('.transcheckbox')[i].value)
    }
  }
  if (!transportation.length) {
    document.querySelector('.Q6error').style.display = 'flex'
    document.querySelector('.Q6errortext').innerText = '交通方式要勾哦 ! '
    animateCSS(`.Q6error`,'shake')
    return
  }


  var socket = io();
  socket.on('server message', (data) => {
    console.log(data.msg); // Hello Client
    document.querySelector('#loadingtext').innerText = `正在幫您完成第 ${data.day} 天的行程 ...`
  });

  // loading
  document.querySelector('.loading').style.display = 'flex'
  document.styleSheets[0].addRule('.bigflex.bigflex::after','display: block;');

  localStorage.setItem('titleplaceholder' , `${startdaytime.getFullYear()}/${startdaytime.getMonth()+1} ${cityarr}`)

  var jsonobj = {
    city: cityarr,
    start: {
      time: $('.startdaytime').val(),
      place: $('.startpoint').val()
    },
    end: {
      time: $('.enddaytime').val(),
      place: $('.endpoint').val()
    },
    hotelarray: hotelarray,
    prefertype: prefertype,
    mustgo: mustgoarr,
    transportation: transportation,
  }

  for (var i = 0; i < $('.timeradio').length; i++) {
    if ($('.timeradio')[i].checked == true) {
      jsonobj['timetype'] = $('.timeradio')[i].value
      localStorage.setItem('timetype' , $('.timeradio')[i].value )
    }
  }

  localStorage.setItem('prefertype' , prefertype)
  localStorage.setItem('transportation' , transportation)

  $.ajax({
    type: 'POST',
    data: JSON.stringify(jsonobj),
    contentType: 'application/json',
    url: `${API_HOST}/newAutour`,
    success: function(data) {
      localStorage.setItem('tour', JSON.stringify(data.periodarray));
      localStorage.setItem('warning', JSON.stringify(data.warningarray));
      // document.write(JSON.stringify(data))
      // console.log(data);
      window.location.href=`${API_HOST}/tourdetail.html`;
    },
    error: function(data){
      console.log(data);
      document.querySelector('#errordiv').style.display = 'block'
      document.querySelector('#errordiv .errorbtn').onclick = function (){
        document.querySelector('.loading').style.display = 'none'
        document.styleSheets[0].addRule('.bigflex.bigflex::after','display: none;');
        document.querySelector('#errordiv').style.display = 'none'
      }
    }
  })
  
}

function back2Q1() {
  document.querySelector('#Q1').style.display = 'block'
  document.querySelector('#Q2').style.display = 'none'
  document.querySelector(".letsGo").onclick = function(){confirmQ1()}
  document.querySelector(".backicon").onclick = function(){window.location.reload()}
  document.querySelector(".progressbar").style.width = '16.6%'
}

function back2Q2() {
  document.querySelector('#Q2').style.display = 'block'
  document.querySelector('#Q3').style.display = 'none'
  document.querySelector(".letsGo").onclick = function(){confirmQ2()}
  document.querySelector(".backicon").onclick = function(){back2Q1()}
  document.querySelector(".progressbar").style.width = '33.3%'
}

function back2Q3() {
  document.querySelector('#Q3').style.display = 'block'
  document.querySelector('#Q4').style.display = 'none'
  document.querySelector(".letsGo").onclick = function(){confirmQ3()}
  document.querySelector(".backicon").onclick = function(){back2Q2()}
  document.querySelector(".progressbar").style.width = '50%'
}

function back2Q4() {
  document.querySelector('#Q4').style.display = 'block'
  document.querySelector('#Q5').style.display = 'none'
  document.querySelector(".letsGo").onclick = function(){confirmQ4()}
  document.querySelector(".backicon").onclick = function(){back2Q3()}
  document.querySelector(".progressbar").style.width = '66.6%'
}

function back2Q5() {
  document.querySelector('#Q5').style.display = 'block'
  document.querySelector('#Q6').style.display = 'none'
  document.querySelector(".letsGo").style.backgroundImage = "url('../icon/next.png')"
  document.querySelector(".letsGo").onclick = function(){confirmQ5()}
  document.querySelector(".backicon").onclick = function(){back2Q4()}
  document.querySelector(".progressbar").style.width = '83.3%'
}
