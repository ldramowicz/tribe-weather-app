import {useState} from 'react';
import 'antd/dist/antd.css';
import './App.css';
import moment from "moment";
import {Alert, Button, Card, Form, Image, Input, InputNumber, Row, Spin} from 'antd';

function App() {

    //https://api.weatherbit.io/v2.0/forecast/daily?city=Raleigh,NC&days=1&key=4bae5c53d5fc4e6fb5e2cbae219959b3
    //https://www.weatherbit.io/api/weather-forecast-16-day

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // init number of forecast days to 5
    const [numOfDays, setNumOfDays] = useState(5);
    const [currentCity, setCurrentCity] = useState();
    const [cityToDisplay, setCityToDisplay] = useState("");
    const [numOfDaysToDisplay, setNumOfDaysToDisplay] = useState(0)
    const [forecast, setForecast] = useState();

    const MAX_FORECAST_DAYS = 10;
    const API_KEY = '4bae5c53d5fc4e6fb5e2cbae219959b3';

    const [form] = Form.useForm();

    const animalPics = {
        clear: 'https://www.wallpaperup.com/uploads/wallpapers/2015/10/11/818129/3a6e45bb774e0cc934f1986b828012a7.jpg',
        cloudy: 'https://thumbs.dreamstime.com/b/close-up-beautiful-face-scottish-kitten-lying-clouds-close-up-beautiful-muzzle-milk-colored-scottish-217368947.jpg',
        overcast: 'https://www.wallpaperflare.com/static/328/506/326/puppy-waiting-sky-collar-wallpaper.jpg',
        rain: 'https://www.bestcat.com/assets/images/bestcat/Umbrella_Cats.jpg',
        snow: 'https://static.stacker.com/s3fs-public/styles/sar_screen_maximum_large/s3/2019-12/00006276.png',
        thunderstorm: 'https://s3.amazonaws.com/images.hamlethub.com/hh20mediafolder/1042/201506/thunderstorms---dogs.jpg',
        other: 'https://www.petmd.com/sites/default/files/dog-cat-window-shutterstock_105936335.jpg'
    }

    const getForecastData = async() => {
        try {
            const response = await fetch(`https://api.weatherbit.io/v2.0/forecast/daily?city=${currentCity}&days=${numOfDays}&key=${API_KEY}`);
            if (!response.ok || response.status === 204) {
                throw new Error(
                    `HTTP error occurred. Current response status is [${response.status}: ${response.statusText}]`
                );
            }
            return await response.json();
        } catch(err) {
            setError(err.message);
            setForecast(null);
        } finally {
            setLoading(false);
        }
    }

    const handleInputChange = (value) => {
        setError(null);
        setNumOfDays(value);
    };

    const handleCityChange = (e) => {
        setError(null);
        setCurrentCity(e.target.value)
    }

    const handleSubmit = () => {
        setError(null);
        // show loading icon
        setLoading(true);
        getForecastData()
            .then(forecastData => {
                // store forecast data
                setForecast(forecastData.data);
                // store city name and country code to display in title
                setCityToDisplay(forecastData.city_name + ' (' + forecastData.country_code + ')');
                setNumOfDaysToDisplay(numOfDays);
                setError(null);
            });
    }

    const formatDate = (date) => {
        // format date to MON, TUE, WED etc.
        return moment(date).format("ddd");
    }

    const showAnimalPic = (code) => {
        // destructure animalPics object
        const {clear, cloudy, overcast, rain, snow, thunderstorm, other}  = animalPics;
        let currentWeatherType;

        // switch based on the first character of the weather code (i.e. c01d)
        switch(code.charAt(0)) {
            case "c": {
                // there is a number of cloud types starting with "c" so we need to make more distinctions
                // for the weather types available
                if (code === "c01d") {
                    currentWeatherType = clear;
                } else if (code === "c04d") {
                    currentWeatherType = overcast;
                }
                else {
                    currentWeatherType = cloudy;
                }
                break;
                }
            case "r": {
                currentWeatherType = rain;
                break;
            }
            case "s": {
                currentWeatherType = snow;
                break;
            }
            case "t": {
                currentWeatherType = thunderstorm;
                break;
            }
            default: {
                // catch all other types not handled above
                currentWeatherType = other;
            }
        }
        return  currentWeatherType;
    }

  return (
    <div className="App">
        <Row justify="center">
            <div>
                <Form layout='inline' form={form} onFinish={handleSubmit}>

                    {/* input city name */}
                    <Form.Item label="City:"
                               name="city"
                               rules={[{ required: true }]}>
                        <Input onChange={handleCityChange} placeholder="i.e. Montreal, CA" />
                    </Form.Item>

                    {/* input number of days to forecast */}
                    <Form.Item label="Number of forecast days:">
                        <InputNumber
                            min={1}
                            max={MAX_FORECAST_DAYS}
                            value={numOfDays}
                            onChange={handleInputChange}
                        />
                    </Form.Item>

                    {/* submit */}
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Row>

        {/* show spinner if loading data */}
        {loading && <div><Spin /></div>}

        {/* show API fetching errors, if any */}
        {error && (
            <Alert message={error} type="error" showIcon />
        )}

        {/* show weather cards if data is available */}
        {forecast &&
            <>
                <Row justify="center">
                    <div className="title">{numOfDaysToDisplay} day weather forecast for {cityToDisplay}</div>
                </Row>
                <Row justify="center">
                    <div className="forecast-cards">

                            {/* map through all the data available for X number of days (numOfDaysToDisplay) */}
                            {forecast.slice(0,numOfDaysToDisplay).map(({valid_date, max_temp, min_temp, weather}, index) =>

                                <Card key={index} title={formatDate(valid_date)} hoverable>
                                    <Image
                                        width={118}
                                        height={75}
                                        // src of the picture depends on the weather type code
                                        // which we're getting from "weather.icon" property
                                        src={showAnimalPic(weather.icon)}
                                    />

                                    {/*
                                        uncomment lines below to see more forecast data in each card
                                    */}

                                    {/*<div className="description">{weather.description}</div>
                                    <div className="description">{weather.icon}</div>*/}

                                    {/*show min/max temp */}
                                    <div className="maxTemp">{max_temp}&deg;C</div>
                                    <div className="minTemp">{min_temp}&deg;C</div>
                                </Card>
                            )}
                    </div>
                </Row>
            </>
        }
    </div>
  );
}

export default App;
