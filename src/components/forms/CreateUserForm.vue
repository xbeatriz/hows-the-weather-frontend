<template>
  <div class="settings-container">
    <h2>Criar Utilizador</h2>
    <form @submit.prevent="createUser">
      <div class="form-group">
        <label>Nome</label>
        <input type="text" v-model="form.name" required />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" v-model="form.email" required />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" v-model="form.password" required />
      </div>
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
        <label>Tipo</label>
        <select v-model="form.role" required>
          <option value="" disabled>Selecione tipo</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit" class="save-btn">Criar</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        location: '',
        role: "user"
      }
    }
  },
  methods: {
    async createUser() {
      const res = await fetch('https://hows-the-weather-backend.onrender.com//api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

input,
select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e0e6ed;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
}

button.save-btn {
  background-color: #41b06e;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

button.save-btn:hover {
  background-color: #309659;
}
</style>
