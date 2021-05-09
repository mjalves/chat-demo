
const { Socket } = require('dgram');
const express = require('express');
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http)
const mongoose = require('mongoose')

app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({extended: false}))

const dbUrl = 'mongodb+srv://jaque_user:Hum23456@cluster0.uv9ni.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

const Message = mongoose.model('Message', {
    name: String,
    message: String
})

// endPoint messages
app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages)
    })
})

app.get('/messages/:user', (req, res) => {
    const user = req.params.user
    Message.find({name: user}, (err, messages) => {
        res.send(messages)
    })
})

// endPoint messages
app.post('/messages', async (req, res) => {

    try {

        const message = new Message(req.body)

        const savedMessage = await message.save()
    
        console.log('saved') 

        const censored = await Message.findOne({message: 'badword'}) 
    
        if(censored) 
            await Message.deleteOne({_id: censored.id})
        else
            io.emit('message', req.body)

        res.sendStatus(200)

    } catch (error) {
        res.sendStatus(500)
        return console.error(error)   
    }finally {
        console.log('msg')
    }
})

io.on('connection', (Socket) => {
    console.log('a user connected')
})

mongoose.connect(dbUrl, { useNewUrlParser: true,useUnifiedTopology: true }, (err) => {
    { useUnifiedTopology: true } ;
    console.log('mongo db connection', err)
})

var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
})