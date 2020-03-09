const big2Small = function (list , bywhat){
  for (let i = list.length-1 ; i > 0  ; i--) {
    for (let j = 0 ; j < i ; j++){
      if(list[j][bywhat] < list[j+1][bywhat]){
        [list[j], list[j+1]] = [list[j+1], list[j]]
      }
    }
  }
}

const small2Big = function (list , bywhat){
  for (let i = list.length-1 ; i > 0  ; i--) {
    for (let j = 0 ; j < i ; j++){
      if(list[j][bywhat] > list[j+1][bywhat]){
        [list[j], list[j+1]] = [list[j+1], list[j]]
      }
    }
  }
}
module.exports = {
  big2Small,
  small2Big
}
