<template>
  <div class="settings-container">
    <h2>Criar Post</h2>
    <form @submit.prevent="createPost">
      <!-- Se quiseres, podes mostrar o communityId -->
      <p><strong>Comunidade:</strong> {{ communityId }}</p>

      <div class="form-group">
        <label>Descrição</label>
        <textarea v-model="form.description" rows="3" required></textarea>
      </div>

      <div class="form-group">
        <label>Tags (separadas por vírgula)</label>
        <input type="text" v-model="tagsInput" placeholder="ex: sensor,alerta,gas" />
      </div>

      <div class="form-group">
        <label>Sensor</label>
        <select v-model="form.sensor_id" required>
          <option value="" disabled>Selecione um sensor</option>
          <option v-for="sensor in sensors" :key="sensor._id" :value="sensor._id">
            {{ sensor.type }} - {{ sensor.location }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Tipo de Media</label>
        <select v-model="form.media[0].type" required>
          <option disabled value="">Selecione o tipo</option>
          <option value="text">Texto</option>
          <option value="image">Imagem (URL)</option>
          <option value="video">Vídeo (URL)</option>
        </select>
      </div>

      <div class="form-group">
        <label>Conteúdo da Media</label>
        <input type="text" v-model="form.media[0].url" :placeholder="mediaPlaceholder" required />
      </div>


      <button type="submit" class="save-btn">Criar</button>
    </form>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore';
import { useSensorStore } from '@/stores/sensorStore';
import { computed } from 'vue'
export default {
  props: {
    communityId: String,
    communityLocation: String,
    userId: String,
  }
  ,
  data() {
    return {
      form: {
        user_id: this.userId || '',
        sensor_id: '',
        description: '',
        media: [
          {
            type: '',
            url: ''
          }
        ],
        timestamp: new Date().toISOString(),
        tags: [],
        status: ''
      },
      tagsInput: '',
      sensors: []
    }
  },
  watch: {
    tagsInput(newVal) {
      this.form.tags = newVal.split(',').map(t => t.trim()).filter(t => t.length > 0)
    }
  },
  async mounted() {
    await this.fetchSensors();
  },
  methods: {
    async fetchSensors() {
      const userStore = useUserStore();
      const sensorStore = useSensorStore();

      try {
        const token = userStore.accessToken;

        await sensorStore.fetchSensors(token);


        this.sensors = sensorStore.sensors.filter(sensor =>
          sensor.location === this.communityLocation
        );

      } catch (err) {
        console.error('❌ Erro ao buscar sensores:', err);
      }
    },
    async createPost() {
      const token = useUserStore().accessToken;
      this.form.timestamp = new Date().toISOString();
      try {
        const res = await fetch(`http://localhost:3000/api/communities/${this.communityId}/posts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.form)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro ao criar o post');

        alert('Post criado com sucesso!');
        this.$emit('submitted', data);

        // Reset form
        tthis.form = {
          user_id: this.userId || '',
          sensor_id: '',
          description: '',
          media: [
            {
              type: '',
              url: ''
            }
          ],
          timestamp: new Date().toISOString(),
          tags: [],
          status: ''
        };
        this.tagsInput = '';
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    },
  },
  computed: {
    mediaPlaceholder() {
      switch (this.form.media[0].type) {
        case 'image':
          return 'URL de imagem (ex: https://...)';
        case 'video':
          return 'URL de vídeo (ex: https://...)';
        case 'text':
          return 'Texto da media';
        default:
          return 'Introduza o conteúdo da media';
      }
    }
  },
}
</script>



<style scoped>
/* Mantém o estilo que enviaste antes */
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

input[type="text"],
textarea,
select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e0e6ed;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
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
