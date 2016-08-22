//QuickJava by Doug Greene
//Some style work, Cookies, Animated Images and BrowserReload added by Dave Delisle
//See ReadMe.txt for version history and credits

if(!thatoneguydotnet) var thatoneguydotnet={};
if(!thatoneguydotnet.QuickJava) thatoneguydotnet.QuickJava={};

thatoneguydotnet.QuickJava={

qj_JS                  : 'JavaScript',
qj_J                   : 'Java',
qj_F                   : 'Flash',
qj_WebGL               : 'WebGL',
qj_WebRTC              : 'WebRTC',
qj_SL                  : 'Silverlight',
qj_AI                  : 'AnimatedImage',
qj_C                   : 'Cookies',
qj_I                   : 'Images',
qj_CS                  : 'CSS',
qj_P                   : 'Proxy',

initQJ: function()
  {
      this.qj_Prefix_Pref         = 'extensions.thatoneguydotnet.QuickJava';
      this.qj_Prefix_PrefOld         = 'thatoneguydotnet.QuickJava';
      this.Plugin_TopicStr        = this.qj_Prefix_Pref + ".plugins.refreshIcons";
      this.qj_Pref_CustomStyle    = '.custombuttonstyle';
      this.qj_Pref_Default        = '.default';
      this.qj_Pref_Enabled        = '.enabled';
      this.qj_Prefix_Pref_Hide    = this.qj_Prefix_Pref + '.hidestatus.';
      this.qj_Prefix_Pref_Fav    = this.qj_Prefix_Pref + '.favorites.';
      this.qj_Prefix_Pref_Fav_DifferentDisplay= this.qj_Prefix_Pref_Fav + 'differentDisplay';
      this.qj_Prefix_Pref_Fav_DifferentToggle = this.qj_Prefix_Pref_Fav + 'differentToggle';
      this.qj_Prefix_Pref_StartupStatus    = this.qj_Prefix_Pref + '.startupstatus.';
      this.qj_Prefix_Pref_Reload    = this.qj_Prefix_Pref + '.reload.';
      this.qj_Prefix_Pref_RegEx   = this.qj_Prefix_Pref + '.regex.';
      this.qj_Option_Pref         = 'thatoneguydotnet_quickjava_pref';
      this.qj_Option_Pref_RegEx   = this.qj_Option_Pref + '_regex_';
      this.qj_Prefix              = 'QuickJava_';
      this.qj_Prefix_Sb           = this.qj_Prefix + 'StatusIcon_';
      this.qj_Prefix_Sb_Container = this.qj_Prefix_Sb + 'Container_';
      this.qj_Prefix_Tb           = this.qj_Prefix + 'ToolbarIcon_';
      this.qj_Prefix_Tb_Container = this.qj_Prefix_Tb + 'Container_';
      this.qj_Prefix_Tb_FM_Container = this.qj_Prefix_Tb_Container + 'Favorites_Menu_';

      this.qj_Fav                 = 'Favorites';
      this.qj_Fav_Different       = this.qj_Fav + '_Different';
  },
onLoad: function(evt)
  {
    if (typeof(Ci) == 'undefined') { return false; } //This is not a normal window (example: options dialog)
    this.alertPluginNames               = false;
    this.alertPluginNamesOnMatch        = false;

    this.curVersion                     = ''; //do not initialize, automatically loaded
    this.massToggle                     = false; //program use, do not initialize to true

    try
    {
      this.customStyleIndxDefault = -1;
      this.customStyleIndxEnabled = -1;

      this.Plugin = Components.classes["@mozilla.org/observer-service;1"]
      .getService (Components.interfaces.nsIObserverService);
      this.prefs = Components.classes["@mozilla.org/preferences-service;1"].
      getService(Components.interfaces.nsIPrefBranch);

      //Initialize pref monitors
      this.onLoadDetails();
      this.movePreferences();

      //First startup routine
      if (Components.classes["@mozilla.org/appshell/window-mediator;1"]
            .getService(Components.interfaces.nsIWindowMediator)
            .getEnumerator("").getNext() == window)
      {
        this.firstStartup();
        setTimeout('thatoneguydotnet.QuickJava.setStartupValues(0);',10);
      }
      else
      {
        setTimeout('thatoneguydotnet.QuickJava.setStartupValues(1);',10);
      }

      //Update custom style
      this.updateCustomStyle();

      //Update all icons
      this.updateIcons();
    } catch (e) { try { this.handleError(e); } catch (e) {} }
  },

handleError: function(e)
  {
    this.consoleLog("An exception occurred in the QuickJava script. Error name: " + e.name
    + ".\n Error description: " + e.description
    + ".\n Error number: " + e.number
    + ".\n Error message: " + e.message
    + ".\n Stack: " + e.stack
    , true);
  },
firstStartup: function(e)
  {
    this.curVersion = this.prefs.getCharPref(this.qj_Prefix_Pref + ".curVersion");
    Components.utils.import("resource://gre/modules/AddonManager.jsm");
    AddonManager.getAddonByID("{E6C1199F-E687-42da-8C24-E7770CC3AE66}", function(addon) { thatoneguydotnet.QuickJava.versionCheck(addon);});
  },
versionCheck: function(addon)
  {
    //strip out any non-numeric or decimal characters (such as "signed" text)
    var curVersionClean = this.curVersion.replace(/[^\d.]/g, '');
    var addonVersionClean = addon.version.replace(/[^\d.]/g, '');
    if (curVersionClean != addonVersionClean)
    {
      if (curVersionClean == '')
      {
        this.installButton("nav-bar", "QuickJava_ToolbarIcon_Container_Favorites_Item");
        this.updateIcons();
        if (this.firstInstallUrl != '')
        {
          setTimeout('thatoneguydotnet.QuickJava.openTab(thatoneguydotnet.QuickJava.firstInstallUrl,true);', 1000);
        }
      }
      else if (this.newVersionUrl != '')
      {
          setTimeout('thatoneguydotnet.QuickJava.openTab(thatoneguydotnet.QuickJava.newVersionUrl,true);', 1000);
      }
      curVersionClean = addonVersionClean;
      this.prefs.setCharPref(this.qj_Prefix_Pref + ".curVersion", curVersionClean)
    }
  },

installButton: function(toolbarId, id, afterId)
  {
    if (!document.getElementById(id)) {
        var toolbar = document.getElementById(toolbarId);

        // If no afterId is given, then append the item to the toolbar
        var before = null;
        if (afterId) {
            let elem = document.getElementById(afterId);
            if (elem && elem.parentNode == toolbar)
                before = elem.nextElementSibling;
        }

        toolbar.insertItem(id, before);
        toolbar.setAttribute("currentset", toolbar.currentSet);
        document.persist(toolbar.id, "currentset");

        if (toolbarId == "addon-bar")
            toolbar.collapsed = false;
    }
  },

newTabOpened: function(e)
{
  thatoneguydotnet.QuickJava.setStartupValues(2);
},

newTabSelected: function(e)
{
  thatoneguydotnet.QuickJava.updateIcons();
},

setStartupValues: function(startupType)
{
  /* 0 = initial luanch, 1 = new window, 2 = new tab */
  var runAt = this.prefs.getIntPref(this.qj_Prefix_Pref + '.startupStatus.type');
  if (runAt >= startupType)
  {
    this.setStartupValue(this.qj_I);
    this.setStartupValue(this.qj_J);
    this.setStartupValue(this.qj_JS);
    this.setStartupValue(this.qj_F);
    this.setStartupValue(this.qj_WebGL);
    this.setStartupValue(this.qj_WebRTC);
    this.setStartupValue(this.qj_SL);
    this.setStartupValue(this.qj_AI);
    this.setStartupValue(this.qj_C);
    this.setStartupValue(this.qj_CS);
  }
},
setStartupValue: function(whichIcon)
{
  try
  {
    /* 0 = no change, 1 = enabled, 2 = disabled */
    var statusToSet = this.prefs.getIntPref(this.qj_Prefix_Pref + '.startupStatus.' + whichIcon);
    if (statusToSet > 0)
    {
      var turnOn = (statusToSet == 1 ? 1 : 0);
      if (this.isEnabled(whichIcon) != turnOn)
      {
        this.toggleEnabled(whichIcon);
      }
    }
  } catch (e) { try { this.handleError(e); } catch (e) {} }
},
findElement: function(node, childId)
  {
    if (node.getElementById)
    {
      return node.getElementById(childId);
    }
    else
    {
      return node.querySelector("#" + childId);
    }
  },
getProxyOnValue: function()
  {
    var onValue             = this.prefs.getIntPref(this.qj_Prefix_Pref + ".priorvalue.Proxy");
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

    if(updateStoredValue) {
      this.prefs.setIntPref(this.qj_Prefix_Pref + ".priorvalue.Proxy", onValue);
    }
    return onValue;
  },

getCookieOnValue: function()
  {
    var onValue             = this.prefs.getIntPref(this.qj_Prefix_Pref + ".priorvalue.Cookie");
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
      this.prefs.setIntPref(this.qj_Prefix_Pref + ".priorvalue.Cookie", onValue);
    }
    return onValue;
  },

