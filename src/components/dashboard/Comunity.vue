<template>
  <div class="community-container max-w-4xl mx-auto p-6">
    <h2 class="text-4xl font-extrabold text-slate-900 mb-6">
      Comunidade: {{ community?.location || '---' }}
    </h2>

    <div v-if="!props.community" class="text-center text-gray-400 italic mb-6">
      Nenhuma comunidade selecionada.
    </div>
    <button @click="openModal" class="create-post-button">
      Criar publicação
    </button>



    <!-- Lista de Publicações -->
    <div v-if="loading" class="text-center text-gray-500 py-10">A carregar publicações...</div>
    <div v-else-if="error" class="text-center text-red-600 font-semibold py-10">{{ error }}</div>
    <div v-else>
      <div v-if="approvedPosts.length > 0" class="space-y-6">
        <div v-for="post in approvedPosts" :key="post._id"
          class="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition">
          <!-- Header: User and Sensor -->
          <div class="flex justify-between items-center mb-3">
            <p class="text-gray-900 font-semibold text-base">
              👤 {{ userNames.get(post.user_id) || 'A carregar...' }}
            </p>
            <p class="text-gray-600 text-sm">
              🔧 Sensor: <span class="font-medium">{{ post.sensor_id || '---' }}</span>
            </p>
          </div>

          <!-- Description -->
          <p class="text-gray-800 text-md mb-3 leading-relaxed">
            📝 {{ post.description }}
          </p>

          <!-- Media -->
          <div v-if="post.media?.length" class="mb-3">
            <div class="text-gray-700 text-sm mb-1 font-medium">📎 Media:</div>
            <div v-if="post.media[0]?.type === 'image'">
              <img :src="post.media[0].url" alt="Imagem do post" class="w-full max-w-md rounded shadow" />
            </div>
            <div v-else-if="post.media[0]?.type === 'video'">
              <video :src="post.media[0].url" controls class="w-full max-w-md rounded shadow"></video>
            </div>
            <div v-else>
              <a :href="post.media[0]?.url" target="_blank" class="text-blue-600 underline">Ver media</a>
            </div>
          </div>

          <!-- Metadata -->
          <div class="flex flex-wrap text-sm text-gray-600 gap-4 border-t border-gray-100 pt-3">
            <span>🕒 {{ post.timestamp ? new Date(post.timestamp).toLocaleString() : 'Sem data' }}</span>
            <span>🏷️ Tags: <span class="text-gray-800">{{ post.tags?.join(', ') || 'Nenhuma' }}</span></span>
            <span>👍 Likes: <span class="text-gray-800">{{ post.likes?.length || 0 }}</span></span>
            <!-- Botão de eliminar post (visível se for o autor ou admin) -->
            <button v-if="post.user_id === userId" @click="deletePost(post._id)"
              class="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm mt-2">
              🗑️ Eliminar post
            </button>
            <!-- Mostrar botão de like apenas se o user ainda não tiver dado like -->
            <button v-if="!post.likes.includes(userId)" @click="likePost(post._id)" class="like-button">
              👍 Like
            </button>
            <span v-else-if="post.user_id === userId"><br>Não podes dar like no teu post</span>
            <span v-else class="text-gray-400"><br>Já deste like</span>

          </div>
        </div>

      </div>

      <div v-else class="text-center text-gray-400 italic py-10">Nenhuma publicação disponível.</div>
    </div>

    <Modal v-if="showModal && community" title="Criar nova publicação" @close="closeModal">
      <CreatePost :new-post="props.newPost" :on-create-post="props.onCreatePost" :communityId="community._id"
        :communityLocation="community.location" :userId="userId" @submitted="closeModal" @cancel="closeModal" />
    </Modal>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore';
import { useCommunityStore } from '@/stores/comunityStore';
import { ref, onMounted, watch, computed } from 'vue';
import Modal from '@/components/common/Modal.vue';
import CreatePost from '@/components/forms/CreatePostForm.vue';

const showModal = ref(false);
const openModal = () => (showModal.value = true);
const closeModal = () => (showModal.value = false);

const userStore = useUserStore();
const communityStore = useCommunityStore();
const userId = computed(() => userStore.user._id);
const props = defineProps({
  community: Object,
  posts: Array,
  newPost: Object,
  onCreatePost: Function,
});
const approvedPosts = computed(() => props.posts.filter(p => p.status === 'approved'));
const loading = computed(() => communityStore.loading);
const error = computed(() => communityStore.error);
const userNames = ref(new Map());

