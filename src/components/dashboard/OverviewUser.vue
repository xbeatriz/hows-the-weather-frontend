<template>
  <div class="overview-user p-4 max-w-3xl mx-auto font-sans">
    <h2 class="text-2xl font-bold mb-4">Previsão para {{ currentWeather.location }}</h2>
    <p class="mb-6 text-gray-600">{{ currentDate }}</p>

    <div class="cards-container">
      <CurrentWeatherCard :weather="currentWeather" />
      <ForecastCard :daily-forecast="dailyTemperature" :weekly-forecast="weeklyTemperature" />
      <AirQualityCard :air-quality-data="airQuality" :air-pollutants-data="airPollutants" />
      <HumidityCard :humidity="currentWeather.humidity" />
      <AdditionalDataCard :data="additionalData" />
    </div>
  </div>
</template>

<script>
import CurrentWeatherCard from '@/components/weather/CurrentWeatherCard.vue';
import ForecastCard from '@/components/weather/ForecastCard.vue';
import HumidityCard from '@/components/weather/HumidityCard.vue';
import AirQualityCard from '@/components/weather/AirQualityCard.vue';
import AdditionalDataCard from '@/components/weather/AdditionalDataCard.vue';

export default {
  name: 'OverviewUser',
  components: {
    CurrentWeatherCard,
    ForecastCard,
    HumidityCard,
    AirQualityCard,
    AdditionalDataCard,
  },
  data() {
    return {
      selectedDate: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      currentDate: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      currentWeather: {
        temperature: 23,
        condition: 'sunny',
        location: 'Lisboa',
        humidity: 65,
      },
      dailyTemperature: [
        { time: '6AM', temp: 18 }, { time: '9AM', temp: 20 },
        { time: '12PM', temp: 23 }, { time: '3PM', temp: 25 },
        { time: '6PM', temp: 22 }, { time: '9PM', temp: 19 },
      ],
      weeklyTemperature: [
        { day: 'Mon', icon: '☀️', high: 25, low: 18 },
        { day: 'Tue', icon: '⛅', high: 24, low: 17 },
        { day: 'Wed', icon: '☁️', high: 22, low: 16 },
        { day: 'Thu', icon: '🌧️', high: 20, low: 15 },
        { day: 'Fri', icon: '🌧️', high: 21, low: 16 },
        { day: 'Sat', icon: '⛅', high: 23, low: 17 },
        { day: 'Sun', icon: '☀️', high: 26, low: 19 },
      ],
      airQuality: { value: 45, status: 'Good', color: '#41B06E' },
      airPollutants: [
        { name: 'PM2.5', value: 12, unit: 'μg/m³', status: 'Good' },
        { name: 'PM10', value: 24, unit: 'μg/m³', status: 'Good' },
        { name: 'O₃', value: 85, unit: 'μg/m³', status: 'Moderate' },
        { name: 'NO₂', value: 15, unit: 'μg/m³', status: 'Good' },
      ],
      additionalData: {
        pressure: 1012,
        windSpeed: 12,
        windDirection: 'NE',
        precipitation: 0,
        uvIndex: 5,
      },
    };
  },
  methods: {
    prevDay() {
      console.log('Dia anterior');
      // Atualiza selectedDate conforme necessidade
    },
    nextDay() {
      console.log('Próximo dia');
      // Atualiza selectedDate conforme necessidade
    },
  },
};
</script>
<style scoped>
.cards-container {
  display: flex;
  flex-wrap: wrap;       /* Permite quebra de linha em telas menores */
  gap: 20px;             /* Espaçamento entre cards */
  justify-content: center; /* Centraliza horizontalmente (opcional) */
}

/* Opcional: definir tamanho máximo para os cards para controlar layout */
.cards-container > * {
  flex: 1 1 250px;       /* Crescem e encolhem, largura base 250px */
  min-width: 250px;      /* Largura mínima para cada card */
}
</style>