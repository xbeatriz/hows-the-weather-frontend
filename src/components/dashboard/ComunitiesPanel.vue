<template>
  <div class="communities-panel">
    <div class="panel-actions">
      <div class="search-bar">
        <input type="text" placeholder="Search communities..." v-model="searchQuery" />
        <i class="fas fa-search"></i>
      </div>
      <!-- Botão que abre modal externo para criar comunidade -->
      <button class="add-btn" @click="showCreateModal = true">
        <i class="fas fa-plus"></i> Add New Community
      </button>
    </div>

    <div class="communities-table">
      <table>
        <thead>
          <tr>
            <th>Community ID</th>
            <th>Location</th>
            <th>Members</th>
            <th>Total Posts</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="community in filteredCommunities" :key="community._id">
            <td>{{ community._id }}</td>
            <td>{{ community.location }}</td>
            <td>{{ community.members_count }}</td>
            <td>{{ community.community_posts?.length || 0 }}</td>
            <td>
              <div class="action-buttons">
                <button class="view-btn" title="View Posts" @click="viewCommunity(community._id)">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="edit-btn" title="Edit" @click="openEditModal(community)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" title="Delete" @click="deleteCommunity(community._id)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredCommunities.length === 0" class="no-results">
        <p>No communities found</p>
      </div>
    </div>

    <div class="community-map">
      <h3>Community Locations</h3>
      <div class="map-placeholder">
        <p>Map with community locations would be displayed here</p>
      </div>
    </div>

    <!-- Modal interno para editar número de membros -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <h3>Edit Members Count</h3>
        <form @submit.prevent="submitEditCommunity">
          <label for="membersCount">Number of Members</label>
          <input id="membersCount" type="number" v-model.number="editedMembersCount" min="0" required />
          <div class="modal-actions">
            <button type="submit" class="save-btn">Save</button>
            <button type="button" class="cancel-btn" @click="closeEditModal">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de visualização da comunidade -->
    <div v-if="viewCommunityModalOpen" class="modal-overlay" @click.self="closeViewCommunityModal">
      <div class="modal-content">
        <h3>Community Details</h3>
        <p><strong>ID:</strong> {{ selectedCommunity._id }}</p>
        <p><strong>Location:</strong> {{ selectedCommunity.location }}</p>
        <p><strong>Members Count:</strong> {{ selectedCommunity.members_count }}</p>
        <p><strong>Total Posts:</strong> {{ selectedCommunity.community_posts?.length || 0 }}</p>

        <h4>Posts</h4>
        <ul>
          <li v-for="post in selectedCommunity.community_posts" :key="post._id">
            <p><strong>Description:</strong> {{ post.description }}</p>
            <p><strong>Tags:</strong> {{ post.tags?.join(', ') }}</p>
            <p><strong>Status:</strong> {{ post.status }}</p>
            <hr />
          </li>
          <li v-if="!selectedCommunity.community_posts || selectedCommunity.community_posts.length === 0">
            No posts available.
          </li>
        </ul>

        <div class="modal-actions">
          <button @click="closeViewCommunityModal" class="cancel-btn">Close</button>
        </div>
      </div>
    </div>

    <!-- Modal externo para criar comunidade -->
    <Modal
      v-if="showCreateModal"
      title="Create New Community"
      @close="showCreateModal = false"
    >
      <CreateCommunityForm
        @submitted="onCommunityCreated"
        @cancel="() => (showCreateModal = false)"
      />
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCommunityStore } from '@/stores/comunityStore'
import { useUserStore } from '@/stores/userStore'
import Modal from '@/components//common/Modal.vue'
import CreateCommunityForm from '@/components/forms/CreateCommunityForm.vue'

const communityStore = useCommunityStore()
const userStore = useUserStore()

const communities = ref([])
const searchQuery = ref('')

const filteredCommunities = computed(() => {
  return communities.value.filter(c =>
    c.location?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const showCreateModal = ref(false)

// Edit modal states
const showEditModal = ref(false)
const editedCommunityId = ref(null)
const editedMembersCount = ref(0)

// View modal states
const selectedCommunity = ref(null)
const viewCommunityModalOpen = ref(false)

userStore.loadFromStorage()

onMounted(async () => {
  await communityStore.fetchAllCommunities(userStore.accessToken)
  communities.value = communityStore.communities || []
})

const viewCommunity = (communityId) => {
  const community = communities.value.find(c => c._id === communityId)
  if (!community) return
  selectedCommunity.value = community
  viewCommunityModalOpen.value = true
}
const closeViewCommunityModal = () => {
  viewCommunityModalOpen.value = false
  selectedCommunity.value = null
}

// Edit modal handlers
const openEditModal = (community) => {
  editedCommunityId.value = community._id
  editedMembersCount.value = community.members_count || 0
  showEditModal.value = true
}
const closeEditModal = () => {
  showEditModal.value = false
  editedCommunityId.value = null
  editedMembersCount.value = 0
}
const submitEditCommunity = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/communities/${editedCommunityId.value}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.accessToken}`,
      },
      body: JSON.stringify({ members_count: editedMembersCount.value }),
    })
    if (!response.ok) throw new Error('Failed to update community')
    alert('Members count updated successfully!')
    showEditModal.value = false
    await communityStore.fetchAllCommunities(userStore.accessToken)
    communities.value = communityStore.communities || []
  } catch (error) {
    alert('Error: ' + error.message)
  }
}

// Delete community
const deleteCommunity = async (id) => {
  if (!confirm('Are you sure you want to delete this community?')) return
  try {
    const response = await fetch(`http://localhost:3000/api/communities/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userStore.accessToken}` },
    })
    if (!response.ok) throw new Error('Failed to delete community')
    communities.value = communities.value.filter(c => c._id !== id)
    alert('Community deleted successfully!')
  } catch (error) {
    alert('Error deleting community: ' + error.message)
  }
}

// Evento para quando o formulário de criação emitir "submitted"
const onCommunityCreated = (newCommunity) => {
  showCreateModal.value = false
  communities.value.push(newCommunity)
}
</script>

<style scoped>
/* Mesmos estilos adaptados do seu código original */
.communities-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
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

.communities-table {
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
  color: #27ae60;
}

.view-btn:hover {
  background-color: #27ae60;
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

.community-map {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.community-map h3 {
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
  background: rgba(0,0,0,0.5);
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
