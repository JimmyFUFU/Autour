var addscore = function (array , weight){
  for (var i in array) {
    array[i]["score"] = (array[i].user_ratings_total/1000 + array[i].rating) * weight
  }
}

module.exports.addscore = addscore
