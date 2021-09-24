import * as React from 'react';
import { IconButton, withTheme, Notifications, NotificationType, Actions } from '@twilio/flex-ui';
import styled from 'react-emotion';
import Switch from '@material-ui/core/Switch';

// Used for Sync Docs
import { SyncDoc } from '../services/Sync'

// Used for the custom redux state
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions as AgentAssistanceStatusAction, } from '../states/AgentAssistanceState';

const ButtonContainer = styled('div')`
  display: flex;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  align-items: center;
  text-align: center;
`;

const buttonStyleActive = {
  'marginLeft': '6px',
  'marginRight': '6px',
  'color': 'forestgreen',
}

const buttonStyle = {
  'marginLeft': '6px',
  'marginRight': '6px'
}

class SupervisorAlertButton extends React.Component {
  // getting props

  // Use to validate if we have subscribed to sync updates or not
  #syncSubscribed = false;

  constructor(props) {
    super(props);
  }

  // Whenever we get a Sync Doc update after subscribing, let's update the redux store/state
  // with the new agent array
  updateStateAndSync(updatedSyncDoc) {
    const enableAgentAssistanceAlerts = this.props.enableAgentAssistanceAlerts;
    this.props.setAgentAssistanceStatus({ 
      agentAssistanceArray: updatedSyncDoc.data.assistance
    });
    // Confirm Alerts are enabled
    if(enableAgentAssistanceAlerts) {
      // Call the alert check function to alert for any new agents needing assistance
      this.alertSupervisorsCheck(updatedSyncDoc);
    }
    //TODO: this should be a loop, for testing just doing a simple find index
    let arrayIndexCheck = updatedSyncDoc.data.assistance.findIndex((agent) => agent.agent_FullName != "");
    // We are updating the task color based on if the agent's task sid exists and doing clean up
    if (arrayIndexCheck > -1) {
      // Pulling the agent's taskSID
      let agentTaskSID = `${updatedSyncDoc.data.assistance[arrayIndexCheck].taskSID}`;
      Twilio.Flex.DefaultTaskChannels.Call.colors.main = (task) => {
        if (task.sid == agentTaskSID) {
          return "red";
        } else if (task.status == "assigned") {
          return "#1976d2";
        } else if (task.status == "wrapping") {
          return "#a0a8bd";
        } else {
          return "#1976d2";
        }
      };
    } else {
      Twilio.Flex.DefaultTaskChannels.Call.colors.main = (task) => {
        if (task.status == "assigned") {
          return "#1976d2";
        } else if (task.status == "wrapping") {
          return "#a0a8bd";
        } else {
          return "#1976d2";
        }
      };
    }
  } 

  // Used to navigate to the Teams View if the Supervisor clicks the Agent Assistance Alert
  navigateToTeamsView() {
    Actions.invokeAction("NavigateToView", {viewName: "teams"});
  }

  // When this is called, we will do checks to validate any new agents that need assistance
  alertSupervisorsCheck() {
    let agentAssistanceArray = this.props.agentAssistanceArray;
    //TODO: this should be a loop, for testing just doing a simple find index
    let arrayIndexCheck = agentAssistanceArray.findIndex((agent) => agent.agent_FullName != "");

    //TODO: FOR TESTING - Remove the below console.error when done
    console.error(`Array Index Check = ${arrayIndexCheck}`);
    console.error(`agentAssistanceArray = ${agentAssistanceArray}`);

    if (arrayIndexCheck > -1) {

       //TODO: FOR TESTING - Remove the below console.error when done
      console.error(`agentAssistanceArray.agent_FullName = ${agentAssistanceArray[arrayIndexCheck].agent_FullName}`);

      // Storing the Agent's Full Name
      let agentFN = `${agentAssistanceArray[arrayIndexCheck].agent_FullName}`;

      //TODO: FOR TESTING - Remove the below console.error when done
      console.error(`AlertID = ${agentFN}`);
      let alert = `${agentFN} is seeking assistance.`;

      // Registering the notification with the ID being the Agent's full name and alert string as content
      Notifications.registerNotification({
        id: agentFN,
        closeButton: true,
        content: alert,
        type: NotificationType.warning,
        timeout: 8000,
        actions: [
          <button type="button" onClick={(event, notification) => {this.navigateToTeamsView()}}>Navigate to Team's View</button>
        ]
      });
      // Fire off the Notification we just registered
      Notifications.showNotification(agentFN);
      // Delete the alert, the alert will still show in the UI but this gives the ability
      // if the agent happens to toggle assistance off/on again, that a new alert will pop up
      Notifications.registeredNotifications.delete(agentFN);
    }
  }

