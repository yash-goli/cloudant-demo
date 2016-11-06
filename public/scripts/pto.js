YUI.add('ptoModule', function(Y, NAME) {
    Y.namespace('UtilApp').ptoPage = Y.Base.create('ptoPage', Y.View, [], {
        initializer: function() {
            Date.prototype.addDays = function(days) {
                var dat = new Date(this.valueOf());
                dat.setDate(dat.getDate() + days);
                return dat;
            }
            this._initContainer();
            this._initDatePicker();
            this._initButtons();
        },
        _initContainer: function() {
            var html = '<div><h4>Please log your PTO here.</h4><div class="ptoClass" id="ptoWidget"><input type="text" id="startDate"/><input type="text" id="endDate"/></div><button class="wf2-button wf2-button-primary wf2-button--slim" type="button" id="addDates"><span class="wf2-button-label">Add</span></button><div class="clear"></div><div id="pto-datatable"></div><div class="ptoSubmit"><button id="submitPto" class="wf2-button wf2-button-primary">Submit</button></div>'
            Y.one('#appContainer').setContent(html);
        },
        _initDatePicker: function() {
            ptoData = [];
            var myStartField = new Y.WF2.FORM.FieldDatePicker({
                labelText: 'From',
                controlSelector: '#startDate',
                calendar: {
                    minimumSelectableDate: new Date()
                }
            });

            var myEndField = new Y.WF2.FORM.FieldDatePicker({
                labelText: 'To',
                controlSelector: '#endDate',
                calendar: {
                    minimumSelectableDate: new Date()
                }
            });

            this.myDRP = new Y.WF2.FORM.FieldDateRangePicker({
                controlID: 'ptoWidget',
                labelPlacement: 'top',
                subfieldLayout: 'freeFormLayout',
                subfields: {
                    start: myStartField,
                    end: myEndField
                }
            });
            this.myDRP.render('#ptoWidget');

            this.myDRP.on('dateClick', function(e) {
                //console.log(e);
            });

            Y.one('#addDates').on('click', function() {
                var strtDate = this.myDRP.datePickerStart.get('value'),
                    endDate = this.myDRP.datePickerEnd.get('value');

                var dateDiff = Math.round((this._parseDate(endDate) - this._parseDate(strtDate)) / (1000 * 60 * 60 * 24));

                for (var i = 0; i <= dateDiff; i++) {
                    var d = new Date(strtDate).addDays(i);
                    if (d.getDay() > 0 && d.getDay() < 6) {
                        var obj = {
                            sno: ptoData.length + 1,
                            date: ((d.getMonth() + 1) < 10 ? ('0' + d.getMonth() + 1) : (d.getMonth() + 1)) + '/' + (d.getDate() < 10 ? ('0' + d.getDate()) : d.getDate()) + '/' + d.getFullYear()
                        }
                        ptoData.push(obj);
                    }
                }
                this._initPtoDataTable(ptoData);
            }, this);
        },
        _parseDate: function(str) {
            var mdy = str.split('/');
            return  new Date(mdy[2], mdy[0] - 1, mdy[1]);
        },
        _initPtoDataTable: function(tdata) {

            if (this.table != undefined)
                this.table.destroy();

            this.table = new Y.WF2.Table({
                columns: [
                    { key: "sno", label: "Serial Number" },
                    { key: "date", label: "PTO Date" }
                ],
                data: tdata
            });

            this.table.render('#pto-datatable');
        },
        _initButtons: function() {
            Y.one("#submitPto").on('click', function() {
                var ptoObj = {
                    tasks: []
                };
                for (var i = 0; i < ptoData.length; i++) {
                    var localObj = {
                        "date": ptoData[i].date,
                        "development": 0,
                        "integration": 0,
                        "lan_id": sessionStorage.getItem('lanId'),
                        "other_tasks": 0,
                          "pto": 8,
                          "testing": 0,
                          "training": 0,
                          "volunteer_service": 0
                    }

                    ptoObj.tasks.push(localObj)
                }
                Y.io('/api/v1/tasks/create', {
                    data: JSON.stringify(ptoObj),
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    on: {
                        success: function(tx, r) {
                            parsedResponse = Y.JSON.parse(r.responseText);
                            that.memberData = parsedResponse;
                            that.pierender(parsedResponse);
                        }
                    }
                });

            });
        },
        events: {
            '#toggle-button': { click: 'toggle' },
        },
        render: function() {
            console.log("in render");
        },
        toggle: function() {
            console.log('CLICK')
        }
    })


}, '0.0.1', {
    'requires': [
        'lang',
        'button',
        'wf2-daterangepicker',
        'wf2-table'
    ]
});
