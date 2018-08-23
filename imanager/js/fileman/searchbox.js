/*
todo: Check cases for users without Settings.has_home_folder
*/
FR.components.SearchPanel = Ext.extend(Ext.Panel, {
	layout: 'fit', params: {}, defaultParams: {
		keyword: '',
		searchType: 'filename',
		metafield: 'any',
		searchPath: '/ROOT/HOME'
	}, prevParams: {},
	initComponent: function() {
		this.defaultParams.searchType = Settings.search_default_mode;
		this.params = Ext.apply({}, this.defaultParams);
		this.delayedSearch = new Ext.util.DelayedTask(function(){
			if (this.prevParams && Ext.encode(this.params) == Ext.encode(this.prevParams)) {return false;}
			this.prevParams = Ext.apply({}, this.params);
			FR.push2History('/ROOT/SEARCH/'+Ext.urlEncode(this.params));
			if (!this.params.keyword) {
				FR.UI.gridPanel.reset();
				FR.UI.infoPanel.refresh();
				return false;
			}
			var g = FR.UI.gridPanel;
			g.store.loadParams = this.params;
			g.setMetaCols();
			g.load();
		}, this);

		this.input = new Ext.form.TextField({
			emptyText: FR.T('Search'), enableKeyEvents: true,
			searchPanel: this, cls: 'fr-search-field',
			listeners: {
				'keyup': function(t) {
					this.params.keyword = t.getValue();
					this.delayedSearch.delay(700);
				}, 'scope': this
			}
		});

		this.searchTypeRadio = new Ext.form.RadioGroup({width: (Settings.fullTextSearch ? 270 : 180),
			columns: [90, (Settings.fullTextSearch ? 90 : 0), 90], style: 'margin-left:10px;',
			items: [
				{boxLabel: FR.T('Name'), name: 's', inputValue: 'filename', checked: true},
				{boxLabel: FR.T('Contents'), name: 's', inputValue: 'contents', hidden: !Settings.fullTextSearch},
				{boxLabel: FR.T('Metadata'), name: 's', inputValue: 'meta', hidden: (FR.searchMetaColumns.length == 0)}
			],
			listeners: {
				'change': function(t, v) {
					var groupValue = v.getGroupValue();
					if (groupValue == 'meta') {
						this.metaFieldSelector.show();
					} else {
						this.metaFieldSelector.hide();
					}
					this.params.searchType = groupValue;
					this.delayedSearch.delay(0);
				}, 'scope': this
			}
		});

		var searchMetaFields = [['any', FR.T('Any field')]];
		Ext.each(FR.searchMetaColumns, function(item) {
			searchMetaFields.push([item.id, item.n]);
		}, this);

		this.metaFieldSelector = new Ext.form.ComboBox({
			hidden: true,
			mode: 'local', triggerAction: 'all', editable: false,
			store: new Ext.data.SimpleStore({fields: ['id', 'text'], data: searchMetaFields}),
			valueField: 'id', displayField: 'text', value: 'any',
			listeners: {
				'select': function(t) {
					this.params.metafield = t.getValue();
					this.delayedSearch.delay(0);
				}, 'scope': this
			}
		});

		Ext.apply(this, {
			items: [
				this.input
			],
			bbar: {
				items: [
					this.searchTypeRadio,
					this.metaFieldSelector
				]
			},
			listeners: {
				'show': function() {
					Ext.defer(function() {
						this.input.focus();
					}, 300, this);
				}, scope: this
			}
		});
		FR.components.SearchPanel.superclass.initComponent.apply(this, arguments);
	},
	updateForm: function() {
		this.input.suspendEvents().setValue(this.params.keyword).resumeEvents();
		this.searchTypeRadio.suspendEvents().setValue(this.params.searchType).resumeEvents();
		this.metaFieldSelector.suspendEvents().setValue(this.params.metafield).resumeEvents();
	},
	reset: function() {
		this.params = Ext.apply({}, this.defaultParams);
		this.updateForm();
	},
	doSearch: function(p) {
		if (p) {
			this.params = Ext.apply(this.params, p);
			if (!this.params.searchPath) {this.params.searchPath = FR.currentPath;}
		} else {
			if (!FR.UI.tree.currentSelectedNode) {
				FR.UI.tree.selectFirstVisible();
				return false;
			}
			this.params.searchPath = FR.currentPath;
			this.input.setEmptyText(FR.T('Search')+' '+FR.UI.tree.currentSelectedNode.text);
		}
		this.updateForm();
		if (FR.currentSection != 'search') {
			FR.UI.tree.searchResultsNode.select();
		}
		FR.UI.gridPanel.view.changeMode('search');/* to switch between views in the search results and back to the form */
		this.delayedSearch.delay(0);
	}
});