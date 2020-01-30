// google Autocomplete
new google.maps.places.Autocomplete(document.querySelector('.startpoint'));
new google.maps.places.Autocomplete(document.querySelector('.endpoint'));
new google.maps.places.Autocomplete(document.querySelector('.mustgoinput'));

// 輸入資料放全域
var cityarr = [],
  hotelarray = [],
  prefertype = [],
  mustgoarr = []

var API_HOST = location.origin;

function addMustGo() {
  var mustgoinput = document.querySelector('.mustgoinput').value
  var mustgoblock = document.querySelector('.mustgoblock')
  let div = document.createElement("div")
  let p = document.createElement("p")
  let delbtn = document.createElement("div")
  p.innerText = mustgoinput
  delbtn.className = 'deletemustgoplace'
  delbtn.onclick = function() {
    deletemustgoplace(this)
  };
  div.appendChild(p);
  div.appendChild(delbtn);
  div.className = 'mustgoplace'
  div.value = mustgoinput
  mustgoblock.appendChild(div);
  document.querySelector('.mustgoinput').value = ''
}

function deletemustgoplace(thisobject) {
  var mustgoblock = document.querySelector('.mustgoblock')
  mustgoblock.removeChild(thisobject.parentNode)
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
    document.querySelector("#Q2 > p").innerText = `偷偷告訴我你幾號幾點會從 ${cityarr} 的哪裡開始旅行 ? *`
    document.querySelector('#Q2').style.display = 'block'
  } else {
    console.log('Please select city');
  }
}

function confirmQ2() {
  var startdaytime = document.querySelector('.startdaytime').value
  var enddaytime = document.querySelector('.enddaytime').value
  var startpoint = document.querySelector('.startpoint').value
  var endpoint = document.querySelector('.endpoint').value

  if (!startdaytime || !enddaytime || !startpoint || !endpoint) {
    console.log('Please check your info')
  } else if (Date.parse(startdaytime).valueOf() >= Date.parse(enddaytime).valueOf()) {
    console.log('Start time CAN NOT earlier than End time')
  } else {
    startdaytime = new Date(Date.parse(startdaytime));
    enddaytime = new Date(Date.parse(enddaytime));
    // 有按就要清空 #hoteldiv
    document.querySelector('#hoteldiv').innerHTML = "";
    // 有幾天
    for (let i = 0; i < enddaytime.getDate() - startdaytime.getDate(); i++) {
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
      div.appendChild(label)
      div.appendChild(hotelinput)
      new google.maps.places.Autocomplete(hotelinput);
      document.querySelector('#hoteldiv').appendChild(div)
    }
    document.querySelector('#Q3').style.display = 'block'
  }
}

function confirmQ3() {
  document.querySelector('#Q4').style.display = 'block'

  // 放進 hotelarray
  hotelarray = [] // 清空
  for (let i = 0; i < $('.hoteldate').length; i++) {
    hotelarray.push({
      date: document.querySelectorAll('.hoteldate')[i].innerText,
      hotel: document.querySelectorAll('.hotel')[i].value
    })
  }
}

function confirmQ4() {
  document.querySelector('#Q5').style.display = 'block'

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
  mustgoarr = [] // 清空
  for (var i = 0; i < $('.mustgoplace > p').length; i++) {
    mustgoarr.push($('.mustgoplace > p')[i].innerText)
  }
}

function changeEndtime() {
  document.querySelector('.enddaytime').value = document.querySelector('.startdaytime').value
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
    }
  }

  $.ajax({
    type: 'POST',
    data: JSON.stringify(jsonobj),
    contentType: 'application/json',
    url: `${API_HOST}/newAutour`,
    success: function(data) {
      console.log(data);
    }
  })
}
