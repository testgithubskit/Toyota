import { defineStore } from 'pinia';
import axios from 'axios';


export const usePlantPollingParameterGridStore = defineStore('PlantPollingParameterGrid', {
  state: () => ({
    SelectedParmeter: {
      name: 'parameter_1',
      availableParameters: ['parameter_1', 'parameter_2', 'parameter_3']
    },
  }),
  actions: {

    async fetchAndUpdateAvailableParameters() {
  
      const url = `http://172.18.100.87:8000/api/v1/machines/ams_mcv_450/parameters`;
  
      try {
        const response = await axios.get(url);
        const availableParameters = response.data.parameters;
        console.log('Available parameters:', availableParameters);
        this.SelectedParmeter.availableParameters = availableParameters;
        console.log('Set parameters:', this.SelectedParmeter.availableParameters);
      } catch (error) {
        console.error('Error fetching/updating available machines:', error);
        throw error;
      }
    },
  },
});
