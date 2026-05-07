<script setup>
import { computed, ref, onBeforeMount,onMounted } from "vue";

import DyLineChartWithLimits from "@/components/Charts/DyLineChartWithLimits.vue";
import TimePickerFlatEmitter from "@/components/TimePickerFlatEmitter.vue";
import SectionMain from "@/components/SectionMain.vue";
import CardBox from "@/components/CardBox.vue";
import BaseButton from "@/components/BaseButton.vue";
import GraphLegend from "@/components/GraphLegend.vue";
import LayoutAuthenticatedSimple from "@/layouts/LayoutAuthenticatedSimple.vue";
import BlurryHorizontalDivider from "@/components/BlurryHorizontalDivider.vue";

import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';


import CardBoxWidgetPlainWrap from "@/components/CardBoxWidgetPlainWrap.vue";
import { useNavigationHistoryStore } from '@/stores/navigationHistoryStore';


//Importing Store Statements

import { useMachineSamplingWithLimitsStore } from '@/stores/MachineSamplingWithLimitsStore'; 
// import { useMachineSamplingWithLimitsStore } from '@/stores/MachineSamplingWithLimitsStore';

import { useActivityStore } from '@/stores/ActivityStore.js'; 
import { useRouter } from 'vue-router';

const router = useRouter();

const machineSamplingWithLimitsStore = useMachineSamplingWithLimitsStore();
const ActivityStore = useActivityStore();


const warningInput = ref(machineSamplingWithLimitsStore.warningLimit);
const criticalInput = ref(machineSamplingWithLimitsStore.criticalLimit);

const updateWarning = () => {
  const warningLimit = parseFloat(warningInput.value);
  if (!isNaN(warningLimit)) {
    machineSamplingWithLimitsStore.updateLimits("warning_limit", warningLimit);
  }
};

const updateCritical = () => {
  const criticalLimit = parseFloat(criticalInput.value);
  if (!isNaN(criticalLimit)) {
    machineSamplingWithLimitsStore.updateLimits("critical_limit", criticalLimit);
  }
};


let chartData = computed(() => {
  return machineSamplingWithLimitsStore.chartData;
});

let warningLimit = computed(() => {
  return machineSamplingWithLimitsStore.warningLimit;
});

let criticalLimit = computed(() => {
  return machineSamplingWithLimitsStore.criticalLimit;
});

let hoverData = computed(() => {
  return machineSamplingWithLimitsStore.hoverData;
});

function subtractHours(date, hours) {
  date.setHours(date.getHours() - hours);

  return date;
}

let currentDate = new Date();

machineSamplingWithLimitsStore.selectedDates.to = currentDate.getTime();

let oneHourEarlier = subtractHours(currentDate, 1);
let formattedDateOneHourEarlier = oneHourEarlier.getTime();

machineSamplingWithLimitsStore.selectedDates.from = formattedDateOneHourEarlier;

const handleQuerySubmit = async () => {
  const sixHoursInMillis = 6 * 60 * 60 * 1000; // 2 hours in milliseconds
  const timeDifference = machineSamplingWithLimitsStore.selectedDates.to - machineSamplingWithLimitsStore.selectedDates.from;
  console.log("time diffrence")
  console.log(timeDifference)
  // Check if the time difference is more than 2 hours
 // Check if the parameter group is DYNAMIC_PARAMETERS and the time difference is more than 6 hours
 if (machineSamplingWithLimitsStore.parameterGroup === 'DYNAMIC_PARAMETERS' && timeDifference > sixHoursInMillis) {
    Toastify({
      text: 'For DYNAMIC_PARAMETERS, please select a time range less than 6 hours',
      duration: 5000,
      close: true,
      gravity: 'top',
      position: 'right',
      backgroundColor: 'red',
    }).showToast();
    return; // Do not proceed further for DYNAMIC_PARAMETERS with time range > 6 hours
  }

  // Getting the Initial Latest Data from the backend - Start
  await machineSamplingWithLimitsStore.fetchMachineParameterData();
};
const handleQuerySubmitActivity = async () => {
  // Getting the Initial Latest Data from the backend - Start
  // await machineSamplingWithLimitsStore.fetchMachineParameterData();
  await ActivityStore.fetchActivityDataParameter(machineSamplingWithLimitsStore.actualParameterName);
  router.push("/corrective-activity");
};


// Previsoly Working handle back function

// const handleBack = async () => {
//   const routeObject = { name: 'Factory Level Polling Parameter Overview Grid',
//    params: { groupName: machineSamplingWithLimitsStore.parameterGroup } };
//   router.push(routeObject);
// };

// const router = useRouter();
const navigationHistoryStore = useNavigationHistoryStore()


const handleBack = () => {
  const previousRoute = navigationHistoryStore.getPreviousRoute();
  console.log("the previous Route is ")
  console.log(previousRoute)
  if (previousRoute) {
    navigationHistoryStore.removeLastRoute();
    router.push(previousRoute);
  } else {
    // Fallback to a default route if no previous route exists
    router.push('/');
  }
};

const handleFromDateChange = (dateValue) => {
  // Handle the "from" date change event here
  // Perform any additional actions as needed
  machineSamplingWithLimitsStore.selectedDates.from = dateValue.value;
};

const handleToDateChange = (dateValue) => {
  // Handle the "to" date change event here
  // Perform any additional actions as needed
  machineSamplingWithLimitsStore.selectedDates.to = dateValue.value;
};

onBeforeMount(async () => {
  console.log("sampling on mount");
  console.log(machineSamplingWithLimitsStore.parameterGroup);
});

