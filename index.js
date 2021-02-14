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


app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(p => {
        response.json(p.map(p => p.toJSON()))
    })
        .catch(error => next(error))
})

app.get('/api/info', (request, response, next) => {
    Person.count({}).then(c => {
        const info = `Phonebook has info for ${c}`
        const time = new Date()
        response.setHeader('Content-type', 'text/html')
        response.send(`<div><div> ${info} people</div><div>${time}</div></div>`)
    })
        .catch(error => next(error))

})


app.get('/api/persons/:id', (request, response, next) => {
    const person = Person.findById(request.params.id).then(p => {
        if (p) {
            response.json(p.toJSON())
        }
        else {
            response.status(404).end()

        }
    })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.deleteOne({ _id: request.params.id }).then(pers => {
        if (pers) { response.json(pers).end() } else {
            response.status(404).end()
        }
    }
    ).catch(error => next(error))

})


app.post('/api/persons', (request, response, next) => {
    const newpers = request.body

    if (!newpers.name || !newpers.number) {
        response.status(404).send({ 'error': "missing name or number" })
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
            .catch(error => next(error))

    }
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const pers = {
        name: body.name,
        number: body.number,
        date: new Date()
    }

    Person.findByIdAndUpdate(request.params.id, pers, { new: true })
        .then(newpers => {
            response.json(newpers)
        })
        .catch(error => next(error))
})



const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
