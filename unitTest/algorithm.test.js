const algorithm = require('../func/algorithm.js')

describe('algorithm', () => {
  test('find2PointAllPath ', () => {
    const testMatrix1 = [ [ -1, 269, 307, 1477, 1899, 0 ],
                          [ 274, -1, 381, 1664, 1966, 274 ],
                          [ 434, 387, -1, 1469, 1891, 434 ],
                          [ 1665, 1669, 1466, -1, 2351, 1665 ],
                          [ 2119, 1974, 1975, 2155, -1, 2119 ],
                          [ 0, 269, 307, 1477, 1899, -1] ]
    const ansArray1 = [ { path: [ 0, 1, 2, 3, 4, 5 ], weight: 6589 },
                        { path: [ 0, 1, 2, 4, 3, 5 ], weight: 6361 },
                        { path: [ 0, 1, 3, 2, 4, 5 ], weight: 7409 },
                        { path: [ 0, 1, 3, 4, 2, 5 ], weight: 6693 },
                        { path: [ 0, 1, 4, 2, 3, 5 ], weight: 7344 },
                        { path: [ 0, 1, 4, 3, 2, 5 ], weight: 6290 },
                        { path: [ 0, 2, 1, 3, 4, 5 ], weight: 6828 },
                        { path: [ 0, 2, 1, 4, 3, 5 ], weight: 6480 },
                        { path: [ 0, 2, 3, 1, 4, 5 ], weight: 7530 },
                        { path: [ 0, 2, 3, 4, 1, 5 ], weight: 6375 },
                        { path: [ 0, 2, 4, 1, 3, 5 ], weight: 7501 },
                        { path: [ 0, 2, 4, 3, 1, 5 ], weight: 6296 },
                        { path: [ 0, 3, 1, 2, 4, 5 ], weight: 7537 },
                        { path: [ 0, 3, 1, 4, 2, 5 ], weight: 7521 },
                        { path: [ 0, 3, 2, 1, 4, 5 ], weight: 7415 },
                        { path: [ 0, 3, 2, 4, 1, 5 ], weight: 7082 },
                        { path: [ 0, 3, 4, 1, 2, 5 ], weight: 6617 },
                        { path: [ 0, 3, 4, 2, 1, 5 ], weight: 6464 },
                        { path: [ 0, 4, 1, 2, 3, 5 ], weight: 7388 },
                        { path: [ 0, 4, 1, 3, 2, 5 ], weight: 7437 },
                        { path: [ 0, 4, 2, 1, 3, 5 ], weight: 7590 },
                        { path: [ 0, 4, 2, 3, 1, 5 ], weight: 7286 },
                        { path: [ 0, 4, 3, 1, 2, 5 ], weight: 6538 },
                        { path: [ 0, 4, 3, 2, 1, 5 ], weight: 6181 } ]

    expect(algorithm.find2PointAllPath(testMatrix1, 0, 5)).toStrictEqual(ansArray1)
  })
  /*
  test('toMatrix ', () => {

    expect(algorithm.toMatrix()).toStrictEqual()
  })
  test('openingMatrix ', () => {

    expect(algorithm.openingMatrix()).toStrictEqual()
  })
  test('findShortestPath ', () => {

    expect(algorithm.findShortestPath()).toStrictEqual()
  })
  */
});
