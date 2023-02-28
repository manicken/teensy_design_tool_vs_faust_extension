if (chrome != null) wb = chrome;
else if (browser != null) wb = browser; // firefox

var FAUST_IDE_URL = "https://faustide.grame.fr/";
var faustTab;
var designToolTab;

wb.tabs.onUpdated.addListener(onTabUpdated);
wb.tabs.onCreated.addListener(onTabCreated);

//wb.runtime.onInstalled.addListener(onInstalled);
//wb.action.onClicked.addListener(onClicked);

//wb.tabs.onActivated.addListener(onTabActivated);
//wb.tabs.onRemoved.addListener(onTabRemoved);
/*wb.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    console.log(request, sender);
    sendResponse({farewell: "goodbye"});
  }
);*/
var designToolFaustData = {};
var faustOpenOnce = false;

wb.runtime.onMessageExternal.addListener( function(request, sender, sendResponse) {
	if (sender.tab.title == "Audio System Design Tool++ for Teensy Audio Library") {
		designToolTab = sender.tab;
		designToolFaustData = request;
		
		console.log(request, sender);
		faustOpenOnce = false;
		wb.tabs.create({ url: FAUST_IDE_URL });
		sendResponse("FAUST opened");
	}
    
  }
);


function onTabUpdated(tabId, changeInfo, tab) {
	//console.log("onTabUpdated:",tabId,changeInfo,tab);
	if (tab.status == "complete" && tab.url == FAUST_IDE_URL ) {
		faustTab = tab;
		console.log("FAUST detected");
		
		wb.scripting.executeScript({
			target: {tabId:faustTab.id},
			args: [designToolFaustData],
			func: function(designToolFaustData) {
				// this script runs in the FAUST IDE context
				if (designToolFaustData.projectFiles != null)
					localStorage.setItem("faust_editor_project", JSON.stringify(designToolFaustData.projectFiles));
				if (designToolFaustData.projectParams != null)
					localStorage.setItem("faust_editor_params", designToolFaustData.projectParams);
				
				//console.log(extId);
				//document.getElementById("faustLinkExtId").innerHTML = extId;
				//faustLinkExtId = extId;
			}
		}).then( ()=>{ if (faustOpenOnce == false) {faustOpenOnce = true; chrome.tabs.reload(faustTab.id);}});
	}
	else if (tab.status == "complete" && tab.title == "Audio System Design Tool++ for Teensy Audio Library") { //"https://manicken.github.io/" ) {
		designToolTab = tab;
		console.log("Design Tool++ detected");
		wb.scripting.executeScript({
			target: {tabId:designToolTab.id},
			args: [wb.runtime.id],
			func: function(extId) {
				// this script runs in the Design Tool++ context
				console.log(extId);
				document.getElementById("faustLinkExtId").innerHTML = extId;
				//faustLinkExtId = extId;
			}
		});
	}
}
function onTabCreated(tab) {
	if (faustTab == null) return;
	
	//console.log("onTabCreated:",tab);
	if (tab.openerTabId == faustTab.id && tab.status == "complete" && tab.title == "" && tab.url == "") {
		//console.log("FAUST opened a download file tab");
		wb.tabs.remove(tab.id);
		wb.scripting.executeScript({
			target: {tabId:faustTab.id},
			func: function() {
				var retVar = {
					url:document.getElementById("a-export-download").getAttribute("href"),
					projectFiles:localStorage.getItem("faust_editor_project"),
					projectParams:localStorage.getItem("faust_editor_params"),
					inputs:document.getElementById("dsp-ui-detail-inputs").innerHTML,
					outputs:document.getElementById("dsp-ui-detail-outputs").innerHTML,
					params:document.getElementById("dsp-ui-detail-params").innerHTML
				};
				//console.log(retVar);
				return retVar;
			}
		}).then(injectionResults => {
			for (const {frameId, result} of injectionResults) {
				//console.log("Frame " + frameId + " result:", result);
				if (frameId == "0") {
					wb.scripting.executeScript({
						target: {tabId:designToolTab.id},
						args: [result],
						func: function(result) {
							// this script runs in the Design Tool++ context
							console.log(result);
						}
					});
				}
			}
		});
	}
}

function onInstalled(details) {
	console.log("Extension installed or updated!", details);
}
function onClicked(tab) {
	console.log("Extension icon clicked2!");
}

function onTabActivated(activeInfo) {
	console.log("onTabActivated:",activeInfo);
}

function onTabRemoved(tab, removeInfo) {
	console.log("onTabRemoved:",tab,removeInfo);
}


console.log("extension started");