onClick: function(event)
  {
    try
    {
      // event.button == 2 // right
      if (!event.button || event.button == 0) {
        this.toggleEnabledIfStatusbarVisible(this.GetTypeFromId(event.currentTarget.id));
      }
      if (event.button == 1) {
        this.toggleEnabledIfStatusbarVisible(this.qj_I);
        this.toggleEnabledIfStatusbarVisible(this.qj_J);
        this.toggleEnabledIfStatusbarVisible(this.qj_JS);
        this.toggleEnabledIfStatusbarVisible(this.qj_F);
        this.toggleEnabledIfStatusbarVisible(this.qj_WebGL);
        this.toggleEnabledIfStatusbarVisible(this.qj_WebRTC);
        this.toggleEnabledIfStatusbarVisible(this.qj_SL);
        this.toggleEnabledIfStatusbarVisible(this.qj_AI);
        this.toggleEnabledIfStatusbarVisible(this.qj_C);
        this.toggleEnabledIfStatusbarVisible(this.qj_CS);
      }
      if (event.button != 0 && event.button != 1) {
        this.updateIcons();
      }
    } catch (e) { try { this.handleError(e); } catch (e) {} }
    return true;
  },

onCommand: function(event)
  {
    try
    {
      // event.button == 2 // right, not supported onCommand
      if (!event.button || event.button == 0) {
        this.toggleEnabled(this.GetTypeFromId(event.currentTarget.id));
      }
      else
      {
        this.updateIcons();
      }
    } catch (e) { try { this.handleError(e); } catch (e) {} }
    return true;
  },