function convertEpochToLocal(epochTimestamp) {
  // Create a Date object from the epoch timestamp
  const date = new Date(epochTimestamp);

  // Get the local date and time components in user-friendly format
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short', // Include time zone abbreviation for clarity
  };

  // Format the local datetime string
  const localDateTimeString = date.toLocaleString('en-IN', options);

  return localDateTimeString;
}



// const machineSamplingWithLimitsStore = useMachineSamplingWithLimitsStore();
const currentParameter = ref(null);


onMounted(async () => {
  if (machineSamplingWithLimitsStore.lastSelectedParameter) {
    machineSamplingWithLimitsStore.setMachineDetails(machineSamplingWithLimitsStore.lastSelectedParameter);
    await machineSamplingWithLimitsStore.fetchMachineParameterData();
  }
  console.log("Stored machine details:", {
    machine: machineSamplingWithLimitsStore.machine,
    actualParameterName: machineSamplingWithLimitsStore.actualParameterName,
    parameterGroup: machineSamplingWithLimitsStore.parameterGroup
  });
  console.log("Last selected parameter:", machineSamplingWithLimitsStore.lastSelectedParameter);
});


function OnHoverCallBack(hoverData){
  console.log("hover parent");
  console.log(hoverData);
  let dateTime = convertEpochToLocal(hoverData[0]["xval"]);
  let newHoverData = {
      "xAxisValue": dateTime,
      "yAxisValue": hoverData[0]["yval"],
      "xAxisLabel": machineSamplingWithLimitsStore.hoverData.xAxisLabel,
      "yAxisLabel": machineSamplingWithLimitsStore.hoverData.yAxisLabel,
      "xAxisUnits": machineSamplingWithLimitsStore.hoverData.xAxisUnits,
      "yAxisUnits": machineSamplingWithLimitsStore.hoverData.yAxisUnits
    }
  machineSamplingWithLimitsStore.hoverData = newHoverData;
}
</script>

<template>
  <LayoutAuthenticatedSimple>
    <SectionMain>

      <div class="container mx-auto flex flex-col space-y-4">

        <!-- <div class="w-16 h-8">
          <BaseButton type="submit" color="infolightDark" label="Back" @click="handleBack" />
        </div> -->

        <div v-if="machineSamplingWithLimitsStore.alertMessage" 
        :class="{ 'alert': true, 'bg-emerald-500 border-black': machineSamplingWithLimitsStore.isSuccessMessage,
        'bg-red-600 border-black': !machineSamplingWithLimitsStore.isSuccessMessage }">
          {{ machineSamplingWithLimitsStore.alertMessage }}
        </div>

        <BlurryHorizontalDivider />
        <!-- Display machine information Start -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-5 mb-6">
          <CardBoxWidgetPlainWrap 
          label="Machine Name"
          :parameter-value="machineSamplingWithLimitsStore.machine">
          </CardBoxWidgetPlainWrap>
          <CardBoxWidgetPlainWrap 
          label="Parameter Group"
          :parameter-value="machineSamplingWithLimitsStore.parameterGroup">
          </CardBoxWidgetPlainWrap>
          <CardBoxWidgetPlainWrap 
          label="Parameter Name"
          :parameter-value="machineSamplingWithLimitsStore.actualParameterName">
          </CardBoxWidgetPlainWrap>
          <CardBoxWidgetPlainWrap label="Warning Limit:">
            <div class="flex flex-row">
              <div class="relative mt-2">
                <input v-model="warningInput" type="number" class="w-full h-8 p-2 border-2 border-black rounded-lg" />
              </div>
              <button @click="updateWarning" class="text-blue-500  mx-2 mt-2">
                <img class="w-12" src="@/assets/icons/update.svg " alt="">
              </button>
            </div>
          </CardBoxWidgetPlainWrap>

          <CardBoxWidgetPlainWrap label="Critical Limit:">
            <div class="flex flex-row">
              <div class="relative mt-2">
                <input v-model="criticalInput" type="number" class="w-full h-8 p-2 border-2 border-black rounded-lg" />
              </div>
              <button @click="updateCritical" class="text-blue-500 mx-2 mt-2">
                <img class="w-12" src="@/assets/icons/update.svg " alt="">
              </button>
            </div>
            
          </CardBoxWidgetPlainWrap>
        </div>

        <BlurryHorizontalDivider />

        <div class="flex justify-normal">
          <div>
            <label class="block mb-2 text-gray-700">From</label>
            <TimePickerFlatEmitter :defaultDatetime="subtractHours(new Date(), 1)" type="from" @date-change="handleFromDateChange" />
          </div>

          <div class="ml-8">
            <label class="block mb-2 text-gray-700">To</label>
            <TimePickerFlatEmitter :defaultDatetime="new Date()" type="to" @date-change="handleToDateChange" />
          </div>

          <div class="flex flex-col items-center justify-end ml-8">
            <BaseButton type="submit" color="info" label="Submit" @click="handleQuerySubmit" />
          </div>

          <div class="flex flex-col items-center justify-end ml-8">
            <BaseButton type="submit" color="info" label="View Activity" @click="handleQuerySubmitActivity()" />
          </div>
        </div>

        <BlurryHorizontalDivider />

        <CardBox class="mb-8">
          <div>
            <DyLineChartWithLimits :data="chartData" 
            :warningLimit="warningLimit"
            :criticalLimit="criticalLimit"
            class="h-96"
            @data-hovered="OnHoverCallBack" />
          </div>
        </CardBox>      

        <BlurryHorizontalDivider />
        <GraphLegend :data="hoverData"></GraphLegend>
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
