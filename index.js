const express = require('express')
const app = express()

app.use(express.json())

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
    response.json(persons)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


app.get('/info', (request, response) => {
    const info = `Phonebook has info for ${persons.length}`
    const time = new Date()
    response.setHeader('Content-type', 'text/html')
    response.send(`<div><div> ${info} people</div><div>${time}</div></div>`)
})


app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(pers => pers.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(pers => pers.id === id)
    if (person) {
        response.json({ 'deleted': { ...person } })
        persons = persons.filter((p) => p.id !== id)
    } else {
        response.status(404).end()
    }
})


app.post('/api/persons', (request, response) => {
    console.log('body', request.body)
    const newpers = request.body
    if (!newpers.name || !newpers.number) {
        response.status(404).send({ 'error': "missing name or number" })
    }
    else if (persons.find(pers => pers.name.toLowerCase() === newpers.name.toLowerCase())) {
        response.status(404).send({ 'error': "person already existing" })
    }
    else {
        const id = Math.ceil(Math.random() * 100000)
        persons = persons.concat({ ...newpers, id })
        response.json({ 'added': { ...newpers } })

    }
})