onCommandFavorites: function(event)
  {
    try
    {
      // event.button == 2 // right, not supported onCommand
      if (!event.button || event.button == 0) {
        this.massToggle = true;
        var allEnabled = this.isEnabledAllFavorites();
        var anyEnabled = this.isEnabledAnyFavorites();
        var toggDisplay = this.prefs.getIntPref(this.qj_Prefix_Pref_Fav_DifferentToggle);
        var turnOn = !anyEnabled || (!allEnabled && toggDisplay == 1);
        var doReload = false;
        doReload = (this.toggleEnabledIfFavorite(this.qj_I, turnOn) && this.checkForReload(this.qj_I)) || doReload;
        doReload = (this.toggleEnabledIfFavorite(this.qj_J, turnOn) && this.checkForReload(this.qj_J)) || doReload;
        doReload = (this.toggleEnabledIfFavorite(this.qj_JS, turnOn) && this.checkForReload(this.qj_JS)) || doReload;
        doReload = (this.toggleEnabledIfFavorite(this.qj_F, turnOn) && this.checkForReload(this.qj_F)) || doReload;
        doReload = (this.toggleEnabledIfFavorite(this.qj_WebGL, turnOn) && this.checkForReload(this.qj_WebGL)) || doReload;
        doReload = (this.toggleEnabledIfFavorite(this.qj_WebRTC, turnOn) && this.checkForReload(this.qj_WebRTC)) || doReload;
        doReload = (this.toggleEnabledIfFavorite(this.qj_SL, turnOn) && this.checkForReload(this.qj_SL)) || doReload;
        doReload = (this.toggleEnabledIfFavorite(this.qj_AI, turnOn) && this.checkForReload(this.qj_AI)) || doReload;
        doReload = (this.toggleEnabledIfFavorite(this.qj_C, turnOn) && this.checkForReload(this.qj_C)) || doReload;
        doReload = (this.toggleEnabledIfFavorite(this.qj_CS, turnOn) && this.checkForReload(this.qj_CS)) || doReload;
        doReload = (this.toggleEnabledIfFavorite(this.qj_P, turnOn) && this.checkForReload(this.qj_P)) || doReload;
        this.massToggle = false;
      }
      this.updateIcons();
      if (doReload)
      {
        BrowserReload();
      }
    } catch (e) { try { this.handleError(e); } catch (e) {} }
    return true;
  },

reset_pref_click: function(event, whichReset)
  {
    try
    {
      var optionField = document.getElementById(this.qj_Option_Pref_RegEx + whichReset);
      if (optionField)
      {
        optionField.value = optionField.defaultValue;
      }
    } catch (e) { try { this.handleError(e); } catch (e) {} }
    return true;
  },

