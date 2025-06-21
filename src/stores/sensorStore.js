// src/stores/sensorStore.js
import { defineStore } from 'pinia';

export const useSensorStore = defineStore('sensorStore', {
  state: () => ({
    sensors: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchSensors() {
      this.loading = true;
      this.error = null;

      try {
        const res = await fetch('https://hows-the-weather-backend.onrender.com/api/sensors', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Erro ${res.status}: ${errText}`);
        }

        const data = await res.json();
        this.sensors = data.data.sensors;
        console.log('Sensors fetched:', this.sensors);
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    clearSensors() {
      this.sensors = [];
      this.error = null;
      this.loading = false;
    }
  }
});
