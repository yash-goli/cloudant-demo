YUI.add('reportModule', function(Y, NAME) {
  Y.namespace('UtilApp').reportsPage = Y.Base.create('reportsPage', Y.View, [], {
    GRIDTEMPLATE: '<div class="wf2-g-r">' +
      '<div class="wf2-desktop-large-2 wf2-desktop-2 wf2-tablet-large-2 wf2-tablet-2 wf2-mobile-large-1 wf2-mobile-1 wf2-mobile-small-1">' +
      '<div id="yearRangeContainer" class="wf2-u">' +
      '</div></div></div>' +
      '<div class="wf2-g-r">' +
      '<div class="wf2-desktop-large-2 wf2-desktop-2 wf2-tablet-large-2 wf2-tablet-2 wf2-mobile-large-1 wf2-mobile-1 wf2-mobile-small-1">' +
      '<div id="pieChart" class="wf2-u">' +
      '<span id="selectionDetails" class="visually-hidden" aria-live="polite"></span>' +
      '<div id="chartContainer"></div>' +
      '</div>' +
      '<div id="tabChart" class="wf2-u"></div>' +
      '</div>' +
      '</div>',

    initializer: function() {
      var K = Y.WF2.FORM.FieldBase.prototype,

        panel = new Y.WF2.Panel({
          srcNode: '#login-panel',
          centered: true,
          visible: false
        }),
        formFields = {};

      formFields.field1 = new Y.WF2.FORM.FieldSelect({
        boundingBox: "#fieldPP", // CSS selector specifying the bounding box
        controlWidth: "medium",
        labelText: "Lan Id",
        options: [{
          "value": "U389624",
          "text": "U389624"
        }, {
          "value": "U390686",
          "text": "U390686"
        }, {
          "value": "U400463",
          "text": "U400463"
        }, {
          "value": "U518615",
          "text": "U518615"
        }, {
          "value": "U469128",
          "text": "U469128"
        }, {
          "value": "U391572",
          "text": "U391572"
        }, {
          "value": "U369109",
          "text": "U369109"
        }]
      }).render();

      panel.addButton({
        label: 'Submit',
        name: 'submit',
        style: 'primary',
        action: function(e) {
          e.preventDefault();
          sessionStorage.setItem('lanId', formFields.field1.get('value'));
          Y.io('app/v1/login', {
            data: { 'lanId': formFields.field1.get('value') },
            on: {
              success: function(tx, r) {
                parsedResponse = Y.JSON.parse(r.responseText);
                that.memberData = parsedResponse;
                that.pierender(parsedResponse);
              }
            }
          });
          this.hide();
        }
      });
      //if (sessionStorage.getItem('lanId') == null)
      panel.show();

      var that = this;
      Y.io('./data/teamTasks.json', {
        on: {
          success: function(tx, r) {
            // protected against malformed JSON response
            try {
              parsedResponse = Y.JSON.parse(r.responseText);
              that.memberData = parsedResponse;
              that.pierender(parsedResponse);
            } catch (e) {
              console.log("JSON Parse failed!");
              return;
            }
          }
        }
      });
      Y.io('/api/v1/tasks', {
        on: {
          success: function(tx, r) {
            // protected against malformed JSON response
            try {
              parsedResponse = Y.JSON.parse(r.responseText);

            } catch (e) {
              alert("JSON Parse failed!");
              return;
            }
          }
        }
      });

    },
    events: {
      '#toggle-button': { click: 'toggle' },
    },
    pierender: function(memberData) {
      var viewReport = {
          development: 0,
          integration: 0,
          otherTasks: 0,
          pto: 0
        },
        that = this;

      for (var i in memberData.TeamTasks) {
        for (var j in memberData.TeamTasks[i].tasks) {
          if (typeof(memberData.TeamTasks[i].tasks[j].otherTasks) === "object") {
            for (key in memberData.TeamTasks[i].tasks[j].otherTasks) {
              viewReport.otherTasks += memberData.TeamTasks[i].tasks[j].otherTasks[key];
            }
          }
          viewReport.development += memberData.TeamTasks[i].tasks[j].development;
          viewReport.integration += memberData.TeamTasks[i].tasks[j].integration;
          viewReport.pto += memberData.TeamTasks[i].tasks[j].pto;
        }
      }

      var sData = [];
      for (var z in viewReport) {
        var lObj = {
          name: z.toUpperCase(),
          y: viewReport[z]
        }
        sData.push(lObj)
      }

      $('#chartContainer').highcharts({
        chart: {
          type: 'pie',
          description: 'Most commonly used desktop screen readers in July 2015 as reported in the Webaim Survey. Shown as percentage of respondents. JAWS is by far the most used screen reader, with 30% of respondents using it. ZoomText and Window-Eyes follow, each with around 20% usage.'
        },

        title: {
          text: 'Team Utilization'
        },

        subtitle: {
          text: 'Click on point to view utilization'
        },

        plotOptions: {
          series: {
            dataLabels: {
              enabled: true,
              connectorColor: Highcharts.getOptions().colors[0],
              format: '<b>{point.name}</b>: {point.percentage:.1f} %'
            },
            point: {
              events: {
                click: function() {
                  that.updateTable('data')
                },
                mouseOver: function(e) {
                  $("#selectionDetails").html(e.target.dataLabel.text.textStr)
                }
              }
            },
            cursor: 'pointer'
          }
        },
        series: [{
          name: 'Percentage usage',
          borderColor: Highcharts.getOptions().colors[0],
          data: sData
        }]
      });
      this.tablerender(viewReport)
    },
    tablerender: function(memberData) {
      this.table = new Y.WF2.Table({
        columns: [
          { key: 'development', label: 'Development hours' },
          { key: 'pto', label: 'PTO hours' },
          { key: 'integration', label: 'Integration' },
          { key: 'otherTasks', label: 'other tasks' }
        ],
        data: memberData
      });
      this.table.render('#tabChart')
    },
    updateTable: function(dummydata) {
      console.log(dummydata)
    },
    render: function() {
      Y.one('#appContainer').setContent('<div id="demo"></div>');
      this.periodDD = new Y.WF2.FORM.FieldSelect({
        controlID: "timeperiodDD",
        controlWidth: "large",
        controlName: "timeFrame",
        labelText: "Select period",
        options: [{
          "value": "weekly",
          "text": "By weekly",
          "selected": true
        }, {
          "value": "monthly",
          "text": "By Monthly"
        }, {
          "value": "quarterly",
          "text": "By Quarterly"
        }]
      });
      this.extTabView = new Y.WF2.ExtendedTabView({
        children: [{
          label: 'Team member',
          content: this.GRIDTEMPLATE
        }, {
          label: 'Team',
          content: '<p>bar content</p>'
        }]
      });
      this.extTabView.render('#demo');
      this.periodDD.render('#yearRangeContainer');
      return this;
    },
    toggle: function() {
      console.log('CLICK')
    }

  })


}, '0.0.1', {
  'requires': [
    'lang',
    'io-base',
    'wf2-cssrgrids',
    'wf2-panel',
    'wf2-form'
  ]
});
