YUI.add('taskModule', function(Y, NAME) { 
	Y.namespace('UtilApp').taskPage = Y.Base.create('taskPage', Y.View, [], {
        
        initializer: function() {
			//Y.one('#appContainer').setContent('<div id="RequestFieldsContainer"><div id="TeamMemberContainer"></div><div id="DatePickerContainer"></div></div><div id="TasksContainer"></div><div id="ButtonBar"></div>');
			Y.one('#appContainer').setContent('<div id="RequestFieldsContainer"></div><div id="TasksContainer"></div><div id="ButtonBar"></div>');
			/*var data = {
						emp1:{
							'10/25/2016':[{task: 'PTO', hours: 4}, {task: 'WorkHours', hours: 4}],
							'10/26/2016':[{task: 'PTO', hours: 5}, {task: 'WorkHours', hours: 3}]
						},
						emp3:{
							'10/20/2016':[{task: 'PTO', hours: 2}, {task: 'WorkHours', hours: 6}],
							'10/19/2016':[{task: 'PTO', hours: 3}, {task: 'WorkHours', hours: 3}]
						}
					};*/
					
			var presData = { emp1: {
						'11/02/2016':{pto: 8, development:0},
						'11/01/2016':{development: 5, other_tasks: {test1: 2, test2: 1}}
					},
					emp2: {
						
					}
				};
			var taskMangerView = new Y.UtilApp.TaskManagerView({data: presData});
			taskMangerView.bindUI();
        },
        events: {
            '#toggle-button': { click: 'toggle' },
        },
        render: function() {
            //var template= Y.testapp.managersViewTmp.template(model)
            //Y.one('#appContainer').setContent('<div id="test">this is from task</div>');
            
            
        },
        toggle: function() {
            console.log('CLICK')
        }
    })		

}, '0.0.1', {
    'requires': [
        'lang',
		'taskManagerView'
    ]
});