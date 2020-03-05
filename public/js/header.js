if(sessionStorage.name){
  document.querySelector('.hitext strong').innerText = sessionStorage.name
}
if (sessionStorage.picture) {
  document.querySelector('.member').src = sessionStorage.picture
  document.querySelector('.member').style.border = '1.4px solid #233D4D'
  document.querySelector('.member').style.borderRadius="50%"
  document.querySelector('.member').style.padding = '6%'
}
