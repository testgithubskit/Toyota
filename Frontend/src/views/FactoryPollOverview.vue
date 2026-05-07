<script setup>
import { computed, ref, onMounted, onBeforeMount, watch, onBeforeUnmount } from "vue";
import {
  mdiChartTimelineVariant,
  mdiGithub,
} from "@mdi/js";

import SectionMain from "@/components/SectionMain.vue";
import LayoutAuthenticatedSimple from "@/layouts/LayoutAuthenticatedSimple.vue";
import SectionTitleLineWithButton from "@/components/SectionTitleLineWithButton.vue";
import BaseButton from "@/components/BaseButton.vue";
import BlurryHorizontalDivider from "@/components/BlurryHorizontalDivider.vue";
import ProductionLine from "@/components/ProductionLine.vue";
import ParameterWithDropDown from "@/components/ParameterWithDropDown.vue";
import StatefulDropdownSingleSelect from "@/components/StatefulDropdownSingleSelect.vue";
import AbnormalitySummary from "@/components/AbnormalitySummary.vue";

import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

//Importing Store Statements

import { useFactoryPollOverviewStore } from '@/stores/FactoryPollGridStore'; 

import { useMachineSamplingWithLimitsStore } from '@/stores/MachineSamplingWithLimitsStore'; 

import { useRouter } from 'vue-router';

import { Tooltip } from 'ant-design-vue';
import { RightCircleOutlined } from '@ant-design/icons-vue'; // Change this line
import { useDatabaseName } from '@/stores/DatabaseName';

const router = useRouter();
const machineSamplingWithLimitsStore = useMachineSamplingWithLimitsStore();
const factoryPollOverviewGridStore = useFactoryPollOverviewStore();
const DatabaseName = useDatabaseName();
const isPageLoading = ref(true);

let initialSelectedParameter = ref(null);

let groupDataIndex = computed(() => {
  return factoryPollOverviewGridStore.groupData.findIndex(group => group.group_name === factoryPollOverviewGridStore.SelectedParmeter.item_name);
});

let isLoading = ref(false);

let selectedParameterGroupInfo = computed(() => {
  return factoryPollOverviewGridStore.groupData[groupDataIndex.value];
});

const groupCount = computed(() => {
  const selectedGroup = factoryPollOverviewGridStore.groupData.find(group => group.group_name === factoryPollOverviewGridStore.SelectedParmeter.item_name);

  if (selectedGroup) {
    return selectedGroup.count;
  }

  // Default count if the group is not found
  return {
    OK: 0,
    WARNING: 0,
    CRITICAL: 0,
    DISCONNECTED: 0,
  };
});

const totalMachines = computed(() => { 
  return groupCount.value.OK + groupCount.value.WARNING + groupCount.value.CRITICAL + groupCount.value.DISCONNECTED;
});

const getGridColumnsClass = computed(() => {
  return (length) => {
    return `grid grid-cols-3 gap-6 lg:grid-cols-${length} mb-6`;
  };
});

let availableParameters = ref(factoryPollOverviewGridStore.availableParameters);

let abnormalParameters =  computed(() => {
  return availableParameters.value.filter(parameter => parameter.item_state !== "OK");
});


const combinedLabel = (subSectionName) => {
  return `${subSectionName} : ${totalMachines.value}`;
};


onBeforeMount(async () => {
  isPageLoading.value = true;
  let groupNameFromRoute = router.currentRoute.value.params.groupName || null;
  await factoryPollOverviewGridStore.fetchInitialPageData();
   await DatabaseName.fetchSchemaName();
  if (groupNameFromRoute !== null) {
  // Your code here if the variable is not null
  factoryPollOverviewGridStore.setSelectedGroup(groupNameFromRoute);
  let groupDetails = factoryPollOverviewGridStore.getGroupDetail(groupNameFromRoute);
  let informalGroupName = groupNameFromRoute.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  let selectedGroupDetails = {"label": informalGroupName, "state": groupDetails.groupState, "value": groupNameFromRoute};
  initialSelectedParameter.value = selectedGroupDetails;
} else{
  const defaultGroupName = "APC_BATTERY";
  factoryPollOverviewGridStore.setSelectedGroup(defaultGroupName);
  let groupDetails = factoryPollOverviewGridStore.getGroupDetail(defaultGroupName);
  let informalGroupName = defaultGroupName.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  let selectedGroupDetails = {"label": informalGroupName, "state": groupDetails.groupState, "value": defaultGroupName};
  initialSelectedParameter.value = selectedGroupDetails;
  let SchemaName = DatabaseName.schemaName

}

});

