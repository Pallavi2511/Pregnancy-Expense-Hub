<template>
  <div class="min-h-screen bg-slate-50 p-6">
    <div class="mx-auto max-w-3xl">
      <h1 class="text-3xl font-semibold text-slate-900 mb-6">Home</h1>
      <div class="grid gap-4 sm:grid-cols-3">
        <button @click="go('/expenses')" class="rounded-2xl bg-sky-600 text-white px-4 py-3">Go to Expenses</button>
        <button @click="go('/shopping')" class="rounded-2xl bg-emerald-600 text-white px-4 py-3">Go to Shopping</button>
        <button @click="go('/post-pregnancy')" class="rounded-2xl bg-violet-600 text-white px-4 py-3">Go to Post-Pregnancy</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const go = (path) => router.push(path)
</script>
