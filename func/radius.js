var radius = function (transportation){
  var radiusfinal = 0
  for (let i in transportation) {
    if(transportation[i] === 'car') radiusfinal =  30000
    else if(transportation[i] === 'motor' || transportation[i] === 'publictrans') radiusfinal =  20000
    else if(transportation[i] === 'foots') radiusfinal = 3500
  }
  return radiusfinal
}

module.exports.getradius = radius
