if (chrome != null) wb = chrome;
else if (browser != null) wb = browser; // firefox

var faustTab;
var designToolTab;

wb.tabs.onUpdated.addListener(onTabUpdated);
wb.tabs.onCreated.addListener(onTabCreated);

//wb.runtime.onInstalled.addListener(onInstalled);
//wb.action.onClicked.addListener(onClicked);

//wb.tabs.onActivated.addListener(onTabActivated);
//wb.tabs.onRemoved.addListener(onTabRemoved);


function onTabUpdated(tabId, changeInfo, tab) {
	//console.log("onTabUpdated:",tabId,changeInfo,tab);
	if (tab.status == "complete" && tab.url == "https://faustide.grame.fr/" ) {
		faustTab = tab;
		console.log("FAUST detected");
	}
	else if (tab.status == "complete" && tab.url == "https://manicken.github.io/" ) {
		designToolTab = tab;
		console.log("Design Tool++ detected");
	}
}
function onTabCreated(tab) {
	console.log("onTabCreated:",tab);
	if (tab.openerTabId == faustTab.id && tab.status == "complete" && tab.title == "" && tab.url == "") {
		console.log("FAUST opened a download file tab");
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
				console.log("Frame " + frameId + " result:", result);
				if (frameId == "0") {
					wb.scripting.executeScript({
						target: {tabId:designToolTab.id},
						args: [result],
						func: function(result) {
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






