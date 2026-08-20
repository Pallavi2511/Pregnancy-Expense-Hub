<template>
  <div class="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-10">
    <div class="mx-auto max-w-6xl">
      <h1 class="text-3xl font-semibold text-slate-900 mb-6">Baby Shopping</h1>

      <div class="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 class="text-xl font-semibold text-slate-800 mb-4">Add Shopping Item</h2>
          <form @submit.prevent="submitShopping" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2" for="itemName">Item Name</label>
              <input
                id="itemName"
                v-model="form.name"
                type="text"
                placeholder="Enter item name"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2" for="category">Category</label>
              <select
                id="category"
                v-model="form.category"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                required
              >
                <option value="" disabled>Select category</option>
                <option>Clothes</option>
                <option>Toys</option>
                <option>Essentials</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2" for="price">Price</label>
              <input
                id="price"
                v-model.number="form.price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2" for="purchaseDate">Purchase Date</label>
              <input
                id="purchaseDate"
                v-model="form.date"
                type="date"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                required
              />
            </div>

            <button
              type="submit"
              class="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
            >
              Add Item
            </button>
          </form>
        </section>

        <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-slate-800">Saved Items</h2>
            <span class="text-sm text-slate-500">{{ shoppingItems.length }} items</span>
          </div>

          <div class="space-y-4">
            <article
              v-for="item in shoppingItems"
              :key="item.id || item.date + item.name"
              class="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-slate-900">{{ item.name }}</h3>
                  <p class="text-sm text-slate-600">{{ item.category }}</p>
                </div>
                <div class="flex flex-col items-start gap-1 text-right sm:items-end">
                  <span class="text-lg font-semibold text-slate-900">${{ formatAmount(item.price) }}</span>
                  <span class="text-sm text-slate-500">{{ formatDate(item.date) }}</span>
                </div>
              </div>
            </article>
          </div>

          <div class="mt-6 rounded-3xl bg-slate-900 p-5 text-white shadow-lg">
            <p class="text-sm uppercase tracking-[0.2em] text-slate-300">Total Shopping Cost</p>
            <p class="mt-2 text-3xl font-semibold">${{ formatAmount(totalCost) }}</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'

const shoppingItems = ref([])
const form = ref({
  name: '',
  category: '',
  price: null,
  date: '',
})

const loadShoppingItems = async () => {
  try {
    const response = await api.get('/api/shopping')
    shoppingItems.value = response.data || []
  } catch (error) {
    console.error('Failed to load shopping items', error)
  }
}

const submitShopping = async () => {
  try {
    const payload = {
      name: form.value.name,
      category: form.value.category,
      price: form.value.price,
      date: form.value.date,
    }
    await api.post('/api/shopping', payload)
    await loadShoppingItems()
    form.value.name = ''
    form.value.category = ''
    form.value.price = null
    form.value.date = ''
  } catch (error) {
    console.error('Failed to submit shopping item', error)
  }
}

const totalCost = computed(() => {
  return shoppingItems.value.reduce((sum, item) => sum + Number(item.price || 0), 0)
})

const formatAmount = (value) => {
  const amount = Number(value || 0)
  return amount.toFixed(2)
}

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(loadShoppingItems)
</script>
