<template>
  <div>
    <div
      class="flex items-start justify-center w-screen h-full p-12 bg-gray-50"
    >
      <Button
        class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
        @click="handleButtonClick"
        >Open Modal</Button
      >
    </div>
    <Modal
      v-model="active"
      v-slot="{ visible }"
      @ok="() => btnClicked('ok')"
      @cancel="() => btnClicked('cancel')"
    >
      <div
        class="fixed z-10 inset-0 overflow-y-auto"
        :class="{ hidden: !visible }"
      >
        <div
          class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        >
          <div class="fixed inset-0 transition-opacity" aria-hidden="true">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <!-- This element is to trick the browser into centering the modal contents. -->
          <span
            class="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
            >&#8203;</span
          >
          <div
            class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
          >
            <div>
              <div
                class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100"
              >
                <svg
                  class="h-6 w-6 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-5">
                <h3
                  class="text-lg leading-6 font-medium text-gray-900"
                  id="modal-headline"
                >
                  Payment successful
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Consequatur amet labore.
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-6">
              <ModalActionButton
                as="button"
                type="button"
                class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              >
                Go back to dashboard
              </ModalActionButton>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import { Modal, Button, ModalActionButton } from '@raxui'
export default {
  components: {
    Modal,
    Button,
    ModalActionButton,
  },
  data() {
    return {
      active: false,
    }
  },
  methods: {
    handleButtonClick() {
      this.active = true
    },
    btnClicked(type) {
      console.log(`${type} button clicked`)
    },
  },
}
</script>
