YUI.add('registerModule', function(Y, NAME) {
    Y.namespace('UtilApp').regisPage = Y.Base.create('regisPage', Y.View, [], {
        tabView: null,
        createTeamForm: null,
        createTeamTable: null,
        createTaskForm: null,
        createTaskTable: null,
        addTeam: null,
        addTask: null,
        templates: {
            createTeam: Y.one('#createTeam-template').getHTML(),
        },
        renderTemplate: function() {
            return Y.Handlebars.render(this.templates.createTeam, {});
        },
        initializer: function() {
            Y.one('#appContainer').setContent(this.renderTemplate());
        },
        events: {

        },
        render: function() {
            function addTeamClick() {
                //code
            }

            function addTaskClick() {
                //code
            }

            function templateAfterRender() {
                this.tabView = new Y.WF2.ExtendedTabView({
                    srcNode: '#tabView'
                });
                this.tabView.render();

                this.addTeam = new Y.WF2.Button({
                    srcNode: Y.one("#addTeam"),
                    label: "Add Team Members",
                    ariaLabel: "Add Team Members",
                    style: "primary",
                    iconValue: Y.WF2.ICONS.SMALL.ADD,
                    iconPosition: "left",
                    on: {
                        click: addTeamClick.bind(this)
                    }
                });
                this.addTeam.render();

                this.createTeamTable = new Y.WF2.Table({
                    columns: [
                        { key: 'lanId', label: 'Lan ID' },
                        { key: 'empId ', label: 'Employee ID' },
                        { key: 'name', label: 'Name' },
                        { key: 'email', label: 'Email' }/*, {
                            key: 'action',
                            label: 'Action',
                            formatter: 'MYAPP.EDIT_FORMATTER',
                            html: true,
                            formatterArgs: {
                                template: function() {
                                    return Y.WT2.ICON.EDIT.svg({
                                        id: Y.guid(),
                                        size: 'xsmall',
                                        alt: 'Edit Row',
                                    });
                                }
                            },
                        }*/
                    ],
                    data: [
                        { lanId: 'u518615', empId: '1652594', name: 'Yaswanth', email: 'yaswanth.goli'}
                    ]
                });
                this.createTeamTable.render('#createTeamTable');

                this.createTeamForm = new Y.WF2.FORM.Form({
                    boundingBox: '#createTeamFormField',
                    subfieldLayout: 'tableLayout',
                    subfields: {
                        lanId: new Y.WF2.FORM.FieldTextInput({
                            boundingBox: '#lanIdField'
                        }),
                        empId: new Y.WF2.FORM.FieldTextInput({
                            boundingBox: '#empIdField'
                        }),
                        name: new Y.WF2.FORM.FieldTextInput({
                            boundingBox: '#empNameField'
                        }),
                        email: new Y.WF2.FORM.FieldTextInput({
                            boundingBox: '#empEmailField'
                        }),
                        isAdmin: new Y.WF2.FORM.FieldGroup({
                            boundingBox: '#isAdminFieldGroup',
                            subfieldLayout: 'freeFormLayout'
                        })
                    }
                });

                this.createTeamForm.render();

                /* Create Task Render */
                this.addTask = new Y.WF2.Button({
                    srcNode: Y.one("#addTask"),
                    label: "Add Tasks",
                    ariaLabel: "Add Tasks",
                    style: "primary",
                    iconValue: Y.WF2.ICONS.SMALL.ADD,
                    iconPosition: "left",
                    on: {
                        click: addTaskClick.bind(this)
                    }
                });
                this.addTask.render();

                this.createTaskTable = new Y.WF2.Table({
                    columns: [
                        { key: 'task', label: 'Task' }/*, {
                            key: 'action',
                            label: 'Action',
                            formatter: 'MYAPP.EDIT_FORMATTER',
                            html: true,
                            formatterArgs: {
                                template: function() {
                                    return Y.WT2.ICON.EDIT.svg({
                                        id: Y.guid(),
                                        size: 'xsmall',
                                        alt: 'Edit Row',
                                    });
                                }
                            },
                        }*/
                    ],
                    data: [
                        { task: 'Paid Time Off(PTO)'}
                    ]
                });
                this.createTaskTable.render('#createTaskTable');

                this.createTaskForm = new Y.WF2.FORM.Form({
                    boundingBox: '#createTaskFormField',
                    subfieldLayout: 'tableLayout',
                    subfields: {
                        task: new Y.WF2.FORM.FieldTextInput({
                            boundingBox: '#taskField'
                        })
                    }
                });

                this.createTaskForm.render();
            }

            Y.mix(Y.WF2.Table.FORMATTERS, {
                'MYAPP.EDIT_FORMATTER': function(value, record, formatterArgs) {
                    return '<button id="" class="wf2-button wf2-button-standard">' + formatterArgs.template() + '</button>';
                }
            });

            setTimeout(templateAfterRender.bind(this), 200);
        },

        toggle: function() {
            alert('CLICK')
        }
    })


}, '0.0.1', {
    'requires': [
        'lang',
		'handlebars',
		'wf2-extended-tabview',
		'wt2-icon-calendar',
        'wt2-icon-add',
		'wt2-icon-edit',
		'wf2-button',
		'wf2-table',
		'wf2-table-formatters',
        'wf2-panel',
		'wf2-form',
		'wf2-datepicker',
		'wf2-autocomplete',
		'wf2-daterangepicker',
		'wf2-radio-button',
		'wf2-checkbox'
    ]
});
