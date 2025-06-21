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

import { useSensorStore } from '@/stores/sensorStore';
import { useUserStore } from '@/stores/userStore';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

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
        temperature: null,
        condition: 'Desconhecido',
        location: '',
        humidity: null,
      },
      dailyTemperature: [],
      weeklyTemperature: [],
      airQuality: { value: 0, status: 'Desconhecido', color: '#aaa' },
      airPollutants: [],
      additionalData: {
        pressure: 1012,
        windSpeed: 12,
        windDirection: 'NE',
        precipitation: 0,
        uvIndex: 5,
      },
    };
  },
  async mounted() {
    const sensorStore = useSensorStore();
    const userStore = useUserStore();
    const { sensors } = storeToRefs(sensorStore);
    const user = userStore.user;

    this.currentWeather.location = user.location || 'Desconhecido';

    sensorStore.fetchSensors().then(() => {
      const localSensors = sensors.value.filter(sensor => sensor.location === user.location);

      let temperatureReadings = [];
      let humidityReadings = [];
      let gasReadings = [];

      localSensors.forEach(sensor => {
        const readings = sensor.readings || [];
        if (readings.length === 0) return;

        const values = readings.map(r => ({
          timestamp: new Date(r.timestamp),
          value: r.values[sensor.type],
        }));

        if (sensor.type === 'temperature') {
          temperatureReadings = [...temperatureReadings, ...values];
        } else if (sensor.type === 'humidity') {
          humidityReadings = [...humidityReadings, ...values];
        } else if (sensor.type === 'gas') {
          gasReadings = [...gasReadings, ...values];
        }
      });

      // Atualiza currentWeather com última leitura
      if (temperatureReadings.length > 0) {
        const latest = temperatureReadings.at(-1);
        this.currentWeather.temperature = latest.value;
      }
      if (humidityReadings.length > 0) {
        const latest = humidityReadings.at(-1);
        this.currentWeather.humidity = latest.value;
      }

      // Mock diário com as primeiras 6 leituras de temperatura
      this.dailyTemperature = temperatureReadings
        .slice(0, 6)
        .filter(r => typeof r.value === 'number')
        .map(r => ({
          time: this.formatTime(r.timestamp),
          temp: r.value,
        }));

      // Mock semanal (usamos valores agrupados)
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      this.weeklyTemperature = days.map((day, i) => {
        const tempValues = temperatureReadings.slice(i * 3, i * 3 + 3).map(r => r.value);
        return {
          day,
          icon: '☀️', // ou decidir por lógica
          high: Math.max(...tempValues, 0),
          low: Math.min(...tempValues, 0),
        };
      });

      // Air Quality e poluentes (simplificado)
      if (gasReadings.length > 0) {
        const gas = gasReadings.at(-1).value;
        this.airQuality.value = gas;
        if (gas <= 400) {
          this.airQuality.status = 'Good';
          this.airQuality.color = '#41B06E';
        } else if (gas <= 600) {
          this.airQuality.status = 'Moderate';
          this.airQuality.color = '#E1C542';
        } else {
          this.airQuality.status = 'Poor';
          this.airQuality.color = '#FF4C4C';
        }


        this.airPollutants = [
          {
            name: 'Gas',
            value: gas,
            unit: 'ppm',
            status: this.airQuality.status,
          },
          {
            name: 'PM2.5',
            value: Math.round((gas - 200) / 3), // mapeia 200–800 → ~0–200 µg/m³
            unit: 'μg/m³',
            status: this.airQuality.status,
          },
        ];
      }
    });
  },
  methods: {
    formatTime(timestamp) {
    if (!(timestamp instanceof Date)) {
      timestamp = new Date(timestamp);
      if (isNaN(timestamp)) return 'Invalid date';
    }
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  },
    prevDay() {
      console.log('Dia anterior');
    },
    nextDay() {
      console.log('Próximo dia');
    },
  },
};
</script>

<style scoped>
.cards-container {
  display: flex;
  flex-wrap: wrap;
  /* Permite quebra de linha em telas menores */
  gap: 20px;
  /* Espaçamento entre cards */
  justify-content: center;
  /* Centraliza horizontalmente (opcional) */
}

/* Opcional: definir tamanho máximo para os cards para controlar layout */
.cards-container>* {
  flex: 1 1 250px;
  /* Crescem e encolhem, largura base 250px */
  min-width: 250px;
  /* Largura mínima para cada card */
}
</style>