  agentAssistanceToggle = () => {
    const enableAgentAssistanceAlerts = this.props.enableAgentAssistanceAlerts;

    if (enableAgentAssistanceAlerts) {
      this.props.setAgentAssistanceStatus({ 
        enableAgentAssistanceAlerts: false
      });
      // If the supervisor disabled the agent assistance alerts, let's cache this
      // to ensure it is set to false if a browser refresh happens
      // See AgentAssistancePlugin.js for the getItem reference to the cache value if statement
      console.log('Storing enableAgentAssistanceAlerts to cache');
      localStorage.setItem('cacheAlerts',false);
    } else {
      this.props.setAgentAssistanceStatus({ 
        enableAgentAssistanceAlerts: true
      });
      // See AgentAssistancePlugin.js for the getItem reference to the cache value if statement
      console.log('Storing enableAgentAssistanceAlerts to cache');
      localStorage.setItem('cacheAlerts',true);
    }
  }

  syncUpdates() {

    if (this.#syncSubscribed != true) {
      this.#syncSubscribed = true;

      const enableAgentAssistanceAlerts = this.props.enableAgentAssistanceAlerts;
      const supervisorSubscribed = this.props.supervisorSubscribed;
      
      if(enableAgentAssistanceAlerts && !supervisorSubscribed) {
        SyncDoc.getSyncDoc('Agent-Assistance')
        .then(doc => {
          console.log(doc.value);

          // Update the redux store/state with the latest array of agents needing assistance
          this.updateStateAndSync(doc.value);

          // We are subscribing to Sync Doc updates here and logging anytime that happens
          doc.on("updated", updatedDoc => {
            console.log("Sync Doc Update Recieved: ", updatedDoc.value);

            // Every time we get an update on the Sync Doc, update the redux store/state
            // with the latest array of agents needing assistance
            this.updateStateAndSync(updatedDoc.value);
          })
        })
        // Setting supervisorSubscribed to true so we don't attempt more sync update/subscribes
        this.props.setAgentAssistanceStatus({ 
          supervisorSubscribed: true
        });
      }
    }  
  }

  // Render the Supervisor Agent Assistance Toggle, this gives the supervisor
  // the option to enable or disable Agent Assistance Alerts
  render() {
    
    const enableAgentAssistanceAlerts = this.props.enableAgentAssistanceAlerts;
    
    this.syncUpdates();

    return (
      <ButtonContainer>
        <IconButton
          icon={ enableAgentAssistanceAlerts ? 'BellBold' : 'Bell' }
          onClick={this.agentAssistanceToggle}
          themeOverride={this.props.theme.CallCanvas.Button}
          title={ enableAgentAssistanceAlerts ? "Disable Agent Assistance Alerts" : "Enable Agent Assistance Alerts" }
          style={ enableAgentAssistanceAlerts ? buttonStyleActive : buttonStyle }
        />
        { enableAgentAssistanceAlerts ? "Agent Assistance Alerts Enabled" : "Agent Assistance Alerts Disabled" }
      </ButtonContainer>
    );
  }
}

// Getting the agent's SID so we can use it later
const mapStateToProps = (state) => {
  // Also pulling back the states from the redux store as we will use those later
  // to manipulate the agent assistance button
  const customReduxStore = state?.['agent-assistance'].agentassistance;
  const agentAssistanceArray = customReduxStore.agentAssistanceArray;
  const enableAgentAssistanceAlerts = customReduxStore.enableAgentAssistanceAlerts;
  const supervisorSubscribed = customReduxStore.supervisorSubscribed;

  return {
    agentAssistanceArray,
    enableAgentAssistanceAlerts,
    supervisorSubscribed
  };
};

// Mapping dispatch to props as I will leverage the setAgentAssistanceStatus
// to change the properties on the redux store, referenced above with this.props.setAgentAssistanceStatus
const mapDispatchToProps = (dispatch) => ({
  setAgentAssistanceStatus: bindActionCreators(AgentAssistanceStatusAction.setAgentAssistanceStatus, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(SupervisorAlertButton));