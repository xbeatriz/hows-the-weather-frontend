import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

export const useCommunityStore = defineStore('community', {
  state: () => ({
    communities: [],
    userCommunity: null,    
    communityPosts: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchAllCommunities() {
      try {
        const userStore = useUserStore();

        const resAll = await fetch('https://hows-the-weather-backend.onrender.com/api/communities', {
          headers: { Authorization: `Bearer ${userStore.accessToken}` }
        });

        if (!resAll.ok) throw new Error('Erro ao buscar comunidades');

        const dataAll = await resAll.json();
        this.communities = dataAll?.data?.communities
      } catch (error) {
        this.error = error.message || 'Erro desconhecido';
        return false;
      }
    },

    async fetchCommunityByUserLocation() {
      this.loading = true;
      this.error = null;

      try {
        const userStore = useUserStore();

        const resAll = await fetch('https://hows-the-weather-backend.onrender.com/api/communities', {
          headers: { Authorization: `Bearer ${userStore.accessToken}` }
        });

        if (!resAll.ok) throw new Error('Erro ao buscar comunidades');

        const dataAll = await resAll.json();

        this.communities = Array.isArray(dataAll?.data?.communities)
          ? dataAll.data.communities
          : [];

        const userLocation = userStore.user?.location;

        const community = this.communities.find(c => c.location === userLocation);

        if (!community) {
          this.userCommunity = null;
          this.communityPosts = [];
          return false;
        }

        const resDetail = await fetch(`https://hows-the-weather-backend.onrender.com/api/communities/${community._id}`, {
          headers: { Authorization: `Bearer ${userStore.accessToken}` }
        });

        if (!resDetail.ok) throw new Error('Erro ao buscar dados da comunidade');

        const dataDetail = await resDetail.json();

        this.userCommunity = dataDetail.data || null;
        this.communityPosts = this.userCommunity?.community_posts || [];
        return !!this.userCommunity;
      } catch (error) {
        this.error = error.message || 'Erro desconhecido';
        return false;
      } finally {
        this.loading = false;
      }
    },
async fetchPostsByCommunityId(communityId) {
      this.loading = true;
      this.error = null;
      const userStore = useUserStore();
      try {
        const res = await fetch(`https://hows-the-weather-backend.onrender.com/api/communities/${communityId}/posts`, {
          headers: {
            Authorization: `Bearer ${userStore.accessToken}` // ou obtém o token de outro modo
          }
        });
        if (!res.ok) throw new Error('Erro ao buscar posts');
        const data = await res.json();
        this.posts = data.posts || [];
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    async createCommunity(location, member_count) {
      try {
        const userStore = useUserStore()
        const res = await fetch('https://hows-the-weather-backend.onrender.com/api/communities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userStore.accessToken}`
          },
          body: JSON.stringify({ location, member_count })
        })

        if (!res.ok) throw new Error('Erro ao criar comunidade')

        const data = await res.json()
        this.communities.push(data.data)
        return true
      } catch (error) {
        console.error('Erro ao criar comunidade:', error)
        return false
      }
    }
  }
})
