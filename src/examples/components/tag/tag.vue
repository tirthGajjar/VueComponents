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
          <div class="relative text-white">
            <span
              style="box-shadow: rgba(255, 255, 255, 0.14) 0px -1px inset"
              class="inline-block w-full shadow-sm gray_bg"
            >
              <TagsControl
                style="min-height: 38px"
                class="relative w-full py-2 pl-3 pr-10 text-left transition duration-150 ease-in-out border border-gray-300 cursor-default focus:outline-none focus:shadow-outline-blue focus:border-blue-300 sm:text-sm sm:leading-5"
              >
                <TagSelectionList class="inline-block">
                  <TagSelectOption
                    as="span"
                    v-for="tag in selectedTags"
                    :key="tag.id"
                    :optionId="tag.id"
                    class="rounded-md inline-block truncate px-2 mr-4"
                    :style="{ 'background-color': tag.bgColor }"
                    :onClickRemove="false"
                  >
                    {{ tag.label }}
                    <TagRemoveIcon
                      class="inline-block w-2 h-2 ml-1 cursor-pointer"
                    >
                      <svg
                        fill="white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 348.333 348.333"
                      >
                        <path
                          d="M336.559 68.611L231.016 174.165l105.543 105.549c15.699 15.705 15.699 41.145 0 56.85-7.844 7.844-18.128 11.769-28.407 11.769-10.296 0-20.581-3.919-28.419-11.769L174.167 231.003 68.609 336.563c-7.843 7.844-18.128 11.769-28.416 11.769-10.285 0-20.563-3.919-28.413-11.769-15.699-15.698-15.699-41.139 0-56.85l105.54-105.549L11.774 68.611c-15.699-15.699-15.699-41.145 0-56.844 15.696-15.687 41.127-15.687 56.829 0l105.563 105.554L279.721 11.767c15.705-15.687 41.139-15.687 56.832 0 15.705 15.699 15.705 41.145.006 56.844z"
                        />
                      </svg>
                    </TagRemoveIcon>
                  </TagSelectOption>
                </TagSelectionList>
                <div class="border-none p-0 inline-block text-white">
                  <TagFilter
                    class="cursor-text border-none outline-none box-content shadow-none inline-block p-0 h-5 gray_bg"
                  />
                </div>
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

            <div class="absolute w-full gray_bg shadow-lg">
              <TagMenu
                v-if="isOpen"
                class="py-1 w-full overflow-auto text-base leading-6 shadow-xs max-h-60 focus:outline-none sm:text-sm sm:leading-5"
              >
                <TagMenuOption
                  v-for="tag in tags"
                  :key="tag.id"
                  :optionId="tag.id"
                  as="template"
                  v-slot="{ visible, highlighted, selected }"
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
                    <span
                      class="block truncate max-w-max-content px-2 rounded-md font-normal"
                      :style="{ 'background-color': tag.bgColor }"
                    >
                      {{ tag.label }}
                    </span>
                    <span
                      v-if="selected"
                      class="absolute inset-y-0 right-0 flex items-center pr-4 text-white"
                    >
                      <svg class="w-5 h-5" viewbox="0 0 20 20" fill="white">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
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
  TagRemoveIcon,
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
    TagRemoveIcon,
  },
  setup() {
    const colors = {
      red: 'rgba(255, 115, 105, 0.5)',
      blue: 'rgba(82, 156, 202, 0.5)',
      green: 'rgba(77, 171, 154, 0.5)',
      yellow: 'rgba(255, 220, 73, 0.5)',
      orange: 'rgba(255, 163, 68, 0.5)',
      purple: 'rgba(154, 109, 215, 0.5)',
    }

    const tags = ref([
      {
        id: '1',
        label: 'Javascript',
        bgColor: colors.red,
      },
      {
        id: '2',
        label: 'HTML',
        bgColor: colors.blue,
      },
      {
        id: '3',
        label: 'CSS',
        bgColor: colors.green,
      },
      {
        id: '4',
        label: 'NodeJS',
        bgColor: colors.yellow,
      },
    ])

    const selectedTags = ref([tags.value[0]])
    function printEventinfo(eventName, eventData = {}) {
      console.log(`[${eventName}]:`, eventData)
    }

    return {
      tags,
      selectedTags,
      colors,
      classNames(...classes) {
        return classes.filter(Boolean).join(' ')
      },
      printEventinfo,
    }
  },
}
</script>

<style scoped>
.gray_bg {
  background-color: rgb(55, 60, 63);
}
</style>
