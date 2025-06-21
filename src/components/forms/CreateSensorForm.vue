<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="settings-container">
      <h2 class="text-2xl font-semibold mb-4">Criar Nova Publicação</h2>

      <form @submit.prevent="submitPost">
        <div class="form-group">
          <label for="description">Descrição</label>
          <textarea id="description" v-model="description" rows="4" class="form-control" required></textarea>
        </div>

        <div class="form-group">
          <label for="tags">Tags (separadas por vírgula)</label>
          <input id="tags" type="text" v-model="tagsInput" placeholder="ex: temperatura, alerta" class="form-control" />
        </div>

        <div class="form-group">
          <label for="mediaUrl">URL da Imagem/Vídeo</label>
          <input id="mediaUrl" type="url" v-model="mediaUrl" class="form-control" />
        </div>

        <div class="form-group">
          <label for="mediaType">Tipo de Mídia</label>
          <select id="mediaType" v-model="mediaType">
            <option value="image">Imagem</option>
            <option value="video">Vídeo</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" class="save-btn" :disabled="loading">
            {{ loading ? 'A enviar...' : 'Enviar Publicação' }}
          </button>
          <button type="button" class="cancel-btn" @click="$emit('close')">Cancelar</button>
        </div>

        <p v-if="successMessage" class="text-green-600 mt-2">{{ successMessage }}</p>
        <p v-if="errorMessage" class="text-red-600 mt-2">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>


<script>
import { useUserStore } from '@/stores/userStore';

export default {
  data() {
    return {
      form: {
        type: '',
        location: '',
        status: '',
        update_frequency: ''
      }
    }
  },
  methods: {
    async createSensor() {
      const token = useUserStore().accessToken;
      const res = await fetch('https://hows-the-weather-backend.onrender.com/api/sensors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.form)
      });
      const data = await res.json();
      (data);
      this.$emit('created', data)
    }
  }
}
</script>
<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.settings-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #34495e;
}

.form-control,
select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e0e6ed;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  appearance: none;
}

.form-control:focus,
select:focus {
  outline: none;
  border-color: #41b06e;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.save-btn {
  background-color: #41b06e;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
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
  transition: background-color 0.3s ease;
}

.cancel-btn:hover {
  background-color: #cbd3db;
}
</style>
