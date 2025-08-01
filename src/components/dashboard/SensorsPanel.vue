<template>
  <div class="sensors-panel">
    <div class="panel-actions">
      <div class="search-bar">
        <input type="text" placeholder="Pesquisar sensores..." v-model="searchQuery" />
        <i class="fas fa-search"></i>
      </div>
      <!-- Botão que abre modal externo para criar sensor -->
      <button class="add-btn" @click="showCreateSensor = true">
        <i class="fas fa-plus"></i> Adicionar Novo Sensor
      </button>
    </div>

    <div class="sensors-table">
      <table>
        <thead>
          <tr>
            <th>ID do Sensor</th>
            <th>Localização</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Última Atualização</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sensor in filteredSensors" :key="sensor._id">
            <td>{{ sensor._id }}</td>
            <td>{{ sensor.location }}</td>
            <td>{{ sensor.type }}</td>
            <td>
              <span class="status-badge" :class="{
                'status-online': sensor.status === 'Online',
                'status-offline': sensor.status === 'Offline',
              }">
                {{ sensor.status === 'Online' ? 'Online' : 'Offline' }}
              </span>
            </td>
            <td>{{ sensor.last_reading?.timestamp ? new Date(sensor.last_reading.timestamp).toLocaleString() : 'N/D' }}</td>
            <td>
              <div class="action-buttons">
                <button class="view-btn" title="Ver Dados" @click="selectSensor(sensor._id)">
                  <i class="fas fa-chart-line"></i>
                </button>
                <!-- Botão que abre modal interno para editar -->
                <button class="edit-btn" title="Editar" @click="openModal(sensor)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" title="Eliminar" @click="deleteSensor(sensor._id)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredSensors.length === 0" class="no-results">
        <p>Nenhum sensor encontrado</p>
      </div>
    </div>

    <div class="sensor-map">
      <h3>Localizações dos Sensores</h3>
      <div class="map-placeholder">
        <p>O mapa com as localizações dos sensores será exibido aqui</p>
      </div>
    </div>

    <!-- Modal interno para edição -->
    <div v-if="modalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ modalSensor._id ? 'Editar Sensor' : 'Adicionar Novo Sensor' }}</h3>
        <form @submit.prevent="submitSensor">
          <label>
            ID do Sensor:
            <input type="text" v-model="modalSensor._id" :readonly="!!modalSensor._id" required />
          </label>

          <label>
            Localização:
            <select v-model="modalSensor.location" required>
              <option value="" disabled>Selecione a localização</option>
              <option value="Lisboa">Lisboa</option>
              <option value="Porto">Porto</option>
              <option value="Coimbra">Coimbra</option>
              <option value="Faro">Faro</option>
              <option value="Braga">Braga</option>
            </select>
          </label>

          <label>
            Tipo:
            <select v-model="modalSensor.type" required>
              <option value="" disabled>Selecione o tipo</option>
              <option value="temperature">Temperatura</option>
              <option value="humidity">Humidade</option>
              <option value="gas">Gás</option>
            </select>
          </label>

          <label>
            Estado:
            <select v-model="modalSensor.status" required>
              <option value="Online">Ativo</option>
              <option value="Offline">Inativo</option>
            </select>
          </label>

          <label>
            Frequência de Atualização:
            <select v-model="modalSensor.update_frequency" required>
              <option value="" disabled>Selecione a frequência</option>
              <option value="minutes">Minutos</option>
              <option value="hours">Horas</option>
              <option value="daily">Diário</option>
            </select>
          </label>

          <div class="modal-actions">
            <button type="submit" class="save-btn">{{ modalSensor._id ? 'Atualizar' : 'Criar' }}</button>
            <button type="button" class="cancel-btn" @click="closeModal">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal externo para criação -->
    <Modal v-if="showCreateSensor" title="Criar Novo Sensor" @close="showCreateSensor = false">
      <CreateSensorForm @submitted="onFormSubmitted" @cancel="() => (showCreateSensor = false)" />
    </Modal>

    <!-- Modal para visualizar dados do sensor -->
    <div v-if="viewModalOpen" class="modal-overlay" @click.self="closeViewModal">
      <div class="modal-content" style="width: 500px; max-width: 95%;">
        <div class="last-reading">
          <h3>Última Leitura</h3>
          <table>
            <thead>
              <tr>
                <th v-for="key in lastReadingKeys" :key="key">{{ key }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td v-for="key in lastReadingKeys" :key="key">{{ sensorData.last_reading[key] ?? 'N/D' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="readings-list">
          <h3>Últimas 10 Leituras</h3>
          <table>
            <thead>
              <tr>
                <th v-for="key in readingKeys" :key="key">{{ key }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(reading, index) in limitedReadings" :key="index">
                <td v-for="key in readingKeys" :key="key">{{ reading[key] ?? 'N/D' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="cancel-btn" @click="closeViewModal">Fechar</button>
      </div>
    </div>
  </div>
</template>

<script>
import Modal from '@/components/common/Modal.vue';
import CreateSensorForm from '@/components/forms/CreateSensorForm.vue';
import { useUserStore } from '@/stores/userStore';

export default {
  name: 'SensorsPanel',
  components: { Modal, CreateSensorForm },
  props: {
    data: {
      type: Object,
      default: () => ({ sensors: [] }),
    },
  },
  data() {
    return {
      searchQuery: '',
      modalOpen: false,
      showCreateSensor: false,
      modalSensor: {
        _id: '',
        location: '',
        type: '',
        status: '',
        update_frequency: '',
      },
      sensorData: {},
      viewModalOpen: false,
      userStore: useUserStore(),
    };
  },
  computed: {
    filteredSensors() {
      if (!this.data.sensors) return [];
      const searchLower = this.searchQuery.toLowerCase();
      return this.data.sensors.filter((sensor) => {
        return (
          String(sensor._id).toLowerCase().includes(searchLower) ||
          String(sensor.location).toLowerCase().includes(searchLower) ||
          String(sensor.type).toLowerCase().includes(searchLower)
        );
      });
    },
    limitedReadings() {
      if (!this.sensorData.readings) return [];
      return this.sensorData.readings.slice(-10);
    },
    readingKeys() {
      if (!this.limitedReadings.length) return [];
      return Object.keys(this.limitedReadings[0]);
    },
    lastReadingKeys() {
      if (!this.sensorData.last_reading) return [];
      return Object.keys(this.sensorData.last_reading);
    },
  },
  methods: {
    selectSensor(sensorId) {
      const sensor = this.data.sensors.find((s) => s._id === sensorId);
      if (!sensor) {
        alert('Sensor não encontrado.');
        return;
      }
      this.sensorData = sensor;
      this.viewModalOpen = true;
    },
    closeViewModal() {
      this.viewModalOpen = false;
    },
    openModal(sensor = null) {
      if (sensor) {
        this.modalSensor = { ...sensor };
      } else {
        this.modalSensor = {
          _id: '',
          location: '',
          type: '',
          status: 'Online',
          update_frequency: '',
        };
      }
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
    },
    async submitSensor() {
      const token = this.userStore.accessToken;
      const sensorId = this.modalSensor._id;
      try {
        let response;
        if (sensorId && this.data.sensors.find((s) => s._id === sensorId)) {
          // PATCH (Atualizar)
          response = await fetch(`https://hows-the-weather-backend.onrender.com/api/sensors/${sensorId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              location: this.modalSensor.location,
              type: this.modalSensor.type,
              status: this.modalSensor.status,
              update_frequency: this.modalSensor.update_frequency,
            }),
          });
        } else {
          // POST (Criar)
          response = await fetch(`https://hows-the-weather-backend.onrender.com/api/sensors`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              _id: this.modalSensor._id,
              location: this.modalSensor.location,
              type: this.modalSensor.type,
              status: this.modalSensor.status,
              update_frequency: this.modalSensor.update_frequency,
            }),
          });
        }

        if (response.ok) {
          const updatedSensor = await response.json();
          if (sensorId && this.data.sensors.find((s) => s._id === sensorId)) {
            const index = this.data.sensors.findIndex((s) => s._id === sensorId);
            if (index !== -1) {
              this.$set(this.data.sensors, index, updatedSensor);
            }
          } else {
            this.data.sensors.push(updatedSensor);
          }
          alert('Sensor guardado com sucesso!');
          this.closeModal();
        } else {
          const error = await response.json();
          alert('Erro: ' + (error.message || 'Falha ao guardar o sensor.'));
        }
      } catch (err) {
        alert('Erro: ' + err.message);
      }
    },
    async deleteSensor(sensorId) {
      if (confirm('Tem a certeza que deseja eliminar este sensor?')) {
        try {
          const response = await fetch(`https://hows-the-weather-backend.onrender.com/api/sensors/${sensorId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.userStore.accessToken}`,
            },
          });
          if (response.ok) {
            alert('Sensor eliminado com sucesso!');
            this.data.sensors = this.data.sensors.filter((s) => s._id !== sensorId);
          } else {
            alert('Falha ao eliminar o sensor.');
          }
        } catch (error) {
          alert('Erro ao eliminar o sensor: ' + error.message);
        }
      }
    },
    onFormSubmitted(newSensor) {
      this.showCreateSensor = false;
      this.data.sensors.push(newSensor);
      alert('Sensor criado com sucesso!');
    },
  },
};
</script>

<style scoped>
.sensors-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  /* Make sure panel uses full width */
}

