const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('User list')
})

router.get('/new', (req, res) => {
    res.render('users/new')
})

router.post('/', (req, res) => {
    console.log(req.body.username)
    const isValid = false
    if (isValid) {
        users.push({ firstName: req.body.username })
        res.redirect(`/users/${users.length - 1}`)
    } else {
        console.log("err")
        res.render('users/new', { firstName: req.body.username })
    }
    res.send(
        "Hi"
    )
})

router.route("/:id")
.get((req, res) => {
    console.log(req.user)
    res.send(`User get ${req.params.id}`)
})
.put((req, res) => {
    res.send(`User update ${req.params.id}`)
})
.delete((req, res) => {
    res.send(`User delete ${req.params.id}`)
})

router.param("id", (req, res, next, id) => {
    
    next()
})

const users = [{ firstName: "Kyle" }, { firstName: "Sally" }, { firstName: "Jim" }]

module.exports = router