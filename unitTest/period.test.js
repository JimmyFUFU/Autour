const period = require('../func/period.js')

describe('period', () => {
  test('getperiod ', () => {
    const requestObject =  {
      city: [ "新竹" ],
      start: { "time": "2020-01-22T18:00" ,"place": "台灣新竹市東區中華路二段新竹火車站" },
      end: { "time": "2020-01-23T18:00", "place": "台灣新竹市東區中華路二段新竹火車站" },
      hotelarray: [
      	{ "date": "2020 / 1 / 22", "hotel": "台灣新竹市東區中央路新竹福泰商務飯店" }
      	],
      prefertype: [ "movie" , "animal" ],
      mustgo: [ "台灣新竹市東區西大路新竹大遠百" , "青草湖夜市" ],
      transportation: [ "transit" , "walking" ],
      timetype: "fast"
    }
    const periodArray = [
    {
      year: 2020,
      month: 1,
      date: 22,
      week: 3,
      period: {
        place: [
                {
                    name: "",
                    time: new Date("2020-01-22T19:00:00.000Z")
                },
                {
                    name: "",
                    time: new Date("2020-01-22T21:00:00.000Z")
                }
              ],
        dinner: { name: "", time: new Date("2020-01-22T18:00:00.000Z")},
        start: { name: "台灣新竹市東區中華路二段新竹火車站", time: "2020-01-22T18:00"},
        end: { name: "台灣新竹市東區中央路新竹福泰商務飯店"}
      },
      placelist: []
    },
    {
      year: 2020,
      month: 1,
      date: 23,
      week: 4,
      period: {
        place: [
                {
                    name: "",
                    time: new Date("2020-01-23T10:00:00.000Z")
                },
                {
                    name: "",
                    time: new Date("2020-01-23T13:00:00.000Z")
                },
                {
                    name: "",
                    time: new Date("2020-01-23T15:00:00.000Z")
                },
                {
                    name: "",
                    time: new Date("2020-01-23T17:00:00.000Z")
                }
              ],
        lunch: {name: "", time: new Date("2020-01-23T12:00:00.000Z")},
        start: {name: "台灣新竹市東區中央路新竹福泰商務飯店"},
        end: {name: "台灣新竹市東區中華路二段新竹火車站", time: "2020-01-23T18:00"}
      },
      placelist: []
    }
  ]
    expect(period.getperiod(requestObject)).toStrictEqual(periodArray)
  })
})
