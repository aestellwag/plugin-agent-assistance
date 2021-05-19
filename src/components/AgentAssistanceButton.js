import * as React from 'react';
import { IconButton, TaskHelper, withTheme, Notifications } from '@twilio/flex-ui';
import styled from 'react-emotion';

// Used for Sync Docs
import { SyncDoc } from '../services/Sync'

// Used for the custom redux state
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions as AgentAssistanceStatusAction, } from '../states/AgentAssistanceState';

const ButtonContainer = styled('div')`
  display: flex;
  justify-content: center;
  margin-bottom: 6px;
`;

const buttonStyleActive = {
  width: '44px',
  height: '44px',
  'marginLeft': '6px',
  'marginRight': '6px',
  'color': 'limegreen',
}

const buttonStyle = {
  width: '44px',
  height: '44px',
  'marginLeft': '6px',
  'marginRight': '6px'
}

class AgentAssistanceButton extends React.Component {
  // getting props
  constructor(props) {
    super(props);
  }

  // Initial sync doc listener, will use this when calling the agentAssistanceClick
  // Pull values from props as we need to confirm we are updating the agent's sync doc
  // and adding the conference, supervisor, and coaching status
  initSyncDoc(agentWorkerSID, agentFN, conferenceSID, updateStatus) {

    // Getting the latest Sync Doc agent list and storing in an array
    // We will use this to add/remove the approprate agents and then update the Sync Doc
    let agentArray = [];
    SyncDoc.getSyncDoc('Agent-Assistance')
      .then(doc => {
        // Confirm the Sync Doc Assistance array isn't null, as of ES6 we can use the spread syntax to clone the array
        if (doc.value.data.assistance != null) {
          agentArray = [...doc.value.data.assistance];
        }
        // Checking Updated Status we pass during the agentAssistanceClick
        // to push/add the Agent to the Agent Array within the Sync Doc
        // adding their Full Name and Conference - the Supervisor will leverage these values
        if(updateStatus === 'add') {
          console.log(`Updating Sync Doc: Agent-Assistance, agent: ${agentWorkerSID} has been ADDED to the assistance array`);
          agentArray.push(
            {
              "agent_SID": agentWorkerSID,
              "agent_FullName": agentFN,
              "conference": conferenceSID
            }
          );
          // Update the Sync Doc with the new agentArray
          SyncDoc.updateSyncDoc('Agent-Assistance', agentArray);
    
        // Checking Updated Status we pass during the agentAssistanceClick 
        // to splice/remove the Agent from the Agent Array within the Sync Doc
        } else if (updateStatus === 'remove') {
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

  // On Click, if Agent Assistance is on, on click let's flip the status to false and do Sync Doc Clean up
  // If Agent Assistance is off, on click let's flip the status to true and add the Agent to the Sync Doc
  // The Supervisor's will receive updates when an agent asking for help is added or removed to know who is actively
  // looking for assistance
  agentAssistanceClick = () => {
    const { task } = this.props;
    const conference = task && task.conference;
    const conferenceSID = conference && conference.conferenceSid;
    const agentAssistance = this.props.agentAssistance;
    const myWorkerSID = this.props.myWorkerSID;
    const agentFN = this.props.agentFN;

    if (agentAssistance) {
      this.props.setAgentAssistanceStatus({ 
        agentAssistance: false
      });

      // See AgentAssistancePlugin.js for the getItem reference to the cache value if statement
      console.log('Storing agentAssistance to cache');
      localStorage.setItem('cacheAgentAssistState',false);

      // Updating the Sync Doc to remove the agent from the assistance array
      this.initSyncDoc(myWorkerSID, agentFN, conferenceSID, 'remove');

    } else {
      this.props.setAgentAssistanceStatus({ 
        agentAssistance: true
      });

      // Caching this if the browser is refreshed while the agent actively had agent assistance up
      // We will use this to clear up the Sync Doc and the Agent Alert
      // See AgentAssistancePlugin.js for the getItem reference to the cache value if statement
      console.log('Storing agentAssistance to cache');
      localStorage.setItem('cacheAgentAssistState',true);

      // Updating the Sync Doc to add the agent from the assistance array
      this.initSyncDoc(myWorkerSID, agentFN, conferenceSID, 'add');
    }
  }

  // Render the agent assistane button, change the Icon/Title based on the state of the button
  // If they are asking for assistance (agentAssistance=true), if they are not asking for assistance
  // (agentAssistance = false)
  render() {
    const agentAssistance = this.props.agentAssistance;

    const isLiveCall = TaskHelper.isLiveCall(this.props.task);

    return (
      <ButtonContainer>
        <IconButton
          icon={ agentAssistance ? 'HelpBold' : 'Help' }
          disabled={!isLiveCall}
          onClick={this.agentAssistanceClick}
          themeOverride={this.props.theme.CallCanvas.Button}
          title={ agentAssistance ? "Turn off Assistance" : "Ask for Assistance" }
          style={ agentAssistance ? buttonStyleActive : buttonStyle }
        />
      </ButtonContainer>
    );
  }
}

// Getting the agent's SID so we can use it later
const mapStateToProps = (state) => {
  const myWorkerSID = state?.flex?.worker?.worker?.sid;
  const agentFN = state?.flex?.worker?.attributes?.full_name;

  // Also pulling back the states from the redux store as we will use those later
  // to manipulate the agent assistance button
  const customReduxStore = state?.['agent-assistance'].agentassistance;
  const agentAssistance = customReduxStore.agentAssistance;

  return {
    myWorkerSID,
    agentAssistance,
    agentFN
  };
};

// Mapping dispatch to props as I will leverage the setAgentAssistanceStatus
// to change the properties on the redux store, referenced above with this.props.setAgentAssistanceStatus
const mapDispatchToProps = (dispatch) => ({
  setAgentAssistanceStatus: bindActionCreators(AgentAssistanceStatusAction.setAgentAssistanceStatus, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(AgentAssistanceButton));