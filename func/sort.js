var sortby = function (list , bywhat){
  for (let i = list.length-1 ; i >= 0  ; i--) {
    for (let j = 0 ; j < i ; j++){
      if(list[j][bywhat] < list[j+1][bywhat]){
        temp = list[j]
        list[j] = list[j+1]
        list[j+1] = temp
      }
    }
  }
}

var bysmall2big = function (list , bywhat){
  for (let i = list.length-1 ; i >= 0  ; i--) {
    for (let j = 0 ; j < i ; j++){
      if(list[j][bywhat] > list[j+1][bywhat]){
        temp = list[j]
        list[j] = list[j+1]
        list[j+1] = temp
      }
    }
  }
}
module.exports.by = sortby
module.exports.bysmall2big = bysmall2big
