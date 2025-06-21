<template>
  <div class="weather-card forecast-card">
    <div class="card-header">
      <h3>{{ dynamicTitle }}</h3>
      <div class="view-toggle">
        <button :class="{ active: activeView === 'daily' }" @click="activeView = 'daily'">Daily</button>
        <button :class="{ active: activeView === 'weekly' }" @click="activeView = 'weekly'">Weekly</button>
      </div>
    </div>
    <div class="card-content">
      <!-- Daily View -->
      <div v-if="activeView === 'daily'" class="forecast-daily">
        <div class="time-labels">
          <div v-for="(hour, index) in dailyForecast" :key="'time-' + index" class="time-label">
            {{ hour.time }}
          </div>
        </div>
        <div class="chart-container">
          <svg class="line-chart" viewBox="0 0 600 200">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.4" />
                <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path :d="getTempAreaPath(dailyForecast)" fill="url(#gradient)" />
            <path :d="getTempLinePath(dailyForecast)" fill="none" stroke="#0ea5e9" stroke-width="3" />
            <g v-for="(point, index) in getTempPoints(dailyForecast)" :key="'point-' + index">
              <circle :cx="point.x" :cy="point.y" r="5" fill="#fff" stroke="#0ea5e9" stroke-width="2" />
              <text :x="point.x" :y="point.y - 10" text-anchor="middle" font-size="12" fill="#334155">
                {{ dailyForecast[index].temp }}°
              </text>
            </g>
          </svg>
        </div>
      </div>

      <!-- Weekly View -->
      <div v-else class="forecast-weekly">
        <table class="forecast-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Condition</th>
              <th>High</th>
              <th>Low</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(day, index) in weeklyForecast" :key="'day-' + index">
              <td>{{ day.day }}</td>
              <td class="condition-cell">{{ day.icon }}</td>
              <td class="high-cell">{{ day.high }}°C</td>
              <td class="low-cell">{{ day.low }}°C</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: 'ForecastCard',
  props: {
    dailyForecast: {
      type: Array,
      default: () => []
    },
    weeklyForecast: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeView: 'daily', // daily | weekly
    };
  },
  methods: {
    getTempLinePath(data) {
      const width = 600;
      const height = 200;
      const xStep = width / Math.max(data.length - 1, 1);
      return data.reduce((path, point, i) => {
        if (!point || typeof point.temp !== 'number') return path;
        const x = i * xStep;
        const y = height - (point.temp * 5);
        return path + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
      }, '');
    },
    getTempAreaPath(data) {
      const width = 600;
      const height = 200;
      const xStep = width / Math.max(data.length - 1, 1);
      let path = `M 0 ${height}`;
      data.forEach((point, i) => {
        if (!point || typeof point.temp !== 'number') return;
        const x = i * xStep;
        const y = height - (point.temp * 5);
        path += ` L ${x} ${y}`;
      });
      path += ` L ${width} ${height} Z`;
      return path;
    },
    getTempPoints(data) {
      const width = 600;
      const height = 200;
      const xStep = width / Math.max(data.length - 1, 1);
      return data
        .map((point, i) => {
          if (!point || typeof point.temp !== 'number') return null;
          return {
            x: i * xStep,
            y: height - (point.temp * 5)
          };
        })
        .filter(Boolean); // remove nulls
    }
  },
  computed: {
    dynamicTitle() {
      return this.activeView === 'daily' ? 'Temperaturas diárias' : 'Previsão semanal';
    }
  }
};

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

.forecast-card {
  flex: 2;
  min-width: 500px;
  height: auto;
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
}

.view-toggle {
  display: flex;
  background: #f1f5f9;
  border-radius: 20px;
  padding: 3px;
}

.view-toggle button {
  background: none;
  border: none;
  padding: 5px 15px;
  cursor: pointer;
  color: #64748b;
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.2s;
}

.view-toggle button.active {
  background-color: #0ea5e9;
  color: white;
}

.chart-container {
  height: 200px;
  margin-top: 20px;
  overflow: hidden;
}

.time-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.time-label {
  font-size: 14px;
  color: #64748b;
  flex: 1;
  text-align: center;
}

/* Forecast Table */
.forecast-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.forecast-table th {
  text-align: left;
  font-weight: 600;
  color: #64748b;
  padding: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.forecast-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #f8fafc;
}

.forecast-table .condition-cell {
  font-size: 20px;
}

.forecast-table .high-cell {
  color: #ef4444;
  font-weight: 600;
}

.forecast-table .low-cell {
  color: #3b82f6;
  font-weight: 600;
}

/* Loading and Error States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #64748b;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-left-color: #0ea5e9;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.error-message {
  text-align: center;
  color: #ef4444;
  padding: 30px;
}

.retry-button {
  background-color: #0ea5e9;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .forecast-card {
    min-width: 100%;
  }
}
</style>
