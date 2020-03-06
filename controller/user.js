const moment = require('moment')
const mysql = require('../func/mysql.js')
const crypto = require('crypto')
// crypto MD5 Hex
function md5 (text) {
  return crypto.createHash('md5').update(text).digest('hex')
};

const profile = async function(req,res){
  if (!req.headers.authorization) {
    res.status(403).send({ error: 'Wrong Request: Authorization is required.' })
  }else{
    //先找使用者
    const sqlConnection = await mysql.connection()
    const userdetail = await mysql.selectDataWithCond(sqlConnection, '*' , 'user' , {access_token : req.token} )
    if (!Object.keys(userdetail).length) {
      res.status(403).send( { error: 'Invalid Access Token' })
    }else{
      const time = moment().valueOf()
      const expiredtime = userdetail[0].access_expired
      if ( !moment(expiredtime).isBefore(time) ) {
        let userTour = await mysql.selectDataWithCond(sqlConnection, 'id , tourtitle' , 'tour' , { userid : userdetail[0].id })
        userTour = JSON.stringify(userTour)
        userTour = JSON.parse(userTour)
        const profileObj = {
          user :{
            id : userdetail[0].id,
            name :　userdetail[0].name,
            email : userdetail[0].email,
            picture : userdetail[0].picture
          },
          tour : userTour
        }
        res.status(200).send(profileObj)
      }else {
        res.status(403).send({ error: 'The token is expired , Please log in again' })
      }
    }
    sqlConnection.release()
  }
}

const login = async function (req,res){
  const sqlConnection = await mysql.connection()
  switch (req.body.provider) {
    case 'native':
      if ( !req.body.email.length || !req.body.password.length) {
        res.status(400).send({error : 'Email and password are required'})
      } else {
        let userDetails = await mysql.selectDataWithCond(sqlConnection, '*', 'user', {email : req.body.email , password : req.body.password , provider : req.body.provider })
        if ( !Object.keys(userDetails).length ) {
          console.log('User Not found')
          res.status(400).send({ error: 'Please check your Email or Password' })
        } else {
          // Give a new access_token and new access_expired once the user Signin
          const time = moment().valueOf()
          // produce a new access_token by email + time
          const token = md5(`${req.body.email}` + `${time}`)
          // get the time One hour later as new access_expired
          const expiredtime = moment(time).add(6, 'h').format('YYYY-MM-DD HH:mm:ss')
          await mysql.updateDataWithCond(sqlConnection, 'user', {provider : req.body.provider , access_token : token , access_expired : expiredtime }, { email : req.body.email , provider : req.body.provider } )
          console.log('NEW Log In !! UPDATE provider and token and expired successfully ~ ')
          const signInOutputUser = {
            data : {
              access_token: token,
              access_expired: expiredtime,
              user : {
                id : userDetails[0].id ,
                provider : userDetails[0].provider,
                name :userDetails[0].name ,
                email : userDetails[0].email,
                picture :userDetails[0].picture
              }
            }
          }
          res.send(signInOutputUser)
          console.log('User is found')
        }
      }
      break;
    case 'facebook':
      if ( !req.body.access_token ) {
        res.status(400).send({error : 'Request Error: Access token is required.'})
      } else {
      // if FB access_token exists  // get information from Facebook API
      request(`https://graph.facebook.com/v5.0/me?fields=email%2Cname%2Cpicture&access_token=${req.body.access_token}`, async (error, response, body) => {
        if (error) console.log(error)
        let userdata = JSON.parse(body)
        try {
          if (!userdata.error) {
            const time = moment().valueOf()
            // produce access_token by email + time
            const token = md5(`${userdata.email}` + `${time}`)
            // get the time One hour later as access_expired
            const expiredtime = moment(time).add(6, 'h').format('YYYY-MM-DD HH:mm:ss')

            const fbLogInPost = {
              provider: req.body.provider,
              name: userdata.name,
              email: userdata.email,
              picture : userdata.picture.data.url,
              access_token: token,
              access_expired: expiredtime,
              three_rd_id: userdata.id,
              three_rd_access_token: req.body.access_token
            }
             // 如果FB的ID有重複 就更新使用者資料
            const fbLogInUpdate = `name = VALUES(name),email = VALUES(email),picture = VALUES(picture),access_token = VALUES(access_token),access_expired = VALUES(access_expired),three_rd_access_token = VALUES(three_rd_access_token)`
            await mysql.insertDataSetUpdate(sqlConnection, 'user', fbLogInPost, fbLogInUpdate)
            console.log('FB Log In ! Insert into user successfully ! Ready to select ID from user')
            const userdataFromMysql = await mysql.selectDataWithCond(sqlConnection, '*', 'user', { three_rd_id : userdata.id , provider : req.body.provider})
            const outputUser = {
              data : {
                access_token : `${userdataFromMysql[0].access_token}` ,
                access_expired : `${userdataFromMysql[0].access_expired}` ,
                user : {
                  id : userdataFromMysql[0].id,
                  provider: userdataFromMysql[0].provider,
                  name:  userdataFromMysql[0].name,
                  email: userdataFromMysql[0].email,
                  picture : userdataFromMysql[0].picture
                }
              }
            }
            res.status(200).send(outputUser)
          }else{
            console.log('FB login Error : ' , userdata.error.message);
            res.status(400).send({ error: 'Wrong Request' })
          }
        }catch (e) {
          console.log(e.name, ':', e.message);
          res.status(400).send({ error: 'Wrong Request' })
        }
      })
    }
      break;
    case 'google':
      if ( !req.body.access_token ) {
        res.status(400).send({error : 'Request Error: Access token is required.'})
      } else {
      request(`https://oauth2.googleapis.com/tokeninfo?id_token=${req.body.access_token}` , async (error , response , body) => {
        if (error) console.log(error)
        let userdata = JSON.parse(body)
        try {
          if (!userdata.error) {
            const time = moment().valueOf()
            // produce access_token by email + time Now
            const token = md5(`${userdata.email}` + `${time}`)

            // get the time One hour later as access_expired
            const expiredtime = moment(time).add(6, 'h').format('YYYY-MM-DD HH:mm:ss')
            const googlePost = {
              provider: req.body.provider,
              name: userdata.name,
              email: userdata.email,
              picture : userdata.picture,
              access_token: token,
              access_expired: expiredtime,
              three_rd_access_token: req.body.access_token,
              three_rd_id : req.body.google_Id
            }
             // 如果 Google 的 ID 有重複 就更新使用者資料
            const googleUpdate = `name = VALUES(name),email = VALUES(email),picture = VALUES(picture),access_token = VALUES(access_token),access_expired = VALUES(access_expired),three_rd_access_token = VALUES(three_rd_access_token)`
            await mysql.insertDataSetUpdate(sqlConnection, 'user', googlePost, googleUpdate)
            console.log('Google Log In ! Insert into user successfully ! Ready to select ID from user')
            const userdataFromMysql = await mysql.selectDataWithCond(sqlConnection, '*', 'user', {email : userdata.email , provider : req.body.provider } )
            const outputUser = {
              data : {
                access_token : `${userdataFromMysql[0].access_token}` ,
                access_expired : `${userdataFromMysql[0].access_expired}` ,
                user : {
                  id : userdataFromMysql[0].id,
                  provider: userdataFromMysql[0].provider,
                  name:  userdataFromMysql[0].name,
                  email: userdataFromMysql[0].email,
                  picture : userdataFromMysql[0].picture
                }
              }
            }
            res.status(200).send(outputUser)
          }else {
            console.log('Google login Error : ' , userdata.error.message);
            res.status(400).send({ error: 'Wrong Request' })
          }
        }catch (e) {
          console.log(e.name, ':', e.message);
          res.status(400).send({ error: 'Wrong Request' })
        }
      })
    }
      break;
    default:
      res.status(400).send({ error: 'Wrong Request' })
  }
  sqlConnection.release()
}

