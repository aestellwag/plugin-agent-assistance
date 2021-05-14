import { combineReducers } from 'redux';
import { reduce as AgentAssistanceReducer } from './AgentAssistanceState';

// Register your redux store under a unique namespace
export const namespace = 'agent-assistance';

// Combine the reducers
export default combineReducers({
  agentassistance: AgentAssistanceReducer
});
