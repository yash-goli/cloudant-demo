YUI.add('taskManagerView', function(Y,NAME){
	Y.namespace('UtilApp').TaskManagerView = Y.Base.create('taskManagerView', Y.View, [], {
		/* elementNodes: {
			teamMemberContainer: Y.one('#TeamMemberContainer'),
			datePickerContainer: Y.one('#DatePickerContainer')
		}, */
		initializer: function(){
			console.log('taskManagerView initialized');
			this._initializeElementNodes();
			this._initializeRequestFields();
			this.tasksList = new Y.UtilApp.TasksList();
		},
		_initializeElementNodes: function(){
			this.elementNodes = {
				teamMemberContainer: Y.one('#TeamMemberContainer'),
				datePickerContainer: Y.one('#DatePickerContainer')
				};
		},
		_initializeRequestFields: function(){
			/* this.datePicker = new Y.WF2.FORM.FieldDatePicker({
				labelText: 'Choose Date'
			}).render(this.elementNodes.datePickerContainer);
			this.teamMember = new Y.WF2.FORM.FieldSelect({
				labelText: 'Choose Member Name',
				options: [{
					value: '',
					text: 'Select'
				},{
					value: 'emp1',
					text: 'Emp1'
				}, {
					value: 'emp2',
					text: 'Emp2'
				}, {
					value: 'emp3',
					text: 'Emp3'
				}]
			}).render(this.elementNodes.teamMemberContainer); */
			this.datePicker = new Y.WF2.FORM.FieldDatePicker({
				labelText: 'Choose Date',
				boudningBox: '#TeamMemberContainer'
			});
			this.teamMember = new Y.WF2.FORM.FieldSelect({
				labelText: 'Choose Member Name',
				options: [{
					value: '',
					text: 'Select'
				},{
					value: 'emp1',
					text: 'Emp1'
				}, {
					value: 'emp2',
					text: 'Emp2'
				}, {
					value: 'emp3',
					text: 'Emp3'
				}],
				boundingBox: '#DatePickerContainer'
			});
			this.form = new Y.WF2.FORM.Form({
				subfields: {teamMember: this.teamMember, datePicker: this.datePicker}
			}).render('#RequestFieldsContainer');
		},
		bindUI: function(){
			this.datePicker.after('valueChange', function(evt){
				if(evt.newVal != evt.prevVal){
					this._requestForm();
				}
			}, this);
			this.teamMember.on('change', function(evt){
				this._requestForm();
			}, this);
		},
		_requestForm: function(){
			if(this.datePicker.get('isValid') && this.teamMember.get('isValid') && this.teamMember.get('value') !== '' && this.datePicker.get('value') !== ''){
				//getData in IO and Update tasksList accordingly
				var data = this.get('data'),
					name = this.teamMember.get('value'),
					date = this.datePicker.get('value'),
					presTasksListData = this.tasksList.get('data');
					
				this.tasksList.set('lan_id', this.teamMember.get('value'));
				this.tasksList.set('date', this.datePicker.get('value'));
					
				if(data && data[name] && data[name][date]){
					this.tasksList.set('data', data[name][date]);
				} else{
					this.tasksList.set('data', null)
					if(presTasksListData === null){
						this.tasksList._reset();
						this.tasksList._initializeTasksList();
					}
				}
			}
		}
	}, {
		NAME: 'taskManagerView', 
		ATTRS: { 
			tasksCount: {
				value: 0
			},
			data: {
				value: null
			}
		}
	});
}, '0.0.1', {
	requires: [
		'view',
		'wf2-form',
		'wf2-datepicker',
		'tasksList'
	]
});