const ACTION_SET_AGENT_ASSISTANCE_STATUS = 'SET_AGENT_ASSISTANCE_STATUS';
// Set the initial state of the below that we will use to change the buttons
const initialState = {
    agentAssistance: false,
    supervisorName: ""
};

export class Actions {
    static setAgentAssistanceStatus = (status) => ({ type: ACTION_SET_AGENT_ASSISTANCE_STATUS, status });
  };

// Exporting and adding a reducer for the states we will use later for the buttons
export function reduce(state = initialState, action) {
    switch (action.type) {
        // Return the extended state and the specific status of the above states
        // it requires you pass the name/value for each you wish to update
        case ACTION_SET_AGENT_ASSISTANCE_STATUS: {
            return {
                ...state,
                ...action.status
            }
        }
        // If they unmonitor, we want to go back to the initial state
        default:
            return state;
    }
};
  