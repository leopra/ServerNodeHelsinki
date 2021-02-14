const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}


const password = process.argv[2]


const url =
    `mongodb+srv://fullstack:${password}@cluster0.cvrn5.mongodb.net/fullstackmongo?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
    date: Date,
    id: Number
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    Person.find({}).then(result => {
        result.map(p => console.log(p.name, p.number))
        mongoose.connection.close()
    })
}
else {
    const name = process.argv[3]
    const number = process.argv[4]

    const person = new Person({
        name: name,
        date: new Date(),
        number: number,
    })

    person.save().then(result => {
        console.log('person saved!')
        mongoose.connection.close()
    })
}