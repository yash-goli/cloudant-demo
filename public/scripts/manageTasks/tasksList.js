YUI.add('tasksList', function(Y,NAME){
	Y.namespace('UtilApp').TasksList = Y.Base.create('tasksList', Y.View, [], {
		/* elementsNode:{
			buttonsBar: Y.one('#ButtonBar'),
			taskContainer: Y.one('#TasksContainer'),
			taskDetailHeaderContainer: Y.one('.taskDetailHeaderContainer')
		}, */
		initializer: function(){
			console.log('tasksList initialized');
			this._initializeElementNodes();
			this._attrChangeBind();
			//this._initializeTasksList();
			this._initializeFieldsHeaders();
			this._initializeButtons();
			this._bindUI();
		},
		_initializeElementNodes: function(){
			this.elementsNode = {
				buttonsBar: Y.one('#ButtonBar'),
				taskContainer: Y.one('#TasksContainer')
				};
		},
		_initializeFieldsHeaders: function(){
			var taskDetailHeaderContainer = Y.Node.create('<div class="taskDetailHeaderContainer wf2-u-isHidden"><div class="taskContainer"><div class="yui3-widget wf2-field wf2-field-content auto medium"><div class="wf2-field-body"><div class="wf2-field-state"><span>Utilization</span></div></div></div></div><div class="hoursContainer"><div class="yui3-widget wf2-field wf2-field-content auto medium"><div class="wf2-field-body"><div class="wf2-field-state"><span>Number of Hours</span></div></div></div></div><div class="removeButtonContainer"><div class="yui3-widget wf2-field wf2-field-content auto medium"><div class="wf2-field-body"><div class="wf2-field-state"><span></span></div></div></div></div></div>');
			
			this.elementsNode.taskContainer.append(taskDetailHeaderContainer);
			this.elementsNode.taskDetailHeaderContainer= Y.one('.taskDetailHeaderContainer');
		},
		_initializeTasksList: function(){
			this.set('tasksCount', 0);
			this.tasksList = [];
			var data = this.get('data');
			if(data === null){
				this.addTaskToList(data);
				this._enableButtons(true, [this.addTaskButton, this.resetTasksButton]);
				this._enableButtons(false, [this.submitTasksButton]);
			} else {
				for(var key in data){
					if(key !== 'date' && key !== 'lan_id' && parseFloat(data[key]) !== 0){
						if(key !== 'other_tasks'){
							this.addTaskToList({task: key, hours: data[key]});
						} else {
							for(var othersKey in data[key]){
								if(parseFloat(data[key][othersKey]) !== 0){
									this.addTaskToList({task: othersKey, hours: data[key][othersKey]});
								}
							}
						}
					}
				}
				for(var taskNo in this.tasksList){
					for(var fieldKey in this.tasksList[taskNo].task.fields){
						this.tasksList[taskNo].task.fields[fieldKey].disable();
					}
				}
				this._enableButtons(false, [this.addTaskButton, this.submitTasksButton, this.resetTasksButton]);
			}
			this.buttonBar.set('visible', true);
			this.elementsNode.taskDetailHeaderContainer.removeClass('wf2-u-isHidden');
		},
		_initializeButtons: function(){
			var addButtonNode = Y.Node.create('<span class="wf2-buttonbar-slot addTask"><button id="AddTask">Add Task</button></span>'),
				submitButtonNode = Y.Node.create('<span class="wf2-buttonbar-slot submitTasks"><button id="SubmitTasks">Submit</button></span>'),
				resetButtonNode = Y.Node.create('<span class="wf2-buttonbar-slot resetTasks"><button id="ResetTasks">Reset</button></span>');
			
			this.elementsNode.buttonsBar.append(addButtonNode).append(submitButtonNode).append(resetButtonNode);
			
			this.addTaskButton= new Y.WF2.Button({
				srcNode: '#AddTask',
				label: 'Add Task',
				render: true,
				disabled: true
			});
			this.submitTasksButton = new Y.WF2.Button({
				srcNode: '#SubmitTasks',
				label: 'Submit', 
				ariaLabel: 'Submit Tasks',
				render: true,
				disabled: true
			});
			this.resetTasksButton = new Y.WF2.Button({
				srcNode: '#ResetTasks',
				label: 'Reset', 
				ariaLabel: 'Reset Tasks',
				render: true,
				disabled: true
			});
			this.buttonBar = new Y.WF2.ButtonBar({
				srcNode: '#ButtonBar',
				disable: false,
				visible: true,
				widgets: [this.addTaskButton, this.submitTasksButton, this.resetTasksButton],
				label: 'buttons bar',
				visible: false
			}).render();
		},
		_enableButtons: function(enable, buttons){
			for(var key in buttons){
				if(enable){
					buttons[key].enable();
				} else {
					buttons[key].disable();
				}
			}
		},
		_bindUI: function(){
			this.addTaskButton.on('click', function(){
				this.addTaskToList();
			}, this);
			this.resetTasksButton.on('click', function(){
				this._reset();
				this._initializeTasksList();
			}, this);
			this.submitTasksButton.on('click', function(){
				var reqData = {
					'development': 0,
					'integration': 0, 
					'pto': 0, 
					'testing': 0, 
					'training': 0, 
					'volunteer_service': 0
					}, //ChangeThis
					//commonTasks = ['development', 'integration', 'pto', 'testing', 'training', 'volunteer_service'],
					taskName;
				reqData.date = this.get('date');
				reqData.lan_id = this.get('lan_id');
				for(var i in this.tasksList){
					taskName = this.tasksList[i].task.fields.task.get('value');
					taskHours = parseFloat(this.tasksList[i].task.fields.hours.get('value'));
					if(typeof reqData[taskName] !== 'undefined'){
						reqData[taskName] = (reqData[taskName] || 0) + taskHours;
					} else{
						if(typeof reqData.other_tasks === 'undefined'){
							reqData.other_tasks = {};
						}
						reqData.other_tasks[taskName] = (reqData.other_tasks[taskName] || 0) + taskHours;
					}
				}
				
				console.log(reqData);
			}, this);
		},
		_attrChangeBind: function(){
			this.after('dataChange', function(evt){
				this._reset();
				this._initializeTasksList();
			}, this);
			this.on('tasksCountChange', function(evt){
				console.log('tasksCountChange Occurred');
				if(evt.newVal>1){
					this.tasksList[0].task.fields.removeButton.enable();
				} else if(evt.newVal === 1){
					this.tasksList[0].task.fields.removeButton.disable();
				}
			}, this);
		},
		addTaskToList: function(data){
			this.tasksList.push({taskID:this.get('tasksCount'), task:new Y.UtilApp.TaskDetails({taskID: this.get('tasksCount'), data:data})});
			this.set('tasksCount', this.get('tasksCount')+1);
			this._handleButtons();
			this.tasksList[this.tasksList.length-1].task.on('removedChange', function(evt){
				if(evt.newVal){
					console.log(arguments);
					console.log(this._findTaskIndex(arguments[1]));
					console.log(this.tasksList);
					this.tasksList.splice(this._findTaskIndex(arguments[1]), 1);
					this.set('tasksCount', this.get('tasksCount')-1);
					this._handleButtons();
				}
			}, this, this.tasksList.length-1);
			
			this.tasksList[this.tasksList.length-1].task.after('taskChange', function(evt){
				//if(evt.newVal){
					this._handleButtons();
				//}
			}, this);
			
			this.tasksList[this.tasksList.length-1].task.after('hoursChange', function(evt){
				//if(evt.newVal){
					this._handleButtons();
				//}
			}, this);
		},
		_handleButtons: function(){
			var enableSubmitButton = true, totalHours = 0;
			for(var i in this.tasksList){
				totalHours+=parseFloat(this.tasksList[i].task.fields.hours.get('value'));
			}
			if(totalHours !== 8){
				enableSubmitButton = false;
			}else{
				for(var i in this.tasksList){
					if(!this.tasksList[i].task.fields.task.get('isValid') || !this.tasksList[i].task.fields.hours.get('isValid')){
						enableSubmitButton = false;
						break;
					}
				}
			}
			this._enableButtons(enableSubmitButton, [this.submitTasksButton]);
		},
		_findTaskIndex: function(id){
			for(var key in this.tasksList){
				if(this.tasksList[key].taskID === id){
					return key;
				}
			}
			return -1;
		},
		_reset: function(){
			for(var key in this.tasksList){
				this.tasksList[key].task.destroy();
			}
			//this._initializeTasksList();
		}
	}, {
		NAME: 'tasksList', 
		ATTRS: { 
			tasksCount: {
				value: 0
			},
			data: {
				value: null
			},
			date: {
				value: null
			},
			lan_id: {
				value: null
			}
		}
	});
}, '0.0.1', {
	requires: [
		'view',
		'wf2-form',
		'wf2-base-css',
		'wf2-button',
		'wf2-buttonbar',
		'taskDetails'
	]
});