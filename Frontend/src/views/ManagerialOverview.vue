<template>
  <LayoutAuthenticatedSimple>
    <SectionMain>
      <div class="plant-overview p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg min-h-screen">
        <span><ToggleButton/></span>
        <h1 class="plant-title text-4xl font-bold text-center mb-12 text-emerald-600">Managerial Plant Overview</h1>
        
        <div v-if="factoryStore.isLoading" class="flex flex-col items-center justify-center h-[60vh]">
          <div class="text-8xl text-emerald-500 mb-8 animate-pulse">
            <font-awesome-icon :icon="['fas', 'industry']" />
          </div>
          <div class="text-3xl text-gray-700 font-semibold mb-6">Loading Plant Data...</div>
          <div class="flex space-x-8">
            <div class="flex flex-col items-center">
              <font-awesome-icon :icon="['fas', 'cogs']" spin class="text-4xl text-emerald-500 mb-2" />
              <span class="text-sm text-gray-600">Processing</span>
            </div>
            <div class="flex flex-col items-center">
              <font-awesome-icon :icon="['fas', 'database']" class="text-4xl text-emerald-500 mb-2 animate-bounce" />
              <span class="text-sm text-gray-600">Fetching Data</span>
            </div>
            <div class="flex flex-col items-center">
              <font-awesome-icon :icon="['fas', 'chart-line']" class="text-4xl text-emerald-500 mb-2 animate-pulse" />
              <span class="text-sm text-gray-600">Analyzing</span>
            </div>
          </div>
          <div class="mt-8 w-64 h-2 bg-emerald-200 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 animate-progress"></div>
          </div>
        </div>

        <div v-else-if="factoryStore.error" class="text-center text-2xl text-red-500">
          {{ factoryStore.error }}
        </div>
        
        
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Lines and Machines Overview -->
          <div v-for="line in factoryStore.formattedOverviewData.lines" :key="line.line_name" class="line-overview">
            <div class="line-card bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 mb-4"
                 :class="getStatusBorderClass(line.line_state)">
              <h3 class="text-2xl font-bold mb-2 text-emerald-700 flex items-center">
                <span v-if="line.line_name === 'BLOCK'"><FontAwesomeIcon :icon="['fas', 'cubes']" class="mr-2" /></span>
                <span v-else-if="line.line_name === 'CRANK'"><FontAwesomeIcon :icon="['fas', 'cogs']" class="mr-2" /></span>
                <span v-else-if="line.line_name === 'HEAD'"><FontAwesomeIcon :icon="['fas', 'wrench']" class="mr-2" /></span>
                {{ line.line_name }}
              </h3>
              <div class="flex flex-wrap gap-4">
                <button @click="setLineFilter(line.line_name, 'ALL')" 
                        :class="getFilterButtonClass(line.line_name, 'ALL')"
                        class="text-sm p-2 rounded-lg font-semibold shadow-lg transition-all duration-300">
                  All: {{ line.count.OK + line.count.WARNING + line.count.CRITICAL }}
                </button>
                <button @click="setLineFilter(line.line_name, 'OK')" 
                        :class="getFilterButtonClass(line.line_name, 'OK')"
                        class="text-sm p-2 rounded-lg font-semibold shadow-lg transition-all duration-300">
                  OK: {{ line.count.OK }}/{{ line.count.OK + line.count.WARNING + line.count.CRITICAL }}
                </button>
                <button @click="setLineFilter(line.line_name, 'WARNING')" 
                        :class="getFilterButtonClass(line.line_name, 'WARNING')"
                        class="text-sm p-2 rounded-lg font-semibold shadow-lg transition-all duration-300">
                  Warning: {{ line.count.WARNING }}/{{ line.count.OK + line.count.WARNING + line.count.CRITICAL }}
                </button>
                <button @click="setLineFilter(line.line_name, 'CRITICAL')" 
                        :class="getFilterButtonClass(line.line_name, 'CRITICAL')"
                        class="text-sm p-2 rounded-lg font-semibold shadow-lg transition-all duration-300">
                  Critical: {{ line.count.CRITICAL }}/{{ line.count.OK + line.count.WARNING + line.count.CRITICAL }}
                </button>
              </div>
            </div>
              
            <!-- Machines related to the line -->
            <div class="machines-overview grid grid-cols-5 w-full gap-2">
              <div v-for="machine in filteredMachines(line)" :key="machine.machine_name"
                   class="machine-card bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg rounded-lg shadow p-2 hover:shadow-md cursor-pointer transition-all duration-300 transform hover:scale-105"
                   @click="showMachineDetails(machine)"
                   :class="getMachineCardClass(machine.machine_state)">
                <div class="flex flex-col items-center relative group">
                  <div class="machine-icon text-3xl mb-1">
                    <!-- <FontAwesomeIcon :icon="['fas', 'cog']" /> -->
                     <span></span>
                  </div>
                  <div class="machine-name font-bold text-center truncate w-full text-indigo-800" :title="machine.machine_name">
                    {{ machine.machine_name }}
                  </div>
                  <!-- Hover Summary -->
                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-lg 
                              invisible group-hover:visible transition-all duration-200 z-10 w-48 text-xs gap-2">
                    <p class="bg-green-100 rounded">OK: {{ machine.count.OK }}</p>
                    <p class="bg-yellow-100 rounded gap-2">Warning: {{ machine.count.WARNING }}</p>
                    <p class="bg-red-100 rounded">Critical: {{ machine.count.CRITICAL }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Machine Details Modal -->
        <div v-if="selectedMachine" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <h2 class="text-3xl font-bold mb-6 text-emerald-600">{{ selectedMachine.machine_name }} Details</h2>
            <div v-if="getAbnormalParameters(selectedMachine).length === 0" class="text-center text-gray-600">
              No abnormal parameters found.
            </div>
            <div v-else v-for="param in getAbnormalParameters(selectedMachine)" :key="param.actual_parameter_name" 
                 class="parameter-card bg-white rounded-xl shadow-lg p-4 mb-4 hover:shadow-xl transition-all duration-300"
                 :class="getStatusBorderClass(param.parameter_state)"
                 @click="logParameterDetails(param, selectedMachine.machine_name, getParameterGroup(selectedMachine.machine_name, param.internal_parameter_name))">
              <h3 class="text-lg font-semibold mb-2 text-gray-800">{{ param.actual_parameter_name }}</h3>
              <p>Value: {{ param.parameter_value }}</p>
              <p>Status: <span :class="getStatusTextClass(param.parameter_state)">{{ param.parameter_state }}</span></p>
              <div class="flex gap-2">
                <p class="text-sm text-gray-600">Last Updated: {{ formatDate(param.latest_update_time) }}</p>
                <p class="text-sm text-yellow-600 font-semibold">Warning Limit: {{ param.warning_limit }}</p>
                <p class="text-sm text-red-600 font-semibold">Critical Limit: {{ param.critical_limit }}</p>
              </div>
            </div>
            <button @click="selectedMachine = null" class="mt-6 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all  hover:bg-indigo-700">Close</button>
          </div>
        </div>
      </div>
    </SectionMain>
  </LayoutAuthenticatedSimple>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useFactoryOverviewStore } from '../stores/FactoryOverviewStore';