.panel-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.search-bar {
  position: relative;
  width: 300px;
}

.search-bar input {
  width: 100%;
  padding: 10px 15px 10px 35px;
  border: 1px solid #e0e6ed;
  border-radius: 6px;
  font-size: 14px;
}

.search-bar i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
}

.add-btn {
  background-color: #41B06E;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: #309659;
}

.sensors-table {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

thead th {
  background-color: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
  padding: 15px;
}

tbody td {
  padding: 15px;
  border-top: 1px solid #e0e6ed;
  color: #2c3e50;
  font-size: 14px;
}

.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
}

.status-online {
  background-color: #41B06E;
  color: white;
}

.status-offline {
  background-color: #e74c3c;
  color: white;
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.view-btn,
.edit-btn,
.delete-btn {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.view-btn {
  background-color: #f8f9fa;
  color: #f1c40f;
}

.view-btn:hover {
  background-color: #f1c40f;
  color: white;
}

.edit-btn {
  background-color: #f8f9fa;
  color: #3498db;
}

.edit-btn:hover {
  background-color: #3498db;
  color: white;
}

.delete-btn {
  background-color: #f8f9fa;
  color: #e74c3c;
}

.delete-btn:hover {
  background-color: #e74c3c;
  color: white;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
}

.sensor-map {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.sensor-map h3 {
  font-size: 16px;
  color: #2c3e50;
  margin: 0 0 15px 0;
}

.map-placeholder {
  height: 300px;
  background-color: #f8f9fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
  font-style: italic;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px 30px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.modal-content h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.modal-content form label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 14px;
  color: #34495e;
}

.modal-content form input,
.modal-content form select {
  width: 100%;
  padding: 8px 10px;
  margin-top: 5px;
  margin-bottom: 15px;
  border: 1px solid #e0e6ed;
  border-radius: 6px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save-btn {
  background-color: #41b06e;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn:hover {
  background-color: #309659;
}

.cancel-btn {
  background-color: #e0e6ed;
  color: #7f8c8d;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn:hover {
  background-color: #cbd3db;
}
</style>
