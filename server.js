const express = require('express')
const app = express();


app.use(express.static('./dist/angularChart'));

app.get('/*', function (req, res) {
    res.sendFile('index.html', { root: 'dist/angular-chart/' }
    );
});


app.listen(process.env.PORT || 8080);
