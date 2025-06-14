import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/fusion-test',
    name: 'FusionTest',
    component: () => import('../views/FusionTest.vue')
  },
  {
    path: '/face-viz-test',
    name: 'FaceVizTest',
    component: () => import('../views/FaceVizTest.vue')
  },
  {
    path: '/identity-test',
    name: 'IdentityTest',
    component: () => import('../views/IdentityTest.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router 