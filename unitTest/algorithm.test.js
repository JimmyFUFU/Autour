const algorithm = require('../func/algorithm.js')

describe('algorithm', () => {
  test('find2PointAllPath ', () => {
    const testMatrix1 = [
                          [ -1, 269, 307, 1477, 1899, 0 ],
                          [ 274, -1, 381, 1664, 1966, 274 ],
                          [ 434, 387, -1, 1469, 1891, 434 ],
                          [ 1665, 1669, 1466, -1, 2351, 1665 ],
                          [ 2119, 1974, 1975, 2155, -1, 2119 ],
                          [ 0, 269, 307, 1477, 1899, -1] ]
    const ansArray1 = [
                        { path: [ 0, 1, 2, 3, 4, 5 ], weight: 6589 },
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
    const testMatrix2 = [
                          [ -1, 0, 3, 1 ],
                          [ 0, -1, -1, 2 ],
                          [ 4, -1, -1, -1 ],
                          [ 1, 3, 3, -1 ] ]
    const ansArray2 = []
    expect(algorithm.find2PointAllPath(testMatrix2, 0, 3)).toStrictEqual(ansArray2)
    const testMatrix3 = [
                          [ -1, 0, 3],
                          [ 0, -1, -1],
                          [ 3, -1, -1 ]]
    const ansArray3 = []
    expect(algorithm.find2PointAllPath(testMatrix3, 0, 3)).toStrictEqual(ansArray3)
    const testMatrix4 = [
                          [ -1, 1, 2, 5],
                          [ 1, -1, 1, 3],
                          [ 2, 1, -1, 2],
                          [ 5, 3, 2, -1] ]
    const ansArray4 = [
                        { path: [ 0, 1, 2, 3 ], weight: 4 },
                        { path: [ 0, 2, 1, 3 ], weight: 6 } ]
    expect(algorithm.find2PointAllPath(testMatrix4, 0, 3)).toStrictEqual(ansArray4)
  })
  test('toMatrix ', () => {
    const googleDistanceMatrix1 = {
      destination_addresses: [
        '300台灣新竹市東區中華路二段445號新竹300',
        '300台灣新竹市東區西大路323號',
        '300台灣新竹市東區中央路229號',
        '303台灣新竹縣湖口鄉榮光路158號',
        '300台灣新竹市東區中華路二段445號新竹300'
      ],
      origin_addresses: [
        '300台灣新竹市東區中華路二段445號新竹300',
        '300台灣新竹市東區西大路323號',
        '300台灣新竹市東區中央路229號',
        '303台灣新竹縣湖口鄉榮光路158號',
        '300台灣新竹市東區中華路二段445號新竹300'
      ],
      rows: [
        {
          elements: [
            {
              distance: { text: '1 公尺', value: 0 },
              duration: { text: '1 分鐘', value: 0 },
              status: 'OK'
            },
            {
              distance: { text: '1.1 公里', value: 1061 },
              duration: { text: '4 分鐘', value: 269 },
              status: 'OK'
            },
            {
              distance: { text: '1.2 公里', value: 1196 },
              duration: { text: '5 分鐘', value: 307 },
              status: 'OK'
            },
            {
              distance: { text: '11.7 公里', value: 11733 },
              duration: { text: '25 分鐘', value: 1477 },
              status: 'OK'
            },
            {
              distance: { text: '1 公尺', value: 0 },
              duration: { text: '1 分鐘', value: 0 },
              status: 'OK'
            }
          ]
        },
        {
          elements: [
            {
              distance: { text: '1.0 公里', value: 997 },
              duration: { text: '5 分鐘', value: 274 },
              status: 'OK'
            },
            {
              distance: { text: '1 公尺', value: 0 },
              duration: { text: '1 分鐘', value: 0 },
              status: 'OK'
            },
            {
              distance: { text: '1.3 公里', value: 1328 },
              duration: { text: '6 分鐘', value: 381 },
              status: 'OK'
            },
            {
              distance: { text: '12.4 公里', value: 12438 },
              duration: { text: '28 分鐘', value: 1664 },
              status: 'OK'
            },
            {
              distance: { text: '1.0 公里', value: 997 },
              duration: { text: '5 分鐘', value: 274 },
              status: 'OK'
            }
          ]
        },
        {
          elements: [
            {
              distance: { text: '1.3 公里', value: 1288 },
              duration: { text: '7 分鐘', value: 434 },
              status: 'OK'
            },
            {
              distance: { text: '1.3 公里', value: 1292 },
              duration: { text: '6 分鐘', value: 387 },
              status: 'OK'
            },
            {
              distance: { text: '1 公尺', value: 0 },
              duration: { text: '1 分鐘', value: 0 },
              status: 'OK'
            },
            {
              distance: { text: '11.5 公里', value: 11497 },
              duration: { text: '24 分鐘', value: 1469 },
              status: 'OK'
            },
            {
              distance: { text: '1.3 公里', value: 1288 },
              duration: { text: '7 分鐘', value: 434 },
              status: 'OK'
            }
          ]
        },
        {
          elements: [
            {
              distance: { text: '12.2 公里', value: 12178 },
              duration: { text: '28 分鐘', value: 1665 },
              status: 'OK'
            },
            {
              distance: { text: '12.5 公里', value: 12458 },
              duration: { text: '28 分鐘', value: 1669 },
              status: 'OK'
            },
            {
              distance: { text: '11.5 公里', value: 11504 },
              duration: { text: '24 分鐘', value: 1466 },
              status: 'OK'
            },
            {
              distance: { text: '1 公尺', value: 0 },
              duration: { text: '1 分鐘', value: 0 },
              status: 'OK'
            },
            {
              distance: { text: '12.2 公里', value: 12178 },
              duration: { text: '28 分鐘', value: 1665 },
              status: 'OK'
            }
          ]
        },
        {
          elements: [
            {
              distance: { text: '1 公尺', value: 0 },
              duration: { text: '1 分鐘', value: 0 },
              status: 'OK'
            },
            {
              distance: { text: '1.1 公里', value: 1061 },
              duration: { text: '4 分鐘', value: 269 },
              status: 'OK'
            },
            {
              distance: { text: '1.2 公里', value: 1196 },
              duration: { text: '5 分鐘', value: 307 },
              status: 'OK'
            },
            {
              distance: { text: '11.7 公里', value: 11733 },
              duration: { text: '25 分鐘', value: 1477 },
              status: 'OK'
            },
            {
              distance: { text: '1 公尺', value: 0 },
              duration: { text: '1 分鐘', value: 0 },
              status: 'OK'
            }
          ]
        }
      ],
      status: 'OK'
    }
    const ansArray1 = [
                        [ -1, 269, 307, 1477, 0 ],
                        [ 274, -1, 381, 1664, 274 ],
                        [ 434, 387, -1, 1469, 434 ],
                        [ 1665, 1669, 1466, -1, 1665 ],
                        [ 0, 269, 307, 1477, -1 ] ]
    expect(algorithm.toMatrix(googleDistanceMatrix1,'nearby')).toStrictEqual(ansArray1)
    const googleDistanceMatrix2 = {
      destination_addresses: [ '300台灣新竹市東區西大路323號' ],
      origin_addresses: [ '300台灣新竹市東區中華路二段445號新竹300' ],
      rows: [
        {
          elements: [
            {
              distance: { text: '0.8 公里', value: 800 },
              duration: { text: '10 分鐘', value: 602 },
              status: 'OK'
            }
          ]
        }
      ],
      status: 'OK'
    }
    const ansArray2 = [ [ 602 ] ]
    expect(algorithm.toMatrix(googleDistanceMatrix2, 'mostgo')).toStrictEqual(ansArray2)
    // const googleDistanceMatrix3 = {}
    // expect(algorithm.toMatrix(googleDistanceMatrix3, 'mostgo')).toThrow()
  })
  test('openingMatrix ', () => {
    const placelistDetail = [{
      address_components: [
        {
          long_name: '323號',
          short_name: '323號',
          types: [ 'street_number' ]
        },
        { long_name: '西大路', short_name: '西大路', types: [ 'route' ] },
        {
          long_name: '東區',
          short_name: '東區',
          types: [ 'administrative_area_level_3', 'political' ]
        },
        {
          long_name: '新竹市',
          short_name: '新竹市',
          types: [ 'administrative_area_level_2', 'political' ]
        },
        {
          long_name: '台灣',
          short_name: 'TW',
          types: [ 'country', 'political' ]
        },
        { long_name: '300', short_name: '300', types: [ 'postal_code' ] }
      ],
      adr_address: '<span class="postal-code">300</span><span class="country-name">台灣</span><span class="region">新竹市</span><span class="locality">東區</span><span class="street-address">西大路323號</span>',
      formatted_address: '300台灣新竹市東區西大路323號',
      formatted_phone_number: '03 523 3121',
      geometry: {
        location: { lat: 24.8020553, lng: 120.9649161 },
        viewport: {
          northeast: { lat: 24.8034364302915, lng: 120.9660892802915 },
          southwest: { lat: 24.8007384697085, lng: 120.9633913197085 }
        }
      },
      icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png',
      id: '60bf2b01767d427e1acc2431dac84ae40c883b6b',
      international_phone_number: '+886 3 523 3121',
      name: '新竹大遠百',
      opening_hours: {
        open_now: true,
        periods: [
          {
            close: { day: 0, time: '2200' },
            open: { day: 0, time: '1100' }
          },
          {
            close: { day: 1, time: '2200' },
            open: { day: 1, time: '1100' }
          },
          {
            close: { day: 2, time: '2200' },
            open: { day: 2, time: '1100' }
          },
          {
            close: { day: 3, time: '2200' },
            open: { day: 3, time: '1100' }
          },
          {
            close: { day: 4, time: '2200' },
            open: { day: 4, time: '1100' }
          },
          {
            close: { day: 5, time: '2200' },
            open: { day: 5, time: '1100' }
          },
          {
            close: { day: 6, time: '2200' },
            open: { day: 6, time: '1100' }
          }
        ],
        weekday_text: [
          '星期一: 11:00 – 22:00',
          '星期二: 11:00 – 22:00',
          '星期三: 11:00 – 22:00',
          '星期四: 11:00 – 22:00',
          '星期五: 11:00 – 22:00',
          '星期六: 11:00 – 22:00',
          '星期日: 11:00 – 22:00'
        ]
      },
      photos: [
        {
          height: 3024,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/117395531707355096537">Kevin Chen</a>'
          ],
          photo_reference: 'CmRaAAAAn93gfgCPC33NI4XxuUeeSdEKgSVWXxHrvoH2zNCAFigRuABlCg_jtLl67U5SIMV6uzVzuppOfkmEtSZPeylGymEf6YWuAGKAfhn7c8plPB8M8U7s0vjhPB1mCw_HdylDEhAo17lrVbj3Ul6j4YAqVWjkGhQebMB0eaUGY75soJt9zfPLK8JFHQ',
          width: 4032
        },
        {
          height: 2160,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/117078701590125431918">L-CAT YEH</a>'
          ],
          photo_reference: 'CmRaAAAAfkxG8GgeNUsy_iMe6gOWAthyr5X0-0toUMw63C-jCms537w1MZOuMGSf687Prg05CcmTvcxig5bPB8DgiMuoGd9eGbl5zBpoaUpXmlzLg_tUy_xJTW9BU4_ZVgjI0UkSEhAUDKvuv27JFh7j2FxkNqtaGhQ1aiRZlKfA7k9Gdi0H62cZXjR3_Q',
          width: 3840
        },
        {
          height: 720,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/118374899691728103695">劉小云</a>'
          ],
          photo_reference: 'CmRaAAAAfhYQyYrGYplHKv338z_1n6GliGDJwqFazwvO2kic7coTXHCG4AMuyJaRQtubTmc6Rp4fi_5RKOPvUqimx8_nZZCw_Kz_1_-a83IP0ridkSeZ33cGYG7FL2JzjL3TylDqEhDw--qUuTxsJ8i0xckHRdNiGhRjsYwXFo1uhxWvyhXLLgWogs9Ntw',
          width: 1280
        },
        {
          height: 3024,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/116277021626411600925">jt h</a>'
          ],
          photo_reference: 'CmRaAAAATM3ogrqAfFpVFuAck9fsg4ho5CW3UBO-jt7UX0Fil100uKYeyx-VwDHBHQ1kKdZW1_G5pl-JNtABevEdgzEDe643mclM-50sOAlx44MolSr_IfJYOLPLfc9MOnuziRTQEhDTnQmCoJ1MNgSvSfT9wPaLGhRqNKZ5R2uA7M5XY-jNohxrOppbAQ',
          width: 4032
        },
        {
          height: 3024,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/115730224801486851805">Nathan r</a>'
          ],
          photo_reference: 'CmRaAAAAor8wP10iKgQ5XWFKciRUDeS8nljIZQkmMToxjkhx80bM-zdDqvcOyRw32GbgLv585NErknLres--GXA74vulH_ybfnD1SeGXth5KdoVO3-Yfbf7vNljvNYERNmmIy0q_EhAUT9Sn7AyNLiHOy_2mUI5VGhRv1NJTqz1CwY7SJDLGKXRiJvVsNA',
          width: 4032
        },
        {
          height: 3000,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/117161015492918603087">James Huang</a>'
          ],
          photo_reference: 'CmRaAAAABwMnWrg9-5WN55WXd8ae_zHrG4lHY16eGUyFO6639eZ4zw2dFywQXyQL0mH922Vob_DKwiXKwEwBjSL4ojvtoB81gBjwtb1JQ_VdFbr2nLOZMZn77wE2rLzCFBwovp4JEhDnN_8qRYbNyEqSLapJEfCfGhREJQ1WBeXR43Z-e0sZP0Tz-L8NIA',
          width: 4000
        },
        {
          height: 4032,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/113596392536671986156">夯古莉Hungry</a>'
          ],
          photo_reference: 'CmRaAAAA98fcZ5_TDfNu8UJcWzf84lU4P93fr3o1qBbzboe5zzIaP6hoj0DzAWzDpPcfbqUAknmQogRONFPbsUEZ7Ki2cxMU7GzSYi2j_IxAjl0t2h9baN0UNnpry3xmVtEe5xI4EhBmferbyweuoGPxq4CAjt37GhSJqPaJ6unbDsb58wkWFtkCBQmDmQ',
          width: 3024
        },
        {
          height: 3024,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/108473854684595744150">space R.L</a>'
          ],
          photo_reference: 'CmRaAAAAhsAXeDZq_Wp-D1Eb3mZpnkNmdD5Sno3myt6-yyaFeLwWfbk2mCX5IN1FlZP7lTG-ieG3s7HuxGSIdSWZ4CIdM2rsiBuTl_VSFcswUawKLdbO85YJ2Zy-URa1Id3WiDXlEhCmU4sDg9njtDin0cUdtWKoGhRXEDbwPM3TzbAAHeUwnHkM8eCg3g',
          width: 4032
        },
        {
          height: 3120,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/104773753092476962140">張浩銘</a>'
          ],
          photo_reference: 'CmRaAAAAYxmfdeum7MNPHRBehqkFkhe26d_MzUe8x_kXgoqw4QAgr88r121DRf2VY3fpFn1AbRTvN2QOiDFz1JWMXDlnNPc8zYpXqqLvSCFs7yZzzOkE8v69LSQToNU6ZyaUzkuWEhAqeXFfF-6Zq6ttMIFUaMnXGhSFNyJSUJat_pmQgjrwXQI7uZR12g',
          width: 4160
        },
        {
          height: 4128,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/117118352215632719756">Ivar Kung</a>'
          ],
          photo_reference: 'CmRaAAAAUaRa5Jc-I7c_y51NIToiE_tbKi5UWVKOq2VEP6sqXUjjcSTV4Ou47JKHKaRYcBbrmXkWmqiyLC6Uivn7FLwHlJQhzKj2KgGBCWr4QOIdAjiNQLLMbvrjuF8U3lJ7EztdEhDHezqtVVH-plaHPppDNLGUGhSfgIcftylt05e9KbTHg6NzX-YB3Q',
          width: 3096
        }
      ],
      place_id: 'ChIJER5Vzeo1aDQRikYaeFtPaYA',
      plus_code: { compound_code: 'RX27+RX 台灣新竹市東區', global_code: '7QP2RX27+RX' },
      rating: 4.1,
      reference: 'ChIJER5Vzeo1aDQRikYaeFtPaYA',
      reviews: [
        {
          author_name: 'Tina',
          author_url: 'https://www.google.com/maps/contrib/102175701522692290285/reviews',
          language: 'zh-Hant',
          profile_photo_url: 'https://lh4.ggpht.com/-AMN9XECA8sQ/AAAAAAAAAAI/AAAAAAAAAAA/VmAGQPYHW58/s128-c0x00000000-cc-rp-mo-ba5/photo.jpg',
          rating: 3,
          relative_time_description: '1 週前',
          text: '每次來大遠百大概不是看電影，就是來吃飯。雖然空間不像巨城 這麼大，但裡面可以說是麻雀雖小，五臟俱全，該有的品牌和櫃位也都有，電梯中間的超大水晶燈飾很美。有時候覺得巨城看電影的人潮太多，會選擇跑來這裡看看。\n' +
            '唯一美中不足的是裡面餐廳選擇種類比較不多，除非有特定想吃的餐 廳。好在商圈附近很多餐廳，火鍋店，逛街的小店，像是服飾，飾品，青文咖啡點心館，多種手搖飲料店，要傳統小吃美食和飲料也有，附近還有傳統市場小吃。甚至徒步可以走到新竹火車站周邊商圈，很適合逛一整個下午。\n' +
            '開車停車可以選擇隔壁的明治書院，大遠百地下室也有，但收費較高 。騎機車幾乎附近都可以找得到停車位，走幾步路就到了。',
          time: 1582351189
        },
        {
          author_name: '龍大俠',
          author_url: 'https://www.google.com/maps/contrib/107256333689380267771/reviews',
          language: 'zh-Hant',
          profile_photo_url: 'https://lh3.ggpht.com/-oLfvTIbkmq4/AAAAAAAAAAI/AAAAAAAAAAA/HaLpMzli5b4/s128-c0x00000000-cc-rp-mo-ba4/photo.jpg',
          rating: 4,
          relative_time_description: '3 個月前',
          text: '哈哈~~\n' +
            '要逛大百貨公司來新竹市西大路的{大遠百}就是最正確的選擇了~\n' +
            '第一，有神氣免費接駁車，哈哈，爽爽坐。。。\n' +
            '第二，百貨公司隔壁喔就是超級大大的停車場啊～說真的，我在台灣 還沒看到設計比它優的停車場了！\n' +
            '寬寬的兩車道，緩緩的上坡，清楚的視角，高挑的空間，良好的通風 ，便宜的收費啊哈！(咦?！怎麼變成介紹停車場了呢？)因為停車太太重要了！\n' +
            '第三，大遠百裡的許多角落有很多巧思，在一般人不看重的區域，設 計成舒適感極佳的休憩場所，在這裡閒逛真的很舒壓，時間也溜得特快的，...收 穫肯定是很多的',
          time: 1575140373
        },
        {
          author_name: '陳世冠',
          author_url: 'https://www.google.com/maps/contrib/116498627060021490559/reviews',
          language: 'zh-Hant',
          profile_photo_url: 'https://lh6.ggpht.com/-ICkrPL-DURc/AAAAAAAAAAI/AAAAAAAAAAA/jXwxuan-Gjc/s128-c0x00000000-cc-rp-mo-ba5/photo.jpg',
          rating: 4,
          relative_time_description: '2 個月前',
          text: '新竹大遠百是老字號了!最近得利於新竹火車站前的SOGO收攤而生意蒸蒸日上。聖誕節將進，館內也趁機做起折扣促銷應景。這次去Godiva買巧克力與冰淇淋(剛好碰上買一送一)，荷包又失血。服裝部也在促銷，聖誕節前可以去逛逛，順便享受一下節慶的氣氛。5',
          time: 1575886292
        },
        {
          author_name: '友杰',
          author_url: 'https://www.google.com/maps/contrib/111144893540830041459/reviews',
          language: 'zh-Hant',
          profile_photo_url: 'https://lh3.ggpht.com/-xJhKZf90nI0/AAAAAAAAAAI/AAAAAAAAAAA/OpoON-FmcCk/s128-c0x00000000-cc-rp-mo/photo.jpg',
          rating: 1,
          relative_time_description: '4 週前',
          text: '這裡員工”幾乎”都態度不佳（至少我遇到5個裡面會有4個這樣 ），一問朋友才知聽說是新竹百貨公司獨有的特產：都臭臉。',
          time: 1581127268
        },
        {
          author_name: '洪志銘',
          author_url: 'https://www.google.com/maps/contrib/100561991322914402690/reviews',
          language: 'zh-Hant',
          profile_photo_url: 'https://lh4.ggpht.com/-VwG7LcL22SE/AAAAAAAAAAI/AAAAAAAAAAA/VtX5g3up0wk/s128-c0x00000000-cc-rp-mo-ba4/photo.jpg',
          rating: 4,
          relative_time_description: '1 週前',
          text: '老牌的百貨公司，屹立在市中心，旁邊的公有停車場簡直就是它 的特約停車場，在新興百貨公司的競爭下，疏解了人潮，它反而成了更適合休閒、逛、消費的百貨公司。且臨近古蹟、商圈，走幾步路就可滿足你大部分的需求了！',
          time: 1582553946
        }
      ],
      scope: 'GOOGLE',
      types: [
        'shopping_mall',
        'department_store',
        'point_of_interest',
        'store',
        'establishment'
      ],
      url: 'https://maps.google.com/?cid=9253014163685000842',
      user_ratings_total: 8202,
      utc_offset: 480,
      vicinity: '東區西大路323號',
      website: 'https://www.feds.com.tw/store/42'
    }]
    const periodArray = [
      { name: '', time: new Date('2020-01-22T10:00:00.000Z') },
      { name: '', time: new Date('2020-01-22T13:00:00.000Z') },
      { name: '', time: new Date('2020-01-22T15:00:00.000Z') }
    ]
    const ansArray1 = [ [ false ], [ true ], [ true ] ]
    expect(algorithm.openingMatrix(placelistDetail, periodArray)).toStrictEqual(ansArray1)
    const placelistDetailEmpty = [{
      id: '0a221b73c7f66379f79b5c3c87d9cd9972ff42a1',
      name: '青草湖夜市'
    }]
    const ansArray2 = [ [ true ], [ true ], [ true ] ]
    expect(algorithm.openingMatrix(placelistDetailEmpty, periodArray)).toStrictEqual(ansArray2)
  })
  test('findShortestPath ', () => {
    const allPath1 = [
      { path: [ 0, 4, 3, 2, 1, 5 ], weight: 6181, truecount: 3 },
      { path: [ 0, 1, 4, 3, 2, 5 ], weight: 6290, truecount: 2 },
      { path: [ 0, 2, 4, 3, 1, 5 ], weight: 6296, truecount: 1 },
      { path: [ 0, 1, 2, 4, 3, 5 ], weight: 6361, truecount: 1 },
      { path: [ 0, 2, 3, 4, 1, 5 ], weight: 6375, truecount: 2 },
      { path: [ 0, 3, 4, 2, 1, 5 ], weight: 6464, truecount: 3 },
      { path: [ 0, 2, 1, 4, 3, 5 ], weight: 6480, truecount: 1 },
      { path: [ 0, 4, 3, 1, 2, 5 ], weight: 6538, truecount: 3 },
      { path: [ 0, 1, 2, 3, 4, 5 ], weight: 6589, truecount: 1 },
      { path: [ 0, 3, 4, 1, 2, 5 ], weight: 6617, truecount: 3 },
      { path: [ 0, 1, 3, 4, 2, 5 ], weight: 6693, truecount: 3 },
      { path: [ 0, 2, 1, 3, 4, 5 ], weight: 6828, truecount: 1 },
      { path: [ 0, 3, 2, 4, 1, 5 ], weight: 7082, truecount: 2 },
      { path: [ 0, 4, 2, 3, 1, 5 ], weight: 7286, truecount: 1 },
      { path: [ 0, 1, 4, 2, 3, 5 ], weight: 7344, truecount: 2 },
      { path: [ 0, 4, 1, 2, 3, 5 ], weight: 7388, truecount: 2 },
      { path: [ 0, 1, 3, 2, 4, 5 ], weight: 7409, truecount: 3 },
      { path: [ 0, 3, 2, 1, 4, 5 ], weight: 7415, truecount: 2 },
      { path: [ 0, 4, 1, 3, 2, 5 ], weight: 7437, truecount: 2 },
      { path: [ 0, 2, 4, 1, 3, 5 ], weight: 7501, truecount: 1 },
      { path: [ 0, 3, 1, 4, 2, 5 ], weight: 7521, truecount: 3 },
      { path: [ 0, 2, 3, 1, 4, 5 ], weight: 7530, truecount: 2 },
      { path: [ 0, 3, 1, 2, 4, 5 ], weight: 7537, truecount: 3 },
      { path: [ 0, 4, 2, 1, 3, 5 ], weight: 7590, truecount: 1 }
    ]
    const placeOpeningMatrix = [
                                  [true,false,true,false],
                                  [true,false,true,false],
                                  [true,true,false,false],
                                  [true,true,false,false] ]
    expect(algorithm.findShortestPath(allPath1, placeOpeningMatrix)).toStrictEqual({ path: [ 0, 4, 3, 2, 1, 5 ], weight: 6181, truecount: 3 })
    const allPath2 = []
    expect(algorithm.findShortestPath(allPath2, placeOpeningMatrix)).toBeUndefined()
  })
})
