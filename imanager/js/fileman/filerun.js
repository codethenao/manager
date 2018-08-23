FR = {
	currentSelectedFile: '', currentPath: false, previousPath: false, components: {}, actions: {}, tmp: {}, ext: [], customActions: {}, copyingPaths: [], isMobile: false,
	UI: {xy: [], popups: [], tree: {}, changePassWindow: '', folderDelConfirmWin: false, grid: {}},
	localSettings: {
		get: function(s, def) {
			var v = Ext.state.Manager.getProvider().get('settings-'+s);
			return def ? (v ? v : def) : v;
		},
		set: function(s, v) {
			Ext.state.Manager.getProvider().set('settings-'+s, v);
		}
	},
	labels: new Ext.util.MixedCollection(),
	audioNotification: function() {
		var audio = Ext.DomHelper.append(Ext.getBody(), {tag: 'audio', src:'sounds/new.mp3', preload: 'auto'});
		if (audio.canPlayType) {audio.play();}
	},
	getPathFromHash: function() {
		var p;
		try {
			p = document.location.hash.substring(1);
			if (p.substring(0, 8) != '/SEARCH/') {
				p = decodeURIComponent(p);
			}
		} catch (er) {return false;}
		if (p.substring(0, 1) != '/') {
			p = '/HOME';
			if (!Settings.has_home_folder) {return false;}
		} else {

		}
		return '/ROOT' + p;
	},
	push2History: function(path) {
		if (FR.pushState) {
			if (typeof window.history.pushState !== 'undefined') {
				window.history.pushState({path: path}, '', '#' + path.substring(5));
			}
		}
		FR.pushState = true;
	},
	handleHistoryPath: function(p) {
		if (p.indexOf('/ROOT/SEARCH') == 0) {
			var searchParams;
			try {
				searchParams = p.substring(13);
				searchParams = Ext.urlDecode(searchParams);
			} catch (er) {}
			if (typeof searchParams != 'object' || typeof searchParams.searchPath == 'undefined') {
				searchParams = false;
				FR.UI.searchPanel.reset();
			}
			FR.UI.searchPanel.doSearch(searchParams);
		} else {
			FR.utils.browseToPath(p);
		}
	}
};
Ext.onReady(function() {
	FR.baseURL = URLRoot;
	FR.iconsURL = URLRoot+'/images/icons';
	FR.doBaseURL = URLRoot+'/?module=fileman&section=do';
	FR.getBaseURL = URLRoot+'/?module=fileman&section=get';
	if (Settings.logoutURL) {
		FR.logoutURL = Settings.logoutURL;
	} else {
		FR.logoutURL = URLRoot + '/?module=fileman&page=logout';
	}

	if (Ext.getBody().getSize().width < 480) {
		FR.isMobile = true;
	}

	if (!FR.isMobile) {
		Ext.QuickTips.init();
		Ext.apply(Ext.QuickTips.getQuickTip(), {trackMouse: true});
	}

	if (!User.perms.download) {
		Settings.media_folders_photos = false;
		Settings.media_folders_music = false;
	}

	FR.initToolbar();
	FR.initTree();
	FR.cartStore = new FR.components.cartStore({});
	FR.initLayout();

	if (User.perms.file_history && Settings.enablePusher) {
		var pusher = new Pusher(Settings.pusherAppKey, {
			authEndpoint: '?module=fileman&section=utils&page=pusher_auth',
			cluster: Settings.pusherCluster, encrypted: true
		});
		var notifications = pusher.subscribe('private-'+User.id);
		notifications.bind('notifications', function(data) {
			if (data.action == 'comment_added') {if (!User.perms.read_comments) {return false;}}
			if (data.msg) {FR.UI.feedback(data.msg);}
			FR.UI.infoPanel.tabs.activityPanel.updateStatus(1, true);
		});
		pusher.subscribe('presence-channel');
	}

	FR.pushState = true;
	window.onpopstate = function (event) {
		if (event.state == null) {return;}
		if (event.state.path) {
			FR.pushState = false;
			FR.handleHistoryPath(event.state.path);
		}
	};
	window.onhashchange = function() {
		var p = FR.getPathFromHash();
		if (p) {
			FR.handleHistoryPath(p);
		}
	};
	var p = FR.getPathFromHash();
	if (p) {
		FR.handleHistoryPath(p);
	} else {
		FR.UI.tree.selectFirstVisible();
	}

	if (User.requiredToChangePass) {
		new Ext.ux.prompt({
			text: FR.T('You are required to change your password.'),
			callback: FR.actions.openAccountSettings
		});
	}
	if (Settings.welcomeMessage.length > 0) {
		new Ext.ux.prompt({text: FR.T(Settings.welcomeMessage)});
	}
	Ext.getDoc().on('paste', FR.actions.handlePaste);
	Ext.fly('loadMsg').fadeOut();

	if (!Settings.has_home_folder && User.isAdmin) {
		FR.actions.openControlPanel();
	}
});