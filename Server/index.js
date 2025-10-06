const express = require('express')
const {connect} = require('mongoose')
require("dotenv").config()
const cors = require('cors')
const upload = require('express-fileupload')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const routes = require('./routes/routes')
const { server, app } = require('./socket/socket')

// const app = express()

app.use(express.urlencoded({extended:true}))
app.use(express.json({extended:true}))
app.use(cors({origin:["http://localhost:3001/","http://localhost:5173/","https://chatapp-frontend4510.netlify.app/"]}))
app.use(upload())


app.use('/api', routes);

app.use(notFound)
app.use(errorHandler)

connect(process.env.MONGO_URL).then(server.listen(process.env.PORT, () => console.log(`Server is started on port ${process.env.PORT}`))).catch(err => console.log(err))

