<template>
  <div class="users-panel">
    <div class="panel-actions">
      <div class="search-bar">
        <input type="text" placeholder="Search users..." v-model="searchQuery" />
        <i class="fas fa-search"></i>
      </div>
      <button class="add-btn" @click="openCreateModal">
        <i class="fas fa-plus"></i> Add New User
      </button>
    </div>

    <div class="users-table">
      <table>
        <thead>
          <tr>
            <th>#ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user._id || user.id">
            <td>{{ user.id || user._id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="{ 'admin-role': user.role === 'Admin' }">
                {{ user.role }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="info-btn" @click="viewUser(user)" title="View Info">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="edit-btn" @click="editUser(user)" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" @click="deleteUser(user)" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredUsers.length === 0" class="no-results">
        <p>No users found</p>
      </div>
    </div>

    <div class="pagination">
      <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
      <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
    <!-- Modal View User Info -->
    <div v-if="showInfoModal" class="modal-overlay" @click.self="showInfoModal = false">
      <div class="modal-content">
        <h3>Detalhes do Usuário</h3>
        <p><strong>Nome:</strong> {{ selectedUser?.name }}</p>
        <p><strong>Email:</strong> {{ selectedUser?.email }}</p>
        <p><strong>Localização:</strong> {{ selectedUser?.location }}</p>
        <p><strong>Tipo:</strong> {{ selectedUser?.role }}</p>
        <p><strong>ID:</strong> {{ selectedUser?.id || selectedUser?._id }}</p>

        <div class="modal-actions">
          <button class="cancel-btn" @click="showInfoModal = false">Fechar</button>
        </div>
      </div>
    </div>

    <!-- Modal Edit User -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ isCreating ? 'Add New User' : 'Edit User' }}</h3>
        <form @submit.prevent="submitUserForm">
          <label>
            Name:
            <input type="text" v-model="editForm.name" required />
          </label>

          <label>
            Email:
            <input type="email" v-model="editForm.email" required />
          </label>

          <label>
            Localização:
            <select v-model="editForm.location" required>
              <option value="" disabled>Selecione sua localização</option>
              <option value="Lisboa">Lisboa</option>
              <option value="Porto">Porto</option>
              <option value="Coimbra">Coimbra</option>
              <option value="Faro">Faro</option>
              <option value="Braga">Braga</option>
            </select>
          </label>

          <label>
            Role:
            <select v-model="editForm.role" required>
              <option value="" disabled>Selecione tipo</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <div class="modal-actions">
            <button type="submit" class="save-btn">{{ isCreating ? 'Create' : 'Save' }}</button>
            <button type="button" class="cancel-btn" @click="closeModal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

// Dados e estado
const users = ref([]) // a lista de users será carregada aqui
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const showEditModal = ref(false)
const isCreating = ref(false)
const showInfoModal = ref(false)
const selectedUser = ref(null)
const editForm = ref({
  id: '',
  name: '',
  email: '',
  location: '', // NOVO campo
  role: 'Normal',
})

function viewUser(user) {
  selectedUser.value = user
  showInfoModal.value = true
}
// Carregar dados (simples, substitua pelo fetch real se tiver API)
async function fetchUsers() {
  try {
    // Aqui, idealmente, chama API para buscar users
    // Exemplo:
    const res = await fetch('https://hows-the-weather-backend.onrender.com//api/user', {
      headers: {
        Authorization: `Bearer ${userStore.accessToken}`
      }
    })
    if (!res.ok) throw new Error('Failed to fetch users')
    const data = await res.json()
    users.value = data.data.users || []
  } catch (error) {
    alert('Erro ao carregar usuários: ' + error.message)
  }
}
fetchUsers()

// Computeds para filtro e paginação
const filteredUsers = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.role.toLowerCase().includes(q)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / itemsPerPage)))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredUsers.value.slice(start, start + itemsPerPage)
})
console.log(filteredUsers.value)
// Resetar página ao alterar pesquisa para evitar página inválida
watch(searchQuery, () => {
  currentPage.value = 1
})

// Métodos
function openCreateModal() {
  isCreating.value = true
  editForm.value = {
    id: '',
    name: '',
    email: '',
    location: '',
    role: 'Normal',
  }
  showEditModal.value = true
}

function editUser(user) {
  isCreating.value = false
  editForm.value = {
    id: user.id || user._id,
    name: user.name,
    email: user.email,
    location: user.location || '', // tenta preencher
    role: user.role,
  }
  showEditModal.value = true
}

function closeModal() {
  showEditModal.value = false
}

async function submitUserForm() {
  try {
    const url = isCreating.value
      ? 'https://hows-the-weather-backend.onrender.com//api/user/register' // endpoint para criar novo user
      : `https://hows-the-weather-backend.onrender.com//api/user/${editForm.value.id}` // para editar

    const method = isCreating.value ? 'POST' : 'PATCH'

    const bodyData = {
      name: editForm.value.name,
      email: editForm.value.email,
      location: editForm.value.location,  // NOVO campo enviado
      role: editForm.value.role,
    }

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.accessToken}`
      },
      body: JSON.stringify(bodyData)
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'Erro desconhecido')
    }

    if (isCreating.value) {
      // Atualiza a lista com o novo user criado
      const createdUser = await res.json()
      users.value.push(createdUser)
      alert('Usuário criado com sucesso!')
    } else {
      // Atualiza localmente o usuário editado
      const index = users.value.findIndex(u => (u.id || u._id) === editForm.value.id)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...bodyData }
      }
      alert('Usuário atualizado com sucesso!')
    }

    closeModal()
  } catch (error) {
    alert('Erro: ' + error.message)
  }
}

async function deleteUser(user) {
  if (!confirm('Tem certeza que deseja apagar este usuário?')) return

  try {
    const res = await fetch(`https://hows-the-weather-backend.onrender.com//api/user/${user.id || user._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${userStore.accessToken}`
      }
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'Erro desconhecido')
    }

    users.value = users.value.filter(u => (u.id || u._id) !== (user.id || user._id))
    alert('Usuário apagado com sucesso!')
  } catch (error) {
    alert('Erro ao apagar usuário: ' + error.message)
  }
}
</script>

<style scoped>
.users-panel {
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

.users-table {
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

.role-badge,
.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
}

.role-badge {
  background-color: #e0e6ed;
  color: #7f8c8d;
}

.admin-role {
  background-color: #3498db;
  color: white;
}

.status-badge {
  background-color: #e0e6ed;
  color: #7f8c8d;
}

.status-active {
  background-color: #41B06E;
  color: white;
}

.status-inactive {
  background-color: #e74c3c;
  color: white;
}

.action-buttons {
  display: flex;
  gap: 5px;
}

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

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.page-btn {
  width: 35px;
  height: 35px;
  border-radius: 4px;
  background-color: #fff;
  border: 1px solid #e0e6ed;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #7f8c8d;
}

/* Modal styles */
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

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px 30px;
  width: 320px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-bottom: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.modal-content label {
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
  color: #34495e;
}

.modal-content input,
.modal-content select {
  width: 100%;
  padding: 8px 10px;
  margin-top: 5px;
  border: 1px solid #e0e6ed;
  border-radius: 6px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.save-btn {
  background-color: #41B06E;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn:hover {
  background-color: #309659;
}

.cancel-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn:hover {
  background-color: #c0392b;
}

.info-btn {
  background-color: #f8f9fa;
  color: #2c3e50;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-btn:hover {
  background-color: #d9dc2f;
  color: white;
}
</style>
