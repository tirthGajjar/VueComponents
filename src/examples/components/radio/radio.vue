<template>
  <div class="flex justify-center w-screen h-full p-12 bg-gray-50">
    <div class="w-full max-w-xs mx-auto">
      <div class="space-y-1">
        <RadioGroup
          as="ul"
          :options="data"
          v-model="checkedValue"
          class="space-y-4"
        >
          <Radio
            v-for="(plan, index) in data"
            :key="index"
            :value="plan.planName"
            class="group relative bg-white rounded-lg shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-indigo-500"
            v-slot="{ checked }"
          >
            <div
              class="rounded-lg border border-gray-300 bg-white px-6 py-4 hover:border-gray-400 sm:flex sm:justify-between"
            >
              <div class="flex items-center">
                <div class="text-sm">
                  <p class="font-medium text-gray-900"> {{ plan.planName }} </p>
                  <div class="text-gray-500">
                    <p class="sm:inline"
                      >{{ plan.configuration.ram }} /
                      {{ plan.configuration.cpu }}</p
                    >
                    <span class="hidden sm:inline sm:mx-1" aria-hidden="true"
                      >&middot;</span
                    >
                    <p class="sm:inline">{{ plan.configuration.storage }}</p>
                  </div>
                </div>
              </div>
              <div
                class="mt-2 flex text-sm sm:mt-0 sm:block sm:ml-4 sm:text-right"
              >
                <div class="font-medium text-gray-900">{{ plan.price }}</div>
                <div class="ml-1 text-gray-500 sm:ml-0">/mo</div>
              </div>
            </div>
            <!-- On: "border-indigo-500", Off: "border-transparent" -->
            <div
              v-if="checked"
              class="border-indigo-500 absolute inset-0 rounded-lg border-2 pointer-events-none"
              aria-hidden="true"
            ></div>
          </Radio>
        </RadioGroup>
      </div>
    </div>
  </div>
</template>

<script>
import { RadioGroup, Radio } from '@raxui'
import { ref } from 'vue'
export default {
  components: {
    RadioGroup,
    Radio,
  },
  setup() {
    const data = [
      {
        planName: 'Hobby',
        configuration: {
          ram: '8GB',
          cpu: '4 CPUs',
          storage: '160 GB SSD disk',
        },
        price: '$40',
      },
      {
        planName: 'Startup',
        configuration: {
          ram: '12GB',
          cpu: '6 CPUs',
          storage: '256 GB SSD disk',
        },
        price: '$80',
      },
      {
        planName: 'Business',
        configuration: {
          ram: '16GB',
          cpu: '8 CPUs',
          storage: '512 GB SSD disk',
        },
        price: '$160',
      },
      {
        planName: 'Enterprise',
        configuration: {
          ram: '32GB',
          cpu: '12 CPUs',
          storage: '1024 GB SSD disk',
        },
        price: '$240',
      },
    ]

    const checkedValue = ref(data[0].planName)

    return {
      checkedValue,
      data,
    }
  },
}
</script>