GetTypeFromId: function(id)
  {
    if (id == this.qj_Prefix_Sb_Container + this.qj_JS || id == this.qj_Prefix_Tb_Container + this.qj_JS || id == this.qj_Prefix_Tb_FM_Container + this.qj_JS) { return this.qj_JS; }
    if (id == this.qj_Prefix_Sb_Container + this.qj_J  || id == this.qj_Prefix_Tb_Container + this.qj_J || id == this.qj_Prefix_Tb_FM_Container + this.qj_J)  { return this.qj_J; }
    if (id == this.qj_Prefix_Sb_Container + this.qj_F  || id == this.qj_Prefix_Tb_Container + this.qj_F || id == this.qj_Prefix_Tb_FM_Container + this.qj_F)  { return this.qj_F; }
    if (id == this.qj_Prefix_Sb_Container + this.qj_WebGL || id == this.qj_Prefix_Tb_Container + this.qj_WebGL || id == this.qj_Prefix_Tb_FM_Container + this.qj_WebGL) { return this.qj_WebGL; }
    if (id == this.qj_Prefix_Sb_Container + this.qj_WebRTC || id == this.qj_Prefix_Tb_Container + this.qj_WebRTC || id == this.qj_Prefix_Tb_FM_Container + this.qj_WebRTC) { return this.qj_WebRTC; }
    if (id == this.qj_Prefix_Sb_Container + this.qj_SL || id == this.qj_Prefix_Tb_Container + this.qj_SL || id == this.qj_Prefix_Tb_FM_Container + this.qj_SL) { return this.qj_SL; }
    if (id == this.qj_Prefix_Sb_Container + this.qj_AI || id == this.qj_Prefix_Tb_Container + this.qj_AI || id == this.qj_Prefix_Tb_FM_Container + this.qj_AI) { return this.qj_AI; }
    if (id == this.qj_Prefix_Sb_Container + this.qj_C  || id == this.qj_Prefix_Tb_Container + this.qj_C || id == this.qj_Prefix_Tb_FM_Container + this.qj_C)  { return this.qj_C; }
    if (id == this.qj_Prefix_Sb_Container + this.qj_I  || id == this.qj_Prefix_Tb_Container + this.qj_I || id == this.qj_Prefix_Tb_FM_Container + this.qj_I)  { return this.qj_I; }
    if (id == this.qj_Prefix_Sb_Container + this.qj_CS || id == this.qj_Prefix_Tb_Container + this.qj_CS || id == this.qj_Prefix_Tb_FM_Container + this.qj_CS) { return this.qj_CS; }
    if (id == this.qj_Prefix_Sb_Container + this.qj_P  || id == this.qj_Prefix_Tb_Container + this.qj_P || id == this.qj_Prefix_Tb_FM_Container + this.qj_P)  { return this.qj_P; }
  },

updateIcons: function()
  {
    //this.consoleLog('updateIcons');
    //do as setTimeout so any other processes can finish first
    setTimeout('thatoneguydotnet.QuickJava.updateIconsNow();',100);
    this.updateIconsNow();
  },

updateIconsNow: function()
  {
    //this.consoleLog('updateIconsNow');
    if(!this.massToggle)
    {
      //Set the icons
      this.setIcon(this.qj_JS, this.isEnabled(this.qj_JS));
      this.setIcon(this.qj_J,  this.isEnabled(this.qj_J));
      this.setIcon(this.qj_F,  this.isEnabled(this.qj_F));
      this.setIcon(this.qj_WebGL, this.isEnabled(this.qj_WebGL));
      this.setIcon(this.qj_WebRTC, this.isEnabled(this.qj_WebRTC));
      this.setIcon(this.qj_SL, this.isEnabled(this.qj_SL));
      this.setIcon(this.qj_AI, this.isEnabled(this.qj_AI));
      this.setIcon(this.qj_C,  this.isEnabled(this.qj_C));
      this.setIcon(this.qj_I,  this.isEnabled(this.qj_I));
      this.setIcon(this.qj_CS, this.isEnabled(this.qj_CS));
      this.setIcon(this.qj_P,  this.isEnabled(this.qj_P));

      this.setFavIcon();
    }
    return true;
  },

GetRegEx: function(whichIcon)
  {
    switch (whichIcon)
    {
      case this.qj_J:
        return new RegExp(this.prefs.getCharPref(this.qj_Prefix_Pref + ".regex.Java"), 'i');
        break;
      case this.qj_F:
        return new RegExp(this.prefs.getCharPref(this.qj_Prefix_Pref + ".regex.Flash"), 'i');
        break;
      case this.qj_SL:
        return new RegExp(this.prefs.getCharPref(this.qj_Prefix_Pref + ".regex.Silverlight"), 'i');
        break;
    }
  },

setIcon: function(whichIcon, onOff)
  {
  try
  {
    var isHidden      = this.prefs.getBoolPref(this.qj_Prefix_Pref_Hide + whichIcon);
    var statusNumber  = (onOff == 1 ? "1" : (onOff == 0 ? "0" : "-2"));
    var chkBx         = document.getElementById(this.qj_Prefix_Tb + whichIcon);
    if (chkBx) { chkBx.setAttribute("status", statusNumber); }

    var icon = document.getElementById(this.qj_Prefix_Sb + whichIcon);
    if (icon) { icon.setAttribute("status", isHidden ? "-1" : statusNumber); }

    var container = document.getElementById(this.qj_Prefix_Sb_Container + whichIcon);
    if (container ) { container.setAttribute("status", isHidden ? "-1" : statusNumber); }

    var favDropDown = document.getElementById('QuickJava_ToolbarIcon_Container_Favorites_Menu_' + whichIcon);
    if (favDropDown ) {
      favDropDown.setAttribute("checked", onOff == 1 ? true : false);
      favDropDown.setAttribute("style", this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + whichIcon) ? "" : "display: none;");
    }
  } catch (e) { try { this.handleError(e); } catch (e) {} }
  },

