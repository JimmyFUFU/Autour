function renderalert(type, alertText){
  switch (type) {
    case 'success':
      document.querySelector('#successAlert').style.display = 'flex'
      console.log(document.querySelector('#successAlert'));
      document.querySelector('#successText').innerText = alertText
      animateCSS('#successAlert','fadeIn')
      setTimeout(()=> {
        animateCSS('#successAlert','fadeOut', function(){
          document.querySelector('#successAlert').style.display = 'none'
          document.querySelector('#successText').innerText = ''
        })
      },5000)
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
      },5000)
      break;
  }
}
