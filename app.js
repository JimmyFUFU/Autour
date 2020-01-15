const express = require('express')
const app = express()
const PORT = 3000

app.get('/' , (req, res)  => {
  res.send('START!!')
})

app.listen(PORT , ()=>{
  console.log(`App is running on port ${PORT}!`)
})