const isInitialLoading = ref(true);
const isParameterChanging = ref(false);

onMounted(async () => {
  // Show initial loading screen for 5 seconds
  setTimeout(() => {
    isInitialLoading.value = false;
  }, 5000);

  // Create a variable to store the interval ID
  let intervalId;
  factoryPollOverviewGridStore.updateGroupData();


  // Set up the interval and store the ID
  intervalId = setInterval(() => {
    isLoading.value = true; // Set loading to true before fetching data
    factoryPollOverviewGridStore.updateGroupData();
    
    setTimeout(() => {
      isLoading.value = false; // Set loading to false after 1 second
    }, 1000);
  }, 5000);

  // Use onBeforeUnmount to clean up when the component is about to be unmounted
  onBeforeUnmount(() => {
    console.log("Clearing");
    // Clear the interval when the component is unmounting
    clearInterval(intervalId);
  });
  
});


const handleSelectedParameterUpdate = async (selectedItem) => {
  if (selectedItem !== null) {
    isParameterChanging.value = true;
    
    let newSelectedParameter = { item_name: selectedItem.value, item_state: selectedItem.state };
    factoryPollOverviewGridStore.SelectedParmeter = newSelectedParameter;
    initialSelectedParameter.value = selectedItem;

    // Show loading overlay for 3 seconds
    setTimeout(() => {
      isParameterChanging.value = false;
    }, 3000);

    Toastify({
        text: 'Loading Real Time Data.',
        duration: 5000,
        close: true,
        gravity: 'bottom',
        position: 'right',
        backgroundColor: 'green',
      }).showToast();
  }
};

const handleParameterClick = async (selectedItem) => {

if (selectedItem !== null){

  let newSelectedParameter = { item_name: selectedItem.value, item_state: selectedItem.state };

//await factoryPollOverviewGridStore.updateGroupData(selectedItem.value);
  factoryPollOverviewGridStore.SelectedParmeter = newSelectedParameter;
  initialSelectedParameter.value = selectedItem;
}
};
const handleSelectedParameterUpdate2 = async (selectedItem) => {

if (selectedItem !== null){
  let newSelectedParameter = { item_name: selectedItem, item_state: selectedItem.state };
  console.log(newSelectedParameter)
//await factoryPollOverviewGridStore.updateGroupData(selectedItem.value);
  factoryPollOverviewGridStore.SelectedParmeter = newSelectedParameter;
  initialSelectedParameter.value = selectedItem;

}
};

watch(() => factoryPollOverviewGridStore.availableParameters, (newAvailableParameters) => {
  availableParameters.value = newAvailableParameters;
});

const handleMachineParameterClick = async (clickedParameter) => {
  // Perform any necessary actions with the updated parameters
  machineSamplingWithLimitsStore.machine = clickedParameter.machineName;
  machineSamplingWithLimitsStore.actualParameterName = clickedParameter.actualParameterName;;

  machineSamplingWithLimitsStore.parameterGroup = factoryPollOverviewGridStore.SelectedParmeter.item_name;

  machineSamplingWithLimitsStore.refreshTimestamp();
  await machineSamplingWithLimitsStore.fetchMachineParameterData();
  router.push('/machine-level-sampling');
};

// Compute the button text and link based on the schema name
const dashboardButton = computed(() => {
  if (DatabaseName.schemaName === "tiei_gd_plant_1") {
    return {
      text: "Open TNGA Dashboard",
      link: "http://10.82.126.73/tiei_dynamic/#/factory-level-polling/parameter-overview/grid"
    };
  } else if (DatabaseName.schemaName === "tiei_sample_4") {
    return {
      text: "Open GD Dashboard",
      link: "http://10.82.126.73/tiei_dynamic_gd/#/factory-level-polling/parameter-overview/grid"
    };
  } else {
    return {
      text: "Open Dashboard",
      link: "https://localhost:5173/tiei_dynamic/"
    };
  }
});

