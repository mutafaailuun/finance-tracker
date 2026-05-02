<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">WhatsApp Bot</h1>
        <p class="text-gray-500 mt-1">Catat transaksi via WhatsApp</p>
      </div>
    </div>

    <!-- Setup Steps -->
    <div class="space-y-6">
      <!-- Step 1: Connect WhatsApp -->
      <div class="card">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <LucideIcon name="phone" size="20" class="text-primary-600" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">1. Hubungkan Nomor WhatsApp</h3>
            <p class="text-sm text-gray-500 mt-1">
              Daftarkan nomor WhatsApp Anda untuk mulai mencatat transaksi via chat.
            </p>
            
            <div v-if="!connectedPhone" class="mt-4 space-y-3">
              <div class="flex gap-2">
                <input
                  v-model="phoneInput"
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  class="input-field flex-1"
                />
                <button 
                  @click="connectPhone" 
                  :disabled="connecting"
                  class="btn-primary"
                >
                  {{ connecting ? '...' : 'Hubungkan' }}
                </button>
              </div>
              <p class="text-xs text-gray-400">
                Format: 08xx atau 62xx (tanpa spasi atau tanda baca)
              </p>
            </div>

            <div v-else class="mt-4 p-4 bg-emerald-50 rounded-xl">
              <div class="flex items-center gap-3">
                <LucideIcon name="check-circle" size="20" class="text-emerald-600" />
                <div>
                  <p class="text-sm font-medium text-emerald-900">Terhubung</p>
                  <p class="text-sm text-emerald-700">{{ connectedPhone }}</p>
                </div>
                <button 
                  @click="disconnectPhone"
                  class="ml-auto text-sm text-red-600 hover:text-red-700"
                >
                  Putuskan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Save Fonnte Token -->
      <div class="card">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <LucideIcon name="key" size="20" class="text-amber-600" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">2. Konfigurasi Fonnte (Admin)</h3>
            <p class="text-sm text-gray-500 mt-1">
              Admin perlu mengatur webhook Fonnte untuk menerima pesan WhatsApp.
            </p>
            
            <div class="mt-4 p-4 bg-gray-50 rounded-xl space-y-3">
              <div>
                <label class="text-xs font-medium text-gray-700 uppercase">Webhook URL</label>
                <div class="flex gap-2 mt-1">
                  <input
                    :value="webhookUrl"
                    readonly
                    class="input-field flex-1 bg-gray-100 text-gray-600 text-sm"
                  />
                  <button 
                    @click="copyWebhookUrl"
                    class="btn-secondary text-sm"
                  >
                    <LucideIcon name="copy" size="16" />
                  </button>
                </div>
              </div>
              
              <div class="text-xs text-gray-500 space-y-1">
                <p>📋 Langkah-langkah:</p>
                <ol class="list-decimal list-inside space-y-1 ml-2">
                  <li>Login ke dashboard Fonnte</li>
                  <li>Pergi ke menu "Webhook"</li>
                  <li>Paste URL di atas</li>
                  <li>Save dan aktifkan webhook</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: How to Use -->
      <div class="card">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
            <LucideIcon name="message-circle" size="20" class="text-violet-600" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">3. Cara Penggunaan</h3>
            <p class="text-sm text-gray-500 mt-1">
              Kirim pesan ke bot WhatsApp untuk mencatat transaksi.
            </p>
            
            <div class="mt-4 space-y-2">
              <div class="p-3 bg-gray-50 rounded-lg">
                <p class="text-xs text-gray-500 mb-1">💬 Contoh pesan:</p>
                <ul class="text-sm text-gray-700 space-y-1">
                  <li class="font-mono bg-white p-2 rounded">"Makan siang di warteg 25k"</li>
                  <li class="font-mono bg-white p-2 rounded">"Beli bensin 50rb"</li>
                  <li class="font-mono bg-white p-2 rounded">"Gaji masuk 5jt"</li>
                  <li class="font-mono bg-white p-2 rounded">"Bayar listrik 350k"</li>
                </ul>
              </div>

              <div class="p-3 bg-blue-50 rounded-lg">
                <p class="text-xs text-blue-600 font-medium mb-1">💡 Perintah yang tersedia:</p>
                <ul class="text-sm text-blue-800 space-y-1">
                  <li><code>/help</code> - Bantuan</li>
                  <li><code>/saldo</code> - Cek total saldo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sync Status -->
      <div v-if="connectedPhone" class="card bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
            <LucideIcon name="bot" size="24" class="text-white" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-emerald-900">Bot Aktif!</h3>
            <p class="text-sm text-emerald-700">
              Transaksi yang dicatat via WhatsApp akan otomatis muncul di dashboard.
            </p>
          </div>
          <div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '~/composables/useUtils'

definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const phoneInput = ref('')
const connectedPhone = ref('')
const connecting = ref(false)
const webhookUrl = ref('')

// Get project URL for webhook
onMounted(async () => {
  // Get connected phone
  const { data } = await supabase
    .from('user_phone_mappings')
    .select('phone_number')
    .eq('user_id', user.value.id)
    .single()
  
  if (data) {
    connectedPhone.value = data.phone_number
  }

  // Get Supabase project ref
  const { data: config } = await supabase
    .rpc('get_project_ref')
  
  // Construct webhook URL
  const projectRef = config || 'your-project-ref'
  webhookUrl.value = `https://${projectRef}.supabase.co/functions/v1/fonnte-webhook`
})

const connectPhone = async () => {
  if (!phoneInput.value) return
  
  connecting.value = true
  
  try {
    // Format phone number (remove spaces, dashes, etc)
    const formattedPhone = phoneInput.value.replace(/[\s\-\+]/g, '')
    
    const { error } = await supabase
      .from('user_phone_mappings')
      .upsert({
        user_id: user.value.id,
        phone_number: formattedPhone,
        verified: true,
      })
    
    if (error) throw error
    
    connectedPhone.value = formattedPhone
    phoneInput.value = ''
    
    alert('Nomor WhatsApp berhasil terhubung!')
  } catch (error) {
    alert('Gagal menghubungkan nomor: ' + error.message)
  }
  
  connecting.value = false
}

const disconnectPhone = async () => {
  if (!confirm('Yakin ingin memutuskan koneksi WhatsApp?')) return
  
  try {
    await supabase
      .from('user_phone_mappings')
      .delete()
      .eq('user_id', user.value.id)
    
    connectedPhone.value = ''
  } catch (error) {
    alert('Gagal memutuskan koneksi: ' + error.message)
  }
}

const copyWebhookUrl = () => {
  navigator.clipboard.writeText(webhookUrl.value)
  alert('Webhook URL disalin!')
}
</script>