setFavIcon: function()
{
  var allEnabled = this.isEnabledAllFavorites();
  var anyEnabled = this.isEnabledAnyFavorites();
  var diffDisplay = this.prefs.getIntPref(this.qj_Prefix_Pref_Fav_DifferentDisplay);
  var dispEnabled = allEnabled || (anyEnabled && diffDisplay == 1);
  var toolbarBtn    = document.getElementById(this.qj_Prefix_Tb + this.qj_Fav);
  if (toolbarBtn) { toolbarBtn.setAttribute("status", (dispEnabled ? "1" : "0")); }

  var differentIndicator    = document.getElementById(this.qj_Prefix_Tb + this.qj_Fav_Different);
//  alert((anyEnabled && !allEnabled ? "0" : "1"));
  if (differentIndicator) { differentIndicator.setAttribute("status", (anyEnabled && !allEnabled ? "1" : "0")); }
},

  //
GetPluginTags: function() {
  if (!("nsIPluginHost" in Components.interfaces)) return false;
  var phs = Components.classes["@mozilla.org/plugin/host;1"]
  .getService(Components.interfaces.nsIPluginHost);
  var plugins = phs.getPluginTags({ });
  return plugins;
},

toggleEnabledIfStatusbarVisible: function(whichIcon)
{
  if (!this.prefs.getBoolPref(this.qj_Prefix_Pref_Hide + whichIcon))
  {
    this.toggleEnabled(whichIcon);
  }
},

toggleEnabledIfFavorite: function(whichIcon, turnOn)
{
  if (this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + whichIcon))
  {
    if (this.isEnabled(whichIcon) != turnOn)
    {
      this.toggleEnabled(whichIcon);
      return true;
    }
  }
  return false;
},

  // Sets plugin enabled status of plugin(s), whose name matches on aRegEx,
  // to aValue. aName is used for the "not found" message and is optional
toggleEnabled: function(whichIcon) {
  if (typeof(Ci) == 'undefined') { return false; } //This is not a normal window (example: options dialog)

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
  else if (whichIcon == this.qj_WebGL)
  {
    this.prefs.setBoolPref("webgl.disabled", !setEnabled);
  }
  else if (whichIcon == this.qj_WebRTC)
  {
    this.prefs.setBoolPref("media.peerconnection.enabled", setEnabled);
  }
  else
  {
    var aRegEx = this.GetRegEx(whichIcon);
    if (!aRegEx) { this.consoleLog('Invalid toggleEnabled: ' + whichIcon); return; }
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
//Doesn't seem to be working, Flash still runs on the test page w/o asking after setting to CLICKTOPLAY
                if (setEnabled && this.prefs.getBoolPref(this.qj_Prefix_Pref + ".enabledState.ClickToPlay")) { 
            plugins[i].enabledState = Ci.nsIPluginTag.STATE_CLICKTOPLAY;
//alert(plugins[i].enabledState + ', ' + Ci.nsIPluginTag.STATE_CLICKTOPLAY);
          }
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
      this.consoleLog(window, "No " + aName + " plugin found!");
    }
  }

  this.updateIcons();
  if(!this.massToggle && this.checkForReload(whichIcon))
  {
    BrowserReload();
  }
},
checkForReload: function(whichIcon)
{
  return this.prefs.getBoolPref(this.qj_Prefix_Pref_Reload + whichIcon);
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
        var setSheet = '';
        var firstSheet = '';
        var curSheetAry = gPageStyleMenu.getBrowserStyleSheets();
        for (curSheetIdx in curSheetAry) {
          //this.consoleLog('gPageStyleMenu *' + curSheetAry[curSheetIdx].title + '*');
          setSheet = curSheetAry[curSheetIdx].title;
          if (curSheetAry[curSheetIdx].title == 'screen') { break; }
          if (firstSheet == '') { firstSheet =  setSheet; }
        }
        //if we didn't find one named 'screen' then use the first one we found
        if (setSheet != 'screen') { setScreen = firstSheet; }
        gPageStyleMenu.switchStyleSheet(setSheet);
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
  var mygBrowser = (typeof(gBrowser) === 'undefined' ? window.opener.gBrowser : gBrowser);
  if (mygBrowser)
  {
    var tab = mygBrowser.addTab(url);
    if (focusTab) {
      mygBrowser.selectedTab = tab;
    }
  }
},

