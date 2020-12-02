<template>
  <div class="border-b border-gray-200">
    <Tabs v-model="activeKey" class="-mb-px flex">
      <Tab
        v-for="item in tabsDetail"
        :key="item.tabVal"
        :val="item.tabVal"
        class="whitespace-no-wrap mx-4 py-4 px-1 border-b-2 border-transparent font-medium text-sm leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 cursor-pointer"
        :class="{
          'border-indigo-500 text-indigo-600 focus:outline-none focus:text-indigo-800 focus:border-indigo-700':
            activeKey === item.tabVal,
        }"
      >
        {{ item.tabTitle }}
      </Tab>
    </Tabs>
    <TabPanels v-model="activeKey">
      <TabPanel
        v-for="item in tabsDetail"
        :key="item.tabVal"
        :val="item.tabVal"
      >
        {{ item.tabContent }}
      </TabPanel>
    </TabPanels>
  </div>
</template>

<script>
import { Tabs, Tab, TabPanels, TabPanel } from '@raxui'
export default {
  components: {
    Tabs,
    Tab,
    TabPanels,
    TabPanel,
  },
  data() {
    return {
      activeKey: 'B',
      tabsDetail: [
        {
          tabVal: 'A',
          tabTitle: 'Tab A',
          tabContent: 'Content of Tab A',
        },
        {
          tabVal: 'B',
          tabTitle: 'Tab B',
          tabContent: 'Content of Tab B',
        },
        {
          tabVal: 'C',
          tabTitle: 'Tab C',
          tabContent: 'Content of Tab C',
        },
        {
          tabVal: 'D',
          tabTitle: 'Tab D',
          tabContent: 'Content of Tab D',
        },
      ],
    }
  },
}
</script>
