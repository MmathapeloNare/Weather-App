export const getWeatherData = async (city) => {
const res = await fetch(
    `http://localhost:5000/api/weather?city=${encodeURIComponent(city)}`
);
if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
}
return res.json();
};