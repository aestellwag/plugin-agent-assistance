import React from 'react';
import { FlexPlugin } from 'flex-plugin';
import { Manager, VERSION } from '@twilio/flex-ui';

// Leverage for the Sync Documents used for Coach Alerts across user sessions
import { SyncClient } from "twilio-sync";
// Used for Sync Docs
import { SyncDoc } from './services/Sync'

// import the reducers
import reducers, { namespace } from './states';
// import the custom listeners
//TODO: Clean up the listner for your user cases
//import './listeners/CustomListeners';

// Agent Assistance Button for the Agent's view
import AgentAssistanceButton from './components/AgentAssistanceButton';
// Teams View component based on Agent Assistance Status
// TODO: Create the supervisor side :) 
//import TeamsViewAAPanel from './components/TeamsViewAAPanel';

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

//FIXME: Great progress, I was able to get the AgentAssistanceButton to update a named Sync Doc called "Agent-Assistance" 
//       with the Agent depending on if they click the button for assistance or not.  See AgentAssistanceButton.js > InitSyncDoc() function.  
//       This will pull down the latest agentArray and push/add the agent to the array when asking for help, and splice/remove the agent
//       from the array when they turn off agent assistance

//TODO:  What's next to build?
//       1 - Add another array with agent's full name to the Sync Doc updates and conference SID
//          (COMPLETED)
//       2 - Supervisor Side:
//          2a - Enable Sync Doc Subscriptions
//                a - Look to add a role based filter to prevent all users from be able to subscrib (this will be useful when we get to alerts)
//          2b - Push Alert that shows when Agent clicks the Agent Assistance button
//                a - (Extra Credit) See if you can have when clicking the alert that it brings you into the Teams View Tab
//       3 - Update Sync Doc when Supervisor begins to Monitor (IE Turn off Agent Assistance)
//          3a - Look to get it to update the Agent's State for the Agent Assistance Button
//       4 - Add changes to Teams View Canvas based on WHO is actively asking for Agent Assistance (IE highlight red?)
//       5 - UI Extras
//          5a - Supervisor UI - See if you can have when clicking the alert that it brings you into the Teams View Tab
//          5b - Agent UI - Look to alert Agent that X Supervisor is monitoring the call or maybe we just devert to the Barge/Coach plugin?
//       6 - Clean Up Steps
//          6a - Clean up if Agent Hands up the Call
//          6b - Clean up if Agent refreshs the browser
//          6c - What if the Supervisor Refreshes?  (Shouldn't matter but test for it)


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

    // Add the Agent Assistance Button to the CallCanvas
    flex.CallCanvas.Content.add(
      <AgentAssistanceButton key="agent-assistance-button" />
    );
  

    //TODO: REMOVE - TESTING ONLY - Here to clear the Sync Doc
    // console.log('Clearing Sync Doc');
    // SyncDoc.clearSyncDoc('Agent-Assistance');

    //TODO: REMOVE - TESTING ONLY - Adding this temporarily so I can track Doc Updates for testing
    //      Need to add this so only supervisors subscribe to the doc updates
    //      Look for a role based flag to enable this for only supervisors

    let subscribedToDoc = false;
    if(!subscribedToDoc) {
      SyncDoc.getSyncDoc('Agent-Assistance')
        .then(doc => {
          console.log(doc.value);
          // We are subscribing to Sync Doc updates here and logging anytime that happens
          doc.on("updated", updatedDoc => {
            console.log("Sync Doc Update Recieved: ", updatedDoc.value);
          })
      });
      subscribedToDoc = true;
    }

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
