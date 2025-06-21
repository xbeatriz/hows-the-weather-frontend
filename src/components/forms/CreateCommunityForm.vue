<template>
  <div class="settings-container">
    <h2>Criar Comunidade</h2>
    <form @submit.prevent="createCommunity">
      <div class="form-group">
        <label>Localização</label>
        <select id="location" v-model="form.location" required>
          <option value="" disabled>Selecione sua localização</option>
          <option value="Lisboa">Lisboa</option>
          <option value="Porto">Porto</option>
          <option value="Coimbra">Coimbra</option>
          <option value="Faro">Faro</option>
          <option value="Braga">Braga</option>
        </select>
      </div>
      <div class="form-group">
        <label>Número de Membros</label>
        <input type="number" v-model.number="form.members_count" required />
      </div>
      <button type="submit" class="save-btn">Criar</button>
    </form>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore';

export default {
  data() {
    return {
      form: {
        location: '',
        members_count: 0
      }
    }
  },
  methods: {
    async createCommunity() {
      const token = useUserStore().accessToken;
      const res = await fetch('https://hows-the-weather-backend.onrender.com/api/communities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.form)
      });
      const data = await res.json();
      console.log(data);
      this.$emit('created', data)
    }
  }
}
</script>

<style scoped>
.settings-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0,0,0,0.1);
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

input[type="text"],
input[type="number"] {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e0e6ed;
  border-radius: 6px;
  font-size: 14px;
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
</style>
