<template>
  <div class="flex items-start justify-center w-screen h-full p-12 bg-gray-50">
    <Button
      class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
      @click="onButtonClicked"
    >
      Button Text
    </Button>
  </div>
</template>

<script>
import { Button } from '@raxui'

export default {
  components: { Button },
  setup() {
    function onButtonClicked(event) {
      console.log('Button Clicked', event)
    }

    return {
      onButtonClicked,
    }
  },
}
</script>
