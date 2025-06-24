<template>
  <div class="weather-data-card">
    <div class="card-header">
      <h3>Dados Meteorológicos Adicionais</h3>
      <div class="date-selector">
        <button @click="prevDay" class="date-nav-btn" :disabled="loading"><span>&lt;</span></button>
        <span class="selected-date">{{ selectedDate }}</span>
        <button @click="nextDay" class="date-nav-btn" :disabled="loading"><span>&gt;</span></button>
      </div>
    </div>
    <div class="card-content">
      <div class="data-tiles">
        <div class="data-tile">
          <div class="tile-icon">...</div>
          <div class="tile-label">Pressão</div>
          <div class="tile-value">{{ data.pressure }} hPa</div>
        </div>
        <div class="data-tile">
          <div class="tile-icon">...</div>
          <div class="tile-label">Vento</div>
          <div class="tile-value">{{ data.windSpeed }} km/h</div>
          <div class="tile-subtitle">{{ data.windDirection }}</div>
        </div>
        <div class="data-tile">
          <div class="tile-icon">...</div>
          <div class="tile-label">Precipitação</div>
          <div class="tile-value">{{ data.precipitation }} mm</div>
        </div>
        <div class="data-tile">
          <div class="tile-icon">...</div>
          <div class="tile-label">Índice UV</div>
          <div class="tile-value">{{ data.uvIndex }}</div>
          <div class="tile-subtitle">{{ getUVStatus(data.uvIndex) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdditionalDataCard',
  props: {
    selectedDate: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      required: true
    }
  },
  methods: {
    getUVStatus(index) {
      if (index <= 2) return 'Baixo';
      if (index <= 5) return 'Moderado';
      if (index <= 7) return 'Elevado';
      if (index <= 10) return 'Muito Elevado';
      return 'Extremo';
    },
    prevDay() {
      this.$emit('prev-day');
    },
    nextDay() {
      this.$emit('next-day');
    }
  }
}
</script>


<style scoped>
.weather-data-card {
  margin: 0 20px 40px;
  width: calc(100% - 40px);
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
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

.date-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-nav-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.date-nav-btn:hover {
  background: #e2e8f0;
}

.date-nav-btn:disabled {
  background: #f1f1f1;
  color: #ccc;
  cursor: not-allowed;
}

.selected-date {
  font-size: 15px;
  color: #64748b;
}

.data-tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.data-tile {
  flex: 1;
  min-width: 200px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: transform 0.2s;
}

.data-tile:hover {
  transform: translateY(-5px);
}

.tile-icon {
  color: #0ea5e9;
  margin-bottom: 10px;
}

.tile-label {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 5px;
}

.tile-value {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.tile-subtitle {
  font-size: 12px;
  color: #94a3b8;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #0ea5e9;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.error-container svg {
  color: #ef4444;
  margin-bottom: 10px;
}

.error-container p {
  color: #64748b;
  margin-bottom: 15px;
}

.retry-button {
  background: #0ea5e9;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #0284c7;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media (min-width: 2000px) {
  .weather-data-card {
    margin: 0 5% 40px;
    width: calc(100% - 10%);
  }
}

@media (min-width: 1440px) and (max-width: 1999px) {
  .weather-data-card {
    margin: 0 4% 40px;
    width: calc(100% - 8%);
  }
}

@media (min-width: 1025px) and (max-width: 1439px) {
  .weather-data-card {
    margin: 0 3% 40px;
    width: calc(100% - 6%);
  }
}

@media (max-width: 1024px) {
  .weather-data-card {
    margin: 0 20px 40px;
    width: calc(100% - 40px);
  }
}
</style>
