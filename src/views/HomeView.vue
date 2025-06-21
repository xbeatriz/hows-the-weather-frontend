<template>
  <div class="home">
    <Sidebar
      :headerText="'Painel de Controlo'"
      :user="user"
      :activeMenu="activeMenu"
      @menuChange="handleMenuChange"
      @logout="handleLogout"
    />

    <div class="dashboard-content">
      <component :is="currentComponent" v-bind="componentProps" />
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/dashboard/Sidebar.vue';
import OverviewView from '@/components/dashboard/OverviewUser.vue';
import Comunity from '@/components/dashboard/Comunity.vue';
import { useUserStore } from '@/stores/userStore';
import { useCommunityStore } from '@/stores/comunityStore';
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

export default {
  name: 'HomeView',
  components: {
    Sidebar,
    OverviewView,
    Comunity,
  },
  setup() {
    const userStore = useUserStore();
    const user = computed(() => userStore.user);

    const communityStore = useCommunityStore();
    const { userCommunity, communityPosts } = storeToRefs(communityStore);

    const newPost = ref({
      description: '',
      tags: '',
    });

    onMounted(async () => {
      if (userStore.accessToken) {
        const success = await communityStore.fetchCommunityByUserLocation();
        if (!success) {
          console.warn('⚠️ Nenhuma comunidade foi carregada.');
        }
      } else {
        console.warn('⚠️ Token não disponível. Login necessário.');
      }
    });

    const fetchPosts = async () => {
      if (!userCommunity.value?._id) return;
      try {
        await communityStore.fetchPostsByCommunityId(userCommunity.value._id);
      } catch (err) {
        console.error('Erro ao buscar posts:', err);
      }
    };

    const createPost = async () => {
      try {
        const body = {
          description: newPost.value.description,
          tags: newPost.value.tags.split(',').map((t) => t.trim()),
          sensor_id: user.value.configs?.[0]?.sensorid || null,
        };
        await fetch(
          `https://hows-the-weather-backend.onrender.com/api/communities/${userCommunity.value._id}/posts`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        );
        newPost.value.description = '';
        newPost.value.tags = '';
        await fetchPosts();
      } catch (err) {
        console.error('Erro ao criar publicação:', err);
      }
    };

    const activeMenu = ref('overview');

    watch(
      () => activeMenu.value,
      async (newValue) => {
        if (newValue === 'communities' && userCommunity.value?._id) {
          await fetchPosts();
        }
      }
    );

    return {
      user,
      community: userCommunity,
      posts: communityPosts,
      newPost,
      createPost,
      activeMenu,
    };
  },
  data() {
    return {
      selectedDate: new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      currentDate: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      currentWeather: {
        temperature: 23,
        condition: 'sunny',
        location: 'Lisbon, Portugal',
        humidity: 65,
      },
      dailyTemperature: [
        { time: '6AM', temp: 18 },
        { time: '9AM', temp: 20 },
        { time: '12PM', temp: 23 },
        { time: '3PM', temp: 25 },
        { time: '6PM', temp: 22 },
        { time: '9PM', temp: 19 },
      ],
      weeklyTemperature: [
        { day: 'Mon', icon: '☀️', high: 25, low: 18 },
        { day: 'Tue', icon: '⛅', high: 24, low: 17 },
        { day: 'Wed', icon: '☁️', high: 22, low: 16 },
        { day: 'Thu', icon: '🌧️', high: 20, low: 15 },
        { day: 'Fri', icon: '🌧️', high: 21, low: 16 },
        { day: 'Sat', icon: '⛅', high: 23, low: 17 },
        { day: 'Sun', icon: '☀️', high: 26, low: 19 },
      ],
      airQuality: { value: 45, status: 'Good', color: '#41B06E' },
      airPollutants: [
        { name: 'PM2.5', value: 12, unit: 'μg/m³', status: 'Good' },
        { name: 'PM10', value: 24, unit: 'μg/m³', status: 'Good' },
        { name: 'O₃', value: 85, unit: 'μg/m³', status: 'Moderate' },
        { name: 'NO₂', value: 15, unit: 'μg/m³', status: 'Good' },
      ],
      additionalData: {
        pressure: 1012,
        windSpeed: 12,
        windDirection: 'NE',
        precipitation: 0,
        uvIndex: 5,
      },
    };
  },
  methods: {
    handleMenuChange(menuId) {
      this.activeMenu = menuId;
    },
    handleLogout() {
      useUserStore().logout();
      this.$router.push('/login');
    },
    prevDay() {
      console.log('Previous day selected');
    },
    nextDay() {
      console.log('Next day selected');
    },
  },
  computed: {
    currentComponent() {
      switch (this.activeMenu) {
        case 'communities':
          return this.community && this.community._id ? Comunity : 'DivEmpty';
        default:
          return OverviewView;
      }
    },
    componentProps() {
      switch (this.activeMenu) {
        case 'communities':
          return {
            community: this.community,
            posts: this.posts,
            newPost: this.newPost,
            onCreatePost: this.createPost,
          };
        default:
          return {};
      }
    },
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
}

.home {
  display: flex;
  height: 100vh;
  position: fixed;
  background-color: #f5f7fa;
  width: 100%;
  transition: margin-left 0.3s ease;
  color: #334155;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  overflow-x: hidden;
}

.home.sidebar-active {
  margin-left: 280px;
}
.sidebar {
  width: 250px;
  min-height: 100vh;
  background-color: #0f172a;
  position: relative;
  flex-shrink: 0;
}

/* Dashboard Content Styles */
.dashboard-content {
  flex: 1;
  padding: 16px;
  box-sizing: border-box;
}

/* Welcome section */
.welcome-section {
  margin: 16px 16px;
}

.welcome-section h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.welcome-section p {
  font-size: 16px;
  color: #64748b;
}

/* Modern Card Grid Layouts */
.weather-card-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  gap: 20px;
}

.metrics-card-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 20px;
  margin: 0 20px 20px;
  width: calc(100% - 40px);
}

/* Responsive Adjustments */
@media (min-width: 2000px) {
  .weather-card-grid,
  .metrics-card-grid {
    margin: 0 5% 20px;
    width: calc(100% - 10%);
  }
}

@media (min-width: 1440px) and (max-width: 1999px) {
  .weather-card-grid,
  .metrics-card-grid {
    margin: 0 4% 20px;
    width: calc(100% - 8%);
  }
}

@media (min-width: 1025px) and (max-width: 1439px) {
  .weather-card-grid,
  .metrics-card-grid {
    margin: 0 3% 20px;
    width: calc(100% - 6%);
  }
}

@media (max-width: 1024px) {
  .weather-card-grid,
  .metrics-card-grid {
    flex-direction: column;
    margin: 0 20px 20px;
    width: calc(100% - 40px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .home {
    transition: none;
  }
}
</style>