</script>

<template>
  <LayoutAuthenticatedSimple>
    <!-- Initial loading screen -->
    <div v-if="isInitialLoading" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg text-center">
        <img src="@/assets/gifs/Settings.gif" alt="Loading..." class="mx-auto mb-4 w-16 h-16">
        <p class="text-lg font-semibold">Loading Factory Data...</p>
      </div>
    </div>

    <!-- Parameter changing overlay -->
    <div v-if="isParameterChanging" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg text-center">
        <img src="@/assets/gifs/Settings.gif" alt="Loading..." class="mx-auto mb-4 w-16 h-16">
        <p class="text-lg font-semibold">Updating Parameter Data...</p>
      </div>
    </div>

    <SectionMain>
      <div class="container mx-auto flex flex-col space-y-1">
        <!-- Update the button here -->
        <!-- <div class="flex justify-end ">
          <Tooltip :title="dashboardButton.text">
            <a
              :href="dashboardButton.link"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:bg-emerald-600 hover:scale-105 transition-all"
            >
              {{ dashboardButton.text }}
              <RightCircleOutlined class="ml-2" />
            </a>
          </Tooltip>
        </div> -->

        <div class="w-8 h-8">
          <!-- Add your loading SVG icon here -->
          <img v-if="isLoading" src="@\assets\gifs\Loading.gif" alt="Loading...">
        </div>
        
        <ParameterWithDropDown class="col-span-3"  :icon="mdiChartTimelineVariant" title="Parameter:" main>
            <StatefulDropdownSingleSelect 
            @item-selected-update-parameter="handleSelectedParameterUpdate" 
            :items="availableParameters"
            :defaultSelectedItem="initialSelectedParameter" />
        </ParameterWithDropDown>

        <BlurryHorizontalDivider />
        
        <SectionTitleLineWithButton
            :icon="mdiChartTimelineVariant"
            title="Abnormality Summary"
            main
            >
        </SectionTitleLineWithButton>

        <AbnormalitySummary 
        :items="abnormalParameters"
        @item-selected-update-parameter="handleParameterClick" />
        <BlurryHorizontalDivider />
        <div
          v-for="Section in factoryPollOverviewGridStore.sections"
          :key="Section.sectionName"
        >

          <div
            v-for="subSection in Section.subSections"
            :key="subSection.subSectionName"
          >
            <SectionTitleLineWithButton
            :icon="mdiChartTimelineVariant"
            :title="Section.sectionName"
            main
            >
              <BaseButton
                href="https://cmti.res.in/"
                target="_blank"
                :icon="mdiGithub"
                :label="combinedLabel(subSection.subSectionName)"
                color="contrast"
                rounded-full
                small
              />
            </SectionTitleLineWithButton>

            <div :class="getGridColumnsClass(subSection.components.length)">
              <component
                v-for="component in subSection.components"
                :is="component.type"
                :key="component.label"
                :label="component.label"
                :parameterValue="groupCount[component.label]"
                :icon="component.icon"
                :borderSide="component.borderSide"
                :borderThickness="component.borderThickness"
                :state="component.state"
              />
            </div>
          </div>
          <BlurryHorizontalDivider />
        </div>
      </div>
      
      <div class="container mx-auto flex flex-col space-y-4">
        <ProductionLine
          v-for="line in selectedParameterGroupInfo.group_details"
          :key="line.line_name"
          :lineName="line.line_name"
          :lineState="line.line_state"
          :machines="line.machines"
          :count = "line.count"
          @machine-parameter-clicked="handleMachineParameterClick"
        >
        </ProductionLine>
      </div>
    </SectionMain>
  </LayoutAuthenticatedSimple>
</template>

<style scoped>
/* Tailwind CSS classes for animation */
@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Add your alert styles here */
.alert {
  @apply fixed top-10 left-1/2 transform -translate-x-1/2 text-white p-2 rounded-md border z-50;
  animation: slideIn 0.5s ease-out;
}

</style>