import SectionMain from "@/components/SectionMain.vue";
import LayoutAuthenticatedSimple from "@/layouts/LayoutAuthenticatedSimple.vue";
import ToggleButton from "@/components/ToggleButton.vue";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
// import { faCubes, faCogs, faWrench, faCog } from '@fortawesome/free-solid-svg-icons';
import { useFactoryPollOverviewStore } from '../stores/FactoryPollGridStore';
import { useMachineSamplingWithLimitsStore } from '@/stores/MachineSamplingWithLimitsStore'; 
import { useRouter } from 'vue-router';

import { faCogs, faDatabase, faChartLine, faIndustry } from '@fortawesome/free-solid-svg-icons';
import { useNavigationHistoryStore } from '../stores/navigationHistoryStore';


library.add(faCogs, faDatabase, faChartLine, faIndustry);

const router = useRouter();
const factoryStore = useFactoryOverviewStore();
const factoryPollStore = useFactoryPollOverviewStore();
const machineSamplingWithLimitsStore = useMachineSamplingWithLimitsStore();
const selectedMachine = ref(null);
const lineFilters = ref({});

const navigationHistoryStore = useNavigationHistoryStore();


onMounted(async () => {
  await factoryStore.fetchAndFormatData();
  // Initialize filters for each line
  factoryStore.formattedOverviewData.lines.forEach(line => {
    lineFilters.value[line.line_name] = 'ALL';
  });
});

