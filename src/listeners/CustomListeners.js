import { Actions, Manager, Notifications } from '@twilio/flex-ui';
import { Actions as AgentAssistanceStatusAction, } from '../states/AgentAssistanceState';
import { SyncDoc } from '../services/Sync'

const manager = Manager.getInstance();

// Listening for supervisor to monitor the call to clean up the Agent Assistance
// Sync Doc if they monitor a call where the agent has hit the agent assistance button
// We want to clean up the agentArray so no other supervisors
Actions.addListener('afterMonitorCall', (payload) => {
    let agentArray = [];
    const agentWorkerSID = manager.store.getState().flex?.supervisor?.stickyWorker?.worker?.sid;
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
});

// Listening for agent to hang up the call so we can clear the Sync Doc
// and also reset the agentAssistance redux store/state
manager.workerClient.on("reservationCreated", reservation => {

    //Register listener for reservation wrapup event
    reservation.on('wrapup', reservation => {
            console.error(`Hangup button triggered, clear the Sync Doc`);
            manager.store.dispatch(AgentAssistanceStatusAction.setAgentAssistanceStatus({ 
                agentAssistance: false
            }));
            let agentArray = [];
            const agentWorkerSID = manager.store.getState().flex?.worker?.worker?.sid;
            const agentFN = manager.store.getState().flex?.worker?.attributes?.full_name;

            // Delete the alert if the agent toggles the Agent Assistance Mode off manually
            Notifications.registeredNotifications.delete(agentFN);

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
    });    
});