const handleSubmit = async () => {
  if (!props.newPost.description.trim()) return;
  ('📝 Submeter novo post:', props.newPost);
  await props.onCreatePost?.();
};

async function getUserName(userId) {
  if (userNames.value.has(userId)) {
    return userNames.value.get(userId);
  }

  try {
    const res = await fetch(`https://hows-the-weather-backend.onrender.com/api/user/${userId}/name`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.accessToken}`,
      },
    });
    const data = await res.json();
    userNames.value.set(userId, data.name);
    return data.name;
  } catch (err) {
    console.error('Erro ao buscar nome do usuário:', err);
    userNames.value.set(userId, 'Desconhecido');
    return 'Desconhecido';
  }
}

const refreshPosts = async () => {
  try {
    await communityStore.fetchCommunityByUserLocation();
  } catch (err) {
    console.error('Erro ao atualizar posts:', err);
  }
};
async function deletePost(postId) {
  if (!confirm('Tem a certeza que deseja apagar esta publicação?')) return;

  try {
    const res = await fetch(`https://hows-the-weather-backend.onrender.com/api/communities/${props.community._id}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${userStore.accessToken}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Erro ao eliminar publicação');
    }

    alert('Publicação eliminada com sucesso!');
    await refreshPosts();
  } catch (err) {
    console.error('Erro ao apagar publicação:', err);
    alert('Erro ao apagar publicação: ' + err.message);
  }
}

async function likePost(postId) {
  try {
    const res = await fetch(`https://hows-the-weather-backend.onrender.com/api/communities/${props.community._id}/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${userStore.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId.value })
    });

    if (!res.ok) throw new Error('Erro ao dar like');
    await refreshPosts();
  } catch (error) {
    console.error('Erro ao dar like:', error);
  }
}

onMounted(async () => {
  for (const post of props.posts) {
    if (!userNames.value.has(post.user_id)) {
      await getUserName(post.user_id);
    }
  }
});
</script>


<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.community-container {
  display: flex;
  flex-direction: column;
  max-width: 1000px;
  margin: 16px auto;
  padding: 20px;
  background-color: #f5f7fa;
  color: #334155;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  border-radius: 8px;
  box-shadow: 0 0 8px rgb(0 0 0 / 0.1);
  min-height: 70vh;
}

.community-container h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1e293b;
}

/* Form styles */
form {
  background-color: #fff;
  padding: 16px;
  border-radius: 6px;
  box-shadow: 0 0 6px rgb(0 0 0 / 0.1);
  margin-bottom: 24px;
}

textarea,
input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 12px;
  font-size: 16px;
  color: #334155;
  margin-bottom: 12px;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

textarea:focus,
input:focus {
  outline: none;
  border-color: #3b82f6;
  /* azul */
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.3);
  resize: vertical;
}

button {
  background-color: #3b82f6;
  color: white;
  font-weight: 600;
  padding: 12px;
  width: 100%;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #2563eb;
}

/* Posts list */
.space-y-6>*+* {
  margin-top: 1.5rem;
}

.bg-white {
  background-color: white;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow {
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
}

.border {
  border: 1px solid #e2e8f0;
}

.text-gray-900 {
  color: #111827;
}

.text-lg {
  font-size: 1.125rem;
}

.text-gray-500 {
  color: #6b7280;
}

.text-blue-600 {
  color: #2563eb;
}

.text-center {
  text-align: center;
}

.text-gray-400 {
  color: #9ca3af;
}

.italic {
  font-style: italic;
}

/* Loading, error, empty messages */
.loading,
.error,
.empty {
  text-align: center;
  color: #64748b;
  font-style: italic;
  padding: 40px 0;
}

.error {
  color: #dc2626;
  /* vermelho */
}

.create-post-button {
  width: 100%;
  padding: 12px;
  background-color: #41B06E;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  text-transform: uppercase;
}

.create-post-button:hover {
  background-color: #309659;
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* Responsividade */
@media (max-width: 768px) {
  .community-container {
    margin: 12px 10px;
    padding: 16px;
  }

  .community-container h2 {
    font-size: 24px;
  }
}
</style>
