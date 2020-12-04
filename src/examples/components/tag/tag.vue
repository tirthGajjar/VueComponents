<template>
  <div class="flex justify-center w-screen h-full p-12 bg-gray-50">
    <div class="w-full max-w-xs mx-auto">
      <div class="space-y-1">
        <Tags
          v-model="selectedTags"
          :options="tags"
          mode="multiple"
          v-slot="{ isOpen }"
          @menu-opened="() => printEventinfo('menu-opened')"
          @menu-closed="() => printEventinfo('menu-closed')"
          @option-deselected="
            (eventData) => printEventinfo('option-deselected', eventData)
          "
          @option-selected="
            (eventData) => printEventinfo('option-selected', eventData)
          "
          @filter-query-change="
            (eventData) => printEventinfo('filter-query-change', eventData)
          "
        >
          {{ isOpen }}
          <div class="relative text-white">
            <span
              style="box-shadow: rgba(255, 255, 255, 0.14) 0px -1px inset"
              class="inline-block w-full shadow-sm bg-gray-700"
            >
              <TagsControl
                style="min-height: 38px"
                class="relative w-full py-2 pl-3 pr-10 text-left transition duration-150 ease-in-out border border-gray-300 cursor-default focus:outline-none focus:shadow-outline-blue focus:border-blue-300 sm:text-sm sm:leading-5"
              >
                <TagSelectionList>
                  <TagSelectOption
                    as="span"
                    v-for="tag in selectedTags"
                    :key="tag.id"
                    :optionId="tag.id"
                    class="rounded-md inline-block truncate px-2 mr-4"
                  >
                    {{ tag.label }}
                  </TagSelectOption>
                </TagSelectionList>
                <span
                  style="min-width: 90px"
                  class="border-none p-0 w-auto inline-block text-white"
                >
                  <TagFilter
                    size="1"
                    class="border-none w-full inline-block resize-none p-0 h-5 bg-gray-700"
                  />
                </span>
                <TagsControlArrow
                  as="span"
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
                </TagsControlArrow>
              </TagsControl>
            </span>

            <div class="absolute w-full bg-gray-700 shadow-lg">
              <TagMenu
                v-if="isOpen"
                class="py-1 w-full overflow-auto text-base leading-6 shadow-xs max-h-60 focus:outline-none sm:text-sm sm:leading-5"
              >
                <TagMenuOption
                  v-for="tag in tags"
                  :key="tag.id"
                  :optionId="tag.id"
                  as="template"
                  v-slot="{ visible, highlighted }"
                >
                  <div
                    v-if="visible"
                    :class="
                      classNames(
                        'relative py-2 pl-3 cursor-pointer select-none pr-9 focus:outline-none text-white',
                        highlighted ? 'bg-gray-600' : 'text-gray-900'
                      )
                    "
                  >
                    {{ tag.label }}
                  </div>
                </TagMenuOption>
              </TagMenu>
            </div>
          </div>
        </Tags>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import {
  Tags,
  TagsControl,
  TagSelectionList,
  TagSelectOption,
  TagFilter,
  TagMenu,
  TagMenuOption,
  TagsControlArrow,
} from '@raxui'

export default {
  components: {
    Tags,
    TagsControl,
    TagSelectionList,
    TagSelectOption,
    TagFilter,
    TagsControlArrow,
    TagMenu,
    TagMenuOption,
  },
  setup() {
    const tags = ref([
      {
        id: '1',
        label: 'Javascript',
      },
      {
        id: '2',
        label: 'HTML',
      },
      {
        id: '3',
        label: 'CSS',
      },
      {
        id: '4',
        label: 'NodeJS',
      },
    ])

    const selectedTags = ref([tags.value[0]])
    function printEventinfo(eventName, eventData = {}) {
      console.log(`[${eventName}]:`, eventData)
    }

    return {
      tags,
      selectedTags,
      classNames(...classes) {
        return classes.filter(Boolean).join(' ')
      },
      printEventinfo,
    }
  },
}
</script>
