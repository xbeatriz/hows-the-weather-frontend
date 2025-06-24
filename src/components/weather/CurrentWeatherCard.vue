<template>
  <div class="weather-card current-weather-card">
    <div class="card-header">
      <h3>Clima Atual</h3>
      <span class="location-badge">{{ weather.location || 'A carregar...' }}</span>
    </div>

    <div class="card-content">
      <div class="weather-icon-large" :class="weather.condition">
        <svg v-if="weather.condition === 'sunny'" xmlns="http://www.w3.org/2000/svg" width="64" height="64"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg v-else-if="weather.condition === 'cloudy'" xmlns="http://www.w3.org/2000/svg" width="64" height="64"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
        </svg>
        <svg v-else-if="weather.condition === 'rainy'" xmlns="http://www.w3.org/2000/svg" width="64" height="64"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <line x1="16" y1="13" x2="16" y2="21"></line>
          <line x1="8" y1="13" x2="8" y2="21"></line>
          <line x1="12" y1="15" x2="12" y2="23"></line>
          <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="m17.66 17.66 1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="m6.34 17.66-1.41 1.41"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
          <path d="M10 6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4Z"></path>
          <path d="M12 10v4"></path>
        </svg>
      </div>

      <div class="temperature-display">
        <span class="temperature-value">{{ weather.temperature }}°</span>
        <span class="temperature-unit">Cº</span>
      </div>

      <div class="weather-status">{{ getWeatherStatus(weather.condition) }}</div>

      <div class="date-display">{{ formattedDate }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CurrentWeatherCard',
  props: {
    weather: {
      type: Object,
      required: true,
      default: () => ({ location: 'Unknown', temperature: 0, condition: 'default' })
    }
  },
  computed: {
    formattedDate() {
      return new Date().toLocaleDateString('pt-PT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  methods: {
    getWeatherStatus(condition) {
      const statuses = {
        sunny: 'Céu limpo',
        cloudy: 'Nublado',
        rainy: 'Chuva',
        default: 'Parcialmente nublado'
      };
      return statuses[condition] || statuses.default;
    }
  }

}
</script>


<style scoped>
.weather-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.current-weather-card {
  flex: 1;
  min-width: 300px;
  height: auto;
  min-height: 400px;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  font-size: 18px;
  color: #1e293b;
  font-weight: 600;
  margin: 0;
}

.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.location-badge {
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  color: #64748b;
}

.weather-icon-large {
  margin: 20px 0;
  color: #0ea5e9;
}

.weather-icon-large.sunny {
  color: #fbbf24;
}

.weather-icon-large.cloudy {
  color: #94a3b8;
}

.weather-icon-large.rainy {
  color: #60a5fa;
}

.temperature-display {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}

.temperature-value {
  font-size: 64px;
  font-weight: 700;
  line-height: 1;
  color: #1e293b;
}

.temperature-unit {
  font-size: 24px;
  margin-top: 10px;
  color: #64748b;
}

.weather-status {
  font-size: 20px;
  color: #64748b;
  margin-bottom: 10px;
}

.date-display {
  font-size: 14px;
  color: #94a3b8;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 40px 0;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0ea5e9;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  padding: 20px;
  text-align: center;
}

.error-container svg {
  margin-bottom: 16px;
}

.retry-button {
  margin-top: 16px;
  background-color: #0ea5e9;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #0284c7;
}
</style>
