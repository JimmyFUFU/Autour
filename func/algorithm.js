var find2pointShortestPath = function(matrix , start ,end){

  var minpath = []
  var mainstack = [] , substack = []
  var eachsubstack = []
  var minweight = 0
  mainstack.push(start)
  for (let i = 0 ; i < matrix.length ; i++){
    if(matrix[start][i]>0){eachsubstack.push(i)}
  }
  substack.push(eachsubstack)

  while (mainstack.length !== 0) {

    var substacklastarr = substack[substack.length-1]

    if (substacklastarr && substacklastarr.length>0) {
      var thissubstack = substack.pop()
      var eachsubstack = []
      var newpop = thissubstack.shift()
      mainstack.push(newpop)
      substack.push(thissubstack)

      for (let i = 0 ; i < matrix.length ; i++){
        if(matrix[newpop][i]>0 && mainstack.indexOf(i) === -1){eachsubstack.push(i)}
      }
      substack.push(eachsubstack)

    }else{
      mainstack.pop()
      substack.pop()
    }
    if (mainstack[mainstack.length-1] === end) {
      if(mainstack.length === matrix.length) {
        let weight = 0
        for(let i = 0 ; i < mainstack.length-1 ; i++){
          weight += matrix[mainstack[i]][mainstack[i+1]]
        }
        if(minweight == 0 || weight < minweight) {
          minweight = weight;
          minpath = [];
          mainstack.forEach((item, i) => {minpath.push(item)});
        }
      }
      mainstack.pop()
      substack.pop()
    }
 }
 return minpath
}

var toMatrix = function(obj){
  var moveCostMatrix = []
  for (var i = 0; i < obj.rows.length; i++) {
    let array = []
    for (var j = 0; j < obj.rows[i].elements.length; j++) {
      if(obj.rows[i].elements[j].status === 'OK' ) array.push(obj.rows[i].elements[j].duration.value)
      else array.push(0)
    }
    moveCostMatrix.push(array)
  }
  return moveCostMatrix
}



module.exports.find2pointShortestPath = find2pointShortestPath;
module.exports.toMatrix = toMatrix;
