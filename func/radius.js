var radius = function (transportation){
  switch (transportation[0]) {
    case 'driving':
      return 30000
      break;
    case 'bicycling':
      return 20000
      break;
    case 'transit':
      return 20000
      break;
    case 'walking':
      return 3500
      break;
  }
}
module.exports.getradius = radius
