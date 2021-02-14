const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(express.static('build'))
app.use(cors())
morgan.token('body', function (req, res) {
    if (req.method === "POST") {
        return JSON.stringify(req.body)
    }
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

app.get('/api/persons', (request, response) => {
    Person.find({}).then(p => {
        response.json(p.map(p => p.toJSON()))
    })
})

app.get('/api/info', (request, response) => {
    //as i needed to get the count before sendind the response i had to make the promise sinchronous, there is a better way?
    async function loadcount() {
        let conto = undefined
        try {
            conto = await Person.count({}, function (err, count) {
            })
        }
        catch (error) {
            console.error('oops, something went wrong!', error);
        }
        const info = `Phonebook has info for ${conto}`
        const time = new Date()
        response.setHeader('Content-type', 'text/html')
        response.send(`<div><div> ${info} people</div><div>${time}</div></div>`)
    }
    loadcount()
})


app.get('/api/persons/:id', (request, response) => {
    const person = Person.findById(request.params.id).then(p => {
        if (p) {
            response.json(p.toJSON())
        }
        else {
            response.status(404).end()

        }
    })
})

app.delete('/api/persons/:id', (request, response) => {
    Person.deleteOne({_id: request.params.id}).then(pers => {
        if (pers) { response.json(pers).end() } else {
            response.status(404).end()
        }
    }
    ).catch(error => {
        console.log(error)
        response.status(500).end()
    })
})


app.post('/api/persons', (request, response) => {
    const newpers = request.body

    if (!newpers.name || !newpers.number) {
        response.status(404).send({ 'error': "missing name or number" })
    }

    else if (persons.find(pers => pers.name.toLowerCase() === newpers.name.toLowerCase())) {
        response.status(404).send({ 'error': "person already existing" })
    }

    else {
        const pers = new Person({
            name: newpers.name,
            number: newpers.number,
            date: new Date(),
        })
        pers.save().then(saved => {
            response.json(saved.toJSON())
        })
    }
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
