import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import ExpenseTracker from '../components/ExpenseTracker.vue'
import BabyShopping from '../components/BabyShopping.vue'
import PostPregnancy from '../components/PostPregnancy.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/expenses', name: 'ExpenseTracker', component: ExpenseTracker },
  { path: '/shopping', name: 'BabyShopping', component: BabyShopping },
  { path: '/post-pregnancy', name: 'PostPregnancy', component: PostPregnancy },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
