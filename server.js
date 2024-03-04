
const axios = require('axios');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const express = require('express');
const app = express();

app.use(express.json());
// const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server);


app.post('/api/weather', async (req, res) => {
    const { latitude, longitude } = req.body;
    try {
        const apiKey = '5f4744fd6ed7e30e662f45ae7fd7b8bf'; 
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
        const response = await axios.get(apiUrl);
     
        const weatherData = {
            location: response.data.name,
            temperature: response.data.main.temp,
            conditions: response.data.weather[0].description,
            country:response.data.sys.country,
            main: response.data.weather[0].main,
            icon: response.data.weather[0].icon,
            humidity: response.data.main.humidity,
            speed: response.data.wind.speed,

            visibility: response.data.visibility,
            data: response.data

        };
        res.json(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


io.on('connection', (socket) => {

    const interval = setInterval(async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/weather');
            io.emit('weatherUpdate', response.data);
        } catch (error) {
            console.error('Error fetching weather:', error);
        }
    }, 30000);

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        clearInterval(interval);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