function setLineFilter(lineName, filter) {
  lineFilters.value[lineName] = filter;
}

function filteredMachines(line) {
  const filter = lineFilters.value[line.line_name];
  if (filter === 'ALL') return line.machines;
  return line.machines.filter(machine => machine.machine_state === filter);
}

function getFilterButtonClass(lineName, status) {
  const isActive = lineFilters.value[lineName] === status;
  return {
    'bg-emerald-600 text-white': isActive,
    'bg-white text-emerald-600': !isActive,
    'hover:bg-emerald-500 hover:text-white': true,
  };
}

function showMachineDetails(machine) {
  selectedMachine.value = machine;
}

function getAbnormalParameters(machine) {
  return machine.parameters.filter(param => param.parameter_state !== 'OK');
}

function getMachineCardClass(status) {
  return {
    'bg-green-100 border-green-500 shadow-lg': status === 'OK',
    'bg-gradient-to-r from-yellow-100 to-yellow-400 border-yellow-700 shadow-xl transform scale-105': status === 'WARNING', // Updated styling for WARNING
    'bg-gradient-to-r from-red-100 to-red-400 border-red-800 shadow-xl transform scale-110': status === 'CRITICAL', // Updated styling for CRITICAL
    'border-2': true
  };
}

function getStatusBorderClass(status) {
  return {
    'border-l-4 border-yellow-500': status === 'WARNING',
    'border-l-4 border-red-500': status === 'CRITICAL'
  };
}

function getStatusTextClass(status) {
  return {
    'text-yellow-600 font-semibold': status === 'WARNING',
    'text-red-600 font-semibold': status === 'CRITICAL'
  };
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}



function logParameterDetails(param, machineName, parameterGroup) {
  console.log(`Parameter Details:`, param);
  console.log(`Machine Name:`, machineName);
  console.log(`Parameter Group:`, parameterGroup);

  const details = {
    machine: machineName,
    actualParameterName: param.actual_parameter_name,
    parameterGroup: parameterGroup
  };

  machineSamplingWithLimitsStore.setMachineDetails(details);
  machineSamplingWithLimitsStore.setLastSelectedParameter(details);
  navigationHistoryStore.addToHistory(router.currentRoute.value);
  router.push('/machine-level-sampling');
}



function getParameterGroup(machineName, parameterName) {
  const group = factoryPollStore.groupData.find(group => 
    group.group_details.some(line => 
      line.machines.some(machine => 
        machine.machine_name === machineName && 
        machine.parameters.some(param => param.internal_parameter_name === parameterName)
      )
    )
  );
  console.log("Found group:", group ? group.group_name : 'Unknown Group');
  return group ? group.group_name : 'Unknown Group';
}
</script>

<style scoped>
.plant-overview {
  @apply min-h-screen;
}

.line-card {
  @apply transform hover:scale-105 transition-all duration-300;
}

.machine-card {
  @apply transform hover:scale-110 transition-all duration-300;
}

.parameter-card {
  @apply transform hover:scale-105 transition-all duration-300;
}


@keyframes progress {
  0% { width: 0; }
  50% { width: 70%; }
  100% { width: 100%; }
}

.animate-progress {
  animation: progress 3s ease-in-out infinite;
}
</style>