openHelp: function()
{
  try {
    this.openTab('http://quickjavaplugin.blogspot.com/2012/07/quickjava-quick-help.html',true);
  } catch (e) { try { this.handleError(e); } catch (e) {} }
},

 openHome: function()
{
  try {
    this.openTab('http://quickjavaplugin.blogspot.com/',true);
  } catch (e) { try { this.handleError(e); } catch (e) {} }
},

openDonate: function() {
  try {
    this.openTab('https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=9DSQG8KAB95C6',true);
  } catch (e) { try { this.handleError(e); } catch (e) {} }
},

showOptions: function() {
  window.openDialog("chrome://quickjava/content/options.xul", "", "chrome,toolbar");
},

  // Returns plugin enabled status of plugin(s), whose name matches on aRegEx
isEnabled: function(whichIcon) {
try
{
  if (typeof(Ci) == 'undefined') { return false; } //This is not a normal window (example: options dialog)
  if (whichIcon == this.qj_JS) { return this.prefs.getBoolPref("javascript.enabled"); }
  if (whichIcon == this.qj_AI) { return (this.prefs.getCharPref("image.animation_mode") == "normal"); }

  if (whichIcon == this.qj_C)  { return (this.prefs.getIntPref("network.cookie.cookieBehavior") != 2); }

  if (whichIcon == this.qj_I)  { return (this.prefs.getIntPref("permissions.default.image") == 1); }
  if (whichIcon == this.qj_WebGL) { return this.prefs.getBoolPref("webgl.disabled") == false; }
  if (whichIcon == this.qj_WebRTC) { return this.prefs.getBoolPref("media.peerconnection.enabled"); }

  if (whichIcon == this.qj_CS) {
    let styleSheetInfo = gPageStyleMenu._getStyleSheetInfo(gBrowser.selectedBrowser);
    let styleSheets = styleSheetInfo.filteredStyleSheets;
    return !(styleSheetInfo.authorStyleDisabled);
  }

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
        if (plugins[i].enabledState == Ci.nsIPluginTag.STATE_ENABLED || plugins[i].enabledState == Ci.nsIPluginTag.STATE_CLICKTOPLAY) { return 1; }
      }
      else
      {
        if (!plugins[i].disabled) { return 1; }
      }
    }
  }
} catch (e) { try { this.handleError(e); } catch (e) {} }
  return 0;
},

isEnabledAllFavorites: function()
{
  //We only care if it's enabled if it's a favorite
  return (!this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_I) || this.isEnabled(this.qj_I))
      && (!this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_J) || this.isEnabled(this.qj_J))
      && (!this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_JS) || this.isEnabled(this.qj_JS))
      && (!this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_F) || this.isEnabled(this.qj_F))
      && (!this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_WebGL) || this.isEnabled(this.qj_WebGL))
      && (!this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_WebRTC) || this.isEnabled(this.qj_WebRTC))
      && (!this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_SL) || this.isEnabled(this.qj_SL))
      && (!this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_AI) || this.isEnabled(this.qj_AI))
      && (!this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_C) || this.isEnabled(this.qj_C))
      && (!this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_CS) || this.isEnabled(this.qj_CS));
},

isEnabledAnyFavorites: function()
{
  //We only care if it's enabled if it's a favorite
  return (this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_I) && this.isEnabled(this.qj_I))
      || (this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_J) && this.isEnabled(this.qj_J))
      || (this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_JS) && this.isEnabled(this.qj_JS))
      || (this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_F) && this.isEnabled(this.qj_F))
      || (this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_WebGL) && this.isEnabled(this.qj_WebGL))
      || (this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_WebRTC) && this.isEnabled(this.qj_WebRTC))
      || (this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_SL) && this.isEnabled(this.qj_SL))
      || (this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_AI) && this.isEnabled(this.qj_AI))
      || (this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_C) && this.isEnabled(this.qj_C))
      || (this.prefs.getBoolPref(this.qj_Prefix_Pref_Fav + this.qj_CS) && this.isEnabled(this.qj_CS));
},

