import { SYNC_CLIENT } from "../AgentAssistancePlugin";

class SyncDocClass {

	constructor() {
	}

	// Getting the Sync Document
	getSyncDoc(syncDocName) {
		return new Promise(function (resolve) {
			SYNC_CLIENT
				.document(syncDocName)
				.then(doc => {
					resolve(doc)
				})
		})
	}
	
	// This is where we update the Sync Document we pass in the syncDocName we are updating, and adding the agent
	// to the assistance array
	updateSyncDoc(syncDocName, agentObject) {
		SYNC_CLIENT
			.document(syncDocName)
			.then(doc => {
				doc.update({
					data: { 
						assistance: agentObject
					}
				});
				return new Promise(function (resolve) {
					SYNC_CLIENT
						.document(syncDocName)
						.then(doc => {
							resolve(doc)
						})
				})
			})
	}

	// This will be called when we are tearing down the call to clean up the Sync Doc
	clearSyncDoc(syncDocName) {
		SYNC_CLIENT
			.document(syncDocName)
			.then(doc => {
				doc.update({
					data: { 
						assistance: []
					}
				});
			})
	}

	// Called when we wish to close/unsubscribe from a specific sync document
	closeSyncDoc(syncDocName) {	
		SYNC_CLIENT
		.document(syncDocName)
		.then(doc => {
			doc.close();
		})
	}
}

export const SyncDoc = new SyncDocClass();
