import React from 'react';
import { FlexPlugin } from 'flex-plugin';
import { Manager, VERSION } from '@twilio/flex-ui';
import { Actions as AgentAssistanceStatusAction, } from './states/AgentAssistanceState';

// Leverage for the Sync Documents used for Coach Alerts across user sessions
import { SyncClient } from "twilio-sync";

// Used for Sync Docs
import { SyncDoc } from './services/Sync'

// import the reducers
import reducers, { namespace } from './states';
// import the custom listeners
import './listeners/CustomListeners';

// Agent Assistance Button for the Agent's view
import AgentAssistanceButton from './components/AgentAssistanceButton';
// Supervisor Alert and Teams View component based on Agent Assistance Status
import SupervisorAlertButton from './components/SupervisorAlertButton';

const PLUGIN_NAME = 'AgentAssistancePlugin';

// Generate token for the sync client
export const SYNC_CLIENT = new SyncClient(Manager.getInstance().user.token);

// Refresh sync client token
function tokenUpdateHandler() {

  console.log("OUTBOUND DIALPAD: Refreshing SYNC_CLIENT Token");

  const loginHandler = Manager.getInstance().store.getState().flex.session.loginHandler;

  const tokenInfo = loginHandler.getTokenInfo();
  const accessToken = tokenInfo.token;

  SYNC_CLIENT.updateToken(accessToken);
}

/*
FIXME: We have it working, now we need to get the agent's alert button to reset when the supervisor monitors the call, 
       this should also clean up the task alert color change from the agent's perspective
*/

//TODO:  What's next to build?
//       1 - Add another array with agent's full name to the Sync Doc updates and conference SID
//         - (COMPLETED)
//       2 - Supervisor Side:
//          2a - Add a Toggle to Enable/Disable Agent Assistance Alerts (can use this to trigger the sync updates)
//             - (COMPLETED)
//                a - Enable by default, cache value so refresh remembers their preference
//                  - (COMPLETED)
//          2b - Enable Sync Doc Subscriptions
//             - (COMPLETED)
//          2c - Push Alert that shows when Agent clicks the Agent Assistance button
//             - (COMPLETED)
//       3 - Update Sync Doc when Supervisor begins to Monitor (IE Turn off Agent Assistance)
//         - (COMPLETED)
//       4 - Add changes to Teams View Canvas based on WHO is actively asking for Agent Assistance (IE highlight red?)
//         - (COMPLETED)
//       5 - UI Extras & Others
//          5a - Supervisor UI - Look to add a role based filter to prevent all users from be able to subscrib (this will be useful when we get to alerts)
//             - (COMPLETED)
//          5b - Supervisor UI - See if you can have when clicking the alert that it brings you into the Teams View Tab
//             - (COMPLETED)
//          5c - Check on the Alerts again to see if there is a better way to clean up notificaiton registers, atm I'm using a randomNumber for the ID to avoid conflicts
//             - (COMPLETED)
//FIXME:    5d - UI/State - Test an Array/Multiple Agents Alerting at the same time and clean up
//       6 - Clean Up Steps
//          6a - Clean up if Agent Hands up the Call
//             - (COMPLETED)
//          6b - Clean up if Agent refreshes the browser
//             - (COMPLETED)
//          6c - What if the Supervisor Refreshes? - Specific to Agent Alert Toggle
//             - (COMPLETED)
//          6d - Found with two browsers - if the agent alerts, cancels, alerts again before the supervisor monitors (can deletes the registration)
//               it errors on the supervisors screen as the notification is already registered
//             - (COMPLETED)
//FIXME:  7 - Update README and Add Demo

//FIXME: Enhancements from a customer:
//        1 - Add the ability when the agent clicks the agent assistance button that they can add context (maybe a dropdown or free text)
//        2 - For Navient the ability to report on when the agent clicks the agent assistance button (so they can report on this)
//          2a - For Navient, if there was a drop down (similar to dispositions) the ability to report on what they selected


export default class AgentAssistancePlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    this.registerReducers(manager);

    // This is here if the Supervisor refreshes and has toggled alerts to false
    // By default alerts are enabled unless they toggle it off
    let cachedAlert = localStorage.getItem('cacheAlerts');
    if (cachedAlert === "false") {
      manager.store.dispatch(AgentAssistanceStatusAction.setAgentAssistanceStatus({ 
        enableAgentAssistanceAlerts: false
      }));
    }

    //TODO: Look to move this into a function within the Sync.js file?
    // This is here if the Agent refreshes in the middle of having Agent Assistance on
    // This will clear up the Sync Doc and delete the registered notification
    let cacheAgentAssistState = localStorage.getItem('cacheAgentAssistState');
    if (cacheAgentAssistState === "true") {
      const agentWorkerSID = manager.store.getState().flex?.worker?.worker?.sid;
      let agentArray = [];

      SyncDoc.getSyncDoc('Agent-Assistance')
      .then(doc => {
        // Confirm the Sync Doc Assistance array isn't null, as of ES6 we can use the spread syntax to clone the array
        if (doc.value.data.assistance != null) {
            agentArray = [...doc.value.data.assistance];
            // Splice/remove the Agent from the Agent Array within the Sync Doc
            console.log(`Updating Sync Doc: Agent-Assistance, agent: ${agentWorkerSID} has been REMOVED from the assistance array`);
            // Get the index of the Agent we need to remove in the array
            const removeAgentIndex = agentArray.findIndex((agent) => agent.agent_SID === agentWorkerSID);
            // Ensure we get something back, let's splice this index where the Agent is within the array
            if (removeAgentIndex > -1) {
            agentArray.splice(removeAgentIndex, 1);
            }
            // Update the Sync Doc with the new agentArray
            SyncDoc.updateSyncDoc('Agent-Assistance', agentArray);
        }
      });
    }

    // Add the Agent Assistance Button to the CallCanvas
    flex.CallCanvas.Content.add(
      <AgentAssistanceButton key="agent-assistance-button" />
    );

    // Pull back the user roles disable this component if it exists
    const myWorkerRoles = manager.store.getState().flex?.worker?.worker?.attributes?.roles;
    // Update the role names if you wish to inlude this feature for more role types
    if(myWorkerRoles.includes('admin' || 'supervisor')) {
      console.log('Access Granted to the Supervisor Agent Assistance Alerts Feature');
      // Add the Supervisor Alert Toggle Button for the Supervisors
      flex.MainHeader.Content.add(
        <SupervisorAlertButton key="agent-assistance-button" />, {
          align: 'start'
      });
    }

    // TODO: REMOVE - TESTING ONLY - Here to clear the Sync Doc
    // console.log('Clearing Sync Doc');
    // SyncDoc.clearSyncDoc('Agent-Assistance');

    // Add listener to loginHandler to refresh token when it expires
    manager.store.getState().flex.session.loginHandler.on("tokenUpdated", tokenUpdateHandler);
  } //end init

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
} //end AgentAssistancePlugin