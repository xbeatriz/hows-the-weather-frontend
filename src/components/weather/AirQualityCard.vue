<template>
  <div class="metric-card air-quality-card">
    <div class="card-header">
      <h3>Air Quality</h3>
      <div class="metric-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 2v2"></path>
          <path d="M16 2v2"></path>
          <path d="M8 20v2"></path>
          <path d="M16 20v2"></path>
          <path d="M2 8h2"></path>
          <path d="M2 16h2"></path>
          <path d="M20 8h2"></path>
          <path d="M20 16h2"></path>
          <path d="M9 4v4a2 2 0 0 1-2 2H3"></path>
          <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
          <path d="M12 11v2"></path>
          <path d="M12 15.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z"></path>
        </svg>
      </div>
    </div>
    <div class="card-content">
      <div class="air-quality-meter">
        <div class="meter-labels">
          <span>Good</span>
          <span>Moderate</span>
          <span>Unhealthy</span>
        </div>
        <div class="meter-bar">
          <div class="meter-fill" :style="{ width: `${airQualityPercentage}%`, backgroundColor: airQualityData.color }">
          </div>
          <div class="meter-marker" :style="{ left: `${airQualityPercentage}%` }"></div>
        </div>
      </div>
      <div class="air-quality-details">
        <div class="aqi-value">AQI: <strong>{{ airQualityData.value }}</strong></div>
        <div class="aqi-status" :style="{ color: airQualityData.color }">{{ airQualityData.status }}</div>
      </div>
      <div class="pollutants-table">
        <table>
          <thead>
            <tr>
              <th>Pollutant</th>
              <th>Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(pollutant, index) in airPollutantsData" :key="'pollutant-' + index">
              <td>{{ pollutant.name }}</td>
              <td>{{ pollutant.value }} {{ pollutant.unit }}</td>
              <td :class="'status-' + pollutant.status.toLowerCase()">{{ pollutant.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AirQualityCard',
  props: {
    airQualityData: {
      type: Object,
      required: true
    },
    airPollutantsData: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    airQualityPercentage() {
      const maxAqi = 300;
      return Math.min(this.airQualityData.value / maxAqi * 100, 100);
    }
  }
}
</script>


<style scoped>
.metric-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 300px;
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

.metric-icon {
  color: #0ea5e9;
}

.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.air-quality-meter {
  margin: 20px 0;
}

.meter-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.meter-labels span {
  font-size: 14px;
  color: #64748b;
}

.meter-bar {
  position: relative;
  height: 10px;
  background-color: #f1f5f9;
  border-radius: 5px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  background-color: #41B06E;
  border-radius: 5px;
  transition: width 1s ease-in-out;
}

.meter-marker {
  position: absolute;
  width: 2px;
  height: 16px;
  top: -3px;
  background-color: #1e293b;
}

.air-quality-details {
  display: flex;
  justify-content: space-between;
  margin: 15px 0;
}

.aqi-value {
  font-size: 16px;
  color: #1e293b;
}

.aqi-status {
  font-weight: 600;
}

/* Pollutants Table */
.pollutants-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.pollutants-table th {
  text-align: left;
  padding: 10px 5px;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
}

.pollutants-table td {
  padding: 8px 5px;
  border-bottom: 1px solid #f8fafc;
}

.status-good {
  color: #41B06E;
}

.status-moderate {
  color: #f59e0b;
}

.status-poor {
  color: #ef4444;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #64748b;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0ea5e9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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

/* Error State */
.error-state {
  text-align: center;
  padding: 30px 0;
  color: #ef4444;
}

.retry-button {
  background-color: #0ea5e9;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 12px;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #0284c7;
}

/* Additional statuses for air quality */
.status-unhealthy {
  color: #ef4444;
}

.status-very-unhealthy {
  color: #9333ea;
}

.status-hazardous {
  color: #7f1d1d;
}

@media (max-width: 1024px) {
  .metric-card {
    min-width: 100%;
  }
}
</style>
