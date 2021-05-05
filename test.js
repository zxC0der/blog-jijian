const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

app.post('/login', (req, res) => {
	console.log(req.body)
	res.json(req.body);
})

app.listen(3000, () => {
	console.log('http://127.0.0.1:3000');
})