updateCustomStyle: function()
  {
    if (!this.myStyleSheet)
    {
      for(var i = 0; i < document.styleSheets.length;i++)
      {
        if (document.styleSheets[i].href
            && document.styleSheets[i].href.match(".*quickjava\.css$"))
        {
          this.myStyleSheet = document.styleSheets[i];
        }
      }
    }
    if (this.myStyleSheet)
    {
      //Cleanup old styles
      if (this.customStyleIndxEnabled > -1 && this.myStyleSheet.cssRules.length > this.customStyleIndxEnabled )
      {
        this.myStyleSheet.deleteRule(this.customStyleIndxEnabled );
        this.customStyleIndxEnabled  = -1;
      }
      if (this.customStyleIndxDefault > -1 && this.myStyleSheet.cssRules.length > this.customStyleIndxDefault)
      {
        this.myStyleSheet.deleteRule(this.customStyleIndxDefault);
        this.customStyleIndxDefault = -1;
      }

      var newDefaultStyle = this.prefs.getCharPref(this.qj_Prefix_Pref + this.qj_Pref_CustomStyle + this.qj_Pref_Default).replace(/<\/?[^>]+(>|$)/g, '').trim();
      var newStyle = '';
      if (newDefaultStyle != '')
      {
        newStyle = ' .quickjava-button { ' + newDefaultStyle + '}';
        try
        {
          var newStyleIndx = this.myStyleSheet.cssRules.length;
          this.customStyleIndxDefault = this.myStyleSheet.insertRule(newStyle, newStyleIndx);
        }
        catch(e)
        {
          alert('Invalid QuickJava custom CSS Default settings.\n\n' + newStyle + '\n\n' + e);
        }
      }

      var newEnabledStyle = this.prefs.getCharPref(this.qj_Prefix_Pref + this.qj_Pref_CustomStyle + this.qj_Pref_Enabled).replace(/<\/?[^>]+(>|$)/g, '').trim();
      if (newEnabledStyle != '')
      {
        newStyle = ' .quickjava-button[status="1"] { ' + newEnabledStyle + '}';
        try
        {
          var newStyleIndx = this.myStyleSheet.cssRules.length;
          this.customStyleIndxEnabled = this.myStyleSheet.insertRule(newStyle, newStyleIndx);
        }
        catch(e)
        {
          alert('Invalid QuickJava custom CSS Enabled settings.\n\n' + newStyle + '\n\n' + e);
        }
      }
    }
  },

consoleLog: function(msg, stackTrace)
  {
    if (window.console && window.console.log) { window.console.log('[QuickJava]: ' + msg); if (stackTrace && window.console.trace) { window.console.trace(); } }
  },

