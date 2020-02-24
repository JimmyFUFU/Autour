var radius = function (transportation){
  var radiusfinal = 0
  for (let i in transportation) {
    if(transportation[i] === 'driving') radiusfinal =  30000
    else if(transportation[i] === 'bicycling' || transportation[i] === 'transit') radiusfinal =  20000
    else if(transportation[i] === 'walking') radiusfinal = 3500
  }
  return radiusfinal
}

module.exports.getradius = radius
