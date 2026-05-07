<script setup>
import { ref, computed, defineProps, defineEmits, watch, onMounted } from 'vue';
import { useFactoryPollOverviewStore } from '@/stores/FactoryPollGridStore';
import Tooltip from 'primevue/tooltip';

const factoryPollOverviewGridStore = useFactoryPollOverviewStore();

const isOpen = ref(false);
const searchTerm = ref('');

const emit = defineEmits(['item-selected-update-parameter']);

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [
      { item_name: "item_1", item_state: "OK" },
      { item_name: "item2", item_state: "WARNING" },
      // ... other items
    ],
  }
});

let itemsMapped = computed(() => {
  return props.items.map(item => ({
    label: item.item_name.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
    value: item.item_name,
    state: item.item_state,
  }));
});

const itemBgColor = (state) => {
  return {
    OK: "bg-emerald-600",
    WARNING: "bg-yellow-600",
    CRITICAL: "bg-red-600",
  }[state];
};

function itemClickHandler(selectedItem) {
  console.log("item clicked");
  emit('item-selected-update-parameter', selectedItem);
}

// Reactive state for hovered parameter group and machine data
const hoveredParameterGroup = ref(null);
const hoveredMachines = ref([]);

// Watcher to fetch machines when hoveredParameterGroup changes
watch(hoveredParameterGroup, async (newGroup) => {
  if (newGroup) {
    // Access layout data from the store instead of fetching from endpoints
    const layoutData = factoryPollOverviewGridStore.groupData;
    
    // Find the group matching the hovered item
    const group = layoutData.find(item => item.group_name === newGroup.value);
    
    // Extract abnormal machines for the hovered group
    if (group) {
      // Flatten the nested arrays of machines
      const machines = group.group_details.flatMap(line => line.machines);
      
      // Filter out machines with state OK
      hoveredMachines.value = machines.filter(machine => machine.machine_state == 'WARNING' || machine.machine_state == 'CRITICAL');

      // Debugging: Print abnormal machines
      console.log("Abnormal Machines:", JSON.parse(JSON.stringify(hoveredMachines.value)));
    }
  } else {
    hoveredMachines.value = [];
  }
});

// Ensure PrimeVue tooltip directive is registered
onMounted(() => {
  import('primevue/tooltip').then(module => {
    app.directive('tooltip', module.default);
  });
});
</script>

<template>
  <div class="w-full relative">
    <div class="flex flex-wrap justify-start gap-4 p-4">
      <div v-for="(item, index) in itemsMapped" :key="index"
           :class="[itemBgColor(item.state), 'rounded-full border-black px-4 py-2 m-2 text-white inline-flex whitespace-nowrap align-middle relative']"
           @click="itemClickHandler(item)"
           @mouseover="hoveredParameterGroup = item"
           @mouseleave="hoveredParameterGroup = null"
           v-tooltip.bottom="{
                value: hoveredMachines.map(machine => `${machine.machine_name}`).join(', '),
                pt: {
                    arrow: {
                        style: {
                            // borderBottomColor: 'var(--primary-color)',
                            width: '200px', // Set the desired width
                        display: 'flex', // Flex the items horizontally
                        flexDirection: 'column', // Stack items vertically
                        alignItems: 'flex-start', // Align items to the start
                        }
                    },
                    text: 'bg-primary font-medium',
                    style: {
                       
                    }
                }
            }">
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.tooltip-content {
  /* Adjust the tooltip content styles as needed */
  width: 200px; /* Set the desired width */
  display: flex; /* Flex the items horizontally */
  flex-direction: column; /* Stack items vertically */
  align-items: flex-start; /* Align items to the start */
}
</style>

