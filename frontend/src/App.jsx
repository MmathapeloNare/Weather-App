import { useEffect, useState } from 'react';
import './App.css';
import { getWeatherData } from './api';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import WeeklyForecast from './components/WeeklyForecast';
import { parse, format } from 'date-fns';

const getGradientClass = (hour) => {
  if (hour >= 6 && hour < 9) return 'bg-sunrise';
  if (hour >= 9 && hour < 17) return 'bg-day';
  if (hour >= 17 && hour < 20) return 'bg-sunset';
  return 'bg-night';
};

function App() {
  const [city, setCity] = useState("Johannesburg");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const localTime = weatherData?.location?.localtime
    ? parse(weatherData.location.localtime, 'yyyy-MM-dd H:mm', new Date())
    : new Date();

  const hour = localTime.getHours();
  const gradientClass = getGradientClass(hour);

  const dateText = weatherData ? format(localTime, 'EEEE, d MMMM') : '';

  useEffect(() => {
    if (!city.trim()) return; // ignore empty searches

    const fetchWeather = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getWeatherData(city);

        if (!data?.forecast?.forecastday?.length) {
          throw new Error("City not found");
        }

        const { mintemp_c, maxtemp_c } = data.forecast.forecastday[0].day;

        setWeatherData({
          current: { ...data.current, mintemp_c, maxtemp_c },
          hourly: data.forecast.forecastday[0].hour,
          weekly: data.forecast.forecastday.slice(1),
          location: data.location,
        });
      } catch (e) {
        setWeatherData(null);
        setError("Error: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]);

  return (
    <div className={`app ${gradientClass}`}>
      <div className="container">
        <SearchBar onSearch={setCity} />
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {weatherData && (
          <>
            <p className="date">{dateText}</p>
            <CurrentWeather
              data={weatherData.current}
              location={weatherData.location}
            />
            <HourlyForecast data={weatherData.hourly} />
            <WeeklyForecast data={weatherData.weekly} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;