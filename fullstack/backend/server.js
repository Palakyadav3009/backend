import express from 'express'

const app = express();


app.get('/', (req, res) => {
    res.send('Hello World!')
  })

// get a list of 5 jokes
app.get('/api/jokes', (req, res) => {
        const jokes=[
            {
                id:1,
                title:'a joke',
                content :'this is a joke'
            },
            {
                id:2,
                title:'a joke',
                content :'this 2 is a joke'
            },
            {
                id:3,
                title:'a joke',
                content :'this 3 is a joke'
            },
            {
                id:4,
                title:'a joke',
                content :'this 4 is a joke'
            },

        ];
        res.send(jokes);           //in broweser it is called an api
  })
  
const port  =process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


//server ready