const signup = async function (req,res){
  const sqlConnection = await mysql.connection()
  try {
    if (!req.body.name.length || !req.body.password.length || !req.body.email.length) {
      res.status(400).send({error:'Name, Email and Password are required.'})
    } else {
      await sqlConnection.query("START TRANSACTION")
      // check Email exists or not
      const checkEmail = await mysql.selectDataWithCond(sqlConnection, 'email', 'user', {email : req.body.email} )

      if (!Object.keys(checkEmail).length) {
        // console.log('The email is valid , Ready to insert into database')
        const time = moment().valueOf()
        // produce access_token by email + time
        const token = md5(`${req.body.email}` + `${time}`)
        // get the time One hour later as access_expired
        const expiredtime = moment(time).add(6, 'h').format('YYYY-MM-DD HH:mm:ss')

        const insertUserPost = {
          provider: 'native',
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          access_token: token,
          access_expired: expiredtime
        }
        await mysql.insertDataSet(sqlConnection, 'user', insertUserPost)
        // console.log('Insert into user successfully ! Ready to select ID from user')
        const theNewUser = await mysql.selectDataWithCond(sqlConnection, '*', 'user', {email : req.body.email })
        const outputUser = {
          data : {
            access_token: theNewUser[0].access_token,
            access_expired: theNewUser[0].access_expired,
            user : {
              id : theNewUser[0].id ,
              provider : theNewUser[0].provider,
              name :theNewUser[0].name ,
              email : theNewUser[0].email,
              picture :theNewUser[0].picture
            }
          }
        }
        await sqlConnection.query("COMMIT")
        res.send(outputUser)
      } else {
        console.log('error : Email Already Exists')
        res.status(400).send({error : 'Email Already Exists'})
      }
    }
  } catch (e) {
    await sqlConnection.query("ROLLBACK");
    console.log(e.name, ':', e.message);
    res.status(400).send({error : 'Something error'})
  } finally {
    await sqlConnection.release()
  }
}

module.exports = {
  profile,
  login,
  signup
}
