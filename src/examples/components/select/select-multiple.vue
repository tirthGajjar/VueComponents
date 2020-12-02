<template>
  <div class="flex justify-center w-screen h-full p-12 bg-gray-50">
    <div class="w-full max-w-xs mx-auto">
      <div class="space-y-1">
        <Selectbox v-model="active" mode="multiple" v-slot="{ open }">
          <SelectboxLabel
            class="block text-sm font-medium leading-5 text-gray-700"
            >Peoples</SelectboxLabel
          >

          <div class="relative text-white">
            <span
              style="box-shadow: rgba(255, 255, 255, 0.14) 0px -1px inset"
              class="inline-block w-full shadow-sm bg-gray-700"
            >
              <SelectboxButton
                style="min-height: 38px"
                class="relative w-full py-2 pl-3 pr-10 text-left transition duration-150 ease-in-out border border-gray-300 cursor-default focus:outline-none focus:shadow-outline-blue focus:border-blue-300 sm:text-sm sm:leading-5"
              >
                <span
                  v-for="(elem, index) in active"
                  :key="index"
                  :class="
                    'rounded-md inline-block truncate px-2 mr-4 ' + elem.bgColor
                  "
                  @click="(event) => removeSelectedValue(index, event)"
                >
                  {{ elem.name }}
                </span>
                <span
                  v-if="open"
                  style="min-width: 90px"
                  class="border-none p-0 w-auto inline-block text-white"
                >
                  <input
                    type="text"
                    size="1"
                    class="border-none w-full inline-block resize-none p-0 h-5 bg-gray-700"
                    v-model="searchQuery"
                  />
                </span>
                <span
                  class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
                >
                  <svg
                    class="w-5 h-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </SelectboxButton>
            </span>

            <div class="absolute w-full bg-gray-700 shadow-lg">
              <SelectboxOptions
                class="py-1 w-full overflow-auto text-base leading-6 shadow-xs max-h-60 focus:outline-none sm:text-sm sm:leading-5"
              >
                <SelectboxOption
                  v-for="(person, index) in filteredData"
                  :key="index"
                  :value="person"
                  :className="resolveSelectboxOptionClassName"
                  v-slot="{ selected }"
                >
                  <span
                    :class="
                      classNames(
                        'block truncate max-w-max-content px-2 rounded-md',
                        selected ? 'font-semibold' : 'font-normal',
                        person.bgColor
                      )
                    "
                  >
                    {{ person.name }}
                  </span>
                  <span
                    v-if="selected"
                    class="absolute inset-y-0 right-0 flex items-center pr-4 text-white"
                  >
                    <svg
                      class="w-5 h-5"
                      viewbox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </SelectboxOption>
                <SelectboxOption
                  v-if="showCreateNewOption"
                  :value="createNewOptionValue"
                  :className="resolveSelectboxOptionClassName"
                >
                  <span class="text-white">Create</span>
                  <span
                    :class="
                      classNames(
                        'inline-block truncate max-w-max-content px-2 rounded-md font-normal',
                        createNewOptionValue.bgColor
                      )
                    "
                  >
                    {{ ' ' + searchQuery }}
                  </span>
                </SelectboxOption>
              </SelectboxOptions>
            </div>
          </div>
        </Selectbox>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue'
import {
  Selectbox,
  SelectboxLabel,
  SelectboxButton,
  SelectboxOptions,
  SelectboxOption,
} from '@raxui'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default {
  components: {
    Selectbox,
    SelectboxLabel,
    SelectboxButton,
    SelectboxOptions,
    SelectboxOption,
  },
  setup() {
    const searchQuery = ref('')

    const colors = {
      red: 'bg-red-300',
      blue: 'bg-blue-300',
      green: 'bg-green-300',
      orange: 'bg-orange-300',
      teal: 'bg-teal-300',
      indigo: 'bg-indigo-300',
      purple: 'bg-purple-300',
      pink: 'bg-pink-300',
    }

    const people = ref([
      { name: 'Wade Cooper', bgColor: colors.red },
      { name: 'Arlene Mccoy', bgColor: colors.blue },
      { name: 'Devon Webb', bgColor: colors.green },
      { name: 'Tom Cook', bgColor: colors.orange },
      { name: 'Tanya Fox', bgColor: colors.indigo },
    ])

    const active = ref([
      people.value[Math.floor(Math.random() * people.value.length)],
    ])

    function removeSelectedValue(idx, event) {
      event.preventDefault()
      active.value.splice(idx, 1)
    }

    const showCreateNewOption = computed(() => {
      return searchQuery.value.trim() !== ''
    })

    const filteredData = computed(() => {
      console.log('searchQuery:', searchQuery.value)
      if (searchQuery.value.trim() === '') {
        return people.value
      }

      return people.value.filter((elem) =>
        elem.name
          .toLowerCase()
          .startsWith(searchQuery.value.trim().toLowerCase())
      )
    })

    const createNewOptionValue = computed(() => {
      return {
        name: searchQuery.value,
        type: 'new_option',
        bgColor:
          colors[
            Object.keys(colors)[
              Math.floor(Math.random() * Object.keys(colors).length)
            ]
          ],
      }
    })

    // watch(searchQuery, (newValue) => {
    //   console.log('New searchQuery', newValue)
    // })

    watch(
      () => active,
      (newValue) => {
        debugger
        const idx = newValue.value.findIndex(
          (val) => val?.type === 'new_option'
        )
        if (idx !== -1) {
          people.value.push({
            name: searchQuery.value,
            bgColor: newValue.value[idx].bgColor,
          })
          active.value[idx] = {
            name: searchQuery.value,
            bgColor: newValue.value[idx].bgColor,
          }
          searchQuery.value = ''
        }
      },
      {
        deep: true,
      }
    )

    return {
      filteredData,
      active,
      classNames,
      removeSelectedValue,
      searchQuery,
      showCreateNewOption,
      colors,
      createNewOptionValue,
      resolveSelectboxOptionClassName({ active }) {
        return classNames(
          'relative py-2 pl-3 cursor-default select-none pr-9 focus:outline-none',
          active ? 'text-white bg-gray-600' : 'text-gray-900'
        )
      },
    }
  },
}
</script>