onLoadDetails: function(evt)
  {
    gBrowser.tabContainer.addEventListener("TabSelect", thatoneguydotnet.QuickJava.newTabSelected, false)
    gBrowser.tabContainer.addEventListener("TabOpen", thatoneguydotnet.QuickJava.newTabOpened, false)
    this.CUIListener = {
      handler: function(aWidgetId) {
        if (aWidgetId.indexOf('QuickJava') >= 0) {
          thatoneguydotnet.QuickJava.consoleLog(aWidgetId);
          /* Our toolbar icons may have been added or removed to/from a toolbar or panel */
          thatoneguydotnet.QuickJava.updateIcons();
        }
      },
      onWidgetAdded: function(aWidgetId) { this.handler(aWidgetId); },
      onWidgetRemoved: function(aWidgetId) { this.handler(aWidgetId); },
      onAreaNodeRegistered: function() { this.handler('QuickJava'); },
      onAreaNodeUnregstered: function() { this.handler('QuickJava'); }
    };
    Components.utils.import("resource:///modules/CustomizableUI.jsm");
    CustomizableUI.addListener(this.CUIListener);

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
        if (aData.match('^' + thatoneguydotnet.QuickJava.qj_Prefix_Pref + thatoneguydotnet.QuickJava.qj_Pref_CustomStyle)
              == thatoneguydotnet.QuickJava.qj_Prefix_Pref + thatoneguydotnet.QuickJava.qj_Pref_CustomStyle)
        {
          thatoneguydotnet.QuickJava.updateCustomStyle();
        }
        else if (aData ==  "javascript.enabled" || aData == "permissions.default.image" || aData == "network.proxy.type"
            || aData == "network.cookie.cookieBehavior" || aData == "image.animation_mode"
            || aData == "webgl.disabled" || aData == "media.peerconnection.enabled"
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
    try
    {
      if (typeof(Ci) == 'undefined') { return false; } //This is not a normal window (example: options dialog)
      if (thatoneguydotnet.QuickJava.PrefObserver && thatoneguydotnet.QuickJava.PrefObserver.unregister) { thatoneguydotnet.QuickJava.PrefObserver.unregister(); }
      if (thatoneguydotnet.QuickJava.PluginObserver && thatoneguydotnet.QuickJava.PluginObserver.unregister) { thatoneguydotnet.QuickJava.PluginObserver.unregister(); }
      if (gBrowser) { gBrowser.tabContainer.removeEventListener("TabOpen", thatoneguydotnet.QuickJava.newTabOpened, false); }
      if (gBrowser) { gBrowser.tabContainer.removeEventListener("TabSelect", thatoneguydotnet.QuickJava.newTabSelected, false); }
      if (this.CUIListener) { CustomizableUI.removeListener(this.CUIListener); }
    } catch (e) { try { this.handleError(e); } catch (e) {} }
  },

movePreferences: function()
  {
    if (this.prefs.getPrefType(this.qj_Prefix_PrefOld + '.curVersion'))
    {
      this.consoleLog('QuickJava moving preferences');

      this.movePreference(this.qj_Prefix_PrefOld + '.curVersion', false, true, false); // Bool,Char,Int

      /* which icons are hidden in status/addon bar */
      this.movePreference(this.qj_Prefix_PrefOld + '.hidestatus.JavaScript', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.hidestatus.Java', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.hidestatus.Flash', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.hidestatus.WebGL', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.hidestatus.WebRTC', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.hidestatus.Silverlight', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.hidestatus.AnimatedImage', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.hidestatus.Cookies', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.hidestatus.Images', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.hidestatus.CSS', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.hidestatus.Proxy', true, false, false); // Bool,Char,Int

      /* 0 = initial luanch, 1 = new window, 2 = new tab */
      this.movePreference(this.qj_Prefix_PrefOld + '.startupStatus.type', false, false, true); // Bool,Char,Int

      /* 0 = no change, 1 = enabled, 2 = disabled */
      this.movePreference(this.qj_Prefix_PrefOld + '.startupStatus.JavaScript', false, false, true); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.startupStatus.Java', false, false, true); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.startupStatus.Flash', false, false, true); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.startupStatus.WebGL', false, false, true); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.startupStatus.WebRTC', false, false, true); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.startupStatus.Silverlight', false, false, true); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.startupStatus.AnimatedImage', false, false, true); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.startupStatus.Cookies', false, false, true); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.startupStatus.Images', false, false, true); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.startupStatus.CSS', false, false, true); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.startupStatus.Proxy', false, false, true); // Bool,Char,Int

      /* which icons are visible in the favorites menu button */
      this.movePreference(this.qj_Prefix_PrefOld + '.favorites.JavaScript', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.favorites.Java', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.favorites.Flash', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.favorites.WebGL', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.favorites.WebRTC', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.favorites.Silverlight', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.favorites.AnimatedImage', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.favorites.Cookies', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.favorites.Images', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.favorites.CSS', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.favorites.Proxy', true, false, false); // Bool,Char,Int

      /* What to display/do when some favories are enabled and some are different.  1 = Enabled, 0 = Disabled */
      this.movePreference(this.qj_Prefix_PrefOld + '.favorites.differentDisplay', false, false, true); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.favorites.differentToggle', false, false, true); // Bool,Char,Int

      /* which icons cause a reload of the page when they are changed */
      this.movePreference(this.qj_Prefix_PrefOld + '.reload.JavaScript', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.reload.Java', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.reload.Flash', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.reload.WebGL', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.reload.WebRTC', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.reload.Silverlight', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.reload.AnimatedImage', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.reload.Cookies', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.reload.Images', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.reload.CSS', true, false, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.reload.Proxy', true, false, false); // Bool,Char,Int

      this.movePreference(this.qj_Prefix_PrefOld + '.priorvalue.Proxy', false, false, true); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.priorvalue.Cookie', false, false, true); // Bool,Char,Int

      this.movePreference(this.qj_Prefix_PrefOld + '.enabledState.ClickToPlay', true, false, false); // Bool,Char,Int

      this.movePreference(this.qj_Prefix_PrefOld + '.regex.Java', false, true, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.regex.Flash', false, true, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.regex.Silverlight', false, true, false); // Bool,Char,Int

      this.movePreference(this.qj_Prefix_PrefOld + '.custombuttonstyle.default', false, true, false); // Bool,Char,Int
      this.movePreference(this.qj_Prefix_PrefOld + '.custombuttonstyle.enabled', false, true, false); // Bool,Char,Int
    }
  },

movePreference : function(oldPrefName, isBool, isChar, isInt)
  {
    if (this.prefs.getPrefType(oldPrefName))//this.qj_Prefix_PrefOld + '.curVersion'))
    {
      var newPrefName = oldPrefName.replace(this.qj_Prefix_PrefOld,this.qj_Prefix_Pref);
      this.consoleLog('Move ' + oldPrefName + ' to ' + newPrefName);
      if (isBool)
      {
        this.prefs.setBoolPref(newPrefName, this.prefs.getBoolPref(oldPrefName));
      }
      else if (isChar)
      {
        this.prefs.setCharPref(newPrefName, this.prefs.getCharPref(oldPrefName));
      }
      else if (isInt)
      {
        this.prefs.setIntPref(newPrefName, this.prefs.getIntPref(oldPrefName));
      }
      this.prefs.clearUserPref(oldPrefName);
    }
  }
};

thatoneguydotnet.QuickJava.initQJ();
window.addEventListener('load', function(e) { thatoneguydotnet.QuickJava.onLoad(e); },false);
window.addEventListener('unload',function(e) { thatoneguydotnet.QuickJava.onUnload(e); },false);