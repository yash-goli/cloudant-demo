YUI.add('taskDetails', function(Y,NAME){
	Y.namespace('UtilApp').TaskDetails = Y.Base.create('taskDetails', Y.View, [], {
		/* elementNodes: {
			taskContainer: Y.one('#TasksContainer')
		}, */
		initializer: function(){
			//ChangeThis
			this.commonTasks = ['development', 'integration', 'pto', 'testing', 'training', 'volunteer_service'];
			
			
			console.log('taskDetails initialized');
			//this._initializeFieldsGroup();
			//this._initializeFieldsHeaders();
			this._initializeElementNodes();
			this._initializeFields();
			this._bindUI();
		},
		_initializeElementNodes: function(){
			this.elementNodes = {
				taskContainer: Y.one('#TasksContainer')
				};
		},
		_initializeFields: function(){
			var taskDetailContainer = Y.Node.create('<div class="taskDetailContainer"><div class="taskContainer"></div><div 		class="hoursContainer"></div><div class="removeButtonContainer"><div class="yui3-widget wf2-field wf2-field-content auto medium"><div class="wf2-field-body"><div class="wf2-field-state"></div></div></div></div></div>'),
				taskContainerNode, hoursCotainerNode,
				data = this.get('data'),
				_self = this;
			console.log(data);
			
			this.elementNodes.taskContainer.append(taskDetailContainer);
			
			this.taskDetailContainer = Y.one('#TasksContainer .taskDetailContainer:last-child');
			taskContainerNode = this.taskDetailContainer.one('.taskContainer');
			hoursContainerNode = this.taskDetailContainer.one('.hoursContainer');
			RemoveButtonContainerNode = this.taskDetailContainer.one('.removeButtonContainer .wf2-field-state');
			
			this.fields = {};
			this.fields.task = new Y.WF2.FORM.AutoComplete({
				value: data ? data.task : '', 
				autoComplete: {source: _self.commonTasks, resultFilters: 'subWordMatch'}
			}).render(taskContainerNode);
			this.fields.hours = new Y.WF2.FORM.FieldTextInput({value: data ? data.hours : ''}).render(hoursContainerNode);
			this.fields.removeButton = new Y.WF2.Button({iconValue:Y.WF2.ICONS.SMALL.UPLOAD_FAILED, style: 'tertiary', ariaLabel: 'Remove Task and Hours'}).render(RemoveButtonContainerNode);
			
			this._updateFieldValidators();
		},
		_updateFieldValidators: function(){
			var validators = {};
			
			validators.task = ['isRequired'];
			validators.hours = ['isRequired', this._nonNumericValidator];
			
			for(var key in this.fields){
				if(validators[key]){
					this.fields[key].set('validators', validators[key]);
				}
			}
		},
		_bindUI: function(){
			if(this.get('data') === null){
				this.fields.removeButton.on('click', function(){
					//this.destroy();
					//console.log(Y.UtilApp.TaskManagerView.tasksList);
					this.set('removed', true);
					this.destroy();
				}, this);
			}
			
			this.fields.task.after('valueChange', function(evt){
				this.set('task', evt.newVal);
			}, this);
			this.fields.hours.after('valueChange', function(evt){
				this.set('hours', evt.newVal);
			}, this);
		},
		_nonNumericValidator: function(val) {
			var isNumeric = !isNaN(parseFloat(val));
			
			if (val && !isNumeric) {
				return [ 'invalid', 'Value should be a Numeric' ];
			}
		},
		destroy: function(){
			console.log('Destroy Called');
			this.taskDetailContainer.remove();
			
			for(var key in this.fields){
				if(typeof this.fields[key] !== 'undefined'){
					this.fields[key].destroy();
				}
			}
		}
	}, {
			NAME: 'taskDetails', 
			ATTRS: {
				taskID: {
					value: null
				},
				removed: {
					value: false
				},
				data: {
					value: null
				},
				task: {
					value: null
				},
				hours: {
					value: null
				}
			}
	});
}, '0.0.1', {
	requires: [
		'view',
		'wf2-form',
		'wf2-autocomplete'
	]
});