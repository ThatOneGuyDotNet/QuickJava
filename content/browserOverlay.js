//QuickJava by Doug Greene 
//Some style work, Cookies, Animated Images and BrowserReload added by Dave Delisle
//See ReadMe.txt for version history and credits

if(!thatoneguydotnet) var thatoneguydotnet={};
if(!thatoneguydotnet.QuickJava) thatoneguydotnet.QuickJava={};

thatoneguydotnet.QuickJava={
	
onLoad: function(evt)
	{
		this.errMsg                         = '';
		this.debugMode                      = false;
		this.alertPluginNames               = false;
		this.alertPluginNamesOnMatch        = false;
                this.curVersion                     = '';
		this.firstInstallUrl                = '';
		this.newVersionUrl                  = '';

		try
		{			
			this.qj_Prefix_Pref         = 'thatoneguydotnet.QuickJava';
			this.Plugin_TopicStr        = this.qj_Prefix_Pref + ".plugins.refreshIcons";
			this.qj_Prefix_Pref_Hide    = this.qj_Prefix_Pref + '.hidestatus.';
			this.qj_Prefix_Pref_RegEx   = this.qj_Prefix_Pref + '.regex.';
			this.qj_Option_Pref         = 'thatoneguydotnet_quickjava_pref';
			this.qj_Option_Pref_RegEx   = this.qj_Option_Pref + '_regex_';
			this.qj_Prefix              = 'QuickJava_';
			this.qj_Prefix_Sb           = this.qj_Prefix + 'StatusIcon_';
			this.qj_Prefix_Sb_Container = this.qj_Prefix_Sb + 'Container_';
			this.qj_Prefix_Tb           = this.qj_Prefix + 'ToolbarIcon_';
			this.qj_Prefix_Tb_Container = this.qj_Prefix_Tb + 'Container_';
			
			this.qj_JS                  = 'JavaScript';
			this.qj_J                   = 'Java';
			this.qj_F                   = 'Flash';
			this.qj_SL                  = 'Silverlight';
			this.qj_AI                  = 'AnimatedImage';
			this.qj_C                   = 'Cookies';
			this.qj_I                   = 'Images';
			this.qj_CS                  = 'CSS';
			this.qj_P                   = 'Proxy';
			
			this.Plugin = Components.classes["@mozilla.org/observer-service;1"]
			.getService (Components.interfaces.nsIObserverService);
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"].
			getService(Components.interfaces.nsIPrefBranch);

			//Initialize pref monitors			
			this.onLoadDetails();

			//First startup routine
			if (Components.classes["@mozilla.org/appshell/window-mediator;1"]
			      .getService(Components.interfaces.nsIWindowMediator)
			      .getEnumerator("").getNext() == window)
			{
                        	this.firstStartup();
			}

			//Update all icons
			this.updateIcons();
		} catch (e) { this.handleError(e); }
		if (this.debugMode && this.errMsg != '') { alert(this.errMsg); this.errMsg = ''; }
	},
	
handleError: function(e)
	{
		this.errMsg = "An exception occurred in the QuickJava script. Error name: " + e.name
		+ ".\n\n Error description: " + e.description
		+ ".\n\n Error number: " + e.number
		+ ".\n\n Error message: " + e.message;
	},
firstStartup: function(e)
        {
                this.curVersion = this.prefs.getCharPref("thatoneguydotnet.QuickJava.curVersion");
		Components.utils.import("resource://gre/modules/AddonManager.jsm");
		    AddonManager.getAddonByID("{E6C1199F-E687-42da-8C24-E7770CC3AE66}", function(addon) { thatoneguydotnet.QuickJava.versionCheck(addon);});

        },
versionCheck: function(addon)
	{
		if (this.curVersion != addon.version)
		{
			if (this.curVersion == '' && this.firstInstallUrl != '')
			{
				gBrowser.selectedTab = gBrowser.addTab(this.firstInstallUrl);
			}
			else if (this.newVersionUrl != '')
			{
				gBrowser.selectedTab = gBrowser.addTab(this.newVersionUrl);
			}
			this.curVersion = addon.version;
			this.prefs.setCharPref("thatoneguydotnet.QuickJava.curVersion", this.curVersion)
		}
	},	
getProxyOnValue: function()
	{
		var onValue             = this.prefs.getIntPref("thatoneguydotnet.QuickJava.priorvalue.Proxy");
		var curValue            = this.prefs.getIntPref("network.proxy.type");
		var updateStoredValue   = false;
		
		//If not off, set the new default on value to current value
		if (curValue != 0 && curValue != onValue)
		{
			onValue = curValue;
			updateStoredValue = true;
		}
		else if (curValue == 0 && onValue < 1)
		{
			
			//If we were never able to get a proxy on/off value, then use the 'system default'
			onValue = 5;
			updateStoredValue = true;
		}
		
		
		if (updateStoredValue) { 
			this.prefs.setIntPref("thatoneguydotnet.QuickJava.priorvalue.Proxy", onValue); 
		}
		return onValue;
	},
	
getCookieOnValue: function()
	{
		var onValue             = this.prefs.getIntPref("thatoneguydotnet.QuickJava.priorvalue.Cookie");
		var curValue            = this.prefs.getIntPref("network.cookie.cookieBehavior");
		var updateStoredValue   = false;
		
		//If not off, set the new default on value to current value
		if (curValue != 2 && curValue != onValue)
		{
			onValue = curValue;
			updateStoredValue = true;
		}
		else if (curValue == 2 && onValue > 1)
		{
			
			//If we were never able to get a cookie on/off value, then use the 'system default'
			onValue = 0;
			updateStoredValue = true;
		}
		
		
		if (updateStoredValue) { 
			this.prefs.setIntPref("thatoneguydotnet.QuickJava.priorvalue.Cookie", onValue); 
		}
		return onValue;
	},
	
click: function(event)
	{
		if (this.debugMode && this.errMsg != '') { alert(this.errMsg); this.errMsg = ''; }
		try
		{
			// event.button == 2 // right
			if (!event.button || event.button == 0) {
				this.toggleEnabled(this.GetTypeFromId(event.currentTarget.id));
			}
			if (event.button == 1) {
				this.toggleEnabled(this.qj_I);
				this.toggleEnabled(this.qj_J);
				this.toggleEnabled(this.qj_JS);
				this.toggleEnabled(this.qj_F);
				this.toggleEnabled(this.qj_SL);
				this.toggleEnabled(this.qj_AI);
				this.toggleEnabled(this.qj_C);
				this.toggleEnabled(this.qj_CS);
			}
			if (event.button != 0 && event.button != 1) {
				this.updateIcons();
			}
		} catch(e) { this.handleError(e); }
		if (this.debugMode && this.errMsg != '') { alert(this.errMsg); this.errMsg = ''; }
		return true;   	    
	},
	
reset_pref_click: function(event, whichReset)
	{
		if (this.debugMode && this.errMsg != '') { alert(this.errMsg); this.errMsg = ''; }
		try
		{
			var optionField = document.getElementById(this.qj_Option_Pref_RegEx + whichReset);
			if (optionField)
			{
				optionField.value = optionField.defaultValue;
			}
		} catch(e) { this.handleError(e); }
		if (this.debugMode && this.errMsg != '') { alert(this.errMsg); this.errMsg = ''; }
		return true;   	    
	},
	
GetTypeFromId: function(id)
	{
		if (id == this.qj_Prefix_Sb_Container + this.qj_JS || id == this.qj_Prefix_Tb_Container + this.qj_JS) { return this.qj_JS; }
		if (id == this.qj_Prefix_Sb_Container + this.qj_J  || id == this.qj_Prefix_Tb_Container + this.qj_J)  { return this.qj_J; }
		if (id == this.qj_Prefix_Sb_Container + this.qj_F  || id == this.qj_Prefix_Tb_Container + this.qj_F)  { return this.qj_F; }
		if (id == this.qj_Prefix_Sb_Container + this.qj_SL || id == this.qj_Prefix_Tb_Container + this.qj_SL) { return this.qj_SL; }
		if (id == this.qj_Prefix_Sb_Container + this.qj_AI || id == this.qj_Prefix_Tb_Container + this.qj_AI) { return this.qj_AI; }
		if (id == this.qj_Prefix_Sb_Container + this.qj_C  || id == this.qj_Prefix_Tb_Container + this.qj_C)  { return this.qj_C; }
		if (id == this.qj_Prefix_Sb_Container + this.qj_I  || id == this.qj_Prefix_Tb_Container + this.qj_I)  { return this.qj_I; }
		if (id == this.qj_Prefix_Sb_Container + this.qj_CS || id == this.qj_Prefix_Tb_Container + this.qj_CS) { return this.qj_CS; }
		if (id == this.qj_Prefix_Sb_Container + this.qj_P  || id == this.qj_Prefix_Tb_Container + this.qj_P)  { return this.qj_P; }
	},
	
updateIcons: function()
	{
		//Set the icons
		this.setIcon(this.qj_JS, this.isEnabled(this.qj_JS));
		this.setIcon(this.qj_J,  this.isEnabled(this.qj_J));
		this.setIcon(this.qj_F,  this.isEnabled(this.qj_F));
		this.setIcon(this.qj_SL, this.isEnabled(this.qj_SL));
		this.setIcon(this.qj_AI, this.isEnabled(this.qj_AI));
		this.setIcon(this.qj_C,  this.isEnabled(this.qj_C));
		this.setIcon(this.qj_I,  this.isEnabled(this.qj_I));
		this.setIcon(this.qj_CS, this.isEnabled(this.qj_CS));
		this.setIcon(this.qj_P,  this.isEnabled(this.qj_P));
		
		return true;
	},
	
GetRegEx: function(whichIcon)
	{
		switch (whichIcon)
		{
			case this.qj_J:
				return new RegExp(this.prefs.getCharPref("thatoneguydotnet.QuickJava.regex.Java"), 'i');
				break;
			case this.qj_F:
				return new RegExp(this.prefs.getCharPref("thatoneguydotnet.QuickJava.regex.Flash"), 'i');
				break;
			case this.qj_SL:
				return new RegExp(this.prefs.getCharPref("thatoneguydotnet.QuickJava.regex.Silverlight"), 'i');
				break;
		}
	},
	
setIcon: function(whichIcon, onOff)
	{
		var isHidden      = this.prefs.getBoolPref(this.qj_Prefix_Pref_Hide + whichIcon);
		var statusNumber  = (onOff == 1 ? "1" : (onOff == 0 ? "0" : "-2"));
		var chkBx         = document.getElementById(this.qj_Prefix_Tb + whichIcon);
		if (chkBx) { chkBx.setAttribute("status", statusNumber); }
		
		var icon = document.getElementById(this.qj_Prefix_Sb + whichIcon);
		if (icon) { icon.setAttribute("status", isHidden ? "-1" : statusNumber); }
		
		var container = document.getElementById(this.qj_Prefix_Sb_Container + whichIcon);
		if (container ) { container.setAttribute("status", isHidden ? "-1" : statusNumber); }
	},
	
	// 
GetPluginTags: function() {
	if (!("nsIPluginHost" in Components.interfaces)) return false;
	var phs = Components.classes["@mozilla.org/plugin/host;1"]
	.getService(Components.interfaces.nsIPluginHost);
	var plugins = phs.getPluginTags({ });
	return plugins;
},
	
	// Sets plugin enabled status of plugin(s), whose name matches on aRegEx,
	// to aValue. aName is used for the "not found" message and is optional
toggleEnabled: function(whichIcon) {
	var setEnabled = !this.isEnabled(whichIcon);
	if (whichIcon == this.qj_JS)
	{
		this.prefs.setBoolPref("javascript.enabled", setEnabled);
	}
	else if (whichIcon == this.qj_AI)
	{
		this.prefs.setCharPref("image.animation_mode", (setEnabled ? "normal" : "none"));
	}
	else if (whichIcon == this.qj_C)
	{
		var onValueCookies = this.getCookieOnValue();
		this.prefs.setIntPref("network.cookie.cookieBehavior", (setEnabled ? onValueCookies : "2"));
	}
	else if (whichIcon == this.qj_I)
	{
		this.prefs.setIntPref("permissions.default.image", (setEnabled ? "1" : "2"));
	}
	else if (whichIcon == this.qj_CS)
	{
		this.setStyleDisabledExtended(!setEnabled)
	}
	else if (whichIcon == this.qj_P)
	{
		var onValue = this.getProxyOnValue();
		this.prefs.setIntPref("network.proxy.type", (setEnabled ? onValue : "0"));
	}
	else
	{
		var aRegEx = this.GetRegEx(whichIcon);
		if (!aRegEx) { if (this.debugMode) { alert('Invalid toggleEnabled: ' + whichIcon); } return; }
		var plugins = this.GetPluginTags();
		if (!plugins) return;
		var found = false;
		for (var i = 0; i < plugins.length; i++) {
			if (this.alertPluginNames) { alert(plugins[i].name);}
			if (plugins[i].name.match(aRegEx)) {
				if (this.alertPluginNamesOnMatch) { alert(plugins[i].name);}
				if ("enabledState" in plugins[i])
				{
				        plugins[i].enabledState = (setEnabled ? Ci.nsIPluginTag.STATE_ENABLED : Ci.nsIPluginTag.STATE_DISABLED);
//				        if (!setEnabled && this.prefs.getBoolPref("thatoneguydotnet.QuickJava.disabledState.ClickToPlay")) { 
//						plugins[i].enabledState = Ci.nsIPluginTag.STATE_CLICKTOPLAY;
//					}
				}
				else
				{
					plugins[i].disabled = !(setEnabled);
				}
				found = true;
				this.Plugin.notifyObservers(this, this.Plugin_TopicStr,whichIcon);
			}
		}
		this.alertPluginNames = false;
		if (!found) {
			var wm = Components.classes['@mozilla.org/appshell/window-mediator;1']
			.getService(Components.interfaces.nsIWindowMediator);
			var window = wm.getMostRecentWindow(null);
			msgAlert(window, "No " + aName + " plugin found!");
		}
	}
	this.updateIcons();
        if (this.prefs.getBoolPref("thatoneguydotnet.QuickJava.actions.Reload"))
        {
            BrowserReload();
        }
},
	
	
setStyleDisabledExtended: function(turnOff) 
	{
		if (turnOff)
		{
			if ("gPageStyleMenu" in window)
			{
				gPageStyleMenu.disableStyle();
			}
			else
			{
				setStyleDisabled(true);
			}
		}
		else
		{
			if ("gPageStyleMenu" in window)
			{
				gPageStyleMenu.switchStyleSheet('');
			}
			else
			{
				stylesheetSwitchAll(window.content, '');
				setStyleDisabled(false);
			}
		}
	},
	
byId: function(i) {
	return window.document.getElementById(i);
},
	
openTab: function(url, focusTab) {
	var tBrowser = top.document.getElementById("content");
	var tab = tBrowser.addTab(myUrl);
	if (focusTab) {
		tBrowser.selectedTab = tab;
	}
},
	
showOptions: function()
	{
		window.openDialog("chrome://quickjava/content/options.xul", "", "chrome,toolbar");
	},
	
	// Returns plugin enabled status of plugin(s), whose name matches on aRegEx
isEnabled: function(whichIcon) {
	if (whichIcon == this.qj_JS) { return this.prefs.getBoolPref("javascript.enabled"); }
	if (whichIcon == this.qj_AI) { return (this.prefs.getCharPref("image.animation_mode") == "normal"); }
	
	if (whichIcon == this.qj_C)  { return (this.prefs.getIntPref("network.cookie.cookieBehavior") != 2); }
	
	if (whichIcon == this.qj_I)  { return (this.prefs.getIntPref("permissions.default.image") == 1); }
	if (whichIcon == this.qj_CS) { return !(getMarkupDocumentViewer().authorStyleDisabled); }
	if (whichIcon == this.qj_P)  { return (this.prefs.getIntPref("network.proxy.type") != 0); }
	
	var aRegEx = this.GetRegEx(whichIcon);
	if (!aRegEx || ''.match(aRegEx)) { return -1; }
	
	var plugins = this.GetPluginTags();
	if (!plugins) return false;
	for (var i = 0; i < plugins.length; i++) {
		if (plugins[i].name.match(aRegEx))
		{
 			if ("enabledState" in plugins[i])
			{
				
			        if (plugins[i].enabledState == Ci.nsIPluginTag.STATE_ENABLED) { return 1; }
			}
			else
			{
				if (!plugins[i].disabled) { return 1; }
			}
		}
	}
	return 0;
},
	
onLoadDetails: function(evt)
	{
		this.PluginObserver = 
		{
		register: function()
			{
				this._branch = Components.classes["@mozilla.org/observer-service;1"]
				.getService (Components.interfaces.nsIObserverService);
				this._branch.addObserver(this, this.QuickJavaObject.Plugin_TopicStr, false);
			},
			
		unregister: function()
			{
				if(!this._branch) return;
				this._branch.removeObserver(this, this.QuickJavaObject.Plugin_TopicStr);
			},
			
		observe: function(aSubject, aTopic, aData)
			{
				if(aTopic != this.QuickJavaObject.Plugin_TopicStr) return;
				// aData is the name of the pref changing
				thatoneguydotnet.QuickJava.updateIcons();
			}
		};
		this.PluginObserver.QuickJavaObject = this;
		
		this.PrefObserver =
		{
		register: function()
			{
				var observingPrefsActive = false;
				var prefService = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch2);
				this._branch = prefService.QueryInterface(Components.interfaces.nsIPrefBranch2);
				this._branch.addObserver("", this, false);
			},
			
		unregister: function()
			{
				if(!this._branch) return;
				this._branch.removeObserver("", this);
			},
			
		observe: function(aSubject, aTopic, aData)
			{
				if(aTopic != "nsPref:changed") return;
				// aSubject is the nsIPrefBranch we're observing
				// aData is the name of the pref that's been changed (relative to aSubject)
				if (aData ==  "javascript.enabled" || aData == "permissions.default.image" || aData == "network.proxy.type"
						|| aData == "network.cookie.cookieBehavior" || aData == "image.animation_mode"
						|| (aData.match("^"+this.QuickJavaObject.qj_Prefix_Pref)==this.QuickJavaObject.qj_Prefix_Pref))
				{
					thatoneguydotnet.QuickJava.updateIcons(); 
				}
			}
		};
		this.PrefObserver.QuickJavaObject = this;
		
		this.PrefObserver.register();
		this.PluginObserver.register();
	},
	
onUnload: function(evt)
	{
		this.PrefObserver.unregister();
		this.PluginObserver.unregister();
	},
};

window.addEventListener('load', function(e) { thatoneguydotnet.QuickJava.onLoad(e); },false);
window.addEventListener('unload',function(e) { thatoneguydotnet.QuickJava.onUnload(e); },false);
